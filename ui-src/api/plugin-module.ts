// Loads the plugin's untyped JS from the tests. Its functions return unknown:
// what they return is parsed with a contract schema or checked by a test.
import { createRequire } from "node:module";
import { join } from "node:path";

const require = createRequire(import.meta.url);
/** The repository root, where the plugin and the dev stack live. */
export const repoRoot = join(import.meta.dirname, "..", "..");

export type PluginFn = (...args: unknown[]) => unknown;

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
export const isFunction = (value: unknown): value is PluginFn => typeof value === "function";

/** A plugin module (path from the repo root). */
export const pluginModule = (path: string): unknown => require(join(repoRoot, path));

/** Calls the method `name` of a plugin object (a store, a collector). */
export function callOn(target: unknown, name: string, ...args: unknown[]): unknown {
  const fn = isRecord(target) ? target[name] : undefined;
  if (!isFunction(fn)) throw new Error(`no method ${name}`);
  return fn.apply(target, args);
}

/** A plugin module's named export, or its default export (a controller) without a name. */
export function exportOf(path: string, name?: string): PluginFn {
  const mod = pluginModule(path);
  const fn = name === undefined ? mod : isRecord(mod) ? mod[name] : undefined;
  if (!isFunction(fn)) throw new Error(`${path} does not export ${name ?? "a controller"}`);
  return fn;
}
