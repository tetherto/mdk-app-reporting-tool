import type { CsvValue } from "@tetherto/mdk-ui-foundation";
import type { ConsumptionReport } from "../../api/contract";
import type { ChartSeries, ChartView } from "../../lib/chart-view";
import { COLORS, seriesColor } from "../../lib/colors";
import { ENERGY_UNIT } from "../../lib/format";
import { bucketLabels } from "../operations/operations-shape";

/** One table row: the period, the site meter total and MWh per meter id. */
export type ConsumptionRow = {
  ts: number;
  period: string;
  site: number | null;
  byMeter: Record<string, number | null>;
};

/** Energy per meter: the stacked chart, the table rows behind it, and the report (for the CSV). */
export type ConsumptionTable = {
  chart: ChartView;
  rows: ConsumptionRow[];
  report: ConsumptionReport;
};

export function toConsumptionTable(report: ConsumptionReport): ConsumptionTable {
  const labels = bucketLabels(report);
  const series: ChartSeries[] = report.meters.map((m, i) => ({
    label: m.label,
    values: report.buckets.map((b) => b.byMeter[m.id] ?? null),
    color: seriesColor(i),
    stack: "meters",
  }));
  if (report.siteMeter !== null)
    series.push({
      label: report.siteMeter.label,
      values: report.buckets.map((b) => b.siteMeterMWh),
      color: COLORS.nominal,
      stack: "site",
    });
  return {
    report,
    rows: report.buckets.map((b, i) => ({
      ts: b.ts,
      period: labels[i] ?? "",
      site: b.siteMeterMWh,
      byMeter: b.byMeter,
    })),
    chart: { labels, unit: ENERGY_UNIT, series, empty: report.buckets.length === 0 },
  };
}

/** The CSV of the current view, as rows for MDK's toCsv / downloadCsv. */
export type ConsumptionCsv = { columns: string[]; rows: Array<Record<string, CsvValue>> };

/** CSV of the current view: Period (ISO), the site meter total (when one is configured), one column per meter, in MWh. */
export function toConsumptionCsv(table: ConsumptionTable): ConsumptionCsv {
  const { report, rows } = table;
  const meters = report.meters.map((m) => ({ id: m.id, column: `${m.label} (MWh)` }));
  const site = report.siteMeter === null ? null : `${report.siteMeter.label} (MWh)`;
  const columns = ["Period", ...(site === null ? [] : [site]), ...meters.map((m) => m.column)];
  return {
    columns,
    rows: rows.map((r) => {
      const row: Record<string, CsvValue> = { Period: new Date(r.ts).toISOString() };
      if (site !== null) row[site] = r.site;
      for (const m of meters) row[m.column] = r.byMeter[m.id];
      return row;
    }),
  };
}
