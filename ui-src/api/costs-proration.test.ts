import { describe, expect, it } from "vitest";

import { COST_YEAR_MAX, COST_YEAR_MIN, financialsReportSchema } from "./contract";
import { callOn, exportOf, isFunction, isRecord, pluginModule } from "./plugin-module";

// The cost rules every cost figure rests on: Cost Input's monthly totals
// prorated by the share of each site-timezone month a period covers, and no
// figure at all when a month it touches lacks a cost.

const costsBetween = exportOf("plugin/lib/reports/financials.js", "costsBetween");
const financialsReport = exportOf("plugin/lib/reports/financials.js", "financialsReport");
const eachMonth = exportOf("plugin/lib/time.js", "eachMonth");
const openStore = exportOf("plugin/lib/store.js", "openStore");
const parseCatalogue = exportOf("plugin/lib/site-config.js", "parseCatalogue");

type Row = {
  year: number;
  month: number;
  energy_usd: number | null;
  operations_usd: number | null;
};
const row = (
  year: number,
  month: number,
  energy: number | null,
  operations: number | null,
): Row => ({
  year,
  month,
  energy_usd: energy,
  operations_usd: operations,
});

/** costsBetween's answer, checked to be { energy, operations } or null. */
const costs = (rows: Row[], start: number, end: number, tz: string) => {
  const out = costsBetween(rows, start, end, tz);
  if (out === null) return null;
  if (!isRecord(out) || typeof out.energy !== "number" || typeof out.operations !== "number")
    throw new Error("costsBetween returned an unexpected shape");
  return { energy: out.energy, operations: out.operations };
};

type Month = { year: number; month: number; start: number; end: number };
const isMonth = (v: unknown): v is Month =>
  isRecord(v) && ["year", "month", "start", "end"].every((k) => typeof v[k] === "number");

/** eachMonth's months, each checked, drained through its iterator protocol. */
const months = (from: number, to: number, tz: string): Month[] => {
  const it = eachMonth(from, to, tz);
  const next = isRecord(it) ? it.next : undefined;
  if (!isFunction(next)) throw new Error("eachMonth is not an iterator");
  const out: Month[] = [];
  for (;;) {
    const step = next.call(it);
    if (!isRecord(step) || step.done === true) return out;
    if (!isMonth(step.value)) throw new Error("eachMonth yielded an unexpected shape");
    out.push(step.value);
  }
};

describe("eachMonth", () => {
  it("lists the site-timezone months from the one holding `from`, before `to`", () => {
    const list = months(Date.UTC(2025, 11, 15), Date.UTC(2026, 1, 1), "UTC");
    expect(list.map((m) => [m.year, m.month])).toEqual([
      [2025, 12],
      [2026, 1],
    ]);
    expect(list[1]).toMatchObject({ start: Date.UTC(2026, 0, 1), end: Date.UTC(2026, 1, 1) });
  });

  it("starts a month at local midnight", () => {
    // Midnight on 1 March in New York is 05:00 UTC (EST).
    const [march] = months(Date.UTC(2026, 2, 10), Date.UTC(2026, 2, 11), "America/New_York");
    expect(march?.start).toBe(Date.UTC(2026, 2, 1, 5));
    // April begins after the DST change: 04:00 UTC (EDT).
    expect(march?.end).toBe(Date.UTC(2026, 3, 1, 4));
  });
});

describe("costsBetween", () => {
  const rows = [row(2026, 1, 3100, 620), row(2026, 2, 2800, 560)];

  it("prorates across a month boundary by the share of each month covered", () => {
    // Last day of January plus the first day of February.
    const out = costs(rows, Date.UTC(2026, 0, 31), Date.UTC(2026, 1, 2), "UTC");
    expect(out?.energy).toBeCloseTo(3100 / 31 + 2800 / 28, 6);
    expect(out?.operations).toBeCloseTo(620 / 31 + 560 / 28, 6);
  });

  it("prorates a DST month by its real length", () => {
    const tz = "America/New_York";
    const marchRows = [row(2026, 3, 743, 0)];
    // March 2026 in New York is 743 hours long (one hour lost to DST).
    const start = Date.UTC(2026, 2, 1, 5);
    const out = costs(marchRows, start, start + 3_600_000, tz);
    expect(out?.energy).toBeCloseTo(1, 6);
  });

  it("is null when a month the period touches has no costs", () => {
    expect(costs(rows, Date.UTC(2026, 1, 20), Date.UTC(2026, 2, 5), "UTC")).toBeNull();
  });

  it("is null when a month has only one of its two costs, never partial", () => {
    const partial = [row(2026, 1, 3100, null)];
    expect(costs(partial, Date.UTC(2026, 0, 1), Date.UTC(2026, 0, 2), "UTC")).toBeNull();
  });

  it("is zero over an empty interval", () => {
    expect(costs(rows, Date.UTC(2026, 0, 5), Date.UTC(2026, 0, 5), "UTC")).toEqual({
      energy: 0,
      operations: 0,
    });
  });
});

