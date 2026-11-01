import { describe, expect, it } from "vitest";

import { formatSnapshotTime } from "./format";

describe("formatSnapshotTime", () => {
  const now = Date.UTC(2026, 9, 23, 18, 0);

  it("says today for a snapshot from the site's current day", () => {
    expect(formatSnapshotTime(Date.UTC(2026, 9, 23, 14, 32), "UTC", now)).toBe("14:32 today");
  });

  it("names the day otherwise, in the site's timezone", () => {
    expect(formatSnapshotTime(Date.UTC(2026, 9, 22, 23, 5), "UTC", now)).toBe("Oct 22, 23:05");
    // 23:05 UTC on the 22nd is 08:05 on the 23rd in Tokyo, where it is now the 24th.
    expect(formatSnapshotTime(Date.UTC(2026, 9, 22, 23, 5), "Asia/Tokyo", now)).toBe(
      "Oct 23, 08:05",
    );
  });
});
