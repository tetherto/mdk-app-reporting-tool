import { describe, expect, it } from "vitest";

import { callOn, exportOf, isRecord, pluginModule } from "./plugin-module";
import { collapseNullable, parseError, ROUTE_TABLE, toPluginManifest } from "./route-table";

// The Gateway validates request bodies with Fastify's Ajv, which coerces
// types. A nullable written as anyOf [number, null] has `null` coerced to 0 in
// the number branch, so a cleared Cost Input month was saved as $0. The route
// table writes nullables as a type list, which Ajv leaves alone.

const manifest = toPluginManifest({ name: "reporting", version: "0", description: "" });
/** Each route's `http` block. */
const httpOf = (route: Record<string, unknown>): Record<string, unknown> =>
  isRecord(route.http) ? route.http : {};

/** Every anyOf with a `null` branch under `node`, as JSON paths. */
const nullableAnyOfs = (node: unknown, path = "$"): string[] => {
  if (Array.isArray(node)) return node.flatMap((v, i) => nullableAnyOfs(v, `${path}[${i}]`));
  if (typeof node !== "object" || node === null) return [];
  const own = Object.entries(node).flatMap(([k, v]) => nullableAnyOfs(v, `${path}.${k}`));
  const anyOf = "anyOf" in node ? node.anyOf : undefined;
  const hasNull =
    Array.isArray(anyOf) &&
    anyOf.some((s) => typeof s === "object" && s !== null && "type" in s && s.type === "null");
  return hasNull ? [path, ...own] : own;
};

describe("route table nullables", () => {
  it("writes no anyOf with a null branch in a request body", () => {
    const bodies = manifest.routes.map((r) => httpOf(r).requestBody);
    expect(nullableAnyOfs(bodies)).toEqual([]);
  });

  it("writes a cost as a number or null, with its limits", () => {
    const put = manifest.routes.map(httpOf).find((http) => http.method === "PUT");
    const cost = { type: ["number", "null"], minimum: 0 };
    expect(put?.requestBody).toMatchObject({
      content: {
        "application/json": {
          schema: {
            properties: {
              months: { items: { properties: { energyUsd: cost, operationsUsd: cost } } },
            },
          },
        },
      },
    });
  });

  it("collapses anyOf [T, null] in either order, and keeps other anyOfs", () => {
    expect(
      collapseNullable({ anyOf: [{ type: "number", minimum: 0 }, { type: "null" }], title: "x" }),
    ).toEqual({ type: ["number", "null"], minimum: 0, title: "x" });
    expect(collapseNullable({ anyOf: [{ type: "null" }, { type: "string" }] })).toEqual({
      type: ["string", "null"],
    });
    const union = { anyOf: [{ type: "number" }, { type: "string" }] };
    expect(collapseNullable(union)).toEqual(union);
    expect(collapseNullable({ items: { anyOf: [{ type: "boolean" }, { type: "null" }] } })).toEqual(
      { items: { type: ["boolean", "null"] } },
    );
  });
});

// Each declared error code, raised the way the plugin raises it. The route table
// declares the status a code arrives with; this checks the plugin sends that one.
const RAISE: Record<string, () => unknown> = {
  ERR_APP_NOT_READY: () => callOn(pluginModule("plugin/lib/context.js"), "get"),
  ERR_BAD_RANGE: () => exportOf("plugin/lib/range.js", "parseRange")({ start: 2, end: 1 }),
  ERR_BAD_COSTS: () => exportOf("plugin/lib/costs.js", "setCosts")({}, {}),
};

/** What `raise` throws, as the Gateway reads it: the code and `err.statusCode`. */
const thrown = (raise: () => unknown): { code: string; status: unknown } => {
  try {
    raise();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      code: message.split(":")[0] ?? "",
      status: isRecord(err) ? err.statusCode : undefined,
    };
  }
  throw new Error("expected a throw");
};

describe("route table errors", () => {
  const declared = ROUTE_TABLE.flatMap((route) =>
    Object.entries(route.errors ?? {}).map(([code, entry]) => {
      const { status, when } = parseError(code, entry);
      return { route: route.id, code, status, when };
    }),
  );

  it("can raise every declared code", () => {
    expect([...new Set(declared.map((d) => d.code))].filter((c) => !(c in RAISE))).toEqual([]);
  });

  it.each(declared)("$route: $code arrives as $status", ({ code, status }) => {
    const raise = RAISE[code];
    if (raise === undefined) throw new Error(`no way to raise ${code}`);
    expect(thrown(raise)).toEqual({ code, status });
  });

  it("writes each status as a response naming its codes, and errors as the codes", () => {
    for (const route of manifest.routes) {
      const def = ROUTE_TABLE.find((r) => r.id === route.id);
      const responses = httpOf(route).responses;
      expect(route.errors).toEqual(Object.keys(def?.errors ?? {}));
      for (const d of declared.filter((x) => x.route === route.id)) {
        expect(responses).toMatchObject({
          [d.status]: {
            "x-mdk-errors": expect.arrayContaining([{ code: d.code, description: d.when }]),
          },
        });
      }
    }
  });
});
