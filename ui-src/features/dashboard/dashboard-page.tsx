import { usePeriod } from "@tetherto/mdk-react-adapter";
import { PeriodControl } from "@tetherto/mdk-react-devkit";
import { useSearchParams } from "react-router";
import { EfficiencyInfo } from "../../components/efficiency-info";
import { Page } from "../../components/page";
import { TimeChart } from "../../components/time-chart";
import { Widget, widgetState } from "../../components/widget";
import { formatNumber } from "../../lib/format";
import { useSiteInfo } from "../site/site-gate";
import type { DashboardCharts } from "./dashboard-shape";
import { useDashboard } from "./use-dashboard";

const formatCount = (v: number): string => formatNumber(v, 0);
const isEmpty = (charts: DashboardCharts): boolean => charts.empty;

export const DashboardPage = () => {
  const tz = useSiteInfo().site.timezone;
  const period = usePeriod(useSearchParams(), tz, { preset: "30d" });
  const view = useDashboard(period.query);
  const state = widgetState(view, isEmpty);
  const charts = view.status === "ready" ? view.data : undefined;
  return (
    <Page title="Dashboard" actions={<PeriodControl state={period} timezone={tz} />}>
      <div className="reporting-grid">
        <Widget title="Hashrate" state={state} expandable>
          {charts === undefined ? null : <TimeChart height={240} {...charts.hashrate} />}
        </Widget>
        <Widget title="Power Consumption" state={state} expandable>
          {charts === undefined ? null : <TimeChart height={240} {...charts.power} />}
        </Widget>
        <Widget title="Site Efficiency" state={state} expandable titleExtra={<EfficiencyInfo />}>
          {charts === undefined ? null : <TimeChart height={240} {...charts.efficiency} />}
        </Widget>
        <Widget title="Miners Status" state={state} expandable>
          {charts === undefined ? null : (
            <TimeChart stacked formatValue={formatCount} {...charts.status} />
          )}
        </Widget>
      </div>
    </Page>
  );
};
