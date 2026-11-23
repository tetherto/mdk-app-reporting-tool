# QA guide

How to run Reporting Tool Lite for testing, and what to check. There are two ways to run it:

- **Standalone:** the app's own dev stack. A simulated site (100 miners, 5 meters, an Ocean pool account) drives MDK's real workers, and 400 days of history are seeded on the first start. Use it for functional testing: every page has data.
- **In an MDK project:** the app installed into an MDK stack with `mdk add app`, as an operator would. Use it to test installation, permissions and how the app behaves on a site with nothing wired yet.

Both run the same app. The test cases below say which setup each one needs.

## Before you start

| You need                  | Why                                                                                                      |
| ------------------------- | -------------------------------------------------------------------------------------------------------- |
| Node 24 or later          | The app and MDK need it. `node -v` to check.                                                             |
| Read access to the repo   | `tetherto/mdk-app-reporting-tool`, private. MDK comes from npm (0.13.1).                                 |
| GitHub SSH access         | `mdk add app github:…` fetches the app with git over SSH. `ssh -T git@github.com` should greet you.      |
| Free ports                | 3847 (Gateway), 3848 (Kernel), 3030 (dashboard). Standalone also uses 14101 and up for the mock devices. |
| Chrome, Firefox or Safari | The dashboard is a web app at http://localhost:3030.                                                     |

Passwords for dashboard users must be at least 12 characters.

## A. Standalone

### A1. Set up

```bash
git clone git@github.com:tetherto/mdk-app-reporting-tool.git
cd mdk-app-reporting-tool
npm run setup
```

Setup installs MDK 0.13.1 from npm, fetches MDK's SATEC worker, builds the app's UI and creates a local dashboard in `dev/apps/dashboard` with `mdk create dashboard`. The first run takes a few minutes. After you pull a change to the MDK version, run `npm run setup` again: it notices the new version and creates the dashboard again.

Optional, to confirm the build before testing:

```bash
npm run check    # format, lint, typecheck, 111 unit tests, route table, UI build, `mdk validate app`
```

### A2. Start

```bash
npm start
```

This starts the mock devices, the MDK stack (Kernel, Gateway, workers, the app) and the dashboard. Wait for `✔ gateway listening on http://localhost:3847` and the dashboard's `Local: http://localhost:3030/`. On the very first start the app seeds 400 days of history, which takes about a minute; reports are empty until it finishes.

For day-to-day work, three terminals give you separate logs:

```bash
npm run dev:stack       # mock devices + Kernel, Gateway, workers, the app
npm run dev:dashboard   # the dashboard on :3030
npm run dev:ui          # only when changing the app's UI: rebuilds on save, then reload the browser
```

Stop with Ctrl+C.

### A3. Create test users

With the stack running, in another terminal:

```bash
npm run dev:user -- qa-editor                                      # viewers + cost-editors: reads everything, can save costs
npm run mdk -- user add qa-viewer --dir dev --group viewers        # viewers only: reads everything, cannot save costs
```

Each prompts for a password (12 characters or more). Users are kept in `dev/.mdk/` and survive restarts.

### A4. Open the app

Go to http://localhost:3030 and sign in. The app's pages are in the sidebar under **Operations** and **Financials**, at `/app/reporting/…`, and its last-24-hours card is on **Home**.

### A5. Reset

| To reset                    | Do                                                                                                                               |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| The app's history and costs | Stop the stack, delete `dev/.mdk/apps/reporting/store`, start again. History and example costs are seeded again. Users are kept. |
| Everything, users included  | Stop the stack, delete `dev/.mdk`, start again, and create the users again.                                                      |
| The dashboard               | `npm run mdk -- create dashboard --dir dev --force`, then `npm --prefix dev/apps/dashboard install --legacy-peer-deps`.          |

The mock site is deterministic: the same time always gives the same readings, so a reset doesn't change the numbers. You can't switch a single miner off by hand; the simulation decides which miners are offline, sleeping or in maintenance.

## B. In an MDK project

This is the operator's path: an MDK project, the app installed into it, and a dashboard. Use the MDK CLI from npm. In these steps, `mdk` means:

```bash
alias mdk="npx --yes @tetherto/mdk-cli@0.13.1"
```

### B1. Create a project

`mdk onboard` asks which workers, apps and dashboard to include and writes the project. It needs an interactive terminal. For a bare project without it:

