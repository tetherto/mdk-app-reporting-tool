// The three metric pages (Hashrate, Energy, Efficiency) share one template; a
// metric says which figure it reads and how it scales.
import type { Cut, NominalFigures, OperationsFigures } from "../api/contract";
import type { UnitScale } from "@tetherto/mdk-react-devkit";
import {
  HASHRATE_TH_S_SCALES,
  pickUnitScale,
  POWER_W_SCALES,
  UNITS,
} from "@tetherto/mdk-react-devkit";

export type MetricKey = "hashrate" | "power" | "efficiency";

export type Metric = {
  key: MetricKey;
  label: string;
  cut: (f: OperationsFigures) => Cut;
  nominal: (n: NominalFigures) => number | null;
  /** Unit and divisor for values up to `max`. */
  unitFor: (max: number) => UnitScale;
};

export const METRICS: Record<MetricKey, Metric> = {
  hashrate: {
    key: "hashrate",
    label: "Hashrate",
    cut: (f) => f.hashrateThs,
    nominal: (n) => n.hashrateThs,
    unitFor: (max) => pickUnitScale(HASHRATE_TH_S_SCALES, max),
  },
  power: {
    key: "power",
    label: "Power Consumption",
    cut: (f) => f.powerW,
    nominal: (n) => n.powerW,
    unitFor: (max) => pickUnitScale(POWER_W_SCALES, max),
  },
  efficiency: {
    key: "efficiency",
    label: "Efficiency",
    cut: (f) => f.efficiencyWThs,
    nominal: (n) => n.efficiencyWThs,
    unitFor: () => ({ unit: UNITS.EFFICIENCY_W_PER_TH_S, factor: 1 }),
  },
};

export const maxOf = (values: Array<number | null | undefined>): number =>
  values.reduce<number>((m, v) => (typeof v === "number" && v > m ? v : m), 0);

export const scaleAll = (
  values: Array<number | null | undefined>,
  factor: number,
): Array<number | null> => values.map((v) => (typeof v === "number" ? v / factor : null));
