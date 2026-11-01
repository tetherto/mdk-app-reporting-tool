/**
 * The app's Gateway route table, defined against the contract schemas.
 * `npm run gen:routes` writes it to plugin/mdk-plugin.json (the file the
 * Gateway loads), and CI fails when that file is stale. Query schemas become the
 * Gateway's request validation; response schemas document each route for
 * readers and MCP clients.
 */
import { z } from "zod";

import {
  consumptionReportSchema,
  costYearSchema,
  costsUpdateSchema,
  financialsReportSchema,
  granularitySchema,
  minersSnapshotSchema,
  operationsReportSchema,
  siteInfoSchema,
  yearCostsSchema,
} from "./contract.ts";

export type RouteDefinition = {
  id: string;
  method: "GET" | "POST" | "PUT";
  path: string;
  /** Controller file under plugin/controllers/. */
  handler: string;
  safety: "read-only" | "write";
  description: string;
  query?: z.ZodObject;
  /** JSON request body, required when set. The Gateway validates it before the handler runs. */
  body?: z.ZodType;
  response: z.ZodType;
  /** Error codes the route can return, besides Gateway validation errors. */
  errors?: Record<string, string>;
};

/** Every route reads the app's store, which main.js opens before the routes serve. */
const NOT_READY = { ERR_APP_NOT_READY: "500: the app's store is not open yet" };

const RANGE_ERRORS = {
  ...NOT_READY,
  ERR_BAD_RANGE:
    "400: `start` is not before `end`, or the range is too long for the granularity (hour: 93 days, others: 3 years)",
};

const granularity = granularitySchema.optional().describe("Bucket size in the site's timezone");

const rangeQuery = z.object({
  start: z.number().int().nonnegative().optional().describe("Range start, ms since epoch"),
  end: z.number().int().nonnegative().optional().describe("Range end, ms since epoch, exclusive"),
  granularity,
});

const COSTS_ERRORS = {
  ...NOT_READY,
  ERR_BAD_COSTS: "400: a month appears twice, or a value is not a non-negative number",
};

export const ROUTE_TABLE: RouteDefinition[] = [
  {
    id: "reporting.site.get",
    method: "GET",
    path: "/api/reporting/site",
    handler: "site",
    safety: "read-only",
    description:
      "The site: name, timezone, mining units, miner types present, which data sources are wired, and how far back history goes",
    response: siteInfoSchema,
    errors: NOT_READY,
  },
  {
    id: "reporting.operations.get",
    method: "GET",
    path: "/api/reporting/operations",
    handler: "operations",
    safety: "read-only",
    description:
      "Hashrate, power, efficiency, nominal values and miner status per period bucket, for the site, each mining unit and each miner type",
    query: z.object({
      start: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("Range start, ms since epoch (default: 30 days before end)"),
      end: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("Range end, ms since epoch, exclusive (default: now)"),
      granularity,
    }),
    response: operationsReportSchema,
    errors: RANGE_ERRORS,
  },
  {
    id: "reporting.miners.get",
    method: "GET",
    path: "/api/reporting/miners",
    handler: "miners",
    safety: "read-only",
    description:
      "The fleet as of the latest sample: miner counts per type by status and power mode, power per type",
    query: z.object({
      refresh: z
        .enum(["true", "false"])
        .optional()
        .describe("true samples the site before answering"),
    }),
    response: minersSnapshotSchema,
    errors: NOT_READY,
  },
  {
    id: "reporting.consumption.get",
    method: "GET",
    path: "/api/reporting/consumption",
    handler: "consumption",
    safety: "read-only",
    description: "Energy per power meter per period bucket, in MWh, with the site meter apart",
    query: z.object({
      start: z.number().int().nonnegative().optional().describe("Range start, ms since epoch"),
      end: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .describe("Range end, ms since epoch, exclusive"),
      granularity,
    }),
    response: consumptionReportSchema,
    errors: RANGE_ERRORS,
  },
  {
    id: "reporting.financials.get",
    method: "GET",
    path: "/api/reporting/financials",
    handler: "financials",
    safety: "read-only",
    description:
      "Pool payouts, subsidy / fee split, revenue at production-date price, network hashprice, energy, hashrate and Cost Input costs per period bucket, with every per-MWh and per-PH/s/day figure",
    query: rangeQuery,
    response: financialsReportSchema,
    errors: RANGE_ERRORS,
  },
  {
    id: "reporting.costs.get",
    method: "GET",
    path: "/api/reporting/costs",
    handler: "costs-get",
    safety: "read-only",
    description:
      "Cost Input for one year: monthly energy and operations cost in USD, twelve months",
    query: z.object({
      year: costYearSchema
        .optional()
        .describe("Calendar year (default: this year in the site's timezone)"),
    }),
    response: yearCostsSchema,
    errors: COSTS_ERRORS,
  },
  {
    id: "reporting.costs.put",
    method: "PUT",
    path: "/api/reporting/costs",
    handler: "costs-put",
    safety: "write",
    description:
      "Sets monthly energy and operations cost (USD) for months of one year, in the app's own store; answers the whole year. The app's only write: it never reaches MDK or a device",
    body: costsUpdateSchema,
    response: yearCostsSchema,
    errors: COSTS_ERRORS,
  },
];

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/**
 * `anyOf: [{ type: T, … }, { type: "null" }]` (either order) as one schema,
 * `{ type: [T, "null"], … }`, at every depth. The two mean the same, but the
 * Gateway validates bodies with Fastify's Ajv, which coerces types: in the
 * anyOf it tries the number branch first and turns a `null` into `0`, so a
 * cleared cost would be saved as $0. With a type list Ajv only coerces a value
 * that is none of the types, and `null` is one of them.
 */
