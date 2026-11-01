"use strict";

// Energy per power meter per period bucket, in MWh: each meter's power samples
// times the time they cover.

const { bucketSpans } = require("../time");

function consumptionReport(store, config, range) {
  const spans = bucketSpans(range.start, range.end, range.granularity, config.site.timezone);
  const siteMeter = config.meters.find((m) => m.siteMeter) || null;
  const meters = config.meters.filter((m) => !m.siteMeter);
  const buckets = new Map();

  for (const row of store.meterTotals(spans)) {
    const b = spans[row.k].bucket;
    let acc = buckets.get(b);
    if (!acc) {
      acc = new Map();
      buckets.set(b, acc);
    }
    acc.set(row.meter, (acc.get(row.meter) || 0) + row.power_w_s / 3.6e9);
  }

  const round = (n) => (n === undefined ? null : Math.round(n * 10000) / 10000);
  return {
    range: { ...range, timezone: config.site.timezone },
    meters: meters.map((m) => ({ id: m.device, label: m.label })),
    siteMeter: siteMeter ? { id: siteMeter.device, label: siteMeter.label } : null,
    buckets: [...buckets]
      .sort(([a], [b]) => a - b)
      .map(([ts, acc]) => {
        const byMeter = {};
        for (const m of meters) byMeter[m.device] = round(acc.get(m.device));
        return { ts, byMeter, siteMeterMWh: siteMeter ? round(acc.get(siteMeter.device)) : null };
      }),
  };
}

module.exports = { consumptionReport };
