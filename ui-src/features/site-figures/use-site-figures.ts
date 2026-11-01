import type { QueryView } from "@tetherto/mdk-react-adapter";
import { useMemo } from "react";

import type { RangeQuery } from "../../api/contract";
import { MINUTE, useMinute } from "../../lib/use-minute";
import { useShaped } from "../../lib/view";
import { useOperations } from "../operations/use-operations";
import type { SiteFigures } from "./site-figures-shape";
import { toSiteFigures } from "./site-figures-shape";

const DAY = 24 * 60 * MINUTE;

/** The site's averages over the last 24 hours, to the minute: the window moves forward every minute. */
export const useSiteFigures = (): QueryView<SiteFigures> => {
  const end = useMinute();
  const query = useMemo<RangeQuery>(() => ({ start: end - DAY, end, granularity: "hour" }), [end]);
  return useShaped(useOperations(query), toSiteFigures);
};
