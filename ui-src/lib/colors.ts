// Chart colours, all from one palette: MDK's chart colours (CHART_COLORS).
// Each name is a series kind, and a kind keeps its colour wherever it is drawn,
// except where the design gives a chart its own (Hash Balance's site revenue
// chart: see hashRevenue). Within one chart every series has its own colour
// (features/chart-colors.test.ts). Actual against nominal is blue against
// dashed red, as in the design.
import { CHART_COLORS } from "@tetherto/mdk-react-devkit";

/** The palette every chart takes its colours from, in the order a breakdown uses them. */
export const PALETTE = [
  CHART_COLORS.blue,
  CHART_COLORS.green,
  CHART_COLORS.purple,
  CHART_COLORS.orange,
  CHART_COLORS.red,
  CHART_COLORS.yellow,
  CHART_COLORS.SKY_BLUE,
  CHART_COLORS.VIOLET,
  CHART_COLORS.LIGHT_BLUE,
  CHART_COLORS.grey,
] as const;

export const COLORS = {
  actual: CHART_COLORS.blue,
  nominal: CHART_COLORS.red,
  // Miner statuses.
  online: CHART_COLORS.green,
  error: CHART_COLORS.red,
  offline: CHART_COLORS.grey,
  sleep: CHART_COLORS.blue,
  maintenance: CHART_COLORS.orange,
  // Power modes.
  low: CHART_COLORS.yellow,
  normal: CHART_COLORS.green,
  high: CHART_COLORS.SKY_BLUE,
  // Money series, the same on every Financials page.
  // As the design draws them: revenue green, cost purple (production cost
  // green beside the orange BTC price), the network's hashprice blue.
  revenue: CHART_COLORS.green,
  cost: CHART_COLORS.purple,
  productionCost: CHART_COLORS.green,
  network: CHART_COLORS.blue,
  // Hash Balance's site revenue chart, in its own design: the site's hash
  // revenue red and hashprice purple, where the cost chart beside it draws the
  // same figures as revenue green and network blue.
  hashRevenue: CHART_COLORS.red,
  hashprice: CHART_COLORS.purple,
  subsidy: CHART_COLORS.VIOLET,
  fees: CHART_COLORS.SKY_BLUE,
  feePercent: CHART_COLORS.red,
  feeRate: CHART_COLORS.purple,
  price: CHART_COLORS.orange,
  energyCost: CHART_COLORS.blue,
  operationsCost: CHART_COLORS.purple,
} as const;

/** A stable colour for the i-th series of a breakdown, round the palette. */
export const seriesColor = (i: number): string => PALETTE[i % PALETTE.length] ?? CHART_COLORS.blue;
