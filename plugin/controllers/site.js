"use strict";

const context = require("../lib/context");
const { sources } = require("../lib/sources");
const { describeModels } = require("../lib/reports/operations");

// The site as the pages need it: name, timezone, mining units, miner types,
// which sources are wired and how far back history goes.
module.exports = async function site() {
  const { config, store, collector } = context.get();
  const models = new Set(store.latestMinerSamples().map((r) => r.model));
  return {
    site: config.site,
    miningUnits: config.miningUnits.map((u) => ({ id: u.id, name: u.name })),
    models: describeModels(models, config.catalogue),
    meters: config.meters.map((m) => ({ id: m.device, label: m.label, siteMeter: m.siteMeter })),
    sources: sources(store, config, collector),
    history: { firstTs: store.firstMinerSampleTs(), lastTs: store.lastMinerSampleTs() },
    collector: {
      kernelConnected: collector.state.kernelConnected,
      lastSampleAt: collector.state.lastSampleAt,
      lastError: collector.state.lastError,
      sampleIntervalSec: config.sampleIntervalSec,
    },
  };
};
