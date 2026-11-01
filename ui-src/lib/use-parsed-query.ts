import type { QueryView } from "@tetherto/mdk-react-adapter";
import { toQueryView, useQuery } from "@tetherto/mdk-react-adapter";
import type { z } from "zod";
import { ZodError } from "zod";

import { getParsed } from "../api/request";

/** Every query key starts with this, so one invalidation refreshes the app's data. */
export const QUERY_ROOT = "reporting";

const REFETCH_MS = 60_000;

/** What an operator should do when the app's runtime doesn't answer. */
export const UNREACHABLE_HINT =
  "Check that the reporting app is running in the stack (`mdk run`), then reload.";

const keepPrevious = <T>(previous: T | undefined): T | undefined => previous;

/**
 * One route's parsed body as a view, refreshed every minute. With
 * `keepPrevious`, the last body stays on screen while the next one (another
 * period, say) loads. A body that doesn't match the contract says so; any
 * other failure is described by MDK's describeRequestError.
 */
export function useParsedQuery<Schema extends z.ZodType>(
  url: string,
  schema: Schema,
  options: { keepPrevious?: boolean } = {},
): QueryView<z.infer<Schema>> {
  const query = useQuery({
    queryKey: [QUERY_ROOT, url],
    queryFn: () => getParsed(url, schema),
    refetchInterval: REFETCH_MS,
    placeholderData: options.keepPrevious === true ? keepPrevious : undefined,
  });
  if (query.error instanceof ZodError)
    return {
      status: "error",
      message: `${url} answered with a body that does not match the contract.`,
    };
  return toQueryView(query, url, { unreachableHint: UNREACHABLE_HINT });
}
