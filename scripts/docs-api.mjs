#!/usr/bin/env node
// Writes the app's HTTP reference, docs/http-api.md, and its OpenAPI 3.1
// document, docs/openapi.json, from plugin/mdk-plugin.json, with MDK's own
// app-runtime functions (the ones that generate the Gateway's reference). With
// `--check` it only compares, and exits 1 when either file is stale.
//
//   npm run docs:api
//   npm run docs:api:check
//
// The route table is validated first, against MDK's route-table schema: it
// declares `routeTableVersion`, so the OpenAPI-shaped rules are errors.
//
// Needs @tetherto/mdk-app-runtime 0.14.0 or later. Until that is on npm, point
// MDK_APP_RUNTIME at a checkout's backend/core/app-runtime directory.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

// The app's `spec.apps` name, which the RBAC resource in each operation's
// Access is built from; the Gateway serves the app under /apps/<name>.
const APP_NAME = "reporting";
const OUT = {
  openapi: join(root, "docs", "openapi.json"),
  reference: join(root, "docs", "http-api.md"),
};

function appRuntime() {
  const from = process.env.MDK_APP_RUNTIME;
  try {
    return require(from ? resolve(from) : "@tetherto/mdk-app-runtime");
  } catch (err) {
    console.error(
      `docs:api needs @tetherto/mdk-app-runtime 0.14.0 or later (${err.code ?? err.message}).\n` +
        "Until it is on npm, set MDK_APP_RUNTIME to a checkout's backend/core/app-runtime.",
    );
    return process.exit(1);
  }
}

const runtime = appRuntime();
for (const fn of [
  "validateRouteTable",
  "routeTableToOpenApi",
  "renderReference",
  "loadAppManifest",
]) {
  if (typeof runtime[fn] !== "function") {
    console.error(`@tetherto/mdk-app-runtime has no ${fn}: it is older than 0.14.0`);
    process.exit(1);
  }
}

const tablePath = join(root, "plugin", runtime.PLUGIN_FILE ?? "mdk-plugin.json");
const table = JSON.parse(readFileSync(tablePath, "utf8"));
const { ok, errors, warnings } = runtime.validateRouteTable(table);
for (const w of warnings) console.warn(`warning: ${w}`);
if (!ok) {
  for (const e of errors) console.error(`error: ${e}`);
  process.exit(1);
}

const { manifest } = runtime.loadAppManifest(root);
const { document, gaps } = runtime.routeTableToOpenApi(table, { appName: APP_NAME, app: manifest });
const outputs = {
  [OUT.openapi]: `${JSON.stringify(document, null, 2)}\n`,
  [OUT.reference]: runtime.renderReference(document, gaps, {
    generatedBy: "scripts/docs-api.mjs",
    source: "plugin/mdk-plugin.json",
    openapiFile: "openapi.json",
  }),
};

if (process.argv.includes("--check")) {
  const stale = Object.entries(outputs).filter(([file, text]) => {
    try {
      return readFileSync(file, "utf8") !== text;
    } catch {
      return true;
    }
  });
  for (const [file] of stale)
    console.error(`${file.slice(root.length + 1)} is stale: run \`npm run docs:api\``);
  if (stale.length) process.exit(1);
  console.log("docs/openapi.json and docs/http-api.md are up to date");
} else {
  for (const [file, text] of Object.entries(outputs)) {
    writeFileSync(file, text);
    console.log(`wrote ${file.slice(root.length + 1)}`);
  }
}
