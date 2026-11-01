// The Financials pages' hooks: one financials report per period, shaped per page.
import type { QueryView } from "@tetherto/mdk-react-adapter";
import { useMdkApp } from "@tetherto/mdk-react-adapter";
import type { BitcoinUnit } from "@tetherto/mdk-react-devkit";
import { useCallback } from "react";

import type { FinancialsReport, RangeQuery } from "../../api/contract";
import { financialsReportSchema } from "../../api/contract";
import { withRange } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import type { ChartView } from "../../lib/chart-view";
import { useParsedQuery } from "../../lib/use-parsed-query";
import { useShaped } from "../../lib/view";
import { useSiteInfo } from "../site/site-gate";
import type { CostSummary } from "./cost-summary-shape";
import { toCostSummary } from "./cost-summary-shape";
import type { EnergyBalance } from "./energy-balance-shape";
import { toEnergyBalance } from "./energy-balance-shape";
import type { Currency } from "./financials-shape";
import { missingOf } from "./financials-shape";
import type { HashBalance } from "./hash-balance-shape";
import { toHashBalance } from "./hash-balance-shape";
import type { RevenueChartUnit, RevenueSummary } from "./revenue-summary-shape";
import { revenueChart, toRevenueSummary } from "./revenue-summary-shape";
import { feeRateChart, subsidyFeeChart } from "./subsidy-fee-shape";

/** The financials report for a period. The last report stays on screen while the next period loads. */
export const useFinancials = (query: RangeQuery): QueryView<FinancialsReport> => {
  const { apiUrl } = useMdkApp();
  return useParsedQuery(withRange(apiUrl(API_ROUTES.FINANCIALS), query), financialsReportSchema, {
    keepPrevious: true,
  });
};

export const useRevenueSummary = (
  query: RangeQuery,
  unit: BitcoinUnit,
  chartUnit: RevenueChartUnit,
): QueryView<RevenueSummary & { chart: ChartView }> => {
  const { site, sources } = useSiteInfo();
  return useShaped(
    useFinancials(query),
    useCallback(
      (r: FinancialsReport) => ({
        ...toRevenueSummary(r, sources, unit),
        chart: revenueChart(r, chartUnit, site.name),
      }),
      [sources, unit, chartUnit, site.name],
    ),
  );
};

export const useSubsidyFee = (
  query: RangeQuery,
  unit: BitcoinUnit,
): QueryView<{ chart: ChartView; feeRate: ChartView; report: FinancialsReport }> =>
  useShaped(
    useFinancials(query),
    useCallback(
      (r: FinancialsReport) => ({
        chart: subsidyFeeChart(r, unit),
        feeRate: feeRateChart(r),
        report: r,
      }),
      [unit],
    ),
  );

export const useCostSummary = (
  query: RangeQuery,
): QueryView<CostSummary & { report: FinancialsReport }> =>
  useShaped(
    useFinancials(query),
    useCallback((r: FinancialsReport) => ({ ...toCostSummary(r), report: r }), []),
  );

export const useHashBalance = (
  query: RangeQuery,
  currency: Currency,
  withCost: boolean,
): QueryView<HashBalance & { report: FinancialsReport }> =>
  useShaped(
    useFinancials(query),
    useCallback(
      (r: FinancialsReport) => ({ ...toHashBalance(r, currency, withCost), report: r }),
      [currency, withCost],
    ),
  );

export const useEnergyBalance = (
  query: RangeQuery,
  currency: Currency,
  withCost: boolean,
): QueryView<EnergyBalance & { report: FinancialsReport }> => {
  const { sources } = useSiteInfo();
  return useShaped(
    useFinancials(query),
    useCallback(
      (r: FinancialsReport) => ({
        ...toEnergyBalance(r, currency, withCost, missingOf(["pool"], sources)),
        report: r,
      }),
      [currency, withCost, sources],
    ),
  );
};
