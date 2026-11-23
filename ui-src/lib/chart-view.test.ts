import { describe, expect, it } from "vitest";

import type { ChartSeries } from "./chart-view";
import { fitsValueLabels, MAX_LABELLED_BARS, valueLabel } from "./chart-view";

const bar = (stack?: string): ChartSeries => ({ label: "s", values: [], color: "#000", stack });
const line: ChartSeries = { label: "l", values: [], color: "#000", type: "line" };
const buckets = (n: number): string[] => Array.from({ length: n }, (_, i) => String(i));

describe("fitsValueLabels", () => {
  it("labels a year of monthly bars, not a month of daily ones", () => {
    // Last 12 months: the 13 months a rolling year touches.
    expect(fitsValueLabels({ labels: buckets(13), series: [bar()] }, false)).toBe(true);
    expect(fitsValueLabels({ labels: buckets(30), series: [bar()] }, false)).toBe(false);
  });

  it("counts bars side by side, but a stack once and lines not at all", () => {
    expect(fitsValueLabels({ labels: buckets(8), series: [bar(), bar()] }, false)).toBe(false);
    expect(fitsValueLabels({ labels: buckets(8), series: [bar("a"), bar("a"), line] }, true)).toBe(
      true,
    );
    expect(fitsValueLabels({ labels: buckets(MAX_LABELLED_BARS), series: [line] }, false)).toBe(
      true,
    );
  });
});

describe("valueLabel", () => {
  it("prints a value", () => {
    expect(valueLabel("1,234")).toBe("1,234");
    expect(valueLabel("0.05")).toBe("0.05");
  });

  it("prints nothing for a zero, or a value that rounds to one", () => {
    expect(valueLabel("0")).toBe("");
    expect(valueLabel("0.00")).toBe("");
    expect(valueLabel("-0")).toBe("");
  });
});
