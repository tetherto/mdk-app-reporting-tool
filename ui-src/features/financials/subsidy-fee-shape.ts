// Subsidy / Fee: the site's payouts split into block subsidy and transaction
// fees per bucket, stacked, with the fee share on the right axis; and the
// network's typical fee rate in sats/vB.
import type { BitcoinUnit } from "@tetherto/mdk-react-devkit";
import type { FinancialsReport } from "../../api/contract";
import type { ChartView } from "../../lib/chart-view";
import { COLORS } from "../../lib/colors";
import { MONEY_UNITS, SATS_PER_BTC } from "../../lib/format";
import { financialChart } from "./financials-shape";

export const subsidyFeeChart = (report: FinancialsReport, unit: BitcoinUnit = "BTC"): ChartView => {
  const inUnit = (btc: number | null): number | null =>
    btc === null || unit === "BTC" ? btc : btc * SATS_PER_BTC;
  return financialChart(
    report,
    unit === "BTC" ? MONEY_UNITS.BTC : MONEY_UNITS.SATS,
    [
      {
        label: "Subsidy",
        color: COLORS.subsidy,
        stack: "split",
        read: (b) => inUnit(b.subsidyBtc),
      },
      { label: "Fees", color: COLORS.fees, stack: "split", read: (b) => inUnit(b.feesBtc) },
      {
        label: "Fee %",
        color: COLORS.feePercent,
        type: "line",
        axis: "right",
        read: (b) => b.feePercent,
      },
    ],
    MONEY_UNITS.PERCENT,
  );
};

/** The network's typical transaction fee rate per bucket, in sats/vB. */
export const feeRateChart = (report: FinancialsReport): ChartView =>
  financialChart(report, MONEY_UNITS.SATS_PER_VB, [
    { label: "Average Fee Rate", color: COLORS.feeRate, read: (b) => b.networkFeeRateSatsVb },
  ]);
