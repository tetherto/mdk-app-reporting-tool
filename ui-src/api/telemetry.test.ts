import { describe, expect, it } from "vitest";

import { exportOf, isFunction } from "./plugin-module";

// Vendor differences are read in one place: channel names and units from the
// worker's contract, status and power-mode words normalised.

const minerReader = exportOf("plugin/lib/telemetry.js", "minerReader");
const meterReader = exportOf("plugin/lib/telemetry.js", "meterReader");
const normaliseStatus = exportOf("plugin/lib/telemetry.js", "normaliseStatus");
const normalisePowerMode = exportOf("plugin/lib/telemetry.js", "normalisePowerMode");

const capabilities = (...telemetry: { name: string; unit?: string }[]) => ({ telemetry });

/** A reader built from `caps`, applied to `metrics`. */
const read = (factory: typeof minerReader, caps: unknown, metrics: Record<string, unknown>) => {
  const reader = factory(caps);
  if (!isFunction(reader)) throw new Error("not a reader");
  return reader(metrics);
};

describe("minerReader", () => {
  it("reads the first declared channel and scales it by its unit", () => {
    const caps = capabilities(
      { name: "hashrate_avg", unit: "GH/s" },
      { name: "hashrate_rt", unit: "PH/s" },
      { name: "power_w", unit: "kW" },
    );
    expect(
      read(minerReader, caps, {
        hashrate_rt: 0.2,
        hashrate_avg: 1,
        power_w: 3.5,
        status: "Mining",
      }),
    ).toEqual({ hashrateThs: 200, powerW: 3500, status: "online", powerMode: null, model: null });
  });

  it("falls back to hashrate_rt in TH/s and power in W without capabilities", () => {
    expect(read(minerReader, null, { hashrate_rt: 190, power: 3400, power_mode: "eco" })).toEqual({
      hashrateThs: 190,
      powerW: 3400,
      status: null,
      powerMode: "low",
      model: null,
    });
  });

  it("reads a missing or non-numeric figure as 0", () => {
    expect(read(minerReader, null, { hashrate_rt: "fast", model: "S21" })).toMatchObject({
      hashrateThs: 0,
      powerW: 0,
      model: "S21",
    });
  });
});

describe("meterReader", () => {
  it("scales active power to W, and reads no number as no reading", () => {
    const caps = capabilities({ name: "active_power", unit: "MW" });
    expect(read(meterReader, caps, { active_power: 1.25 })).toBe(1_250_000);
    expect(read(meterReader, caps, { active_power: null })).toBeNull();
  });
});

describe("status words", () => {
  it.each([
    ["mining", "online"],
    ["RUNNING", "online"],
    ["sleeping", "sleep"],
    ["suspended", "sleep"],
    ["not_mining", "error"],
    ["fault", "error"],
    ["maintenance", "maintenance"],
    ["offline", "offline"],
    ["", null],
    [undefined, null],
  ])("reads %s as %s", (raw, status) => {
    expect(normaliseStatus(raw)).toBe(status);
  });

  it.each([
    ["eco", "low"],
    ["LOW", "low"],
    ["normal", "normal"],
    ["high", "high"],
    ["sleep", "sleep"],
    ["turbo", null],
  ])("reads power mode %s as %s", (raw, mode) => {
    expect(normalisePowerMode(raw)).toBe(mode);
  });
});

const minerFromSnap = exportOf("plugin/lib/telemetry.js", "minerFromSnap");
const meterFromSnap = exportOf("plugin/lib/telemetry.js", "meterFromSnap");

const thing = (snap: unknown, info: Record<string, unknown> = {}) => ({
  id: "d1",
  info,
  last: { ts: 1, snap },
});

describe("minerFromSnap", () => {
  it("reads the 5-minute hashrate, power, status, mode and model of a cached snap", () => {
    const snap = {
      stats: {
        status: "mining",
        power_w: 7_200,
        hashrate_mhs: { avg: 300_000_000, t_5m: 291_883_558.52 },
      },
      config: { power_mode: "eco" },
    };
    expect(minerFromSnap(thing(snap, { model: "M63S++" }))).toEqual({
      hashrateThs: 291.88355852,
      powerW: 7_200,
      status: "online",
      powerMode: "low",
      model: "M63S++",
    });
  });

  it("falls back to the average hashrate without a 5-minute one", () => {
    const snap = { stats: { status: "error", hashrate_mhs: { avg: 1_000_000 } } };
    expect(minerFromSnap(thing(snap))).toMatchObject({
      hashrateThs: 1,
      powerW: 0,
      status: "error",
    });
  });

  it("has no reading for a failed collection or a device never collected", () => {
    expect(minerFromSnap(thing({ success: false, stats: { status: "offline" } }))).toBeNull();
    expect(minerFromSnap({ id: "d1", last: {} })).toBeNull();
    expect(minerFromSnap({ id: "d1" })).toBeNull();
  });
});

describe("meterFromSnap", () => {
  it("reads power_w in W, and nothing from a meter without a reading", () => {
    expect(meterFromSnap(thing({ stats: { status: "running", power_w: 8_400_000 } }))).toBe(
      8_400_000,
    );
    expect(meterFromSnap(thing({ stats: { status: "running" } }))).toBeNull();
    expect(meterFromSnap(thing({ success: false, stats: { status: "offline" } }))).toBeNull();
  });
});
