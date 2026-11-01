"use strict";

// The app's Kernel client: the one the app runtime owns and hands every app as
// `config.mdkClient`, signed in as the app's service account (app:<name>). The
// loader overrides `require('@tetherto/mdk-gateway/plugin')` per plugin, so
// `config` is this app's.
const { config } = require("@tetherto/mdk-gateway/plugin");

if (!config.mdkClient) {
  throw Object.assign(new Error("the app runtime handed no Kernel client (config.mdkClient)"), {
    code: "ERR_KERNEL_CLIENT_MISSING",
    statusCode: 500,
  });
}

module.exports = config.mdkClient;
