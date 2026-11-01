# Site figures

The card this app adds to the dashboard's Home: the site's average hashrate, power and efficiency over the last 24 hours, linking to the reports.

- [use-site-figures.ts](use-site-figures.ts): the [operations](../operations/README.md) report for a 24-hour window that moves forward every minute (`useMinute`).
- [site-figures-shape.ts](site-figures-shape.ts): three formatted figures.
- [site-figures-home-panel.tsx](site-figures-home-panel.tsx): `SingleStatCard`s, with the devkit's `Loader` and `ErrorCard`. [index.tsx](../../index.tsx) registers it in `MDK_APP_PANEL_SLOT.HOME`.

**Reuse:** the smallest feature here, and the example to follow for a Home panel.
