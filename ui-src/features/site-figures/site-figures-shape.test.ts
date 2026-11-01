import { describe, expect, it } from "vitest";

import { report } from "../operations/report-fixture";
import { toSiteFigures } from "./site-figures-shape";

describe("toSiteFigures", () => {
  it("scales the period averages", () => {
    expect(toSiteFigures(report())).toEqual({
      hashrate: "1.75 PH/s",
      power: "24 kW",
      efficiency: "13.71 W/TH/s",
    });
  });

  it("shows a dash for a period with no samples", () => {
    expect(toSiteFigures(report(0))).toEqual({ hashrate: "–", power: "–", efficiency: "–" });
  });
});
