# Reusing parts of this app

Most of this app is meant to be copied into other MDK apps: its UI components, the request and view helpers, the plugin's time and telemetry code, and the market-data worker. This page lists those parts, what each one needs, and what to change when you copy it. The folder READMEs go into more detail:

- [ui-src/components/](../ui-src/components/README.md): the shared UI components
- [ui-src/features/](../ui-src/features/README.md): one folder per feature, each with its own README
- [workers/mempool/](../workers/mempool/README.md): the market-data worker

The app is Apache-2.0. Copy files rather than importing from this package, which ships only the built `ui/` and the plugin.

## Before you copy

- **The contract comes first.** Every UI type a component or hook takes comes from the zod schemas in [ui-src/api/contract.ts](../ui-src/api/contract.ts), or from a shape built on them. When you copy a hook or a shape, copy the schemas it reads, or write your own for your routes.
- **Peer packages stay external.** `@tetherto/mdk-react-adapter`, `@tetherto/mdk-react-devkit` (root import only), `@tetherto/mdk-ui-foundation`, react, react-router and react-query are lent by the dashboard at runtime. [ui-src/vite.config.ts](../ui-src/vite.config.ts) keeps them out of the bundle with MDK's `MDK_APP_SHARED_MODULES`; do the same in your app.
- **Styles are prefixed.** Components use `reporting-*` class names from [ui-src/styles.css](../ui-src/styles.css). Copy the blocks for the classes a component uses and rename the prefix to your app's.
- **Routes are never hardcoded.** Resolve API routes with `useMdkApp().apiUrl(...)` and link to pages with relative paths, since the operator chooses the name the app is installed under.

## UI building blocks

| Part                               | File                                                                           | Needs                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------- |
| `getParsed`, `putParsed`           | [api/request.ts](../ui-src/api/request.ts)                                     | `mdkFetch`, zod                                           |
| `useParsedQuery`                   | [lib/use-parsed-query.ts](../ui-src/lib/use-parsed-query.ts)                   | `getParsed`, react-adapter's `useQuery` and `toQueryView` |
| `useShaped`                        | [lib/view.ts](../ui-src/lib/view.ts)                                           | react-adapter's `QueryView`                               |
| `ChartView`, `ChartSeries`         | [lib/chart-view.ts](../ui-src/lib/chart-view.ts)                               | nothing                                                   |
| Number, unit and bucket formatting | [lib/format.ts](../ui-src/lib/format.ts)                                       | devkit units                                              |
| Series colours                     | [lib/colors.ts](../ui-src/lib/colors.ts)                                       | devkit palettes                                           |
| `useMinute`                        | [lib/use-minute.ts](../ui-src/lib/use-minute.ts)                               | nothing                                                   |
| `SiteGate`, `withSite`             | [features/site/site-gate.tsx](../ui-src/features/site/site-gate.tsx)           | a `/site` route and its schema                            |
| `SnapshotBar`                      | [features/miners/snapshot-bar.tsx](../ui-src/features/miners/snapshot-bar.tsx) | a refreshable snapshot route                              |
| Page frame, charts, widgets, tiles | [components/](../ui-src/components/README.md)                                  | see that README                                           |

Together they give a page the same pipeline: `getParsed` checks the body against the contract, `useParsedQuery` turns it into a `loading | error | ready` view, `useShaped` maps it to what a component renders (often a `ChartView`), and `Widget` shows each state. Any of the features is a worked example; [features/site-figures/](../ui-src/features/site-figures/README.md) is the smallest.

## Plugin

The plugin is CommonJS and runs in the MDK Gateway. These modules have no dependencies on the rest of the app beyond the ones listed.

| Module                                                                           | What it does                                                                                                                                               | Needs                               |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [lib/time.js](../plugin/lib/time.js)                                             | Hour, day, week and month buckets in a site's timezone (`bucketStart`, `bucketsBetween`, `bucketSpans`), without a date library                            | nothing                             |
| [lib/range.js](../plugin/lib/range.js)                                           | Parses `start`, `end` and `granularity` from a query, with a range ceiling per granularity, and throws `ERR_*` errors with a `statusCode`                  | `time.js`                           |
| [lib/telemetry.js](../plugin/lib/telemetry.js)                                   | Reads miner and meter telemetry from any vendor's worker by its contract: picks the channel, scales by the declared unit, normalises status and power mode | nothing                             |
| [lib/collector.js](../plugin/lib/collector.js)                                   | Discovers workers with `getStatus()` and samples them on an interval, read-only. Pool payouts and market data backfill                                     | `telemetry.js`, a store             |
| [lib/store.js](../plugin/lib/store.js), [lib/totals.js](../plugin/lib/totals.js) | SQLite history (`node:sqlite`, no dependency) with quarter-hour and site-day totals, so reports over years read thousands of rows                          | `time.js`. The schema is this app's |
| [lib/client.js](../plugin/lib/client.js)                                         | The app's Kernel client, from the MDK CLI's app template                                                                                                   | `@tetherto/mdk-gateway`             |

`telemetry.js` and `time.js` copy as they are. The collector and the store are tied to this app's reports: use them as a model for your own. [docs/data-sources.md](data-sources.md) explains the channels the collector reads.

## Workers and the dev stack

- **[workers/mempool](../workers/mempool/README.md)** is a standalone MDK worker for Bitcoin market data (price, network hashrate, hashprice, fee share, fee rate). Any app can add it to its `mdk.yaml`.
- **[dev/mock-site/](../dev/mock-site/)** shows how to run MDK's public workers against their bundled mocks, driven by one simulation, so the live readings and the seeded history agree. Copy the pattern for an app that needs a believable fleet without hardware. [docs/mock-site.md](mock-site.md) explains how it works.

## Elsewhere

- MDK ([tetherto/mdk](https://github.com/tetherto/mdk/)): the [devkit components](https://github.com/tetherto/mdk/tree/main/ui/packages/react-devkit), the [React adapter](https://github.com/tetherto/mdk/tree/main/ui/packages/react-adapter), [ui-foundation](https://github.com/tetherto/mdk/tree/main/ui/packages/ui-foundation), the [worker SDK](https://github.com/tetherto/mdk/tree/main/backend/core/mdk-worker) and the [public workers](https://github.com/tetherto/mdk/tree/main/backend/workers). Check the devkit before copying a component from here; this app builds its own only where the devkit has none.
- [tetherto/mdk-app-operation-center](https://github.com/tetherto/mdk-app-operation-center): the reference MDK app this one follows in layout, contract and CI.
- [docs/mdk-friction.md](mdk-friction.md): where this app works around MDK, with the reasons. Read it before copying a workaround.
