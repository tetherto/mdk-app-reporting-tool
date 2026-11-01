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
