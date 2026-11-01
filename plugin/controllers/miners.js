"use strict";

const context = require("../lib/context");
const { minersSnapshot } = require("../lib/reports/miners");

// The latest snapshot of the fleet. `refresh=true` samples the site first,
// unless the last sample is only seconds old.
module.exports = async function miners(req) {
  const { config, store, collector } = context.get();
  if (req.query && (req.query.refresh === "true" || req.query.refresh === true))
    await collector.refresh();
  return minersSnapshot(store, config);
};
