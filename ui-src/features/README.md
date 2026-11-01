# Features

One folder per feature. Each one follows the same layers, so any of them shows how to build a page from an MDK app route:

1. **Request:** the hook calls a route with `useParsedQuery`, which parses the body with its schema from [api/contract.ts](../api/contract.ts).
2. **Hook:** `use-*.ts` returns a view (`loading | error | ready`), never raw query state.
3. **Shape:** `*-shape.ts` holds pure functions that turn a report into what the components render, mostly `ChartView`s and tiles. They have no React in them, and most have tests beside them.
4. **Components:** render a view and never fetch. Shared ones are in [components/](../components/README.md).
5. **Page:** `*-page.tsx` is thin: the period, the hook, the widgets. [index.tsx](../index.tsx) registers it, wrapped in `withSite`.

| Feature                                | Pages or panel                                                                         | Route                   |
| -------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------- |
| [site](site/README.md)                 | Gate in front of every page                                                            | `/site`                 |
| [operations](operations/README.md)     | None: the shared operations report and its shapes                                      | `/operations`           |
| [dashboard](dashboard/README.md)       | Dashboard                                                                              | `/operations`           |
| [metrics](metrics/README.md)           | Hashrate, Energy, Efficiency                                                           | `/operations`           |
| [consumption](consumption/README.md)   | Energy's Consumption view                                                              | `/consumption`          |
| [miners](miners/README.md)             | Miners, and Energy's Power Mode table                                                  | `/miners`               |
| [financials](financials/README.md)     | Revenue Summary, Cost Summary, Subsidy / Fee, Hash Balance, Energy Balance, Cost Input | `/financials`, `/costs` |
| [site-figures](site-figures/README.md) | The last-24-hours card on the dashboard's Home                                         | `/operations`           |

Routes are under `/api/reporting`, relative to the app's mount. To reuse a feature, start from its README, then [docs/reusing.md](../../docs/reusing.md).
