/**
 * The Reporting Tool Lite route contract: every request and response body of
 * the app's Gateway routes (plugin/mdk-plugin.json), as zod schemas. The UI
 * parses every response with these, the route table is generated from them,
 * and the contract test runs the plugin's reports on a seeded store and parses
 * each result, so the UI and the plugin cannot drift.
 *
 * Units are fixed per field and named in the field where the name carries one:
 * TH/s, W, MWh, W/TH/s, s, USD, BTC, sats, %. Timestamps (`ts`, `start`, `end`, `firstTs`,
 * `lastTs`, `lastSampleAt`) are ms since epoch, and `byMeter` values are MWh;
 * those names predate the rule and are kept so the routes do not change.
 * Shaping for display (PH/s, MW) happens in the feature hooks.
 */
import { z } from "zod";

// --- Shared value vocabularies ------------------------------------------------

/** Bucket sizes of a report, in the site's timezone (plugin/lib/time.js). */
export const GRANULARITIES = ["hour", "day", "week", "month"] as const;
/** Miner statuses averaged per bucket in the operations report. */
export const MINER_STATUSES = ["online", "error", "offline", "sleep", "maintenance"] as const;
/** Miner counts per type in the fleet snapshot: by status and by power mode. */
export const SNAPSHOT_COUNTS = [
  "total",
  "offline",
  "error",
  "sleep",
  "low",
  "normal",
  "high",
  "maintenance",
] as const;

/** Where a report's subsidy / fee split comes from: the pool, or the network's daily fee share. */
export const SPLIT_SOURCES = ["pool", "network"] as const;

export const granularitySchema = z.enum(GRANULARITIES);
export type Granularity = z.infer<typeof granularitySchema>;
export type MinerStatus = (typeof MINER_STATUSES)[number];
export type SnapshotCount = (typeof SNAPSHOT_COUNTS)[number];
export type SplitSource = (typeof SPLIT_SOURCES)[number];

const epochMs = z.number().int().nonnegative();
const count = z.number().int().nonnegative();
const nonNegative = z.number().nonnegative();
/** A figure that has no value when nothing was measured (e.g. efficiency with no hashrate). */
const maybe = z.number().nullable();

/** Body of every non-2xx response, as the Gateway sends it. */
export const apiErrorSchema = z.object({
  statusCode: z.number().int(),
  error: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

// --- Shared pieces ---------------------------------------------------------------

export const miningUnitSchema = z.object({ id: z.string(), name: z.string() });
export type MiningUnit = z.infer<typeof miningUnitSchema>;

/** A miner type present in the fleet, with its hardware catalogue rating (null when not catalogued). */
export const minerModelSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  vendor: z.string().nullable(),
  nominalHashrateThs: nonNegative.nullable(),
  nominalPowerW: nonNegative.nullable(),
});
export type MinerModel = z.infer<typeof minerModelSchema>;

/** The period a report covers: [start, end) in ms, bucketed by `granularity` in `timezone`. */
export const reportRangeSchema = z.object({
  start: z.number().int(),
  end: z.number().int(),
  granularity: granularitySchema,
  timezone: z.string(),
});
export type ReportRange = z.infer<typeof reportRangeSchema>;

// --- GET /api/reporting/site ----------------------------------------------------

/** Which data sources are wired (plugin/lib/sources.js). */
export const sourcesSchema = z.object({
  miners: z.boolean(),
  pool: z.boolean(),
  /** The pool's recent payouts carry the subsidy / fee split. */
  poolSplit: z.boolean(),
  /** The pool reports its own fee per payout, so gross revenue is known. */
  poolFee: z.boolean(),
  market: z.boolean(),
  /** At least one power meter other than the site meter. */
  meters: z.boolean(),
  siteMeter: z.boolean(),
  /** At least one month has a cost on Cost Input. */
  costs: z.boolean(),
});
export type Sources = z.infer<typeof sourcesSchema>;

export const siteInfoSchema = z.object({
  site: z.object({ name: z.string(), timezone: z.string() }),
  miningUnits: z.array(miningUnitSchema),
  models: z.array(minerModelSchema),
  meters: z.array(z.object({ id: z.string(), label: z.string(), siteMeter: z.boolean() })),
  sources: sourcesSchema,
  /** First and last stored miner sample; null before the first sample. */
  history: z.object({ firstTs: epochMs.nullable(), lastTs: epochMs.nullable() }),
  collector: z.object({
    kernelConnected: z.boolean(),
    lastSampleAt: epochMs.nullable(),
    lastError: z.string().nullable(),
    sampleIntervalSec: z.number().positive(),
  }),
});
export type SiteInfo = z.infer<typeof siteInfoSchema>;

// --- GET /api/reporting/operations ----------------------------------------------

