import { describe, expect, it } from "vitest";

import { METRICS } from "../lib/metrics";
import { toDashboardCharts } from "./dashboard/dashboard-shape";
import { toCostSummary } from "./financials/cost-summary-shape";
import { toEnergyBalance } from "./financials/energy-balance-shape";
import { CURRENCIES } from "./financials/financials-shape";
import { toHashBalance } from "./financials/hash-balance-shape";
import { report, sources } from "./financials/report-fixture";
import {
  REVENUE_CHART_UNITS,
  revenueChart,
  toRevenueSummary,
} from "./financials/revenue-summary-shape";
import { feeRateChart, subsidyFeeChart } from "./financials/subsidy-fee-shape";
import { metricBreakdown, metricTrend, statusTrend } from "./operations/operations-shape";
import { report as operationsReport } from "./operations/report-fixture";

type Colored = { label: string; color: string };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

const isColored = (v: unknown): v is Colored =>
  isRecord(v) && typeof v["label"] === "string" && typeof v["color"] === "string";

/** Every chart's series and every donut's slices found anywhere in `value`, by where they are. */
function colorGroups(value: unknown, path = "", out: Array<[string, Colored[]]> = []) {
  if (Array.isArray(value)) {
    value.forEach((v, i) => colorGroups(v, `${path}[${i}]`, out));
  } else if (isRecord(value)) {
    for (const [key, v] of Object.entries(value)) {
      if ((key === "series" || key === "slices") && Array.isArray(v) && v.every(isColored)) {
        out.push([`${path}.${key}`, v]);
      } else {
        colorGroups(v, `${path}.${key}`, out);
      }
    }
  }
  return out;
}

const financials = report();
const operations = operationsReport();

const charts = {
  dashboard: toDashboardCharts(operations),
  metrics: Object.values(METRICS).map((m) => [
    metricTrend(operations, m),
    metricBreakdown(operations, m, "model"),
    metricBreakdown(operations, m, "unit"),
  ]),
  status: statusTrend(operations),
  costSummary: toCostSummary(financials),
  revenueSummary: toRevenueSummary(financials, sources(), "BTC"),
  revenue: REVENUE_CHART_UNITS.map((u) => revenueChart(financials, u.value, "Site")),
  subsidyFee: [subsidyFeeChart(financials), feeRateChart(financials)],
  balances: CURRENCIES.map((c) => [
    toHashBalance(financials, c, true),
    toEnergyBalance(financials, c, true),
  ]),
};

describe("chart colours", () => {
  const groups = colorGroups(charts);

  it("finds the charts to check", () => {
    expect(groups.length).toBeGreaterThan(10);
  });

  it.each(groups)("gives each series of %s its own colour", (_, series) => {
    const colors = series.map((s) => s.color);
    expect(new Set(colors).size).toBe(colors.length);
  });
});
