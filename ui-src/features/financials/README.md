# Financials

Revenue, costs and hashprice against the network: five report pages on the `/financials` route, and Cost Input on `/costs`. Which figures show depends on what the site has wired: pool, market data, costs (see [Run it on a real site](../../../README.md#run-it-on-a-real-site)).

- [use-financials.ts](use-financials.ts): one financials report shaped per page: `useRevenueSummary`, `useCostSummary`, `useSubsidyFee`, `useHashBalance`, `useEnergyBalance`.
- [use-costs.ts](use-costs.ts): `useYearCosts` and `useSaveCosts`, which saves with `putParsed` and reloads every report.
- [financials-shape.ts](financials-shape.ts): what the pages share: the `Tile` type, the USD / BTC `Currency`, `financialChart`, and `missingOf`, which names the source a figure is missing.
- One `*-shape.ts` and `*-page.tsx` per page: revenue summary, cost summary, subsidy / fee, hash balance, energy balance, cost input.
- [report-fixture.ts](report-fixture.ts): a report for the shape tests.

The figures are defined in [Metric definitions](../../../README.md#metric-definitions).

**Reuse:** the shapes are pure functions with tests in [financials-shape.test.ts](financials-shape.test.ts), so the math (per-MWh, per PH/s-day, cost proration) can be taken without the pages. Cost Input is a full example of an editable, year-by-year form that writes to the app's own store.
