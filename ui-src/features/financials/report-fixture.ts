// A two-month financials report for the shape tests: every source wired, costs
// entered, the split from the network's fee share. Monthly, in UTC.
import type { FinancialFigures, FinancialsReport, Sources } from "../../api/contract";

export const T0 = Date.UTC(2026, 7, 1);
const T1 = Date.UTC(2026, 8, 1);

export const figures = (overrides: Partial<FinancialFigures> = {}): FinancialFigures => ({
  payouts: 30,
  btc: 0.5,
  poolFeeBtc: 0.01,
  grossBtc: 0.51,
  subsidyBtc: 0.49,
  feesBtc: 0.01,
  feePercent: 2,
  priceUsd: 100_000,
  revenueUsd: 50_000,
  grossRevenueUsd: 51_000,
  networkHashrateHs: 9e20,
  networkHashpriceUsdPerPhsDay: 48,
  networkHashpriceBtcPerPhsDay: 0.00048,
  networkFeeRateSatsVb: 6,
  coveredSec: 2_678_400,
  hashrateThs: 27_000,
  powerW: 325_000,
  energyMWh: 241.8,
  nominalHashrateThs: 28_800,
  nominalPowerW: 336_000,
  nominalEnergyMWh: 250,
  uptimePercent: 96,
  capacityFactorPercent: 93.75,
  energyCostUsd: 10_900,
  operationsCostUsd: 2_900,
  allInCostUsd: 13_800,
  revenueUsdPerMWh: 206.78,
  grossRevenueUsdPerMWh: 210.92,
  revenueSatsPerMWh: 206_782,
  grossRevenueSatsPerMWh: 210_918,
  hashRevenueUsdPerPhsDay: 59.74,
  grossHashRevenueUsdPerPhsDay: 60.93,
  hashRevenueSatsPerPhsDay: 59_737,
  grossHashRevenueSatsPerPhsDay: 60_932,
  energyCostUsdPerMWh: 45.08,
  operationsCostUsdPerMWh: 11.99,
  allInCostUsdPerMWh: 57.07,
  hashCostUsdPerPhsDay: 16.49,
  hashCostSatsPerPhsDay: 16_487,
  productionCostUsdPerBtc: 27_600,
  ...overrides,
});

export const report = (overrides: Partial<FinancialsReport> = {}): FinancialsReport => ({
  range: { start: T0, end: Date.UTC(2026, 9, 1), granularity: "month", timezone: "UTC" },
  latestPriceUsd: 110_000,
  split: "network",
  buckets: [
    { ts: T0, ...figures() },
    { ts: T1, ...figures({ btc: 0.4, revenueUsd: 40_000 }) },
  ],
  summary: figures({ btc: 0.9, revenueUsd: 90_000, payouts: 60 }),
  ...overrides,
});

export const sources = (overrides: Partial<Sources> = {}): Sources => ({
  miners: true,
  pool: true,
  poolSplit: false,
  poolFee: true,
  market: true,
  meters: true,
  siteMeter: true,
  costs: true,
  ...overrides,
});
