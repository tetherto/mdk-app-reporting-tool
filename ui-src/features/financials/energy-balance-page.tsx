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
import type { EnergyBalance } from "./energy-balance-shape";
import type { Currency } from "./financials-shape";
import { digitsFor, missingOf, withCostsMissing } from "./financials-shape";
import { useEnergyBalance } from "./use-financials";

const TABS = [
  { value: "revenue", label: "Energy Revenue" },
  { value: "cost", label: "Energy Cost" },
] as const;
type Tab = (typeof TABS)[number]["value"];

const emptyOf = (pick: (d: EnergyBalance) => ChartView) => (d: EnergyBalance) => pick(d).empty;

// The downtime block (curtailment, energy sold, op. issues) shows only with a
// downtime source. None is defined yet, so it is left out and the layout closes.
export const EnergyBalancePage = () => {
  const { site, sources } = useSiteInfo();
  const period = usePeriod(useSearchParams(), site.timezone, { preset: "12m" });
  const [tab, setTab] = useState<Tab>("revenue");
  const [currency, setCurrency] = useState<Currency>("USD");
  const costsMissing = missingOf(["costs"], sources);
  const view = useEnergyBalance(period.query, currency, costsMissing === null);
  const data = view.status === "ready" ? view.data : undefined;
  const revenueMissing = missingOf(["pool", "market"], sources);
  const periodCostsMissing = missingOf(["costs"], sources, data?.report);
  const digits = digitsFor(currency);
  const format = (v: number): string => formatNumber(v, digits);
  const toggle = <CurrencyToggle value={currency} onChange={setCurrency} />;
  const powerWidget = (
    <Widget
      title="Power"
      state={widgetState(
        view,
        emptyOf((d) => d.power),
      )}
    >
      {data === undefined ? null : <TimeChart {...data.power} />}
    </Widget>
  );

  return (
    <Page
      title="Energy Balance"
      headerAction={<SetMonthlyCost />}
      actions={<PeriodControl state={period} timezone={site.timezone} />}
    >
      <ViewTabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "revenue" ? (
        <>
          {data === undefined ? null : <Tiles tiles={data.revenueTiles} />}
          <Widget
            title="Site Energy Revenue"
            state={widgetState(
              view,
              emptyOf((d) => d.revenue),
              revenueMissing,
            )}
            headerAction={toggle}
          >
            {data === undefined ? null : (
              <TimeChart showDataLabels formatValue={format} {...data.revenue} />
            )}
          </Widget>
          {powerWidget}
        </>
      ) : (
        <>
          {data === undefined ? null : (
            <Tiles columns={3} tiles={withCostsMissing(data.costTiles, periodCostsMissing)} />
          )}
          <Widget
            title="Site Revenue vs Cost"
            state={widgetState(
              view,
              emptyOf((d) => d.revenueVsCost),
              revenueMissing,
            )}
            headerAction={toggle}
          >
            {data === undefined ? null : (
              <TimeChart showDataLabels formatValue={format} {...data.revenueVsCost} />
            )}
          </Widget>
          {periodCostsMissing === null ? null : (
            <NotWired source={periodCostsMissing} size="inline" />
          )}
          {powerWidget}
        </>
      )}
    </Page>
  );
};
