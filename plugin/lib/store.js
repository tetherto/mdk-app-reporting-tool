"use strict";

// The app's own store: the history every report reads, and the monthly costs
// entered on Cost Input (the app's only write). SQLite in the app's data directory (node:sqlite, no
// dependency). MDK keeps no history an app can query over months, so the
// collector writes it here as it samples the workers.

const path = require("path");
const { DatabaseSync } = require("node:sqlite");
const { createTotals } = require("./totals");

const SCHEMA_VERSION = 3;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);

-- One row per sample, mining unit and model. Counts and power are what the
-- miners of that unit and model were doing over [ts, ts + interval_s).
CREATE TABLE IF NOT EXISTS miner_samples (
  ts INTEGER NOT NULL,
  unit TEXT NOT NULL,
  model TEXT NOT NULL,
  interval_s INTEGER NOT NULL,
  total INTEGER NOT NULL,
  low INTEGER NOT NULL,
  normal INTEGER NOT NULL,
  high INTEGER NOT NULL,
  sleep INTEGER NOT NULL,
  error INTEGER NOT NULL,
  offline INTEGER NOT NULL,
  maintenance INTEGER NOT NULL,
  hashrate_ths REAL NOT NULL,
  power_w REAL NOT NULL,
  mining_power_w REAL NOT NULL,
  PRIMARY KEY (ts, unit, model)
);

