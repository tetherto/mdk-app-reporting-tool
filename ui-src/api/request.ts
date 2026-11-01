import { mdkFetch } from "@tetherto/mdk-ui-foundation";
import type { z } from "zod";

import type { RangeQuery } from "./contract";

/**
 * Calls a route with the signed-in operator's token and parses the body with
 * its contract schema, so a response that drifts from the contract fails here,
 * at the boundary, instead of somewhere in a component. Non-2xx responses throw
 * `MdkFetchError` (from `@tetherto/mdk-ui-foundation`) with the status.
 */
export const getParsed = async <Schema extends z.ZodType>(
  url: string,
  schema: Schema,
): Promise<z.infer<Schema>> => schema.parse(await mdkFetch<unknown>(url));

/** Sends `body` as JSON with `PUT` and parses the answer, like `getParsed`. */
export const putParsed = async <Schema extends z.ZodType>(
  url: string,
  body: unknown,
  schema: Schema,
): Promise<z.infer<Schema>> =>
  schema.parse(
    await mdkFetch<unknown>(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

/** `url` with a report's period as its query string. */
export const withRange = (url: string, query: RangeQuery): string => {
  const params = new URLSearchParams({
    start: String(query.start),
    end: String(query.end),
    granularity: query.granularity,
  });
  return `${url}?${params.toString()}`;
};
