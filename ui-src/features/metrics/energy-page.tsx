import type { PeriodState } from "@tetherto/mdk-react-adapter";
import { METRICS } from "../../lib/metrics";
import { ConsumptionPanel } from "../consumption/consumption-panel";
import { PowerModeTable } from "../miners/power-mode-table";
import { useSiteInfo } from "../site/site-gate";
import type { ExtraTab } from "./metric-page";
import { MetricPage } from "./metric-page";

const CONSUMPTION_TAB: ExtraTab = {
  id: "consumption",
  label: "Consumption",
  render: (period: PeriodState) => <ConsumptionPanel period={period} />,
};

export const EnergyPage = () => {
  const site = useSiteInfo();
  const tz = site.site.timezone;
  // Consumption exists only for sites with at least one power meter wired.
  const extraTabs = site.sources.meters ? [CONSUMPTION_TAB] : [];
  return (
    <MetricPage
      title="Energy"
      metric={METRICS.power}
      siteViewExtra={() => <PowerModeTable timezone={tz} />}
      extraTabs={extraTabs}
    />
  );
};
