"use strict";

// Reads vendor telemetry into the few figures the reports need: from a
// worker's cached snaps (minerFromSnap, meterFromSnap), or from a `metrics`
// pull, where workers name and scale channels their own way and the
// contract's `unit` says how to scale (minerReader, meterReader).

const HASHRATE_TO_THS = {
  "H/s": 1e-12,
  "KH/s": 1e-9,
  "MH/s": 1e-6,
  "GH/s": 1e-3,
  "TH/s": 1,
  "PH/s": 1e3,
};

const POWER_TO_W = { W: 1, kW: 1e3, MW: 1e6 };

const HASHRATE_CHANNELS = ["hashrate_rt", "hashrate_avg", "hashrate"];
const POWER_CHANNELS = ["power", "power_w", "active_power"];

/** The first channel of `names` the contract declares, with its unit. */
function pickChannel(capabilities, names) {
  const channels = (capabilities && capabilities.telemetry) || [];
  for (const name of names) {
    const ch = channels.find((c) => c.name === name);
    if (ch) return { name, unit: ch.unit || null };
  }
  return null;
}

/** How to read a miner worker's metrics, from its capabilities. */
function minerReader(capabilities) {
  const hashrate = pickChannel(capabilities, HASHRATE_CHANNELS) || {
    name: "hashrate_rt",
    unit: "TH/s",
  };
  const power = pickChannel(capabilities, POWER_CHANNELS) || { name: "power", unit: "W" };
  const hashrateScale = HASHRATE_TO_THS[hashrate.unit] ?? 1;
  const powerScale = POWER_TO_W[power.unit] ?? 1;
  return (metrics) => ({
    hashrateThs: num(metrics[hashrate.name]) * hashrateScale,
    powerW: num(metrics[power.name]) * powerScale,
    status: normaliseStatus(metrics.status),
    powerMode: normalisePowerMode(metrics.power_mode),
    model: typeof metrics.model === "string" ? metrics.model : null,
  });
}

/** How to read a meter worker's metrics. */
function meterReader(capabilities) {
  const power = pickChannel(capabilities, ["active_power", "power", "power_w"]) || {
    name: "active_power",
    unit: "W",
  };
  const scale = POWER_TO_W[power.unit] ?? 1;
  return (metrics) => {
    const v = metrics[power.name];
    return typeof v === "number" && Number.isFinite(v) ? v * scale : null;
  };
}

const isMapping = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const finite = (v) => (typeof v === "number" && Number.isFinite(v) ? v : null);

/**
 * A thing's last snap from a worker's cache (the worker-infra `list` built-in
 * with `status: true`: `thing.last = { snap: { success?, stats, config }, ts }`),
 * when it holds a reading: null for a device never collected, or whose last
 * collection failed (`success: false`, status `offline`).
 */
function lastSnap(thing) {
  const last = isMapping(thing) && isMapping(thing.last) ? thing.last : {};
  const snap = isMapping(last.snap) ? last.snap : null;
  if (snap === null || snap.success === false) return null;
  const stats = isMapping(snap.stats) ? snap.stats : {};
  if (stats.status === undefined || normaliseStatus(stats.status) === "offline") return null;
  return { stats, config: isMapping(snap.config) ? snap.config : {} };
}

/**
 * A miner's figures from its cached snap (mdk-core's miner snap):
 * `hashrate_mhs.t_5m` in MH/s (the 5-minute average, else `avg`), `power_w`,
 * `status`, `config.power_mode`. Null when the snap holds no reading.
 */
function minerFromSnap(thing) {
  const snap = lastSnap(thing);
  if (snap === null) return null;
  const { stats, config } = snap;
  const hashrate = isMapping(stats.hashrate_mhs) ? stats.hashrate_mhs : {};
  const info = isMapping(thing.info) ? thing.info : {};
  return {
    // MH/s to TH/s.
    hashrateThs: (finite(hashrate.t_5m) ?? finite(hashrate.avg) ?? 0) / 1e6,
    powerW: num(stats.power_w),
    status: normaliseStatus(stats.status),
    powerMode: normalisePowerMode(config.power_mode),
    model: typeof info.model === "string" ? info.model : null,
  };
}

/** A meter's power in W from its cached snap (`power_w`), or null without a reading. */
function meterFromSnap(thing) {
  const snap = lastSnap(thing);
  return snap === null ? null : finite(snap.stats.power_w);
}

function num(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : 0;
}

/** One of online, sleep, error, offline, maintenance. */
function normaliseStatus(raw) {
  const s = typeof raw === "string" ? raw.toLowerCase() : "";
  if (s === "mining" || s === "online" || s === "ok" || s === "running") return "online";
  if (s === "sleeping" || s === "sleep" || s === "suspended") return "sleep";
  if (s === "error" || s === "not_mining" || s === "fault") return "error";
  if (s === "maintenance") return "maintenance";
  if (s === "offline") return "offline";
  // A miner that answers without a status but hashes is mining.
  return null;
}

function normalisePowerMode(raw) {
  const s = typeof raw === "string" ? raw.toLowerCase() : "";
  if (s === "low" || s === "eco") return "low";
  if (s === "high") return "high";
  if (s === "normal") return "normal";
  if (s === "sleep") return "sleep";
  return null;
}

module.exports = {
  minerReader,
  meterReader,
  minerFromSnap,
  meterFromSnap,
  normaliseStatus,
  normalisePowerMode,
};
