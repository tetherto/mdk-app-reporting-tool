import { CurrencyToggler } from "@tetherto/mdk-react-devkit";

type ViewTabsProps<T extends string> = {
  tabs: ReadonlyArray<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
};

/** A page's views as one full-width bar, the selected one filled: the devkit toggle as a tab bar. */
export const ViewTabs = <T extends string>({ tabs, value, onChange }: ViewTabsProps<T>) => (
  <CurrencyToggler
    fullWidth
    currencies={tabs.map((t) => ({ value: t.value, label: t.label }))}
    itemAriaLabel={(label) => `Show ${label}`}
    value={value}
    onChange={(v) => {
      const tab = tabs.find((t) => t.value === v);
      if (tab !== undefined) onChange(tab.value);
    }}
  />
);
