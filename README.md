# mdk-app-reporting-tool

Operations and financial reporting for one mining site, as an MDK app: hashrate, power, efficiency and energy per mining unit and miner type, the fleet's status and power modes, and revenue, costs and hashprice against the network.

- **Operations:** Dashboard · Hashrate · Energy · Efficiency · Miners
- **Financials:** Revenue Summary · Cost Summary · Subsidy / Fee · Hash Balance · Energy Balance · Cost Input

It is one package with a Gateway plugin and a dashboard UI. A dashboard installs it with:

```bash
mdk add app github:<owner>/<repo>#<tag>
```

The pages then appear under the app's sidebar group, at `/app/<name>/`, and a last-24-hours card appears on the dashboard's Home.

The dashboard has to be one from MDK 0.13.0 or later (`mdk create dashboard`): an older one lends UI packages without the report helpers the pages use, and the pages fail to load. Its users need a role over the app's routes: see Access.

## How it uses MDK

- **Data comes from MDK workers through the Kernel.** The plugin's collector discovers workers with `getStatus()`, pulls each miner's and meter's telemetry on a fixed interval, and reads pool earnings and market data. It never sends commands. See [docs/data-sources.md](docs/data-sources.md) for the channels it reads and how it adapts to different vendors.
- **The app keeps its own history** in SQLite under the runtime's data dir. MDK workers don't keep long, cross-device history (the `@tetherto/mdk-worker` README marks the store-backed history built-ins as deprecated), and reports need site-timezone days, weeks and months over years.
- **The UI is an MDK app UI module** (`defineMdkApp`), built from `ui-src/` to `ui/`. It is made of devkit components, calls the plugin through `useMdkApp().apiUrl(...)`, and parses every response with the contract in `ui-src/api/contract.ts`.
- **The dev stack runs public MDK workers against mock devices.** Antminer and Whatsminer miners, SATEC meters and the Ocean pool all use MDK's workers and their bundled mocks. The mocks are driven by one simulation, so the live readings match the seeded history. See [docs/mock-site.md](docs/mock-site.md).

## Layout

```
mdk-app.yaml          app manifest: id, version, permissions, config defaults
package.json          the app package (ships mdk-app.yaml, plugin/, ui/, README.md)
plugin/
  mdk-plugin.json     route table, generated from ui-src/api/route-table.ts
  main.js             starts the store and the collector before the routes serve
  controllers/        one handler per route: async (req) => body
  lib/                collector, store, reports, telemetry readers, site config
ui-src/               UI source, built to ui/
  api/                contract (zod), route table, routes, requests
  features/<feature>/ hook + shaping + components + page, per feature
  index.tsx           the app's UI module: pages and the Home panel
ui/                   built UI, committed (GitHub installs run no build)
workers/mempool/      market-data worker (BTC price, network hashrate, hashprice)
dev/
  mdk.yaml            local stack: Kernel, Gateway, miner and market workers, this app
  mock-site/          simulation, mock devices, the SATEC worker, history seed
  config/             the mock site's site config and hardware catalogue
scripts/              setup, start and dev-stack helpers
docs/                 data sources, reusing parts, the mock site, MDK friction log, QA guide
```

`ui-src/components/`, `ui-src/features/` (and each feature in it) and `workers/mempool/` have their own READMEs.

## Reusing parts

The UI components, the request and view helpers, the plugin's timezone buckets and vendor telemetry reader, and the market-data worker are written to be copied into other MDK apps. [docs/reusing.md](docs/reusing.md) lists each one, what it needs, and what to change when you copy it, with links to the MDK packages they build on and the reference app.

## Setup

Node 24 or later.

MDK comes from npm at 0.13.0: `package.json` pins `@tetherto/mdk-cli` (`npm run mdk` is that CLI), `ui-src` the UI packages (`@tetherto/mdk-react-adapter`, `@tetherto/mdk-react-devkit`, `@tetherto/mdk-ui-foundation`) and `dev` `@tetherto/mdk-core`. `npm run setup` installs this repo, the dev stack and the UI, builds `ui/`, and creates a local dashboard with `mdk create dashboard`. One piece doesn't come from npm: **MDK's SATEC meter worker**, which isn't published. Setup takes it from the `tetherto/mdk` release tag that matches the CLI, into `dev/.mdk-satec/` (gitignored).

```bash
npm run setup
```

Set `NPM="sfw npm"` (or another wrapper) if your environment requires one. After you change the MDK version, run setup again: it fetches the SATEC worker and creates the local dashboard again.

## Develop

One command for a demo:

```bash
npm start               # setup if needed, build ui/, then the mock site, the stack and the dashboard
```

Or three terminals for day-to-day work:

