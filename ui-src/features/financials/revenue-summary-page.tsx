import { usePeriod } from "@tetherto/mdk-react-adapter";
import type { BitcoinUnit } from "@tetherto/mdk-react-devkit";
import {
  BITCOIN_UNITS,
  CurrencyToggler,
  DoughnutChart,
  PeriodControl,
} from "@tetherto/mdk-react-devkit";
import { useState } from "react";
import { useSearchParams } from "react-router";

import { Page } from "../../components/page";
import { Tiles } from "../../components/tiles";
import { TimeChart } from "../../components/time-chart";
import { BitcoinUnitField } from "../../components/unit-toggles";
import { Widget, widgetState } from "../../components/widget";
import { formatBitcoin, formatNumber } from "../../lib/format";
import { useSiteInfo } from "../site/site-gate";
import { missingOf } from "./financials-shape";
import type { RevenueChartUnit, RevenueSummary } from "./revenue-summary-shape";
import { isRevenueChartUnit, REVENUE_CHART_UNITS } from "./revenue-summary-shape";
import { useRevenueSummary } from "./use-financials";

const chartEmpty = (d: { chart: { empty: boolean } }): boolean => d.chart.empty;
const splitEmpty = (d: RevenueSummary): boolean => d.split === null;

export const RevenueSummaryPage = () => {
  const { site, sources } = useSiteInfo();
  const period = usePeriod(useSearchParams(), site.timezone, { preset: "12m" });
  const [unit, setUnit] = useState<BitcoinUnit>("BTC");
  const [chartUnit, setChartUnit] = useState<RevenueChartUnit>("BTC");
  const view = useRevenueSummary(period.query, unit, chartUnit);
  const data = view.status === "ready" ? view.data : undefined;
  const poolMissing = missingOf(["pool"], sources);
  // Payouts but no split: the pool doesn't report one and there is no fee share for those days.
  const splitMissing =
    poolMissing ?? (data !== undefined && !data.empty && data.split === null ? "split" : null);

  return (
    <Page
      title="Revenue Summary"
      actions={
        <>
          <PeriodControl state={period} timezone={site.timezone} />
          <BitcoinUnitField value={unit} onChange={setUnit} />
        </>
      }
    >
      {data === undefined ? null : <Tiles columns={3} tiles={data.totals} />}
      <Widget
        title="Mining Revenue"
        state={widgetState(view, chartEmpty, poolMissing)}
        headerAction={
          <CurrencyToggler
            currencies={REVENUE_CHART_UNITS.map((u) => ({ value: u.value, label: u.label }))}
            value={chartUnit}
            onChange={(v) => {
              if (isRevenueChartUnit(v)) setChartUnit(v);
            }}
          />
        }
      >
        {data === undefined ? null : (
          <TimeChart showDataLabels formatValue={formatChartValue(chartUnit)} {...data.chart} />
        )}
      </Widget>
      <div className="reporting-split">
        <Widget title="Subsidy / Fees" state={widgetState(view, splitEmpty, splitMissing)}>
          {data?.split == null ? null : (
            <DoughnutChart
              data={data.split.slices}
              legendPosition="bottom"
              formatValue={(btc: number) => formatBitcoin(btc, data.split?.unit ?? unit)}
            />
          )}
        </Widget>
        {data === undefined ? null : <Tiles columns={2} tiles={data.metrics} />}
      </div>
    </Page>
  );
};

/** Bar labels in the chart's unit: BTC to two places, sats and USD whole. */
const formatChartValue =
  (unit: RevenueChartUnit) =>
  (v: number): string =>
    formatNumber(v, unit === BITCOIN_UNITS.BTC ? 2 : 0);
