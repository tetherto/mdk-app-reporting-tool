"use strict";

// Operations figures per period bucket: hashrate, power, efficiency, nominal
// values and miner status, for the site, each mining unit and each miner type.
//
// Every figure is a time-weighted average over the samples in the bucket, so a
// bucket mixing 5-minute live samples with hourly seeded ones weighs each by
// the time it covers. The store sums the samples per bucket, mining unit and
// model; mining units and miner types are cuts of the same sums, so they add
// up to the site by construction.

const { bucketSpans } = require("../time");

const STATUSES = ["online", "error", "offline", "sleep", "maintenance"];

function newAcc() {
  return {
    seconds: 0,
    site: { h: 0, p: 0, mp: 0 },
    byUnit: new Map(),
    byModel: new Map(),
    status: { online: 0, error: 0, offline: 0, sleep: 0, maintenance: 0 },
    nominal: { h: 0, p: 0 },
    nominalByUnit: new Map(),
    nominalByModel: new Map(),
    miners: 0,
  };
}

function add(map, key, row) {
  let s = map.get(key);
  if (!s) {
    s = { h: 0, p: 0, mp: 0 };
    map.set(key, s);
  }
  s.h += row.hashrate_ths_s;
  s.p += row.power_w_s;
  s.mp += row.mining_power_w_s;
}

/** Adds one row of the store's minerTotals: figures already times the seconds they cover. */
function accumulate(acc, row, catalogue) {
  acc.site.h += row.hashrate_ths_s;
  acc.site.p += row.power_w_s;
  acc.site.mp += row.mining_power_w_s;
  add(acc.byUnit, row.unit, row);
  add(acc.byModel, row.model, row);
  acc.status.online += row.low_s + row.normal_s + row.high_s;
  acc.status.error += row.error_s;
  acc.status.offline += row.offline_s;
  acc.status.sleep += row.sleep_s;
  acc.status.maintenance += row.maintenance_s;
  acc.miners += row.total_s;
  const model = catalogue.find(row.model);
  if (model) {
    const h = row.total_s * model.nominalHashrateThs;
    const p = row.total_s * model.nominalPowerW;
    acc.nominal.h += h;
    acc.nominal.p += p;
    addNominal(acc.nominalByUnit, row.unit, h, p);
    addNominal(acc.nominalByModel, row.model, h, p);
  }
}

function addNominal(map, key, h, p) {
  const n = map.get(key) || { h: 0, p: 0 };
  n.h += h;
  n.p += p;
  map.set(key, n);
}

const round = (n, dp = 2) => (Number.isFinite(n) ? Math.round(n * 10 ** dp) / 10 ** dp : null);
const efficiency = (powerW, hashrateThs) =>
  hashrateThs > 0 ? round(powerW / hashrateThs, 3) : null;

function nominalCut(map, t) {
  const out = {};
  for (const [key, n] of map) {
    out[key] = {
      hashrateThs: round(n.h / t),
      powerW: round(n.p / t),
      efficiencyWThs: efficiency(n.p, n.h),
    };
  }
  return out;
}

function finish(acc) {
  const t = acc.seconds;
  if (!t) return null;
  const cut = (map) => {
    const hashrateThs = {};
    const powerW = {};
    const eff = {};
    for (const [key, s] of map) {
      hashrateThs[key] = round(s.h / t);
      powerW[key] = round(s.p / t);
      eff[key] = efficiency(s.mp / t, s.h / t);
    }
    return { hashrateThs, powerW, efficiency: eff };
  };
  const units = cut(acc.byUnit);
  const models = cut(acc.byModel);
  const status = {};
  for (const s of STATUSES) status[s] = round(acc.status[s] / t, 1);
  return {
    coveredSec: t,
    hashrateThs: {
      site: round(acc.site.h / t),
      byUnit: units.hashrateThs,
      byModel: models.hashrateThs,
    },
    powerW: { site: round(acc.site.p / t), byUnit: units.powerW, byModel: models.powerW },
    // Energy over the time the samples cover, in MWh.
    energyMWh: round(acc.site.p / 3.6e9, 4),
    efficiencyWThs: {
      site: efficiency(acc.site.mp / t, acc.site.h / t),
      byUnit: units.efficiency,
      byModel: models.efficiency,
    },
    nominal: {
      hashrateThs: round(acc.nominal.h / t),
      powerW: round(acc.nominal.p / t),
      efficiencyWThs: efficiency(acc.nominal.p, acc.nominal.h),
      byUnit: nominalCut(acc.nominalByUnit, t),
      byModel: nominalCut(acc.nominalByModel, t),
    },
    miners: round(acc.miners / t, 1),
    status,
  };
}

/**
 * @param {{ start: number, end: number, granularity: string }} range
 */
function operationsReport(store, config, range) {
  const spans = bucketSpans(range.start, range.end, range.granularity, config.site.timezone);
  const buckets = new Map();
  const total = newAcc();
  const modelIds = new Set();
  const accOf = (k) => {
    const b = spans[k].bucket;
    if (!buckets.has(b)) buckets.set(b, newAcc());
    return buckets.get(b);
  };

  for (const row of store.minerTotals(spans)) {
    accumulate(accOf(row.k), row, config.catalogue);
    accumulate(total, row, config.catalogue);
    modelIds.add(row.model);
  }
  for (const { k, covered_s } of store.minerCoverage(spans)) {
    accOf(k).seconds += covered_s;
    total.seconds += covered_s;
  }

  return {
    range: { ...range, timezone: config.site.timezone },
    units: config.miningUnits.map((u) => ({ id: u.id, name: u.name })),
    models: describeModels(modelIds, config.catalogue),
    buckets: [...buckets]
      .sort(([a], [b]) => a - b)
      .map(([ts, acc]) => Object.assign({ ts }, finish(acc))),
    summary: finish(total),
  };
}

/** Miner types present, with their catalogue display names, by name. */
function describeModels(ids, catalogue) {
  return [...ids]
    .map((id) => {
      const m = catalogue.find(id);
      return {
        id,
        displayName: m ? m.displayName : id,
        vendor: m ? m.vendor : null,
        nominalHashrateThs: m ? m.nominalHashrateThs : null,
        nominalPowerW: m ? m.nominalPowerW : null,
      };
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

module.exports = { operationsReport, describeModels };
