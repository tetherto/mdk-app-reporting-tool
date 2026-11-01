/**
 * The app's Gateway routes, relative to its mount. Resolve them with
 * `useMdkApp().apiUrl(...)`: the dashboard serves the app under the name the
 * operator installed it as, so the full URL is never hardcoded. The route table
 * the Gateway serves is plugin/mdk-plugin.json.
 */
export const API_ROUTES = {
  SITE: "/api/reporting/site",
  OPERATIONS: "/api/reporting/operations",
  MINERS: "/api/reporting/miners",
  CONSUMPTION: "/api/reporting/consumption",
  FINANCIALS: "/api/reporting/financials",
  COSTS: "/api/reporting/costs",
} as const;
