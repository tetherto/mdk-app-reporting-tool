"use strict";

const client = require("../client");
const range = require("../range");

module.exports = async (params) => {
  const { start, end } = range(params);
  return (await client.networkHashrate()).filter((h) => h.ts >= start && h.ts <= end);
};
