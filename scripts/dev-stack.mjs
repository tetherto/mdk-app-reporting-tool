#!/usr/bin/env node
// The local dev stack: the mock site's devices and legacy workers
// (dev/mock-site/devices.js) next to `mdk run --dir dev` (Kernel, Gateway on
// :3847, the miner and market workers, and this app). Ctrl+C stops both.
import { join } from "node:path";
import { DEV, mdkBin, runTogether, step } from "./lib.mjs";

step("Starting the mock site devices and the dev stack (mdk run --dir dev)");
runTogether([
  ["node", [join(DEV, "mock-site", "devices.js")]],
  [mdkBin(), ["run", "--dir", DEV]],
]);
