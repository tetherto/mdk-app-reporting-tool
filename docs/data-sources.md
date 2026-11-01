# Data sources

What the app reads from MDK, and what a worker has to expose to feed it. The collector (`plugin/lib/collector.js`) only reads: it never sends a command.

## Discovery

On every sample, the collector calls the Kernel's `getStatus()` and maps each device to its worker. It skips workers that are `TERMINATED` or `DEAD`, as MDK's mvp-site does.

The site config (`siteConfig` in the app's config) says which devices belong where:

```json
{
  "site": { "name": "Demo Site", "timezone": "UTC" },
  "miningUnits": [
    { "id": "mu-1", "name": "Mining Unit 1", "workers": ["mu-1"], "model": "bitmain-antminer-s23" }
  ],
  "meters": [
    { "device": "pm-01", "label": "PM-01" },
    { "device": "pm-site", "label": "Site meter", "siteMeter": true }
  ],
  "pool": { "device": "ocean" },
  "market": { "device": "mempool" }
}
```

A mining unit lists worker names, device ids, or both. `model` is the catalogue id used for miners that don't report a model. Every source is optional: a page hides or marks as unavailable whatever needs a source that isn't wired (`sources` in `GET /api/reporting/site`).

## Miners

Pulled with `pullTelemetry(deviceId, 'metrics')` every `sampleIntervalSec`, and rolled up per mining unit and model.

| Figure     | Channels read (first one the contract declares) | Units                                                                                       |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Hashrate   | `hashrate_rt`, `hashrate_avg`, `hashrate`       | Scaled from the contract's `unit` (H/s … PH/s) to TH/s                                      |
| Power      | `power`, `power_w`, `active_power`              | Scaled from `unit` (W, kW, MW) to W                                                         |
| Status     | `status`                                        | `mining`, `sleeping`, `error`, `not_mining`, `offline`, `maintenance` and similar spellings |
| Power mode | `power_mode`                                    | `low` / `eco`, `normal`, `high`, `sleep`                                                    |
| Model      | `model` (optional)                              | A catalogue id or alias, else the unit's `model`                                            |

A miner that doesn't answer counts as offline. The public `antminer-mdk-worker` and `whatsminer-mdk-worker` packages satisfy this as they are, and so does any contract-first miner worker that follows MDK's standard telemetry fields.

## Power meters

Same pull, one reading per meter per sample: `active_power`, `power` or `power_w`, scaled to W. MDK's SATEC, ABB and Schneider workers expose `active_power` in W.

## Pool

Earnings per block, from the pool worker's `transactions` channel (the public Ocean worker declares it), as daily rows of the pool's earnings log:

```js
pullTelemetry(poolDeviceId, { type: "transactions", start, end });
// → { value: [{ ts, transactions: [{ block_hash, ts, satoshis_net_earned, fees_collected_satoshis, ... }] }] }
```

Each row becomes a payout `{ id: block_hash, ts, amountBtc: satoshis_net_earned / 1e8, poolFeeBtc: fees_collected_satoshis / 1e8 }`. The pool fee is optional: without it, gross figures are unavailable. The Ocean worker keeps this log in memory, one day at a time (it fetches the previous day's earnings), from when it starts. A real site's history begins then. The app reads it in one function, `pullPoolPayouts`.

Pools report net earnings without splitting block subsidy from transaction fees, so `sources.poolSplit` is false. The financials report then splits each payout by the network's fee share on its day (the market worker's `fee_share`) and says so with `split: "network"`. A pool that reports its own split per payout takes precedence.

## Market

MDK has no market-data worker, so this repo ships one: `workers/mempool`, a contract-first worker on the public mempool.space API.

| Channel            | Query            | Returns                                                              |
| ------------------ | ---------------- | -------------------------------------------------------------------- |
| `price`            | none             | `{ ts, usd }`                                                        |
| `price_history`    | `{ start, end }` | `[{ ts, usd }]`                                                      |
| `network_hashrate` | `{ start, end }` | `[{ ts, hashrateHs }]`, daily                                        |
| `hashprice`        | `{ start, end }` | `[{ ts, btcPerPhsDay, usdPerPhsDay }]`, daily                        |
| `fee_share`        | `{ start, end }` | `[{ ts, feeShare }]`, daily: fees over block rewards                 |
| `fee_rate`         | `{ start, end }` | `[{ ts, feeRateSatsVb }]`, daily: mean of the median block fee rates |

BTC figures are computed from the pool and the network, and only USD figures follow the live price.

## Storage

The app keeps its own SQLite store under the runtime's data dir (`plugin/lib/store.js`): miner and meter samples, payouts, prices, network figures and the Cost Input months. Reports aggregate it into site-timezone hours, days, ISO weeks and months.

As samples are written, the store also keeps their totals (`plugin/lib/totals.js`): per quarter hour on a UTC grid, and per day of the site's timezone, each figure times the seconds it covers. A report reads whole days from the daily totals, the rest of its range from the quarter hours, and only its unaligned ends from the raw samples, so a year's report reads a few thousand rows whatever the sample interval. The totals are rebuilt from the raw samples when a store from an older version opens, or when the site's timezone changes.

MDK workers don't keep long, cross-device history. The worker runtime's store-backed history built-ins are deprecated with no replacement yet, and `docs/concepts/the-storage-model.md` in MDK leaves cross-device time ranges to the caller.
