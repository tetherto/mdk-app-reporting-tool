"use strict";

const client = require("../client");

module.exports = async () => ({ ts: Date.now(), usd: await client.price() });
