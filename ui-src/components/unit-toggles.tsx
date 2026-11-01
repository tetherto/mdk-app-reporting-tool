import type { BitcoinUnit } from "@tetherto/mdk-react-devkit";
import { CurrencyToggler } from "@tetherto/mdk-react-devkit";

import type { Currency } from "../features/financials/financials-shape";
import { CURRENCIES, isCurrency } from "../features/financials/financials-shape";
import { BITCOIN_UNIT_LIST, isBitcoinUnit } from "../lib/format";
import { Field } from "./page";

/** USD / BTC, for a chart's header (Hash Balance, Energy Balance). */
export const CurrencyToggle = ({
  value,
  onChange,
}: {
  value: Currency;
  onChange: (currency: Currency) => void;
}) => (
  <CurrencyToggler
    currencies={[...CURRENCIES]}
    value={value}
    onChange={(v) => {
      if (isCurrency(v)) onChange(v);
    }}
  />
);

/** BTC / sats under a BITCOIN UNIT label, for a page's toolbar (Revenue Summary, Subsidy / Fee). */
export const BitcoinUnitField = ({
  value,
  onChange,
}: {
  value: BitcoinUnit;
  onChange: (unit: BitcoinUnit) => void;
}) => (
  <Field label="Bitcoin Unit">
    <CurrencyToggler
      currencies={[...BITCOIN_UNIT_LIST]}
      value={value}
      onChange={(v) => {
        if (isBitcoinUnit(v)) onChange(v);
      }}
    />
  </Field>
);