describe("Cost Input years", () => {
  it("bounds a year the same in the plugin as in the contract", () => {
    const costs = pluginModule("plugin/lib/costs.js");
    expect(isRecord(costs) ? [costs.MIN_YEAR, costs.MAX_YEAR] : null).toEqual([
      COST_YEAR_MIN,
      COST_YEAR_MAX,
    ]);
  });
});

describe("costs per MWh and per PH/s-day", () => {
  // A site installed on October 21st: October's bill is $3,100 of energy, $100
  // a day, and the miners draw 1 MW (24 MWh a day) from the 21st on.
  const HOUR = 3_600_000;
  const DAY = 24 * HOUR;
  const october = Date.UTC(2026, 9, 1);
  const november = Date.UTC(2026, 10, 1);
  const installed = Date.UTC(2026, 9, 21);

  const report = () => {
    const store = openStore();
    const rows = [];
    for (let ts = installed; ts < november; ts += HOUR)
      rows.push({
        ts,
        unit: "mu-1",
        model: "s21",
        intervalS: 3600,
        total: 1,
        low: 0,
        normal: 1,
        high: 0,
        sleep: 0,
        error: 0,
        offline: 0,
        maintenance: 0,
        hashrateThs: 1000,
        powerW: 1_000_000,
        miningPowerW: 1_000_000,
      });
    callOn(store, "writeMinerSamples", rows);
    callOn(store, "writeCosts", [{ year: 2026, month: 10, energyUsd: 3100, operationsUsd: 0 }]);
    const config = {
      site: { timezone: "UTC" },
      catalogue: parseCatalogue({ models: [] }),
      miningUnits: [],
    };
    return financialsReportSchema.parse(
      financialsReport(
        store,
        config,
        { start: october, end: november, granularity: "month" },
        november,
      ),
    );
  };

  it("charge the energy measured with the bill of the time measured", () => {
    const summary = report().summary;
    // The month's bill, in full.
    expect(summary?.energyCostUsd).toBe(3100);
    expect(summary?.energyMWh).toBe(11 * 24);
    // $100 a day over 24 MWh a day, not $3,100 over 11 days of energy.
    expect(summary?.energyCostUsdPerMWh).toBeCloseTo(100 / 24, 2);
    // 1 PH/s for 11 days: $100 per PH/s-day.
    expect(summary?.hashCostUsdPerPhsDay).toBeCloseTo(100, 4);
  });

  it("leave a month without samples out of the per-MWh cost, needing no cost for it", () => {
    const store = openStore();
    const config = {
      site: { timezone: "UTC" },
      catalogue: parseCatalogue({ models: [] }),
      miningUnits: [],
    };
    callOn(store, "writeMinerSamples", [
      {
        ts: installed,
        unit: "mu-1",
        model: "s21",
        intervalS: DAY / 1000,
        total: 1,
        low: 0,
        normal: 1,
        high: 0,
        sleep: 0,
        error: 0,
        offline: 0,
        maintenance: 0,
        hashrateThs: 1000,
        powerW: 1_000_000,
        miningPowerW: 1_000_000,
      },
    ]);
    callOn(store, "writeCosts", [{ year: 2026, month: 10, energyUsd: 3100, operationsUsd: 0 }]);
    // September has no cost and no samples.
    const r = financialsReportSchema.parse(
      financialsReport(
        store,
        config,
        { start: Date.UTC(2026, 8, 1), end: november, granularity: "month" },
        november,
      ),
    );
    expect(r.summary?.energyCostUsd).toBeNull();
    expect(r.summary?.energyCostUsdPerMWh).toBeCloseTo(100 / 24, 2);
  });
});
