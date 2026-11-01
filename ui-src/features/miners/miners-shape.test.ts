import { describe, expect, it } from "vitest";

import type { MinersSnapshot } from "../../api/contract";
import { isMinersTab, toMinerSlices } from "./miners-shape";

const counts = {
  total: 0,
  offline: 0,
  error: 0,
  sleep: 0,
  low: 0,
  normal: 0,
  high: 0,
  maintenance: 0,
  powerW: 0,
};
const model = { vendor: null, nominalHashrateThs: null, nominalPowerW: null };

const snapshot: MinersSnapshot = {
  ts: 1_792_000_000_000,
  intervalS: 60,
  models: [
    { ...model, ...counts, id: "s23", displayName: "Antminer S23", total: 50, offline: 2 },
    { ...model, ...counts, id: "m70s", displayName: "WhatsMiner M70S", total: 30, offline: 0 },
  ],
  units: [],
  site: { ...counts, total: 80, offline: 2 },
};

describe("toMinerSlices", () => {
  it("slices the chosen count per miner type, with the total", () => {
    const slices = toMinerSlices(snapshot, "offline");

    expect(slices.slices.map((s) => [s.label, s.value])).toEqual([
      ["Antminer S23", 2],
      ["WhatsMiner M70S", 0],
    ]);
    expect(slices.total).toBe(2);
    expect(slices.ts).toBe(snapshot.ts);
  });

  it("is empty before the first snapshot", () => {
    const slices = toMinerSlices({ ts: null, models: [], units: [], site: null }, "total");
    expect(slices).toEqual({ slices: [], total: 0, empty: true, ts: null });
  });
});

describe("isMinersTab", () => {
  it("accepts the tabs only", () => {
    expect(isMinersTab("offline")).toBe(true);
    expect(isMinersTab("sleep")).toBe(false);
  });
});
