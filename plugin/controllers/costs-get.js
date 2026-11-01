"use strict";

const context = require("../lib/context");
const { yearCosts, yearOf } = require("../lib/costs");

module.exports = async function costsGet(req) {
  const { config, store } = context.get();
  return yearCosts(store, yearOf(req.query, config.site.timezone));
};
