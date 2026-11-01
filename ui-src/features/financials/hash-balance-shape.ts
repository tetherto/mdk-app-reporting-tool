// Hash Balance: the site's revenue and cost per PH/s per day beside the
// network's hashprice. All three share one unit, $/PH/s/day (or BTC/PH/s/day),
// so they land in the same order of magnitude.
import type { FinancialBucket, FinancialFigures, FinancialsReport } from "../../api/contract";
import type { ChartView } from "../../lib/chart-view";
import { COLORS } from "../../lib/colors";
import { formatWith, MONEY_UNITS, SATS_PER_BTC } from "../../lib/format";
import type { Currency, SeriesSpec, Tile } from "./financials-shape";
import { digitsFor, financialChart } from "./financials-shape";

const EH = 1e18;

type Figures = Pick<
  FinancialFigures,
  | "hashRevenueUsdPerPhsDay"
  | "hashRevenueSatsPerPhsDay"
  | "hashCostUsdPerPhsDay"
  | "hashCostSatsPerPhsDay"
  | "networkHashpriceUsdPerPhsDay"
  | "networkHashpriceBtcPerPhsDay"
>;

const fromSats = (v: number | null): number | null => (v === null ? null : v / SATS_PER_BTC);

/** Hash revenue, hash cost and network hashprice of a bucket or the period, in `currency`. */
export const hashFigures = (f: Figures, currency: Currency) =>
  currency === "USD"
    ? {
        revenue: f.hashRevenueUsdPerPhsDay,
        cost: f.hashCostUsdPerPhsDay,
        network: f.networkHashpriceUsdPerPhsDay,
      }
    : {
        revenue: fromSats(f.hashRevenueSatsPerPhsDay),
        cost: fromSats(f.hashCostSatsPerPhsDay),
        network: f.networkHashpriceBtcPerPhsDay,
      };

export const hashUnit = (currency: Currency): string =>
  currency === "USD" ? MONEY_UNITS.USD_PER_PHS_DAY : MONEY_UNITS.BTC_PER_PHS_DAY;

export type HashBalance = {
  revenueTiles: Tile[];
  costTiles: Tile[];
  siteRevenue: ChartView;
  networkHashrate: ChartView;
  networkHashprice: ChartView;
  costRevenueNetwork: ChartView;
};

export function toHashBalance(
  report: FinancialsReport,
  currency: Currency,
  withCost: boolean,
): HashBalance {
  const unit = hashUnit(currency);
  const digits = digitsFor(currency);
  const avg = report.summary === null ? null : hashFigures(report.summary, currency);
  const tile = (name: string, v: number | null | undefined): Tile => ({
    name,
    value: formatWith(v ?? null, unit, digits),
  });
  const read = (key: "revenue" | "cost" | "network") => (b: FinancialBucket) =>
    hashFigures(b, currency)[key];

  const grouped: SeriesSpec[] = [
    { label: "Hash Revenue", color: COLORS.revenue, read: read("revenue") },
    { label: "Network Hashprice", color: COLORS.network, read: read("network") },
  ];
  if (withCost) grouped.unshift({ label: "Hash Cost", color: COLORS.cost, read: read("cost") });

  return {
    revenueTiles: [
      tile("Avg Hash Revenue", avg?.revenue),
      tile("Avg Network Hashprice", avg?.network),
    ],
    costTiles: [
      { ...tile("Avg Hash Cost", avg?.cost), needs: "costs" },
      tile("Avg Hash Revenue", avg?.revenue),
      tile("Avg Network Hashprice", avg?.network),
    ],
    siteRevenue: financialChart(report, unit, [
      { label: "Site Hash Revenue", color: COLORS.hashRevenue, read: read("revenue") },
    ]),
    networkHashrate: financialChart(report, "EH/s", [
      {
        label: "Network Hashrate",
        color: COLORS.price,
        type: "line",
        read: (b) => (b.networkHashrateHs === null ? null : b.networkHashrateHs / EH),
      },
    ]),
    networkHashprice: financialChart(report, unit, [
      { label: "Network Hashprice", color: COLORS.hashprice, read: read("network") },
    ]),
    costRevenueNetwork: financialChart(report, unit, grouped),
  };
}
