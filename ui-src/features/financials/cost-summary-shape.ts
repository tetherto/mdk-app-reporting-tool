// Cost Summary: production cost per BTC beside the BTC price (in $k), all-in
// cost per MWh, and the energy / operations split. Every figure derives
// from the Cost Input totals, so it reconciles with Hash Cost and Energy Cost.
import type { FinancialsReport } from "../../api/contract";
import type { ChartView } from "../../lib/chart-view";
import { COLORS } from "../../lib/colors";
import { formatUsd, formatWith, MONEY_UNITS } from "../../lib/format";
import type { Tile } from "./financials-shape";
import { financialChart } from "./financials-shape";

export type CostSummary = {
  tiles: Tile[];
  productionCost: ChartView;
  allInCost: ChartView;
  /** $/MWh for the devkit's OperationsEnergyCostChart. */
  split: { energyCostsUSD: number; operationalCostsUSD: number } | null;
};

const thousands = (v: number | null): number | null => (v === null ? null : v / 1000);

export function toCostSummary(report: FinancialsReport): CostSummary {
  const s = report.summary;
  const tile = (
    name: string,
    perMWh: number | null,
    total: number | null,
    accent = false,
  ): Tile => ({
    name,
    needs: "costs",
    accent,
    value: formatWith(perMWh, MONEY_UNITS.USD_PER_MWH),
    subtitle: `${formatUsd(total)} in the period`,
  });
  return {
    tiles: [
      tile("All-in Cost", s?.allInCostUsdPerMWh ?? null, s?.allInCostUsd ?? null, true),
      tile("Energy Cost", s?.energyCostUsdPerMWh ?? null, s?.energyCostUsd ?? null),
      tile("Operations Cost", s?.operationsCostUsdPerMWh ?? null, s?.operationsCostUsd ?? null),
    ],
    productionCost: financialChart(report, MONEY_UNITS.KUSD_PER_BTC, [
      { label: "BTC Price", color: COLORS.price, read: (b) => thousands(b.priceUsd) },
      {
        label: "Production Cost",
        color: COLORS.productionCost,
        read: (b) => thousands(b.productionCostUsdPerBtc),
      },
    ]),
    allInCost: financialChart(report, MONEY_UNITS.USD_PER_MWH, [
      { label: "All-in Cost", color: COLORS.cost, read: (b) => b.allInCostUsdPerMWh },
    ]),
    split:
      s === null || s.energyCostUsdPerMWh === null || s.operationsCostUsdPerMWh === null
        ? null
        : { energyCostsUSD: s.energyCostUsdPerMWh, operationalCostsUSD: s.operationsCostUsdPerMWh },
  };
}