```bash
mkdir rt-qa && cd rt-qa
npm init -y
cat > mdk.yaml <<'EOF'
apiVersion: mdk/v1
kind: Stack
metadata:
  name: rt-qa
spec:
  kernel: { port: 3848 }
  gateway: { port: 3847 }
EOF
mdk rbac init        # access for the CLI and the Gateway: `mdk user add` needs it
```

`mdk rbac init` ends with "the Kernel refused the policy" when no stack is running. That's expected: the Kernel applies `mdk.yaml` when it starts.

### B2. Install the app

```bash
mdk add app github:tetherto/mdk-app-reporting-tool#main --name reporting
```

Use a tag (`#v0.1.0`) once releases are tagged, or a commit SHA to test a specific build. Expect `✔ Added app reporting → reporting-tool-lite`, with the app added to `package.json` and `spec.apps`.

### B3. Give the app a site config

The app won't start without a site config and a hardware catalogue. With none, `mdk run` stops with `ERR_CONFIG_MISSING: site config (<project>/config/site.json)` and the Gateway never starts. Both files are read from the project directory. For a quick start, copy the mock site's:

```bash
mkdir config
cp /path/to/mdk-app-reporting-tool/dev/config/*.json config/
```

They name workers (`mu-1` … `mu-4`, `pm-01` …, `ocean`, `mempool`) that this project doesn't have, so the app runs with nothing wired: the empty-site test cases. To test with data, use the standalone setup, or add real workers to `mdk.yaml` and write the site config as the README's "Run it on a real site" describes.

### B4. Roles for viewers and cost editors

A new project has no role that lets a user read the app. Add these to `spec.rbac` in `mdk.yaml` (under the roles and bindings `mdk rbac init` and `mdk add app` wrote):

```yaml
roles:
  - name: viewer
    rules:
      - resources: ["*"]
        verbs: [get, list]
  - name: cost-input
    rules:
      - resources: [reporting/api/reporting/costs]
        verbs: [update]
bindings:
  - role: viewer
    subjects:
      - kind: Group
        name: viewers
  - role: cost-input
    subjects:
      - kind: Group
        name: cost-editors
```

If you named the app something other than `reporting` in B2, the resource is `<name>/api/reporting/costs`.

### B5. Run, users and dashboard

```bash
mdk run                                     # terminal 1: Kernel, the app, Gateway
mdk user add qa-editor --group viewers --group cost-editors     # terminal 2, prompts for a password
mdk user add qa-viewer --group viewers
mdk create dashboard                        # see Known issues: install it with the next line
npm --prefix apps/dashboard install --legacy-peer-deps
mdk run dashboard                           # http://localhost:3030
```

If you change `spec.rbac` while the stack runs, apply it with `mdk rbac apply`.

## Test cases

`S` = standalone (A), `P` = MDK project (B). Unless a case says otherwise, sign in as `qa-editor`.

### Install and start

| ID   | Setup | Steps                             | Expected                                                                                                         |
| ---- | ----- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| IN-1 | S     | A1, then `npm run check`          | Every step passes; the last line says the app is valid: 7 routes, 2 permission rules, UI.                        |
| IN-2 | S     | `npm start` on a fresh `dev/.mdk` | Kernel, 4 miner workers, `pool`, `market`, `app reporting` and the Gateway report ready. History is seeded once. |
| IN-3 | P     | B2                                | App installed; `mdk.yaml` gains the `spec.apps` entry. `package-lock.json` pins the commit.                      |
| IN-4 | P     | Start with no `config/` (skip B3) | `mdk run` stops with `ERR_CONFIG_MISSING` naming the missing file.                                               |
| IN-5 | P     | B3, B5                            | `✔ app reporting ready`, `✔ gateway listening`.                                                                  |
| IN-6 | S, P  | Restart the stack                 | Reports keep their history; costs entered before the restart are still there.                                    |

### Navigation and permissions

