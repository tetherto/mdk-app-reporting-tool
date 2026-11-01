# Consumption

The Energy page's Consumption view: energy per power meter over a period, with the site meter apart, as a stacked chart, a table and a CSV export. It shows only when the site has meters.

- [use-consumption.ts](use-consumption.ts): `useConsumption(query)` on the `/consumption` route, and `useConsumptionExport`, which downloads the table with MDK's `downloadCsv`.
- [consumption-shape.ts](consumption-shape.ts): `toConsumptionTable` (the chart and its rows) and `toConsumptionCsv`.
- [consumption-panel.tsx](consumption-panel.tsx): `TimeChart` and the devkit's `DataTable` and `ExportButton`.

**Reuse:** an example of a chart with the table behind it and its CSV, all from one shape.
