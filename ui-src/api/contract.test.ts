import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  consumptionReportSchema,
  financialsReportSchema,
  GRANULARITIES,
  minersSnapshotSchema,
  operationsReportSchema,
  siteInfoSchema,
  yearCostsSchema,
} from "./contract";
import type { PluginFn } from "./plugin-module";
import { exportOf, isFunction, isRecord, repoRoot } from "./plugin-module";

// The plugin's reports are the executable version of the contract: run them on
// a store seeded from the mock site (the same simulation the dev stack serves)
// and every body they return must parse with the schema the UI parses it with.

type Range = { start: number; end: number; granularity: string };
type Collector = {
  state: {
    kernelConnected: boolean;
    lastSampleAt: number | null;
    lastError: string | null;
    devices: Map<string, string>;
    sources: Record<string, boolean>;
  };
  sampleNow: () => Promise<void>;
  refresh: () => Promise<void>;
};

const controllerOf = (path: string): PluginFn => exportOf(path);

const openStore = exportOf("plugin/lib/store.js", "openStore");
const loadConfig = exportOf("plugin/lib/site-config.js", "loadConfig");
const seed = exportOf("dev/mock-site/seed.js", "seed");
const operationsReport = exportOf("plugin/lib/reports/operations.js", "operationsReport");
const consumptionReport = exportOf("plugin/lib/reports/consumption.js", "consumptionReport");
const minersSnapshot = exportOf("plugin/lib/reports/miners.js", "minersSnapshot");
const financialsReport = exportOf("plugin/lib/reports/financials.js", "financialsReport");
const setContext = exportOf("plugin/lib/context.js", "set");

/** The site timezone of a loaded config. */
const timezoneOf = (cfg: unknown): string => {
  const site = isRecord(cfg) ? cfg.site : undefined;
  const tz = isRecord(site) ? site.timezone : undefined;
  if (typeof tz !== "string") throw new Error("the config has no site timezone");
  return tz;
};

/** Calls one of the store's methods. */
const storeCall = (name: string, ...args: unknown[]): unknown => {
  const fn = isRecord(store) ? store[name] : undefined;
  if (!isFunction(fn)) throw new Error(`the store has no ${name}`);
  return fn(...args);
};

// A few days of history keeps the seed fast; the reports read it the same way.
const HISTORY_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;

let dir: string;
let store: unknown;
let config: unknown;
let collector: Collector;

beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "reporting-contract-"));
  config = loadConfig(
    {
      siteConfig: "./config/site.json",
      catalogue: "./config/hardware-catalogue.json",
      historyDays: HISTORY_DAYS,
    },
    join(repoRoot, "dev"),
  );
  store = openStore(dir, { timezone: timezoneOf(config) });
  await seed({ store, config });
  collector = {
    state: {
      kernelConnected: true,
      lastSampleAt: Date.now(),
      lastError: null,
      devices: new Map([["pm-01", "meters"]]),
      sources: { pool: false, market: false },
    },
    sampleNow: async () => {},
    refresh: async () => {},
  };
  setContext({ config, store, collector });

  // A pool and a market-data worker as the collector writes them: two payouts
  // a day, with the pool's fee; one price and one network row a day.
  const now = Date.now();
  const payouts = [];
  const prices = [];
  const network = [];
  for (let d = 0; d < HISTORY_DAYS; d++) {
    const day = Math.floor((now - d * DAY) / DAY) * DAY;
    prices.push({ ts: day, usd: 100_000 + d * 1_000 });
    network.push({
      ts: day,
      hashrateHs: 9e20,
      btcPerPhsDay: 0.0005,
      usdPerPhsDay: 50,
      feeShare: 0.01,
      feeRateSatsVb: 4,
    });
    for (const h of [3, 15])
      payouts.push({
        id: `p-${d}-${h}`,
        ts: day + h * 3_600_000,
        amountBtc: 0.002,
        poolFeeBtc: 0.00004,
      });
  }
  storeCall("writePrices", prices);
  storeCall("writeNetwork", network);
  storeCall(
    "writePayouts",
    payouts.filter((p) => p.ts < now),
  );
}, 60_000);

afterAll(() => {
  const close = isRecord(store) ? store.close : undefined;
  if (isFunction(close)) close();
  rmSync(dir, { recursive: true, force: true });
});

const lastDays = (days: number, granularity: string): Range => {
  const end = Date.now();
  return { start: end - days * DAY, end, granularity };
};

