import { usePeriod } from "@tetherto/mdk-react-adapter";
import { OperationsEnergyCostChart, PeriodControl } from "@tetherto/mdk-react-devkit";
import { useSearchParams } from "react-router";

import { Page } from "../../components/page";
import { SetMonthlyCost } from "../../components/set-monthly-cost";
import { Tiles } from "../../components/tiles";
import { TimeChart } from "../../components/time-chart";
import { Widget, widgetState } from "../../components/widget";
import { formatNumber } from "../../lib/format";
import { useSiteInfo } from "../site/site-gate";
import type { CostSummary } from "./cost-summary-shape";
import { missingOf, withCostsMissing } from "./financials-shape";
import { useCostSummary } from "./use-financials";

const productionEmpty = (d: CostSummary): boolean => d.productionCost.empty;
const allInEmpty = (d: CostSummary): boolean => d.allInCost.empty;

export const CostSummaryPage = () => {
  const { site, sources } = useSiteInfo();
  const period = usePeriod(useSearchParams(), site.timezone, { preset: "12m" });
  const view = useCostSummary(period.query);
  const data = view.status === "ready" ? view.data : undefined;
  // With no costs entered every cost widget points to Cost Input.
  const missing = missingOf(["costs"], sources, data?.report);
  return (
    <Page
      title="Cost Summary"
      headerAction={<SetMonthlyCost />}
      actions={<PeriodControl state={period} timezone={site.timezone} />}
    >
      <Widget title="Production Cost / Price" state={widgetState(view, productionEmpty, missing)}>
        {data === undefined ? null : (
          <TimeChart showDataLabels formatValue={formatK} {...data.productionCost} />
        )}
      </Widget>
      <div className="reporting-costs-row">
        {missing === null ? (
          <div className="reporting-card">
            <OperationsEnergyCostChart
              data={data?.split ?? undefined}
              isLoading={view.status === "loading"}
              title="Operations / Energy Cost"
            />
          </div>
        ) : (
          // The devkit chart has no not-wired state: the card keeps its title over the message.
          <Widget
            title="Operations / Energy Cost"
            state={{ kind: "not-wired", source: missing }}
            notWiredSize="short"
          />
        )}
        {data === undefined ? (
          <div />
        ) : (
          <Tiles columns={1} tiles={withCostsMissing(data.tiles, missing)} />
        )}
        <Widget title="Avg All-in Cost" state={widgetState(view, allInEmpty, missing)}>
          {data === undefined ? null : <TimeChart height={220} {...data.allInCost} />}
        </Widget>
      </div>
    </Page>
  );
};

const formatK = (v: number): string => formatNumber(v, 1);
