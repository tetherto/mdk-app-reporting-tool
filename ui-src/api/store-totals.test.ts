import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { callOn, exportOf, isRecord } from "./plugin-module";

// The store sums samples into quarter-hour totals as it writes them, and the
// reports read those. Whatever the segments, the totals must equal the raw
// samples summed over the same time.

const openStore = exportOf("plugin/lib/store.js", "openStore");
const bucketSpans = exportOf("plugin/lib/time.js", "bucketSpans");

const spanSchema = z.array(z.object({ start: z.number(), end: z.number() }));

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;
const FIGURES = [
  "total",
  "low",
  "normal",
  "high",
  "sleep",
  "error",
  "offline",
  "maintenance",
  "hashrate_ths",
  "power_w",
  "mining_power_w",
] as const;

// A row's figures, by column name.
const figures = z.record(z.string(), z.union([z.number(), z.string()]));
const totalRowSchema = z.object({ k: z.number() }).and(figures);
const rawRowSchema = z.object({ interval_s: z.number() }).and(figures);
const coverageSchema = z.array(z.object({ k: z.number(), covered_s: z.number() }));
const meterRowSchema = z.array(
  z.object({ k: z.number(), meter: z.string(), power_w_s: z.number() }),
);

type Segment = { start: number; end: number };

/** A sample of one unit and model, its figures varying with `i`. */
const sample = (ts: number, unit: string, model: string, i: number, intervalS = 60) => ({
  ts,
  unit,
  model,
  intervalS,
  total: 10,
  low: i % 3,
  normal: 8 - (i % 3),
  high: 1,
  sleep: 0,
  error: i % 2,
  offline: 1 - (i % 2),
  maintenance: 0,
  hashrateThs: 1000 + i,
  powerW: 30_000 + 7 * i,
  miningPowerW: 29_000 + 5 * i,
});

/** `figure` times seconds summed per segment, from the totals and from the raw samples. */
function sums(store: unknown, segments: Segment[], figure: (typeof FIGURES)[number]) {
  const totals = new Map<number, number>();
  for (const row of z.array(totalRowSchema).parse(callOn(store, "minerTotals", segments))) {
    totals.set(row.k, (totals.get(row.k) ?? 0) + Number(row[`${figure}_s`]));
  }
  const raw = segments.map(({ start, end }) =>
    z
      .array(rawRowSchema)
      .parse(callOn(store, "minerSamples", start, end))
      .reduce((acc, r) => acc + Number(r[figure]) * r.interval_s, 0),
  );
  return { totals: segments.map((_, k) => totals.get(k) ?? 0), raw };
}

const T0 = Date.UTC(2026, 9, 1);

/** Three hours of 60 s samples for two units and two models, and one coarse seeded sample. */
function seeded(store: unknown) {
  const rows = [];
  for (let i = 0; i < 180; i++)
    for (const unit of ["mu-1", "mu-2"])
      for (const model of ["s21", "m60"]) rows.push(sample(T0 + i * MINUTE, unit, model, i));
  rows.push(sample(T0 - 3 * 60 * MINUTE, "mu-1", "s21", 7, 10_800));
  callOn(store, "writeMinerSamples", rows);
  callOn(
    store,
    "writeMeterSamples",
    Array.from({ length: 180 }, (_, i) => ({
      ts: T0 + i * MINUTE,
      meter: "pm-01",
      intervalS: 60,
      powerW: 100_000 + i,
    })),
  );
}

// Segments with aligned and unaligned ends, inside one quarter and across many.
const SEGMENTS: Segment[] = [
  { start: T0 - 4 * 60 * MINUTE, end: T0 },
  { start: T0, end: T0 + 60 * MINUTE },
  { start: T0 + 61 * MINUTE + 7_000, end: T0 + 133 * MINUTE + 30_000 },
  { start: T0 + 140 * MINUTE, end: T0 + 143 * MINUTE },
  { start: T0 + 150 * MINUTE, end: T0 + 400 * MINUTE },
];

let dir: string | null = null;
afterEach(() => {
  if (dir !== null) rmSync(dir, { recursive: true, force: true });
  dir = null;
});

