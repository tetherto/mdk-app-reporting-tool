# Miners

The fleet as of the latest sample: miners per type by status and by power mode, and the status trend over a period.

- [use-miners-snapshot.ts](use-miners-snapshot.ts): `useMinersSnapshot` on the `/miners` route, `useSnapshotRefresh` (calls it with `refresh` to sample the site now), `useMinerSlices` and `useMinerStatusTrend`.
- [miners-shape.ts](miners-shape.ts): the All / Offline / Maintenance tabs and their doughnut slices per miner type.
- [miners-page.tsx](miners-page.tsx): the Miners page.
- [power-mode-table.tsx](power-mode-table.tsx): miners per type by power mode, shown on the Energy page.
- [snapshot-bar.tsx](snapshot-bar.tsx): `SnapshotBar`, a banner with the snapshot's time and a Refresh button.

**Reuse:** `SnapshotBar` with `useSnapshotRefresh` is the pattern for any figure that is a point-in-time sample rather than a period report.
