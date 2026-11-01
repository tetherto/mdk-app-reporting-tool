import { describe, expect, it } from "vitest";
import { z } from "zod";

import { callOn, exportOf, isRecord } from "./plugin-module";

// The collector against a stub MDK client: how it reads workers it cannot
// describe yet, how it counts devices, how often a refresh pulls the fleet,
// and how it reads a pool's payouts.

const createCollector = exportOf("plugin/lib/collector.js", "createCollector");
const openStore = exportOf("plugin/lib/store.js", "openStore");
const parseCatalogue = exportOf("plugin/lib/site-config.js", "parseCatalogue");

const DAY = 24 * 60 * 60 * 1000;

const latestSchema = z.array(
  z.object({ unit: z.string(), total: z.number(), hashrate_ths: z.number() }),
);
const payoutSchema = z.array(
  z.object({
    id: z.string(),
    ts: z.number(),
    amount_btc: z.number(),
    pool_fee_btc: z.number().nullable(),
  }),
);

type Unit = {
  id: string;
  name: string;
  workers: string[];
  devices: string[];
  model: string | null;
};

/** A client with one worker of two miners and, optionally, a pool. */
function stubClient(
  options: { capabilityFailures?: number; noCapabilities?: boolean; pool?: unknown } = {},
) {
  const calls = { capabilities: 0, metrics: 0 };
  let failures = options.capabilityFailures ?? 0;
  const client = {
    getStatus: async () => ({
      workers: [
        { workerId: "w1", state: "RUNNING", healthState: "OK", deviceIds: ["d1", "d2"] },
        { workerId: "pool", state: "RUNNING", healthState: "OK", deviceIds: ["ocean"] },
      ],
    }),
    getCapabilities: async () => {
      calls.capabilities += 1;
      if (failures > 0) {
        failures -= 1;
        throw new Error("ERR_TIMEOUT");
      }
      if (options.noCapabilities === true) return {};
      return { capabilities: { telemetry: [{ name: "hashrate_rt", unit: "GH/s" }] } };
    },
    pullTelemetry: async (_device: string, channel: unknown) => {
      if (channel === "metrics") {
        calls.metrics += 1;
        return { metrics: { hashrate_rt: 100_000, power: 3000, status: "mining" } };
      }
      return options.pool ?? {};
    },
  };
  return { client, calls };
}

/** A collector on an in-memory store, with every log line kept. */
function collectorFor(client: unknown, units: Unit[], pool: { device: string } | null = null) {
  const store = openStore();
  const logs: string[] = [];
  const log = (...args: unknown[]) => logs.push(args.map(String).join(" "));
  const collector = createCollector({
    client,
    store,
    logger: { debug: log, info: log, warn: log, error: log },
    config: {
      miningUnits: units,
      meters: [],
      pool,
      market: null,
      catalogue: parseCatalogue({ models: [] }),
      sampleIntervalSec: 60,
      historyDays: 30,
    },
  });
  return { store, collector, logs };
}

const unit = (id: string, workers: string[], devices: string[] = []): Unit => ({
  id,
  name: id,
  workers,
  devices,
  model: null,
});

const latest = (store: unknown) => latestSchema.parse(callOn(store, "latestMinerSamples"));

describe("collector", () => {
  it("asks again for capabilities it could not get, instead of keeping the defaults", async () => {
    // Both miners ask during the first sample, and both fail.
    const { client, calls } = stubClient({ capabilityFailures: 2 });
    const { store, collector } = collectorFor(client, [unit("mu-1", ["w1"])]);

    await callOn(collector, "sampleNow");
    // Without the contract, GH/s were read as TH/s: 100 000 TH/s per miner.
    expect(latest(store)[0]?.hashrate_ths).toBe(200_000);

    await callOn(collector, "sampleNow");
    expect(latest(store)[0]?.hashrate_ths).toBe(200);
    const asked = calls.capabilities;
    await callOn(collector, "sampleNow");
    expect(calls.capabilities).toBe(asked);
  });

  it("keeps the defaults for a worker that answers with no capabilities, without asking again", async () => {
    const { client, calls } = stubClient({ noCapabilities: true });
    const { store, collector } = collectorFor(client, [unit("mu-1", ["w1"])]);

    await callOn(collector, "sampleNow");
    expect(latest(store)[0]?.hashrate_ths).toBe(200_000);
    const asked = calls.capabilities;
    await callOn(collector, "sampleNow");
    await callOn(collector, "sampleNow");
    expect(calls.capabilities).toBe(asked);
  });

  it("counts a device two mining units claim in the first one only, and says so once", async () => {
    const { client } = stubClient();
    const { store, collector, logs } = collectorFor(client, [
      unit("mu-1", ["w1"]),
      unit("mu-2", [], ["d1"]),
    ]);

    await callOn(collector, "sampleNow");
    await callOn(collector, "sampleNow");
    expect(latest(store).reduce((n, r) => n + r.total, 0)).toBe(2);
    expect(logs.filter((l) => l.includes("d1")).length).toBe(1);
  });

  it("answers a refresh right after a sample with that sample", async () => {
    const { client, calls } = stubClient();
    const { collector } = collectorFor(client, [unit("mu-1", ["w1"])]);

    await callOn(collector, "sampleNow");
    const pulled = calls.metrics;
    await callOn(collector, "refresh");
    expect(calls.metrics).toBe(pulled);

    const state = isRecord(collector) ? collector.state : undefined;
    if (!isRecord(state)) throw new Error("no state");
    state.lastSampleAt = Date.now() - 60_000;
    await callOn(collector, "refresh");
    expect(calls.metrics).toBeGreaterThan(pulled);
  });

  it("reads the pool's transactions as payouts, skipping malformed rows", async () => {
    const ts = Math.floor((Date.now() - DAY) / 1000);
    const { client } = stubClient({
      pool: {
        value: [
          {
            ts,
            transactions: [
              {
                block_hash: "b1",
                ts,
                satoshis_net_earned: 1_000_000,
                fees_collected_satoshis: 20_000,
              },
              { block_hash: "b2", ts, satoshis_net_earned: 500_000 },
              { block_hash: "b3", ts: "yesterday", satoshis_net_earned: 1 },
              null,
            ],
          },
        ],
      },
    });
    const { store, collector } = collectorFor(client, [unit("mu-1", ["w1"])], { device: "ocean" });

    await callOn(collector, "sampleNow");
    await callOn(collector, "settled");
    const payouts = payoutSchema.parse(callOn(store, "payouts", 0, Date.now()));
    expect(payouts).toEqual([
      { id: "b1", ts: ts * 1000, amount_btc: 0.01, pool_fee_btc: 0.0002 },
      { id: "b2", ts: ts * 1000, amount_btc: 0.005, pool_fee_btc: null },
    ]);
  });

  it("marks the pool unwired when the Kernel answers an empty body", async () => {
    const { client } = stubClient({ pool: {} });
    const { collector, logs } = collectorFor(client, [unit("mu-1", ["w1"])], { device: "ocean" });

    await callOn(collector, "sampleNow");
    await callOn(collector, "settled");
    const state = isRecord(collector) ? collector.state : undefined;
    const sources = isRecord(state) ? state.sources : undefined;
    expect(isRecord(sources) && sources.pool).toBe(false);
    expect(logs.some((l) => l.includes("ERR_POOL_NO_RESPONSE"))).toBe(true);
  });
});
