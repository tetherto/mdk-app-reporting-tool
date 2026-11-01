"use strict";

// Financial figures per period bucket: pool payouts and their subsidy / fee
// split, revenue at production-date price, network hashrate, hashprice and
// fee rate,
// energy and hashrate from the miner samples, and Cost Input costs.
//
// Every ratio is a total over its basis (MWh, PH/s-days, BTC), computed once
// here for the buckets and the period alike. A period figure is therefore the
// average of its bucket series weighted by that basis, and every page that
// shows the same figure shows the same number.
//
// Costs are monthly bills. A cost total prorates them over the calendar time a
// bucket covers. A cost per MWh or per PH/s-day prorates them over the time the
// miner samples cover instead, as its energy and hashrate are: before the app
// was installed, or while the collector was down, there is a bill but no
// energy, and the calendar share would charge it to the energy that was measured.
//
// Prices and network figures are daily (UTC days, as the market-data worker
// serves them). A payout is valued at its own day's price; a bucket's price
// and network figures are the means of the days it covers, or the last known
// day before it when none falls inside (an hourly bucket, say).

const { DAY, bucketSpans, bucketer, eachMonth, nextBucket } = require("../time");

const SATS = 1e8;

function newAcc() {
  return {
    // Miner samples.
    seconds: 0,
    thsSec: 0,
    wSec: 0,
    nominalThsSec: 0,
    nominalWSec: 0,
    onlineSec: 0,
    minerSec: 0,
    // Payouts.
    payouts: 0,
    btc: 0,
    poolFeeBtc: 0,
    poolFeeMissing: false,
    subsidyBtc: 0,
    feesBtc: 0,
    splitMissing: false,
    revenueUsd: 0,
    grossRevenueUsd: 0,
    priceMissing: false,
    // Cost Input prorated over the sampled time.
    sampledEnergyUsd: 0,
    sampledOperationsUsd: 0,
    sampledCostMissing: false,
  };
}

/** Adds one row of the store's minerTotals: figures already times the seconds they cover. */
function addTotals(acc, row, catalogue) {
  acc.thsSec += row.hashrate_ths_s;
  acc.wSec += row.power_w_s;
  acc.onlineSec += row.low_s + row.normal_s + row.high_s;
  acc.minerSec += row.total_s;
  const model = catalogue.find(row.model);
  if (model) {
    acc.nominalThsSec += row.total_s * model.nominalHashrateThs;
    acc.nominalWSec += row.total_s * model.nominalPowerW;
  }
}

/**
 * Adds the sampled time of one month's part of a bucket, and that month's
 * costs prorated over it. A month with sampled time but no cost leaves the
 * sampled costs unknown.
 */
function addCoverage(acc, span, coveredS, costRow) {
  acc.seconds += coveredS;
  if (!costRow || costRow.energy_usd === null || costRow.operations_usd === null) {
    acc.sampledCostMissing = true;
    return;
  }
  const share = (coveredS * 1000) / (span.monthEnd - span.monthStart);
  acc.sampledEnergyUsd += costRow.energy_usd * share;
  acc.sampledOperationsUsd += costRow.operations_usd * share;
}

/** How a payout reads: its pool fee, its split and its price, or null where unknown. */
function valuePayout(p, priceOn, feeShareOn, splits) {
  let subsidy = null;
  let fees = null;
  if (p.subsidy_btc !== null && p.fee_btc !== null) {
    subsidy = p.subsidy_btc;
    fees = p.fee_btc;
    splits.add("pool");
  } else {
    const share = feeShareOn(p.ts);
    if (share !== null) {
      fees = p.amount_btc * share;
      subsidy = p.amount_btc - fees;
      splits.add("network");
    }
  }
  return { subsidy, fees, price: priceOn(p.ts) };
}

function addPayout(acc, p, valued) {
  acc.payouts += 1;
  acc.btc += p.amount_btc;
  if (p.pool_fee_btc === null) acc.poolFeeMissing = true;
  else acc.poolFeeBtc += p.pool_fee_btc;
  if (valued.subsidy === null) acc.splitMissing = true;
  else {
    acc.subsidyBtc += valued.subsidy;
    acc.feesBtc += valued.fees;
  }
  if (valued.price === null) acc.priceMissing = true;
  else {
    acc.revenueUsd += p.amount_btc * valued.price;
    acc.grossRevenueUsd += (p.amount_btc + (p.pool_fee_btc ?? 0)) * valued.price;
  }
}

/**
 * Daily values keyed by UTC day: the mean of each day's points, and the last
 * day at or before a time when that day has none.
 */
