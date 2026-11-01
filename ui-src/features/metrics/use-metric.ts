// The metric pages' hooks: one operations report per period, shaped per view.
import type { QueryView } from "@tetherto/mdk-react-adapter";
import { useCallback } from "react";

import type { MiningUnit, MinerModel, OperationsReport, RangeQuery } from "../../api/contract";
import type { ChartView } from "../../lib/chart-view";
import type { Metric } from "../../lib/metrics";
import { useShaped } from "../../lib/view";
import type { MetricSummary } from "../operations/operations-shape";
import { ALL, metricBreakdown, metricSummary, metricTrend } from "../operations/operations-shape";
import { useOperations } from "../operations/use-operations";

/** The Miner Type and Mining Unit views: the period average per type or unit, and the units to filter by. */
export const useMetricBreakdown = (
  query: RangeQuery,
  metric: Metric,
  by: "model" | "unit",
  only: string = ALL,
): QueryView<{ chart: ChartView }> =>
  useShaped(
    useOperations(query),
    useCallback(
      (r: OperationsReport) => ({ chart: metricBreakdown(r, metric, by, only) }),
      [metric, by, only],
    ),
  );

/** The Site View: the metric over the period and its average, for the site or one miner type. */
export const useSiteMetric = (
  query: RangeQuery,
  metric: Metric,
  model: string = ALL,
): QueryView<{ chart: ChartView; summary: MetricSummary | null }> =>
  useShaped(
    useOperations(query),
    useCallback(
      (r: OperationsReport) => {
        const name = r.models.find((m) => m.id === model)?.displayName;
        const title = name === undefined ? `Site ${metric.label}` : `${name} ${metric.label}`;
        return {
          chart: metricTrend(r, metric, { model, title }),
          summary: metricSummary(r, metric, model),
        };
      },
      [metric, model],
    ),
  );

/** The miner types and mining units a report covers, for the toolbar's filters. */
export const useFleetFilters = (
  query: RangeQuery,
): QueryView<{ models: MinerModel[]; units: MiningUnit[] }> =>
  useShaped(
    useOperations(query),
    useCallback((r: OperationsReport) => ({ models: r.models, units: r.units }), []),
  );
