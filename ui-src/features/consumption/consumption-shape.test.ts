import { describe, expect, it } from "vitest";

import type { ConsumptionReport } from "../../api/contract";
import { toCsv } from "@tetherto/mdk-ui-foundation";

import { toConsumptionCsv, toConsumptionTable } from "./consumption-shape";

const T0 = Date.UTC(2026, 9, 20);
const DAY = 86_400_000;

const report: ConsumptionReport = {
  range: { start: T0, end: T0 + 2 * DAY, granularity: "day", timezone: "UTC" },
  meters: [
    { id: "pm-01", label: "PM-01" },
    { id: "pm-02", label: 'PM "two", west' },
  ],
  siteMeter: { id: "pm-site", label: "Site meter" },
  buckets: [
    { ts: T0, byMeter: { "pm-01": 1.5, "pm-02": 2 }, siteMeterMWh: 3.6 },
    { ts: T0 + DAY, byMeter: { "pm-01": null, "pm-02": 2.1 }, siteMeterMWh: null },
  ],
};

describe("toConsumptionTable", () => {
  it("stacks the meters and keeps the site meter apart", () => {
    const { chart, rows } = toConsumptionTable(report);

    expect(chart.unit).toBe("MWh");
    expect(chart.series.map((s) => [s.label, s.stack])).toEqual([
      ["PM-01", "meters"],
      ['PM "two", west', "meters"],
      ["Site meter", "site"],
    ]);
    expect(rows[1]).toEqual({
      ts: T0 + DAY,
      period: "Oct 21",
      site: null,
      byMeter: { "pm-01": null, "pm-02": 2.1 },
    });
  });

  it("leaves the site meter out when none is configured, and a meter missing from a bucket blank", () => {
    const noSite: ConsumptionReport = {
      ...report,
      siteMeter: null,
      buckets: [{ ts: T0, byMeter: { "pm-01": 1.5 }, siteMeterMWh: null }],
    };
    const table = toConsumptionTable(noSite);

    expect(table.chart.series.map((s) => [s.label, s.values])).toEqual([
      ["PM-01", [1.5]],
      ['PM "two", west', [null]],
    ]);
    expect(toConsumptionCsv(table).columns).toEqual([
      "Period",
      "PM-01 (MWh)",
      'PM "two", west (MWh)',
    ]);
  });
});

describe("toConsumptionCsv", () => {
  it("writes ISO periods, the site meter first, blanks for missing values and quotes where needed", () => {
    const { rows, columns } = toConsumptionCsv(toConsumptionTable(report));
    expect(toCsv(rows, columns).split("\n")).toEqual([
      'Period,Site meter (MWh),PM-01 (MWh),"PM ""two"", west (MWh)"',
      "2026-10-20T00:00:00.000Z,3.6,1.5,2",
      "2026-10-21T00:00:00.000Z,,,2.1",
    ]);
  });
});
