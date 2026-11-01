import { METRICS } from "../../lib/metrics";
import { MetricPage } from "./metric-page";

export const HashratePage = () => <MetricPage title="Hashrate" metric={METRICS.hashrate} />;