| ID   | Setup | Steps                                                   | Expected                                                                                                                                                                                        |
| ---- | ----- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AU-1 | S, P  | Open http://localhost:3030 signed out                   | Sign-in page. Wrong password: an error, no access.                                                                                                                                              |
| AU-2 | S, P  | Open http://localhost:3030                              | Home. Sidebar: Home, **Operations** (Dashboard, Hashrate, Energy, Efficiency, Miners), **Financials** (Revenue Summary, Cost Summary, Subsidy / Fee, Hash Balance, Energy Balance, Cost Input). |
| AU-3 | P     | Sign in as a user in no group                           | The app's pages load but every report fails with a permission error (`ERR_AUTH_FORBIDDEN … may not get …`).                                                                                     |
| AU-4 | S, P  | Click each sidebar entry                                | The page opens and its sidebar entry is highlighted.                                                                                                                                            |
| AU-5 | S     | On Hashrate, pick **Weekly**, then **Mining Unit View** | The URL gains `?granularity=week` / `?view=unit`, and **Hashrate** stays highlighted in the sidebar.                                                                                            |
| AU-6 | S     | Copy a report URL with its query into a new tab         | The same period, buckets and view open.                                                                                                                                                         |
| AU-7 | S, P  | Open `/app/reporting/does-not-exist`                    | The dashboard's 404 page.                                                                                                                                                                       |
| AU-8 | S, P  | Leave a page open past the session's token lifetime     | The session refreshes silently, or returns you to sign-in. No blank page.                                                                                                                       |

### Home

| ID   | Setup | Steps                        | Expected                                                                                                                |
| ---- | ----- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| HO-1 | S     | Open Home                    | A "Reporting Tool Lite — last 24 hours" card: Hashrate (PH/s), Power (kW), Efficiency (W/TH/s), and "Open the reports". |
| HO-2 | S     | Click "Open the reports"     | The app's Dashboard page.                                                                                               |
| HO-3 | P     | Open Home with nothing wired | The card shows `—` for each figure.                                                                                     |

### Period and buckets (every report page)

| ID   | Setup | Steps                                                                             | Expected                                                                                                                                               |
| ---- | ----- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| PE-1 | S     | Open any Operations page                                                          | Default period Last 30 days, Daily buckets. Financials pages default to Last 12 months, Monthly.                                                       |
| PE-2 | S     | Try each preset: Last 24 hours, 7 days, 30 days, 90 days, 12 months, Year to date | The date range and charts update. The buckets switch to the preset's own (24h: Hourly, 7–30 days: Daily, 90 days: Weekly, 12 months and YTD: Monthly). |
| PE-3 | S     | Pick a custom range in the date picker                                            | Charts cover exactly those days.                                                                                                                       |
| PE-4 | S     | Check which bucket buttons are enabled for each range                             | Hourly up to 31 days; Daily up to 3 years; Weekly from 14 days; Monthly from 60 days. Others are disabled, not hidden.                                 |
| PE-5 | S     | Change the period, then press **Reset**                                           | The page's default period and buckets come back.                                                                                                       |
| PE-6 | S     | Pick a range before the history starts                                            | "No data in this period" (or empty charts with that message), no error.                                                                                |

### Operations

| ID   | Setup | Page       | Steps                                                      | Expected                                                                                                                                                                      |
| ---- | ----- | ---------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OP-1 | S     | Dashboard  | Open it                                                    | Four cards: Hashrate (with dashed Nominal Hashrate), Power Consumption, Site Efficiency (with Nominal), Miners Status (stacked: Online, Error, Offline, Sleep, Maintenance).  |
| OP-2 | S     | Dashboard  | Expand a card (corner icon)                                | The chart fills the screen; closing returns to the grid.                                                                                                                      |
| OP-3 | S     | Hashrate   | Switch Site View / Miner Type View / Mining Unit View      | Site: one series. Miner type: Antminer S23 and WhatsMiner M70S. Mining unit: one bar per unit, averaged over the period, with a Mining Unit filter instead of bucket buttons. |
| OP-4 | S     | Hashrate   | Hover a chart point                                        | Tooltip with the bucket's time and value in PH/s.                                                                                                                             |
| OP-5 | S     | Energy     | Open the **Consumption** view                              | Energy per meter (PM-01 … PM-04) and the site meter, in MWh. **Export** downloads a CSV of the current view.                                                                  |
| OP-6 | S     | Efficiency | Switch views                                               | W/TH/s per site, model and unit, with nominal efficiency.                                                                                                                     |
| OP-7 | S     | Miners     | Open it                                                    | "Snapshot data" banner with the snapshot's time; total miner count 100, split 50/50 by model; a status chart over the period.                                                 |
| OP-8 | S     | Miners     | **Refresh**, then the Miners Offline / in Maintenance tabs | The snapshot time moves to now; each tab shows that subset's counts.                                                                                                          |
| OP-9 | S     | All        | Compare Dashboard's hashrate with Home's 24h average       | They agree for the last day.                                                                                                                                                  |

