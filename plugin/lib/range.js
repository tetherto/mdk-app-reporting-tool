"use strict";

const { GRANULARITIES, DAY } = require("./time");

const MAX_RANGE_MS = 3 * 366 * DAY;

// Finer granularities have a ceiling on the range, so a response stays small.
const MAX_RANGE_FOR = {
  hour: 93 * DAY,
  day: MAX_RANGE_MS,
  week: MAX_RANGE_MS,
  month: MAX_RANGE_MS,
};

function bad(message) {
  const err = new Error(`ERR_BAD_RANGE: ${message}`);
  err.statusCode = 400;
  return err;
}

/** { start, end, granularity } from a request's query: start/end in ms, end exclusive. */
function parseRange(query = {}, defaults = {}) {
  const end = query.end !== undefined ? Number(query.end) : Date.now();
  const start = query.start !== undefined ? Number(query.start) : end - (defaults.days || 30) * DAY;
  const granularity = query.granularity || defaults.granularity || "day";
  if (!Number.isFinite(start) || !Number.isFinite(end))
    throw bad("start and end must be timestamps in ms");
  if (start >= end) throw bad("start must be before end");
  if (!GRANULARITIES.includes(granularity))
    throw bad(`granularity must be one of ${GRANULARITIES.join(", ")}`);
  if (end - start > MAX_RANGE_FOR[granularity])
    throw bad(`range too long for ${granularity} granularity`);
  return { start, end, granularity };
}

module.exports = { parseRange };
