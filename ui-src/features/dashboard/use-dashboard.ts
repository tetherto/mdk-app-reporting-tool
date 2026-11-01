import type { QueryView } from "@tetherto/mdk-react-adapter";
import type { RangeQuery } from "../../api/contract";
import { useShaped } from "../../lib/view";
import { useOperations } from "../operations/use-operations";
import type { DashboardCharts } from "./dashboard-shape";
import { toDashboardCharts } from "./dashboard-shape";

export const useDashboard = (query: RangeQuery): QueryView<DashboardCharts> =>
  useShaped(useOperations(query), toDashboardCharts);
