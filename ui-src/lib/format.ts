// One unit per metric across every page, scaled by magnitude with MDK's unit
// scales (pickUnitScale / scaleToUnit): a chart picks its unit from its largest
// value so all of its points share one. Numbers, units and bitcoin amounts are
// written by MDK's formatters, with the app's en dash for a missing value.
import type { BitcoinUnit, ScaledValue } from "@tetherto/mdk-react-devkit";
import {
  BITCOIN_UNITS,
  formatBitcoin as mdkFormatBitcoin,
  formatNumber as mdkFormatNumber,
  formatValueUnit,
  UNITS,
} from "@tetherto/mdk-react-devkit";

export const ENERGY_UNIT = UNITS.ENERGY_MWH;

/** Shown for a missing value: an en dash, so it can't read as a minus sign (MDK's default is '-'). */
export const MISSING = "–";

const digitsOf = (digits: number): Intl.NumberFormatOptions => ({
  maximumFractionDigits: digits,
  minimumFractionDigits: 0,
});

export const formatNumber = (v: number | null | undefined, digits = 2): string =>
  mdkFormatNumber(v, digitsOf(digits), MISSING);

export const formatScaled = (s: ScaledValue, digits = 2): string =>
  formatValueUnit(s.value, s.unit, digitsOf(digits), MISSING);

/** A bucket's label in the site's timezone. */
export const bucketLabel = (ts: number, granularity: string, timezone: string): string => {
  const options: Intl.DateTimeFormatOptions = { timeZone: timezone, month: "short" };
  if (granularity === "hour") {
    options.day = "numeric";
    options.hour = "2-digit";
    options.minute = "2-digit";
    options.hourCycle = "h23";
  } else if (granularity === "month") {
    options.year = "numeric";
  } else {
    options.day = "numeric";
  }
  return new Intl.DateTimeFormat("en-US", options).format(ts);
};

// Money and bitcoin, written one way on every page and toggle: USD, BTC, sats.
export const SATS_PER_BTC = 1e8;
export const MONEY_UNITS = {
  USD: "USD",
  BTC: "BTC",
  SATS: "sats",
  USD_PER_BTC: "$/BTC",
  KUSD_PER_BTC: "$k/BTC",
  USD_PER_MWH: "$/MWh",
  BTC_PER_MWH: "BTC/MWh",
  SATS_PER_MWH: "sats/MWh",
  USD_PER_PHS_DAY: "$/PH/s/day",
  BTC_PER_PHS_DAY: "BTC/PH/s/day",
  SATS_PER_PHS_DAY: "sats/PH/s/day",
  SATS_PER_VB: "sats/vB",
  PERCENT: "%",
} as const;

/** MDK's bitcoin units in the order the toggles list them: BTC, then sats. */
export const BITCOIN_UNIT_LIST = [BITCOIN_UNITS.BTC, BITCOIN_UNITS.SATS] as const;
export const isBitcoinUnit = (v: string): v is BitcoinUnit =>
  BITCOIN_UNIT_LIST.some((u) => u === v);

/** A BTC amount in `unit` (BTC, or whole sats), written with its unit. */
export const formatBitcoin = (btc: number | null | undefined, unit: BitcoinUnit): string =>
  mdkFormatBitcoin(btc, unit, MISSING);

/** A value with a unit, e.g. `formatWith(57.2, "$/MWh")`. */
export const formatWith = (v: number | null | undefined, unit: string, digits = 2): string =>
  v === null || v === undefined ? MISSING : formatValueUnit(v, unit, digitsOf(digits), MISSING);

/** A USD amount, the dollar sign first: `$1,234`. */
export const formatUsd = (v: number | null | undefined, digits = 0): string =>
  formatWith(v, "$", digits);

/** When a snapshot was taken: "14:32 today", else "Oct 22, 14:32", in the site's timezone. */
export const formatSnapshotTime = (ts: number, timezone: string, now = Date.now()): string => {
  const day = (t: number) =>
    new Intl.DateTimeFormat("en-US", { timeZone: timezone, dateStyle: "medium" }).format(t);
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(ts);
  if (day(ts) === day(now)) return `${time} today`;
  const date = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
  }).format(ts);
  return `${date}, ${time}`;
};

export const formatDateTime = (ts: number, timezone: string): string =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(ts);
