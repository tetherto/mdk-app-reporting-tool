import { Typography } from "@tetherto/mdk-react-devkit";
import type { ReactNode } from "react";

type PageProps = {
  title: string;
  /** The toolbar under the title: the period control and the page's own actions. */
  actions?: ReactNode;
  /** Beside the title, e.g. Set Monthly Cost. */
  headerAction?: ReactNode;
  children: ReactNode;
};

/** The frame every Reporting Tool Lite page renders in: one title, then its toolbar, then the content. */
export const Page = ({ title, actions, headerAction, children }: PageProps) => (
  <section className="reporting-page">
    <header className="reporting-page__header">
      <Typography variant="heading3">{title}</Typography>
      {headerAction}
    </header>
    {actions === undefined ? null : <Toolbar>{actions}</Toolbar>}
    {children}
  </section>
);

/** The row of labelled controls under a page's title, or under its tabs where it has them. */
export const Toolbar = ({ children }: { children: ReactNode }) => (
  <div className="reporting-page__toolbar">{children}</div>
);

/** One labelled control in the toolbar, e.g. PERIOD over its select. */
export const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="reporting-field">
    <span className="reporting-field__label">{label}</span>
    {children}
  </div>
);
