import { BarChart, buildBarChartOptions } from "@tetherto/mdk-react-devkit";
import { useMemo } from "react";

import type { ChartView } from "../lib/chart-view";

type TimeChartProps = Pick<ChartView, "labels" | "series" | "unit" | "rightUnit"> & {
  stacked?: boolean;
  height?: number;
  formatValue?: (v: number) => string;
  showDataLabels?: boolean;
};

const DASH = [6, 4];

const defaultFormat = (v: number): string =>
  v.toLocaleString("en-US", { maximumFractionDigits: 2 });

// Minimum gap between date labels: on a long range they'd pack edge to edge.
const LABEL_GAP_PX = 24;

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;

/**
 * Date labels kept level: buildBarChartOptions leaves the category axis free
 * to rotate, where the devkit's default chart options don't (docs/mdk-friction.md).
 */
const levelLabels = (options: Record<string, unknown>): Record<string, unknown> => {
  const scales = isRecord(options.scales) ? options.scales : {};
  const x = isRecord(scales.x) ? scales.x : {};
  const ticks = isRecord(x.ticks) ? x.ticks : {};
  return { ...options, scales: { ...scales, x: { ...x, ticks: { ...ticks, maxRotation: 0 } } } };
};

/**
 * Bars and lines over period buckets: one unit per axis, a right axis when a
 * series asks for it. Each axis's unit is its title, not on every tick.
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
  const options = useMemo(
    () =>
      levelLabels(
        buildBarChartOptions({
          isStacked: stacked,
          yTicksFormatter: formatValue,
          yRightTicksFormatter: hasRight ? defaultFormat : null,
          yUnit: unit,
          yRightUnit: hasRight ? rightUnit : undefined,
          categoryTicksPadding: LABEL_GAP_PX,
          legendPosition: "bottom",
        }),
      ),
    [hasRight, stacked, formatValue, unit, rightUnit],
  );
  return (
    <BarChart
      data={data}
      options={options}
      height={height}
      isStacked={stacked}
      showDataLabels={showDataLabels}
      formatDataLabel={formatValue}
      formatYLabel={formatValue}
      legendPosition="bottom"
    />
  );
};
