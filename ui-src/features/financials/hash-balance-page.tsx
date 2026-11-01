import { usePeriod } from "@tetherto/mdk-react-adapter";
import { PeriodControl } from "@tetherto/mdk-react-devkit";
import { useState } from "react";
import { useSearchParams } from "react-router";

import { Page } from "../../components/page";
import { SetMonthlyCost } from "../../components/set-monthly-cost";
import { Tiles } from "../../components/tiles";
import { TimeChart } from "../../components/time-chart";
import { CurrencyToggle } from "../../components/unit-toggles";
import { ViewTabs } from "../../components/view-tabs";
import { NotWired, Widget, widgetState } from "../../components/widget";
import type { ChartView } from "../../lib/chart-view";
import { formatNumber } from "../../lib/format";
import { useSiteInfo } from "../site/site-gate";
import type { Currency } from "./financials-shape";
import { digitsFor, missingOf, withCostsMissing } from "./financials-shape";
import type { HashBalance } from "./hash-balance-shape";
import { useHashBalance } from "./use-financials";

const TABS = [
  { value: "revenue", label: "Hash Revenue" },
  { value: "cost", label: "Hash Cost" },
] as const;
type Tab = (typeof TABS)[number]["value"];

const emptyOf = (pick: (d: HashBalance) => ChartView) => (d: HashBalance) => pick(d).empty;

export const HashBalancePage = () => {
  const { site, sources } = useSiteInfo();
  const period = usePeriod(useSearchParams(), site.timezone, { preset: "12m" });
  const [tab, setTab] = useState<Tab>("revenue");
  const [currency, setCurrency] = useState<Currency>("USD");
  const costsMissing = missingOf(["costs"], sources);
  const view = useHashBalance(period.query, currency, costsMissing === null);
  const data = view.status === "ready" ? view.data : undefined;
  const revenueMissing = missingOf(["pool", "market"], sources);
  const marketMissing = missingOf(["market"], sources);
  // A period with costs missing for some of its months shows hash cost as not wired.
  const periodCostsMissing = missingOf(["costs"], sources, data?.report);
  const digits = digitsFor(currency);
  const format = (v: number): string => formatNumber(v, digits);
  const toggle = <CurrencyToggle value={currency} onChange={setCurrency} />;

  return (
    <Page
      title="Hash Balance"
      headerAction={<SetMonthlyCost />}
      actions={<PeriodControl state={period} timezone={site.timezone} />}
    >
      <ViewTabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "revenue" ? (
        <>
          <Widget
            title="Site Hash Revenue"
            state={widgetState(
              view,
              emptyOf((d) => d.siteRevenue),
              revenueMissing,
            )}
            headerAction={toggle}
          >
            {data === undefined ? null : (
              <TimeChart showDataLabels formatValue={format} {...data.siteRevenue} />
            )}
          </Widget>
          <div className="reporting-hash-grid">
            {data === undefined ? (
              <div />
            ) : (
              <Tiles columns={2} tiles={data.revenueTiles} className="reporting-hash-grid__tiles" />
            )}
            <Widget
              title="Network Hashrate"
              className="reporting-hash-grid__hashrate"
              state={widgetState(
                view,
                emptyOf((d) => d.networkHashrate),
                marketMissing,
              )}
            >
              {data === undefined ? null : <TimeChart height={200} {...data.networkHashrate} />}
            </Widget>
            <Widget
              title="Bitcoin Network Hashprice"
              className="reporting-hash-grid__hashprice"
              state={widgetState(
                view,
                emptyOf((d) => d.networkHashprice),
                marketMissing,
              )}
            >
              {data === undefined ? null : (
                <TimeChart height={340} formatValue={format} {...data.networkHashprice} />
              )}
            </Widget>
          </div>
        </>
      ) : (
        <>
          {data === undefined ? null : (
            <Tiles tiles={withCostsMissing(data.costTiles, periodCostsMissing)} />
          )}
          <Widget
            title="Cost / Revenue / Network Hashprice"
            state={widgetState(
              view,
              emptyOf((d) => d.costRevenueNetwork),
              revenueMissing,
            )}
            headerAction={toggle}
          >
            {data === undefined ? null : (
              <TimeChart formatValue={format} {...data.costRevenueNetwork} />
            )}
          </Widget>
          {periodCostsMissing === null ? null : (
            <NotWired source={periodCostsMissing} size="inline" />
          )}
        </>
      )}
    </Page>
  );
};
