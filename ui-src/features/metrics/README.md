# Metrics

Hashrate, Energy and Efficiency are one template, `MetricPage`, given a metric from [lib/metrics.ts](../../lib/metrics.ts).

- [metric-page.tsx](metric-page.tsx): three views (Site, Miner Type, Mining Unit) as tabs, a toolbar with the period, the bucket size and the view's filter, and the nominal value and period average on the Site View. A page can add tabs (`extraTabs`) and content under the Site View chart (`siteViewExtra`).
- [use-metric.ts](use-metric.ts): `useSiteMetric`, `useMetricBreakdown` and `useFleetFilters`, all on the [operations](../operations/README.md) report.
- [hashrate-page.tsx](hashrate-page.tsx), [efficiency-page.tsx](efficiency-page.tsx), [energy-page.tsx](energy-page.tsx): one line each, except Energy, which adds the [Consumption](../consumption/README.md) tab and the [Power Mode table](../miners/README.md).

**Reuse:** for another per-fleet metric, add it to `METRICS` (its field, unit and scales) and render `MetricPage` with it.