### Financials

| ID   | Setup | Page            | Steps                                                                            | Expected                                                                                                                                                                                                           |
| ---- | ----- | --------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FI-1 | S     | Revenue Summary | Open it                                                                          | Tiles: Total Bitcoin, Revenue at Receipt Price (with effective $/BTC), Revenue at Report Price (with current $/BTC). Mining Revenue chart; Subsidy / Fees donut; per-MWh and per-PH/s/day tiles.                   |
| FI-2 | S     | Revenue Summary | Check the arithmetic on the tiles                                                | Revenue at receipt ÷ Total Bitcoin = the effective $/BTC shown. Revenue at report = Total Bitcoin × current price.                                                                                                 |
| FI-3 | S     | Revenue Summary | Toggle BTC / sats (page) and BTC / sats / USD at Receipt / USD at Report (chart) | Figures and axis switch unit; sats are whole numbers.                                                                                                                                                              |
| FI-4 | S     | Cost Summary    | Open it                                                                          | Production Cost / Price chart ($k/BTC), Operations / Energy donut with shares adding to 100%, All-in / Energy / Operations $/MWh tiles, Avg All-in Cost chart.                                                     |
| FI-5 | S     | Cost Summary    | Check the donut                                                                  | Operations share = operations $ ÷ (operations + energy) $ for the period, matching the tiles' "in the period" totals.                                                                                              |
| FI-6 | S     | Subsidy / Fee   | Open it                                                                          | "Your pool does not report the subsidy / fee split. Revenue Summary estimates it from the network's fee share.", with a **See the estimate** link that opens Revenue Summary. Average Fees in sats/vB chart below. |
| FI-7 | S     | Hash Balance    | Switch Hash Revenue / Hash Cost and USD / BTC                                    | Site hash revenue and network hashprice in $/PH/s/day (or sats); network hashrate (EH/s). Hash Cost: cost per PH/s/day.                                                                                            |
| FI-8 | S     | Energy Balance  | Open it                                                                          | Revenue and cost per MWh over the period. No downtime block (no downtime source exists).                                                                                                                           |
| FI-9 | S     | Any             | **Set Monthly Cost** (Cost Summary, Hash Balance, Energy Balance)                | Opens Cost Input.                                                                                                                                                                                                  |

### Cost Input

| ID   | Setup | Steps                                                                         | Expected                                                                                                                                                                           |
| ---- | ----- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CI-1 | S     | Open Cost Input                                                               | Twelve months for the current year; months already entered show amounts, others "Cost in USD".                                                                                     |
| CI-2 | S     | Switch the year                                                               | That year's months load.                                                                                                                                                           |
| CI-3 | S     | Enter `11250` energy and `3100` operations for an empty month, **Save Costs** | Saved; amounts show as `11,250.00` and `3,100.00`. A reload keeps them. Cost Summary includes the month.                                                                           |
| CI-4 | S     | Clear a month's amounts, save                                                 | The month is empty again (not $0). Cost pages show "No costs entered" for it.                                                                                                      |
| CI-5 | S     | Type `12.345`, leave the field                                                | Rounds to `12.35`.                                                                                                                                                                 |
| CI-6 | S     | Type `1,2a3` or `-5`                                                          | The field is marked invalid, **Save Costs** is disabled, and the footer says "Enter amounts as non-negative numbers, or leave them blank".                                         |
| CI-7 | S     | Edit a field, then **Discard changes**                                        | The saved amounts come back.                                                                                                                                                       |
| CI-8 | S, P  | As `qa-viewer`: edit a month and **Save Costs**                               | Refused: `ERR_AUTH_FORBIDDEN: qa-viewer may not update reporting/api/reporting/costs` under the table. Nothing is saved. (The fields are editable for a viewer; see Known issues.) |

