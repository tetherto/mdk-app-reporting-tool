import type { QueryView } from "@tetherto/mdk-react-adapter";
import { useMdkApp } from "@tetherto/mdk-react-adapter";

import type { OperationsReport, RangeQuery } from "../../api/contract";
import { operationsReportSchema } from "../../api/contract";
import { withRange } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import { useParsedQuery } from "../../lib/use-parsed-query";

/** The operations report for a period. The last report stays on screen while the next period loads. */
export const useOperations = (query: RangeQuery): QueryView<OperationsReport> => {
  const { apiUrl } = useMdkApp();
  return useParsedQuery(withRange(apiUrl(API_ROUTES.OPERATIONS), query), operationsReportSchema, {
    keepPrevious: true,
  });
};
