"use strict";

// Which data sources are wired, for /site. A source counts as wired once its
// device is discovered, or once the store holds data from it.

const RECENT_PAYOUTS = 10;

function sources(store, config, collector) {
  const devices = collector.state.devices;
  const recent = store.recentPayouts(RECENT_PAYOUTS);
  return {
    miners:
      config.miningUnits.some(
        (u) =>
          u.devices.some((id) => devices.has(id)) ||
          [...devices.values()].some((w) => u.workers.includes(w)),
      ) || store.lastMinerSampleTs() !== null,
    pool: collector.state.sources.pool || recent.length > 0,
    // The pool reports the subsidy / fee split, or its own fee, when its recent payouts carry it.
    poolSplit: recent.some((p) => p.subsidy_btc !== null && p.fee_btc !== null),
    poolFee: recent.some((p) => p.pool_fee_btc !== null),
    market: collector.state.sources.market || store.latestPrice() !== null,
    meters: config.meters.some((m) => !m.siteMeter && devices.has(m.device)),
    siteMeter: config.meters.some((m) => m.siteMeter && devices.has(m.device)),
    costs: store.hasCosts(),
  };
}

module.exports = { sources };
