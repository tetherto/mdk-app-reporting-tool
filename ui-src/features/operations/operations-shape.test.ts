import { describe, expect, it } from "vitest";

import { METRICS } from "../../lib/metrics";
import { metricBreakdown, metricSummary, metricTrend, statusTrend } from "./operations-shape";
import { report } from "./report-fixture";

describe("metricTrend", () => {
  it("scales the site hashrate and its nominal to one unit, picked from the largest value", () => {
    const chart = metricTrend(report(), METRICS.hashrate);

    expect(chart.unit).toBe("PH/s");
    expect(chart.labels).toEqual(["Oct 21, 00:00", "Oct 21, 01:00"]);
    expect(chart.series.map((s) => s.values)).toEqual([
      [1.5, 2],
      [2, 2],
    ]);
    expect(chart.series[1]?.dashed).toBe(true);
  });

  it("drops the nominal line when asked", () => {
    expect(metricTrend(report(), METRICS.power, { withNominal: false }).series).toHaveLength(1);
  });

  it("reads one miner type, with nulls for a type with no figures", () => {
    expect(metricTrend(report(), METRICS.hashrate, { model: "s23" }).series[0]?.values).toEqual([
      1.5, 2,
    ]);
    expect(metricTrend(report(), METRICS.hashrate, { model: "m70s" }).series[0]?.values).toEqual([
      null,
      null,
    ]);
  });

  it("is empty with no buckets", () => {
    expect(metricTrend(report(0), METRICS.hashrate).empty).toBe(true);
  });
});

describe("metricBreakdown", () => {
  it("averages per mining unit, optionally one unit only", () => {
    expect(metricBreakdown(report(), METRICS.hashrate, "unit").series[0]?.values).toEqual([
      875, 875,
    ]);
    expect(metricBreakdown(report(), METRICS.hashrate, "unit", "mu-2").labels).toEqual([
      "Mining Unit 2",
    ]);
  });

  it("is empty when the period has no summary", () => {
    expect(metricBreakdown(report(0), METRICS.hashrate, "model").empty).toBe(true);
  });
});

describe("metricSummary", () => {
  it("returns the site average and the nominal value", () => {
    expect(metricSummary(report(), METRICS.efficiency)).toEqual({
      actual: 24_000 / 1750,
      nominal: 15,
    });
    expect(metricSummary(report(0), METRICS.efficiency)).toBeNull();
  });

  it("returns one miner type's average and nominal, and nulls for a type not in the report", () => {
    expect(metricSummary(report(), METRICS.efficiency, "s23")).toEqual({
      actual: 24_000 / 1750,
      nominal: 15,
    });
    expect(metricSummary(report(), METRICS.efficiency, "m70s")).toEqual({
      actual: null,
      nominal: null,
    });
  });
});

describe("statusTrend", () => {
  it("stacks every status, or only the ones asked for", () => {
    expect(statusTrend(report()).series.map((s) => s.label)).toEqual([
      "Online",
      "Error",
      "Offline",
      "Sleep",
      "Maintenance",
    ]);
    expect(statusTrend(report(), ["offline"]).series).toEqual([
      expect.objectContaining({ label: "Offline", values: [1, 1], stack: "status" }),
    ]);
  });
});
