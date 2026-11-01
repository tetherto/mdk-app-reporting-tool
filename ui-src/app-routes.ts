/**
 * Paths of the app's pages, relative to where the dashboard mounts the app
 * (`/app/<installed name>/`). Navigate with relative links, or prefix with
 * `useMdkApp().name`; never hardcode the installed name.
 */
export const APP_PATHS = {
  DASHBOARD: "",
  HASHRATE: "hashrate",
  ENERGY: "energy",
  EFFICIENCY: "efficiency",
  MINERS: "miners",
  REVENUE_SUMMARY: "revenue-summary",
  COST_SUMMARY: "cost-summary",
  SUBSIDY_FEE: "subsidy-fee",
  HASH_BALANCE: "hash-balance",
  ENERGY_BALANCE: "energy-balance",
  COST_INPUT: "cost-input",
} as const;
