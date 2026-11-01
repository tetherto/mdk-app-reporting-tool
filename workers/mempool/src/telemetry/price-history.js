"use strict";

const client = require("../client");
const range = require("../range");

module.exports = async (params) => {
  const { start, end } = range(params);
  return (await client.priceHistory()).filter((p) => p.ts >= start && p.ts <= end);
};
