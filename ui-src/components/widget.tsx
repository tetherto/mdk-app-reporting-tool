import type { QueryView } from "@tetherto/mdk-react-adapter";
import {
  Button,
  ChartContainer,
  EmptyState,
  ErrorCard,
  RightArrowIcon,
} from "@tetherto/mdk-react-devkit";
import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router";

import { APP_PATHS } from "../app-routes";

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
 * and where the builder wires it: a section of the README (`anchor`), or Cost
 * Input for costs.
 */
const MISSING: Record<
  MissingSource,
  { text: string; short: string; link: string; anchor?: string }
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
    text: "Your pool worker does not report the subsidy / fee split.",
    short: "No split reported",
    // The pool is wired: the link explains the split, not how to wire a pool.
    link: "About the split",
    anchor: "wire-your-pool",
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
  },
};

/** A plug, for a source that isn't connected. The devkit has no such icon. */
const PlugIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M12 4v7M20 4v7M9 11h14v5a7 7 0 0 1-14 0v-5ZM16 23v5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** An arrow out of a box: the link opens in a new tab. */
const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d="M7 1h4v4M11 1 5.5 6.5M9 7.5V11H1V3h3.5"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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

/** Where a missing source is wired: Cost Input inside the app, else the README in a new tab. */
const WireLink = ({ source }: { source: MissingSource }) => {
  const { link, anchor } = MISSING[source];
  return anchor === undefined ? (
    <Link className="reporting-not-wired__link" to={`../${APP_PATHS.COST_INPUT}`}>
      {link}
      <RightArrowIcon />
    </Link>
  ) : (
    <a
      className="reporting-not-wired__link"
      href={README_URL + anchor}
      target="_blank"
      rel="noreferrer"
    >
      {link}
      <ExternalIcon />
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

/** The not-wired message: a plug, what isn't wired, and a link to where it is wired. */
export const NotWired = ({ source, size = "block" }: NotWiredProps) => {
  const { text, short } = MISSING[source];
  if (size === "inline")
    return (
      <div className="reporting-not-wired-inline">
        <span className="reporting-not-wired-inline__text">
          <PlugIcon size={14} />
          {short}
        </span>
        <WireLink source={source} />
      </div>
    );
  return (
    <EmptyState
      className="reporting-not-wired"
      image={<PlugIcon />}
      size="md"
      description={
        <>
          <span>{size === "short" ? `${short}.` : text}</span>
          <WireLink source={source} />
        </>
      }
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

/** Four corner arrows, out to expand or in to collapse. The devkit has no such icon. */
const ExpandIcon = ({ collapse }: { collapse: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
    <path
      d={collapse ? "M5 1v4H1M9 1v4h4M5 13V9H1M9 13V9h4" : "M1 5V1h4M13 5V1H9M1 9v4h4M13 9v4H9"}
      stroke="currentColor"
      strokeWidth="1.25"
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
      empty={state.kind === "empty"}
      emptyMessage={EMPTY_MESSAGE}
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
    default:
      // loading and empty are drawn by ChartContainer, which hides its children then.
      return <>{children}</>;
  }
};
