#!/usr/bin/env node
// Installs this repo's packages and what the dev stack needs, and builds ui/
// and the local dashboard. MDK comes from npm (@tetherto/mdk-*, the version
// package.json pins: the CLI, the client, the Kernel, the Gateway, the UI
// packages and the dashboard shell `mdk create dashboard` scaffolds), except:
//
//   dev/.mdk-satec/   MDK's SATEC meter worker, which isn't on npm: its files
//                     (and the MDK core files it requires by relative path) from
//                     the github.com/tetherto/mdk release tag that matches the
//                     installed CLI.
//
// It installs:
//   node_modules/     the mdk CLI and @tetherto/mdk-client
//   dev/              the mock site's public workers and this app (file:..),
//                     so `mdk run --dir dev` resolves them by package name
//   ui-src/           the MDK UI packages and tooling
// and builds ui/ and the local dashboard (dev/apps/dashboard).
//
// It records the CLI version it set up (in node_modules/.mdk-setup) once a run
// has finished. When it has moved, or no run has recorded it, it fetches the
// SATEC worker and creates the dashboard again, instead of trusting what an
// older MDK left behind. A run that fails records nothing, so the next one
// retries.
//
// Under CI the SATEC worker, the local dashboard and ui/ are not set up: no job
// runs the stack, and the jobs that need ui/ build it themselves.
//
// Set NPM to wrap npm (e.g. NPM="sfw npm") if your environment requires it.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DEV, ROOT, SATEC, mdkBin, run, step } from "./lib.mjs";

const [npm, ...npmPre] = (process.env.NPM || "npm").split(" ");
const npmRun = (args, opts) => run(npm, [...npmPre, ...args], opts);
const quiet = ["--no-audit", "--no-fund"];
const ci = Boolean(process.env.CI);

const readText = (file) => {
  try {
    return readFileSync(file, "utf8").trim();
  } catch {
    return null;
  }
};

// --- npm ---------------------------------------------------------------------

step("Installing the mdk CLI and the dev stack");
await npmRun([ci ? "ci" : "install", ...quiet]);
await npmRun(["--prefix", "dev", ci ? "ci" : "install", ...quiet]);

// What this run sets up, against what the last finished run recorded.
const mdkVersion = JSON.parse(
  readFileSync(join(ROOT, "node_modules", "@tetherto", "mdk-cli", "package.json"), "utf8"),
).version;
const SETUP_MARKER = join(ROOT, "node_modules", ".mdk-setup");
const moved = readText(SETUP_MARKER) !== mdkVersion;

step("Installing the app UI (ui-src)");
await npmRun(["--prefix", "ui-src", ci ? "ci" : "install", ...quiet]);

// --- the SATEC worker, from the release tag ----------------------------------

// The paths of the release the SATEC worker loads: its own, the mock base
// classes its mock extends, and the MDK core packages it requires by relative
// path, with the monorepo's root package.json and lockfile to install them.
const SATEC_PATHS = [
  "package.json",
  "package-lock.json",
  "backend/core",
  "backend/workers/mock",
  "backend/workers/power-meter/satec",
];
if (!ci && (moved || !existsSync(join(SATEC, "node_modules")))) {
  const tag = `v${mdkVersion}`;
  step(`Fetching MDK's SATEC worker from tetherto/mdk ${tag}`);
  const res = await fetch(`https://codeload.github.com/tetherto/mdk/tar.gz/refs/tags/${tag}`);
  if (!res.ok) throw new Error(`fetching tetherto/mdk ${tag} failed: HTTP ${res.status}`);
  const tmp = mkdtempSync(join(tmpdir(), "mdk-satec-"));
  const archive = join(tmp, "mdk.tar.gz");
  writeFileSync(archive, Buffer.from(await res.arrayBuffer()));
  rmSync(SATEC, { recursive: true, force: true });
  mkdirSync(SATEC, { recursive: true });
  const top = `mdk-${mdkVersion}`;
  execFileSync("tar", [
    "-xzf",
    archive,
    "-C",
    SATEC,
    "--strip-components",
    "1",
    ...SATEC_PATHS.map((p) => `${top}/${p}`),
  ]);
  rmSync(tmp, { recursive: true, force: true });
  // With dev dependencies: the SATEC mock's Modbus server (modbus-stream) is one.
  await npmRun(
    [
      "install",
      "-w",
      "@tetherto/mdk-worker-satec",
      "-w",
      "@tetherto/mdk-core",
      "-w",
      "@tetherto/mdk-worker",
      "--ignore-scripts",
      ...quiet,
    ],
    { cwd: SATEC },
  );
}

if (ci) {
  console.log(`\n✔ Setup done (${ROOT}).`);
  process.exit(0);
}
await npmRun(["run", "build:ui"]);

// --- the local dashboard ------------------------------------------------------

// `mdk create dashboard` scaffolds the shell of the CLI's release and points
// its .env at this stack's Gateway.
const DASHBOARD = join(DEV, "apps", "dashboard");
const dashboardInstalled = () => existsSync(join(DASHBOARD, "node_modules", ".bin", "vite"));
if (moved || !dashboardInstalled()) {
  step("Creating the local MDK dashboard (dev/apps/dashboard)");
  await run(mdkBin(), ["create", "dashboard", "--dir", DEV, "--force", "--no-install"]);
  // With peer dependencies: the devkit's form components need react-hook-form.
  await npmRun(["install", ...quiet], { cwd: DASHBOARD });
}
// Recorded last: a run that failed on the way leaves the old record, and the
// next run fetches and creates again.
writeFileSync(SETUP_MARKER, `${mdkVersion}\n`);

console.log(
  `\n✔ Setup done (${ROOT}). Next: npm start, or npm run dev:stack + npm run dev:dashboard`,
);
