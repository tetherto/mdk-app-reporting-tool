import { usePeriod } from "@tetherto/mdk-react-adapter";
import type { BitcoinUnit } from "@tetherto/mdk-react-devkit";
import { PeriodControl } from "@tetherto/mdk-react-devkit";
import { useState } from "react";
import { useSearchParams } from "react-router";

import { Page } from "../../components/page";
import { TimeChart } from "../../components/time-chart";
import { BitcoinUnitField } from "../../components/unit-toggles";
import { Widget, widgetState } from "../../components/widget";
import { formatNumber } from "../../lib/format";
import { useSiteInfo } from "../site/site-gate";
import { missingOf } from "./financials-shape";
import { useSubsidyFee } from "./use-financials";

// Fee rates sit near 1 sat/vB lately: whole numbers would collapse the axis.
const formatRate = (v: number): string => formatNumber(v, 2);
const splitEmpty = (d: { chart: { empty: boolean } }): boolean => d.chart.empty;
const feeRateEmpty = (d: { feeRate: { empty: boolean } }): boolean => d.feeRate.empty;

export const SubsidyFeePage = () => {
  const { site, sources } = useSiteInfo();
  const period = usePeriod(useSearchParams(), site.timezone, { preset: "12m" });
  const [unit, setUnit] = useState<BitcoinUnit>("BTC");
  const view = useSubsidyFee(period.query, unit);
  const data = view.status === "ready" ? view.data : undefined;
  // Only the pool's own split: the network's estimate isn't shown here.
  const missing = missingOf(["pool", "poolSplit"], sources, data?.report);
  // Stacked bars carry no value labels: the devkit labels a stack with its top
  // segment's value, which here would read as the total.
  return (
    <Page
      title="Subsidy / Fee"
      actions={
        <>
          <PeriodControl state={period} timezone={site.timezone} />
          <BitcoinUnitField value={unit} onChange={setUnit} />
        </>
      }
    >
      <Widget title="Subsidy / Fees" state={widgetState(view, splitEmpty, missing)}>
        {data === undefined ? null : <TimeChart stacked {...data.chart} />}
      </Widget>
      <Widget
        title="Average Fees in sats/vB"
        state={widgetState(view, feeRateEmpty, missingOf(["market"], sources))}
      >
        {data === undefined ? null : (
          <TimeChart showDataLabels formatValue={formatRate} {...data.feeRate} />
        )}
      </Widget>
    </Page>
  );
};