/** A figure for the site, cut by mining unit id and by miner type id. */
export const cutSchema = z.object({
  site: maybe,
  byUnit: z.record(z.string(), maybe),
  byModel: z.record(z.string(), maybe),
});
export type Cut = z.infer<typeof cutSchema>;

/** The hardware catalogue's rating for the miners counted: nominal hashrate, power and efficiency. */
export const nominalFiguresSchema = z.object({
  hashrateThs: nonNegative,
  powerW: nonNegative,
  efficiencyWThs: maybe,
});
export type NominalFigures = z.infer<typeof nominalFiguresSchema>;

/** Average miners in each status over the bucket (time-weighted, so fractional). */
export const statusCountsSchema = z.object({
  online: nonNegative,
  error: nonNegative,
  offline: nonNegative,
  sleep: nonNegative,
  maintenance: nonNegative,
});
export type StatusCounts = z.infer<typeof statusCountsSchema>;

/** Time-weighted averages over the samples of one bucket (or of the whole period). */
export const operationsFiguresSchema = z.object({
  /** Seconds the samples cover. */
  coveredSec: nonNegative,
  hashrateThs: cutSchema,
  powerW: cutSchema,
  energyMWh: nonNegative,
  efficiencyWThs: cutSchema,
  nominal: nominalFiguresSchema.extend({
    byUnit: z.record(z.string(), nominalFiguresSchema),
    byModel: z.record(z.string(), nominalFiguresSchema),
  }),
  /** Average miners in the fleet. */
  miners: nonNegative,
  status: statusCountsSchema,
});
export type OperationsFigures = z.infer<typeof operationsFiguresSchema>;

export const operationsBucketSchema = operationsFiguresSchema.extend({ ts: epochMs });
export type OperationsBucket = z.infer<typeof operationsBucketSchema>;

export const operationsReportSchema = z.object({
  range: reportRangeSchema,
  units: z.array(miningUnitSchema),
  models: z.array(minerModelSchema),
  /** Buckets with at least one sample, in time order. */
  buckets: z.array(operationsBucketSchema),
  /** The whole period; null when it has no samples. */
  summary: operationsFiguresSchema.nullable(),
});
export type OperationsReport = z.infer<typeof operationsReportSchema>;

// --- GET /api/reporting/miners -----------------------------------------------------

export const snapshotCountsSchema = z.object({
  total: count,
  offline: count,
  error: count,
  sleep: count,
  low: count,
  normal: count,
  high: count,
  maintenance: count,
  powerW: nonNegative,
});
export type SnapshotCounts = z.infer<typeof snapshotCountsSchema>;

export const modelSnapshotSchema = minerModelSchema.extend(snapshotCountsSchema.shape);
export type ModelSnapshot = z.infer<typeof modelSnapshotSchema>;

export const minersSnapshotSchema = z.object({
  /** When the latest sample was taken; null before the first one. */
  ts: epochMs.nullable(),
  intervalS: nonNegative.optional(),
  models: z.array(modelSnapshotSchema),
  /** Every configured mining unit; the counts are absent for a unit with no miners sampled. */
  units: z.array(miningUnitSchema.extend(snapshotCountsSchema.partial().shape)),
  site: snapshotCountsSchema.nullable(),
});
export type MinersSnapshot = z.infer<typeof minersSnapshotSchema>;

// --- GET /api/reporting/consumption ---------------------------------------------

export const meterSchema = z.object({ id: z.string(), label: z.string() });

export const consumptionReportSchema = z.object({
  range: reportRangeSchema,
  /** The power meters other than the site meter. */
  meters: z.array(meterSchema),
  siteMeter: meterSchema.nullable(),
  buckets: z.array(
    z.object({
      ts: epochMs,
      /** MWh per meter id; null when the meter has no sample in the bucket. */
      byMeter: z.record(z.string(), nonNegative.nullable()),
      siteMeterMWh: nonNegative.nullable(),
    }),
  ),
});
export type ConsumptionReport = z.infer<typeof consumptionReportSchema>;

// --- GET /api/reporting/financials ----------------------------------------------

/**
 * Pool, market, operations and cost figures for one bucket or the whole period.
 * Every ratio is computed here, once, from the same totals, so tiles, charts
 * and pages reconcile: a period figure is its total over its basis (MWh,
 * PH/s-days, BTC), which is the average of the bucket series weighted by that
 * basis. A figure is null when a source it needs has no data for the period.
 */
