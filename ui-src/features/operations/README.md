# Operations

The operations report and the shapes built on it. It has no page of its own: Dashboard, the metric pages, Miners and the Home card all read it.

- [use-operations.ts](use-operations.ts): `useOperations(query)`, the `/operations` route for a period: hashrate, power, efficiency, nominal values and miner status per bucket. The last report stays on screen while the next period loads.
- [operations-shape.ts](operations-shape.ts): `bucketLabels` (each bucket's label in the site's timezone), `metricTrend` (a metric with its nominal value), `metricBreakdown` (the period average per miner type or mining unit), `metricSummary` and `statusTrend` (miners per status per bucket).
- [report-fixture.ts](report-fixture.ts): a report for the shape tests.

**Reuse:** `bucketLabels` and the metric helpers work for any report of buckets with per-model figures. They read scales and units from [lib/metrics.ts](../../lib/metrics.ts).
