"use strict";

const context = require("../lib/context");
const { parseRange } = require("../lib/range");
const { consumptionReport } = require("../lib/reports/consumption");

module.exports = async function consumption(req) {
  const { config, store } = context.get();
  return consumptionReport(store, config, parseRange(req.query));
};
