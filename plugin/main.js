"use strict";

// The app's background logic, run once before the routes serve: open the
// store, backfill the mock site's history when configured, start the collector.

const context = require("./lib/context");
const { loadConfig } = require("./lib/site-config");
const { openStore } = require("./lib/store");
const { createCollector } = require("./lib/collector");

module.exports = async function main(appConfig, { logger }) {
  const config = loadConfig(appConfig);
  const store = openStore(appConfig.dataDir, { timezone: config.site.timezone });

  if (config.seed) {
    // Mock site only. The seed fills the store up to now from the simulation,
    // so every period has data on first run and after a restart.
    const started = Date.now();
    const { seed } = require(config.seed);
    const done = await seed({ store, config });
    logger.info("seeded mock history (%s) in %d ms", JSON.stringify(done), Date.now() - started);
  }

  const client = require("./lib/client");
  const collector = createCollector({ client, store, config, logger });
  context.set({ config, store, collector });
  collector.start();

  // The runtime has no stop hook: close the store cleanly when the process
  // exits. Both calls are synchronous, as an exit listener needs; a signal
  // listener would instead cancel the runtime's default exit on that signal.
  // The Kernel client is the runtime's, and the runtime closes it.
  process.once("exit", () => {
    collector.stop();
    store.close();
  });
};
