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
import { formatBitcoin, formatNumber, isBitcoinUnit } from "../../lib/format";
import { useSiteInfo } from "../site/site-gate";
import { missingOf } from "./financials-shape";
import type { RevenueChartUnit, RevenueSummary, UsdChartUnit } from "./revenue-summary-shape";
import { isUsdChartUnit, REVENUE_CHART_UNITS } from "./revenue-summary-shape";
import { useRevenueSummary } from "./use-financials";

const chartEmpty = (d: { chart: { empty: boolean } }): boolean => d.chart.empty;
const splitEmpty = (d: RevenueSummary): boolean => d.split === null;

export const RevenueSummaryPage = () => {
  const { site, sources } = useSiteInfo();
  const period = usePeriod(useSearchParams(), site.timezone, { preset: "12m" });
  // One bitcoin unit for the page's Bitcoin Unit and the chart's toggle, so
  // either one changes both. The chart can show USD instead, at one of two prices.
  const [unit, setUnit] = useState<BitcoinUnit>("BTC");
  const [usd, setUsd] = useState<UsdChartUnit | null>(null);
  const chartUnit: RevenueChartUnit = usd ?? unit;
  const onUnit = (u: BitcoinUnit) => {
    setUnit(u);
    setUsd(null);
  };
  const onChartUnit = (v: string) => {
    if (isBitcoinUnit(v)) onUnit(v);
    else if (isUsdChartUnit(v)) setUsd(v);
  };
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
          <BitcoinUnitField value={unit} onChange={onUnit} />
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
            onChange={onChartUnit}
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
            // A 1px gap, not the devkit's 4px: the border is drawn over each
            // slice, and covered a small one (fees at 0.5% of revenue) whole.
            <DoughnutChart
              data={data.split.slices}
              borderWidth={1}
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
