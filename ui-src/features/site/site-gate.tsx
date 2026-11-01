import { ErrorCard, Loader } from "@tetherto/mdk-react-devkit";
import type { ComponentType, ReactNode } from "react";
import { createContext, useContext } from "react";

import type { SiteInfo } from "../../api/contract";
import { useSite } from "./use-site";

const SiteContext = createContext<SiteInfo | null>(null);

/** Loads the site for a page; the page renders only once it is known. Cached across pages. */
export const SiteGate = ({ children }: { children: ReactNode }) => {
  const view = useSite();
  if (view.status === "loading")
    return (
      <div className="reporting-center">
        <Loader />
      </div>
    );
  if (view.status === "error")
    return (
      <div className="reporting-center">
        <ErrorCard title="The reporting app is not reachable" error={view.message} />
      </div>
    );
  return <SiteContext.Provider value={view.data}>{children}</SiteContext.Provider>;
};

/** The site, inside a SiteGate. */
export function useSiteInfo(): SiteInfo {
  const site = useContext(SiteContext);
  if (site === null) throw new Error("useSiteInfo outside SiteGate");
  return site;
}

/** A page that reads the site first. */
export const withSite = (Page: ComponentType): ComponentType => {
  const WithSite = () => (
    <SiteGate>
      <Page />
    </SiteGate>
  );
  WithSite.displayName = `WithSite(${Page.displayName ?? Page.name})`;
  return WithSite;
};
