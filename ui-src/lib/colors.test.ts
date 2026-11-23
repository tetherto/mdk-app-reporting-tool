import { describe, expect, it } from "vitest";

import { COLORS, PALETTE, seriesColor } from "./colors";

describe("chart colours", () => {
  it("takes every named colour from the one palette", () => {
    const palette: readonly string[] = PALETTE;
    const outside = Object.entries(COLORS).filter(([, color]) => !palette.includes(color));
    expect(outside).toEqual([]);
  });

  it("goes round the palette for a breakdown's series", () => {
    expect(seriesColor(0)).toBe(PALETTE[0]);
    expect(seriesColor(PALETTE.length + 1)).toBe(PALETTE[1]);
  });
});
