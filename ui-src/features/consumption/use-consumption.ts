import type { QueryView } from "@tetherto/mdk-react-adapter";
import { useMdkApp } from "@tetherto/mdk-react-adapter";
import { downloadCsv } from "@tetherto/mdk-ui-foundation";
import { useCallback } from "react";

import type { RangeQuery } from "../../api/contract";
import { consumptionReportSchema } from "../../api/contract";
import { withRange } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import { useParsedQuery } from "../../lib/use-parsed-query";
import { useShaped } from "../../lib/view";
import type { ConsumptionTable } from "./consumption-shape";
import { toConsumptionCsv, toConsumptionTable } from "./consumption-shape";

/** Energy per meter over the period, as the chart and table render it. */
export const useConsumption = (query: RangeQuery): QueryView<ConsumptionTable> => {
  const { apiUrl } = useMdkApp();
  const view = useParsedQuery(
    withRange(apiUrl(API_ROUTES.CONSUMPTION), query),
    consumptionReportSchema,
    {
      keepPrevious: true,
    },
  );
  return useShaped(view, toConsumptionTable);
};

/** Downloads the table as CSV, named after its granularity and first day; a no-op until it loads. */
export const useConsumptionExport = (
  table: ConsumptionTable | undefined,
  query: RangeQuery,
): (() => void) => {
  const { granularity, start } = query;
  return useCallback(() => {
    if (table === undefined) return;
    const day = new Date(start).toISOString().slice(0, 10);
    const { rows, columns } = toConsumptionCsv(table);
    downloadCsv(rows, `consumption-${granularity}-${day}.csv`, columns);
  }, [table, granularity, start]);
};
