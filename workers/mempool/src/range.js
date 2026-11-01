"use strict";

/** The [start, end] of a channel query in ms; the last `defaultDays` days when unset. */
module.exports = function range(params = {}, defaultDays = 30) {
  const end = Number.isFinite(Number(params.end)) ? Number(params.end) : Date.now();
  const start = Number.isFinite(Number(params.start))
    ? Number(params.start)
    : end - defaultDays * 24 * 60 * 60 * 1000;
  return { start, end };
};
