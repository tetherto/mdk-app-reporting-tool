# AGENTS

Reporting Tool Lite is an MDK app: one package with a Gateway plugin (`plugin/`) and a dashboard UI (`ui-src/`, built to `ui/`). Dashboards install it with `mdk add app github:<owner>/<repo>#<tag>` and serve its pages under `/app/<name>/`. Read `README.md` for the layout and the dev loop, and `docs/` for the data sources and the mock site.

## Completion requirements

- `npm run fmt:check`, `npm run lint`, `npm run typecheck` and `npm test` must pass before a task is complete.
- After any change under `ui-src/`, run `npm run build:ui` and commit `ui/`. GitHub installs run no build, so a stale `ui/` ships stale code. CI fails when `ui/` doesn't match a fresh build.
- After any change to the routes, run `npm run gen:routes` and commit `plugin/mdk-plugin.json`. Never edit that file by hand.
- After any change to `dev/mock-site/fleet.json`, the generator or the `permissions` in `mdk-app.yaml`, run `npm run dev:generate` and commit `dev/mdk.yaml` (its `spec.rbac` grants the app exactly those permissions). Never edit it by hand, and keep the app's permissions read-only.
- `npm run validate` (`mdk validate app`) must pass.
- For UI changes, run the stack and the dashboard (`npm start`) and look at the page before calling it done.

## Working rules

- Build with MDK as it ships on npm (`@tetherto/mdk-*` 0.13.0): the CLI, the Kernel and Gateway, the workers, the UI packages and the dashboard shell (`mdk create dashboard`). The plugin uses the Kernel client the app runtime hands it (`config.mdkClient`). MDK's SATEC worker isn't published at all; setup takes it from the matching release tag. When MDK gets in the way, work around it in the smallest way and log the friction in `docs/mdk-friction.md`. Don't patch MDK packages from here.
- Prefer an MDK or public worker to a custom one. `workers/mempool` exists only because MDK has no market-data worker. The mock site plays devices for real workers; it doesn't fake the workers.
- The contract lives in `ui-src/api/contract.ts` as zod schemas: every request and response body, with the unit in numeric field names. The UI parses every response with it, the route table is generated from it, and `api/contract.test.ts` runs the plugin's reports on seeded history and checks them against it. Change the contract first, then the plugin and the UI.
- Shared value lists (granularities, statuses, power modes) are `as const` tuples in the contract, with types derived from them. Don't repeat them elsewhere.
- Hooks return a view union (`loading | error | ready`), never raw query state.
- Avoid `any`, unchecked casts and loose `Record<string, unknown>` shapes for known payloads. Parse unknown input with a schema or a type guard.
- Prefer correctness and safety over convenience when a tradeoff is required.

## UI (`ui-src/`)

- Layers per feature, under `features/<feature>/`: a request in `api/` (`getParsed` with a contract schema), a hook that shapes it into a view, a presentational component that only renders, and a thin page. Components never fetch.
- Resolve every route with `useMdkApp().apiUrl(API_ROUTES.X)`. The installed name is the operator's choice, so never hardcode `/apps/reporting`.
- Import `useQuery` and app hooks from `@tetherto/mdk-react-adapter`, UI from `@tetherto/mdk-react-devkit` (root import only), and `mdkFetch` from `@tetherto/mdk-ui-foundation`. The dashboard lends those, plus react, react-dom, react-router and react-query, at runtime, so they stay external. Anything else gets bundled.
- Use devkit components. Build custom UI only where the devkit has none, and keep it presentational.
- Files are kebab-case.

## Plugin (`plugin/`)

- `main.js` opens the store, seeds the mock site's history when the app config names a `seed`, and starts the collector. Controllers are `async (req) => body` and read only the store, through `lib/context.js`.
- The collector is read-only against MDK: it discovers workers, pulls telemetry, and never sends a command. Vendor differences (channel names, units, status words) are handled in `lib/telemetry.js`. Never special-case a vendor anywhere else.
- Pool earnings come from the pool worker's `transactions` channel (`pullPoolPayouts` in `lib/collector.js`). Keep every read of it in that one function.
- Throw errors with an `ERR_SCREAMING_SNAKE` code and a `statusCode`. The Gateway answers with `{ statusCode, error, message }`.

## Dev stack (`dev/`)

- `dev/mock-site/sim.js` is the single source of truth for what the mock fleet does. `devices.js` drives the mock device servers from it, and `seed.js` backfills the app's history from it. Keep them on the same functions, so the live readings and the history agree.
- MDK's SATEC meter worker is a legacy (boot.js) worker that `mdk run` can't host, so `devices.js` boots it (from `dev/.mdk-satec`) and registers it through `dev/.mdk/keys`. The pool runs on the public Ocean worker under `mdk run`. If a worker or device is renamed, the Kernel's saved registry still binds the old name: stop the stack and move `dev/.mdk/kernel` aside.
