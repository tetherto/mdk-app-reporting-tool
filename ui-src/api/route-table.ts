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
  /** What a successful answer is: the OpenAPI description of the `200` response. */
  answers: string;
  /**
   * Error codes the route can return, besides Gateway validation errors, as
   * `"<status>: <when>"`. The status is the one the plugin sets on the error
   * (`err.statusCode`); a test raises each code and checks it.
   */
  errors?: Record<string, string>;
};

/** Every route reads the app's store, which main.js opens before the routes serve. */
const NOT_READY = { ERR_APP_NOT_READY: "503: the app's store is not open yet" };

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

const COST_YEAR_ERRORS = {
  ...NOT_READY,
  ERR_BAD_COSTS: "400: `year` is outside the years Cost Input covers",
};

const COSTS_ERRORS = {
  ...NOT_READY,
  ERR_BAD_COSTS:
    "400: `year` is missing or outside the years Cost Input covers, `months` is empty, a month is outside 1 to 12 or appears twice, or a cost is not a non-negative number or null",
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
    answers: "The site.",
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
    answers: "The operations report.",
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
    answers: "The fleet snapshot.",
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
    answers: "The consumption report.",
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
    answers: "The financials report.",
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
    answers: "The year's costs.",
    errors: COST_YEAR_ERRORS,
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
    answers: "The whole year's costs, after the update.",
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

/**
 * The body of every error the Gateway answers for an app route (`errorResponse`
 * in the Gateway's plugin-adapter.js), the same body its own sign-in routes
 * declare.
 */
const ERROR_BODY = {
  type: "object",
  required: ["statusCode", "error", "message"],
  properties: {
    statusCode: { type: "integer", description: "The HTTP status, repeated." },
    error: { type: "string", description: "The HTTP status text, such as `Bad Request`." },
    message: {
      type: "string",
      description:
        "The `ERR_*` code, followed by `: ` and a detail when there is one. For a request that fails the route's schema, the validation message instead.",
    },
  },
};

/** `"<status>: <when>"` as its parts; a malformed entry fails generation. */
export const parseError = (code: string, entry: string): { status: number; when: string } => {
  const match = /^([45]\d\d): (.+)$/s.exec(entry);
  const [, status, when] = match ?? [];
  if (status === undefined || when === undefined)
    throw new Error(`${code}: expected "<status>: <when>", got "${entry}"`);
  return { status: Number(status), when };
};

/**
 * One OpenAPI response per error status, each naming its codes in
 * `x-mdk-errors`: the shape the MDK schema and the Gateway's own routes use.
 */
const errorResponses = (errors: Record<string, string>) => {
  const byStatus = new Map<number, { code: string; description: string }[]>();
  for (const [code, entry] of Object.entries(errors)) {
    const { status, when } = parseError(code, entry);
    const codes = byStatus.get(status) ?? [];
    codes.push({ code, description: when });
    byStatus.set(status, codes);
  }
  const out: Record<string, unknown> = {};
  for (const status of [...byStatus.keys()].sort((a, b) => a - b)) {
    const codes = byStatus.get(status) ?? [];
    out[status] = {
      description: `${codes.map((c) => `\`${c.code}\`: ${c.description}`).join(". ")}.`,
      content: { "application/json": { schema: ERROR_BODY } },
      "x-mdk-errors": codes,
    };
  }
  return out;
};

/**
 * The MDK route-table schema generation this table is written against. With
 * it, MDK's route-table schema holds the table to its OpenAPI-shaped rules as
 * errors, not warnings.
 */
export const ROUTE_TABLE_VERSION = "1";

/** The route table in the mdk-plugin.json format. */
export const toPluginManifest = (meta: { name: string; version: string; description: string }) => ({
  routeTableVersion: ROUTE_TABLE_VERSION,
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
      200: {
        description: route.answers,
        content: { "application/json": { schema: jsonSchema(route.response) } },
      },
      ...(route.errors === undefined ? {} : errorResponses(route.errors)),
    };

    const entry: Record<string, unknown> = {
      id: route.id,
      handler: `./controllers/${route.handler}.js`,
      safety: route.safety,
      description: route.description,
      http,
    };
    if (route.errors !== undefined) entry.errors = Object.keys(route.errors);
    return entry;
  }),
});
