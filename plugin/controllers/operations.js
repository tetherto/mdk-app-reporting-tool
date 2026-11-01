"use strict";

const context = require("../lib/context");
const { parseRange } = require("../lib/range");
const { operationsReport } = require("../lib/reports/operations");

module.exports = async function operations(req) {
  const { config, store } = context.get();
  return operationsReport(store, config, parseRange(req.query));
};
