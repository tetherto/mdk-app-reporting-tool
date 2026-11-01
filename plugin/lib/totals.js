"use strict";

// Running totals of the raw samples, so a report over months reads thousands of
// rows instead of millions. Two layers sit over the raw samples:
//   - quarter hours, on a fixed UTC grid
//   - days of the site's timezone
// Each row holds every figure times the seconds it covers, per mining unit and
// model (or meter), and the coverage family holds the seconds the miner samples
// cover. A report segment reads its whole site days from the days, the rest of
// its quarter-aligned time from the quarters, and only its unaligned ends from
// the raw samples. Totals are rebuilt from what they sum, never added to, so a
// sample written again (a refresh within the same interval) leaves them exact.

const { bucketStart, nextBucket } = require("./time");

const QUARTER_MS = 15 * 60 * 1000;

const quarterOf = (ts) => Math.floor(ts / QUARTER_MS) * QUARTER_MS;

const MINER_FIGURES = [
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

// Each family: the raw table it sums, the columns it keeps apart, and each
// total's column with the raw expression it sums.
const FAMILIES = {
  miner: {
    raw: "miner_samples",
    keys: ["unit", "model"],
    sums: MINER_FIGURES.map((f) => [`${f}_s`, `${f} * interval_s`]),
  },
  meter: { raw: "meter_samples", keys: ["meter"], sums: [["power_w_s", "power_w * interval_s"]] },
  coverage: { raw: "miner_sample_times", keys: [], sums: [["covered_s", "interval_s"]] },
};

const LAYERS = ["quarters", "days"];

const tableOf = (family, layer) => `${family}_${layer}`;

function schema() {
  const out = [];
  for (const [name, f] of Object.entries(FAMILIES)) {
    for (const layer of LAYERS) {
      const columns = [
        "ts INTEGER NOT NULL",
        ...f.keys.map((k) => `${k} TEXT NOT NULL`),
        ...f.sums.map(([col]) => `${col} REAL NOT NULL`),
      ];
      out.push(
        `CREATE TABLE IF NOT EXISTS ${tableOf(name, layer)} (${columns.join(", ")}, PRIMARY KEY (${["ts", ...f.keys].join(", ")}));`,
      );
    }
  }
  return out.join("\n");
}

// Report segments as a query parameter: [{ k, s, e }], read back as rows of `seg`.
const SEGMENTS = `seg AS (SELECT value ->> '$.k' AS k, value ->> '$.s' AS s, value ->> '$.e' AS e FROM json_each(?))`;

function createTotals(db, timezone) {
  db.exec(schema());

  const day = (ts) => bucketStart(ts, "day", timezone);
  const nextDay = (ts) => nextBucket(ts, "day", timezone);
  const aligned = (ts) => ts % QUARTER_MS === 0;

  const statements = {};
  for (const [name, f] of Object.entries(FAMILIES)) {
    const keys = f.keys.map((k) => `, ${k}`).join("");
    const cols = f.sums.map(([col]) => col).join(", ");
    const quarters = tableOf(name, "quarters");
    const days = tableOf(name, "days");
    const sumOf = (exprs) => exprs.map((e) => `SUM(${e})`).join(", ");
    const raw = sumOf(f.sums.map(([, expr]) => expr));
    const summed = sumOf(f.sums.map(([col]) => col));
    const groupBy = (lead) => [lead, ...f.keys].filter(Boolean).join(", ");
    const read = (table, sums) =>
      db.prepare(
        `WITH ${SEGMENTS} SELECT seg.k AS k${keys}, ${sums.map((s, i) => `${s} AS ${f.sums[i][0]}`).join(", ")}
        FROM seg JOIN ${table} ON ts >= seg.s AND ts < seg.e GROUP BY ${groupBy("seg.k")}`,
      );
    statements[name] = {
      clear: {
        quarters: db.prepare(`DELETE FROM ${quarters} WHERE ts >= ? AND ts < ?`),
        days: db.prepare(`DELETE FROM ${days} WHERE ts >= ? AND ts < ?`),
      },
      fillQuarters: db.prepare(
        `INSERT INTO ${quarters} (ts${keys}, ${cols})
        SELECT (ts / ${QUARTER_MS}) * ${QUARTER_MS}${keys}, ${raw} FROM ${f.raw}
        WHERE ts >= ? AND ts < ? GROUP BY ${groupBy("1")}`,
      ),
      // A day on the quarter grid sums its quarters; any other sums raw samples.
      fillDayFromQuarters: db.prepare(
        `INSERT INTO ${days} (ts${keys}, ${cols})
        SELECT ?${keys}, ${summed} FROM ${quarters}
        WHERE ts >= ? AND ts < ? ${f.keys.length ? `GROUP BY ${f.keys.join(", ")}` : ""} HAVING COUNT(*) > 0`,
      ),
      fillDayFromRaw: db.prepare(
        `INSERT INTO ${days} (ts${keys}, ${cols})
        SELECT ?${keys}, ${raw} FROM ${f.raw}
        WHERE ts >= ? AND ts < ? ${f.keys.length ? `GROUP BY ${f.keys.join(", ")}` : ""} HAVING COUNT(*) > 0`,
      ),
      extent: db.prepare(`SELECT MIN(ts) AS lo, MAX(ts) AS hi FROM ${f.raw}`),
      read: {
        raw: read(
          f.raw,
          f.sums.map(([, expr]) => `SUM(${expr})`),
        ),
        quarters: read(
          quarters,
          f.sums.map(([col]) => `SUM(${col})`),
        ),
        days: read(
          days,
          f.sums.map(([col]) => `SUM(${col})`),
        ),
      },
    };
  }

  /** Rebuilds a family's totals over the raw samples in [lo, hi]. */
  function refreshFamily(name, lo, hi) {
    const s = statements[name];
    const from = quarterOf(lo);
    const to = quarterOf(hi) + QUARTER_MS;
    s.clear.quarters.run(from, to);
    s.fillQuarters.run(from, to);
    // Every site day that overlaps [lo, hi]. Days tile time from one day start
    // to the next, so they are walked rather than looked up per sample.
    for (let d = day(lo); d <= hi; d = nextDay(d)) {
      const end = nextDay(d);
      s.clear.days.run(d, end);
      const fill = aligned(d) && aligned(end) ? s.fillDayFromQuarters : s.fillDayFromRaw;
      fill.run(d, d, end);
    }
  }

  /**
   * Each segment split by layer: whole site days, the quarter-aligned rest,
   * and the unaligned ends. `k` is the segment's index.
   */
  function split(segments) {
    const parts = { days: [], quarters: [], raw: [] };
    const byQuarter = (k, s, e) => {
      const qs = Math.ceil(s / QUARTER_MS) * QUARTER_MS;
      const qe = quarterOf(e);
      if (qs >= qe) {
        parts.raw.push({ k, s, e });
        return;
      }
      if (s < qs) parts.raw.push({ k, s, e: qs });
      parts.quarters.push({ k, s: qs, e: qe });
      if (qe < e) parts.raw.push({ k, s: qe, e });
    };
    segments.forEach(({ start, end }, k) => {
      const first = day(start);
      const ds = first === start ? start : nextDay(first);
      const de = day(end);
      if (ds >= de) {
        byQuarter(k, start, end);
        return;
      }
      if (start < ds) byQuarter(k, start, ds);
      parts.days.push({ k, s: ds, e: de });
      if (de < end) byQuarter(k, de, end);
    });
    return parts;
  }

  return {
    /** Brings a family's totals up to date with raw samples just written at `stamps`. */
    refresh(name, stamps) {
      if (stamps.length === 0) return;
      let lo = Infinity;
      let hi = -Infinity;
      for (const ts of stamps) {
        lo = Math.min(lo, ts);
        hi = Math.max(hi, ts);
      }
      refreshFamily(name, lo, hi);
    },

    /** Rebuilds every total from the raw samples. */
    rebuild() {
      for (const name of Object.keys(FAMILIES)) {
        const s = statements[name];
        s.clear.quarters.run(0, Number.MAX_SAFE_INTEGER);
        s.clear.days.run(0, Number.MAX_SAFE_INTEGER);
        const { lo, hi } = s.extent.get();
        if (lo !== null) refreshFamily(name, lo, hi);
      }
    },

    /**
     * A family's sums per segment ([{ start, end }]): rows of { k, …keys, …sums },
     * k the segment's index. A segment can have a row per layer for the same
     * keys: add them up.
     */
    read(name, segments) {
      const parts = split(segments);
      const s = statements[name].read;
      return LAYERS.concat("raw").flatMap((layer) =>
        parts[layer].length ? s[layer].all(JSON.stringify(parts[layer])) : [],
      );
    },
  };
}

module.exports = { createTotals, MINER_FIGURES, QUARTER_MS };
