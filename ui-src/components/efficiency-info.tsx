import { SimpleTooltip } from "@tetherto/mdk-react-devkit";

/** What site efficiency means, next to its chart's title. */
export const EfficiencyInfo = () => (
  <SimpleTooltip
    side="left"
    delayDuration={200}
    content="Power drawn by mining miners per unit of hashrate. Nominal is the hardware catalogue's rating for the fleet: nominal power over nominal hashrate."
  >
    <span className="reporting-info" aria-label="About site efficiency">
      ⓘ
    </span>
  </SimpleTooltip>
);
