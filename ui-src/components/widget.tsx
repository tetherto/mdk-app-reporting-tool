import type { QueryView } from "@tetherto/mdk-react-adapter";
import {
  Button,
  ChartContainer,
  ErrorCard,
  ExternalLinkIcon,
  PlugIcon,
  RightArrowIcon,
} from "@tetherto/mdk-react-devkit";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router";

import { APP_PATHS } from "../app-routes";
import { Notice } from "./notice";

/**
 * The sources a figure can need that a site may not have wired, in the order a
 * builder wires them. `split` is no subsidy / fee split at all; `poolSplit` is
 * a pool that doesn't report its own (the network's estimate doesn't count).
 */
export const WIRED_SOURCES = ["pool", "market", "poolSplit", "split", "costs"] as const;
export type MissingSource = (typeof WIRED_SOURCES)[number];

const README_URL = "https://github.com/tetherto/mdk-app-reporting-tool#";

/**
 * What each missing source says, in full for a chart and `short` for a tile,
 * and where its link goes: a page of the app (`page`), or for what only the
 * builder can wire, a section of the README (`anchor`).
 */
const MISSING_SOURCES: Record<
  MissingSource,
  { text: string; short: string; link: string } & ({ page: string } | { anchor: string })
> = {
  pool: {
    text: "No pool is wired.",
    short: "No pool wired",
    link: "Wire your pool",
    anchor: "wire-your-pool",
  },
  market: {
    text: "No market data is wired.",
    short: "No market data wired",
    link: "Wire market data",
    anchor: "market-data",
  },
  poolSplit: {
    text: "Your pool does not report the subsidy / fee split. Revenue Summary estimates it from the network's fee share.",
    short: "No split reported",
    // The pool is wired and the operator can't change what it reports, so this
    // points to the estimate rather than to setup docs.
    link: "See the estimate",
    page: APP_PATHS.REVENUE_SUMMARY,
  },
  split: {
    text: "The subsidy / fee split is unavailable: the pool doesn't report it and there is no network fee data for these days.",
    short: "No split available",
    link: "Wire your pool",
    anchor: "wire-your-pool",
  },
  costs: {
    text: "No costs entered for this period.",
    short: "No costs entered",
    link: "Open Cost Input",
    page: APP_PATHS.COST_INPUT,
  },
};

/**
 * What a widget shows:
 *  - loading: the first response is on its way
 *  - error: the request failed; says why
 *  - not-wired: a source the widget needs isn't connected; names it and says where to wire it
 *  - empty: the response has nothing in the period
 *  - data: the widget itself
 */
export type WidgetState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "not-wired"; source: MissingSource }
  | { kind: "empty" }
  | { kind: "data" };

/**
 * A widget's state from its view: `isEmpty` says when ready data has nothing to
 * show, and `missing` names a source the widget needs that isn't wired.
 */
export function widgetState<T>(
  view: QueryView<T>,
  isEmpty: (data: T) => boolean,
  missing: MissingSource | null = null,
): WidgetState {
  if (view.status === "loading") return { kind: "loading" };
  if (view.status === "error") return { kind: "error", message: view.message };
  if (missing !== null) return { kind: "not-wired", source: missing };
  return isEmpty(view.data) ? { kind: "empty" } : { kind: "data" };
}

/** A missing source's link: a page of the app, or the README in a new tab. */
const WireLink = ({ source }: { source: MissingSource }) => {
  const missing = MISSING_SOURCES[source];
  return "page" in missing ? (
    <Link className="reporting-notice__link" to={`../${missing.page}`}>
      {missing.link}
      <RightArrowIcon />
    </Link>
  ) : (
    <a
      className="reporting-notice__link"
      href={README_URL + missing.anchor}
      target="_blank"
      rel="noreferrer"
    >
      {missing.link}
      <ExternalLinkIcon size={12} />
    </a>
  );
};

/**
 * How much room a not-wired message has: `block` (a chart: plug, the full
 * message, the link), `short` (the same with the short message, for a small
 * card) or `inline` (a tile: a small plug beside the short message, the link
 * under them).
 */
