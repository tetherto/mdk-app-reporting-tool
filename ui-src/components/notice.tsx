import { EmptyState } from "@tetherto/mdk-react-devkit";
import type { ReactNode } from "react";

/**
 * How much room a notice has: `block` fills a chart or a panel (the icon over
 * the message, the action under it), `inline` sits in a tile under its name (a
 * small icon beside the message, the action under them).
 */
export const NOTICE_SIZES = ["block", "inline"] as const;
export type NoticeSize = (typeof NOTICE_SIZES)[number];

type NoticeProps = {
  /** Defaults to MDK's no-data icon; a source that isn't wired passes a plug. */
  icon?: ReactNode;
  message: ReactNode;
  /** What to do about it, e.g. a link to where a source is wired. */
  action?: ReactNode;
  size?: NoticeSize;
};

/** The app's one empty or "not available" state, on MDK's EmptyState: an icon, a message, an optional action. */
export const Notice = ({ icon, message, action, size = "block" }: NoticeProps) =>
  size === "inline" ? (
    <div className="reporting-notice reporting-notice--inline">
      <span className="reporting-notice__message">
        {icon}
        {message}
      </span>
      {action}
    </div>
  ) : (
    <EmptyState
      className="reporting-notice"
      image={icon ?? "simple"}
      size="md"
      description={
        <>
          <span>{message}</span>
          {action}
        </>
      }
    />
  );
