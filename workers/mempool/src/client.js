"use strict";

// The mempool.space API client for this device. Responses are cached, since
// history only grows at the end and pages ask for it repeatedly.
const { opts, logger } = require("@tetherto/mdk-worker/device");

const BASE_URL = (opts.baseUrl || "https://mempool.space").replace(/\/$/, "");
const TIMEOUT_MS = opts.timeoutMs || 15000;
const DAY = 24 * 60 * 60 * 1000;

const cache = new Map();

async function getJson(path, ttlMs) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < ttlMs) return hit.body;
  try {
    const res = await fetch(BASE_URL + path, { signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = await res.json();
    cache.set(path, { at: Date.now(), body });
    return body;
  } catch (err) {
    logger("GET %s failed: %s", path, err.message);
    // A stale answer beats none while the API is briefly unreachable.
    if (hit) return hit.body;
    throw new Error("ERR_MEMPOOL_UNREACHABLE", { cause: err });
  }
}

function expect(ok) {
  if (!ok) throw new Error("ERR_MEMPOOL_BAD_RESPONSE");
}

async function price() {
  const body = await getJson("/api/v1/prices", 60 * 1000);
  expect(body && typeof body.USD === "number");
  return body.USD;
}

/** [{ ts, usd }], oldest first. */
async function priceHistory() {
  const body = await getJson("/api/v1/historical-price?currency=USD", 30 * 60 * 1000);
  expect(body && Array.isArray(body.prices));
  return body.prices.map((p) => ({ ts: p.time * 1000, usd: p.USD })).sort((a, b) => a.ts - b.ts);
}

/** [{ ts, hashrateHs }], one per day, oldest first. */
async function networkHashrate() {
  const body = await getJson("/api/v1/mining/hashrate/3y", 60 * 60 * 1000);
  expect(body && Array.isArray(body.hashrates));
  return body.hashrates.map((h) => ({ ts: h.timestamp * 1000, hashrateHs: h.avgHashrate }));
}

/** [{ ts, avgRewardSats }]: average reward per block (subsidy plus fees), a few points a day. */
async function blockRewards() {
  const body = await getJson("/api/v1/mining/blocks/rewards/2y", 60 * 60 * 1000);
  expect(Array.isArray(body));
  return body.map((r) => ({ ts: r.timestamp * 1000, avgRewardSats: r.avgRewards }));
}

/** [{ ts, avgFeeSats }]: average transaction fees per block, at the same blocks as blockRewards. */
async function blockFees() {
  const body = await getJson("/api/v1/mining/blocks/fees/2y", 60 * 60 * 1000);
  expect(Array.isArray(body));
  return body.map((r) => ({ ts: r.timestamp * 1000, avgFeeSats: r.avgFees }));
}

/** [{ ts, medianSatsVb }]: the median fee rate of a few blocks' transactions, in sats/vB, a few points a day. */
async function blockFeeRates() {
  const body = await getJson("/api/v1/mining/blocks/fee-rates/2y", 60 * 60 * 1000);
  expect(Array.isArray(body));
  return body.map((r) => ({ ts: r.timestamp * 1000, medianSatsVb: r.avgFee_50 }));
}

module.exports = {
  DAY,
  price,
  priceHistory,
  networkHashrate,
  blockRewards,
  blockFees,
  blockFeeRates,
};
