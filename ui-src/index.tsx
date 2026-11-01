// The app's UI entry, built to ../ui/index.js (`npm run build:ui`). The dashboard
// imports it and mounts its pages under /app/<name>/ (its sidebar groups them
// by section) and its panel on Home.
import {
  defineMdkApp,
  MDK_APP_PANEL_SLOT,
  type MdkAppRoute,
  type MdkAppSection,
} from "@tetherto/mdk-react-adapter";
import { FinancialsNavIcon, OperationsNavIcon } from "@tetherto/mdk-react-devkit";

import { APP_PATHS } from "./app-routes";
import { DashboardPage } from "./features/dashboard/dashboard-page";
import { CostInputPage } from "./features/financials/cost-input-page";
import { CostSummaryPage } from "./features/financials/cost-summary-page";
import { EnergyBalancePage } from "./features/financials/energy-balance-page";
import { HashBalancePage } from "./features/financials/hash-balance-page";
import { RevenueSummaryPage } from "./features/financials/revenue-summary-page";
import { SubsidyFeePage } from "./features/financials/subsidy-fee-page";
import { EfficiencyPage } from "./features/metrics/efficiency-page";
import { EnergyPage } from "./features/metrics/energy-page";
import { HashratePage } from "./features/metrics/hashrate-page";
import { MinersPage } from "./features/miners/miners-page";
import { SiteFiguresHomePanel } from "./features/site-figures/site-figures-home-panel";
import { withSite } from "./features/site/site-gate";
import "./styles.css";

// Sidebar sections, as the design groups the pages. A dashboard older than
// sections ignores them and lists the pages in this order, in one group.
const SECTION = {
  OPERATIONS: "Operations",
  FINANCIALS: "Financials",
} as const;

const sections: MdkAppSection[] = [
  { label: SECTION.OPERATIONS, icon: OperationsNavIcon },
  { label: SECTION.FINANCIALS, icon: FinancialsNavIcon },
];

const routes: MdkAppRoute[] = [
  {
    path: APP_PATHS.DASHBOARD,
    label: "Dashboard",
    section: SECTION.OPERATIONS,
    component: withSite(DashboardPage),
  },
  {
    path: APP_PATHS.HASHRATE,
    label: "Hashrate",
    section: SECTION.OPERATIONS,
    component: withSite(HashratePage),
  },
  {
    path: APP_PATHS.ENERGY,
    label: "Energy",
    section: SECTION.OPERATIONS,
    component: withSite(EnergyPage),
  },
  {
    path: APP_PATHS.EFFICIENCY,
    label: "Efficiency",
    section: SECTION.OPERATIONS,
    component: withSite(EfficiencyPage),
  },
  {
    path: APP_PATHS.MINERS,
    label: "Miners",
    section: SECTION.OPERATIONS,
    component: withSite(MinersPage),
  },
  {
    path: APP_PATHS.REVENUE_SUMMARY,
    label: "Revenue Summary",
    section: SECTION.FINANCIALS,
    component: withSite(RevenueSummaryPage),
  },
  {
    path: APP_PATHS.COST_SUMMARY,
    label: "Cost Summary",
    section: SECTION.FINANCIALS,
    component: withSite(CostSummaryPage),
  },
  {
    path: APP_PATHS.SUBSIDY_FEE,
    label: "Subsidy / Fee",
    section: SECTION.FINANCIALS,
    component: withSite(SubsidyFeePage),
  },
  {
    path: APP_PATHS.HASH_BALANCE,
    label: "Hash Balance",
    section: SECTION.FINANCIALS,
    component: withSite(HashBalancePage),
  },
  {
    path: APP_PATHS.ENERGY_BALANCE,
    label: "Energy Balance",
    section: SECTION.FINANCIALS,
    component: withSite(EnergyBalancePage),
  },
  {
    path: APP_PATHS.COST_INPUT,
    label: "Cost Input",
    section: SECTION.FINANCIALS,
    component: withSite(CostInputPage),
  },
];

export default defineMdkApp({
  // Must equal `id` in mdk-app.yaml: the dashboard refuses a mismatch.
  id: "io.tether.reporting-tool-lite",
  displayName: "Reporting Tool Lite",
  routes,
  sections,
  panels: [
    {
      id: "site-24h",
      slot: MDK_APP_PANEL_SLOT.HOME,
      title: "Reporting Tool Lite — last 24 hours",
      component: SiteFiguresHomePanel,
    },
  ],
});
