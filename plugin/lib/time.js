"use strict";

// Period buckets in the site's timezone. A day bucket starts at local midnight,
// a week bucket on Monday, a month bucket on the 1st, so a report reads the same
// as the site's own calendar wherever the server runs.

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

const GRANULARITIES = ["hour", "day", "week", "month"];

const formatters = new Map();

function formatter(timezone) {
  let f = formatters.get(timezone);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    formatters.set(timezone, f);
  }
  return f;
}

/** The wall-clock fields of `ts` in `timezone`. */
function localParts(ts, timezone) {
  const parts = {};
  for (const { type, value } of formatter(timezone).formatToParts(new Date(ts))) {
    if (type !== "literal") parts[type] = Number(value);
  }
  return parts;
}

/** `timezone`'s offset from UTC at `ts`, in ms. */
function offsetAt(ts, timezone) {
  const p = localParts(ts, timezone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(ts / 1000) * 1000;
}

/** The UTC instant of a wall-clock time in `timezone`. */
function zonedToUtc(year, month, day, hour, timezone) {
  const guess = Date.UTC(year, month - 1, day, hour);
  const first = guess - offsetAt(guess, timezone);
  // A second pass settles instants next to a DST change.
  return guess - offsetAt(first, timezone);
}

/**
 * The calendar months in `timezone` from the one holding `from` up to `to`
 * (exclusive): { year, month, start, end }, start and end as UTC instants.
 */
function* eachMonth(from, to, timezone) {
  let { year, month } = localParts(from, timezone);
  for (;;) {
    const start = zonedToUtc(year, month, 1, 0, timezone);
    if (start >= to) return;
    const end = zonedToUtc(year, month + 1, 1, 0, timezone);
    yield { year, month, start, end };
    if (month === 12) {
      year += 1;
      month = 1;
    } else month += 1;
  }
}

/** Start of the bucket holding `ts`. */
function bucketStart(ts, granularity, timezone) {
  const p = localParts(ts, timezone);
  switch (granularity) {
    case "hour":
      return zonedToUtc(p.year, p.month, p.day, p.hour, timezone);
    case "day":
      return zonedToUtc(p.year, p.month, p.day, 0, timezone);
    case "week": {
      // ISO weeks: Monday first.
      const weekday = (new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() + 6) % 7;
      const monday = new Date(Date.UTC(p.year, p.month - 1, p.day - weekday));
      return zonedToUtc(
        monday.getUTCFullYear(),
        monday.getUTCMonth() + 1,
        monday.getUTCDate(),
        0,
        timezone,
      );
    }
    case "month":
      return zonedToUtc(p.year, p.month, 1, 0, timezone);
    default:
      throw new Error(`ERR_BAD_GRANULARITY: ${granularity}`);
  }
}

/** Start of the bucket after the one starting at `start`. */
function nextBucket(start, granularity, timezone) {
  const p = localParts(start, timezone);
  switch (granularity) {
    case "hour":
      return start + HOUR;
    case "day":
      return zonedToUtc(p.year, p.month, p.day + 1, 0, timezone);
    case "week":
      return zonedToUtc(p.year, p.month, p.day + 7, 0, timezone);
    case "month":
      return zonedToUtc(p.year, p.month + 1, 1, 0, timezone);
    default:
      throw new Error(`ERR_BAD_GRANULARITY: ${granularity}`);
  }
}

/** Every bucket start overlapping [start, end). */
function bucketsBetween(start, end, granularity, timezone) {
  const out = [];
  for (
    let b = bucketStart(start, granularity, timezone);
    b < end;
    b = nextBucket(b, granularity, timezone)
  )
    out.push(b);
  return out;
}

/**
 * The buckets of [start, end), each clipped to it: [{ bucket, start, end }].
 * With `byMonth`, a bucket is also split where a site month ends, and each
 * part carries its month: { year, month, monthStart, monthEnd }.
 */
function bucketSpans(start, end, granularity, timezone, { byMonth = false } = {}) {
  const out = [];
  for (const bucket of bucketsBetween(start, end, granularity, timezone)) {
    const s = Math.max(start, bucket);
    const e = Math.min(end, nextBucket(bucket, granularity, timezone));
    if (!byMonth) {
      out.push({ bucket, start: s, end: e });
      continue;
    }
    for (const m of eachMonth(s, e, timezone)) {
      out.push({
        bucket,
        start: Math.max(s, m.start),
        end: Math.min(e, m.end),
        year: m.year,
        month: m.month,
        monthStart: m.start,
        monthEnd: m.end,
      });
    }
  }
  return out;
}

/** A memoised bucketStart for one query: rows arrive in time order, so most hit the last bucket. */
function bucketer(granularity, timezone) {
  let lo = -Infinity;
  let hi = -Infinity;
  return (ts) => {
    if (ts < lo || ts >= hi) {
      lo = bucketStart(ts, granularity, timezone);
      hi = nextBucket(lo, granularity, timezone);
    }
    return lo;
  };
}

module.exports = {
  HOUR,
  DAY,
  GRANULARITIES,
  localParts,
  zonedToUtc,
  eachMonth,
  bucketStart,
  nextBucket,
  bucketsBetween,
  bucketSpans,
  bucketer,
};
