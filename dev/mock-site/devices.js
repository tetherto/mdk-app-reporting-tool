"use strict";

// The mock site's hardware: one mock device server per miner and meter and a
// mock Ocean pool API, kept in step with the simulation, plus the MDK worker
// `mdk run` cannot host.
//
// Miners and the pool are reached by the public Antminer, Whatsminer and Ocean
// workers that `mdk run` hosts from mdk.yaml; this process only plays the
// devices, using the mock servers those packages ship. MDK's SATEC meter worker
// predates the contract-first runtime `mdk run` hosts, so it is booted here
// with its own boot function (startSatecWorker), as MDK's run-a-site tutorial
// and examples/mvp-site do, and registers with the Kernel through the project's
// local discovery dir. It isn't on npm: `npm run setup` fetches it from the
// MDK release into dev/.mdk-satec.
//
// Every minute each mock is set to what sim.js says the device is doing, so the
// live telemetry agrees with the history seed.js backfills.
//
// `npm run dev:stack` runs it next to `mdk run --dir dev`.

const fs = require("fs");
const path = require("path");
const { once } = require("events");
const sim = require("./sim");
const { HOST, OCEAN_ACCOUNT, fleet, minerDevices, meterDevices } = require("./layout");

const DEV = path.join(__dirname, "..");
const SATEC_ROOT = path.join(DEV, ".mdk-satec");
if (!fs.existsSync(path.join(SATEC_ROOT, "node_modules")))
  throw new Error("ERR_SATEC_MISSING: run `npm run setup` first");

// The dirs `mdk run --dir dev` discovers workers and publishes the Kernel's key in.
const MDK_DIR = path.join(DEV, ".mdk");
const WORKER_KEYS_DIR = path.join(MDK_DIR, "keys");
const TRUSTED_KEYS_DIR = path.join(MDK_DIR, "trusted-keys");
const KERNEL_KEY_WAIT_MS = 120 * 1000;
const TICK_MS = 60 * 1000;
const DAY = sim.DAY;

const satecDir = path.join(SATEC_ROOT, "backend/workers/power-meter/satec");
const satecMock = require(path.join(satecDir, "mock/server"));
const { startSatecWorker } = require(satecDir);
const { POWER_MULTIPLIER, ENG_LO, RAW_HI } = require(path.join(satecDir, "lib/utils/constants"));
const oceanMock = require("ocean-mdk-worker/mock/server");
const discovery = require("@tetherto/mdk-core/lib/local-discovery");

const MOCKS = {
  "antminer-mdk-worker": require("antminer-mdk-worker/mock/cgi-server"),
  "whatsminer-mdk-worker": require("whatsminer-mdk-worker/mock/api-v3-server"),
};

// Antminer firmware work modes (bitmain-work-mode).
const ANTMINER_MODE = { normal: 0, sleep: 1, high: 2, low: 3 };
const SATEC_POWER_REGISTER = 276;
// The Ocean mock pays each account 98% (pool fee) of 0.1% (its share) of a block.
const OCEAN_POOL_FEE = 0.02;
const OCEAN_MOCK_NET_SHARE = (1 - OCEAN_POOL_FEE) * 0.001;
// The Ocean mock's earnings routes, whose fee restateFee fixes.
const OCEAN_EARNPAY_ROUTE = "/v1/earnpay/";

// --- miners -----------------------------------------------------------------

function applyAntminer(state, s) {
  const ghs = s.hashrateThs * 1000;
  for (const block of [state.summary, state.stats]) {
    block.rate_5s = ghs;
    block.rate_30m = ghs;
    block.rate_avg = ghs;
  }
  state.stats.watt = s.powerW;
  state.stats["miner-mode"] =
    s.status === "sleeping" ? ANTMINER_MODE.sleep : ANTMINER_MODE[s.powerMode || "normal"];
  state.warnings =
    s.status === "error"
      ? [{ code: "R:1", cause: "Simulated fault", suggestion: "None: mock site" }]
      : [];
}

