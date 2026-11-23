"use strict";

// The app's Kernel client. The app runtime owns it: it dials with the app's own
// key, signs in as the app's service account (app:<name>), and closes it when
// the app stops, so what this app may do is what spec.rbac grants it. This is
// the CLI's app template (packages/cli/templates/app/plugin/lib/client.js).
const { config } = require("@tetherto/mdk-gateway/plugin");

// Fail here, by name, rather than on the collector's first call.
if (!config.mdkClient)
  throw new Error("ERR_MDK_CLIENT_MISSING: the app runtime passed no config.mdkClient");

module.exports = config.mdkClient;