export const collapseNullable = (node: unknown): unknown => {
  if (Array.isArray(node)) return node.map(collapseNullable);
  if (!isObject(node)) return node;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(node)) out[key] = collapseNullable(value);
  const { anyOf, ...rest } = out;
  if (!Array.isArray(anyOf) || anyOf.length !== 2) return out;
  const nullAt = anyOf.findIndex(
    (s) => isObject(s) && s.type === "null" && Object.keys(s).length === 1,
  );
  if (nullAt < 0) return out;
  const other = anyOf[1 - nullAt];
  if (!isObject(other) || typeof other.type !== "string") return out;
  return { ...rest, ...other, type: [other.type, "null"] };
};

const jsonSchema = (schema: z.ZodType): Record<string, unknown> => {
  const { $schema: _dropped, ...rest } = z.toJSONSchema(schema, { io: "input" });
  const collapsed = collapseNullable(rest);
  return isObject(collapsed) ? collapsed : rest;
};

/**
 * OpenAPI-style query parameters, as the Gateway's plugin loader reads them. A
 * field's `.describe()` text becomes the parameter's description.
 */
const parametersOf = (schema: z.ZodObject | undefined) => {
  if (schema === undefined) return [];
  return Object.entries(schema.shape).map(([name, fieldSchema]: [string, z.ZodType]) => {
    const required = !fieldSchema.safeParse(undefined).success;
    const { description, ...fieldJson } = jsonSchema(fieldSchema);
    const parameter: Record<string, unknown> = { name, in: "query", required };
    if (typeof description === "string") parameter.description = description;
    parameter.schema = fieldJson;
    return parameter;
  });
};

/** The route table in the mdk-plugin.json format. */
export const toPluginManifest = (meta: { name: string; version: string; description: string }) => ({
  ...meta,
  routes: ROUTE_TABLE.map((route) => {
    const parameters = parametersOf(route.query);
    const http: Record<string, unknown> = { method: route.method, path: route.path };
    if (parameters.length > 0) http.parameters = parameters;
    if (route.body !== undefined)
      http.requestBody = {
        required: true,
        content: { "application/json": { schema: jsonSchema(route.body) } },
      };
    http.responses = {
      200: { content: { "application/json": { schema: jsonSchema(route.response) } } },
    };

    const entry: Record<string, unknown> = {
      id: route.id,
      handler: `./controllers/${route.handler}.js`,
      safety: route.safety,
      description: route.description,
      http,
    };
    if (route.errors !== undefined) entry.errors = route.errors;
    return entry;
  }),
});
