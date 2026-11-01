// What every Financials page shares: which sources a figure needs, tiles, and
// charts over the report's buckets. Pure functions, run once per response.
import type { FinancialBucket, FinancialsReport, Sources } from "../../api/contract";
import type { MissingSource } from "../../components/widget";
import type { ChartSeries, ChartView } from "../../lib/chart-view";
import { bucketLabels } from "../operations/operations-shape";

/**
 * A stat tile: its label, its value already written with its unit, and a note
 * under it. `needs` names a source beyond the report the figure reads (costs),
 * and `missing` marks it unavailable.
 */
/** The USD / BTC toggle of Hash Balance and Energy Balance. */
export const CURRENCIES = ["USD", "BTC"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const isCurrency = (v: string): v is Currency => CURRENCIES.some((c) => c === v);

/** Decimals for a per-unit figure in `currency`: cents, or BTC to the satoshi. */
export const digitsFor = (currency: Currency): number => (currency === "USD" ? 2 : 8);

export type Tile = {
  name: string;
  /** A second line under the name, e.g. "At Prod. Date Price". */
  caption?: string;
  value: string;
  /** A short tag after the value, e.g. "Net". */
  tag?: string;
  /** Drawn in the accent colour: the page's headline figure. */
  accent?: boolean;
  /** Lines under the value, e.g. the value in another unit, then where it comes from. */
  detail?: string;
  subtitle?: string;
  needs?: "costs";
  missing?: MissingSource;
};

/** Marks the tiles that need costs unavailable when the period's costs are missing. */
export const withCostsMissing = (tiles: Tile[], missing: MissingSource | null): Tile[] =>
  missing === null ? tiles : tiles.map((t) => (t.needs === "costs" ? { ...t, missing } : t));

/**
 * The first source in `needs` this site or report lacks, or null. The split is
 * missing when there are payouts but none could be split.
 */
export const missingOf = (
  needs: readonly MissingSource[],
  sources: Sources,
  report?: FinancialsReport,
): MissingSource | null => {
  for (const need of needs) {
    if (need === "pool" && !sources.pool) return "pool";
    if (need === "market" && !sources.market) return "market";
    if (need === "costs" && !sources.costs) return "costs";
    // Both need payouts to split: a period without any shows as empty instead.
    const paid = report !== undefined && (report.summary?.payouts ?? 0) > 0;
    if (need === "poolSplit" && paid && report.split !== "pool") return "poolSplit";
    if (need === "split" && paid && report.split === null) return "split";
  }
  // Costs entered, but not for every month of the period.
  if (
    needs.includes("costs") &&
    report !== undefined &&
    report.summary !== null &&
    report.summary.allInCostUsd === null
  )
    return "costs";
  return null;
};

/** One series of a Financials chart: what it reads from a bucket and how it draws. */
export type SeriesSpec = Omit<ChartSeries, "values"> & {
  read: (b: FinancialBucket) => number | null;
};

/** A chart over the report's buckets. */
export const financialChart = (
  report: FinancialsReport,
  unit: string,
  specs: SeriesSpec[],
  rightUnit?: string,
): ChartView => {
  const series = specs.map(({ read, ...rest }) => ({ ...rest, values: report.buckets.map(read) }));
  const view: ChartView = {
    labels: bucketLabels(report),
    unit,
    series,
    empty: series.every((s) => s.values.every((v) => v === null || v === 0)),
  };
  if (rightUnit !== undefined) view.rightUnit = rightUnit;
  return view;
};

/** Divides when both sides are known. */
export const per = (a: number | null, b: number | null, scale = 1): number | null =>
  a === null || b === null || b === 0 ? null : (a / b) * scale;
