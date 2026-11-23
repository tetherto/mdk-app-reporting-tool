/** One series of a TimeChart, already scaled to the chart's unit. */
export type ChartSeries = {
  label: string;
  values: Array<number | null>;
  color: string;
  /** Line series draw over the bars, e.g. a nominal value. */
  type?: "bar" | "line";
  /** Bars with the same stack id stack; others sit side by side. */
  stack?: string;
  dashed?: boolean;
  /** Plotted against the right axis, in the chart's `rightUnit`. */
  axis?: "right";
};

/**
 * One chart: x labels, its unit, and the series. `rightUnit` is the unit of the
 * series on the right axis, if any. `empty` when there is nothing to plot.
 */
export type ChartView = {
  labels: string[];
  unit: string;
  rightUnit?: string;
  series: ChartSeries[];
  empty: boolean;
};

/**
 * The most value labels a chart prints: a year of monthly bars, which for a
 * rolling year (Last 12 months) is the 13 months it touches. More run together.
 */
export const MAX_LABELLED_BARS = 13;

/**
 * Whether a chart's bars have room for a value label each: few enough buckets
 * times the bars side by side in each (one per stack when stacked, else one
 * per bar series; lines carry no labels). Dense charts leave values to the
 * tooltip.
 */
export const fitsValueLabels = (
  view: Pick<ChartView, "labels" | "series">,
  stacked: boolean,
): boolean => {
  const bars = view.series.filter((s) => s.type !== "line");
  const perBucket = stacked ? new Set(bars.map((s) => s.stack ?? "")).size : bars.length;
  return view.labels.length * perBucket <= MAX_LABELLED_BARS;
};

/** A bar's value label, or none for a zero or a value that rounds to zero ("0", "0.00"). */
export const valueLabel = (text: string): string => (/[1-9]/.test(text) ? text : "");
