# The mock site

The dev stack (`dev/`) is a whole mining site on one machine: the miners, meters and pool account are played by mock device servers, and real MDK workers talk to them exactly as they would to hardware. Only the devices are fake.

## What runs

| Part                                 | Worker                                                | Device mock                              | Hosted by                                                   |
| ------------------------------------ | ----------------------------------------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| 2 Antminer S23 units, 25 miners each | `antminer-mdk-worker` (public, Bitmain)               | the package's CGI mock, one per miner    | `mdk run --dir dev`                                         |
| 2 WhatsMiner M70S units, 25 each     | `whatsminer-mdk-worker` (public, MicroBT)             | the package's API v3 mock, one per miner | `mdk run --dir dev`                                         |
| 4 unit meters + the site meter       | MDK's SATEC worker (`startSatecWorker`)               | MDK's Modbus mock, one per meter         | `dev/mock-site/devices.js`                                  |
| Ocean pool account                   | `ocean-mdk-worker` (public, Ocean)                    | the package's Ocean API mock             | `mdk run --dir dev`; the mock in `dev/mock-site/devices.js` |
| Market data                          | `workers/mempool` (this repo)                         | none: the real mempool.space API         | `mdk run --dir dev`                                         |
| The app                              | `reporting-tool-lite` (this repo, linked into `dev/`) |                                          | `mdk run --dir dev`                                         |

The SATEC worker is a legacy (boot.js) worker, and `mdk run` only hosts contract-first ones. `devices.js` boots it the way MDK's run-a-site tutorial and `examples/mvp-site` do. It then publishes its key to `dev/.mdk/keys`, where the Kernel that `mdk run` started finds it. It isn't on npm: `npm run setup` takes it from the `tetherto/mdk` release tag that matches the CLI, into `dev/.mdk-satec/`.

## One simulation

`dev/mock-site/sim.js` decides what every device does at any moment. Each value is a pure function of the fleet's seed, the device and the time:

- **Miners:** status (mining, sleeping, error, offline, a few in maintenance), power mode, hashrate and power.
- **Meters:** each unit meter reads its miners plus cooling and auxiliaries. The site meter reads every unit plus the site's own load.
- **Pool:** the fleet's share of each day's block rewards, against a mock network hashrate that grows about 2% a month.

Two things read it:

- `devices.js` sets every mock to the simulation once a minute. An offline miner's mock stops listening, and comes back when the miner does.
- `seed.js` backfills the app's store with 400 days of history when the app config names it as `seed`. It runs once, then only fills the gap since the last stored sample. It also enters example costs on Cost Input for every seeded month (each month's simulated energy at $45/MWh energy and $12/MWh operations), once; they stay editable.

Because both read the same functions, the live readings continue the seeded history without a jump.

## Changing the fleet

Edit `dev/mock-site/fleet.json`: units, models, miner counts, mock port ranges. Then:

```bash
npm run dev:generate   # rewrites dev/mdk.yaml: one worker per unit, one device per miner
```

The models come from `dev/config/hardware-catalogue.json`, and the site layout from `dev/config/site.json`.

## Limits

- **Meter resolution:** the SATEC register encodes power in steps of about 21.7 kW, so meter readings move in those steps.
- **Pool split:** the Ocean mock pays net earnings per block, and each simulated day's payout is one block. It reports no subsidy/fee split, as with a real Ocean account, so the Financials pages split payouts by the network's daily fee share from mempool.space.
- **Pool fee:** the Ocean mock reports its 2% fee on the whole block rather than on the account's share. `devices.js` starts the mock and restates the fee from the account's net earnings (`restateFee`), so gross revenue is 2% above net as on a real account.
- **Stale registrations:** renaming a worker or a device leaves the old binding in the Kernel's saved registry, and the Kernel then rejects the new one. Stop the stack and move `dev/.mdk/kernel` aside to reset it.