describe("plugin reports match the contract", () => {
  it("serves the site", async () => {
    const site = siteInfoSchema.parse(await controllerOf("plugin/controllers/site.js")({}));

    expect(site.models.length).toBeGreaterThan(0);
    expect(site.history.firstTs).not.toBeNull();
  });

  it.each(GRANULARITIES)("serves the operations report by %s", (granularity) => {
    const report = operationsReportSchema.parse(
      operationsReport(store, config, lastDays(HISTORY_DAYS, granularity)),
    );

    expect(report.buckets.length).toBeGreaterThan(0);
    expect(report.summary).not.toBeNull();
  });

  it("serves an empty operations report for a period with no samples", () => {
    const end = Date.now() - 30 * DAY;
    const report = operationsReportSchema.parse(
      operationsReport(store, config, { start: end - DAY, end, granularity: "hour" }),
    );

    expect(report.buckets).toEqual([]);
    expect(report.summary).toBeNull();
  });

  it("serves the miners snapshot", async () => {
    const snapshot = minersSnapshotSchema.parse(minersSnapshot(store, config));
    expect(snapshot.ts).not.toBeNull();
    expect(snapshot.site?.total).toBeGreaterThan(0);

    const viaController = await controllerOf("plugin/controllers/miners.js")({
      query: { refresh: "true" },
    });
    expect(() => minersSnapshotSchema.parse(viaController)).not.toThrow();
  });

  it.each(GRANULARITIES)("serves the consumption report by %s", (granularity) => {
    const report = consumptionReportSchema.parse(
      consumptionReport(store, config, lastDays(HISTORY_DAYS, granularity)),
    );

    expect(report.buckets.length).toBeGreaterThan(0);
    expect(report.siteMeter).not.toBeNull();
  });

  it("serves both reports through their controllers, with the range from the query", async () => {
    const { start, end } = lastDays(1, "hour");
    const query = { start: String(start), end: String(end), granularity: "hour" };

    // The controllers run parseRange on the query as the Gateway hands it over: strings.
    const ops = operationsReportSchema.parse(
      await controllerOf("plugin/controllers/operations.js")({ query }),
    );
    const consumption = consumptionReportSchema.parse(
      await controllerOf("plugin/controllers/consumption.js")({ query }),
    );

    expect(ops.range).toMatchObject({ start, end, granularity: "hour" });
    expect(consumption.range).toMatchObject({ start, end, granularity: "hour" });
  });
});

describe("financials match the contract and reconcile", () => {
  it.each(["day", "week", "month"] as const)("serves the financials report by %s", (g) => {
    const report = financialsReportSchema.parse(
      financialsReport(store, config, lastDays(HISTORY_DAYS, g)),
    );
    const summary = report.summary;
    if (summary === null) throw new Error("no summary");

    // Totals are the sums of the buckets.
    const sum = (read: (b: (typeof report.buckets)[number]) => number | null): number =>
      report.buckets.reduce((acc, b) => acc + (read(b) ?? 0), 0);
    expect(sum((b) => b.btc)).toBeCloseTo(summary.btc, 8);
    expect(sum((b) => b.energyMWh)).toBeCloseTo(summary.energyMWh, 2);
    expect(sum((b) => b.allInCostUsd)).toBeCloseTo(summary.allInCostUsd ?? NaN, 0);
    // The split comes from the network's fee share; subsidy and fees add up to the payouts.
    expect(report.split).toBe("network");
    expect((summary.subsidyBtc ?? 0) + (summary.feesBtc ?? 0)).toBeCloseTo(summary.btc, 8);
    // Gross is net plus the pool's fee.
    expect(summary.grossBtc).toBeCloseTo(summary.btc * 1.02, 8);
    // The network's fee rate is the mean of its days, in every bucket with a known day too.
    expect(summary.networkFeeRateSatsVb).toBe(4);
    const rates = report.buckets.map((b) => b.networkFeeRateSatsVb).filter((v) => v !== null);
    expect(new Set(rates)).toEqual(new Set([4]));
    // The seed bills each month at $45/MWh energy and $12/MWh operations
    // (rounded to $100): a per-MWh cost recovers those rates.
    expect(summary.energyCostUsdPerMWh).toBeGreaterThan(45 * 0.99);
    expect(summary.energyCostUsdPerMWh).toBeLessThan(45 * 1.01);
    expect(summary.allInCostUsdPerMWh).toBeCloseTo(
      (summary.energyCostUsdPerMWh ?? NaN) + (summary.operationsCostUsdPerMWh ?? NaN),
      1,
    );
  });

  it("round-trips Cost Input through its controllers and feeds the report", async () => {
    const year = new Date().getUTCFullYear();
    const put = controllerOf("plugin/controllers/costs-put.js");
    const get = controllerOf("plugin/controllers/costs-get.js");

    const saved = yearCostsSchema.parse(
      await put({ body: { year, months: [{ month: 1, energyUsd: 1234, operationsUsd: null }] } }),
    );
    expect(saved.months[0]).toMatchObject({ month: 1, energyUsd: 1234, operationsUsd: null });

    const read = yearCostsSchema.parse(await get({ query: { year: String(year) } }));
    expect(read.months).toHaveLength(12);
    expect(read.months[0]?.energyUsd).toBe(1234);

    await expect(
      put({
        body: {
          year,
          months: [
            { month: 2, energyUsd: 1, operationsUsd: 1 },
            { month: 2, energyUsd: 2, operationsUsd: 2 },
          ],
        },
      }),
    ).rejects.toThrow("ERR_BAD_COSTS");
  });
});
