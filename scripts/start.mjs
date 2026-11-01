#!/usr/bin/env node
// One command for a demo: set up if needed, build ui/, then run the mock site
// devices, the dev stack and the local dashboard together. The app's pages are
// at http://localhost:3030/app/reporting. Ctrl+C stops them all.
//
// For day-to-day work, run the pieces in their own terminals instead:
// npm run dev:stack, npm run dev:dashboard, npm run dev:ui.
import { existsSync } from "node:fs";
import { join } from "node:path";
import { DEV, ROOT, SATEC, mdkBin, run, runTogether, step } from "./lib.mjs";

const ready =
  existsSync(mdkBin()) &&
  existsSync(join(SATEC, "node_modules")) &&
  existsSync(join(DEV, "node_modules")) &&
  existsSync(join(ROOT, "ui-src", "node_modules")) &&
  existsSync(join(DEV, "apps", "dashboard", "node_modules"));
if (!ready) {
  step("First run: setting up");
  await run("node", [join(ROOT, "scripts", "setup.mjs")]);
} else {
  step("Building the app UI (ui-src → ui)");
  await run("npm", ["run", "build:ui"]);
}

step("Starting the mock site devices, the dev stack and the dashboard");
runTogether([
  ["node", [join(DEV, "mock-site", "devices.js")]],
  [mdkBin(), ["run", "--dir", DEV]],
  [mdkBin(), ["run", "dashboard", "--dir", DEV]],
]);
