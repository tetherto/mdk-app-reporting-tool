# Site

Loads the site once and holds every page back until it is known: its names, timezone, mining units, miner models, which data sources are wired, and the history's extent.

- [use-site.ts](use-site.ts): `useSite()`, the `/site` route as a view.
- [site-gate.tsx](site-gate.tsx): `SiteGate` shows a loader or an error until the site is loaded, then its children. `useSiteInfo()` reads the site inside it. `withSite(Page)` wraps a page in the gate, as [index.tsx](../../index.tsx) does for every page.

**Reuse:** this pattern suits any app whose pages all need the same config first, such as a timezone or units. Replace `siteInfoSchema` and the route with your own. The query is cached, so moving between pages doesn't reload it.
