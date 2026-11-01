"use strict";

// The fleet as of the latest sample: counts per miner type by status and power
// mode, and power per type. Feeds the Power Mode table and the Miners donut.

const { describeModels } = require("./operations");

const COUNTS = ["total", "offline", "error", "sleep", "low", "normal", "high", "maintenance"];

function minersSnapshot(store, config) {
  const rows = store.latestMinerSamples();
  if (rows.length === 0) return { ts: null, models: [], units: [], site: null };

  const byModel = new Map();
  const byUnit = new Map();
  const site = { powerW: 0 };
  for (const c of COUNTS) site[c] = 0;

  const addTo = (map, key, row) => {
    let acc = map.get(key);
    if (!acc) {
      acc = { powerW: 0 };
      for (const c of COUNTS) acc[c] = 0;
      map.set(key, acc);
    }
    for (const c of COUNTS) acc[c] += row[c];
    acc.powerW += row.power_w;
  };
  for (const row of rows) {
    addTo(byModel, row.model, row);
    addTo(byUnit, row.unit, row);
    for (const c of COUNTS) site[c] += row[c];
    site.powerW += row.power_w;
  }

  const models = describeModels(byModel.keys(), config.catalogue).map((m) =>
    Object.assign(m, byModel.get(m.id)),
  );
  const units = config.miningUnits.map((u) => ({
    id: u.id,
    name: u.name,
    ...(byUnit.get(u.id) || null),
  }));
  return { ts: rows[0].ts, intervalS: rows[0].interval_s, models, units, site };
}

module.exports = { minersSnapshot };