function applyWhatsminer(state, s) {
  const summary = state.summary;
  for (const key of ["hash-average", "hash-1min", "hash-15min", "hash-realtime"])
    summary[key] = s.hashrateThs;
  summary["power-realtime"] = s.powerW;
  summary["power-5min"] = s.powerW;
  state.setting["power-mode"] = s.powerMode || "normal";
  state.deviceInfo["error-code"] = s.status === "error" ? [{ 2010: "Simulated fault" }] : [];
}

const APPLY = { "antminer-mdk-worker": applyAntminer, "whatsminer-mdk-worker": applyWhatsminer };

// The Whatsminer mock merges its default state shallowly, so without copies
// every mock would share (and overwrite) one summary and one setting.
const ownState = {
  "antminer-mdk-worker": () => undefined,
  "whatsminer-mdk-worker": () => {
    const { DEFAULT_STATE } = MOCKS["whatsminer-mdk-worker"];
    return {
      summary: structuredClone(DEFAULT_STATE.summary),
      setting: { ...DEFAULT_STATE.setting },
    };
  },
};

async function startMiner(device) {
  const { unit, opts } = device;
  const mock = MOCKS[unit.package].createServer({
    host: HOST,
    port: opts.port,
    username: opts.username,
    password: opts.password,
    state: ownState[unit.package](),
  });
  await mock.ready;
  return { device, mock, listening: true };
}

// An offline or maintenance miner stops answering; it listens again when back.
function setListening(miner, on) {
  if (miner.listening === on) return;
  miner.listening = on;
  const { server } = miner.mock;
  if (on) server.listen(miner.device.opts.port, HOST);
  else {
    server.close();
    server.closeAllConnections?.();
  }
}

function updateMiner(miner, ts) {
  const { device, mock } = miner;
  const s = sim.minerState(device.id, device.unit.model, ts);
  setListening(miner, s.status !== "offline" && s.status !== "maintenance");
  APPLY[device.unit.package](mock.state, s);
}

// --- meters -----------------------------------------------------------------

// The register's engineering range only resolves about 21.7 kW, so meter
// readings move in those steps.
function setMeterPower(mock, watts) {
  const raw = Math.max(0, Math.min(RAW_HI, Math.round((watts / 1000 - ENG_LO) / POWER_MULTIPLIER)));
  const reg = mock.state[SATEC_POWER_REGISTER];
  reg.value = raw;
  reg.buffer.writeInt16BE(raw, reg.offset);
}

async function startMeter(device, ts) {
  const mock = satecMock.createServer({
    host: HOST,
    port: device.opts.port,
    type: "pm180",
    powerW: sim.meterPowerW(device.id, ts),
  });
  await mock.ready;
  return { device, mock };
}

// --- pool -------------------------------------------------------------------

const historyStart = (now) => now - fleet.historyDays * DAY;

// The mock Ocean API derives an account's earnings from its list of found
// blocks. One block per simulated payout, sized so the account's net earning
// is that day's payout, makes the real Ocean worker report the simulation.
function oceanBlocks(now) {
  return sim.payouts(historyStart(now), now).map((p) => {
    const netSats = Math.round(p.amountBtc * 1e8);
    const difficulty = (sim.networkHashrateEhs(p.ts) * 1e18 * 600) / 2 ** 32;
    return {
      block_hash: p.id,
      ts: Math.floor(p.ts / 1000),
      username: OCEAN_ACCOUNT,
      network_difficulty: difficulty,
      accepted_shares: difficulty,
      subsidy_sats: Math.round(p.subsidyBtc * 1e8),
      txn_fees_sats: Math.round(p.feeBtc * 1e8),
      total_reward_sats: Math.ceil(netSats / OCEAN_MOCK_NET_SHARE),
    };
  });
}

/**
 * The Ocean worker's mock API, from the package's own createServer, with the
 * fee restated on the way out (see restateFee). The mock reports fee and net
 * from the same block reward, so its state can't fix the fee.
 */
