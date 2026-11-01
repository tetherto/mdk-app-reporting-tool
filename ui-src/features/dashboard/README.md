# Dashboard

The app's first page: hashrate, power, efficiency and miner status over a period, in four expandable widgets.

- [use-dashboard.ts](use-dashboard.ts): shapes the operations report with `toDashboardCharts`.
- [dashboard-shape.ts](dashboard-shape.ts): four `ChartView`s from one report, with `metricTrend` and `statusTrend` from [operations](../operations/README.md).
- [dashboard-page.tsx](dashboard-page.tsx): `PeriodControl`, then a `Widget` with a `TimeChart` per chart.

**Reuse:** the shortest example of a page on the shared components: one hook, one `widgetState`, four widgets. The [components README](../../components/README.md) quotes it.
