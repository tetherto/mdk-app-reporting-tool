// Cost Input: the year's twelve months as editable rows. Inputs are strings
// while being typed; a row is saved as numbers, or null where left blank.
import type { CostsUpdate, YearCosts } from "../../api/contract";

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** The two costs a month holds: its field, the column header, and the word an input's label uses. */
export const COST_FIELDS = [
  { key: "energyUsd", header: "Monthly Energy Cost", label: "energy" },
  { key: "operationsUsd", header: "Monthly Operations Cost", label: "operations" },
] as const;
export type CostField = (typeof COST_FIELDS)[number]["key"];

/** The calendar year `ts` falls in, in `timezone`. */
export const yearIn = (ts: number, timezone: string): number =>
  Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, year: "numeric" }).format(ts));

/**
 * The years Cost Input offers, newest first: from the first year with history
 * to next year, so next year's budget can go in before it starts.
 */
export const yearsFor = (firstTs: number | null, timezone: string, now = Date.now()): number[] => {
  const thisYear = yearIn(now, timezone);
  const last = thisYear + 1;
  const first = Math.min(firstTs === null ? thisYear : yearIn(firstTs, timezone), thisYear);
  return Array.from({ length: last - first + 1 }, (_, i) => last - i);
};

/** One month as typed: the two inputs as strings. */
export type CostDraftRow = { month: number; energyUsd: string; operationsUsd: string };

const AMOUNT = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** A saved amount as the input shows it: "92,627.57", or blank. */
export const formatAmount = (v: number | null): string => (v === null ? "" : AMOUNT.format(v));

export const toDraft = (costs: YearCosts): CostDraftRow[] =>
  costs.months.map((m) => ({
    month: m.month,
    energyUsd: formatAmount(m.energyUsd),
    operationsUsd: formatAmount(m.operationsUsd),
  }));

/** A typed amount: null when blank, a number when it is a non-negative one, else undefined (invalid). */
export const parseAmount = (text: string): number | null | undefined => {
  const t = text.trim().replace(/,/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/** A typed amount, tidied once the input loses focus; left as typed when invalid. */
export const tidyAmount = (text: string): string => {
  const v = parseAmount(text);
  return v === undefined ? text : formatAmount(v);
};

export const isRowValid = (row: CostDraftRow): boolean =>
  parseAmount(row.energyUsd) !== undefined && parseAmount(row.operationsUsd) !== undefined;

/** The months that differ from what is saved, as a PUT body; null when nothing changed or a value is invalid. */
export function changesOf(
  year: number,
  saved: YearCosts,
  draft: CostDraftRow[],
): CostsUpdate | null {
  const months: CostsUpdate["months"] = [];
  for (const row of draft) {
    const e = parseAmount(row.energyUsd);
    const o = parseAmount(row.operationsUsd);
    if (e === undefined || o === undefined) return null;
    const was = saved.months.find((m) => m.month === row.month);
    if (was !== undefined && was.energyUsd === e && was.operationsUsd === o) continue;
    months.push({ month: row.month, energyUsd: e, operationsUsd: o });
  }
  return months.length === 0 ? null : { year, months };
}

/** Whether any input differs from what is saved, valid or not. */
export const isEdited = (saved: YearCosts, draft: CostDraftRow[]): boolean =>
  toDraft(saved).some(
    (row, i) =>
      parseAmount(row.energyUsd) !== parseAmount(draft[i]?.energyUsd ?? "") ||
      parseAmount(row.operationsUsd) !== parseAmount(draft[i]?.operationsUsd ?? "") ||
      (draft[i] !== undefined && !isRowValid(draft[i])),
  );
