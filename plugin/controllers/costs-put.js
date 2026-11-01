"use strict";

const context = require("../lib/context");
const { setCosts } = require("../lib/costs");

module.exports = async function costsPut(req) {
  const { store } = context.get();
  return setCosts(store, req.body);
};
