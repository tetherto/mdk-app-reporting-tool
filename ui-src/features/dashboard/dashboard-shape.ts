import type { OperationsReport } from "../../api/contract";
import type { ChartView } from "../../lib/chart-view";
import { METRICS } from "../../lib/metrics";
import { metricTrend, statusTrend } from "../operations/operations-shape";

/** The Dashboard: three metric trends and the status trend, from one report. */
export type DashboardCharts = {
  hashrate: ChartView;
  power: ChartView;
  efficiency: ChartView;
  status: ChartView;
  empty: boolean;
};

export const toDashboardCharts = (report: OperationsReport): DashboardCharts => ({
  hashrate: metricTrend(report, METRICS.hashrate, { title: "Hashrate" }),
  power: metricTrend(report, METRICS.power, { title: "Power Consumption", withNominal: false }),
  efficiency: metricTrend(report, METRICS.efficiency, { title: "Site Efficiency" }),
  status: statusTrend(report),
  empty: report.buckets.length === 0,
});
