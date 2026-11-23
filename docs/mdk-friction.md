# MDK friction log

Where building on MDK (npm `@tetherto/mdk-*` 0.13.0) needed a workaround, and what would remove it. Each entry names the workaround in this repo.

## Packaging

- **The UI side and RBAC came later to npm than to `develop`.** npm 0.12.2 lacked the report helpers, sidebar sections, the shell fixes, RBAC with sign-in and the runtime's `config.mdkClient`, so the app took its UI packages and dashboard from an MDK `develop` checkout, ran without RBAC and built its own Kernel client.
  - Fixed upstream: 0.13.0 ships them all. The app takes all of MDK from npm (bar SATEC, below), the checkout is gone, and `spec.rbac`, the dev users and `config.mdkClient` are back.
- **The npm UI packages don't load in Node.** `@tetherto/mdk-ui-foundation` and `@tetherto/mdk-react-devkit` ship ESM whose `dist/index.js` imports directories (`export * from './primitives'`), which Node's ESM loader refuses (`ERR_UNSUPPORTED_DIR_IMPORT`). Bundlers resolve them, so the dashboard is fine, but a test runner that hands `node_modules` to Node fails to import them. With the old `file:` links Vitest compiled them itself and never hit it.
  - Workaround: `ui-src/vitest.config.ts` inlines `@tetherto/mdk-*` (`server.deps.inline`), so Vite transforms them.
  - Would remove it: full specifiers (`./primitives/index.js`) in the published `dist`.