function dailySeries(rows, read) {
  const sums = new Map();
  for (const r of rows) {
    const v = read(r);
    if (v === null || v === undefined || !Number.isFinite(v)) continue;
    const day = Math.floor(r.ts / DAY) * DAY;
    const s = sums.get(day) || { sum: 0, n: 0 };
    s.sum += v;
    s.n += 1;
    sums.set(day, s);
  }
  const days = [...sums.keys()].sort((a, b) => a - b);
  const value = new Map(days.map((d) => [d, sums.get(d).sum / sums.get(d).n]));

  /** Index of the last day <= ts, or -1. */
  const lastAtOrBefore = (ts) => {
    let lo = 0;
    let hi = days.length - 1;
    let found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (days[mid] <= ts) {
        found = mid;
        lo = mid + 1;
      } else hi = mid - 1;
    }
    return found;
  };

  /** The value of the day holding `ts`, else of the last day before it. */
  const on = (ts) => {
    const i = lastAtOrBefore(ts);
    return i < 0 ? null : value.get(days[i]);
  };
  /** Mean over the days that start in [start, end), else the value on `start`. */
  const mean = (start, end) => {
    let sum = 0;
    let n = 0;
    for (let i = lastAtOrBefore(end - 1); i >= 0 && days[i] >= Math.floor(start / DAY) * DAY; i--) {
      sum += value.get(days[i]);
      n += 1;
    }
    return n > 0 ? sum / n : on(start);
  };
  return { on, mean };
}

/**
 * Cost Input totals prorated over [start, end): each month's cost times the
 * share of the month the interval covers, months in the site's timezone. Null
 * when a month the interval touches lacks either cost: a figure is never partial.
 */
function costsBetween(costRows, start, end, timezone) {
  const byMonth = new Map(costRows.map((r) => [`${r.year}-${r.month}`, r]));
  let energy = 0;
  let operations = 0;
  if (end <= start) return { energy: 0, operations: 0 };
  for (const m of eachMonth(start, end, timezone)) {
    const overlap = Math.min(end, m.end) - Math.max(start, m.start);
    if (overlap <= 0) continue;
    const row = byMonth.get(`${m.year}-${m.month}`);
    if (!row || row.energy_usd === null || row.operations_usd === null) return null;
    const share = overlap / (m.end - m.start);
    energy += row.energy_usd * share;
    operations += row.operations_usd * share;
  }
  return { energy, operations };
}

const round = (n, dp) => (Number.isFinite(n) ? Math.round(n * 10 ** dp) / 10 ** dp : null);
const div = (a, b) => (a !== null && b !== null && b > 0 ? a / b : null);

function finish(acc, market, costs) {
  const t = acc.seconds;
  const energyMWh = acc.wSec / 3.6e9;
  const phsDays = acc.thsSec / 1e3 / 86400;
  const btc = acc.btc;
  const grossBtc = acc.poolFeeMissing ? null : btc + acc.poolFeeBtc;
  const revenueUsd = acc.priceMissing ? null : acc.revenueUsd;
  const grossRevenueUsd = acc.priceMissing || acc.poolFeeMissing ? null : acc.grossRevenueUsd;
  const subsidyBtc = acc.splitMissing ? null : acc.subsidyBtc;
  const feesBtc = acc.splitMissing ? null : acc.feesBtc;
  const energyCostUsd = costs === null ? null : costs.energy;
  const operationsCostUsd = costs === null ? null : costs.operations;
  const allInCostUsd = costs === null ? null : costs.energy + costs.operations;
  // The bases of the per-MWh and per-PH/s-day costs: the costs of the sampled time.
  const sampledEnergyUsd = acc.sampledCostMissing ? null : acc.sampledEnergyUsd;
  const sampledOperationsUsd = acc.sampledCostMissing ? null : acc.sampledOperationsUsd;
  const sampledAllInUsd = acc.sampledCostMissing
    ? null
    : acc.sampledEnergyUsd + acc.sampledOperationsUsd;
  const sats = (v) => (v === null ? null : v * SATS);
  const hashCostBtc = div(sampledAllInUsd, market.priceUsd);

  return {
    payouts: acc.payouts,
    btc: round(btc, 8),
    poolFeeBtc: acc.poolFeeMissing ? null : round(acc.poolFeeBtc, 8),
    grossBtc: round(grossBtc, 8),
    subsidyBtc: round(subsidyBtc, 8),
    feesBtc: round(feesBtc, 8),
    feePercent: round(div(feesBtc === null ? null : feesBtc * 100, btc), 3),

    priceUsd: round(market.priceUsd, 2),
    revenueUsd: round(revenueUsd, 2),
    grossRevenueUsd: round(grossRevenueUsd, 2),
    networkHashrateHs: round(market.networkHashrateHs, 0),
    networkHashpriceUsdPerPhsDay: round(market.hashpriceUsd, 4),
    networkHashpriceBtcPerPhsDay: round(market.hashpriceBtc, 10),
    networkFeeRateSatsVb: round(market.feeRateSatsVb, 2),

    coveredSec: t,
    hashrateThs: t > 0 ? round(acc.thsSec / t, 2) : null,
    powerW: t > 0 ? round(acc.wSec / t, 2) : null,
    energyMWh: round(energyMWh, 4),
    nominalHashrateThs: t > 0 ? round(acc.nominalThsSec / t, 2) : null,
    nominalPowerW: t > 0 ? round(acc.nominalWSec / t, 2) : null,
    nominalEnergyMWh: round(acc.nominalWSec / 3.6e9, 4),
    uptimePercent: round(div(acc.onlineSec * 100, acc.minerSec), 2),
    capacityFactorPercent: round(div(acc.thsSec * 100, acc.nominalThsSec), 2),

    energyCostUsd: round(energyCostUsd, 2),
    operationsCostUsd: round(operationsCostUsd, 2),
    allInCostUsd: round(allInCostUsd, 2),

    revenueUsdPerMWh: round(div(revenueUsd, energyMWh), 2),
    grossRevenueUsdPerMWh: round(div(grossRevenueUsd, energyMWh), 2),
    revenueSatsPerMWh: round(div(sats(btc), energyMWh), 0),
    grossRevenueSatsPerMWh: round(div(sats(grossBtc), energyMWh), 0),
    hashRevenueUsdPerPhsDay: round(div(revenueUsd, phsDays), 4),
    grossHashRevenueUsdPerPhsDay: round(div(grossRevenueUsd, phsDays), 4),
    hashRevenueSatsPerPhsDay: round(div(sats(btc), phsDays), 0),
    grossHashRevenueSatsPerPhsDay: round(div(sats(grossBtc), phsDays), 0),
    energyCostUsdPerMWh: round(div(sampledEnergyUsd, energyMWh), 2),
    operationsCostUsdPerMWh: round(div(sampledOperationsUsd, energyMWh), 2),
    allInCostUsdPerMWh: round(div(sampledAllInUsd, energyMWh), 2),
    hashCostUsdPerPhsDay: round(div(sampledAllInUsd, phsDays), 4),
    hashCostSatsPerPhsDay: round(div(sats(hashCostBtc), phsDays), 0),
    productionCostUsdPerBtc: round(div(allInCostUsd, btc), 2),
  };
}