When you edit a filled amount, put the cursor where you mean to type (on macOS, Cmd+← / Cmd+→ go to the start and end; Home and End don't move it in a text field), or select all and retype. Typing where you happened to click inserts digits mid-number, which is ordinary text-field behaviour, not a bug.

### Nothing wired (setup P after B3)

| ID   | Steps                                 | Expected                                                                                            |
| ---- | ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| NW-1 | Open every page                       | No error page, no failed requests in the browser's console.                                         |
| NW-2 | Operations pages                      | "No data in this period. Pick another range."                                                       |
| NW-3 | Miners                                | "No snapshot yet. Refresh to take one."                                                             |
| NW-4 | Revenue Summary, Subsidy / Fee        | Every revenue tile and chart: "No pool wired" / "No pool is wired." with a **Wire your pool** link. |
| NW-5 | Cost Summary, Hash and Energy Balance | "No costs entered" with **Open Cost Input**, until costs are entered; then the cost figures render. |

The README's "When a source is missing" table lists what each page does without a pool, market data, meters or costs. To test one source at a time, remove its device from `config/site.json` (for example `"market"`) and restart.

### API

Every route is also reachable directly, which helps when a page looks wrong: compare the page with the response.

```bash
API=localhost:3847/apps/reporting/api/reporting
curl -s $API/site | jq '{sources, history, collector}'
```

| ID   | Request                                                                           | Expected                                                                                                                                                       |
| ---- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AP-1 | `GET /site`                                                                       | `collector.kernelConnected: true`, `lastError: null`, `lastSampleAt` within the sample interval (60 s standalone, 300 s default). `sources` says what's wired. |
| AP-2 | `GET /operations`, `/consumption`, `/financials`, `/miners`, `/costs`             | 200 with JSON.                                                                                                                                                 |
| AP-3 | Any route without the `authorization` header                                      | 401 `ERR_AUTH_UNAUTHORIZED`.                                                                                                                                   |
| AP-4 | `GET /operations?granularity=hour&start=<now−100 days>&end=<now>` (ms)            | 400 `ERR_BAD_RANGE: range too long for hour granularity` (limit 93 days; 3 years for other granularities).                                                     |
| AP-5 | `start` equal to or after `end`                                                   | 400 `ERR_BAD_RANGE: start must be before end`.                                                                                                                 |
| AP-6 | `granularity=minute`, `start=abc`, `costs?year=1999`                              | 400 naming the bad parameter.                                                                                                                                  |
| AP-7 | `PUT /costs` with month 13, a negative amount, the same month twice, or no months | 400 each, naming the problem; nothing saved.                                                                                                                   |
| AP-8 | `PUT /costs` with `"energyUsd": null`                                             | 200; the month's amount is cleared (stays `null`, not 0).                                                                                                      |
| AP-9 | `PUT /costs` as `qa-viewer`                                                       | 403 `ERR_AUTH_FORBIDDEN`.                                                                                                                                      |

The README's Routes table lists every route and its parameters.

## Known issues

As of 29 Oct 2026, with MDK 0.13.0 from npm.

| Issue                                                                                                                                                                                              | Where           | Workaround                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------- |
| `mdk create dashboard` hits npm's `edgesOut` crash, still exits successfully, and leaves the dashboard uninstalled. Its hint, `npm install`, crashes the same way.                                 | MDK             | `npm install --legacy-peer-deps` in the dashboard folder.           |
| A viewer can edit Cost Input and only learns on save that they may not. MDK doesn't tell an app's UI what the user may do.                                                                         | MDK             | None; the save is refused correctly.                                |
| The app has no default site config, so installed alone it stops the whole stack (`ERR_CONFIG_MISSING`).                                                                                            | App             | Write `config/site.json` and `config/hardware-catalogue.json` (B3). |
| Standalone only: pool payouts come from the simulation, network hashprice from the real mempool.space API, so Hash Balance can show the site earning well above network hashprice in older months. | App (mock site) | None; it's demo data. Real sites aren't affected.                   |
| Home card: a missing Efficiency reads `— W/TH/s` while Hashrate and Power read `—`.                                                                                                                | App             | Cosmetic.                                                           |

`docs/mdk-friction.md` lists everything in MDK the app works around.

## Reporting a bug

Include:

- **Setup:** standalone or MDK project.
- **Versions:** the app commit (`git rev-parse --short HEAD` in the app repo, or the `resolved` commit for `reporting-tool-lite` in the project's `package-lock.json`) and the MDK version (`npm run mdk -- --version`).
- **The URL**, query included: it carries the period, buckets and view.
- **What you expected and what you saw**, with a screenshot.
- **The API response** for the same period (see [API](#api)), if a figure looks wrong.
- **The browser console** (errors and failed requests) and the stack's terminal output around the time.