- **SATEC isn't published.** MDK's power-meter workers are only in the monorepo, and SATEC requires MDK core files by relative path.
  - Workaround: `npm run setup` downloads the `tetherto/mdk` release tag that matches the installed CLI, extracts SATEC with the core packages it requires into `dev/.mdk-satec/`, and installs their dependencies (with dev dependencies: its mock's Modbus server is one).
  - Would remove it: `@tetherto/mdk-worker-satec` on npm, or a v2 port.

## Workers

- **`mdk run` can't host legacy workers.** SATEC, ABB, Schneider, F2Pool and Avalon are boot.js workers (`WorkerRuntime`, handlers read `ctx.device`). `mdk run` only hosts contract-first plugins on `WorkerRuntimeV2`, and `mdk.yaml` has no entry for a custom host process.
  - Workaround: `dev/mock-site/devices.js` boots SATEC and publishes its key to `dev/.mdk/keys`. The pool runs on the public contract-first Ocean worker, which `mdk run` hosts.
  - Would remove it: v2 ports of these workers, or a CLI host for boot.js workers.
- **Public miner workers can't use `config.mock: true`.** `antminer-mdk-worker` and `whatsminer-mdk-worker` ship their mocks as `mock/cgi-server.js` and `mock/api-v3-server.js`, but `mdk run` looks for `mock/server.js`.
  - Workaround: `devices.js` starts the mocks itself.
- **The Ocean worker keeps only what it fetched since it started.** The public worker's `transactions` channel answers from memory, and it only fetches the previous day's earnings, so it has no history before it started and loses it on restart.
  - Workaround: none in the app (the collector stores every payout it pulls). The mock site's history comes from `seed.js`.
  - Would remove it: a backfill in the worker, or `transactions` answering a range from the pool's API.
- **The Whatsminer mock shares state between instances.** `createServer` merges its default state shallowly, so every mock shares one `summary` and one `setting` object.
  - Workaround: `devices.js` passes each mock its own copies.
- **The SATEC mock's power can't be changed live.** Its registers are encoded into buffers once, at start.
  - Workaround: `devices.js` writes the power register's buffer directly.
- **SATEC provisioning rejects devices on one IP.** Several mock meters on `127.0.0.1`, each on its own port, are refused by default.
  - Workaround: `conf.allowDuplicateIPs: true`, as mvp-site sets it.
- **No market-data worker.** Nothing in MDK sources BTC price, network hashrate or hashprice, though the devkit's finance types consume them.
  - Workaround: `workers/mempool`.
- **No pool reports a subsidy / fee split.** The pool service's `transactions` log carries each block's net earning and the pool's fee, never the block subsidy against transaction fees, which Subsidy / Fee and the Revenue Summary donut need.
  - Workaround: the financials report splits each payout by the network's fee share on its day, from `workers/mempool`'s `fee_share` channel, and labels the split as estimated.
  - Would remove it: an optional `subsidy` / `fees` per payout in a pool contract channel.
- **The Ocean mock's pool fee is on the whole block.** `fees_collected_satoshis` is 2% of the block reward, while `satoshis_net_earned` is the account's 0.1% share, so the fee reads 20 times the payout.
  - Workaround: `dev/mock-site/devices.js` starts the mock with its own `createServer` and adds an `onSend` hook to the Fastify app it returns: `restateFee` restates the fee from the net earnings on the way out (the worker runs under `mdk run`, out of reach).
- **The Ocean mock's server needs Fastify, a dev dependency of its package.** `mock/server.js` requires `fastify`, which `ocean-mdk-worker` lists only under `devDependencies`, so installing the package doesn't install it.
  - Workaround: `dev/package.json` pins `fastify` itself. Keep it on a version the mock's routes run on.
  - Would remove it: the mock computing the fee on the account's share.

## Kernel and client

- **The Kernel silently rejects a re-bound device.** A device id stays bound to the worker that first registered it, across restarts. A new worker claiming it is rejected, but only in a debug log. The worker still starts, and pulls for that device answer an empty body.
  - Workaround: documented in `docs/mock-site.md`, and the collector reports `ERR_POOL_NO_RESPONSE` and retries after a minute.
- **The Gateway coerces request bodies, and turns a nullable's `null` into `0`.** Routes are validated by Fastify's Ajv with its default `coerceTypes: "array"`. A nullable number written as `anyOf: [{ type: "number", … }, { type: "null" }]` (what `z.toJSONSchema` emits once the number has bounds) has `null` coerced to `0` by the first branch, so the body reaches the controller changed: a cleared Cost Input month was saved as $0.
  - Workaround: `collapseNullable` in `ui-src/api/route-table.ts` writes each such anyOf as `type: ["number", "null"]`, which Ajv leaves alone; `route-table.test.ts` keeps request bodies free of them.
  - Would remove it: the Gateway validating without type coercion (bodies are JSON, already typed), or documenting the trap for route authors.
- **An unreachable worker answers `{}`, not an error.** `pullTelemetry` resolves to an empty object when the Kernel has no channel to the worker.
  - Workaround: the collector checks for the expected field.
- **`mdk rbac init` can't run offline.** After writing `spec.rbac` it applies the policy to a running Kernel, and with none up it waits before giving up. A generated `mdk.yaml` needs that block on every run, in CI too. Still so at 0.13.0.
  - Workaround: `dev/mock-site/generate.mjs` calls the CLI's own `bindSubject`, `planAppGrant` and `writeAppGrant` (from `node_modules/@tetherto/mdk-cli/dist/lib`) and skips the apply. The file is identical to what `mdk rbac init` writes.
  - Would remove it: an `--offline` / `--no-apply` flag on `mdk rbac init`, or a public export of its write step.

## Dashboard

- **An app's sidebar was one flat group.** `MdkAppRoute` had no section, so an app couldn't show the design's two-level navigation (Operations / Financials).
  - Fixed upstream: tetherto/mdk-prv#648 adds `section` on `MdkAppRoute` and `sections` (label + icon) on the app UI module. `ui-src/index.tsx` uses both. A dashboard created before it lists the pages flat; recreate it (`mdk create dashboard`) to get the sections.
- **The dashboard template's install can crash npm.** Since the template gained `vitest`, `mdk create dashboard` can fail with npm 11's `Cannot read properties of null (reading 'edgesOut')` while it resolves peer dependencies. `mdk create` carries on regardless and leaves the dashboard without `node_modules`. Still so at 0.12.1, and on `develop` at 05802123 (27 Oct 2026).
  - Workaround: `npm run setup` installs `dev/apps/dashboard` with `npm install --legacy-peer-deps` when the scaffold left no Vite behind.
  - Would remove it: a lockfile, or a pinned Vitest, in the scaffolded template, and `mdk create` failing when its install fails.
- **A dashboard scaffolded before 0.12.1 breaks on an SDK at 0.12.1, after a clean install.** 0.12.1 removed `@tetherto/mdk-fonts` (JetBrains Mono now comes from `@fontsource-variable/jetbrains-mono`, declared in the template's `src/fonts.css`). An older dashboard still lists it as a `file:` link into the SDK and imports its CSS. npm installs the missing link as a dangling symlink without an error, so the break only shows when Vite fails to resolve the import.
  - Workaround: `npm run setup` records the CLI version it set up (`node_modules/.mdk-setup`); when it has moved, it creates the dashboard again.
  - Would remove it: a migration note in the release notes, or `mdk` noticing a scaffold older than its template.
- **The shell ranked the app CSS layer lowest.** `main.tsx` loaded `App.scss` (`@layer app {…}`) through the router before `index.scss` declared `@layer base, mdk, app`, so every devkit rule beat the app's own styles.
  - Fixed upstream: tetherto/mdk-prv#650 imports a `layers.css` with only the order first. `ui-src/styles.css` now styles devkit components directly, with no token overrides or `!important`. A dashboard created before it needs recreating (`mdk create dashboard`).
- **The shell's sidebar loses the active page when the URL has a query.** `App.tsx` passes `activeId={location.pathname + location.search}`, but sidebar item ids are bare paths, so a page that keeps its state in the URL (the period, `?granularity=week`, and the metric pages' `?view=`) shows no active item.
  - Fixed upstream: tetherto/mdk-prv#670 adds `sidebarActiveId` to the shell template (in 0.13.0). A dashboard created before it needs recreating (`mdk create dashboard`). The active item is the page's path, whatever its own query; an item keyed by a query (`/pools?view=sites`) stays active while the URL has those params.
- **The header brand is the dashboard's.** "Reporting Tool Lite" at the top of the design is set by whoever ships the dashboard, not by the app.

## UI helpers

- **Report helpers were missing from MDK.** The app wrote its own request-error lines and query views, reporting periods (helpers, URL hook, control), unit scaling, bitcoin formatting, CSV export, a full-width toggle and stat tiles with caption, tag and detail.
  - Fixed upstream: tetherto/mdk-prv#650 adds `describeRequestError`, `toQueryView`, the period helpers, `usePeriod`, `PeriodControl`, `pickUnitScale` / `scaleToUnit`, `formatBitcoin` with `BITCOIN_UNITS` / `BitcoinUnit`, `toCsv` / `downloadCsv`, `CurrencyToggler`'s `fullWidth` and `itemAriaLabel`, `SingleStatCard`'s `caption` / `tag` / `detail`, and `buildBarChartOptions`' `yUnit` / `yRightUnit` / `categoryTicksPadding`. The app uses them and keeps only its contract check, the en dash for a missing value and the "not wired" tile state.
- **The efficiency unit read `W/TH/S`.** `UNITS.EFFICIENCY_W_PER_TH_S` had a capital S.
  - Fixed upstream: tetherto/mdk-prv#650 spells it `W/TH/s`; the app's override is gone.
- **`buildBarChartOptions` lets category labels rotate.** The devkit's default chart options keep x labels level (`maxRotation: 0`), but the builder doesn't, so dates slant once they get close.
  - Fixed upstream: tetherto/mdk-prv#671 sets `maxRotation: 0` on the builder's category axis, on either orientation. The app's `levelLabels` override is gone.
- **`formatBitcoin` wrote sats as "Sats".** It wrote the unit as `UNITS.SATS`, while the unit it is asked for (`BITCOIN_UNITS.SATS`, `'sats'`), and the app's toggles and per-unit figures (`sats/MWh`), are lowercase.
  - Fixed upstream: tetherto/mdk-prv#671 writes the unit as `BITCOIN_UNITS.SATS`. `UNITS.SATS` keeps its spelling.
- **`SingleStatCard`'s `color` didn't colour the value on most variants.** It only coloured `highlighted` and `tertiary`.
  - Fixed upstream: tetherto/mdk-prv#701 colours the value on every variant. The accent tile passes `color` instead of a class.
- **The devkit had no plug or external-link icon.** The not-wired states need a plug for a source that isn't connected, and an arrow out of a box for a link that opens in a new tab.
  - Fixed upstream: tetherto/mdk-prv#701 adds `PlugIcon` and `ExternalLinkIcon`. `ui-src/components/widget.tsx` uses them instead of its inline SVGs.

## Docs

- **The docs are stale on reporting.** The mdk-docs site (last reviewed at 0.3.0–0.5.0) recommends reporting composites (`Hashrate`, `HashBalance`, …) and worker tail-log history. `develop` has removed the composites and deprecated the tail-log built-ins.
- **Removed demo worker still referenced.** The docs and CLI error messages point at `backend/workers/samples/demo-worker`, which no longer exists.
