import type { QueryView } from "@tetherto/mdk-react-adapter";
import { usePeriod } from "@tetherto/mdk-react-adapter";
import {
  Button,
  DoughnutChart,
  EmptyState,
  ErrorCard,
  Loader,
  PeriodControl,
} from "@tetherto/mdk-react-devkit";
import { useState } from "react";
import { useSearchParams } from "react-router";

import { MINER_STATUSES } from "../../api/contract";
import { Page } from "../../components/page";
import { TimeChart } from "../../components/time-chart";
import { Widget, widgetState } from "../../components/widget";
import type { ChartView } from "../../lib/chart-view";
import { formatNumber } from "../../lib/format";
import { useSiteInfo } from "../site/site-gate";
import type { MinerSlices, MinersTab } from "./miners-shape";
import { MINERS_TAB_SPECS, MINERS_TABS } from "./miners-shape";
import { SnapshotBar } from "./snapshot-bar";
import { useMinerSlices, useMinerStatusTrend } from "./use-miners-snapshot";

const formatCount = (v: number): string => formatNumber(v, 0);
const chartEmpty = (c: ChartView): boolean => c.empty;

export const MinersPage = () => {
  const tz = useSiteInfo().site.timezone;
  const period = usePeriod(useSearchParams(), tz, { preset: "30d" });
  const [tab, setTab] = useState<MinersTab>("all");
  const spec = MINERS_TAB_SPECS[tab];
  const slicesView = useMinerSlices(tab);
  const statuses = spec.statuses ?? MINER_STATUSES;
  const statusView = useMinerStatusTrend(period.query, statuses);
  const ts = slicesView.status === "ready" ? slicesView.data.ts : undefined;

  return (
    <Page title="Miners" actions={<PeriodControl state={period} timezone={tz} />}>
      <SnapshotBar ts={ts} timezone={tz} subject="Miner counts" />
      <div className="reporting-panel">
        <div className="reporting-panel__tabs" role="group" aria-label="Miners shown">
          {MINERS_TABS.map((t) => (
            <Button
              key={t}
              variant="secondary"
              aria-pressed={t === tab}
              className={t === tab ? "reporting-pill reporting-pill--active" : "reporting-pill"}
              onClick={() => setTab(t)}
            >
              {MINERS_TAB_SPECS[t].label}
            </Button>
          ))}
        </div>
        <MinerTypes view={slicesView} total={spec.total} />
      </div>
      <Widget title="Miner Status" state={widgetState(statusView, chartEmpty)}>
        {statusView.status === "ready" ? (
          <TimeChart stacked formatValue={formatCount} {...statusView.data} />
        ) : null}
      </Widget>
    </Page>
  );
};

/** The snapshot's miners per type: the total, each type's share, and the doughnut. */
const MinerTypes = ({ view, total }: { view: QueryView<MinerSlices>; total: string }) => {
  if (view.status === "loading") return <Loader />;
  if (view.status === "error") return <ErrorCard title="Could not load" error={view.message} />;
  const slices = view.data;
  if (slices.empty)
    return <EmptyState image="simple" size="sm" description="No miners in the latest snapshot." />;
  return (
    <div className="reporting-types">
      <div className="reporting-types__total">
        <span className="reporting-field__label">{total}</span>
        <span className="reporting-types__count">{formatCount(slices.total)}</span>
      </div>
      {slices.total > 0 ? (
        <DoughnutChart data={slices.slices} legendPosition="left" formatValue={formatCount} />
      ) : (
        <EmptyState image="simple" size="sm" description="No miners in this state right now." />
      )}
    </div>
  );
};