```bash
npm run dev:stack       # mock devices + `mdk run --dir dev`: Kernel, Gateway (:3847), workers, this app
npm run dev:dashboard   # `mdk run dashboard --dir dev`: the local dashboard (:3030) with this app installed
npm run dev:ui          # rebuild ui/ on save, then reload the browser
```

With the stack running, add a user to sign in with (the password is prompted; users are kept in `dev/.mdk/kernel`):

```bash
npm run dev:user -- alice --group viewers --group cost-editors
```

Then open http://localhost:3030/app/reporting and sign in. App UIs have no hot reload: `dev:ui` rebuilds the bundle and a browser reload picks it up.

The first start seeds 400 days of history from the simulation (about a minute), then the collector samples the site every minute. After editing `dev/mock-site/fleet.json`, run `npm run dev:generate` to rewrite `dev/mdk.yaml`.

Call a route directly, with a user's token:

```bash
TOKEN=$(curl -s localhost:3847/auth/login -H 'content-type: application/json' \
  -d '{"username":"alice","password":"<password>"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).accessToken')
curl localhost:3847/apps/reporting/api/reporting/site -H "authorization: Bearer $TOKEN"
```

### Access

The Kernel and the Gateway refuse whatever `spec.rbac` doesn't allow. `dev/mdk.yaml`'s policy (generated by `npm run dev:generate`) has:

- `app-reporting`, bound to the app's service account `app:reporting`: the read-only Kernel access its `mdk-app.yaml` requests (`workers: list, read`, `devices: read`).
- `reporting-viewer`, bound to the group `viewers`: `get` and `list` on `reporting/*`, every report.
- `reporting-cost-editor`, bound to the group `cost-editors`: `update` on `reporting/api/reporting/costs`, saving Cost Input.
- `admin` for the CLI (`mdk-cli`), and `gateway` for the Gateway and the MCP server, as `mdk rbac init` writes them.

On your own site, `mdk add app` grants the app's role; add the two caller roles and bind your users or groups to them.

## Routes

All under the app's mount (`/apps/reporting` by default). The bodies are typed in `ui-src/api/contract.ts`.