/**
 * @param {{ start: number, end: number, granularity: string }} range
 * @param {number} [now] the present; costs are prorated up to it, as energy is
 */
function financialsReport(store, config, range, now = Date.now()) {
  const timezone = config.site.timezone;
  const bucketOf = bucketer(range.granularity, timezone);
  const buckets = new Map();
  const total = newAcc();
  const bucket = (ts) => {
    const b = bucketOf(ts);
    if (!buckets.has(b)) buckets.set(b, newAcc());
    return buckets.get(b);
  };

  const costRows = store.costs();
  const costOf = new Map(costRows.map((r) => [`${r.year}-${r.month}`, r]));
  // Each bucket split at month ends, so its sampled time is charged at its month's costs.
  const spans = bucketSpans(range.start, range.end, range.granularity, timezone, {
    byMonth: true,
  });
  for (const row of store.minerTotals(spans)) {
    addTotals(bucket(spans[row.k].bucket), row, config.catalogue);
    addTotals(total, row, config.catalogue);
  }
  for (const { k, covered_s } of store.minerCoverage(spans)) {
    const span = spans[k];
    const costRow = costOf.get(`${span.year}-${span.month}`);
    addCoverage(bucket(span.bucket), span, covered_s, costRow);
    addCoverage(total, span, covered_s, costRow);
  }

  const prices = dailySeries(store.pricesBefore(range.end), (r) => r.usd);
  const network = store.networkBefore(range.end);
  const networkHashrate = dailySeries(network, (r) => r.hashrate_hs);
  const hashpriceUsd = dailySeries(network, (r) => r.usd_per_phs_day);
  const hashpriceBtc = dailySeries(network, (r) => r.btc_per_phs_day);
  const feeShare = dailySeries(network, (r) => r.fee_share);
  const feeRate = dailySeries(network, (r) => r.fee_rate_sats_vb);

  const splits = new Set();
  for (const p of store.payouts(range.start, range.end)) {
    const valued = valuePayout(p, prices.on, feeShare.on, splits);
    addPayout(bucket(p.ts), p, valued);
    addPayout(total, p, valued);
  }

  const marketBetween = (start, end) => ({
    priceUsd: prices.mean(start, end),
    networkHashrateHs: networkHashrate.mean(start, end),
    hashpriceUsd: hashpriceUsd.mean(start, end),
    hashpriceBtc: hashpriceBtc.mean(start, end),
    feeRateSatsVb: feeRate.mean(start, end),
  });
  // Calendar time a bucket covers, within the range and not past now.
  const span = (start, end) => [Math.max(start, range.start), Math.min(end, range.end, now)];

  const rows = [...buckets.keys()]
    .sort((a, b) => a - b)
    .map((ts) => {
      const [start, end] = span(ts, nextBucket(ts, range.granularity, timezone));
      const figures = finish(
        buckets.get(ts),
        marketBetween(start, end),
        costsBetween(costRows, start, end, timezone),
      );
      return Object.assign({ ts }, figures);
    });

  const [start, end] = span(range.start, range.end);
  return {
    range: { ...range, timezone },
    latestPriceUsd: round(store.latestPrice()?.usd ?? null, 2),
    split: splits.has("network") ? "network" : splits.has("pool") ? "pool" : null,
    buckets: rows,
    summary:
      rows.length === 0
        ? null
        : finish(total, marketBetween(start, end), costsBetween(costRows, start, end, timezone)),
  };
}

module.exports = { financialsReport, costsBetween };
