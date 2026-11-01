import type { QueryView } from "@tetherto/mdk-react-adapter";
import { useMdkApp, useQueryClient } from "@tetherto/mdk-react-adapter";
import { describeRequestError } from "@tetherto/mdk-ui-foundation";
import { useCallback, useState } from "react";

import type { CostsUpdate, YearCosts } from "../../api/contract";
import { yearCostsSchema } from "../../api/contract";
import { putParsed } from "../../api/request";
import { API_ROUTES } from "../../api/routes";
import { QUERY_ROOT, UNREACHABLE_HINT, useParsedQuery } from "../../lib/use-parsed-query";

const yearUrl = (base: string, year: number): string => `${base}?year=${year}`;

/** One year of Cost Input. */
export const useYearCosts = (year: number): QueryView<YearCosts> => {
  const { apiUrl } = useMdkApp();
  return useParsedQuery(yearUrl(apiUrl(API_ROUTES.COSTS), year), yearCostsSchema);
};

export type SaveCosts = {
  save: (update: CostsUpdate) => Promise<boolean>;
  saving: boolean;
  error: string | null;
};

/**
 * Saves months of Cost Input, then reloads every report: Cost Summary, Hash Cost
 * and Energy Cost read the new values without a restart.
 */
export const useSaveCosts = (): SaveCosts => {
  const client = useQueryClient();
  const { apiUrl } = useMdkApp();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (update: CostsUpdate): Promise<boolean> => {
      const url = apiUrl(API_ROUTES.COSTS);
      setSaving(true);
      setError(null);
      try {
        const saved = await putParsed(url, update, yearCostsSchema);
        client.setQueryData([QUERY_ROOT, yearUrl(url, update.year)], saved);
        await client.invalidateQueries({ queryKey: [QUERY_ROOT] });
        return true;
      } catch (err) {
        setError(describeRequestError(err, url, { unreachableHint: UNREACHABLE_HINT }));
        return false;
      } finally {
        setSaving(false);
      }
    },
    [client, apiUrl],
  );
  return { save, saving, error };
};
