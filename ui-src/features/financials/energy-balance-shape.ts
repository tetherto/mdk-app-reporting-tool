// Energy Balance: revenue and cost per MWh, and power against the fleet's
// nominal power. Cost per MWh derives from the Cost Input totals, as on Cost
// Summary and Hash Cost.
import type { FinancialBucket, FinancialsReport } from "../../api/contract";
import type { ChartView } from "../../lib/chart-view";
import { COLORS } from "../../lib/colors";
import type { MissingSource } from "../../components/widget";
import { formatBitcoin, formatWith, MONEY_UNITS, SATS_PER_BTC } from "../../lib/format";
import type { Currency, SeriesSpec, Tile } from "./financials-shape";
import { financialChart, per } from "./financials-shape";

const MW = 1e6;

const perMWhUnit = (currency: Currency): string =>
  currency === "USD" ? MONEY_UNITS.USD_PER_MWH : MONEY_UNITS.BTC_PER_MWH;

/** Revenue and all-in cost of a bucket per MWh, in `currency`. */
const perMWh = (b: FinancialBucket, currency: Currency) =>
  currency === "USD"
    ? { revenue: b.revenueUsdPerMWh, cost: b.allInCostUsdPerMWh }
    : {
        revenue: b.revenueSatsPerMWh === null ? null : b.revenueSatsPerMWh / SATS_PER_BTC,
        cost: per(b.allInCostUsdPerMWh, b.priceUsd),
      };

export type EnergyBalance = {
  revenueTiles: Tile[];
  revenue: ChartView;
  revenueVsCost: ChartView;
  power: ChartView;
  costTiles: Tile[];
};

export function toEnergyBalance(
  report: FinancialsReport,
  currency: Currency,
  withCost: boolean,
  poolMissing: MissingSource | null = null,
): EnergyBalance {
  const unit = perMWhUnit(currency);
  const s = report.summary;
  const usd = (name: string, v: number | null | undefined, isCost = false): Tile => ({
    name,
    value: formatWith(v ?? null, MONEY_UNITS.USD_PER_MWH),
    ...(isCost ? { needs: "costs" as const } : {}),
  });
  const mw = (name: string, w: number | null | undefined): Tile => ({
    name,
    value: formatWith(w === null || w === undefined ? null : w / MW, "MW", 2),
  });
  const vsCost: SeriesSpec[] = [
    {
      label: "Revenue",
      color: COLORS.revenue,
      read: (b: FinancialBucket) => perMWh(b, currency).revenue,
    },
  ];
  if (withCost)
    vsCost.unshift({
      label: "All-In Cost",
      color: COLORS.cost,
      read: (b: FinancialBucket) => perMWh(b, currency).cost,
    });
  return {
    revenueTiles: [
      {
        name: "Bitcoin Revenue",
        value: formatBitcoin(s?.btc ?? null, "BTC"),
        subtitle: "From pool payouts",
        ...(poolMissing === null ? {} : { missing: poolMissing }),
      },
    ],
    revenue: financialChart(report, unit, [
      {
        label: "Site Energy Revenue",
        color: COLORS.revenue,
        read: (b) => perMWh(b, currency).revenue,
      },
    ]),
    revenueVsCost: financialChart(report, unit, vsCost),
    power: financialChart(report, "MW", [
      {
        label: "Power Consumption",
        color: COLORS.actual,
        type: "line",
        read: (b) => per(b.powerW, MW),
      },
      {
        label: "Nominal Power Consumption",
        color: COLORS.nominal,
        type: "line",
        dashed: true,
        read: (b) => per(b.nominalPowerW, MW),
      },
    ]),
    costTiles: [
      mw("Avg Power Consumption", s?.powerW),
      usd("Avg Energy Cost", s?.energyCostUsdPerMWh, true),
      usd("Avg All-In Cost", s?.allInCostUsdPerMWh, true),
      mw("Avg Nominal Power Consumption", s?.nominalPowerW),
      usd("Avg Operations Cost", s?.operationsCostUsdPerMWh, true),
      usd("Avg Energy Revenue", s?.revenueUsdPerMWh),
    ],
  };
}
