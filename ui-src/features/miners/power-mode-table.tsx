import type { DataTableColumnDef } from "@tetherto/mdk-react-devkit";
import {
  DataTable,
  EmptyState,
  ErrorCard,
  Loader,
  POWER_W_SCALES,
  scaleToUnit,
} from "@tetherto/mdk-react-devkit";
import type { CSSProperties } from "react";

import type { ModelSnapshot, SnapshotCount } from "../../api/contract";
import { COLORS } from "../../lib/colors";
import { formatNumber, formatScaled } from "../../lib/format";
import { SnapshotBar } from "./snapshot-bar";
import { useMinersSnapshot } from "./use-miners-snapshot";

type ModeCount = Exclude<SnapshotCount, "total">;

/** A count as a chip tinted in its status or power mode's colour, as in the design. */
const Chip = ({ value, color }: { value: number; color: string }) => {
  const style: CSSProperties & Record<"--chip", string> = { "--chip": color };
  return (
    <span className="reporting-chip" style={style}>
      {formatNumber(value, 0)}
    </span>
  );
};

const count = (key: ModeCount, header: string): DataTableColumnDef<ModelSnapshot> => ({
  id: key,
  header,
  size: 104,
  accessorFn: (row) => row[key],
  cell: ({ row }) => <Chip value={row.original[key]} color={COLORS[key]} />,
});

const COLUMNS: Array<DataTableColumnDef<ModelSnapshot>> = [
  {
    accessorKey: "displayName",
    header: "Miner Type",
    size: 260,
    cell: ({ row }) => (
      <div className="reporting-model">
        <span>{row.original.displayName}</span>
        <span className="reporting-model__meta">
          {formatNumber(row.original.total, 0)} miners ·{" "}
          {formatScaled(scaleToUnit(row.original.powerW, POWER_W_SCALES))}
        </span>
      </div>
    ),
  },
  count("offline", "Offline"),
  count("error", "Error"),
  count("sleep", "Sleep"),
  count("low", "Low"),
  count("normal", "Normal"),
  count("high", "High"),
  count("maintenance", "Maintenance"),
];

/** Miners per type by power mode, as of the latest snapshot: only types present in the fleet. */
export const PowerModeTable = ({ timezone }: { timezone: string }) => {
  const view = useMinersSnapshot();
  return (
    <section className="reporting-section">
      <h2 className="reporting-section__title">Power Mode by Miner Type</h2>
      <SnapshotBar
        ts={view.status === "ready" ? view.data.ts : undefined}
        timezone={timezone}
        subject="Miner power modes"
      />
      {view.status === "loading" ? <Loader /> : null}
      {view.status === "error" ? <ErrorCard title="Could not load" error={view.message} /> : null}
      {view.status === "ready" && view.data.models.length === 0 ? (
        <EmptyState size="sm" description="No miners in the latest snapshot." />
      ) : null}
      {view.status === "ready" && view.data.models.length > 0 ? (
        <DataTable<ModelSnapshot>
          data={view.data.models}
          columns={COLUMNS}
          getRowId={(r) => r.id}
          fullWidth
        />
      ) : null}
    </section>
  );
};