async function startPoolMock(now) {
  const mock = oceanMock.createServer({ host: HOST, port: fleet.poolMockPort, delay: 0 });
  mock.state.blocks = oceanBlocks(now);
  // createServer has called listen, but fastify boots on a later tick, so a
  // hook added now still applies.
  mock.app.addHook("onSend", (req, _res, payload, next) =>
    next(null, req.url.startsWith(OCEAN_EARNPAY_ROUTE) ? restateFee(payload) : payload),
  );
  await once(mock.app.server, "listening");
  return mock;
}

/**
 * The Ocean mock reports `fees_collected_satoshis` as 2% of the whole block,
 * while `satoshis_net_earned` is the account's 0.1% share: the fee would read
 * 20 times the payout. Ocean reports the account's own fee, so restate it from
 * the net (docs/mdk-friction.md).
 */
function restateFee(payload) {
  const body = JSON.parse(payload);
  for (const t of body.result?.earnings ?? [])
    t.fees_collected_satoshis = Math.round(
      (t.satoshis_net_earned * OCEAN_POOL_FEE) / (1 - OCEAN_POOL_FEE),
    );
  return JSON.stringify(body);
}

// --- MDK workers outside `mdk run` ------------------------------------------

/** Admits the Kernel, publishes the worker's key for `mdk run`'s Kernel to dial. */
function register(workerId, handle) {
  const trust = discovery.trustKeysFromDir(handle.runtime, TRUSTED_KEYS_DIR);
  discovery.publishWorkerKey(
    WORKER_KEYS_DIR,
    workerId,
    handle.runtime.getPublicKey().toString("hex"),
  );
  return {
    ...handle,
    stop: async () => {
      trust.stop();
      await handle.stop();
    },
  };
}

const kernelKeys = async () => [
  await discovery.waitForKernelKey(TRUSTED_KEYS_DIR, { timeoutMs: KERNEL_KEY_WAIT_MS }),
];

async function startMeterWorker(meters) {
  const workerId = fleet.meterWorker;
  const handle = await startSatecWorker({
    workerId,
    model: "pm180",
    storeDir: path.join(MDK_DIR, "workers", workerId),
    // Every mock meter listens on 127.0.0.1, on its own port.
    conf: { allowDuplicateIPs: true },
    allowedKeys: await kernelKeys(),
    seedDevices: meters.map((m) => ({
      id: m.device.id,
      info: { serialNum: m.device.id },
      opts: m.device.opts,
    })),
  });
  return register(workerId, handle);
}

// --- process ----------------------------------------------------------------

async function main() {
  // Registered first: a stop during start-up still closes what is up.
  const up = {
    timers: [],
    miners: [],
    meters: [],
    poolMock: null,
    workers: [],
  };
  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    for (const t of up.timers) clearInterval(t);
    // oxlint-disable-next-line no-await-in-loop -- stop workers one by one, in reverse start order
    for (const w of up.workers.reverse()) await w.stop().catch(() => {});
    for (const m of up.miners) if (m.listening) m.mock.server.close();
    for (const m of up.meters) m.mock.exit();
    if (up.poolMock) await up.poolMock.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);

  const now = Date.now();
  up.miners = await Promise.all(minerDevices().map(startMiner));
  up.meters = await Promise.all(meterDevices().map((d) => startMeter(d, now)));
  up.poolMock = await startPoolMock(now);
  const tick = () => {
    const ts = Date.now();
    for (const m of up.miners) updateMiner(m, ts);
    for (const m of up.meters) setMeterPower(m.mock, sim.meterPowerW(m.device.id, ts));
    up.poolMock.state.blocks = oceanBlocks(ts);
  };
  tick();
  up.timers.push(setInterval(tick, TICK_MS));
  console.log(
    `Mock devices up: ${up.miners.length} miners, ${up.meters.length} meters, Ocean pool API on :${fleet.poolMockPort}`,
  );

  up.workers.push(await startMeterWorker(up.meters));
  console.log(`Meter worker "${fleet.meterWorker}" registered`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}

module.exports = { applyAntminer, applyWhatsminer, oceanBlocks };
