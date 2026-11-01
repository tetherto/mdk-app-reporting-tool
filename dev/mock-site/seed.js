"use strict";

// Backfills the reporting app's store with the mock site's history, from the
// same simulation the mock workers serve live. Named by the app's `seed`
// config in mdk.yaml; a real site leaves it out and history starts when its
// workers are wired.
//
// First run: historyDays back, hourly for the last 30 days and every three
// hours before. Later runs: only the gap since the last stored sample, so a
// restart leaves no hole.
//
// It also enters example costs on Cost Input, once, for every month of the
// seeded history, so Cost Summary and the cost tabs render for every period
// preset; they stay editable like any other entry.

const sim = require("./sim");
const { eachMonth } = require("../../plugin/lib/time");

const FINE_DAYS = 30;
const FINE_STEP = sim.HOUR;
const COARSE_STEP = 3 * sim.HOUR;
const MIN_INTERVAL = 60 * 1000;

function* steps(from, to) {
  const fineFrom = to - FINE_DAYS * sim.DAY;
  let ts = from;
  while (ts < to) {
    const step = ts < fineFrom ? COARSE_STEP : FINE_STEP;
    const interval = Math.min(step, to - ts);
    if (interval < MIN_INTERVAL) return;
    yield { ts, interval };
    ts += step;
  }
}

function sampleAt(ts, interval) {
  // Each row stands for its interval; read the fleet halfway through it.
  const at = ts + interval / 2;
  const intervalS = Math.round(interval / 1000);
  const minerRows = [];
  const unitMetersW = [];
  const meterRows = [];
  for (const unit of sim.fleet.units) {
    const r = {
      ts,
      unit: unit.worker,
      model: unit.model,
      intervalS,
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
    };
    for (const id of sim.minerIds(unit)) {
      const s = sim.minerState(id, unit.model, at);
      r.total += 1;
      r.powerW += s.powerW;
      if (s.status === "mining") {
        r[s.powerMode] += 1;
        r.hashrateThs += s.hashrateThs;
        r.miningPowerW += s.powerW;
      } else {
        r[s.status === "sleeping" ? "sleep" : s.status] += 1;
      }
    }
    minerRows.push(r);
    const meterW = sim.unitMeterW(r.powerW);
    unitMetersW.push(meterW);
    meterRows.push({ ts, meter: unit.meter, intervalS, powerW: meterW });
  }
  meterRows.push({
    ts,
    meter: sim.fleet.siteMeter,
    intervalS,
    powerW: sim.siteMeterW(unitMetersW),
  });
  return { minerRows, meterRows };
}

/**
 * @param {{ store: object, config: { historyDays: number, miningUnits: Array<{ id: string }> } }} app
 */
async function seed({ store, config }) {
  const units = new Set(config.miningUnits.map((u) => u.id));
  const missing = sim.fleet.units.filter((u) => !units.has(u.worker));
  if (missing.length)
    throw new Error(
      `ERR_SEED_UNITS: mining units ${missing.map((u) => u.worker).join(", ")} are not in the site config`,
    );

  const now = Date.now();
  const last = store.getMeta("seed.lastTs");
  const lastSample = store.lastMinerSampleTs();
  const historyStart = Math.floor((now - config.historyDays * sim.DAY) / COARSE_STEP) * COARSE_STEP;
  // Resume after whatever is newest: the seed's own end or a live sample.
  const from = Math.max(
    historyStart,
    Number(last) || 0,
    lastSample !== null ? lastSample + MIN_INTERVAL : 0,
  );
  const to = Math.floor(now / MIN_INTERVAL) * MIN_INTERVAL;

  let samples = 0;
  let minerRows = [];
  let meterRows = [];
  const flush = () => {
    store.writeMinerSamples(minerRows);
    store.writeMeterSamples(meterRows);
    minerRows = [];
    meterRows = [];
  };
  for (const { ts, interval } of steps(from, to)) {
    const sample = sampleAt(ts, interval);
    minerRows.push(...sample.minerRows);
    meterRows.push(...sample.meterRows);
    samples += 1;
    if (minerRows.length >= 2000) {
      flush();
      // Yield between batches so the process stays responsive while it seeds.
      // oxlint-disable-next-line no-await-in-loop -- the yield is the point
      await new Promise((resolve) => setImmediate(resolve));
    }
  }
  flush();
  store.setMeta("seed.lastTs", to);
  if (!store.hasCosts()) seedCosts(store, config.site.timezone, historyStart, now);
  return { from: new Date(from).toISOString(), to: new Date(to).toISOString(), samples };
}

// Example rates: energy at a typical hosting tariff, operations as a share of it.
const ENERGY_USD_PER_MWH = 45;
const OPERATIONS_USD_PER_MWH = 12;

/** Each month from `from` to now: its simulated energy at the example rates. */
function seedCosts(store, timezone, from, now) {
  const rows = [];
  for (const { year, month, start, end } of eachMonth(from, now, timezone)) {
    const samples = store.minerSamples(start, Math.min(end, now));
    // Seconds the samples cover, each timestamp once.
    const seconds = new Map(samples.map((r) => [r.ts, r.interval_s]));
    const covered = [...seconds.values()].reduce((sum, s) => sum + s, 0) * 1000;
    if (covered <= 0) continue;
    const wattSeconds = samples.reduce((sum, r) => sum + r.power_w * r.interval_s, 0);
    // The part of the month the samples cover, extended to the whole month at the same rate.
    const mwh = (wattSeconds / 3.6e9) * ((end - start) / covered);
    const round100 = (usd) => Math.round(usd / 100) * 100;
    rows.push({
      year,
      month,
      energyUsd: round100(mwh * ENERGY_USD_PER_MWH),
      operationsUsd: round100(mwh * OPERATIONS_USD_PER_MWH),
    });
  }
  store.writeCosts(rows);
}

module.exports = { seed };
