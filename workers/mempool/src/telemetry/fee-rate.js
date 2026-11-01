"use strict";

const client = require("../client");
const range = require("../range");

const dayOf = (ts) => Math.floor(ts / client.DAY) * client.DAY;

// The day's typical transaction fee rate, in sats/vB, per UTC day: the mean of
// mempool.space's median block fee rates on that day.
module.exports = async (params) => {
  const { start, end } = range(params);
  const days = new Map();
  for (const row of await client.blockFeeRates()) {
    if (typeof row.medianSatsVb !== "number") continue;
    const day = dayOf(row.ts);
    const d = days.get(day) || { sum: 0, n: 0 };
    days.set(day, { sum: d.sum + row.medianSatsVb, n: d.n + 1 });
  }
  const out = [];
  for (const [day, { sum, n }] of days) {
    if (day < dayOf(start) || day > end) continue;
    out.push({ ts: day, feeRateSatsVb: sum / n });
  }
  return out.sort((a, b) => a.ts - b.ts);
};
