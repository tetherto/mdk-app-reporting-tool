import { Button } from "@tetherto/mdk-react-devkit";
import { useNavigate } from "react-router";

import { APP_PATHS } from "../app-routes";

/** Opens Cost Input. Shown only on pages that show cost. */
export const SetMonthlyCost = () => {
  const navigate = useNavigate();
  return (
    <Button variant="secondary" onClick={() => void navigate(`../${APP_PATHS.COST_INPUT}`)}>
      Set Monthly Cost
    </Button>
  );
};
