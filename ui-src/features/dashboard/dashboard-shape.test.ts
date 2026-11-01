import { describe, expect, it } from "vitest";

import { report } from "../operations/report-fixture";
import { toDashboardCharts } from "./dashboard-shape";

describe("toDashboardCharts", () => {
  it("shapes the four panels from one report, power without a nominal line", () => {
    const charts = toDashboardCharts(report());

    expect(charts.hashrate.series.map((s) => s.label)).toEqual(["Hashrate", "Nominal Hashrate"]);
    expect(charts.power.series.map((s) => s.label)).toEqual(["Power Consumption"]);
    expect(charts.power.unit).toBe("kW");
    expect(charts.efficiency.unit).toBe("W/TH/s");
    expect(charts.status.series).toHaveLength(5);
    expect(charts.empty).toBe(false);
  });

  it("is empty with no buckets", () => {
    expect(toDashboardCharts(report(0)).empty).toBe(true);
  });
});
