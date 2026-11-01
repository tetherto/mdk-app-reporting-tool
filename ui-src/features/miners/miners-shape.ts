import type { MinerStatus, MinersSnapshot, ModelSnapshot } from "../../api/contract";
import { seriesColor } from "../../lib/colors";

export const MINERS_TABS = ["all", "offline", "maintenance"] as const;
export type MinersTab = (typeof MINERS_TABS)[number];

type TabSpec = {
  label: string;
  /** Title of the total tile. */
  total: string;
  /** The snapshot count the doughnut slices. */
  count: "total" | "offline" | "maintenance";
  /** The statuses the trend shows; every status when absent. */
  statuses?: readonly MinerStatus[];
};

export const MINERS_TAB_SPECS: Record<MinersTab, TabSpec> = {
  all: { label: "All Miners", total: "Total Miner Count", count: "total" },
  offline: {
    label: "Miners Offline",
    total: "Miners Offline",
    count: "offline",
    statuses: ["offline"],
  },
  maintenance: {
    label: "Miners in Maintenance",
    total: "Miners in Maintenance",
    count: "maintenance",
    statuses: ["maintenance"],
  },
};

export const isMinersTab = (value: string): value is MinersTab =>
  MINERS_TABS.some((t) => t === value);

/** One doughnut slice per miner type: how many of its miners `count` counts, as of the snapshot. */
export type MinerSlices = {
  slices: Array<{ label: string; value: number; color: string }>;
  total: number;
  empty: boolean;
  ts: number | null;
};

export const toMinerSlices = (snapshot: MinersSnapshot, count: TabSpec["count"]): MinerSlices => {
  const slices = snapshot.models.map((m: ModelSnapshot, i) => ({
    label: m.displayName,
    value: m[count],
    color: seriesColor(i),
  }));
  return {
    slices,
    total: slices.reduce((n, s) => n + s.value, 0),
    empty: snapshot.models.length === 0,
    ts: snapshot.ts,
  };
};
