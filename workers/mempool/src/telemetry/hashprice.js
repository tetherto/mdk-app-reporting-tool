"use strict";

const client = require("../client");
const range = require("../range");

const BLOCKS_PER_DAY = 144;
const PHS = 1e15;

const dayOf = (ts) => Math.floor(ts / client.DAY) * client.DAY;

// Average of the values falling on each UTC day.
function dailyMeans(rows, field) {
  const days = new Map();
  for (const row of rows) {
    const day = dayOf(row.ts);
    const acc = days.get(day) || { sum: 0, n: 0 };
    acc.sum += row[field];
    acc.n += 1;
    days.set(day, acc);
  }
  return new Map([...days].map(([day, { sum, n }]) => [day, sum / n]));
}

// Hashprice for one day = that day's block rewards (subsidy plus fees) divided
// by the network hashrate in PH/s: what one PH/s earned that day.
module.exports = async (params) => {
  const { start, end } = range(params);
  const [hashrates, rewards, prices] = await Promise.all([
    client.networkHashrate(),
    client.blockRewards(),
    client.priceHistory(),
  ]);
  const rewardByDay = dailyMeans(rewards, "avgRewardSats");
  const priceByDay = dailyMeans(prices, "usd");

  const out = [];
  for (const { ts, hashrateHs } of hashrates) {
    if (ts < start || ts > end || !hashrateHs) continue;
    const day = dayOf(ts);
    const avgRewardSats = rewardByDay.get(day);
    if (avgRewardSats === undefined) continue;
    const btcPerPhsDay = (BLOCKS_PER_DAY * avgRewardSats) / 1e8 / (hashrateHs / PHS);
    const usd = priceByDay.get(day);
    out.push({
      ts: day,
      btcPerPhsDay,
      usdPerPhsDay: usd === undefined ? null : btcPerPhsDay * usd,
    });
  }
  return out;
};