export const financialFiguresSchema = z.object({
  // Pool payouts.
  payouts: count,
  /** Net of the pool fee: what the pool paid. */
  btc: nonNegative,
  /** The pool's fee on those payouts; null when the pool doesn't report it. */
  poolFeeBtc: nonNegative.nullable(),
  /** Net plus the pool fee. */
  grossBtc: nonNegative.nullable(),
  /** Block subsidy and transaction fees within `btc` (`split` on the report says where from). */
  subsidyBtc: nonNegative.nullable(),
  feesBtc: nonNegative.nullable(),
  feePercent: maybe,

  // Market, from the market-data worker.
  /** Mean daily BTC price. */
  priceUsd: maybe,
  /** Each payout at its day's price (production-date price). */
  revenueUsd: maybe,
  grossRevenueUsd: maybe,
  networkHashrateHs: maybe,
  networkHashpriceUsdPerPhsDay: maybe,
  networkHashpriceBtcPerPhsDay: maybe,
  /** The network's typical transaction fee rate: the mean of its daily median block fee rates. */
  networkFeeRateSatsVb: maybe,

  // Operations, from the miner samples.
  /** Seconds the miner samples cover. */
  coveredSec: nonNegative,
  hashrateThs: maybe,
  powerW: maybe,
  energyMWh: nonNegative,
  nominalHashrateThs: maybe,
  nominalPowerW: maybe,
  nominalEnergyMWh: nonNegative,
  /** Share of miner-time online (mining in any power mode). */
  uptimePercent: maybe,
  /** Hashrate over the fleet's nominal hashrate. */
  capacityFactorPercent: maybe,

  // Costs, from Cost Input: each month's totals prorated over the time the bucket covers.
  energyCostUsd: maybe,
  operationsCostUsd: maybe,
  allInCostUsd: maybe,

  // Derived. Net figures use `btc` and `revenueUsd`, gross ones `grossBtc` and `grossRevenueUsd`.
  revenueUsdPerMWh: maybe,
  grossRevenueUsdPerMWh: maybe,
  revenueSatsPerMWh: maybe,
  grossRevenueSatsPerMWh: maybe,
  hashRevenueUsdPerPhsDay: maybe,
  grossHashRevenueUsdPerPhsDay: maybe,
  hashRevenueSatsPerPhsDay: maybe,
  grossHashRevenueSatsPerPhsDay: maybe,
  energyCostUsdPerMWh: maybe,
  operationsCostUsdPerMWh: maybe,
  allInCostUsdPerMWh: maybe,
  hashCostUsdPerPhsDay: maybe,
  hashCostSatsPerPhsDay: maybe,
  /** All-in cost per BTC mined. */
  productionCostUsdPerBtc: maybe,
});
export type FinancialFigures = z.infer<typeof financialFiguresSchema>;

export const financialBucketSchema = financialFiguresSchema.extend({ ts: epochMs });
export type FinancialBucket = z.infer<typeof financialBucketSchema>;

export const financialsReportSchema = z.object({
  range: reportRangeSchema,
  /** The latest BTC price (report price); null without market data. */
  latestPriceUsd: maybe,
  /** Where the subsidy / fee split comes from; null when no payout has one. */
  split: z.enum(SPLIT_SOURCES).nullable(),
  /** Buckets with miner samples or payouts, in time order. */
  buckets: z.array(financialBucketSchema),
  /** The whole period; null when it has no samples and no payouts. */
  summary: financialFiguresSchema.nullable(),
});
export type FinancialsReport = z.infer<typeof financialsReportSchema>;

// --- GET and PUT /api/reporting/costs -------------------------------------------

const usdAmount = z.number().nonnegative().max(1e12).nullable();

/** One month's costs on Cost Input: monthly totals in USD, null when not entered. */
export const monthCostsSchema = z.object({
  month: z.number().int().min(1).max(12),
  energyUsd: usdAmount,
  operationsUsd: usdAmount,
});
export type MonthCosts = z.infer<typeof monthCostsSchema>;

/** A year Cost Input accepts. plugin/lib/costs.js mirrors the bounds (tested). */
export const COST_YEAR_MIN = 2000;
export const COST_YEAR_MAX = 2100;
export const costYearSchema = z.number().int().min(COST_YEAR_MIN).max(COST_YEAR_MAX);

/** A year on Cost Input: always twelve months, January first. */
export const yearCostsSchema = z.object({
  year: costYearSchema,
  months: z.array(monthCostsSchema.extend({ updatedAt: epochMs.nullable() })).length(12),
});
export type YearCosts = z.infer<typeof yearCostsSchema>;

/** The body of PUT /costs: the months to set in one year. A null clears a value. */
export const costsUpdateSchema = z.object({
  year: costYearSchema,
  months: z.array(monthCostsSchema).min(1).max(12),
});
export type CostsUpdate = z.infer<typeof costsUpdateSchema>;

// --- Requests -------------------------------------------------------------------

/** A report's period: [start, end) in ms and the bucket size. The UI always sends all three. */
export type RangeQuery = { start: number; end: number; granularity: Granularity };
