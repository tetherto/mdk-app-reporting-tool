import {
  Button,
  ErrorCard,
  Input,
  Loader,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Typography,
} from "@tetherto/mdk-react-devkit";
import { useMemo, useState } from "react";

import type { YearCosts } from "../../api/contract";
import { Page } from "../../components/page";
import { useSiteInfo } from "../site/site-gate";
import type { CostDraftRow, CostField } from "./cost-input-shape";
import {
  changesOf,
  COST_FIELDS,
  isEdited,
  isRowValid,
  MONTH_NAMES,
  parseAmount,
  tidyAmount,
  toDraft,
  yearIn,
  yearsFor,
} from "./cost-input-shape";
import { useSaveCosts, useYearCosts } from "./use-costs";

export const CostInputPage = () => {
  const { site, history } = useSiteInfo();
  const years = useMemo(
    () => yearsFor(history.firstTs, site.timezone),
    [history.firstTs, site.timezone],
  );
  const [year, setYear] = useState(() => yearIn(Date.now(), site.timezone));
  const view = useYearCosts(year);

  return (
    <Page title="Cost Input">
      <div className="reporting-page__header">
        <Typography variant="body">Monthly Costs</Typography>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="reporting-period__granularity">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {view.status === "loading" ? <Loader /> : null}
      {view.status === "error" ? <ErrorCard title="Could not load" error={view.message} /> : null}
      {view.status === "ready" ? (
        // A new draft for each year and each save.
        <CostTable key={`${year}-${updatedKey(view.data)}`} year={year} saved={view.data} />
      ) : null}
    </Page>
  );
};

const updatedKey = (costs: YearCosts): number =>
  costs.months.reduce((max, m) => Math.max(max, m.updatedAt ?? 0), 0);

const CostTable = ({ year, saved }: { year: number; saved: YearCosts }) => {
  const [draft, setDraft] = useState<CostDraftRow[]>(() => toDraft(saved));
  const { save, saving, error } = useSaveCosts();
  const changes = useMemo(() => changesOf(year, saved, draft), [year, saved, draft]);
  const allValid = draft.every(isRowValid);

  const setField = (month: number, field: CostField, text: string) =>
    setDraft((rows) => rows.map((r) => (r.month === month ? { ...r, [field]: text } : r)));

  const edited = isEdited(saved, draft);

  return (
    <>
      <table className="reporting-costs">
        <thead>
          <tr>
            <th>Month</th>
            {COST_FIELDS.map((f) => (
              <th key={f.key}>{f.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {draft.map((row) => (
            <tr key={row.month}>
              <td>{MONTH_NAMES[row.month - 1]}</td>
              {COST_FIELDS.map(({ key: field, label }) => (
                <td key={field}>
                  <Input
                    inputMode="decimal"
                    prefix="$"
                    wrapperClassName="reporting-costs__input"
                    aria-label={`${MONTH_NAMES[row.month - 1]} ${label} cost`}
                    aria-invalid={parseAmount(row[field]) === undefined}
                    value={row[field]}
                    placeholder="Cost in USD"
                    onChange={(e) => setField(row.month, field, e.target.value)}
                    onBlur={() => setField(row.month, field, tidyAmount(row[field]))}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="reporting-costs__footer">
        {allValid ? null : (
          <span className="reporting-snapshot__error">
            Enter amounts as non-negative numbers, or leave them blank.
          </span>
        )}
        {error === null ? null : <span className="reporting-snapshot__error">{error}</span>}
        {edited ? (
          <Button variant="secondary" disabled={saving} onClick={() => setDraft(toDraft(saved))}>
            Discard changes
          </Button>
        ) : null}
        <Button
          variant="primary"
          disabled={changes === null || saving}
          onClick={() => {
            if (changes !== null) void save(changes);
          }}
        >
          {saving ? "Saving…" : "Save Costs"}
        </Button>
      </div>
    </>
  );
};
