"use strict";

// Where each mock device listens and how its public worker reaches it. Read by
// dev/mock-site/generate.mjs (to write dev/mdk.yaml) and by devices.js (to
// start the mock servers), so the two always agree on ports and credentials.
//
// The credentials are the mocks' own defaults, not secrets.

const fleet = require("./fleet.json");
const { minerIds } = require("./sim");

const HOST = "127.0.0.1";
// The Ocean account the pool worker reads, and the mock pays.
const OCEAN_ACCOUNT = "mock-site";

// Per public worker package: the device opts its plugin reads.
const DRIVERS = {
  "antminer-mdk-worker": (port) => ({ address: HOST, port, username: "root", password: "root" }),
  "whatsminer-mdk-worker": (port) => ({
    address: HOST,
    port,
    apiVersion: "3.0.3",
    password: "super",
  }),
};

/** Every mock miner: { id, unit, opts } with opts as its worker's device config. */
function minerDevices() {
  const out = [];
  for (const unit of fleet.units) {
    const driver = DRIVERS[unit.package];
    if (!driver) throw new Error(`ERR_MOCK_UNKNOWN_PACKAGE: ${unit.package}`);
    minerIds(unit).forEach((id, i) =>
      out.push({ id, unit, opts: driver(unit.mockPortBase + i + 1) }),
    );
  }
  return out;
}

/** Every mock meter (one per unit, then the site meter): { id, opts }. */
function meterDevices() {
  const ids = [...fleet.units.map((u) => u.meter), fleet.siteMeter];
  return ids.map((id, i) => ({
    id,
    opts: { address: HOST, port: fleet.meterMockPortBase + i, unitId: 1 },
  }));
}

module.exports = { HOST, OCEAN_ACCOUNT, fleet, minerDevices, meterDevices };
