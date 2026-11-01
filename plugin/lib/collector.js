"use strict";

// Samples the site through the Kernel and writes the history the reports read:
//   - miners: every sampleIntervalSec, rolled up per mining unit and model
//   - meters: on the same tick, one power reading per meter
//   - pool payouts and market data: every SYNC_INTERVAL_MS, backfilled as far
//     back as the worker answers (historyDays at most)
// Read-only against MDK: it only pulls telemetry, never sends a command.

const { minerReader, meterReader } = require("./telemetry");
const { DAY } = require("./time");

const SYNC_INTERVAL_MS = 10 * 60 * 1000;
// After a failed sync (say a worker the Kernel has listed but not connected to
// yet), try again this soon instead of a full interval later.
const SYNC_RETRY_MS = 60 * 1000;
const PULL_CONCURRENCY = 64;
// An on-demand refresh within this long of the last sample answers that sample:
// any viewer can ask for one, and each pulls the whole fleet.
const REFRESH_MIN_AGE_MS = 15 * 1000;
const BACKFILL_CHUNK_MS = 90 * DAY;

async function mapLimit(items, limit, fn) {
  const out = Array.from({ length: items.length });
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      // oxlint-disable-next-line no-await-in-loop -- each lane takes the next item when its last one settles
      out[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

const emptyRollup = (unit, model) => ({
  unit,
  model,
  total: 0,
  low: 0,
  normal: 0,
  high: 0,
  sleep: 0,
  error: 0,
  offline: 0,
  maintenance: 0,
  hashrateThs: 0,
  powerW: 0,
  miningPowerW: 0,
});

function createCollector({ client, store, config, logger }) {
  const state = {
    kernelConnected: false,
    lastSampleAt: null,
    lastError: null,
    // deviceId -> workerId, from the last discovery
    devices: new Map(),
    lastSyncAt: 0,
    sources: { pool: false, market: false },
  };
  const readers = new Map();
  // Devices two mining units both claim, warned about once.
  const warnedTwice = new Set();
  let timer = null;
  let syncing = null;
  let sampling = null;

  async function reader(kind, deviceId) {
    const workerId = state.devices.get(deviceId);
    const key = `${kind}:${workerId}`;
    if (readers.has(key)) return readers.get(key);
    let capabilities = null;
    let answered = false;
    try {
      const res = await client.getCapabilities(deviceId);
      capabilities =
        (res && (res.capabilities || (res.contract && res.contract.capabilities))) || null;
      answered = true;
    } catch (err) {
      logger.warn("capabilities of %s unavailable: %s", deviceId, err.message);
    }
    const read = kind === "miner" ? minerReader(capabilities) : meterReader(capabilities);
    // A worker that answers is read the same way from then on, with the default
    // channels and units when it declares none. One whose lookup failed is read
    // with the defaults for this sample only: the next one asks again.
    if (answered) readers.set(key, read);
    return read;
  }

  async function discover() {
    // getStatus retries the first request; a stopped or dead worker's devices
    // are not wired (MDK's mvp-site skips them the same way).
    const { workers } = await client.getStatus();
    state.devices = new Map();
    for (const w of workers) {
      if (w.state === "TERMINATED" || w.healthState === "DEAD") continue;
      for (const id of w.deviceIds) state.devices.set(id, w.workerId);
    }
    state.kernelConnected = true;
  }

  /**
   * Device ids of each mining unit, from the site config and what the Kernel
   * lists. A device two units claim (by id in one, by worker in another) counts
   * in the first one only.
   */
  function unitDevices() {
    const claimed = new Map();
    return config.miningUnits.map((unit) => {
      const ids = new Set(unit.devices.filter((id) => state.devices.has(id)));
      for (const [id, workerId] of state.devices) if (unit.workers.includes(workerId)) ids.add(id);
      for (const id of ids) {
        const owner = claimed.get(id);
        if (owner === undefined) {
          claimed.set(id, unit.id);
          continue;
        }
        ids.delete(id);
        if (!warnedTwice.has(id)) {
          warnedTwice.add(id);
          logger.warn(
            "device %s is in mining units %s and %s: counted in %s",
            id,
            owner,
            unit.id,
            owner,
          );
        }
      }
      return { unit, ids: [...ids] };
    });
  }

  async function pullMetrics(deviceId) {
    try {
      const tel = await client.pullTelemetry(deviceId, "metrics", { timeout: 10000 });
      return tel && tel.metrics && !tel.error ? tel.metrics : null;
    } catch {
      return null;
    }
  }

  async function sampleMiners(ts) {
    const rows = [];
    for (const { unit, ids } of unitDevices()) {
      const rollups = new Map();
      // oxlint-disable-next-line no-await-in-loop -- one unit at a time keeps at most PULL_CONCURRENCY pulls in flight
      const results = await mapLimit(ids, PULL_CONCURRENCY, async (id) => {
        const metrics = await pullMetrics(id);
        return metrics ? (await reader("miner", id))(metrics) : null;
      });
      for (const m of results) {
        // A miner that does not answer is offline; its model falls back to the unit's.
        const modelKey = (m && m.model) || unit.model || "unknown";
        const model = config.catalogue.find(modelKey);
        const id = model ? model.id : modelKey;
        if (!rollups.has(id)) rollups.set(id, emptyRollup(unit.id, id));
        const r = rollups.get(id);
        r.total += 1;
        if (!m) {
          r.offline += 1;
          continue;
        }
        const status = m.status || (m.hashrateThs > 0 ? "online" : "offline");
        r.powerW += m.powerW;
        if (status === "online") {
          const mode = m.powerMode === "low" || m.powerMode === "high" ? m.powerMode : "normal";
          r[mode] += 1;
          r.hashrateThs += m.hashrateThs;
          r.miningPowerW += m.powerW;
        } else {
          r[status] += 1;
        }
      }
      for (const r of rollups.values())
        rows.push({ ts, intervalS: config.sampleIntervalSec, ...r });
    }
    if (rows.length) store.writeMinerSamples(rows);
    return rows;
  }

  async function sampleMeters(ts) {
    const wired = config.meters.filter((m) => state.devices.has(m.device));
    const rows = [];
    await mapLimit(wired, PULL_CONCURRENCY, async (meter) => {
      const metrics = await pullMetrics(meter.device);
      if (!metrics) return;
      const powerW = (await reader("meter", meter.device))(metrics);
      if (powerW !== null)
        rows.push({ ts, meter: meter.device, intervalS: config.sampleIntervalSec, powerW });
    });
    if (rows.length) store.writeMeterSamples(rows);
  }

  async function pullChannel(deviceId, type, params) {
    const tel = await client.pullTelemetry(deviceId, { type, ...params }, { timeout: 30000 });
    if (!tel || tel.error) throw new Error((tel && tel.error) || "ERR_NO_RESPONSE");
    return tel.value;
  }

  /**
   * Pool earnings in [start, end] as payouts, from the pool worker's
   * `transactions` channel (the Ocean worker's contract declares it): daily
   * rows of the pool's earnings log. Each entry is one block's net earning;
   * pools do not report a subsidy / fee split.
   */
  async function pullPoolPayouts(deviceId, start, end) {
    const tel = await client.pullTelemetry(
      deviceId,
      { type: "transactions", start, end },
      { timeout: 30000 },
    );
    if (!tel || tel.error) throw new Error((tel && tel.error) || "ERR_NO_RESPONSE");
    // The Kernel answers an empty body when it cannot reach the worker yet.
    if (!("value" in tel)) throw new Error("ERR_POOL_NO_RESPONSE");
    if (!Array.isArray(tel.value)) throw new Error("ERR_POOL_BAD_TRANSACTIONS");
    return tel.value
      .flatMap((day) => (Array.isArray(day.transactions) ? day.transactions : []))
      .filter(
        (t) =>
          t &&
          t.block_hash !== undefined &&
          Number.isFinite(t.ts) &&
          Number.isFinite(t.satoshis_net_earned),
      )
      .map((t) => ({
        id: t.block_hash,
        ts: t.ts * 1000,
        amountBtc: t.satoshis_net_earned / 1e8,
        // The pool service's log has no subsidy / fee split; the report estimates it.
        subsidyBtc: null,
        feeBtc: null,
        poolFeeBtc: Number.isFinite(t.fees_collected_satoshis)
          ? t.fees_collected_satoshis / 1e8
          : null,
      }));
  }

  // Fills [from, now] in chunks, oldest first, so a long first backfill makes progress.
  async function backfill(from, fn) {
    const now = Date.now();
    for (let start = from; start < now; start += BACKFILL_CHUNK_MS) {
      // oxlint-disable-next-line no-await-in-loop -- chunks are written in order, so an interrupted backfill resumes
      await fn(start, Math.min(start + BACKFILL_CHUNK_MS, now));
    }
  }

  const historyStart = () => Date.now() - config.historyDays * DAY;

  async function syncPool() {
    if (!config.pool || !state.devices.has(config.pool.device)) {
      state.sources.pool = false;
      return;
    }
    const last = store.lastPayoutTs();
    // Re-read the last two days: a pool can amend a recent payout.
    const from = last ? Math.max(historyStart(), last - 2 * DAY) : historyStart();
    await backfill(from, async (start, end) => {
      store.writePayouts(await pullPoolPayouts(config.pool.device, start, end));
    });
    state.sources.pool = true;
  }

  async function syncMarket() {
    if (!config.market || !state.devices.has(config.market.device)) {
      state.sources.market = false;
      return;
    }
    const device = config.market.device;
    // Each series resumes a day before its last stored point, so a sync only
    // re-reads the latest day (which the API can still revise).
    const since = (last) => ({
      start: last ? Math.max(historyStart(), last - DAY) : historyStart(),
      end: Date.now(),
    });
    const prices = await pullChannel(device, "price_history", since(store.lastPriceTs()));
    store.writePrices(prices.filter((p) => Number.isFinite(p.ts) && Number.isFinite(p.usd)));
    const hashrates = await pullChannel(
      device,
      "network_hashrate",
      since(store.lastNetworkTs("hashrateHs")),
    );
    store.writeNetwork(hashrates.map((h) => ({ ts: h.ts, hashrateHs: h.hashrateHs })));
    const hashprices = await pullChannel(
      device,
      "hashprice",
      since(store.lastNetworkTs("btcPerPhsDay")),
    );
    store.writeNetwork(
      hashprices.map((h) => ({
        ts: h.ts,
        btcPerPhsDay: h.btcPerPhsDay,
        usdPerPhsDay: h.usdPerPhsDay,
      })),
    );
    const feeShares = await pullChannel(
      device,
      "fee_share",
      since(store.lastNetworkTs("feeShare")),
    );
    store.writeNetwork(feeShares.map((f) => ({ ts: f.ts, feeShare: f.feeShare })));
    const feeRates = await pullChannel(
      device,
      "fee_rate",
      since(store.lastNetworkTs("feeRateSatsVb")),
    );
    store.writeNetwork(feeRates.map((f) => ({ ts: f.ts, feeRateSatsVb: f.feeRateSatsVb })));
    state.sources.market = true;
  }

  async function sync() {
    let failed = false;
    for (const [name, fn] of [
      ["pool", syncPool],
      ["market", syncMarket],
    ]) {
      try {
        // oxlint-disable-next-line no-await-in-loop -- one source at a time, each failing on its own
        await fn();
      } catch (err) {
        failed = true;
        state.sources[name] = false;
        logger.error("%s sync failed: %s", name, err.message);
      }
    }
    state.lastSyncAt = failed ? Date.now() - SYNC_INTERVAL_MS + SYNC_RETRY_MS : Date.now();
  }

  /** One sample of miners and meters now, plus a pool/market sync when it is due. */
  async function sampleNow() {
    if (sampling) return sampling;
    sampling = (async () => {
      const intervalMs = config.sampleIntervalSec * 1000;
      const ts = Math.floor(Date.now() / intervalMs) * intervalMs;
      try {
        await discover();
        await sampleMiners(ts);
        await sampleMeters(ts);
        state.lastSampleAt = Date.now();
        state.lastError = null;
      } catch (err) {
        state.kernelConnected = !String(err.message).startsWith("ERR_MDK_CLIENT_UNAVAILABLE");
        state.lastError = err.message;
        logger.error("sample failed: %s", err.message);
      }
      if (state.kernelConnected && !syncing && Date.now() - state.lastSyncAt >= SYNC_INTERVAL_MS) {
        syncing = sync().finally(() => {
          syncing = null;
        });
      }
    })().finally(() => {
      sampling = null;
    });
    return sampling;
  }

  /** A sample on demand, unless the last one is recent enough to answer for it. */
  async function refresh() {
    if (sampling) return sampling;
    if (state.lastSampleAt !== null && Date.now() - state.lastSampleAt < REFRESH_MIN_AGE_MS)
      return undefined;
    return sampleNow();
  }

  return {
    state,
    sampleNow,
    refresh,
    /** Waits for an in-flight pool/market sync, if any. */
    settled: () => syncing || Promise.resolve(),
    start() {
      if (timer) return;
      void sampleNow();
      timer = setInterval(sampleNow, config.sampleIntervalSec * 1000);
      timer.unref();
    },
    stop() {
      clearInterval(timer);
      timer = null;
    },
  };
}

module.exports = { createCollector };
