// The template the three metric pages share: Site View, Miner Type View and
// Mining Unit View, then the toolbar (period, buckets and the view's filter),
// nominal and the period's average on the Site View, plus any page-specific
// tabs (Energy's Consumption) and Site View extras.
import type { PeriodState } from "@tetherto/mdk-react-adapter";
import { usePeriod } from "@tetherto/mdk-react-adapter";
import {
  PeriodControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@tetherto/mdk-react-devkit";
import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";

import type { RangeQuery } from "../../api/contract";
import { Field, Page, Toolbar } from "../../components/page";
import { TimeChart } from "../../components/time-chart";
import { Widget, widgetState } from "../../components/widget";
import type { ChartView } from "../../lib/chart-view";
import { formatNumber } from "../../lib/format";
import type { Metric } from "../../lib/metrics";
import type { MetricSummary } from "../operations/operations-shape";
import { ALL } from "../operations/operations-shape";
import { useSiteInfo } from "../site/site-gate";
import { useFleetFilters, useMetricBreakdown, useSiteMetric } from "./use-metric";

export type ExtraTab = { id: string; label: string; render: (period: PeriodState) => ReactNode };

type MetricPageProps = {
  title: string;
  metric: Metric;
  /** Next to the Site View chart's title, e.g. what the metric means. */
  titleExtra?: ReactNode;
  /** Rendered under the Site View chart, e.g. Energy's Power Mode table. */
  siteViewExtra?: (period: PeriodState) => ReactNode;
  extraTabs?: ExtraTab[];
};

type Option = { value: string; label: string };

/** A toolbar filter: "All" plus one option per miner type or mining unit. */
const FilterField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) => (
  <Field label={label}>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="reporting-filter">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </Field>
);

const isChartEmpty = (data: { chart: ChartView }): boolean => data.chart.empty;

export const MetricPage = ({
  title,
  metric,
  titleExtra,
  siteViewExtra,
  extraTabs = [],
}: MetricPageProps) => {
  const tz = useSiteInfo().site.timezone;
  const searchParams = useSearchParams();
  const period = usePeriod(searchParams, tz, { preset: "30d" });
  const [params, setParams] = searchParams;
  const view = params.get("view") ?? "site";
  const setView = useCallback(
    (v: string) =>
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set("view", v);
          return p;
        },
        { replace: true },
      ),
    [setParams],
  );
  const [model, setModel] = useState(ALL);
  const [unit, setUnit] = useState(ALL);
  const filters = useFleetFilters(period.query);
  const models = filters.status === "ready" ? filters.data.models : [];
  const units = filters.status === "ready" ? filters.data.units : [];

  const extra = extraTabs.find((t) => t.id === view);
  return (
    <Page title={title}>
      <Tabs value={view} onValueChange={setView}>
        <TabsList>
          <TabsTrigger value="site">Site View</TabsTrigger>
          <TabsTrigger value="type">Miner Type View</TabsTrigger>
          <TabsTrigger value="unit">Mining Unit View</TabsTrigger>
          {extraTabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <Toolbar>
          {/* The breakdowns are averages over the whole period: no buckets. */}
          <PeriodControl
            state={period}
            timezone={tz}
            showGranularity={view !== "type" && view !== "unit"}
          />
          {view === "site" ? (
            <FilterField
              label="Miner Type"
              value={model}
              onChange={setModel}
              options={models.map((m) => ({ value: m.id, label: m.displayName }))}
            />
          ) : null}
          {view === "unit" ? (
            <FilterField
              label="Mining Unit"
              value={unit}
              onChange={setUnit}
              options={units.map((u) => ({ value: u.id, label: u.name }))}
            />
          ) : null}
        </Toolbar>
        <TabsContent value="site">
          <SiteView metric={metric} query={period.query} model={model} titleExtra={titleExtra} />
          {siteViewExtra?.(period)}
        </TabsContent>
        <TabsContent value="type">
          <BreakdownView metric={metric} query={period.query} by="model" only={ALL} />
        </TabsContent>
        <TabsContent value="unit">
          <BreakdownView metric={metric} query={period.query} by="unit" only={unit} />
        </TabsContent>
        {extra === undefined ? null : (
          <TabsContent value={extra.id}>{extra.render(period)}</TabsContent>
        )}
      </Tabs>
    </Page>
  );
};

/** The period's average, as the design highlights it over the Site View chart. */
const Average = ({ metric, summary }: { metric: Metric; summary: MetricSummary | null }) => {
  const actual = summary?.actual ?? null;
  if (actual === null) return null;
  const { unit, factor } = metric.unitFor(actual);
  return (
    <div className="reporting-highlight">
      <span className="reporting-highlight__label">Average {metric.label}</span>
      <span>
        <span className="reporting-highlight__value">{formatNumber(actual / factor, 2)}</span>{" "}
        <span className="reporting-highlight__unit">{unit}</span>
      </span>
    </div>
  );
};

const SiteView = ({
  metric,
  query,
  model,
  titleExtra,
}: {
  metric: Metric;
  query: RangeQuery;
  model: string;
  titleExtra?: ReactNode;
}) => {
  const view = useSiteMetric(query, metric, model);
  return (
    <Widget
      title={`Site ${metric.label}`}
      titleExtra={titleExtra}
      state={widgetState(view, isChartEmpty)}
    >
      {view.status === "ready" ? (
        <>
          <Average metric={metric} summary={view.data.summary} />
          <TimeChart {...view.data.chart} />
        </>
      ) : null}
    </Widget>
  );
};

const formatBar = (v: number): string => formatNumber(v, 2);

const BreakdownView = ({
  metric,
  query,
  by,
  only,
}: {
  metric: Metric;
  query: RangeQuery;
  by: "model" | "unit";
  only: string;
}) => {
  const view = useMetricBreakdown(query, metric, by, only);
  const title = `${metric.label} by ${by === "model" ? "Miner Type" : "Mining Unit"}`;
  return (
    <Widget title={title} state={widgetState(view, isChartEmpty)}>
      {view.status === "ready" ? (
        <>
          <p className="reporting-note">Average over the selected period.</p>
          <TimeChart showDataLabels formatValue={formatBar} {...view.data.chart} />
        </>
      ) : null}
    </Widget>
  );
};
