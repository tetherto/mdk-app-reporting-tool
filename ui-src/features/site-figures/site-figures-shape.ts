import type { UnitScale } from "@tetherto/mdk-react-devkit";
import {
  HASHRATE_TH_S_SCALES,
  POWER_W_SCALES,
  scaleToUnit,
  UNITS,
} from "@tetherto/mdk-react-devkit";

import type { OperationsReport } from "../../api/contract";
import { formatNumber, formatScaled, MISSING } from "../../lib/format";

/** The site's averages over the report's period, ready to show. */
export type SiteFigures = { hashrate: string; power: string; efficiency: string };

const scaled = (v: number | null | undefined, scales: readonly UnitScale[]): string =>
  typeof v === "number" ? formatScaled(scaleToUnit(v, scales)) : MISSING;

export const toSiteFigures = (report: OperationsReport): SiteFigures => {
  const summary = report.summary;
  const efficiency = summary?.efficiencyWThs.site;
  return {
    hashrate: scaled(summary?.hashrateThs.site, HASHRATE_TH_S_SCALES),
    power: scaled(summary?.powerW.site, POWER_W_SCALES),
    // A dash alone when missing, as hashrate and power show it
    efficiency:
      typeof efficiency === "number"
        ? `${formatNumber(efficiency)} ${UNITS.EFFICIENCY_W_PER_TH_S}`
        : MISSING,
  };
};
