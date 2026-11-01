"use strict";

const context = require("../lib/context");
const { parseRange } = require("../lib/range");
const { financialsReport } = require("../lib/reports/financials");

module.exports = async function financials(req) {
  const { config, store } = context.get();
  return financialsReport(
    store,
    config,
    parseRange(req.query, { days: 365, granularity: "month" }),
  );
};
