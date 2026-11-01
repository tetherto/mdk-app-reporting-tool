"use strict";

// Cost Input: two monthly totals in USD, energy and operations, entered by hand.
// The app's only write, to its own store; never to MDK or a device.

const { localParts } = require("./time");

function bad(message) {
  const err = new Error(`ERR_BAD_COSTS: ${message}`);
  err.statusCode = 400;
  return err;
}

// Mirrors costYearSchema in ui-src/api/contract.ts (a test keeps them equal).
const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

const isYear = (v) => Number.isInteger(v) && v >= MIN_YEAR && v <= MAX_YEAR;

const isAmount = (v) => v === null || (typeof v === "number" && Number.isFinite(v) && v >= 0);

/** One year as Cost Input shows it: twelve months, null where nothing is entered. */
function yearCosts(store, year) {
  const rows = new Map(store.costs(year).map((r) => [r.month, r]));
  return {
    year,
    months: Array.from({ length: 12 }, (_, i) => {
      const row = rows.get(i + 1);
      return {
        month: i + 1,
        energyUsd: row ? row.energy_usd : null,
        operationsUsd: row ? row.operations_usd : null,
        updatedAt: row ? row.updated_at : null,
      };
    }),
  };
}

/** The year a request names, else this year in the site's timezone. */
function yearOf(query, timezone, now = Date.now()) {
  if (query && query.year !== undefined) {
    const year = Number(query.year);
    if (!isYear(year)) throw bad(`year must be between ${MIN_YEAR} and ${MAX_YEAR}`);
    return year;
  }
  return localParts(now, timezone).year;
}

/** Writes a PUT body ({ year, months: [{ month, energyUsd, operationsUsd }] }) and answers the year. */
function setCosts(store, body) {
  if (!body || body.year === undefined) throw bad("year is required");
  const { year } = body;
  if (!isYear(year)) throw bad(`year must be between ${MIN_YEAR} and ${MAX_YEAR}`);
  if (!Array.isArray(body.months) || body.months.length === 0)
    throw bad("months must list at least one month");
  const seen = new Set();
  for (const m of body.months) {
    if (!m || !Number.isInteger(m.month) || m.month < 1 || m.month > 12)
      throw bad("month must be 1 to 12");
    if (seen.has(m.month)) throw bad(`month ${m.month} appears twice`);
    seen.add(m.month);
    if (!isAmount(m.energyUsd) || !isAmount(m.operationsUsd))
      throw bad("energyUsd and operationsUsd must be non-negative numbers or null");
  }
  store.writeCosts(
    body.months.map((m) => ({
      year,
      month: m.month,
      energyUsd: m.energyUsd,
      operationsUsd: m.operationsUsd,
    })),
  );
  return yearCosts(store, year);
}

module.exports = { MIN_YEAR, MAX_YEAR, yearCosts, yearOf, setCosts };