| Method | Route                                              | Response                                                                                                                      |
| ------ | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/reporting/site`                              | Site, mining units, miner models, which sources are wired, history extent, collector state                                    |
| GET    | `/api/reporting/operations?start&end&granularity`  | Hashrate, power, efficiency, nominal values and miner status per bucket                                                       |
| GET    | `/api/reporting/miners?refresh`                    | The fleet at the latest sample: counts by status and power mode, power per model                                              |
| GET    | `/api/reporting/consumption?start&end&granularity` | Energy per meter per bucket (MWh), with the site meter apart                                                                  |
| GET    | `/api/reporting/financials?start&end&granularity`  | Payouts, split, revenue, network hashprice, energy, hashrate and costs per bucket, with every per-MWh and per-PH/s/day figure |
| GET    | `/api/reporting/costs?year`                        | Cost Input for one year: twelve months of energy and operations cost (USD)                                                    |
| PUT    | `/api/reporting/costs`                             | Sets months of Cost Input: `{ year, months: [{ month, energyUsd, operationsUsd }] }`; answers the year                        |

`start` and `end` are ms since epoch (`end` exclusive, default: the last 30 days). `granularity` is `hour`, `day`, `week` or `month` in the site's timezone. A range longer than 93 days at hourly granularity, or 3 years otherwise, is rejected. Errors return `{ statusCode, error, message }` with an `ERR_*` code in `message`.

## Run it on a real site

1. List your own workers in your stack's `mdk.yaml`, and add the app with its config:

   ```yaml
   apps:
     - name: reporting
       package: reporting-tool-lite
       config:
         siteConfig: ./site.json # your mining units, meters, pool and market devices
         catalogue: ./hardware-catalogue.json # your miner models and nominal values
         sampleIntervalSec: 60
   ```

2. Write `site.json` and the catalogue on the model of `dev/config/`. A mining unit groups miners by worker name or device id. A meter marked `siteMeter: true` is the site's total.
3. Leave out `seed`: history starts when the workers are wired.

[docs/data-sources.md](docs/data-sources.md) lists what each kind of worker has to expose.

### Wire your pool

The Financials pages read pool payouts from an MDK pool worker. Ocean is the reference: the public [Ocean worker](https://github.com/OCEAN-xyz/mdk-wrk-minerpool-ocean) (`ocean-mdk-worker`) with `apiUrl` and your account in its device opts, and the device in `site.json`'s `pool`. The worker only keeps the earnings it has fetched since it started (the previous day's, each day), so history starts when the pool is wired.

The minimum a pool worker must serve, through a `transactions` telemetry channel (start and end in ms, answering daily rows of the pool's earnings log): each payout's time and its amount in BTC, net of the pool's fee. Optional: the pool's fee per payout (`fees_collected_satoshis`, which gives gross revenue) and a subsidy / fee split. No rebates. A worker for another pool fills the same fields; `pullPoolPayouts` in `plugin/lib/collector.js` is the one place that reads them.

When the pool doesn't report the split (Ocean doesn't), the Subsidy / Fee page says so and links here: it shows only a split the pool reports. The Revenue Summary donut still splits each payout by the network's fee share on its day, from the market-data worker.

### Market data

`workers/mempool` serves BTC price history, network hashrate, network hashprice, the daily fee share and the daily fee rate from the public mempool.space API. Add it to `mdk.yaml` and name its device in `site.json`'s `market`. USD figures, network charts and the Revenue Summary's estimated split need it; the app never calls mempool.space itself. It needs internet access.

### Costs

Monthly energy and operations costs are entered by hand on **Cost Input**, two totals in USD per month. They are the app's only write, to its own store, never to MDK or a device. Cost Summary, Hash Cost and Energy Cost derive every per-MWh and per-PH/s figure from them. Only callers allowed `update` on `<app>/api/reporting/costs` can save them (the `cost-editors` group in the dev stack, see Access).

### When a source is missing

| Missing             | What happens                                                                                                                          |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Pool                | Revenue figures, the Mining Revenue chart and Subsidy / Fee say the pool isn't wired. Costs, energy and network figures still render. |
| Market data         | USD figures, the network charts and the estimated split are unavailable. BTC figures still render.                                    |
| Subsidy / fee split | Subsidy / Fee says the pool doesn't report it. The Revenue Summary donut estimates it from the network's fee share.                   |
| Pool fee            | Gross figures say the pool fee isn't reported; net figures render.                                                                    |
| Costs               | Cost widgets point to Cost Input, for the whole period or any month in it without costs. Revenue and network figures render.          |
| Power meters        | The Energy page has no Consumption view. Nothing else changes.                                                                        |
| Downtime            | No downtime source is defined yet, so Energy Balance has no downtime block.                                                           |

### Metric definitions

Every period figure is its total over its basis, which is the average of its bucket series weighted by that basis. So a tile always matches the chart beside it, and Cost Summary, Hash Cost and Energy Cost reconcile for any period.

- **Net / gross:** net is what the pool paid; gross adds the pool's fee back.
- **Revenue at production-date price:** each payout times the mean BTC price of its UTC day. **At report price:** total BTC times the latest price.
- **Energy:** the miners' power over the time the samples cover, in MWh. **$/MWh** is a total over that energy.
- **Hash revenue, $/PH/s/day:** revenue over PH/s-days, the site's average hashrate in PH/s times the days the samples cover. Network hashprice (a day's block rewards, 144 blocks at the day's average reward, over network PH/s) is in the same unit, so the two land in the same order of magnitude. Real days run about 130 to 160 blocks, so a single day's network hashprice is an estimate; over weeks it evens out.
- **Costs:** each month's totals prorated by the share of the month a bucket covers, in the site's timezone. All-in is energy plus operations. **Production cost** is all-in per BTC mined.
- **Costs per MWh and per PH/s-day** (Cost Summary's $/MWh, **hash cost**, Energy Balance) prorate each month's totals over the time the miner samples cover instead, as the energy and hashrate they divide by do. Before the app was installed, or while the collector was down, the bill runs but no energy is measured; the calendar share would charge it to the energy that was. So in a partly sampled period, $/MWh times MWh is less than the period's cost, and a month with no samples needs no cost for them.
- **Mining uptime:** the share of miner-time online, mining in any power mode. **Hashrate capacity factor:** average hashrate over the fleet's nominal hashrate (hardware catalogue).
- **Fee %:** fees over subsidy plus fees.
- **Average fees (sats/vB):** the network's typical transaction fee rate: each day's median block fee rates from mempool.space, averaged over the day, then over the bucket's days.

### History

Miner and meter telemetry accumulates from the moment the workers are wired. Pool payouts and market data backfill as far as their APIs allow (about two years for the network series). Cost Input covers whatever months you enter.

## Checks

```bash
npm run check   # fmt, lint, typecheck, tests, route table freshness, UI build, mdk validate app
```

For manual testing, standalone or installed in an MDK project, follow [docs/qa-guide.md](docs/qa-guide.md).

CI (`.github/`, the same layout as the other tetherto MDK apps) runs the same steps in parallel jobs, plus a dependency audit on pull requests and a check that `dev/mdk.yaml` matches the fleet.
