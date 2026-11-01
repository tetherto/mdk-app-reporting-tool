import type { QueryView } from "@tetherto/mdk-react-adapter";
import { useMdkApp, useQueryClient } from "@tetherto/mdk-react-adapter";
import { describeRequestError } from "@tetherto/mdk-ui-foundation";
import { useCallback, useState } from "react";

import type { MinerStatus, MinersSnapshot, OperationsReport, RangeQuery } from "../../api/contract";
import { minersSnapshotSchema } from "../../api/contract";
import { getParsed } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import type { ChartView } from "../../lib/chart-view";
import { QUERY_ROOT, UNREACHABLE_HINT, useParsedQuery } from "../../lib/use-parsed-query";
import { useShaped } from "../../lib/view";
import { statusTrend } from "../operations/operations-shape";
import { useOperations } from "../operations/use-operations";
import type { MinerSlices, MinersTab } from "./miners-shape";
import { MINERS_TAB_SPECS, toMinerSlices } from "./miners-shape";

/** The latest fleet snapshot. */
export const useMinersSnapshot = (): QueryView<MinersSnapshot> => {
  const { apiUrl } = useMdkApp();
  return useParsedQuery(apiUrl(API_ROUTES.MINERS), minersSnapshotSchema);
};

/** The latest fleet snapshot as doughnut slices per miner type, for a Miners tab. */
export const useMinerSlices = (tab: MinersTab): QueryView<MinerSlices> =>
  useShaped(
    useMinersSnapshot(),
    useCallback((s: MinersSnapshot) => toMinerSlices(s, MINERS_TAB_SPECS[tab].count), [tab]),
  );

/** Miners per status over the period, stacked, for the statuses a Miners tab shows. */
export const useMinerStatusTrend = (
  query: RangeQuery,
  statuses: readonly MinerStatus[],
): QueryView<ChartView> =>
  useShaped(
    useOperations(query),
    useCallback((r: OperationsReport) => statusTrend(r, statuses), [statuses]),
  );

export type SnapshotRefresh = { refresh: () => void; refreshing: boolean; error: string | null };

/** Refresh: sample the site now, then reload every report the app shows. */
export const useSnapshotRefresh = (): SnapshotRefresh => {
  const client = useQueryClient();
  const { apiUrl } = useMdkApp();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    const url = apiUrl(API_ROUTES.MINERS);
    const refreshUrl = `${url}?refresh=true`;
    setRefreshing(true);
    setError(null);
    try {
      client.setQueryData([QUERY_ROOT, url], await getParsed(refreshUrl, minersSnapshotSchema));
      // Every other report: the snapshot query was just filled with the fresh body.
      await client.invalidateQueries({
        queryKey: [QUERY_ROOT],
        predicate: (q) => q.queryKey[1] !== url,
      });
    } catch (err) {
      setError(describeRequestError(err, refreshUrl, { unreachableHint: UNREACHABLE_HINT }));
    } finally {
      setRefreshing(false);
    }
  }, [client, apiUrl]);

  const refresh = useCallback(() => {
    void run();
  }, [run]);
  return { refresh, refreshing, error };
};