export const NOT_WIRED_SIZES = ["block", "short", "inline"] as const;
export type NotWiredSize = (typeof NOT_WIRED_SIZES)[number];

type NotWiredProps = {
  source: MissingSource;
  size?: NotWiredSize;
};

/** The not-wired notice: a plug, what isn't wired, and a link to where it is wired. */
export const NotWired = ({ source, size = "block" }: NotWiredProps) => {
  const { text, short } = MISSING_SOURCES[source];
  const inline = size === "inline";
  return (
    <Notice
      icon={<PlugIcon size={inline ? 14 : 32} />}
      message={size === "block" ? text : inline ? short : `${short}.`}
      action={<WireLink source={source} />}
      size={inline ? "inline" : "block"}
    />
  );
};

type WidgetProps = {
  title: string;
  state: WidgetState;
  /** Next to the title, e.g. an info tooltip. */
  titleExtra?: ReactNode;
  headerAction?: ReactNode;
  expandable?: boolean;
  /** How much of the not-wired message fits: `short` for a small card. */
  notWiredSize?: Exclude<NotWiredSize, "inline">;
  className?: string;
  children?: ReactNode;
};

/**
 * Four diagonal arrows, out to the corners to expand a chart and in to the
 * centre to collapse it. The devkit has no such icon.
 */
const EXPAND_PATH =
  "M6.5 6.5 2 2m0 4V2h4M9.5 6.5 14 2m-4 0h4v4M6.5 9.5 2 14m0-4v4h4M9.5 9.5 14 14m0-4v4h-4";
const COLLAPSE_PATH =
  "M2 2l4.5 4.5m0-4v4h-4M14 2 9.5 6.5m0-4v4h4M2 14l4.5-4.5m-4 0h4v4M14 14l-4.5-4.5m4 0h-4v4";

const ExpandIcon = ({ collapse }: { collapse: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path
      d={collapse ? COLLAPSE_PATH : EXPAND_PATH}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EMPTY_MESSAGE = "No data in this period. Pick another range above.";

/** MDK's ChartContainer, with its loading and empty states, plus the error and not-wired states. */
export const Widget = ({
  title,
  state,
  titleExtra,
  headerAction,
  expandable = false,
  notWiredSize = "block",
  className,
  children,
}: WidgetProps) => {
  const [expanded, setExpanded] = useState(false);
  const classes = ["reporting-widget"];
  if (expanded) classes.push("reporting-widget--expanded");
  if (className !== undefined) classes.push(className);

  let actions: ReactNode;
  if (headerAction !== undefined || expandable) {
    actions = (
      <div className="reporting-widget__actions">
        {headerAction}
        {expandable ? (
          <Button
            variant="icon"
            aria-label={expanded ? `Collapse ${title}` : `Expand ${title}`}
            title={expanded ? "Collapse" : "Expand"}
            icon={<ExpandIcon collapse={expanded} />}
            onClick={() => setExpanded((v) => !v)}
          />
        ) : null}
      </div>
    );
  }

  return (
    <ChartContainer
      className={classes.join(" ")}
      title={title}
      titleExtra={titleExtra}
      headerAction={actions}
      loading={state.kind === "loading"}
    >
      <WidgetBody state={state} notWiredSize={notWiredSize}>
        {children}
      </WidgetBody>
    </ChartContainer>
  );
};

type WidgetBodyProps = {
  state: WidgetState;
  notWiredSize: NotWiredSize;
  children?: ReactNode;
};

const WidgetBody = ({ state, notWiredSize, children }: WidgetBodyProps) => {
  switch (state.kind) {
    case "error":
      return <ErrorCard title="Could not load" error={state.message} />;
    case "not-wired":
      return <NotWired source={state.source} size={notWiredSize} />;
    case "empty":
      return <Notice message={EMPTY_MESSAGE} />;
    default:
      // loading is drawn by ChartContainer, which hides its children then.
      return <>{children}</>;
  }
};
