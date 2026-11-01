// What the operations charts render, shaped from the report: pure functions,
// run once per response by the feature hooks.
import type { MinerStatus, OperationsReport, ReportRange } from "../../api/contract";
import { MINER_STATUSES } from "../../api/contract";
import type { ChartSeries, ChartView } from "../../lib/chart-view";
import { COLORS, seriesColor } from "../../lib/colors";
import { bucketLabel } from "../../lib/format";
import type { Metric } from "../../lib/metrics";
import { maxOf, scaleAll } from "../../lib/metrics";

/** Filter value meaning every miner type or every mining unit. */
export const ALL = "all";

/** Each bucket's label in the site's timezone. */
export const bucketLabels = (report: {
  range: ReportRange;
  buckets: Array<{ ts: number }>;
}): string[] =>
  report.buckets.map((b) => bucketLabel(b.ts, report.range.granularity, report.range.timezone));

type TrendOptions = { model?: string; title?: string; withNominal?: boolean };

/** A metric and (optionally) its nominal value over the period, for the site or one miner type. */
export function metricTrend(
  report: OperationsReport,
  metric: Metric,
  options: TrendOptions = {},
): ChartView {
  const model = options.model ?? ALL;
  const title = options.title ?? metric.label;
  const withNominal = options.withNominal ?? true;

  const actual = report.buckets.map((b) =>
    model === ALL ? metric.cut(b).site : (metric.cut(b).byModel[model] ?? null),
  );
  const nominal = report.buckets.map((b) => {
    if (model === ALL) return metric.nominal(b.nominal);
    const figures = b.nominal.byModel[model];
    return figures === undefined ? null : metric.nominal(figures);
  });
  const { unit, factor } = metric.unitFor(maxOf(withNominal ? [...actual, ...nominal] : actual));

  const series: ChartSeries[] = [
    { label: title, values: scaleAll(actual, factor), color: COLORS.actual, type: "line" },
  ];
  if (withNominal)
    series.push({
      label: `Nominal ${title}`,
      values: scaleAll(nominal, factor),
      color: COLORS.nominal,
      type: "line",
      dashed: true,
    });
  return { labels: bucketLabels(report), unit, series, empty: report.buckets.length === 0 };
}

/** The metric's period average per miner type or per mining unit (`only` keeps one unit). */
export function metricBreakdown(
  report: OperationsReport,
  metric: Metric,
  by: "model" | "unit",
  only: string = ALL,
): ChartView {
  const items =
    by === "model"
      ? report.models.map((m) => ({ id: m.id, label: m.displayName }))
      : report.units
          .filter((u) => only === ALL || u.id === only)
          .map((u) => ({ id: u.id, label: u.name }));
  const cut = report.summary === null ? null : metric.cut(report.summary);
  const values = items.map((i) => {
    if (cut === null) return null;
    return (by === "model" ? cut.byModel[i.id] : cut.byUnit[i.id]) ?? null;
  });
  const { unit, factor } = metric.unitFor(maxOf(values));
  return {
    labels: items.map((i) => i.label),
    unit,
    series: [{ label: metric.label, values: scaleAll(values, factor), color: seriesColor(0) }],
    empty: report.summary === null,
  };
}

/** The metric's site average and nominal value over the whole period. */
export type MetricSummary = { actual: number | null; nominal: number | null };

/** The metric over the whole period, for the site or one miner type; null with no samples. */
export function metricSummary(
  report: OperationsReport,
  metric: Metric,
  model: string = ALL,
): MetricSummary | null {
  const s = report.summary;
  if (s === null) return null;
  if (model === ALL) return { actual: metric.cut(s).site, nominal: metric.nominal(s.nominal) };
  const nominal = s.nominal.byModel[model];
  return {
    actual: metric.cut(s).byModel[model] ?? null,
    nominal: nominal === undefined ? null : metric.nominal(nominal),
  };
}

export const STATUS_LABELS: Record<MinerStatus, string> = {
  online: "Online",
  error: "Error",
  offline: "Offline",
  sleep: "Sleep",
  maintenance: "Maintenance",
};

/** Average miners in each status per bucket, stacked. `only` limits the series (Miners page tabs). */
export const statusTrend = (
  report: OperationsReport,
  only: readonly MinerStatus[] = MINER_STATUSES,
): ChartView => ({
  labels: bucketLabels(report),
  unit: "miners",
  series: only.map((s) => ({
    label: STATUS_LABELS[s],
    values: report.buckets.map((b) => b.status[s]),
    color: COLORS[s],
    stack: "status",
  })),
  empty: report.buckets.length === 0,
});
