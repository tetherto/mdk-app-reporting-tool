import { describe, expect, it } from "vitest";

import { costsUpdateSchema } from "../../api/contract";
import {
  changesOf,
  isEdited,
  parseAmount,
  tidyAmount,
  toDraft,
  yearsFor,
} from "./cost-input-shape";
import { toCostSummary } from "./cost-summary-shape";
import { toEnergyBalance } from "./energy-balance-shape";
import { missingOf, withCostsMissing } from "./financials-shape";
import { toHashBalance } from "./hash-balance-shape";
import { figures, report, sources } from "./report-fixture";
import { revenueChart, toRevenueSummary } from "./revenue-summary-shape";
import { feeRateChart, subsidyFeeChart } from "./subsidy-fee-shape";

describe("missingOf", () => {
  it("names the first source the site lacks, in wiring order", () => {
    expect(missingOf(["pool", "market"], sources({ pool: false, market: false }))).toBe("pool");
    expect(missingOf(["pool", "market"], sources({ market: false }))).toBe("market");
    expect(missingOf(["pool", "market"], sources())).toBeNull();
  });

  it("marks the split missing only when there are payouts to split", () => {
    expect(missingOf(["split"], sources(), report({ split: null }))).toBe("split");
    expect(
      missingOf(["split"], sources(), report({ split: null, summary: figures({ payouts: 0 }) })),
    ).toBeNull();
  });

  it("marks the pool's split missing unless the pool reports it, estimate or not", () => {
    expect(missingOf(["poolSplit"], sources(), report({ split: "network" }))).toBe("poolSplit");
    expect(missingOf(["poolSplit"], sources(), report({ split: null }))).toBe("poolSplit");
    expect(missingOf(["poolSplit"], sources(), report({ split: "pool" }))).toBeNull();
    expect(
      missingOf(
        ["poolSplit"],
        sources(),
        report({ split: "network", summary: figures({ payouts: 0 }) }),
      ),
    ).toBeNull();
    // An unwired pool says so first.
    expect(
      missingOf(["pool", "poolSplit"], sources({ pool: false }), report({ split: null })),
    ).toBe("pool");
  });

  it("marks costs missing when a month of the period has none", () => {
    expect(missingOf(["costs"], sources({ costs: false }))).toBe("costs");
    const partial = report({ summary: figures({ allInCostUsd: null }) });
    expect(missingOf(["costs"], sources(), partial)).toBe("costs");
    expect(withCostsMissing(toCostSummary(partial).tiles, "costs")[0]?.missing).toBe("costs");
  });
});

describe("Revenue Summary", () => {
  it("totals the payouts, values them at receipt and report price, and splits them", () => {
    const summary = toRevenueSummary(report(), sources(), "sats");
    expect(summary.totals.map((t) => t.value)).toEqual(["90,000,000 sats", "$90,000", "$99,000"]);
    expect(summary.totals[1]?.subtitle).toBe("Effective $100,000/BTC");
    expect(summary.split).toMatchObject({ unit: "sats" });
    expect(summary.split?.slices.map((s) => s.value)).toEqual([0.49, 0.01]);
    expect(summary.metrics[0]).toMatchObject({
      value: "206.78 $/MWh",
      subtitle: "Gross 210.92 $/MWh",
    });
  });

  it("says when gross is unknown and marks USD figures not wired without market data", () => {
    const summary = toRevenueSummary(
      report({ summary: figures({ grossRevenueUsdPerMWh: null }) }),
      sources({ market: false }),
      "BTC",
    );
    expect(summary.metrics[0]?.subtitle).toBe("Gross: pool fee not reported");
    expect(summary.totals[1]?.missing).toBe("market");
    expect(summary.totals[0]?.missing).toBeUndefined();
  });

  it("charts revenue at the report price", () => {
    const chart = revenueChart(report(), "report", "Demo Site");
    expect(chart.series[0]?.values).toEqual([55_000, 44_000]);
    expect(chart.unit).toBe("USD");
  });
});

describe("Subsidy / Fee", () => {
  it("stacks subsidy and fees in BTC with the fee share on the right axis", () => {
    const chart = subsidyFeeChart(report());
    expect(chart.series.map((s) => [s.label, s.stack, s.axis])).toEqual([
      ["Subsidy", "split", undefined],
      ["Fees", "split", undefined],
      ["Fee %", undefined, "right"],
    ]);
    expect(chart.rightUnit).toBe("%");
    expect(subsidyFeeChart(report(), "sats").unit).toBe("sats");
  });

  it("charts the network's fee rate in sats/vB", () => {
    const chart = feeRateChart(report());
    expect(chart.unit).toBe("sats/vB");
    expect(chart.series[0]?.values.every((v) => v === 6)).toBe(true);
  });
});