describe("quarter-hour totals", () => {
  it.each(FIGURES)("sum %s like the raw samples over any segments", (figure) => {
    const store = openStore();
    seeded(store);
    const { totals, raw } = sums(store, SEGMENTS, figure);
    totals.forEach((v, k) => expect(v).toBeCloseTo(raw[k] ?? NaN, 6));
  });

  it("count each sample time once in the covered seconds", () => {
    const store = openStore();
    seeded(store);
    const covered = new Map<number, number>();
    for (const r of coverageSchema.parse(callOn(store, "minerCoverage", SEGMENTS)))
      covered.set(r.k, (covered.get(r.k) ?? 0) + r.covered_s);
    expect(covered.get(0)).toBe(10_800);
    expect(covered.get(1)).toBe(3600);
    // Minutes 62 to 133 start inside the third segment.
    expect(covered.get(2)).toBe(72 * 60);
    expect(covered.get(3)).toBe(3 * 60);
    expect(covered.get(4)).toBe(30 * 60);
  });

  it("sum meter energy like the raw samples", () => {
    const store = openStore();
    seeded(store);
    const rows = meterRowSchema.parse(callOn(store, "meterTotals", SEGMENTS));
    const ws = (k: number) => rows.filter((r) => r.k === k).reduce((a, r) => a + r.power_w_s, 0);
    // Minutes 62 to 133: power 100_000 + i for 60 s each.
    let expected = 0;
    for (let i = 62; i <= 133; i++) expected += (100_000 + i) * 60;
    expect(ws(2)).toBe(expected);
  });

  it("follow a sample written again at the same time", () => {
    const store = openStore();
    seeded(store);
    callOn(store, "writeMinerSamples", [
      { ...sample(T0 + 5 * MINUTE, "mu-1", "s21", 0), hashrateThs: 0 },
    ]);
    const { totals, raw } = sums(store, SEGMENTS, "hashrate_ths");
    totals.forEach((v, k) => expect(v).toBeCloseTo(raw[k] ?? NaN, 6));
  });

  it("are built from the raw samples when a v2 store opens", () => {
    dir = mkdtempSync(join(tmpdir(), "reporting-store-"));
    const old = openStore(dir);
    seeded(old);
    // As a v2 store left it: raw samples, no totals.
    const db = isRecord(old) ? old.db : undefined;
    callOn(
      db,
      "exec",
      ["miner", "meter", "coverage"]
        .flatMap((f) => [`DELETE FROM ${f}_quarters;`, `DELETE FROM ${f}_days;`])
        .concat("DELETE FROM miner_sample_times; DELETE FROM meta WHERE key = 'totalsTimezone';")
        .join(" "),
    );
    callOn(db, "exec", "UPDATE meta SET value = '2' WHERE key = 'schemaVersion'");
    callOn(old, "close");

    const store = openStore(dir);
    const { totals, raw } = sums(store, SEGMENTS, "power_w");
    totals.forEach((v, k) => expect(v).toBeCloseTo(raw[k] ?? NaN, 6));
    expect(callOn(store, "getMeta", "schemaVersion")).toBe("3");
    callOn(store, "close");
  });

  // Ten days of 7-minute samples across New York's DST change (November 1st).
  const DAYS_FROM = Date.UTC(2026, 9, 27, 3, 17);
  const DAYS_TO = Date.UTC(2026, 10, 6, 11);
  const multiDay = (store: unknown) => {
    const rows = [];
    for (let ts = DAYS_FROM, i = 0; ts < DAYS_TO; ts += 7 * MINUTE, i++)
      rows.push(sample(ts, "mu-1", "s21", i, 420));
    callOn(store, "writeMinerSamples", rows);
  };
  /** Day and week buckets of `tz` over the samples, and segments that cut days anywhere. */
  const daySegments = (tz: string): Segment[] => [
    ...spanSchema.parse(bucketSpans(DAYS_FROM - 3 * DAY, DAYS_TO + DAY, "day", tz)),
    ...spanSchema.parse(bucketSpans(DAYS_FROM, DAYS_TO, "week", tz)),
    { start: DAYS_FROM + 5 * MINUTE, end: DAYS_TO - 13 * MINUTE },
    { start: DAYS_FROM + DAY + 11 * MINUTE, end: DAYS_FROM + 4 * DAY },
  ];

  it.each(["UTC", "America/New_York", "Asia/Kathmandu"])(
    "sum like the raw samples over whole days in %s",
    (tz) => {
      const store = openStore(undefined, { timezone: tz });
      multiDay(store);
      for (const figure of ["hashrate_ths", "offline"] as const) {
        const { totals, raw } = sums(store, daySegments(tz), figure);
        totals.forEach((v, k) => expect(v).toBeCloseTo(raw[k] ?? NaN, 4));
      }
    },
  );

  it("are rebuilt for the new days when the site's timezone changes", () => {
    dir = mkdtempSync(join(tmpdir(), "reporting-store-"));
    const utc = openStore(dir, { timezone: "UTC" });
    multiDay(utc);
    callOn(utc, "close");

    const store = openStore(dir, { timezone: "Asia/Kathmandu" });
    const { totals, raw } = sums(store, daySegments("Asia/Kathmandu"), "power_w");
    totals.forEach((v, k) => expect(v).toBeCloseTo(raw[k] ?? NaN, 4));
    callOn(store, "close");
  });
});
