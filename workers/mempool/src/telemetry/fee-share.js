"use strict";

const client = require("../client");
const range = require("../range");

const dayOf = (ts) => Math.floor(ts / client.DAY) * client.DAY;

// Sum of the values falling on each UTC day.
function dailySums(rows, field) {
  const days = new Map();
  for (const row of rows) {
    const day = dayOf(row.ts);
    days.set(day, (days.get(day) || 0) + row[field]);
  }
  return days;
}

// The share of block rewards paid as transaction fees, per UTC day: that day's
// fees over its rewards (subsidy plus fees). mempool.space samples both series
// at the same blocks, so their daily sums divide cleanly.
module.exports = async (params) => {
  const { start, end } = range(params);
  const [fees, rewards] = await Promise.all([client.blockFees(), client.blockRewards()]);
  const feesByDay = dailySums(fees, "avgFeeSats");
  const out = [];
  for (const [day, rewardSats] of dailySums(rewards, "avgRewardSats")) {
    const feeSats = feesByDay.get(day);
    if (day < dayOf(start) || day > end || feeSats === undefined || !(rewardSats > 0)) continue;
    out.push({ ts: day, feeShare: Math.min(1, feeSats / rewardSats) });
  }
  return out.sort((a, b) => a.ts - b.ts);
};
