import { EfficiencyInfo } from "../../components/efficiency-info";
import { METRICS } from "../../lib/metrics";
import { MetricPage } from "./metric-page";

export const EfficiencyPage = () => (
  <MetricPage title="Efficiency" metric={METRICS.efficiency} titleExtra={<EfficiencyInfo />} />
);
