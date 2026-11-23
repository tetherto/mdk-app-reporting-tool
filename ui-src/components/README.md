# Components

Presentational components shared by every page. They never fetch: a page's hook loads the data and passes them a view. Each one is built on a devkit component and adds only what the devkit doesn't have. See [docs/reusing.md](../../docs/reusing.md) for the rest of what can be reused.

| Component                            | File                                         | Built on                           | What it adds                                                                                                                     |
| ------------------------------------ | -------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `Page`, `Toolbar`, `Field`           | [page.tsx](page.tsx)                         | `Typography`                       | The frame of a page: the title, a toolbar of labelled controls, then the content                                                 |
| `TimeChart`                          | [time-chart.tsx](time-chart.tsx)             | `BarChart`, `buildBarChartOptions` | Bars and lines over period buckets from a `ChartView`, a right axis, units level above their axes, and level, spaced date labels |
| `Widget`, `widgetState`              | [widget.tsx](widget.tsx)                     | `ChartContainer`                   | One card for every state: loading, error, not wired, empty, data. Can expand to full width                                       |
| `NotWired`                           | [widget.tsx](widget.tsx)                     | `Notice`                           | Says which data source isn't connected and links to where it is wired, in three sizes                                            |
| `Notice`                             | [notice.tsx](notice.tsx)                     | `EmptyState`                       | The app's one empty or "not available" state: an icon, a message and an optional action, in a card or inline in a tile           |
| `Tiles`                              | [tiles.tsx](tiles.tsx)                       | `SingleStatCard`                   | A grid of stat tiles with detail lines, and a not-wired state per tile                                                           |
| `ViewTabs`                           | [view-tabs.tsx](view-tabs.tsx)               | `CurrencyToggler`                  | A page's views as a full-width tab bar                                                                                           |
| `CurrencyToggle`, `BitcoinUnitField` | [unit-toggles.tsx](unit-toggles.tsx)         | `CurrencyToggler`                  | USD / BTC for a chart header; BTC / Sats for a toolbar                                                                           |
| `EfficiencyInfo`                     | [efficiency-info.tsx](efficiency-info.tsx)   | `SimpleTooltip`                    | An info tooltip defining site efficiency                                                                                         |
| `SetMonthlyCost`                     | [set-monthly-cost.tsx](set-monthly-cost.tsx) | `Button`                           | Opens Cost Input. Specific to this app                                                                                           |

## Using them on a page

```tsx
const view = useDashboard(period.query); // loading | error | ready
const state = widgetState(view, (charts) => charts.empty);
const charts = view.status === "ready" ? view.data : undefined;

<Page title="Dashboard" actions={<PeriodControl state={period} timezone={tz} />}>
  <Widget title="Hashrate" state={state} expandable>
    {charts === undefined ? null : <TimeChart {...charts.hashrate} />}
  </Widget>
</Page>;
```

[features/dashboard/dashboard-page.tsx](../features/dashboard/dashboard-page.tsx) is the full version.

## Copying one into another app

- Copy the CSS for its `reporting-*` classes from [styles.css](../styles.css) and rename the prefix.
- `Widget` and `NotWired` know this app's data sources (`WIRED_SOURCES`) and link to this repo's README or to a page of the app (Cost Input, Revenue Summary). Replace the `MISSING_SOURCES` table and `README_URL` with your app's sources.
- `Tiles` takes the `Tile` type from [features/financials/financials-shape.ts](../features/financials/financials-shape.ts), and the unit toggles take `Currency` from the same file. Move those types along with them.
- `TimeChart` needs only [lib/chart-view.ts](../lib/chart-view.ts). Its date-label fix works around a devkit default, explained in [docs/mdk-friction.md](../../docs/mdk-friction.md).
