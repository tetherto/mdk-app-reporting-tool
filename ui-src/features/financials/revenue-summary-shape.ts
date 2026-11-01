// Revenue Summary: total bitcoin, revenue at receipt and report price, mining
// revenue per bucket, the subsidy / fee split, and the per-MWh and per-PH/s/day
// figures, net (as the pool paid) and gross (before its fee).
import type { BitcoinUnit } from "@tetherto/mdk-react-devkit";
import { HASHRATE_TH_S_SCALES, POWER_W_SCALES, scaleToUnit } from "@tetherto/mdk-react-devkit";

import type { FinancialBucket, FinancialsReport, Sources } from "../../api/contract";
import type { MissingSource } from "../../components/widget";
import type { ChartView } from "../../lib/chart-view";
import { COLORS } from "../../lib/colors";
import {
  formatBitcoin,
  formatScaled,
  formatUsd,
  formatWith,
  MONEY_UNITS,
  SATS_PER_BTC,
} from "../../lib/format";
import type { Tile } from "./financials-shape";
import { financialChart, missingOf, per } from "./financials-shape";

/** The Mining Revenue chart's unit toggle. */
export const REVENUE_CHART_UNITS = [
  { value: "BTC", label: "BTC" },
  { value: "sats", label: "sats" },
  { value: "receipt", label: "USD at Receipt" },
  { value: "report", label: "USD at Report" },
] as const;
export type RevenueChartUnit = (typeof REVENUE_CHART_UNITS)[number]["value"];

export const isRevenueChartUnit = (v: string): v is RevenueChartUnit =>
  REVENUE_CHART_UNITS.some((u) => u.value === v);

/** The subsidy / fee split in BTC, and the unit the page writes it in. */
export type SplitSlices = {
  slices: Array<{ label: string; value: number; color: string }>;
  unit: BitcoinUnit;
};

export type RevenueSummary = {
  totals: Tile[];
  metrics: Tile[];
  split: SplitSlices | null;
  empty: boolean;
};

const netGross = (
  name: string,
  caption: string,
  net: number | null,
  gross: number | null,
  unit: string,
  digits: number,
  missing: MissingSource | null,
): Tile => ({
  name,
  caption,
  ...(missing === null ? {} : { missing }),
  value: formatWith(net, unit, digits),
  tag: "Net",
  subtitle:
    gross === null ? "Gross: pool fee not reported" : `Gross ${formatWith(gross, unit, digits)}`,
});

export function toRevenueSummary(
  report: FinancialsReport,
  sources: Sources,
  unit: BitcoinUnit,
): RevenueSummary {
  const s = report.summary;
  const poolMissing = missingOf(["pool"], sources);
  const usdMissing = missingOf(["pool", "market"], sources);
  const btc = s?.btc ?? null;
  const atReport =
    btc === null || report.latestPriceUsd === null ? null : btc * report.latestPriceUsd;
  const scaled = (v: number | null | undefined, scale: (n: number) => string): string =>
    v === null || v === undefined ? formatWith(null, "") : scale(v);

  const totals: Tile[] = [
    {
      name: "Total Bitcoin",
      value: formatBitcoin(btc, unit),
      accent: true,
      // The same amount in the other unit, as the design shows it.
      ...(btc === null ? {} : { detail: formatBitcoin(btc, unit === "BTC" ? "sats" : "BTC") }),
      subtitle: "From pool payouts",
      ...(poolMissing === null ? {} : { missing: poolMissing }),
    },
    {
      name: "Revenue at Receipt Price",
      value: formatUsd(s?.revenueUsd ?? null),
      subtitle: `Effective ${formatUsd(per(s?.revenueUsd ?? null, btc))}/BTC`,
      ...(usdMissing === null ? {} : { missing: usdMissing }),
    },
    {
      name: "Revenue at Report Price",
      value: formatUsd(atReport),
      subtitle: `Current ${formatUsd(report.latestPriceUsd)}/BTC`,
      ...(usdMissing === null ? {} : { missing: usdMissing }),
    },
  ];

  const metrics: Tile[] = [
    netGross(
      "Avg Mining Revenue per MWh",
      "At Prod. Date Price",
      s?.revenueUsdPerMWh ?? null,
      s?.grossRevenueUsdPerMWh ?? null,
      MONEY_UNITS.USD_PER_MWH,
      2,
      usdMissing,
    ),
    netGross(
      "Avg Hash Revenue",
      "At Prod. Date Price",
      s?.hashRevenueUsdPerPhsDay ?? null,
      s?.grossHashRevenueUsdPerPhsDay ?? null,
      MONEY_UNITS.USD_PER_PHS_DAY,
      2,
      usdMissing,
    ),
    netGross(
      "Avg Mining Revenue per MWh",
      "In Bitcoin Terms",
      s?.revenueSatsPerMWh ?? null,
      s?.grossRevenueSatsPerMWh ?? null,
      MONEY_UNITS.SATS_PER_MWH,
      0,
      poolMissing,
    ),
    netGross(
      "Avg Hash Revenue",
      "In Bitcoin Terms",
      s?.hashRevenueSatsPerPhsDay ?? null,
      s?.grossHashRevenueSatsPerPhsDay ?? null,
      MONEY_UNITS.SATS_PER_PHS_DAY,
      0,
      poolMissing,
    ),
    {
      name: "Avg Power Consumption",
      value: scaled(s?.powerW, (w) => formatScaled(scaleToUnit(w, POWER_W_SCALES))),
    },
    {
      name: "Avg Hashrate",
      value: scaled(s?.hashrateThs, (ths) => formatScaled(scaleToUnit(ths, HASHRATE_TH_S_SCALES))),
    },
    { name: "Mining Uptime", value: formatWith(s?.uptimePercent ?? null, MONEY_UNITS.PERCENT, 1) },
    {
      name: "Hashrate Capacity Factor",
      value: formatWith(s?.capacityFactorPercent ?? null, MONEY_UNITS.PERCENT, 1),
    },
  ];

  const split =
    s === null || s.subsidyBtc === null || s.feesBtc === null
      ? null
      : {
          unit,
          slices: [
            { label: "Subsidy", value: s.subsidyBtc, color: COLORS.subsidy },
            { label: "Fees", value: s.feesBtc, color: COLORS.fees },
          ],
        };

  return { totals, metrics, split, empty: s === null || s.payouts === 0 };
}

const REVENUE_READS: Record<
  RevenueChartUnit,
  { unit: string; read: (b: FinancialBucket, latestPriceUsd: number | null) => number | null }
> = {
  BTC: { unit: MONEY_UNITS.BTC, read: (b) => b.btc },
  sats: { unit: MONEY_UNITS.SATS, read: (b) => b.btc * SATS_PER_BTC },
  receipt: { unit: MONEY_UNITS.USD, read: (b) => b.revenueUsd },
  report: {
    unit: MONEY_UNITS.USD,
    read: (b, price) => (price === null ? null : b.btc * price),
  },
};

/** Mining revenue per bucket in the chosen unit, one series named after the site. */
export function revenueChart(
  report: FinancialsReport,
  unit: RevenueChartUnit,
  siteName: string,
): ChartView {
  const { unit: chartUnit, read } = REVENUE_READS[unit];
  return financialChart(report, chartUnit, [
    { label: siteName, color: COLORS.revenue, read: (b) => read(b, report.latestPriceUsd) },
  ]);
}
