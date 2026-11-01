"use strict";

// The mock site's simulation. Every value is a pure function of (seed, device,
// time), so the mock workers serving live telemetry and the history seed that
// backfills the app's store agree on what the fleet did at any moment.
//
// Nothing here is MDK code or app code: it stands in for real hardware and a
// real pool. The app never imports it, only the mock workers and the seed do.

const fleet = require("./fleet.json");
const catalogue = require("../config/hardware-catalogue.json");

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const SUBSIDY_BTC = 3.125;
const BLOCKS_PER_DAY = 144;
const POOL_FEE = 0.02;

// Reference point for the mock network hashrate: 1,100 EH/s on 1 October 2026,
// growing about 2% a month. Deterministic on purpose: BTC figures must not move
// with the live market (only USD figures do).
const NETWORK_REF_TS = Date.UTC(2026, 9, 1);
const NETWORK_REF_EHS = 1100;
const NETWORK_DAILY_GROWTH = 0.00066;

const POWER_MODE = {
  low: { hashrate: 0.8, power: 0.78 },
  normal: { hashrate: 1, power: 1 },
  high: { hashrate: 1.1, power: 1.18 },
};

const modelsById = new Map(catalogue.models.map((m) => [m.id, m]));

// 32-bit string hash (FNV-1a), then a mixing step, mapped to [0, 1).
function rand(...parts) {
  let h = 0x811c9dc5 ^ fleet.seed;
  for (const part of parts) {
    const s = String(part);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    h ^= 0x2f;
    h = Math.imul(h, 0x01000193);
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function minerIds(unit) {
  const ids = [];
  for (let i = 1; i <= unit.miners; i++) ids.push(`${unit.worker}-${String(i).padStart(3, "0")}`);
  return ids;
}

/**
 * What one miner is doing at `ts`.
 * @returns {{ status: string, powerMode: string|null, hashrateThs: number, powerW: number }}
 */
function minerState(deviceId, modelId, ts) {
  const model = modelsById.get(modelId);
  if (!model) throw new Error(`ERR_MOCK_UNKNOWN_MODEL: ${modelId}`);

  // A few miners spend three-day stretches in maintenance.
  if (rand(deviceId, "maintenance", Math.floor(ts / (3 * DAY))) < 0.008) {
    return { status: "maintenance", powerMode: null, hashrateThs: 0, powerW: 0 };
  }

  const roll = rand(deviceId, "status", Math.floor(ts / HOUR));
  if (roll < 0.012) return { status: "offline", powerMode: null, hashrateThs: 0, powerW: 0 };
  if (roll < 0.02)
    return {
      status: "error",
      powerMode: null,
      hashrateThs: 0,
      powerW: Math.round(model.nominalPowerW * 0.1),
    };
  if (roll < 0.032) return { status: "sleeping", powerMode: null, hashrateThs: 0, powerW: 20 };

  const modeRoll = rand(deviceId, "mode", Math.floor(ts / DAY));
  const powerMode = modeRoll < 0.1 ? "low" : modeRoll < 0.85 ? "normal" : "high";
  const scale = POWER_MODE[powerMode];
  const slot = Math.floor(ts / (5 * MINUTE));
  const hashrateThs =
    model.nominalHashrateThs * scale.hashrate * (0.96 + 0.05 * rand(deviceId, "hr", slot));
  const powerW = model.nominalPowerW * scale.power * (0.99 + 0.02 * rand(deviceId, "pw", slot));
  return {
    status: "mining",
    powerMode,
    hashrateThs: Math.round(hashrateThs * 100) / 100,
    powerW: Math.round(powerW),
  };
}

function unitPowerW(unit, ts) {
  let sum = 0;
  for (const id of minerIds(unit)) sum += minerState(id, unit.model, ts).powerW;
  return sum;
}

// A mining unit's meter reads its miners plus cooling and auxiliaries; the
// site meter reads every unit meter plus the site's own load.
const unitMeterW = (minersW) => Math.round(minersW * 1.035);
const siteMeterW = (unitMetersW) =>
  Math.round(unitMetersW.reduce((a, b) => a + b, 0) * 1.01 + 15000);

/** Power at a meter at `ts`. */
function meterPowerW(meterId, ts) {
  if (meterId === fleet.siteMeter)
    return siteMeterW(fleet.units.map((u) => unitMeterW(unitPowerW(u, ts))));
  const unit = fleet.units.find((u) => u.meter === meterId);
  if (!unit) throw new Error(`ERR_MOCK_UNKNOWN_METER: ${meterId}`);
  return unitMeterW(unitPowerW(unit, ts));
}

function networkHashrateEhs(ts) {
  const days = (ts - NETWORK_REF_TS) / DAY;
  const wobble = 1 + 0.04 * (rand("network", Math.floor(ts / DAY)) - 0.5);
  return NETWORK_REF_EHS * Math.exp(NETWORK_DAILY_GROWTH * days) * wobble;
}

// Fleet hashrate over one UTC day, sampled every six hours.
function fleetDayHashrateThs(dayStart) {
  let sum = 0;
  for (let k = 0; k < 4; k++) {
    const ts = dayStart + k * 6 * HOUR + 3 * HOUR;
    for (const unit of fleet.units) {
      for (const id of minerIds(unit)) sum += minerState(id, unit.model, ts).hashrateThs;
    }
  }
  return sum / 4;
}

const payoutCache = new Map();

/**
 * The pool's payout for one UTC day of mining, paid at the end of that day:
 * the fleet's share of the network times the day's block rewards, less the
 * pool fee, split into block subsidy and transaction fees.
 */
function dailyPayout(dayStart) {
  if (payoutCache.has(dayStart)) return payoutCache.get(dayStart);
  const share = fleetDayHashrateThs(dayStart) / (networkHashrateEhs(dayStart) * 1e6);
  const feePerBlockBtc = 0.015 + 0.035 * rand("fees", Math.floor(dayStart / DAY));
  const subsidyBtc = share * BLOCKS_PER_DAY * SUBSIDY_BTC * (1 - POOL_FEE);
  const feeBtc = share * BLOCKS_PER_DAY * feePerBlockBtc * (1 - POOL_FEE);
  const date = new Date(dayStart).toISOString().slice(0, 10);
  const payout = {
    id: `ocean-mock-${date}`,
    ts: dayStart + DAY - 1000,
    amountBtc: round8(subsidyBtc + feeBtc),
    subsidyBtc: round8(subsidyBtc),
    feeBtc: round8(feeBtc),
  };
  payoutCache.set(dayStart, payout);
  return payout;
}

/** Payouts whose time falls in [start, end]; only complete days are paid. */
function payouts(start, end) {
  const out = [];
  const now = Date.now();
  for (let day = Math.floor(start / DAY) * DAY; day <= end; day += DAY) {
    const p = dailyPayout(day);
    if (p.ts >= start && p.ts <= end && p.ts <= now) out.push(p);
  }
  return out;
}

function round8(n) {
  return Math.round(n * 1e8) / 1e8;
}

module.exports = {
  fleet,
  catalogue,
  HOUR,
  DAY,
  minerIds,
  minerState,
  meterPowerW,
  unitMeterW,
  siteMeterW,
  networkHashrateEhs,
  payouts,
};
