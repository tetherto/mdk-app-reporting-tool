import type { QueryView } from "@tetherto/mdk-react-adapter";
import { useMdkApp } from "@tetherto/mdk-react-adapter";

import type { SiteInfo } from "../../api/contract";
import { siteInfoSchema } from "../../api/contract";
import { API_ROUTES } from "../../api/routes";
import { useParsedQuery } from "../../lib/use-parsed-query";

/** The site: names, timezone, units, miner types and which sources are wired. */
export const useSite = (): QueryView<SiteInfo> => {
  const { apiUrl } = useMdkApp();
  return useParsedQuery(apiUrl(API_ROUTES.SITE), siteInfoSchema);
};
