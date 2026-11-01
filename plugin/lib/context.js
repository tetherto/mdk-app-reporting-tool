"use strict";

// What main sets up and the controllers read: the config, the store and the
// collector. The runtime runs main before it serves, so a request never finds
// this empty unless main failed.
const ctx = { config: null, store: null, collector: null };

module.exports = {
  set(values) {
    Object.assign(ctx, values);
  },
  get() {
    if (!ctx.store) {
      const err = new Error("ERR_APP_NOT_READY");
      err.statusCode = 503;
      throw err;
    }
    return ctx;
  },
};