describe("Hash Balance", () => {
  it("puts hash revenue, cost and network hashprice in one unit", () => {
    const usd = toHashBalance(report(), "USD", true);
    expect(usd.costRevenueNetwork.unit).toBe("$/PH/s/day");
    expect(usd.costTiles.map((t) => t.value)).toEqual([
      "16.49 $/PH/s/day",
      "59.74 $/PH/s/day",
      "48 $/PH/s/day",
    ]);
    const btc = toHashBalance(report(), "BTC", true);
    expect(btc.siteRevenue.series[0]?.values[0]).toBeCloseTo(0.00059737, 8);
    expect(btc.siteRevenue.unit).toBe("BTC/PH/s/day");
  });

  it("leaves the hash cost series out without costs", () => {
    const labels = toHashBalance(report(), "USD", false).costRevenueNetwork.series.map(
      (s) => s.label,
    );
    expect(labels).toEqual(["Hash Revenue", "Network Hashprice"]);
  });
});

describe("Energy Balance", () => {
  it("prices all-in cost per MWh in BTC at the bucket's price", () => {
    const balance = toEnergyBalance(report(), "BTC", true);
    const cost = balance.revenueVsCost.series.find((s) => s.label === "All-In Cost");
    expect(cost?.values[0]).toBeCloseTo(57.07 / 100_000, 10);
    expect(balance.power.unit).toBe("MW");
    expect(balance.costTiles.filter((t) => t.needs === "costs")).toHaveLength(3);
  });
});

describe("Cost Input", () => {
  const saved = {
    year: 2026,
    months: Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      energyUsd: i === 0 ? 1000 : null,
      operationsUsd: null,
      updatedAt: null,
    })),
  };

  it("parses amounts: blank is null, commas are fine, negatives are invalid", () => {
    expect(parseAmount("")).toBeNull();
    expect(parseAmount("12,500.5")).toBe(12_500.5);
    expect(parseAmount("-1")).toBeUndefined();
    expect(parseAmount("abc")).toBeUndefined();
  });

  it("shows amounts with separators and two decimals, and tidies typed ones", () => {
    expect(toDraft(saved)[0]?.energyUsd).toBe("1,000.00");
    expect(tidyAmount("92627.5")).toBe("92,627.50");
    expect(tidyAmount("abc")).toBe("abc");
  });

  it("is edited only when an input differs from what is saved", () => {
    const draft = toDraft(saved);
    expect(isEdited(saved, draft)).toBe(false);
    draft[0] = { month: 1, energyUsd: "1000", operationsUsd: "" };
    expect(isEdited(saved, draft)).toBe(false);
    draft[0] = { month: 1, energyUsd: "1001", operationsUsd: "" };
    expect(isEdited(saved, draft)).toBe(true);
    draft[0] = { month: 1, energyUsd: "1000", operationsUsd: "x" };
    expect(isEdited(saved, draft)).toBe(true);
  });

  it("sends only the months that changed, as a valid PUT body", () => {
    const draft = toDraft(saved);
    expect(changesOf(2026, saved, draft)).toBeNull();
    draft[1] = { month: 2, energyUsd: "2000", operationsUsd: "500" };
    const update = changesOf(2026, saved, draft);
    expect(update).toEqual({
      year: 2026,
      months: [{ month: 2, energyUsd: 2000, operationsUsd: 500 }],
    });
    expect(costsUpdateSchema.safeParse(update).success).toBe(true);
    draft[2] = { month: 3, energyUsd: "-5", operationsUsd: "" };
    expect(changesOf(2026, saved, draft)).toBeNull();
  });

  it("offers the years from the first with history to next year, newest first", () => {
    const now = Date.UTC(2026, 9, 23);
    expect(yearsFor(Date.UTC(2024, 5, 1), "UTC", now)).toEqual([2027, 2026, 2025, 2024]);
    expect(yearsFor(null, "UTC", now)).toEqual([2027, 2026]);
    // New Year's Eve in UTC is already the next year in Tokyo.
    expect(yearsFor(null, "Asia/Tokyo", Date.UTC(2025, 11, 31, 20))).toEqual([2027, 2026]);
  });
});
