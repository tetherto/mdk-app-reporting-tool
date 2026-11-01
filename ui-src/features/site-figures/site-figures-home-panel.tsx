import { useMdkApp } from "@tetherto/mdk-react-adapter";
import { ErrorCard, Loader, SingleStatCard } from "@tetherto/mdk-react-devkit";
import { Link } from "react-router";

import { useSiteFigures } from "./use-site-figures";

/** The card the app adds to the dashboard's Home: the site's last 24 hours, linking to the reports. */
export const SiteFiguresHomePanel = () => {
  const { name } = useMdkApp();
  const view = useSiteFigures();
  if (view.status === "loading") return <Loader />;
  if (view.status === "error")
    return <ErrorCard title="Could not load the site's figures" error={view.message} />;
  return (
    <div className="reporting-home">
      <div className="reporting-tiles">
        <SingleStatCard variant="secondary" name="Hashrate, 24h avg" value={view.data.hashrate} />
        <SingleStatCard variant="secondary" name="Power, 24h avg" value={view.data.power} />
        <SingleStatCard
          variant="secondary"
          name="Efficiency, 24h avg"
          value={view.data.efficiency}
        />
      </div>
      {/* Home is the dashboard's page, not the app's: link by the installed name. */}
      <Link className="reporting-home__link" to={`/app/${name}`}>
        Open the reports
      </Link>
    </div>
  );
};
