// Chart colours, one per series kind, the same on every page: MDK's palette,
// with miner statuses and power modes coloured as MDK's own miner charts do.
// Actual against nominal is blue against dashed red, as in the design.
import { CATEGORICAL_COLORS, CHART_COLORS, COLOR } from "@tetherto/mdk-react-devkit";

export const COLORS = {
  actual: CHART_COLORS.blue,
  nominal: CHART_COLORS.red,
  online: COLOR.GRASS_GREEN,
  error: COLOR.BRICK_RED,
  offline: COLOR.DARK_GREY,
  sleep: COLOR.SLEEP_BLUE,
  maintenance: COLOR.ORANGE_WARNING,
  // Power modes, as the design colours them.
  low: COLOR.BRIGHT_YELLOW,
  normal: COLOR.GRASS_GREEN,
  high: COLOR.EMERALD,
  // Money series, the same on every Financials page.
  // As the design draws them: revenue green, cost purple (production cost
  // green beside the orange BTC price), the network's hashprice blue.
  revenue: CHART_COLORS.green,
  cost: CHART_COLORS.purple,
  productionCost: CHART_COLORS.green,
  network: CHART_COLORS.blue,
  // Hash Balance's own design: the site's hash revenue red, hashprice purple.
  hashRevenue: CHART_COLORS.red,
  hashprice: CHART_COLORS.purple,
  subsidy: COLOR.INDIGO,
  fees: COLOR.BLUE_SEA,
  feePercent: CHART_COLORS.red,
  feeRate: CHART_COLORS.purple,
  price: CHART_COLORS.orange,
  energyCost: CHART_COLORS.blue,
  operationsCost: CHART_COLORS.purple,
} as const;

/** A stable colour for the i-th series of a breakdown. */
export const seriesColor = (i: number): string =>
  CATEGORICAL_COLORS[i % CATEGORICAL_COLORS.length] ?? COLOR.COLD_ORANGE;
