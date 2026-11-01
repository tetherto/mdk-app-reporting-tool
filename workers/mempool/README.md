# mempool market-data worker

An MDK worker for Bitcoin market data from the public [mempool.space](https://mempool.space) API. MDK has no market-data worker, so Reporting Tool Lite ships this one. It isn't tied to the app: any MDK stack can run it, and any app with Kernel read access can read its channels.

It reads only from mempool.space, needs no credentials, and has no commands.

## Channels

Declared in [mdk-contract.json](mdk-contract.json), one handler per channel in [src/telemetry/](src/telemetry/). History channels take `start` and `end` in ms and default to the last 30 days.

| Channel            | Returns                                       | History                                |
| ------------------ | --------------------------------------------- | -------------------------------------- |
| `price`            | `{ ts, usd }`: the BTC price now              | none                                   |
| `price_history`    | `[{ ts, usd }]`                               | hourly for recent months, then coarser |
| `network_hashrate` | `[{ ts, hashrateHs }]`, daily, in H/s         | up to three years                      |
| `hashprice`        | `[{ ts, btcPerPhsDay, usdPerPhsDay }]`, daily | up to two years                        |
| `fee_share`        | `[{ ts, feeShare }]`, daily, from 0 to 1      | up to two years                        |
| `fee_rate`         | `[{ ts, feeRateSatsVb }]`, daily, in sats/vB  | up to two years                        |

Errors: `ERR_MEMPOOL_UNREACHABLE` when the API doesn't answer, `ERR_MEMPOOL_BAD_RESPONSE` when it answers with an unexpected body. Responses are cached, and the last good answer is served while the API is briefly unreachable.

## Run it

Copy this folder into your project and add it to your stack's `mdk.yaml`, as [dev/mdk.yaml](../../dev/mdk.yaml) does:

```yaml
spec:
  workers:
    - name: market
      package: ./workers/mempool
      config:
        devices:
          - { id: mempool, opts: { baseUrl: "https://mempool.space" } }
```

| Option      | Default                 | Meaning                                            |
| ----------- | ----------------------- | -------------------------------------------------- |
| `baseUrl`   | `https://mempool.space` | The API to read; point it at a self-hosted mempool |
| `timeoutMs` | `15000`                 | Per-request timeout                                |

The worker needs internet access, or a reachable `baseUrl`. Node 24 or later.

## Read it from an app

Read a channel through the Kernel client, as `pullChannel` in [plugin/lib/collector.js](../../plugin/lib/collector.js) does. [docs/data-sources.md](../../docs/data-sources.md) shows how Reporting Tool Lite uses each channel. For other reusable parts of the app, see [docs/reusing.md](../../docs/reusing.md).
