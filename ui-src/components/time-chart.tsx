import type { ChartTooltipConfig } from "@tetherto/mdk-react-devkit";
import { BarChart, buildBarChartOptions, defaultChartOptions } from "@tetherto/mdk-react-devkit";
import { useMemo } from "react";

import type { ChartView } from "../lib/chart-view";
import { fitsValueLabels, valueLabel } from "../lib/chart-view";
import { MISSING } from "../lib/format";

type TimeChartProps = Pick<ChartView, "labels" | "series" | "unit" | "rightUnit"> & {
  stacked?: boolean;
  height?: number;
  formatValue?: (v: number) => string;
  /** Value labels on the bars, where they fit (`fitsValueLabels`), never for a zero. */
  showDataLabels?: boolean;
};

const DASH = [6, 4];

const defaultFormat = (v: number): string =>
  v.toLocaleString("en-US", { maximumFractionDigits: 2 });

/** `options[key]` when it is an object (the builder types its options loosely), else none. */
const objectAt = (options: Record<string, unknown>, key: string): Record<string, unknown> => {
  const v = options[key];
  return typeof v === "object" && v !== null && !Array.isArray(v) ? { ...v } : {};
};

// Minimum gap between date labels: on a long range they'd pack edge to edge.
const LABEL_GAP_PX = 24;

/**
 * Bars and lines over period buckets: one unit per axis, a right axis when a
 * series asks for it. Each axis's unit sits above it, level, not on every tick.
 */
export const TimeChart = ({
  labels,
  series,
  unit,
  rightUnit,
  stacked,
  height = 280,
  formatValue = defaultFormat,
  showDataLabels,
}: TimeChartProps) => {
  const hasRight = series.some((s) => s.axis === "right");
  const data = {
    labels,
    datasets: series.map((s) => {
      const isLine = s.type === "line";
      return {
        label: s.label,
        data: s.values,
        type: s.type ?? "bar",
        backgroundColor: s.color,
        borderColor: s.color,
        borderWidth: isLine ? 2 : 0,
        // Dashed per segment, not with `borderDash`: the legend copies that
        // onto its box and draws it broken.
        segment: s.dashed === true ? { borderDash: () => DASH } : undefined,
        pointRadius: isLine ? 0 : undefined,
        stack: s.stack,
        order: isLine ? 0 : 1,
        yAxisID: s.axis === "right" ? "y1" : "y",
      };
    }),
  };
  const options = useMemo(() => {
    const built = buildBarChartOptions({
      isStacked: stacked,
      yTicksFormatter: formatValue,
      yRightTicksFormatter: hasRight ? defaultFormat : null,
      categoryTicksPadding: LABEL_GAP_PX,
      legendPosition: "bottom",
    });
    // BarChart merges its defaults shallowly, so the builder's legend drops the
    // devkit's own labels: a hidden series dimmed rather than struck through,
    // and swatches filled at 0.2 opacity. Put them back.
    const plugins = objectAt(built, "plugins");
    const legend = objectAt(plugins, "legend");
    return {
      ...built,
      plugins: {
        ...plugins,
        legend: {
          ...legend,
          labels: {
            ...objectAt(legend, "labels"),
            generateLabels: defaultChartOptions.plugins.legend.labels.generateLabels,
          },
        },
      },
    };
  }, [hasRight, stacked, formatValue]);
  // The devkit's tooltip in the app's style, not Chart.js's own: the bucket,
  // then each series' value in its axis's unit.
  const tooltip = useMemo<ChartTooltipConfig>(
    () => ({
      showTitle: true,
      valueFormatter: (_value, item) => {
        const v = item.raw;
        if (typeof v !== "number") return MISSING;
        return series[item.datasetIndex]?.axis === "right"
          ? `${defaultFormat(v)} ${rightUnit ?? ""}`.trim()
          : `${formatValue(v)} ${unit}`;
      },
    }),
    [series, formatValue, unit, rightUnit],
  );
  // Value labels only where they fit, and never a zero: the tooltip has every value.
  const labelled = showDataLabels === true && fitsValueLabels({ labels, series }, stacked === true);
  // Not Chart.js axis titles: those run rotated up the side of the axis.
  const right = hasRight ? rightUnit : undefined;
  return (
    <div className="reporting-time-chart">
      <div className="reporting-time-chart__units">
        <span>{unit}</span>
        {right === undefined ? null : <span>{right}</span>}
      </div>
      <BarChart
        data={data}
        options={options}
        height={height}
        isStacked={stacked}
        showDataLabels={labelled}
        formatDataLabel={(v: number) => valueLabel(formatValue(v))}
        formatYLabel={formatValue}
        tooltip={tooltip}
        legendPosition="bottom"
      />
    </div>
  );
};
