import type { PeriodState } from "@tetherto/mdk-react-adapter";
import type { DataTableColumnDef } from "@tetherto/mdk-react-devkit";
import { DataTable, ExportButton } from "@tetherto/mdk-react-devkit";
import { useMemo, useState } from "react";

import { TimeChart } from "../../components/time-chart";
import { Widget, widgetState } from "../../components/widget";
import { formatNumber } from "../../lib/format";
import type { ConsumptionRow, ConsumptionTable } from "./consumption-shape";
import { useConsumption, useConsumptionExport } from "./use-consumption";

const mwhColumn = (
  id: string,
  header: string,
  read: (row: ConsumptionRow) => number | null | undefined,
): DataTableColumnDef<ConsumptionRow> => ({
  id,
  header,
  accessorFn: (row) => read(row) ?? null,
  cell: ({ row }) => formatNumber(read(row.original), 3),
});

const columnsOf = (
  table: ConsumptionTable | undefined,
): Array<DataTableColumnDef<ConsumptionRow>> => {
  if (table === undefined) return [];
  const { siteMeter, meters } = table.report;
  const columns: Array<DataTableColumnDef<ConsumptionRow>> = [
    { accessorKey: "period", header: "Period" },
  ];
  if (siteMeter !== null)
    columns.push(mwhColumn("site", `${siteMeter.label} total`, (r) => r.site));
  for (const m of meters) columns.push(mwhColumn(m.id, m.label, (r) => r.byMeter[m.id]));
  return columns;
};

const isEmpty = (table: ConsumptionTable): boolean => table.chart.empty;

/** Energy per meter in MWh: stacked bar of the meters beside the site meter, and the table behind it. */
export const ConsumptionPanel = ({ period }: { period: PeriodState }) => {
  const view = useConsumption(period.query);
  const table = view.status === "ready" ? view.data : undefined;
  const [page, setPage] = useState({ pageIndex: 0, pageSize: 20 });
  const columns = useMemo(() => columnsOf(table), [table]);
  const exportCsv = useConsumptionExport(table, period.query);
  const state = widgetState(view, isEmpty);
  return (
    <>
      <p className="reporting-note">Energy per power meter, in MWh.</p>
      <Widget
        title="Energy per Meter"
        state={state}
        headerAction={
          <ExportButton
            formats={["csv"]}
            label="Export CSV"
            disabled={table === undefined || table.chart.empty}
            onExport={exportCsv}
          />
        }
      >
        {table === undefined ? null : <TimeChart {...table.chart} />}
      </Widget>
      <Widget title="Consumption by Period" state={state}>
        {table === undefined ? null : (
          <DataTable<ConsumptionRow>
            data={table.rows}
            columns={columns}
            getRowId={(r) => String(r.ts)}
            enablePagination
            pagination={page}
            onPaginationChange={setPage}
          />
        )}
      </Widget>
    </>
  );
};
