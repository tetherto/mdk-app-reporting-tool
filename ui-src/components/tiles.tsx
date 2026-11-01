import { SingleStatCard } from "@tetherto/mdk-react-devkit";

import type { Tile } from "../features/financials/financials-shape";
import { NotWired } from "./widget";

type TilesProps = {
  tiles: Tile[];
  /** Fixed columns; otherwise as many as fit. */
  columns?: 1 | 2 | 3;
  className?: string;
};

/** A tile's lines under its value: the detail, then the subtitle. */
const linesOf = (t: Tile) => {
  const lines = [t.detail, t.subtitle].filter((l): l is string => l !== undefined);
  return lines.length === 0 ? undefined : lines.map((l) => <div key={l}>{l}</div>);
};

/**
 * Stat tiles as the design draws them, on MDK's SingleStatCard: name and
 * caption, the value with an optional tag, detail lines. A tile whose source
 * isn't wired shows no value and says what's missing.
 */
export const Tiles = ({ tiles, columns, className }: TilesProps) => {
  const classes = ["reporting-tiles"];
  if (columns !== undefined) classes.push(`reporting-tiles--${columns}`);
  if (className !== undefined) classes.push(className);
  return (
    <div className={classes.join(" ")}>
      {tiles.map((t) => {
        // What every tile shows, wired or not.
        const common = {
          variant: "secondary" as const,
          name: t.name,
          ...(t.caption === undefined ? {} : { caption: t.caption }),
        };
        const key = `${t.name}-${t.caption ?? ""}`;
        return t.missing === undefined ? (
          <SingleStatCard
            key={key}
            {...common}
            value={t.value}
            {...(t.tag === undefined ? {} : { tag: t.tag })}
            {...(t.accent === true ? { className: "reporting-tile--accent" } : {})}
            detail={linesOf(t)}
          />
        ) : (
          <SingleStatCard
            key={key}
            {...common}
            className="reporting-tile--not-wired"
            detail={<NotWired source={t.missing} size="inline" />}
          />
        );
      })}
    </div>
  );
};
