// A two-bucket operations report for the shape tests: two miner types in two
// mining units, hourly in UTC.
import type { OperationsFigures, OperationsReport } from "../../api/contract";

export const T0 = Date.UTC(2026, 9, 21, 0);
const HOUR = 3_600_000;

const figures = (hashrateThs: number, powerW: number): OperationsFigures => ({
  coveredSec: 3600,
  hashrateThs: {
    site: hashrateThs,
    byUnit: { "mu-1": hashrateThs / 2, "mu-2": hashrateThs / 2 },
    byModel: { s23: hashrateThs },
  },
  powerW: {
    site: powerW,
    byUnit: { "mu-1": powerW / 2, "mu-2": powerW / 2 },
    byModel: { s23: powerW },
  },
  energyMWh: powerW / 1e6,
  efficiencyWThs: {
    site: powerW / hashrateThs,
    byUnit: {},
    byModel: { s23: powerW / hashrateThs },
  },
  nominal: {
    hashrateThs: 2000,
    powerW: 30_000,
    efficiencyWThs: 15,
    byUnit: {},
    byModel: { s23: { hashrateThs: 2000, powerW: 30_000, efficiencyWThs: 15 } },
  },
  miners: 10,
  status: { online: 8, error: 1, offline: 1, sleep: 0, maintenance: 0 },
});

export const report = (buckets = 2): OperationsReport => ({
  range: { start: T0, end: T0 + buckets * HOUR, granularity: "hour", timezone: "UTC" },
  units: [
    { id: "mu-1", name: "Mining Unit 1" },
    { id: "mu-2", name: "Mining Unit 2" },
  ],
  models: [
    {
      id: "s23",
      displayName: "Antminer S23",
      vendor: "Bitmain",
      nominalHashrateThs: 200,
      nominalPowerW: 3000,
    },
  ],
  buckets: Array.from({ length: buckets }, (_, i) => ({
    ts: T0 + i * HOUR,
    ...figures(1500 + i * 500, 24_000),
  })),
  summary: buckets === 0 ? null : figures(1750, 24_000),
});
