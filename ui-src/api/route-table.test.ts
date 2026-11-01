import { describe, expect, it } from "vitest";

import { isRecord } from "./plugin-module";
import { collapseNullable, toPluginManifest } from "./route-table";

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
