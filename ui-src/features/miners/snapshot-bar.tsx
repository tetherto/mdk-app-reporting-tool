import { Button } from "@tetherto/mdk-react-devkit";

import { formatSnapshotTime } from "../../lib/format";
import { useSnapshotRefresh } from "./use-miners-snapshot";

type SnapshotBarProps = {
  ts: number | null | undefined;
  timezone: string;
  /** What the snapshot holds, e.g. "Miner power modes". */
  subject: string;
};

/** The one refresh pattern for snapshot data: a banner saying when it was taken, and Refresh to sample the site now. */
export const SnapshotBar = ({ ts, timezone, subject }: SnapshotBarProps) => {
  const { refresh, refreshing, error } = useSnapshotRefresh();
  const when =
    typeof ts === "number"
      ? `${subject} as of ${formatSnapshotTime(ts, timezone)}. Refresh to load the latest snapshot.`
      : `No snapshot yet. Refresh to take one.`;
  return (
    <div className="reporting-snapshot">
      <span className="reporting-snapshot__dot" aria-hidden="true" />
      <div className="reporting-snapshot__text">
        <span className="reporting-snapshot__title">Snapshot data</span>
        <span>{when}</span>
        {error === null ? null : (
          <span className="reporting-snapshot__error">Refresh failed: {error}</span>
        )}
      </div>
      <Button variant="secondary" size="sm" onClick={refresh} loading={refreshing}>
        Refresh
      </Button>
    </div>
  );
};
