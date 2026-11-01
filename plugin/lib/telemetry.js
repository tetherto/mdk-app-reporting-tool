"use strict";

// Reads vendor telemetry into the few figures the reports need. Workers name
// and scale channels their own way; the contract's `unit` says how to scale.

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

module.exports = { minerReader, meterReader, normaliseStatus, normalisePowerMode };