-- Each miner sample time once, with the seconds it covers: the time a
-- report's figures average over.
CREATE TABLE IF NOT EXISTS miner_sample_times (
  ts INTEGER PRIMARY KEY,
  interval_s INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS meter_samples (
  ts INTEGER NOT NULL,
  meter TEXT NOT NULL,
  interval_s INTEGER NOT NULL,
  power_w REAL NOT NULL,
  PRIMARY KEY (ts, meter)
);

-- amount_btc is what the pool paid; pool_fee_btc its fee on top, when it says.
CREATE TABLE IF NOT EXISTS payouts (
  id TEXT PRIMARY KEY,
  ts INTEGER NOT NULL,
  amount_btc REAL NOT NULL,
  subsidy_btc REAL,
  fee_btc REAL,
  pool_fee_btc REAL
);
CREATE INDEX IF NOT EXISTS payouts_ts ON payouts (ts);

CREATE TABLE IF NOT EXISTS prices (ts INTEGER PRIMARY KEY, usd REAL NOT NULL);

-- One row per UTC day; each series is filled by its own channel.
CREATE TABLE IF NOT EXISTS network (
  ts INTEGER PRIMARY KEY,
  hashrate_hs REAL,
  btc_per_phs_day REAL,
  usd_per_phs_day REAL,
  fee_share REAL,
  fee_rate_sats_vb REAL
);

-- Cost Input: monthly totals in USD, months in the site's timezone.
CREATE TABLE IF NOT EXISTS costs (
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  energy_usd REAL,
  operations_usd REAL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (year, month)
);
`;

const MINER_COLUMNS = [
  "ts",
  "unit",
  "model",
  "interval_s",
  "total",
  "low",
  "normal",
  "high",
  "sleep",
  "error",
  "offline",
  "maintenance",
  "hashrate_ths",
  "power_w",
  "mining_power_w",
];

/**
 * @param {string} [dataDir] where reporting.db lives; in memory without one
 * @param {{ timezone?: string }} [options] the site's timezone, which the daily totals follow
 */
function openStore(dataDir, { timezone = "UTC" } = {}) {
  const db = new DatabaseSync(dataDir ? path.join(dataDir, "reporting.db") : ":memory:");
  db.exec("PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL;");
  db.exec(SCHEMA);
  // v1 stores predate these columns; CREATE TABLE IF NOT EXISTS keeps their old shape.
  const addColumn = (table, column) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all();
    if (!columns.some((c) => c.name === column))
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} REAL`);
  };
  addColumn("payouts", "pool_fee_btc");
  addColumn("network", "fee_share");
  addColumn("network", "fee_rate_sats_vb");

  /** Runs `fn` in one transaction, rolled back if it throws. */
  const transaction = (fn) => {
    db.exec("BEGIN");
    try {
      fn();
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }
  };

  const getMeta = db.prepare("SELECT value FROM meta WHERE key = ?");
  const setMeta = db.prepare("INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)");
  const version = getMeta.get("schemaVersion");
  if (version && Number(version.value) > SCHEMA_VERSION) {
    throw new Error(
      `ERR_STORE_NEWER_VERSION: store is v${version.value}, this app reads v${SCHEMA_VERSION}`,
    );
  }
  // v2 records each payout's pool fee. A v1 store keeps its payouts: a pool
  // worker may no longer hold them, and their fee stays null (gross unknown).
  // v3 adds the totals (plugin/lib/totals.js), built here once from the raw
  // samples, and again if the site's timezone changes: their days follow it.
  const totals = createTotals(db, timezone);
  const totalsTimezone = getMeta.get("totalsTimezone");
  if (
    !version ||
    Number(version.value) < 3 ||
    !totalsTimezone ||
    totalsTimezone.value !== timezone
  ) {
    transaction(() => {
      db.exec(
        "INSERT OR REPLACE INTO miner_sample_times (ts, interval_s) SELECT ts, MAX(interval_s) FROM miner_samples GROUP BY ts",
      );
      totals.rebuild();
      setMeta.run("totalsTimezone", timezone);
    });
  }
  setMeta.run("schemaVersion", String(SCHEMA_VERSION));

  const insertMiner = db.prepare(
    `INSERT OR REPLACE INTO miner_samples (${MINER_COLUMNS.join(", ")}) VALUES (${MINER_COLUMNS.map(() => "?").join(", ")})`,
  );
  const insertSampleTime = db.prepare(
    "INSERT OR REPLACE INTO miner_sample_times (ts, interval_s) VALUES (?, ?)",
  );
  const insertMeter = db.prepare(
    "INSERT OR REPLACE INTO meter_samples (ts, meter, interval_s, power_w) VALUES (?, ?, ?, ?)",
  );
  const insertPayout = db.prepare(
    "INSERT OR REPLACE INTO payouts (id, ts, amount_btc, subsidy_btc, fee_btc, pool_fee_btc) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const insertPrice = db.prepare("INSERT OR REPLACE INTO prices (ts, usd) VALUES (?, ?)");
  const upsertNetwork =
    db.prepare(`INSERT INTO network (ts, hashrate_hs, btc_per_phs_day, usd_per_phs_day, fee_share, fee_rate_sats_vb) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT (ts) DO UPDATE SET
      hashrate_hs = COALESCE(excluded.hashrate_hs, hashrate_hs),
      btc_per_phs_day = COALESCE(excluded.btc_per_phs_day, btc_per_phs_day),
      usd_per_phs_day = COALESCE(excluded.usd_per_phs_day, usd_per_phs_day),
      fee_share = COALESCE(excluded.fee_share, fee_share),
      fee_rate_sats_vb = COALESCE(excluded.fee_rate_sats_vb, fee_rate_sats_vb)`);
  const upsertCost = db.prepare(
    "INSERT OR REPLACE INTO costs (year, month, energy_usd, operations_usd, updated_at) VALUES (?, ?, ?, ?, ?)",
  );

  // Reads, prepared once like the writes: /site runs several on every request.
  const between = (table) =>
    db.prepare(`SELECT * FROM ${table} WHERE ts >= ? AND ts < ? ORDER BY ts`);
  const query = {
    lastMinerTs: db.prepare("SELECT MAX(ts) AS ts FROM miner_samples"),
    firstMinerTs: db.prepare("SELECT MIN(ts) AS ts FROM miner_samples"),
    lastPayoutTs: db.prepare("SELECT MAX(ts) AS ts FROM payouts"),
    lastPriceTs: db.prepare("SELECT MAX(ts) AS ts FROM prices"),
    lastNetworkTs: {
      hashrateHs: db.prepare("SELECT MAX(ts) AS ts FROM network WHERE hashrate_hs IS NOT NULL"),
      btcPerPhsDay: db.prepare(
        "SELECT MAX(ts) AS ts FROM network WHERE btc_per_phs_day IS NOT NULL",
      ),
      feeShare: db.prepare("SELECT MAX(ts) AS ts FROM network WHERE fee_share IS NOT NULL"),
      feeRateSatsVb: db.prepare(
        "SELECT MAX(ts) AS ts FROM network WHERE fee_rate_sats_vb IS NOT NULL",
      ),
    },
    minerSamples: between("miner_samples"),
    latestMinerSamples: db.prepare(
      "SELECT * FROM miner_samples WHERE ts = (SELECT MAX(ts) FROM miner_samples)",
    ),
    payouts: between("payouts"),
    recentPayouts: db.prepare("SELECT * FROM payouts ORDER BY ts DESC LIMIT ?"),
    prices: between("prices"),
    latestPrice: db.prepare("SELECT * FROM prices ORDER BY ts DESC LIMIT 1"),
    network: between("network"),
    /** Every row up to `end`: a payout's day may need the last earlier point. */
    pricesBefore: db.prepare("SELECT * FROM prices WHERE ts < ? ORDER BY ts"),
    networkBefore: db.prepare("SELECT * FROM network WHERE ts < ? ORDER BY ts"),
    costsOfYear: db.prepare("SELECT * FROM costs WHERE year = ? ORDER BY month"),
    allCosts: db.prepare("SELECT * FROM costs ORDER BY year, month"),
    anyCost: db.prepare(
      "SELECT 1 AS x FROM costs WHERE energy_usd IS NOT NULL OR operations_usd IS NOT NULL LIMIT 1",
    ),
  };
  const maxTs = (statement) => statement.get().ts ?? null;

  const nullable = (v) =>
    v === null || v === undefined || !Number.isFinite(Number(v)) ? null : Number(v);

  return {
    db,

    getMeta: (key) => {
      const row = getMeta.get(key);
      return row ? row.value : null;
    },
    setMeta: (key, value) => setMeta.run(key, String(value)),

    /** rows: [{ ts, unit, model, intervalS, total, low, normal, high, sleep, error, offline, maintenance, hashrateThs, powerW, miningPowerW }] */
    writeMinerSamples(rows) {
      transaction(() => {
        for (const r of rows) {
          insertMiner.run(
            r.ts,
            r.unit,
            r.model,
            r.intervalS,
            r.total,
            r.low,
            r.normal,
            r.high,
            r.sleep,
            r.error,
            r.offline,
            r.maintenance,
            r.hashrateThs,
            r.powerW,
            r.miningPowerW,
          );
          insertSampleTime.run(r.ts, r.intervalS);
        }
        const stamps = rows.map((r) => r.ts);
        totals.refresh("miner", stamps);
        totals.refresh("coverage", stamps);
      });
    },

    /** rows: [{ ts, meter, intervalS, powerW }] */
    writeMeterSamples(rows) {
      transaction(() => {
        for (const r of rows) insertMeter.run(r.ts, r.meter, r.intervalS, r.powerW);
        totals.refresh(
          "meter",
          rows.map((r) => r.ts),
        );
      });
    },

    /** rows: [{ id, ts, amountBtc, subsidyBtc, feeBtc, poolFeeBtc }] */
    writePayouts(rows) {
      transaction(() => {
        for (const r of rows)
          insertPayout.run(
            String(r.id),
            r.ts,
            r.amountBtc,
            nullable(r.subsidyBtc),
            nullable(r.feeBtc),
            nullable(r.poolFeeBtc),
          );
      });
    },

    /** rows: [{ ts, usd }] */
    writePrices(rows) {
      transaction(() => {
        for (const r of rows) insertPrice.run(r.ts, r.usd);
      });
    },

    /** rows: [{ ts, hashrateHs?, btcPerPhsDay?, usdPerPhsDay?, feeShare?, feeRateSatsVb? }]; fields left out keep their stored value. */
    writeNetwork(rows) {
      transaction(() => {
        for (const r of rows)
          upsertNetwork.run(
            r.ts,
            nullable(r.hashrateHs),
            nullable(r.btcPerPhsDay),
            nullable(r.usdPerPhsDay),
            nullable(r.feeShare),
            nullable(r.feeRateSatsVb),
          );
      });
    },

    /** rows: [{ year, month, energyUsd, operationsUsd }]; null clears a value. */
    writeCosts(rows) {
      const now = Date.now();
      transaction(() => {
        for (const r of rows)
          upsertCost.run(r.year, r.month, nullable(r.energyUsd), nullable(r.operationsUsd), now);
      });
    },

    lastMinerSampleTs: () => maxTs(query.lastMinerTs),
    firstMinerSampleTs: () => maxTs(query.firstMinerTs),
    lastPayoutTs: () => maxTs(query.lastPayoutTs),
    lastPriceTs: () => maxTs(query.lastPriceTs),
    /** Last ts holding `field` ("hashrateHs", "btcPerPhsDay", "feeShare" or "feeRateSatsVb"): each series arrives separately. */
    lastNetworkTs: (field) => maxTs(query.lastNetworkTs[field]),

    minerSamples: (start, end) => query.minerSamples.all(start, end),
    latestMinerSamples: () => query.latestMinerSamples.all(),
    /**
     * Miner sums per segment ([{ start, end }]), unit and model: rows of
     * { k, unit, model, total_s, …, mining_power_w_s }, each figure times the
     * seconds it covers; k is the segment's index. A segment can have several
     * rows per unit and model: add them up.
     */
    minerTotals: (segments) => totals.read("miner", segments),
    /** Seconds the miner samples of each segment cover: rows of { k, covered_s }, to add up. */
    minerCoverage: (segments) => totals.read("coverage", segments),
    /** Meter watt-seconds per segment and meter: rows of { k, meter, power_w_s }, to add up. */
    meterTotals: (segments) => totals.read("meter", segments),
    payouts: (start, end) => query.payouts.all(start, end),
    /** Most recent payouts, newest first. */
    recentPayouts: (limit) => query.recentPayouts.all(limit),
    prices: (start, end) => query.prices.all(start, end),
    latestPrice: () => query.latestPrice.get() || null,
    network: (start, end) => query.network.all(start, end),
    pricesBefore: (end) => query.pricesBefore.all(end),
    networkBefore: (end) => query.networkBefore.all(end),
    /** Cost Input rows of one year, or of every year. */
    costs: (year) => (year === undefined ? query.allCosts.all() : query.costsOfYear.all(year)),
    hasCosts: () => query.anyCost.get() !== undefined,

    close: () => db.close(),
  };
}

module.exports = { openStore, SCHEMA_VERSION };
