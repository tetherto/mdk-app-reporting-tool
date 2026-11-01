import { useQuery as Ns, toQueryView as Ts, useMdkApp as ye, usePeriod as Pe, useQueryClient as Kr, defineMdkApp as As, MDK_APP_PANEL_SLOT as Is } from "@tetherto/mdk-react-adapter";
import { SimpleTooltip as Rs, Typography as Yr, buildBarChartOptions as Ms, BarChart as Us, ChartContainer as Zs, EmptyState as vt, ErrorCard as Le, RightArrowIcon as Ds, Button as Ze, UNITS as bn, BITCOIN_UNITS as en, formatBitcoin as Fs, formatNumber as js, formatValueUnit as Gr, Loader as rt, pickUnitScale as Yn, POWER_W_SCALES as Nt, HASHRATE_TH_S_SCALES as wn, CHART_COLORS as J, COLOR as se, CATEGORICAL_COLORS as Gn, PeriodControl as ze, Select as qr, SelectTrigger as Xr, SelectValue as Qr, SelectContent as eo, SelectItem as tn, Input as Ls, SingleStatCard as qe, scaleToUnit as yt, OperationsEnergyCostChart as xs, CurrencyToggler as Tt, DoughnutChart as to, Tabs as Bs, TabsList as Ws, TabsTrigger as st, TabsContent as it, ExportButton as Hs, DataTable as no, OperationsNavIcon as Vs, FinancialsNavIcon as Js } from "@tetherto/mdk-react-devkit";
import { jsx as l, jsxs as _, Fragment as te } from "react/jsx-runtime";
import { Link as ro, useSearchParams as Ee, useNavigate as Ks } from "react-router";
import { useMemo as xe, useState as F, createContext as Ys, useContext as Gs, useCallback as x, useEffect as qs } from "react";
import { mdkFetch as oo, describeRequestError as so, downloadCsv as Xs } from "@tetherto/mdk-ui-foundation";
const K = {
  DASHBOARD: "",
  HASHRATE: "hashrate",
  ENERGY: "energy",
  EFFICIENCY: "efficiency",
  MINERS: "miners",
  REVENUE_SUMMARY: "revenue-summary",
  COST_SUMMARY: "cost-summary",
  SUBSIDY_FEE: "subsidy-fee",
  HASH_BALANCE: "hash-balance",
  ENERGY_BALANCE: "energy-balance",
  COST_INPUT: "cost-input"
}, io = () => /* @__PURE__ */ l(
  Rs,
  {
    side: "left",
    delayDuration: 200,
    content: "Power drawn by mining miners per unit of hashrate. Nominal is the hardware catalogue's rating for the fleet: nominal power over nominal hashrate.",
    children: /* @__PURE__ */ l("span", { className: "reporting-info", "aria-label": "About site efficiency", children: "ⓘ" })
  }
), _e = ({ title: e, actions: t, headerAction: n, children: r }) => /* @__PURE__ */ _("section", { className: "reporting-page", children: [
  /* @__PURE__ */ _("header", { className: "reporting-page__header", children: [
    /* @__PURE__ */ l(Yr, { variant: "heading3", children: e }),
    n
  ] }),
  t === void 0 ? null : /* @__PURE__ */ l(ao, { children: t }),
  r
] }), ao = ({ children: e }) => /* @__PURE__ */ l("div", { className: "reporting-page__toolbar", children: e }), co = ({ label: e, children: t }) => /* @__PURE__ */ _("div", { className: "reporting-field", children: [
  /* @__PURE__ */ l("span", { className: "reporting-field__label", children: e }),
  t
] }), Qs = [6, 4], qn = (e) => e.toLocaleString("en-US", { maximumFractionDigits: 2 }), ei = 24, xt = (e) => typeof e == "object" && e !== null, ti = (e) => {
  const t = xt(e.scales) ? e.scales : {}, n = xt(t.x) ? t.x : {}, r = xt(n.ticks) ? n.ticks : {};
  return { ...e, scales: { ...t, x: { ...n, ticks: { ...r, maxRotation: 0 } } } };
}, U = ({
  labels: e,
  series: t,
  unit: n,
  rightUnit: r,
  stacked: o,
  height: s = 280,
  formatValue: i = qn,
  showDataLabels: a
}) => {
  const u = t.some((f) => f.axis === "right"), c = {
    labels: e,
    datasets: t.map((f) => {
      const h = f.type === "line";
      return {
        label: f.label,
        data: f.values,
        type: f.type ?? "bar",
        backgroundColor: f.color,
        borderColor: f.color,
        borderWidth: h ? 2 : 0,
        // Dashed per segment, not with `borderDash`: the legend copies that
        // onto its box and draws it broken.
        segment: f.dashed === !0 ? { borderDash: () => Qs } : void 0,
        pointRadius: h ? 0 : void 0,
        stack: f.stack,
        order: h ? 0 : 1,
        yAxisID: f.axis === "right" ? "y1" : "y"
      };
    })
  }, d = xe(
    () => ti(
      Ms({
        isStacked: o,
        yTicksFormatter: i,
        yRightTicksFormatter: u ? qn : null,
        yUnit: n,
        yRightUnit: u ? r : void 0,
        categoryTicksPadding: ei,
        legendPosition: "bottom"
      })
    ),
    [u, o, i, n, r]
  );
  return /* @__PURE__ */ l(
    Us,
    {
      data: c,
      options: d,
      height: s,
      isStacked: o,
      showDataLabels: a,
      formatDataLabel: i,
      formatYLabel: i,
      legendPosition: "bottom"
    }
  );
}, ni = "https://github.com/tetherto/mdk-app-reporting-tool#", uo = {
  pool: {
    text: "No pool is wired.",
    short: "No pool wired",
    link: "Wire your pool",
    anchor: "wire-your-pool"
  },
  market: {
    text: "No market data is wired.",
    short: "No market data wired",
    link: "Wire market data",
    anchor: "market-data"
  },
  poolSplit: {
    text: "Your pool worker does not report the subsidy / fee split.",
    short: "No split reported",
    // The pool is wired: the link explains the split, not how to wire a pool.
    link: "About the split",
    anchor: "wire-your-pool"
  },
  split: {
    text: "The subsidy / fee split is unavailable: the pool doesn't report it and there is no network fee data for these days.",
    short: "No split available",
    link: "Wire your pool",
    anchor: "wire-your-pool"
  },
  costs: {
    text: "No costs entered for this period.",
    short: "No costs entered",
    link: "Open Cost Input"
  }
}, Xn = ({ size: e = 32 }) => /* @__PURE__ */ l("svg", { width: e, height: e, viewBox: "0 0 32 32", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ l(
  "path",
  {
    d: "M12 4v7M20 4v7M9 11h14v5a7 7 0 0 1-14 0v-5ZM16 23v5",
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
) }), ri = () => /* @__PURE__ */ l("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ l(
  "path",
  {
    d: "M7 1h4v4M11 1 5.5 6.5M9 7.5V11H1V3h3.5",
    stroke: "currentColor",
    strokeWidth: "1.1",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
) });
function j(e, t, n = null) {
  return e.status === "loading" ? { kind: "loading" } : e.status === "error" ? { kind: "error", message: e.message } : n !== null ? { kind: "not-wired", source: n } : t(e.data) ? { kind: "empty" } : { kind: "data" };
}
const Qn = ({ source: e }) => {
  const { link: t, anchor: n } = uo[e];
  return n === void 0 ? /* @__PURE__ */ _(ro, { className: "reporting-not-wired__link", to: `../${K.COST_INPUT}`, children: [
    t,
    /* @__PURE__ */ l(Ds, {})
  ] }) : /* @__PURE__ */ _(
    "a",
    {
      className: "reporting-not-wired__link",
      href: ni + n,
      target: "_blank",
      rel: "noreferrer",
      children: [
        t,
        /* @__PURE__ */ l(ri, {})
      ]
    }
  );
}, At = ({ source: e, size: t = "block" }) => {
  const { text: n, short: r } = uo[e];
  return t === "inline" ? /* @__PURE__ */ _("div", { className: "reporting-not-wired-inline", children: [
    /* @__PURE__ */ _("span", { className: "reporting-not-wired-inline__text", children: [
      /* @__PURE__ */ l(Xn, { size: 14 }),
      r
    ] }),
    /* @__PURE__ */ l(Qn, { source: e })
  ] }) : /* @__PURE__ */ l(
    vt,
    {
      className: "reporting-not-wired",
      image: /* @__PURE__ */ l(Xn, {}),
      size: "md",
      description: /* @__PURE__ */ _(te, { children: [
        /* @__PURE__ */ l("span", { children: t === "short" ? `${r}.` : n }),
        /* @__PURE__ */ l(Qn, { source: e })
      ] })
    }
  );
}, oi = ({ collapse: e }) => /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 14 14", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ l(
  "path",
  {
    d: e ? "M5 1v4H1M9 1v4h4M5 13V9H1M9 13V9h4" : "M1 5V1h4M13 5V1H9M1 9v4h4M13 9v4H9",
    stroke: "currentColor",
    strokeWidth: "1.25"
  }
) }), si = "No data in this period. Pick another range above.", $ = ({
  title: e,
  state: t,
  titleExtra: n,
  headerAction: r,
  expandable: o = !1,
  notWiredSize: s = "block",
  className: i,
  children: a
}) => {
  const [u, c] = F(!1), d = ["reporting-widget"];
  u && d.push("reporting-widget--expanded"), i !== void 0 && d.push(i);
  let f;
  return (r !== void 0 || o) && (f = /* @__PURE__ */ _("div", { className: "reporting-widget__actions", children: [
    r,
    o ? /* @__PURE__ */ l(
      Ze,
      {
        variant: "icon",
        "aria-label": u ? `Collapse ${e}` : `Expand ${e}`,
        title: u ? "Collapse" : "Expand",
        icon: /* @__PURE__ */ l(oi, { collapse: u }),
        onClick: () => c((h) => !h)
      }
    ) : null
  ] })), /* @__PURE__ */ l(
    Zs,
    {
      className: d.join(" "),
      title: e,
      titleExtra: n,
      headerAction: f,
      loading: t.kind === "loading",
      empty: t.kind === "empty",
      emptyMessage: si,
      children: /* @__PURE__ */ l(ii, { state: t, notWiredSize: s, children: a })
    }
  );
}, ii = ({ state: e, notWiredSize: t, children: n }) => {
  switch (e.kind) {
    case "error":
      return /* @__PURE__ */ l(Le, { title: "Could not load", error: e.message });
    case "not-wired":
      return /* @__PURE__ */ l(At, { source: e.source, size: t });
    default:
      return /* @__PURE__ */ l(te, { children: n });
  }
}, ai = bn.ENERGY_MWH, Ae = "–", Sn = (e) => ({
  maximumFractionDigits: e,
  minimumFractionDigits: 0
}), X = (e, t = 2) => js(e, Sn(t), Ae), _t = (e, t = 2) => Gr(e.value, e.unit, Sn(t), Ae), ci = (e, t, n) => {
  const r = { timeZone: n, month: "short" };
  return t === "hour" ? (r.day = "numeric", r.hour = "2-digit", r.minute = "2-digit", r.hourCycle = "h23") : t === "month" ? r.year = "numeric" : r.day = "numeric", new Intl.DateTimeFormat("en-US", r).format(e);
}, It = 1e8, T = {
  USD: "USD",
  BTC: "BTC",
  SATS: "sats",
  KUSD_PER_BTC: "$k/BTC",
  USD_PER_MWH: "$/MWh",
  BTC_PER_MWH: "BTC/MWh",
  SATS_PER_MWH: "sats/MWh",
  USD_PER_PHS_DAY: "$/PH/s/day",
  BTC_PER_PHS_DAY: "BTC/PH/s/day",
  SATS_PER_PHS_DAY: "sats/PH/s/day",
  SATS_PER_VB: "sats/vB",
  PERCENT: "%"
}, lo = [en.BTC, en.SATS], ui = (e) => lo.some((t) => t === e), bt = (e, t) => Fs(e, t, Ae), fe = (e, t, n = 2) => e == null ? Ae : Gr(e, t, Sn(n), Ae), Ke = (e, t = 0) => fe(e, "$", t), li = (e, t, n = Date.now()) => {
  const r = (i) => new Intl.DateTimeFormat("en-US", { timeZone: t, dateStyle: "medium" }).format(i), o = new Intl.DateTimeFormat("en-US", {
    timeZone: t,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).format(e);
  return r(e) === r(n) ? `${o} today` : `${new Intl.DateTimeFormat("en-US", {
    timeZone: t,
    month: "short",
    day: "numeric"
  }).format(e)}, ${o}`;
};
function nn(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => t.indexOf(+r) === -1).map(([r, o]) => o);
}
function er(e, t = "|") {
  return e.map((n) => vo(n)).join(t);
}
function rn(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
class di {
  constructor(t) {
    this._getter = t, this._value = void 0;
  }
  get value() {
    const t = this._getter;
    return t !== void 0 && (this._value = t(), this._getter = void 0), this._value;
  }
}
function kn(e) {
  return new di(e);
}
function fi(e) {
  return e == null;
}
function Pn(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function hi(e, t) {
  const n = e / t, r = Math.round(n), o = 4 * Number.EPSILON * Math.max(Math.abs(n), 1);
  return Math.abs(n - r) < o ? 0 : n - r;
}
function Ce(e, t, n) {
  Object.defineProperty(e, t, {
    value: n,
    writable: !0,
    enumerable: !0,
    configurable: !0
  });
}
function fo(e) {
  const t = Object.getOwnPropertyDescriptor(e, "shape");
  return t?.get ? t.get.raw : t?.value;
}
function ve(e) {
  return fo(e._zod.def) ?? e._zod.def.shape;
}
function ho(e, t, n) {
  Object.defineProperty(e, t, {
    get() {
      const r = n();
      return Ce(this, t, r), r;
    },
    enumerable: !0,
    configurable: !0
  });
}
function po(e, t, n) {
  t in e ? Ce(e, t, n) : e[t] = n;
}
function Ie(e, t, n, r) {
  const o = ve(t);
  for (const s of n) {
    const i = Object.getOwnPropertyDescriptor(o, s);
    i.enumerable && (i.get ? ho(e, s, () => {
      const a = t._zod.def.shape[s];
      return r ? r(a, s) : a;
    }) : po(e, s, r ? r(i.value, s) : i.value));
  }
}
function pi(e, t) {
  for (const n of Reflect.ownKeys(t)) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.enumerable && (r.get ? ho(e, n, () => t[n]) : po(e, n, r.value));
  }
}
function G(...e) {
  const t = {};
  for (const n of e) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function mi(e) {
  return JSON.stringify(e);
}
function gi(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const mo = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function wt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const vi = /* @__PURE__ */ kn(() => {
  if (ae.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
    return !1;
  try {
    const e = Function;
    return new e(""), !0;
  } catch {
    return !1;
  }
});
function De(e) {
  if (wt(e) === !1)
    return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function")
    return !0;
  const n = t.prototype;
  return !(wt(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function go(e) {
  return De(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
const yi = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
function Rt(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function Oe(e, t, n) {
  const r = new e._zod.constr(t ?? e._zod.def);
  return (!t || n?.parent) && (r._zod.parent = e), r;
}
function b(e) {
  const t = e;
  if (!t)
    return {};
  if (typeof t == "string")
    return { error: () => t };
  if (t?.message !== void 0) {
    if (t?.error !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t;
}
function vo(e) {
  return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function _i(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
const yo = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, bi = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function wi(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const s = {};
  return Ie(s, e, Mt(e, t)), Oe(e, G(n, { shape: s, checks: [] }));
}
function Mt(e, t) {
  const n = ve(e), r = [];
  for (const o of Reflect.ownKeys(t)) {
    if (!Object.getOwnPropertyDescriptor(n, o)?.enumerable)
      throw new Error(`Unrecognized key: "${String(o)}"`);
    t[o] && r.push(o);
  }
  return r;
}
function Si(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const s = new Set(Mt(e, t)), i = {};
  return Ie(i, e, Reflect.ownKeys(ve(e)).filter((a) => !s.has(a))), Oe(e, G(n, { shape: i, checks: [] }));
}
function ki(e, t) {
  if (!De(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const o = ve(e);
    for (const s of Reflect.ownKeys(t))
      if (Object.getOwnPropertyDescriptor(o, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  return Oe(e, G(e._zod.def, { shape: _o(e, t) }));
}
function _o(e, t) {
  const n = {};
  return Ie(n, e, Reflect.ownKeys(ve(e))), pi(n, t), n;
}
function Pi(e, t) {
  if (!De(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  return Oe(e, G(e._zod.def, { shape: _o(e, t) }));
}
function zi(e, t) {
  if (!t?._zod?.def)
    throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  if (e._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const n = {};
  Ie(n, e, Reflect.ownKeys(ve(e))), Ie(n, t, Reflect.ownKeys(ve(t)));
  const r = G(e._zod.def, {
    shape: n,
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: t._zod.def.checks ?? []
  });
  return Oe(e, r);
}
function tr(e, t, n, r = "partial") {
  const s = t._zod.def.checks;
  if (s && s.length > 0)
    throw new Error(`.${r}() cannot be used on object schemas containing refinements`);
  const a = n ? new Set(Mt(t, n)) : void 0, u = {};
  return Ie(u, t, Reflect.ownKeys(ve(t)), e && ((c, d) => a && !a.has(d) ? c : new e({ type: "optional", innerType: c }))), Oe(t, G(t._zod.def, { shape: u, checks: [] }));
}
function Ei(e, t, n) {
  const r = n ? new Set(Mt(t, n)) : void 0, o = {};
  return Ie(o, t, Reflect.ownKeys(ve(t)), (s, i) => (
    // overwrite with non-optional
    r && !r.has(i) ? s : new e({ type: "nonoptional", innerType: s })
  )), Oe(t, G(t._zod.def, { shape: o }));
}
function ge(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue !== !0)
      return !0;
  return !1;
}
function Ci(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue === !1)
      return !0;
  return !1;
}
function Me(e, t) {
  return t.map((n) => {
    var r;
    return (r = n).path ?? (r.path = []), n.path.unshift(e), n;
  });
}
function Je(e) {
  return typeof e == "string" ? e : e?.message;
}
function nr(e) {
  const t = [];
  for (const n of e ?? []) {
    const r = n._zod.def;
    if (!/_(length|size)$|_equals$/.test(r.check))
      break;
    const o = r.maximum ?? r.length ?? r.size;
    o >= 0 && t.push([o, n]);
  }
  return t;
}
function on(e, t, n) {
  var r;
  for (let o = t; o < e.length; o++)
    (r = e[o]).schema ?? (r.schema = n);
}
function Se(e, t, n) {
  var r;
  const o = e.inst?._zod?.traits;
  o?.has("$ZodType") && (o.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
  const s = e.schema !== e.inst ? e.schema?._zod.def?.error : void 0, i = e.message ? e.message : Je(e.inst?._zod.def?.error?.(e)) ?? Je(s?.(e)) ?? Je(t?.error?.(e)) ?? Je(n.customError?.(e)) ?? Je(n.localeError?.(e)) ?? "Invalid input", a = {};
  for (const u of Object.keys(e))
    u === "inst" || u === "schema" || u === "continue" || u === "input" || u === "__proto__" || (a[u] = e[u]);
  return a.path ?? (a.path = []), a.message = i, t?.reportInput && (a.input = e.input), a;
}
const Oi = /[\uD800-\uDBFF]/;
function zn(e) {
  const t = e.length;
  if (!Oi.test(e))
    return t;
  let n = t;
  for (let r = 0; r < t - 1; r++)
    (e.charCodeAt(r) & 64512) === 55296 && (e.charCodeAt(r + 1) & 64512) === 56320 && (n--, r++);
  return n;
}
function En(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function $i(e) {
  const t = typeof e;
  switch (t) {
    case "number":
      return Number.isNaN(e) ? "nan" : "number";
    case "object": {
      if (e === null)
        return "null";
      if (Array.isArray(e))
        return "array";
      const n = e;
      if (n && Object.getPrototypeOf(n) !== Object.prototype && "constructor" in n && n.constructor)
        return n.constructor.name;
    }
  }
  return t;
}
function et(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
function Ni(e, t) {
  for (const n in t) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.get ? Object.defineProperty(e, n, { ...r, enumerable: !1 }) : Ti(e, n, r.value);
  }
}
function ke(e, t, n, r = !0) {
  return Object.defineProperty(e, t, { configurable: !0, writable: !0, enumerable: r, value: n }), n;
}
function bo(e, t, n) {
  return ke(e, t, n, !1);
}
function wo(e, t) {
  for (const n in e) {
    const r = e[n];
    Object.defineProperty(t, n, {
      configurable: !0,
      enumerable: !0,
      get() {
        return ke(this, n, r(this));
      },
      set(o) {
        ke(this, n, o);
      }
    });
  }
  return t;
}
function Ti(e, t, n) {
  Object.defineProperty(e, t, {
    configurable: !0,
    get() {
      return this == null ? n : ke(this, t, n.bind(this));
    },
    set(r) {
      ke(this, t, r);
    }
  });
}
function Ai(e, t) {
  const n = Object.getPrototypeOf(e);
  return t in n ? void 0 : n;
}
let Bt, be = !1;
const Ii = {
  configurable: !0,
  get() {
    be = !0;
  }
};
function k(e, t, n) {
  const r = Object.getPrototypeOf(e._zod);
  if (t in r && Bt !== e._zod) {
    Bt = void 0;
    return;
  }
  Bt = e._zod, Object.defineProperty(r, t, {
    configurable: !0,
    get() {
      Object.defineProperty(this, t, Ii);
      const o = be;
      be = !1;
      try {
        const s = n(this);
        return be ? delete this[t] : Object.defineProperty(this, t, { configurable: !0, writable: !0, value: s }), be = be || o, s;
      } catch (s) {
        throw delete this[t], be = be || o, s;
      }
    },
    set(o) {
      Object.defineProperty(this, t, { configurable: !0, writable: !0, value: o });
    }
  });
}
function Ri(e, t, n, r) {
  const o = Ai(e, t);
  o && Object.defineProperty(o, t, {
    configurable: !0,
    get() {
      const s = { configurable: !0, writable: !0, enumerable: r, value: void 0 };
      return Object.defineProperty(this, t, s), s.value = n(this), Object.defineProperty(this, t, s), s.value;
    },
    set(s) {
      Object.defineProperty(this, t, { configurable: !0, writable: !0, enumerable: r, value: s });
    }
  });
}
const Mi = "~constantCatch";
function Ui(e) {
  const t = () => e;
  return t[Mi] = !0, t;
}
var rr;
const Wt = { value: void 0, enumerable: !1 };
let or = "captureStackTrace" in Error ? Error : null;
function Zi(e) {
  const t = or;
  if (t) {
    const n = t.stackTraceLimit;
    if (typeof n == "number") {
      try {
        t.stackTraceLimit = 0;
      } catch {
        return or = null, new e();
      }
      try {
        return new e();
      } finally {
        t.stackTraceLimit = n;
      }
    }
  }
  return new e();
}
function p(e, t, n, r) {
  const o = {};
  function s(h) {
    this.def = h, this.constr = f, this.traits = /* @__PURE__ */ new Set();
  }
  s.prototype = o;
  const i = n, a = i && /* @__PURE__ */ new WeakSet();
  function u(h, m) {
    if (h._zod) {
      if (h._zod.traits.has(e))
        return;
    } else {
      Wt.value = new s(m);
      try {
        Object.defineProperty(h, "_zod", Wt);
      } finally {
        Wt.value = void 0;
      }
    }
    if (h._zod.traits.add(e), t(h, m), a) {
      const y = Object.getPrototypeOf(h), v = h._zod.constr.prototype;
      let S = y;
      for (; S && S !== v; )
        S = Object.getPrototypeOf(S);
      const B = S ?? y;
      a.has(B) || (a.add(B), Ni(B, i));
    }
    const g = f.prototype;
    for (const y in g)
      Object.prototype.hasOwnProperty.call(g, y) && (y in h || (h[y] = g[y].bind(h)));
  }
  const c = r?.Parent ?? Object;
  class d extends c {
  }
  Object.defineProperty(d, "name", { value: e });
  function f(h) {
    const m = r?.Parent ? Zi(d) : this;
    u(m, h);
    const g = m._zod.deferred;
    if (g) {
      for (const v of g)
        v();
      m._zod.deferred = void 0;
    }
    const y = globalThis.__zod_globalConfig?.postProcessor;
    return y && y(m), m;
  }
  return Object.defineProperty(f, "init", { value: u }), Object.defineProperty(f, Symbol.hasInstance, {
    value: (h) => r?.Parent && h instanceof r.Parent ? !0 : h?._zod?.traits?.has(e)
  }), Object.defineProperty(f, "name", { value: e }), f;
}
class Te extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class So extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
(rr = globalThis).__zod_globalConfig ?? (rr.__zod_globalConfig = {});
const ae = globalThis.__zod_globalConfig;
function he(e) {
  return e && Object.assign(ae, e), ae;
}
function Di() {
  const e = this._zod;
  return e.message ?? (e.message = JSON.stringify(e.def, rn, 2)), e.message;
}
function Fi(e) {
  this._zod.message = e;
}
const ji = {
  get: Di,
  set: Fi,
  enumerable: !0,
  configurable: !0
}, Ht = { value: void 0, enumerable: !1 }, sr = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), Li = (e, t) => {
  e.name = "$ZodError", Ht.value = t, Object.defineProperty(e, "issues", Ht), Ht.value = void 0, Object.defineProperty(e, "message", ji);
  const n = Object.getPrototypeOf(e);
  sr.has(n) || (sr.add(n), Object.defineProperty(n, "toString", {
    configurable: !0,
    enumerable: !1,
    get() {
      const r = () => this.message;
      return Object.defineProperty(this, "toString", { value: r, configurable: !0, writable: !0 }), r;
    },
    set(r) {
      Object.defineProperty(this, "toString", { value: r, configurable: !0, writable: !0 });
    }
  }));
}, xi = p("$ZodError", Li);
function Bi(e, t, n) {
  return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, { value: n(), writable: !0, enumerable: !0, configurable: !0 }) : e[t] = n()), e[t];
}
function Wi(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? Bi(n, o.path[0], () => []).push(t(o)) : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function Hi(e, t = (n) => n.message) {
  const n = { _errors: [] }, r = (o, s = []) => {
    for (const i of o.issues)
      if (i.code === "invalid_union" && i.errors.length)
        i.errors.map((a) => r({ issues: a }, [...s, ...i.path]));
      else if (i.code === "invalid_key")
        r({ issues: i.issues }, [...s, ...i.path]);
      else if (i.code === "invalid_element")
        r({ issues: i.issues }, [...s, ...i.path]);
      else {
        const a = [...s, ...i.path];
        if (a.length === 0)
          n._errors.push(t(i));
        else {
          let u = n, c = 0;
          for (; c < a.length; ) {
            const d = a[c], f = c === a.length - 1;
            if (d === "_errors") {
              f && u._errors.push(t(i)), c++;
              continue;
            }
            Object.prototype.hasOwnProperty.call(u, d) || Object.defineProperty(u, d, {
              value: { _errors: [] },
              enumerable: !0,
              writable: !0,
              configurable: !0
            });
            const h = u[d];
            f && h._errors.push(t(i)), u = h, c++;
          }
        }
      }
  };
  return r(e), n;
}
function Ut(e, t) {
  return { callee: t?.callee ?? e, Err: t?.Err };
}
const Cn = (e) => {
  const t = (n, r, o, s) => {
    const i = o ? { ...o, async: !1 } : { async: !1 }, a = n._zod.run({ value: r, issues: [] }, i);
    if (a instanceof Promise)
      throw new Te();
    if (a.issues.length) {
      const u = new (s?.Err ?? e)(a.issues.map((c) => Se(c, i, he())));
      throw mo(u, s?.callee ?? t), u;
    }
    return a.value;
  };
  return t;
}, On = (e) => {
  const t = async (n, r, o, s) => {
    const i = o ? { ...o, async: !0 } : { async: !0 };
    let a = n._zod.run({ value: r, issues: [] }, i);
    if (a instanceof Promise && (a = await a), a.issues.length) {
      const u = new (s?.Err ?? e)(a.issues.map((c) => Se(c, i, he())));
      throw mo(u, s?.callee ?? t), u;
    }
    return a.value;
  };
  return t;
}, $n = (e) => (t, n, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, o);
  if (s instanceof Promise)
    throw new Te();
  return s.issues.length ? ko(e, s.issues, o) : { success: !0, data: s.value };
};
function ko(e, t, n) {
  let r;
  return {
    success: !1,
    get error() {
      return r || (r = new e(t.map((o) => Se(o, n, he()))), t = void 0, n = void 0), r;
    },
    set error(o) {
      r = o, t = void 0, n = void 0;
    }
  };
}
const Nn = (e) => async (t, n, r) => {
  const o = r ? { ...r, async: !0 } : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, o);
  return s instanceof Promise && (s = await s), s.issues.length ? ko(e, s.issues, o) : { success: !0, data: s.value };
}, Vi = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Ji = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), Ki = ((e, t, n) => {
  const r = e._zod.bag.validator;
  if (r !== void 0) {
    if (r(t) !== Vi)
      return !0;
    if (r.definite === !0 && n === void 0)
      return !1;
  }
  return Yi(e, t, n);
});
function Yi(e, t, n) {
  const r = n ? { ...n, async: !1, abortEarly: !0 } : { async: !1, abortEarly: !0 }, o = e._zod.bag.fallbackRun;
  let s;
  if (o ? (r[Ji] = !0, s = o({ value: t, issues: [] }, r)) : s = e._zod.run({ value: t, issues: [] }, r), s instanceof Promise)
    throw new Te();
  return s.issues.length === 0;
}
const Gi = async (e, t, n) => {
  const r = n ? { ...n, async: !0, abortEarly: !0 } : { async: !0, abortEarly: !0 };
  let o = e._zod.run({ value: t, issues: [] }, r);
  return o instanceof Promise && (o = await o), o.issues.length === 0;
}, qi = (e) => {
  const t = Cn(e), n = (r, o, s, i) => {
    const a = s ? { ...s, direction: "backward" } : { direction: "backward" };
    return t(r, o, a, Ut(n, i));
  };
  return n;
}, Xi = (e) => {
  const t = Cn(e), n = (r, o, s, i) => t(r, o, s, Ut(n, i));
  return n;
}, Qi = (e) => {
  const t = On(e), n = async (r, o, s, i) => {
    const a = s ? { ...s, direction: "backward" } : { direction: "backward" };
    return await t(r, o, a, Ut(n, i));
  };
  return n;
}, ea = (e) => {
  const t = On(e), n = async (r, o, s, i) => await t(r, o, s, Ut(n, i));
  return n;
}, ta = (e) => (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return $n(e)(t, n, o);
}, na = (e) => (t, n, r) => $n(e)(t, n, r), ra = (e) => async (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return Nn(e)(t, n, o);
}, oa = (e) => async (t, n, r) => Nn(e)(t, n, r), sa = /^[cC][0-9a-z]{6,}$/, ia = /^[0-9a-z]+$/, aa = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, ca = /^[0-9a-vA-V]{20}$/, ua = /^[A-Za-z0-9]{27}$/, la = /^[a-zA-Z0-9_-]{21}$/;
function da(e) {
  return new RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
const fa = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, ha = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, ir = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, pa = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, ma = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function ga() {
  return new RegExp(ma, "u");
}
const va = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, ya = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, _a = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, ba = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, wa = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Sa = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, ka = /^https?$/, Pa = /^\+[1-9]\d{6,14}$/, Po = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function za(e) {
  return new RegExp(`^${e}$`);
}
const Ea = /* @__PURE__ */ za(Po);
function sn(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Ca(e) {
  return new RegExp(`^${sn(e)}$`);
}
function Oa(e) {
  const t = ["Z"];
  e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const n = `${sn({ precision: e.precision, seconds: !0 })}(?:${t.join("|")})`, r = e.local ? `${n}|${sn({ precision: e.precision })}` : n;
  return new RegExp(`^${Po}T(?:${r})$`);
}
const $a = /^[\s\S]{0,}$/, Na = /^-?\d+$/, Tn = /^-?\d+(?:\.\d+)?$/, Ta = /^(?:true|false)$/i, Aa = /^[^A-Z]*$/, Ia = /^[^a-z]*$/, V = /* @__PURE__ */ p("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), An = (e) => {
  const t = e.value;
  return !fi(t) && t.length !== void 0;
}, St = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, zo = /* @__PURE__ */ p("$ZodCheckLessThan", (e, t) => {
  V.init(e, t);
  const n = St[typeof t.value];
  e._zod.check = (r) => {
    (t.inclusive ? r.value <= t.value : r.value < t.value) || r.issues.push({
      origin: St[typeof r.value] ?? n,
      code: "too_big",
      maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), Eo = /* @__PURE__ */ p("$ZodCheckGreaterThan", (e, t) => {
  V.init(e, t);
  const n = St[typeof t.value];
  e._zod.check = (r) => {
    (t.inclusive ? r.value >= t.value : r.value > t.value) || r.issues.push({
      origin: St[typeof r.value] ?? n,
      code: "too_small",
      minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
      input: r.value,
      inclusive: t.inclusive,
      inst: e,
      continue: !t.abort
    });
  };
}), Ra = /* @__PURE__ */ p("$ZodCheckMultipleOf", (e, t) => {
  V.init(e, t), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? (
      // `value % 0n` throws, and nothing is a multiple of zero — the number branch already fails this way via NaN
      t.value !== BigInt(0) && n.value % t.value === BigInt(0)
    ) : hi(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ma = /* @__PURE__ */ p("$ZodCheckNumberFormat", (e, t) => {
  V.init(e, t), t.format = t.format || "float64";
  const n = t.format?.includes("int"), r = n ? "int" : "number", [o, s] = yo[t.format];
  e._zod.check = (i) => {
    const a = i.value;
    if (n) {
      if (!Number.isInteger(a)) {
        i.issues.push({
          expected: r,
          format: t.format,
          code: "invalid_type",
          continue: !1,
          input: a,
          inst: e
        });
        return;
      }
      if (!Number.isSafeInteger(a)) {
        a > 0 ? i.issues.push({
          input: a,
          code: "too_big",
          maximum: Number.MAX_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !t.abort
        }) : i.issues.push({
          input: a,
          code: "too_small",
          minimum: Number.MIN_SAFE_INTEGER,
          note: "Integers must be within the safe integer range.",
          inst: e,
          origin: r,
          inclusive: !0,
          continue: !t.abort
        });
        return;
      }
    }
    a < o && i.issues.push({
      origin: "number",
      input: a,
      code: "too_small",
      minimum: o,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    }), a > s && i.issues.push({
      origin: "number",
      input: a,
      code: "too_big",
      maximum: s,
      inclusive: !0,
      inst: e,
      continue: !t.abort
    });
  };
}), Ua = /* @__PURE__ */ p("$ZodCheckMaxLength", (e, t) => {
  var n;
  V.init(e, t), (n = e._zod.def).when ?? (n.when = An), e._zod.check = (r) => {
    const o = r.value, s = o.length;
    if ((typeof o == "string" && s > t.maximum ? zn(o) : s) <= t.maximum)
      return;
    const a = En(o);
    r.issues.push({
      origin: a,
      code: "too_big",
      maximum: t.maximum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), Za = /* @__PURE__ */ p("$ZodCheckMinLength", (e, t) => {
  var n;
  V.init(e, t), (n = e._zod.def).when ?? (n.when = An), e._zod.check = (r) => {
    const o = r.value, s = o.length;
    if ((typeof o == "string" && s >= t.minimum && s < t.minimum * 2 ? zn(o) : s) >= t.minimum)
      return;
    const a = En(o);
    r.issues.push({
      origin: a,
      code: "too_small",
      minimum: t.minimum,
      inclusive: !0,
      input: o,
      inst: e,
      continue: !t.abort
    });
  };
}), Da = /* @__PURE__ */ p("$ZodCheckLengthEquals", (e, t) => {
  var n;
  V.init(e, t), (n = e._zod.def).when ?? (n.when = An), e._zod.check = (r) => {
    const o = r.value, s = o.length, i = typeof o == "string" && s >= t.length && s <= t.length * 2 ? zn(o) : s;
    if (i === t.length)
      return;
    const a = En(o), u = i > t.length;
    r.issues.push({
      origin: a,
      ...u ? { code: "too_big", maximum: t.length } : { code: "too_small", minimum: t.length },
      inclusive: !0,
      exact: !0,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Zt = /* @__PURE__ */ p("$ZodCheckStringFormat", (e, t) => {
  var n, r;
  V.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (o) => {
    t.pattern.lastIndex = 0, !t.pattern.test(o.value) && o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: t.format,
      input: o.value,
      ...t.pattern ? { pattern: t.pattern.toString() } : {},
      inst: e,
      continue: !t.abort
    });
  }) : (r = e._zod).check ?? (r.check = () => {
  });
}), Fa = /* @__PURE__ */ p("$ZodCheckRegex", (e, t) => {
  Zt.init(e, t), e._zod.check = (n) => {
    t.pattern.lastIndex = 0, !t.pattern.test(n.value) && n.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "regex",
      input: n.value,
      pattern: t.pattern.toString(),
      inst: e,
      continue: !t.abort
    });
  };
}), ja = /* @__PURE__ */ p("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = Aa), Zt.init(e, t);
}), La = /* @__PURE__ */ p("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = Ia), Zt.init(e, t);
}), xa = /* @__PURE__ */ p("$ZodCheckIncludes", (e, t) => {
  V.init(e, t);
  const n = Rt(t.includes), r = new RegExp(typeof t.position == "number" ? `^.{${t.position},}${n}` : n);
  t.pattern = r, e._zod.check = (o) => {
    o.value.includes(t.includes, t.position) || o.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "includes",
      includes: t.includes,
      input: o.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ba = /* @__PURE__ */ p("$ZodCheckStartsWith", (e, t) => {
  V.init(e, t);
  const n = new RegExp(`^${Rt(t.prefix)}.*`);
  t.pattern ?? (t.pattern = n), e._zod.check = (r) => {
    r.value.startsWith(t.prefix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "starts_with",
      prefix: t.prefix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Wa = /* @__PURE__ */ p("$ZodCheckEndsWith", (e, t) => {
  V.init(e, t);
  const n = new RegExp(`.*${Rt(t.suffix)}$`);
  t.pattern ?? (t.pattern = n), e._zod.check = (r) => {
    r.value.endsWith(t.suffix) || r.issues.push({
      origin: "string",
      code: "invalid_format",
      format: "ends_with",
      suffix: t.suffix,
      input: r.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ha = /* @__PURE__ */ p("$ZodCheckOverwrite", (e, t) => {
  V.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Va {
  constructor(t = [], n = {}) {
    this.content = [], this.indent = 0, this.args = t, this.closed = n;
  }
  // the compiler catches a child's throw and keeps writing into this doc, so the indent has to unwind with it
  indented(t) {
    this.indent += 1;
    try {
      t(this);
    } finally {
      this.indent -= 1;
    }
  }
  write(t) {
    if (typeof t == "function") {
      t(this, { execution: "sync" }), t(this, { execution: "async" });
      return;
    }
    const r = t.split(`
`).filter((i) => i), o = Math.min(...r.map((i) => i.length - i.trimStart().length)), s = r.map((i) => i.slice(o)).map((i) => " ".repeat(this.indent * 2) + i);
    for (const i of s)
      this.content.push(i);
  }
  compile() {
    const t = Function, n = this?.content ?? [""];
    return new t(...Object.keys(this.closed), `return function (${this.args.join(", ")}) {
${n.join(`
`)}
};`)(...Object.values(this.closed));
  }
}
const Ja = {
  major: 4,
  minor: 6,
  patch: 7
}, A = /* @__PURE__ */ p("$ZodType", (e, t) => {
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Ja;
  const r = e._zod.def.checks, o = e._zod.traits.has("$ZodCheck") ? [e, ...r ?? []] : r?.length ? [...r] : [];
  for (const s of o)
    for (const i of s._zod.onattach)
      i(e);
  if (o.length === 0)
    (n = e._zod).deferred ?? (n.deferred = []), e._zod.deferred?.push(() => {
      e._zod.run = e._zod.parse;
    });
  else {
    const s = (a, u, c) => {
      if (a.memo)
        return a;
      let d = ge(a), f;
      for (const h of u) {
        if (h._zod.def.when) {
          if (Ci(a) || !h._zod.def.when(a))
            continue;
        } else if (d)
          continue;
        const m = a.issues.length, g = h._zod.check(a);
        if (g instanceof Promise && c?.async === !1)
          throw new Te();
        if (f || g instanceof Promise)
          f = (f ?? Promise.resolve()).then(async () => {
            await g, a.issues.length !== m && (on(a.issues, m, e), d || (d = ge(a, m)));
          });
        else {
          if (a.issues.length === m)
            continue;
          on(a.issues, m, e), d || (d = ge(a, m));
        }
      }
      return f ? f.then(() => a) : a;
    }, i = (a, u, c) => {
      if (ge(a))
        return a.aborted = !0, a;
      const d = s(u, o, c);
      if (d instanceof Promise) {
        if (c.async === !1)
          throw new Te();
        return d.then((f) => e._zod.parse(f, c));
      }
      return e._zod.parse(d, c);
    };
    e._zod.run = (a, u) => {
      if (u.skipChecks)
        return e._zod.parse(a, u);
      if (u.direction === "backward") {
        const d = e._zod.parse({ value: a.value, issues: [] }, { ...u, skipChecks: !0 });
        return d instanceof Promise ? d.then((f) => i(f, a, u)) : i(d, a, u);
      }
      const c = e._zod.parse(a, u);
      if (c instanceof Promise) {
        if (u.async === !1)
          throw new Te();
        return c.then((d) => s(d, o, u));
      }
      return s(c, o, u);
    };
  }
}, {
  // Wrappers extend this by installing a richer factory over it; reading it eagerly would defeat the laziness.
  get "~standard"() {
    return bo(this, "~standard", Oo(this));
  },
  set "~standard"(e) {
    ke(this, "~standard", e);
  }
}), Co = (e, t) => e.issues.length ? { issues: e.issues.map((n) => Se(n, t, he())) } : { value: e.value };
async function Ka(e, t) {
  const n = { async: !0 };
  return Co(await e._zod.run({ value: t, issues: [] }, n), n);
}
function Oo(e) {
  return {
    validate: (t) => {
      const n = { async: !1 };
      try {
        const r = e._zod.run({ value: t, issues: [] }, n);
        if (!(r instanceof Promise))
          return Co(r, n);
      } catch {
      }
      return Ka(e, t);
    },
    vendor: "zod",
    version: 1
  };
}
const In = /* @__PURE__ */ p("$ZodString", (e, t) => {
  A.init(e, t), e._zod.pattern = t.pattern ?? $a, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = String(n.value);
      } catch {
      }
    return typeof n.value == "string" || n.issues.push({
      expected: "string",
      code: "invalid_type",
      input: n.value,
      inst: e
    }), n;
  };
}), O = /* @__PURE__ */ p("$ZodStringFormat", (e, t) => {
  Zt.init(e, t), In.init(e, t);
}), Ya = /* @__PURE__ */ p("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = ha), O.init(e, t);
}), Ga = /* @__PURE__ */ p("$ZodUUID", (e, t) => {
  if (t.version) {
    const r = {
      v1: 1,
      v2: 2,
      v3: 3,
      v4: 4,
      v5: 5,
      v6: 6,
      v7: 7,
      v8: 8
    }[t.version];
    if (r === void 0)
      throw new Error(`Invalid UUID version: "${t.version}"`);
    t.pattern ?? (t.pattern = ir(r));
  } else
    t.pattern ?? (t.pattern = ir());
  O.init(e, t);
}), qa = /* @__PURE__ */ p("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = pa), O.init(e, t);
}), $o = 1, kt = 2;
function No(e) {
  try {
    return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
  } catch {
    return !1;
  }
}
function Xa(e, t) {
  return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? No(e) || kt : Qa(e, t);
}
function Qa(e, t) {
  if (!t.normalize && t.protocol?.source === ka.source && !/^https?:\/\//i.test(e))
    return $o;
  try {
    if (typeof URL < "u") {
      const n = URL;
      if (typeof n.parse == "function")
        return n.parse(e) ?? kt;
    }
    return new URL(e);
  } catch {
    return kt;
  }
}
const ec = /[\t\n\r]/g;
function ar(e) {
  return e.replace(ec, "");
}
function tc(e, t) {
  return t.lastIndex = 0, t.test(e.hostname);
}
function nc(e, t) {
  return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
const rc = /* @__PURE__ */ p("$ZodURL", (e, t) => {
  O.init(e, t), e._zod.check = (n) => {
    try {
      const r = n.value.trim(), o = Xa(r, t);
      if (o === $o) {
        n.issues.push({
          code: "invalid_format",
          format: "url",
          note: "Invalid URL format",
          input: n.value,
          inst: e,
          continue: !t.abort
        });
        return;
      }
      if (o === kt) {
        n.issues.push({
          code: "invalid_format",
          format: "url",
          input: n.value,
          inst: e,
          continue: !t.abort
        });
        return;
      }
      if (o === !0) {
        n.value = ar(r);
        return;
      }
      t.hostname && !tc(o, t.hostname) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), t.protocol && !nc(o, t.protocol) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), n.value = t.normalize ? o.href : ar(r);
      return;
    } catch {
      n.issues.push({
        code: "invalid_format",
        format: "url",
        input: n.value,
        inst: e,
        continue: !t.abort
      });
    }
  };
}), oc = /* @__PURE__ */ p("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = ga()), O.init(e, t);
}), sc = /* @__PURE__ */ p("$ZodNanoID", (e, t) => {
  if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1))
    throw new Error(`Invalid nanoid length: ${t.length}`);
  t.pattern ?? (t.pattern = t.length === void 0 ? la : da(t.length)), O.init(e, t);
}), ic = /* @__PURE__ */ p("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = sa), O.init(e, t);
}), ac = /* @__PURE__ */ p("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = ia), O.init(e, t);
}), cc = /* @__PURE__ */ p("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = aa), O.init(e, t);
}), uc = /* @__PURE__ */ p("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = ca), O.init(e, t);
}), lc = /* @__PURE__ */ p("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = ua), O.init(e, t);
}), dc = /* @__PURE__ */ p("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Oa(t)), O.init(e, t);
}), fc = /* @__PURE__ */ p("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = Ea), O.init(e, t);
}), hc = /* @__PURE__ */ p("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Ca(t)), O.init(e, t);
}), pc = /* @__PURE__ */ p("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = fa), O.init(e, t);
}), mc = /* @__PURE__ */ p("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = va), O.init(e, t);
}), gc = /^[0-9a-fA-F:.]+$/;
function To(e) {
  return gc.test(e) ? No(`http://[${e}]`) : !1;
}
const vc = /* @__PURE__ */ p("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = ya), O.init(e, t), e._zod.check = (n) => {
    To(n.value) || n.issues.push({
      code: "invalid_format",
      format: "ipv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), yc = /* @__PURE__ */ p("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = _a), O.init(e, t);
});
function _c(e) {
  const t = e.split("/");
  if (t.length !== 2)
    return !1;
  const [n, r] = t;
  if (!r)
    return !1;
  const o = Number(r);
  return `${o}` !== r || o < 0 || o > 128 ? !1 : To(n);
}
const bc = /* @__PURE__ */ p("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = ba), O.init(e, t), e._zod.check = (n) => {
    _c(n.value) || n.issues.push({
      code: "invalid_format",
      format: "cidrv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function Ao(e) {
  if (e === "")
    return !0;
  if (/\s/.test(e) || e.length % 4 !== 0)
    return !1;
  try {
    return atob(e), !0;
  } catch {
    return !1;
  }
}
const Io = /^[0-9a-zA-Z+/]*={0,2}$/, wc = /* @__PURE__ */ p("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Io), O.init(e, t), e._zod.check = (n) => {
    Ao(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Rn = /^[A-Za-z0-9_-]*$/;
function Sc(e) {
  if (!Rn.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return Ao(n);
}
const kc = /* @__PURE__ */ p("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = Rn), O.init(e, t), e._zod.check = (n) => {
    Sc(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Pc = /* @__PURE__ */ p("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Pa), O.init(e, t);
});
function zc(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3)
      return !1;
    const [r] = n;
    if (!r)
      return !1;
    const o = JSON.parse(atob(r));
    return !("typ" in o && o?.typ !== "JWT" || !o.alg || t && (!("alg" in o) || o.alg !== t));
  } catch {
    return !1;
  }
}
const Ec = /* @__PURE__ */ p("$ZodJWT", (e, t) => {
  O.init(e, t), e._zod.check = (n) => {
    zc(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Ro = /* @__PURE__ */ p("$ZodNumber", (e, t) => {
  A.init(e, t), e._zod.pattern = Tn, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = Number(n.value);
      } catch {
      }
    const o = n.value;
    if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o))
      return n;
    const s = typeof o == "number" ? Number.isNaN(o) ? "NaN" : Number.isFinite(o) ? void 0 : String(o) : void 0;
    return n.issues.push({
      expected: "number",
      code: "invalid_type",
      input: o,
      inst: e,
      ...s ? { received: s } : {}
    }), n;
  };
}), Cc = /* @__PURE__ */ p("$ZodNumberFormat", (e, t) => {
  Ma.init(e, t), Ro.init(e, t);
}), Oc = /* @__PURE__ */ p("$ZodBoolean", (e, t) => {
  A.init(e, t), e._zod.pattern = Ta, e._zod.parse = (n, r) => {
    if (t.coerce)
      try {
        n.value = !!n.value;
      } catch {
      }
    const o = n.value;
    return typeof o == "boolean" || n.issues.push({
      expected: "boolean",
      code: "invalid_type",
      input: o,
      inst: e
    }), n;
  };
}), $c = /* @__PURE__ */ p("$ZodUnknown", (e, t) => {
  A.init(e, t), e._zod.parse = (n) => n;
}), Nc = /* @__PURE__ */ p("$ZodNever", (e, t) => {
  A.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function Tc(e, t) {
  const n = nr(e._zod.def.checks);
  if (!n.length)
    return;
  const r = Math.min(...n.map((s) => s[0])), o = e._zod.parse;
  e._zod.parse = (s, i) => {
    const a = t(s.value);
    if (a > r && !i?.skipChecks && i?.direction !== "backward") {
      for (const [u, c] of nr(e._zod.def.checks))
        if (a > u && c._zod.def.when(s)) {
          const d = s.issues.length;
          return c._zod.check(s), s.issues[d].continue = !1, on(s.issues, d, e), s;
        }
    }
    return o(s, i);
  };
}
const Ac = (e) => Array.isArray(e) ? e.length : -1;
function cr(e, t, n) {
  e.issues.length && t.issues.push(...Me(n, e.issues)), t.value[n] = e.value;
}
const Ic = /* @__PURE__ */ p("$ZodArray", (e, t) => {
  A.init(e, t);
  const n = ae.memoizer;
  n?.attach(e), e._zod.parse = (r, o) => {
    const s = r.value;
    if (!Array.isArray(s))
      return r.issues.push({
        expected: "array",
        code: "invalid_type",
        input: s,
        inst: e
      }), r;
    r.value = n ? n.alloc(e, r, Array(s.length), o) : Array(s.length);
    const i = [], a = o?.abortEarly;
    for (let u = 0; u < s.length; u++) {
      const c = s[u], d = t.element._zod.run({
        value: c,
        issues: []
      }, o);
      if (d instanceof Promise)
        i.push(d.then((f) => cr(f, r, u)));
      else if (cr(d, r, u), a && d.issues.length !== 0 && ge(d))
        break;
    }
    return i.length ? Promise.all(i).then(() => r) : r;
  }, Tc(e, Ac);
});
function Pt(e, t, n, r, o, s) {
  const i = n in r, a = s === "optional";
  if (!(!i && a && o === "optional")) {
    if (e.issues.length) {
      if (o !== void 0 && a && !i)
        return;
      t.issues.push(...Me(n, e.issues));
    }
    if (!i && o === void 0) {
      e.issues.length || t.issues.push({
        code: "invalid_type",
        expected: "nonoptional",
        input: void 0,
        path: [n]
      });
      return;
    }
    e.value === void 0 ? (i || o === "defaulted" && !a) && (t.value[n] = void 0) : t.value[n] = e.value;
  }
}
const Rc = [];
function Mo(e) {
  const t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : Rc, o = r.length ? [...t, ...r] : t;
  for (const i of o)
    if (!e.shape?.[i]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${String(i)}": expected a Zod schema`);
  const s = _i(e.shape);
  return {
    ...e,
    allKeys: o,
    symbolKeys: r,
    // string-only: handleCatchall matches it against `for...in`, which never yields a symbol
    keySet: new Set(t),
    numKeys: t.length,
    optionalKeys: new Set(s)
  };
}
function Uo(e, t, n, r, o, s, i) {
  const a = [], u = o.keySet, c = o.catchall._zod, d = c.def.type, f = c.optin, h = c.optout;
  let m = 0;
  for (const g in t) {
    if (i && n.issues.length !== m) {
      if (ge(n, m))
        break;
      m = n.issues.length;
    }
    if (u.has(g))
      continue;
    if (g === "__proto__") {
      d === "never" && a.push(g);
      continue;
    }
    if (d === "never") {
      a.push(g);
      continue;
    }
    const y = c.run({ value: t[g], issues: [] }, r);
    y instanceof Promise ? e.push(y.then((v) => Pt(v, n, g, t, f, h))) : Pt(y, n, g, t, f, h);
  }
  return a.length && n.issues.push({
    code: "unrecognized_keys",
    keys: a,
    input: t,
    inst: s,
    // Describes the shape of the input, not the validity of the parsed value, so it never aborts. The parse still fails; the schema's own checks just get to run first, and an enclosing intersection can reconcile the key against a sibling operand.
    continue: !0
  }), e.length ? Promise.all(e).then(() => n) : n;
}
const Mc = /* @__PURE__ */ p("$ZodObject", (e, t) => {
  A.init(e, t);
  const n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
  if (r) {
    const c = () => {
      const d = { ...r };
      return Object.defineProperty(t, "shape", { value: d }), c.raw = d, d;
    };
    c.raw = r, Object.defineProperty(t, "shape", { get: c });
  }
  const o = kn(() => Mo(t));
  k(e, "propValues", (c) => {
    const d = c.def.shape, f = {};
    for (const h in d) {
      const m = d[h]._zod;
      if (m.values) {
        Object.prototype.hasOwnProperty.call(f, h) || Ce(f, h, /* @__PURE__ */ new Set());
        for (const g of m.values)
          f[h].add(g);
        m.optin !== void 0 && f[h].add(void 0);
      }
    }
    return f;
  });
  const s = wt, i = t.catchall;
  let a;
  const u = ae.memoizer;
  u?.attach(e), e._zod.parse = (c, d) => {
    a ?? (a = o.value);
    const f = c.value;
    if (!s(f))
      return c.issues.push({
        expected: "object",
        code: "invalid_type",
        input: f,
        inst: e
      }), c;
    c.value = u ? u.alloc(e, c, {}, d) : {};
    const h = [], m = a.shape, g = d?.abortEarly;
    let y = c.issues.length;
    for (const v of a.allKeys) {
      if (g && c.issues.length !== y) {
        if (ge(c, y))
          break;
        y = c.issues.length;
      }
      if (v === "__proto__")
        continue;
      const S = m[v], B = S._zod.optin, pe = S._zod.optout, D = S._zod.run({ value: f[v], issues: [] }, d);
      D instanceof Promise ? h.push(D.then((R) => Pt(R, c, v, f, B, pe))) : Pt(D, c, v, f, B, pe);
    }
    return i ? Uo(h, f, c, d, o.value, e, g === !0) : h.length ? Promise.all(h).then(() => c) : c;
  };
}), Uc = /* @__PURE__ */ p("$ZodObjectJIT", (e, t) => {
  Mc.init(e, t);
  const n = e._zod.parse, r = kn(() => Mo(t)), o = ae.memoizer, s = (m) => {
    const g = r.value, y = g.symbolKeys, v = new Va(["payload", "ctx"], { shape: m, inst: e, memo: o, syms: y }), S = (R) => `shape[${R}]._zod.run({ value: input[${R}], issues: [] }, ctx)`, B = (R, P) => `
          let ${R}_ab = false;
          for (let i = 0; i < ${R}.issues.length; i++) {
            const iss = ${R}.issues[i];
            iss.path = iss.path ? [${P}, ...iss.path] : [${P}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${R}_ab = true;
          }
          if (${R}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
    v.write("const input = payload.value;");
    const pe = /* @__PURE__ */ Object.create(null);
    let D = 0;
    for (const R of g.allKeys)
      pe[R] = `key_${D++}`;
    v.write(o ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
    for (const R of g.allKeys) {
      if (R === "__proto__")
        continue;
      const P = pe[R], ue = typeof R == "symbol" ? `syms[${y.indexOf(R)}]` : mi(R), jt = `${ue} in input`, Jn = m[R], Lt = Jn?._zod?.optin, Kn = Lt !== void 0, Os = Jn?._zod?.optout === "optional";
      if (v.write(`const ${P} = ${S(ue)};`), Kn && Os) {
        const $s = Lt === "optional" ? `${P}_present` : `${P}.value !== undefined || ${P}_present`;
        v.write(`
        const ${P}_present = ${jt};
        if (!${P}.issues.length || ${P}_present) {
          if (${P}.issues.length) {${B(P, ue)}
          }

          if (${$s}) {
            newResult[${ue}] = ${P}.value;
          }
        }

      `);
      } else Kn ? (v.write(`
        if (${P}.issues.length) {${B(P, ue)}
        }
      `), Lt === "defaulted" ? v.write(`newResult[${ue}] = ${P}.value;`) : v.write(`
        if (${P}.value !== undefined || ${jt}) {
          newResult[${ue}] = ${P}.value;
        }
      `)) : v.write(`
        const ${P}_present = ${jt};
        if (${P}.issues.length) {${B(P, ue)}
        }
        if (!${P}_present && !${P}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${ue}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${P}_present) {
          newResult[${ue}] = ${P}.value;
        }

      `);
    }
    return v.write("payload.value = newResult;"), v.write("return payload;"), v.compile();
  };
  let i;
  const a = wt, u = !ae.jitless, d = u && vi.value, f = t.catchall;
  let h;
  e._zod.parse = (m, g) => {
    h ?? (h = r.value);
    const y = m.value;
    return a(y) ? u && d && g?.async === !1 && g.jitless !== !0 ? (i || (i = s(t.shape)), m = i(m, g), f ? Uo([], y, m, g, h, e, g?.abortEarly === !0) : m) : n(m, g) : (m.issues.push({
      expected: "object",
      code: "invalid_type",
      input: y,
      inst: e
    }), m);
  };
});
function ur(e, t, n, r) {
  for (const s of e)
    if (s.issues.length === 0)
      return t.value = s.value, t;
  const o = e.filter((s) => !ge(s));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((s) => s.issues.map((i) => Se(i, r, he())))
  }), t);
}
const Zc = /* @__PURE__ */ p("$ZodUnion", (e, t) => {
  A.init(e, t), k(e, "optin", (r) => r.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : r.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0), k(e, "optout", (r) => r.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), k(e, "values", (r) => {
    if (r.def.options.every((o) => o._zod.values))
      return new Set(r.def.options.flatMap((o) => Array.from(o._zod.values)));
  }), k(e, "pattern", (r) => {
    if (r.def.options.every((o) => o._zod.pattern)) {
      const o = r.def.options.map((s) => s._zod.pattern);
      return new RegExp(`^(${o.map((s) => Pn(s.source)).join("|")})$`);
    }
  });
  const n = t.options.length === 1 ? t.options[0]._zod.run : null;
  e._zod.parse = (r, o) => {
    if (n)
      return n(r, o);
    let s = !1;
    const i = [];
    for (const a of t.options) {
      const u = a._zod.run({
        value: r.value,
        issues: []
      }, o);
      if (u instanceof Promise)
        i.push(u), s = !0;
      else {
        if (u.issues.length === 0)
          return u;
        i.push(u);
      }
    }
    return s ? Promise.all(i).then((a) => ur(a, r, e, o)) : ur(i, r, e, o);
  };
}), Dc = /* @__PURE__ */ p("$ZodIntersection", (e, t) => {
  A.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value, s = t.left._zod.run({ value: o, issues: [] }, r), i = t.right._zod.run({ value: o, issues: [] }, r);
    return s instanceof Promise || i instanceof Promise ? Promise.all([s, i]).then(([u, c]) => lr(n, u, c)) : lr(n, s, i);
  };
});
function an(e, t) {
  if (e === t)
    return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t)
    return { valid: !0, data: e };
  if (De(e) && De(t)) {
    const n = Object.keys(t), r = Object.keys(e).filter((s) => n.indexOf(s) !== -1), o = { ...e, ...t };
    Object.prototype.hasOwnProperty.call(o, "__proto__") && delete o.__proto__;
    for (const s of r) {
      if (s === "__proto__")
        continue;
      const i = an(e[s], t[s]);
      if (!i.valid)
        return {
          valid: !1,
          mergeErrorPath: [s, ...i.mergeErrorPath]
        };
      o[s] = i.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length)
      return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r], s = t[r], i = an(o, s);
      if (!i.valid)
        return {
          valid: !1,
          mergeErrorPath: [r, ...i.mergeErrorPath]
        };
      n.push(i.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function lr(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  let o;
  const s = /* @__PURE__ */ new Map(), i = (c, d) => {
    let f;
    if (c.code === "unrecognized_keys" && !c.path?.length)
      o ?? (o = c), f = c.keys;
    else if (c.code === "invalid_key" && c.origin === "record" && c.path?.length === 1) {
      const h = String(c.path[0]);
      s.has(h) || s.set(h, c), f = [h];
    } else
      return !1;
    for (const h of f)
      r.has(h) || r.set(h, {}), r.get(h)[d] = !0;
    return !0;
  };
  for (const c of t.issues)
    i(c, "l") || e.issues.push(c);
  for (const c of n.issues)
    i(c, "r") || e.issues.push(c);
  const a = [...r].filter(([, c]) => c.l && c.r).map(([c]) => c);
  if (a.length) {
    const c = o ? a.filter((d) => o.keys.includes(d)) : [];
    c.length && e.issues.push({ ...o, keys: c });
    for (const d of a)
      !c.includes(d) && s.has(d) && e.issues.push(s.get(d));
  }
  const u = an(t.value, n.value);
  if (!u.valid) {
    if (ge(e))
      return e;
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(u.mergeErrorPath)}`);
  }
  return e.value = u.data, e;
}
const Fc = /* @__PURE__ */ p("$ZodRecord", (e, t) => {
  A.init(e, t);
  const n = ae.memoizer;
  n?.attach(e), e._zod.parse = (r, o) => {
    const s = r.value;
    if (!De(s))
      return r.issues.push({
        expected: "record",
        code: "invalid_type",
        input: s,
        inst: e
      }), r;
    const i = [], a = t.keyType._zod.values;
    if (a && !t.partial) {
      r.value = n ? n.alloc(e, r, {}, o) : {};
      const u = /* @__PURE__ */ new Set();
      for (const d of a)
        if (typeof d == "string" || typeof d == "number" || typeof d == "symbol") {
          if (u.add(typeof d == "number" ? d.toString() : d), d === "__proto__")
            continue;
          const f = t.keyType._zod.run({ value: d, issues: [] }, o);
          if (f instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          if (f.issues.length) {
            r.issues.push({
              code: "invalid_key",
              origin: "record",
              issues: f.issues.map((g) => Se(g, o, he())),
              input: d,
              path: [d],
              inst: e
            });
            continue;
          }
          const h = f.value;
          if (h === "__proto__")
            continue;
          const m = t.valueType._zod.run({ value: s[d], issues: [] }, o);
          m instanceof Promise ? i.push(m.then((g) => {
            g.issues.length && r.issues.push(...Me(d, g.issues)), r.value[h] = g.value;
          })) : (m.issues.length && r.issues.push(...Me(d, m.issues)), r.value[h] = m.value);
        }
      let c;
      for (const d in s)
        if (!u.has(d))
          if (t.mode === "loose") {
            if (d === "__proto__")
              continue;
            r.value[d] = s[d];
          } else
            c = c ?? [], c.push(d);
      c && c.length > 0 && r.issues.push({
        code: "unrecognized_keys",
        input: s,
        inst: e,
        keys: c,
        continue: !0
      });
    } else {
      r.value = n ? n.alloc(e, r, {}, o) : {};
      let u;
      for (const c of Reflect.ownKeys(s)) {
        if (c === "__proto__" || !Object.prototype.propertyIsEnumerable.call(s, c))
          continue;
        let d = t.keyType._zod.run({ value: c, issues: [] }, o);
        if (d instanceof Promise)
          throw new Error("Async schemas not supported in object keys currently");
        if (typeof c == "string" && Tn.test(c) && d.issues.length) {
          const g = t.keyType._zod.run({ value: Number(c), issues: [] }, o);
          if (g instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          g.issues.length === 0 && (d = g);
        }
        if (d.issues.length) {
          t.mode === "loose" ? r.value[c] = s[c] : a ? (u = u ?? [], u.push(c)) : r.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: d.issues.map((g) => Se(g, o, he())),
            input: c,
            path: [c],
            inst: e
          });
          continue;
        }
        const h = d.value;
        if (h === "__proto__")
          continue;
        const m = t.valueType._zod.run({ value: s[c], issues: [] }, o);
        m instanceof Promise ? i.push(m.then((g) => {
          g.issues.length && r.issues.push(...Me(c, g.issues)), r.value[h] = g.value;
        })) : (m.issues.length && r.issues.push(...Me(c, m.issues)), r.value[h] = m.value);
      }
      u && u.length > 0 && r.issues.push({
        code: "unrecognized_keys",
        input: s,
        inst: e,
        keys: u,
        continue: !0
      });
    }
    return i.length ? Promise.all(i).then(() => r) : r;
  };
}), jc = /* @__PURE__ */ p("$ZodEnum", (e, t) => {
  A.init(e, t);
  const n = nn(t.entries), r = new Set(n);
  e._zod.values = r, k(e, "pattern", (o) => {
    const s = nn(o.def.entries).filter((i) => yi.has(typeof i));
    return new RegExp(s.length ? `^(${s.map((i) => Rt(i.toString())).join("|")})$` : "^[^\\s\\S]$");
  }), e._zod.parse = (o, s) => {
    const i = o.value;
    return r.has(i) || o.issues.push({
      code: "invalid_value",
      values: n,
      input: i,
      inst: e
    }), o;
  };
}), Lc = /* @__PURE__ */ p("$ZodTransform", (e, t) => {
  A.init(e, t), e._zod.optin = "optional", ae.memoizer?.guard(e), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new So(e.constructor.name);
    const o = t.transform(n.value, n);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((i) => (n.value = i, n));
    if (o instanceof Promise)
      throw new Te();
    return n.value = o, n;
  };
});
function dr(e, t) {
  return e.value = t.issues.length ? void 0 : t.value, e;
}
const Zo = /* @__PURE__ */ p("$ZodOptional", (e, t) => {
  A.init(e, t), k(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", k(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? /* @__PURE__ */ new Set([...r, void 0]) : void 0;
  }), k(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${Pn(r.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => {
    if (n.value === void 0) {
      if (t.innerType._zod.optin !== "defaulted")
        return n;
      const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
      return o instanceof Promise ? o.then((s) => dr(n, s)) : dr(n, o);
    }
    return t.innerType._zod.run(n, r);
  };
}), xc = /* @__PURE__ */ p("$ZodExactOptional", (e, t) => {
  Zo.init(e, t), k(e, "values", (n) => n.def.innerType._zod.values), k(e, "pattern", (n) => n.def.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
}), Bc = /* @__PURE__ */ p("$ZodNullable", (e, t) => {
  A.init(e, t), k(e, "optin", (n) => n.def.innerType._zod.optin), k(e, "optout", (n) => n.def.innerType._zod.optout), k(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${Pn(r.source)}|null)$`) : void 0;
  }), k(e, "values", (n) => n.def.innerType._zod.values ? /* @__PURE__ */ new Set([...n.def.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), Wc = /* @__PURE__ */ p("$ZodDefault", (e, t) => {
  A.init(e, t), e._zod.optin = "defaulted", k(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => fr(s, t)) : fr(o, t);
  };
});
function fr(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Hc = /* @__PURE__ */ p("$ZodPrefault", (e, t) => {
  A.init(e, t), e._zod.optin = "defaulted", k(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), Vc = /* @__PURE__ */ p("$ZodNonOptional", (e, t) => {
  A.init(e, t), k(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? new Set([...r].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => hr(s, e)) : hr(o, e);
  };
});
function hr(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
function pr(e, t, n, r) {
  return t.issues.length ? (e.value = n.catchValue({
    ...t,
    value: e.value,
    error: {
      issues: t.issues.map((o) => Se(o, r, he()))
    },
    input: e.value
  }), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
const Jc = /* @__PURE__ */ p("$ZodCatch", (e, t) => {
  A.init(e, t), k(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), k(e, "optout", (n) => n.def.innerType._zod.optout), k(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
    return o instanceof Promise ? o.then((s) => pr(n, s, t, r)) : pr(n, o, t, r);
  };
}), Kc = /* @__PURE__ */ p("$ZodPipe", (e, t) => {
  A.init(e, t), k(e, "values", (n) => n.def.in._zod.values), k(e, "optin", (n) => n.def.in._zod.optin), k(e, "optout", (n) => n.def.out._zod.optout), k(e, "propValues", (n) => n.def.in._zod.propValues), e._zod.parse = (n, r) => {
    if (r.direction === "backward") {
      const s = t.out._zod.run(n, r);
      return s instanceof Promise ? s.then((i) => at(i, t.in, r)) : at(s, t.in, r);
    }
    const o = t.in._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => at(s, t.out, r)) : at(o, t.out, r);
  };
});
function at(e, t, n) {
  return e.issues.some((r) => r.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const Yc = /* @__PURE__ */ p("$ZodReadonly", (e, t) => {
  A.init(e, t), k(e, "propValues", (n) => n.def.innerType._zod.propValues), k(e, "values", (n) => n.def.innerType._zod.values), k(e, "optin", (n) => n.def.innerType?._zod?.optin), k(e, "optout", (n) => n.def.innerType?._zod?.optout), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then(mr) : mr(o);
  };
});
function mr(e) {
  return e.memo || (e.value = Object.freeze(e.value)), e;
}
const Gc = /* @__PURE__ */ p("$ZodCustom", (e, t) => {
  V.init(e, t), A.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, o = t.fn(r);
    if (o instanceof Promise)
      return o.then((s) => gr(s, n, r, e));
    gr(o, n, r, e);
  };
});
function gr(e, t, n, r) {
  if (!e) {
    const o = {
      code: "custom",
      input: n,
      inst: r,
      // incorporates params.error into issue reporting
      path: [...r._zod.def.path ?? []],
      // incorporates params.error into issue reporting
      continue: !r._zod.def.abort
      // params: inst._zod.def.params,
    };
    r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(et(o));
  }
}
class qc extends Error {
  constructor() {
    super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
  }
}
const cn = "~memo", vr = [];
function Do(e) {
  return e !== null && typeof e == "object";
}
function Vt(e) {
  return e.map((t) => t.path ? { ...t, path: t.path.slice() } : { ...t });
}
const Fo = /* @__PURE__ */ new WeakMap(), Ye = 0, pt = 1, Xe = 2;
function mt(e, t, n) {
  const r = Fo.get(e);
  if (r !== void 0)
    return r ? Xe : Ye;
  if (t.has(e))
    return Xe;
  t.add(e);
  let o = Ye;
  const s = (d) => {
    if (o !== Xe && d?._zod) {
      const f = mt(d, t);
      f > o && (o = f);
    }
  }, i = (d, f) => {
    let h = Ye;
    for (const m of Reflect.ownKeys(d)) {
      const g = Object.getOwnPropertyDescriptor(d, m);
      if (!g.enumerable)
        continue;
      const y = g.get ? pt : g.value?._zod ? mt(g.value, t) : Ye;
      y > h && (h = y);
    }
    return h;
  }, a = (d) => {
    d > o && (o = d);
  }, u = e._zod.def;
  switch (u.type) {
    case "object": {
      const d = fo(u);
      a(d ? i(d) : pt), s(u.catchall);
      break;
    }
    case "array":
      s(u.element);
      break;
    case "tuple":
      for (const d of u.items)
        s(d);
      s(u.rest);
      break;
    case "record":
    case "map":
      s(u.keyType), s(u.valueType);
      break;
    case "set":
      s(u.valueType);
      break;
    case "union":
      for (const d of u.options)
        s(d);
      break;
    case "intersection":
      s(u.left), s(u.right);
      break;
    case "optional":
    case "nullable":
    case "default":
    case "prefault":
    case "catch":
    case "readonly":
    case "nonoptional":
    case "promise":
    case "success":
      s(u.innerType);
      break;
    case "pipe":
      s(u.in), s(u.out);
      break;
    case "function":
      s(u.input), s(u.output);
      break;
    // `$ZodLazy` caches its inner on the def, so a resolved edge is followed exactly
    case "lazy": {
      const d = u._cachedInner ?? void 0;
      a(d ? mt(d, t) : pt);
      break;
    }
    // a leaf by choice: `parts` are regex fragments, not data positions
    case "template_literal":
    // leaves
    case "string":
    case "number":
    case "int":
    case "boolean":
    case "bigint":
    case "symbol":
    case "undefined":
    case "null":
    case "void":
    case "never":
    case "any":
    case "unknown":
    case "date":
    case "nan":
    case "enum":
    case "literal":
    case "file":
    case "transform":
    case "custom":
      break;
    default:
      for (const d in u) {
        const f = Object.getOwnPropertyDescriptor(u, d);
        if (!f || f.get)
          continue;
        const h = f.value;
        if (!(!h || typeof h != "object")) {
          if (h._zod)
            s(h);
          else if (Array.isArray(h))
            for (const m of h)
              s(m);
        }
      }
  }
  return t.delete(e), Xc(e, o);
}
function Xc(e, t) {
  return t !== pt && Fo.set(e, t === Xe), t;
}
function Qc(e, t) {
  let n = e.buckets.get(t);
  return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
let ct;
const ut = [], eu = {
  alloc(e, t, n) {
    const r = ct;
    if (!r)
      return n;
    ct = void 0;
    const o = { value: n, issues: null };
    return r.set(t.value, o), ut.push(o), n;
  },
  guard(e) {
    var t;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const n = e._zod.parse, r = (o, s) => {
        if (s.direction !== "backward" && nu(s, o.value))
          throw new qc();
        return n(o, s);
      };
      e._zod.parse = r, e._zod.run === n && (e._zod.run = r);
    });
  },
  attach(e) {
    var t;
    let n, r = !1, o, s;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const i = e._zod.parse, a = (u, c) => {
        if (n === void 0) {
          const S = mt(e, /* @__PURE__ */ new Set());
          if (S === Ye)
            return e._zod.parse = i, e._zod.run === a && (e._zod.run = i), i(u, c);
          S === Xe || r ? n = !0 : r = !0;
        }
        const d = u.value;
        if (!Do(d))
          return i(u, c);
        let f = c[cn];
        f || (f = { buckets: /* @__PURE__ */ new WeakMap(), backEdges: void 0 }, c[cn] = f);
        let h;
        o === c ? h = s : (h = Qc(f, e), o = c, s = h);
        const m = h.get(d);
        if (m)
          return u.value = m.value, m.issues ? m.issues.length && u.issues.push(...Vt(m.issues)) : (u.memo = !0, f.backEdges ?? (f.backEdges = /* @__PURE__ */ new WeakSet()), f.backEdges.add(m.value)), u;
        ct = h;
        const g = ut.length, y = i(u, c);
        ct = void 0;
        const v = ut.length > g ? ut.pop() : void 0;
        return y instanceof Promise ? y.then((S) => (v && (v.issues = S.issues.length ? Vt(S.issues) : vr), S)) : (v && (v.issues = y.issues.length ? Vt(y.issues) : vr), y);
      };
      e._zod.parse = a, e._zod.run === i && (e._zod.run = a);
    });
  }
};
function tu() {
  return eu;
}
function nu(e, t) {
  const n = e[cn]?.backEdges;
  return n !== void 0 && Do(t) && n.has(t);
}
const ru = () => {
  const e = {
    string: { unit: "characters", verb: "to have" },
    file: { unit: "bytes", verb: "to have" },
    array: { unit: "items", verb: "to have" },
    set: { unit: "items", verb: "to have" },
    map: { unit: "entries", verb: "to have" }
  };
  function t(s) {
    return e[s] ?? null;
  }
  const n = {
    regex: "input",
    email: "email address",
    url: "URL",
    emoji: "emoji",
    uuid: "UUID",
    uuidv4: "UUIDv4",
    uuidv6: "UUIDv6",
    nanoid: "nanoid",
    guid: "GUID",
    cuid: "cuid",
    cuid2: "cuid2",
    ulid: "ULID",
    xid: "XID",
    ksuid: "KSUID",
    datetime: "ISO datetime",
    date: "ISO date",
    time: "ISO time",
    duration: "ISO duration",
    ipv4: "IPv4 address",
    ipv6: "IPv6 address",
    mac: "MAC address",
    cidrv4: "IPv4 range",
    cidrv6: "IPv6 range",
    base64: "base64-encoded string",
    base64url: "base64url-encoded string",
    json_string: "JSON string",
    e164: "E.164 number",
    currency_code: "currency code",
    credit_card: "credit card number",
    iban: "IBAN",
    jwt: "JWT",
    template_literal: "input"
  }, r = {
    // Compatibility: "nan" -> "NaN" for display
    nan: "NaN"
    // All other type names omitted - they fall back to raw values via ?? operator
  };
  function o(s, i) {
    return s === "number" && typeof i == "number" && !Number.isFinite(i) ? String(i) : r[s] ?? s;
  }
  return (s) => {
    switch (s.code) {
      case "invalid_type": {
        const i = o(s.expected), a = $i(s.input), u = o(a, s.input);
        return `Invalid input: expected ${i}, received ${u}`;
      }
      case "invalid_value":
        return s.values.length === 1 ? `Invalid input: expected ${vo(s.values[0])}` : `Invalid option: expected one of ${er(s.values, "|")}`;
      case "too_big": {
        const i = s.exact ? "exactly " : s.inclusive ? "<=" : "<", a = t(s.origin);
        return a ? `Too big: expected ${s.origin ?? "value"} to have ${i}${s.maximum.toString()} ${a.unit ?? "elements"}` : `Too big: expected ${s.origin ?? "value"} to be ${i}${s.maximum.toString()}`;
      }
      case "too_small": {
        const i = s.exact ? "exactly " : s.inclusive ? ">=" : ">", a = t(s.origin);
        return a ? `Too small: expected ${s.origin} to have ${i}${s.minimum.toString()} ${a.unit}` : `Too small: expected ${s.origin} to be ${i}${s.minimum.toString()}`;
      }
      case "invalid_format": {
        const i = s;
        return i.format === "starts_with" ? `Invalid string: must start with "${i.prefix}"` : i.format === "ends_with" ? `Invalid string: must end with "${i.suffix}"` : i.format === "includes" ? `Invalid string: must include "${i.includes}"` : i.format === "regex" ? `Invalid string: must match pattern ${i.pattern}` : `Invalid ${n[i.format] ?? s.format}`;
      }
      case "not_multiple_of":
        return `Invalid number: must be a multiple of ${s.divisor}`;
      case "unrecognized_keys":
        return `Unrecognized key${s.keys.length > 1 ? "s" : ""}: ${er(s.keys, ", ")}`;
      case "invalid_key":
        return `Invalid key in ${s.origin}`;
      case "invalid_union":
        return s.options && Array.isArray(s.options) && s.options.length > 0 ? `Invalid discriminator value. Expected ${s.options.map((a) => `'${a}'`).join(" | ")}` : s.inclusive === !1 ? "Invalid input: more than one option matched" : "Invalid input";
      case "invalid_element":
        return `Invalid value in ${s.origin}`;
      default:
        return "Invalid input";
    }
  };
};
function ou() {
  return {
    localeError: ru()
  };
}
var yr;
class su {
  constructor() {
    this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map();
  }
  add(t, ...n) {
    const r = n[0];
    return this._map.set(t, r), r && typeof r == "object" && "id" in r && this._idmap.set(r.id, t), this;
  }
  clear() {
    return this._map = /* @__PURE__ */ new WeakMap(), this._idmap = /* @__PURE__ */ new Map(), this;
  }
  remove(t) {
    const n = this._map.get(t);
    return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(t), this;
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const r = { ...this.get(n) ?? {} };
      delete r.id;
      const o = { ...r, ...this._map.get(t) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function iu() {
  return new su();
}
(yr = globalThis).__zod_globalRegistry ?? (yr.__zod_globalRegistry = iu());
const Ge = globalThis.__zod_globalRegistry;
function jo(e) {
  return e.checks && (e.checks = [...e.checks]), e;
}
// @__NO_SIDE_EFFECTS__
function au(e, t) {
  return new e(jo({ type: "string", ...b(t) }));
}
// @__NO_SIDE_EFFECTS__
function cu(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function uu(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function lu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function du(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function fu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function hu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function pu(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function mu(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gu(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vu(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function yu(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _u(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function bu(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function wu(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Su(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ku(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pu(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zu(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Eu(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Cu(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ou(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $u(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Nu(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Tu(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Au(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Iu(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ru(e, t) {
  return new e(jo({ type: "number", checks: [], ...b(t) }));
}
// @__NO_SIDE_EFFECTS__
function Mu(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Uu(e, t) {
  return new e({
    type: "boolean",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Zu(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Du(e, t) {
  return new e({
    type: "never",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function _r(e, t) {
  return new zo({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Jt(e, t) {
  return new zo({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function br(e, t) {
  return new Eo({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Kt(e, t) {
  return new Eo({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function wr(e, t) {
  return new Ra({
    check: "multiple_of",
    ...b(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function Lo(e, t) {
  return new Ua({
    check: "max_length",
    ...b(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function zt(e, t) {
  return new Za({
    check: "min_length",
    ...b(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function xo(e, t) {
  return new Da({
    check: "length_equals",
    ...b(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Fu(e, t) {
  return new Fa({
    check: "string_format",
    format: "regex",
    ...b(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function ju(e) {
  return new ja({
    check: "string_format",
    format: "lowercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Lu(e) {
  return new La({
    check: "string_format",
    format: "uppercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function xu(e, t) {
  return new xa({
    check: "string_format",
    format: "includes",
    ...b(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Bu(e, t) {
  return new Ba({
    check: "string_format",
    format: "starts_with",
    ...b(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Wu(e, t) {
  return new Wa({
    check: "string_format",
    format: "ends_with",
    ...b(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return new Ha({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Hu(e) {
  return /* @__PURE__ */ Be((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Vu() {
  return /* @__PURE__ */ Be((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Ju() {
  return /* @__PURE__ */ Be((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function Ku() {
  return /* @__PURE__ */ Be((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function Yu() {
  return /* @__PURE__ */ Be((e) => gi(e));
}
// @__NO_SIDE_EFFECTS__
function Gu(e, t, n) {
  return new e({
    type: "array",
    element: t,
    // get element() {
    //   return element;
    // },
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function qu(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function Xu(e, t) {
  const n = /* @__PURE__ */ Qu((r) => (r.addIssue = (o) => {
    if (typeof o == "string")
      r.issues.push(et(o, r.value, n._zod.def));
    else {
      const s = o;
      s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), "input" in s || (s.input = r.value), s.inst ?? (s.inst = n), s.continue ?? (s.continue = !n._zod.def.abort), r.issues.push(et(s));
    }
  }, e(r.value, r)), t);
  return n;
}
// @__NO_SIDE_EFFECTS__
function Qu(e, t) {
  const n = new V({
    check: "custom",
    ...b(t)
  });
  return n._zod.check = e, n;
}
function Qe(e, ...t) {
  for (const n of t)
    for (const r of Reflect.ownKeys(n))
      Object.prototype.propertyIsEnumerable.call(n, r) && Ce(e, r, n[r]);
  return e;
}
function Bo(e) {
  let t = e?.target ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: e?.metadata ?? Ge,
    target: t,
    unrepresentable: e?.unrepresentable ?? "throw",
    override: e?.override ?? (() => {
    }),
    io: e?.io ?? "output",
    counter: 0,
    seen: /* @__PURE__ */ new Map(),
    sharedDefsExtractedFor: void 0,
    sharedEmitDoneFor: void 0,
    cycles: e?.cycles ?? "ref",
    reused: e?.reused ?? "inline",
    intersections: [],
    deferred: [],
    external: e?.external ?? void 0
  };
}
function We(e, t, n, r, o) {
  const s = typeof t.unrepresentable == "function" ? t.unrepresentable({ zodSchema: e, path: r.path, message: o }) : t.unrepresentable;
  if (s === "any")
    return !1;
  if (s === void 0 || s === "throw")
    throw new Error(o);
  return Object.assign(n, s), !0;
}
function Z(e, t, n = { path: [], schemaPath: [] }) {
  var r;
  const o = e._zod.def, s = t.seen.get(e);
  if (s)
    return s.count++, n.schemaPath.includes(e) && (s.cycle = n.path), s.schema;
  const i = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, i), t.sharedDefsExtractedFor = void 0, t.sharedEmitDoneFor = void 0;
  const a = e._zod.toJSONSchema?.();
  if (a)
    i.schema = a;
  else {
    const d = {
      ...n,
      schemaPath: [...n.schemaPath, e],
      path: n.path
    };
    if (e._zod.processJSONSchema)
      e._zod.processJSONSchema(t, i.schema, d);
    else {
      const h = i.schema, m = t.processors[o.type];
      if (!m)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      m(e, t, h, d);
    }
    const f = e._zod.parent;
    f && (i.ref || (i.ref = f), Z(f, t, d), t.seen.get(f).isParent = !0);
  }
  const u = t.metadataRegistry.get(e);
  return u && Qe(i.schema, u), t.io === "input" && L(e) && (delete i.schema.examples, delete i.schema.default), t.io === "input" && "_prefault" in i.schema && ((r = i.schema).default ?? (r.default = i.schema._prefault)), delete i.schema._prefault, t.seen.get(e).schema;
}
function Sr(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function Wo(e, t) {
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  if (e.external && e.sharedDefsExtractedFor === e.external)
    return;
  const r = /* @__PURE__ */ new Map();
  for (const i of e.seen.entries()) {
    const a = e.metadataRegistry.get(i[0])?.id;
    if (a) {
      const u = r.get(a);
      if (u && u !== i[0])
        throw new Error(`Duplicate schema id "${a}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
      r.set(a, i[0]);
    }
  }
  const o = (i) => {
    const a = e.target === "draft-2020-12" ? "$defs" : "definitions";
    if (e.external) {
      const f = e.external.registry.get(i[0])?.id, h = e.external.uri ?? ((g) => g);
      if (f)
        return { ref: h(f) };
      const m = i[1].defId ?? i[1].schema.id ?? `schema${e.counter++}`;
      return i[1].defId = m, { defId: m, ref: `${h("__shared")}#/${a}/${Sr(m)}` };
    }
    const u = "#", c = `${u}/${a}/`;
    if (i[1] === n && !i[1].schema.id)
      return { ref: u };
    const d = i[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: d, ref: c + Sr(d) };
  }, s = (i) => {
    if (i[1].schema.$ref)
      return;
    const a = i[1], { ref: u, defId: c } = o(i);
    a.def = { ...a.schema }, c && (a.defId = c);
    const d = a.schema;
    for (const f in d)
      delete d[f];
    d.$ref = u;
  };
  if (e.cycles === "throw")
    for (const i of e.seen.entries()) {
      const a = i[1];
      if (a.cycle)
        throw new Error(`Cycle detected: #/${a.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const i of e.seen.entries()) {
    const a = i[1];
    if (t === i[0]) {
      s(i);
      continue;
    }
    if (e.external) {
      const c = e.external.registry.get(i[0])?.id;
      if (t !== i[0] && c) {
        s(i);
        continue;
      }
    }
    if (e.metadataRegistry.get(i[0])?.id) {
      s(i);
      continue;
    }
    if (a.cycle) {
      s(i);
      continue;
    }
    a.count > 1 && e.reused === "ref" && s(i);
  }
  e.external && (e.sharedDefsExtractedFor = e.external);
}
function Ho(e) {
  const t = e.anyOf;
  if (!Array.isArray(t) || t.length === 0 || e.type !== void 0)
    return;
  const n = [];
  for (const r of t) {
    if (!r || typeof r != "object")
      return;
    Ho(r);
    const o = Object.keys(r);
    if (o.length !== 1 || o[0] !== "type")
      return;
    const s = r.type;
    for (const i of Array.isArray(s) ? s : [s]) {
      if (typeof i != "string")
        return;
      n.includes(i) || n.push(i);
    }
  }
  delete e.anyOf, e.type = n.length === 1 ? n[0] : n;
}
const Vo = /* @__PURE__ */ new Set(["type", "properties", "required", "additionalProperties"]), kr = ["oneOf", "anyOf"];
function Pr(e) {
  const t = e.additionalProperties;
  return t === void 0 || t === !1 || typeof t != "object" || t === null ? null : Object.keys(t).length ? t : null;
}
function un(e) {
  const t = [];
  for (const s of e) {
    if (typeof s != "object" || s.type !== "object")
      return null;
    for (const i in s)
      if (!Vo.has(i))
        return null;
    t.push(s);
  }
  const n = {}, r = /* @__PURE__ */ new Set();
  for (const s of t) {
    for (const i in s.properties) {
      if (Object.prototype.hasOwnProperty.call(n, i))
        continue;
      const a = [];
      for (const c of t) {
        const d = c.properties?.[i] ?? Pr(c);
        d != null && (a.some((f) => JSON.stringify(f) === JSON.stringify(d)) || a.push(d));
      }
      const u = a.length === 1 ? a[0] : un(a) ?? { allOf: a };
      Ce(n, i, u);
    }
    for (const i of s.required ?? [])
      r.add(i);
  }
  const o = { type: "object", properties: n };
  if (r.size && (o.required = [...r]), t.every((s) => s.additionalProperties === !1))
    o.additionalProperties = !1;
  else {
    const s = [];
    for (const i of t) {
      const a = Pr(i);
      a && !s.some((u) => JSON.stringify(u) === JSON.stringify(a)) && s.push(a);
    }
    s.length === 1 ? o.additionalProperties = s[0] : s.length > 1 && (o.additionalProperties = { allOf: s });
  }
  return o;
}
function el(e) {
  const t = e.allOf;
  if (!Array.isArray(t) || t.length < 2)
    return;
  for (const o of Vo)
    if (o in e)
      return;
  const n = t.filter((o) => kr.some((s) => Array.isArray(o[s])));
  let r = null;
  if (!n.length)
    r = un(t);
  else {
    const o = n[0], s = kr.find((u) => Array.isArray(o[u]));
    if (Object.keys(o).length !== 1)
      return;
    const i = t.filter((u) => u !== o), a = o[s].map((u) => un([...i, u]));
    if (a.some((u) => !u))
      return;
    r = { [s]: a };
  }
  r && (delete e.allOf, Qe(e, r));
}
function Jo(e, t) {
  const n = e.seen.get(t);
  if (!n)
    throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (a) => {
    const u = e.seen.get(a);
    if (u.ref === null)
      return;
    const c = u.def ?? u.schema, d = { ...c }, f = u.ref;
    if (u.ref = null, f) {
      r(f);
      const m = e.seen.get(f), g = m.schema;
      if (g.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (c.allOf = c.allOf ?? [], c.allOf.push(g)) : Qe(c, g), Qe(c, d), a._zod.parent === f)
        for (const v in c)
          v === "$ref" || v === "allOf" || v in d || delete c[v];
      if (g.$ref && m.def)
        for (const v in c)
          v === "$ref" || v === "allOf" || v in m.def && JSON.stringify(c[v]) === JSON.stringify(m.def[v]) && delete c[v];
    }
    const h = a._zod.parent;
    if (h && h !== f) {
      r(h);
      const m = e.seen.get(h);
      if (m?.schema.$ref && (c.$ref = m.schema.$ref, m.def))
        for (const g in c)
          g === "$ref" || g === "allOf" || g in m.def && JSON.stringify(c[g]) === JSON.stringify(m.def[g]) && delete c[g];
    }
    e.override({
      zodSchema: a,
      jsonSchema: c,
      path: u.path ?? []
    });
  };
  if (!e.external || e.sharedEmitDoneFor !== e.external) {
    for (const a of [...e.seen.entries()].reverse())
      r(a[0]);
    if (e.target !== "openapi-3.0")
      for (const a of e.seen.entries())
        Ho(a[1].def ?? a[1].schema);
    for (const a of e.deferred)
      a();
    if (e.intersections.length) {
      const a = /* @__PURE__ */ new Map();
      for (const u of e.seen.values())
        for (const c of [u.schema, u.def]) {
          const d = c?.allOf;
          if (!Array.isArray(d))
            continue;
          const f = a.get(d);
          f ? f.push(c) : a.set(d, [c]);
        }
      for (const u of e.intersections)
        for (const c of a.get(u) ?? [])
          el(c);
    }
  }
  const o = {};
  if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
    const a = e.external.registry.get(t)?.id;
    if (!a)
      throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(a);
  }
  Qe(o, n.defId ? n.schema : n.def ?? n.schema);
  const s = e.metadataRegistry.get(t)?.id;
  s !== void 0 && o.id === s && delete o.id;
  const i = e.external?.defs ?? {};
  if (!e.external || e.sharedEmitDoneFor !== e.external)
    for (const a of e.seen.entries()) {
      const u = a[1];
      u.def && u.defId && (u.def.id === u.defId && delete u.def.id, Ce(i, u.defId, u.def));
    }
  e.external && (e.sharedEmitDoneFor = e.external), e.external || Object.keys(i).length > 0 && (e.target === "draft-2020-12" ? o.$defs = i : o.definitions = i);
  try {
    const a = JSON.parse(JSON.stringify(o));
    return Object.defineProperty(a, "~standard", {
      value: {
        ...t["~standard"],
        jsonSchema: {
          input: Et(t, "input", e.processors),
          output: Et(t, "output", e.processors)
        }
      },
      enumerable: !1,
      writable: !1
    }), a;
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function L(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const r = e._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return L(r.element, n);
  if (r.type === "set")
    return L(r.valueType, n);
  if (r.type === "lazy")
    return L(r.getter(), n);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch")
    return L(r.innerType, n);
  if (r.type === "intersection")
    return L(r.left, n) || L(r.right, n);
  if (r.type === "record" || r.type === "map")
    return L(r.keyType, n) || L(r.valueType, n);
  if (r.type === "pipe")
    return e._zod.traits.has("$ZodCodec") ? !0 : L(r.in, n) || L(r.out, n);
  if (r.type === "object") {
    for (const o in r.shape)
      if (L(r.shape[o], n))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options)
      if (L(o, n))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items)
      if (L(o, n))
        return !0;
    return !!(r.rest && L(r.rest, n));
  }
  return !1;
}
const tl = (e, t = {}) => (n) => {
  const r = Bo({ ...n, processors: t });
  return Z(e, r), Wo(r, e), Jo(r, e);
}, Et = (e, t, n = {}) => (r) => {
  const { libraryOptions: o, target: s } = r ?? {}, i = Bo({ ...o ?? {}, target: s, io: t, processors: n });
  return Z(e, i), Wo(i, e), Jo(i, e);
}, Fe = (e, t, n) => {
  (e[t] === void 0 || n > e[t]) && (e[t] = n);
}, je = (e, t, n) => {
  (e[t] === void 0 || n < e[t]) && (e[t] = n);
}, zr = (e, t) => {
  Fe(e, "minimum", t), je(e, "maximum", t);
}, Ko = (e, t) => {
  e.multipleOf ?? (e.multipleOf = []), e.multipleOf.includes(t) || e.multipleOf.push(t);
}, Yo = (e, t) => {
  e.patterns ?? (e.patterns = /* @__PURE__ */ new Set()), e.patterns.add(t);
}, Go = (e, t) => {
  e.mime = e.mime ? e.mime.filter((n) => t.includes(n)) : [...t];
}, qo = (e, t) => {
  e.format = t, t.includes("int") && (e.isInt = !0);
}, Er = (e, t) => Fe(e, "minimum", t.minimum), Cr = (e, t) => je(e, "maximum", t.maximum), Or = (e) => (t, n) => {
  qo(t, n.format);
  const [r, o] = e[n.format];
  Fe(t, "minimum", r), je(t, "maximum", o);
}, nl = {
  greater_than: (e, t) => Fe(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
  less_than: (e, t) => je(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
  multiple_of: (e, t) => Ko(e, t.value),
  number_format: Or(yo),
  bigint_format: Or(bi),
  min_length: Er,
  max_length: Cr,
  length_equals: (e, t) => zr(e, t.length),
  min_size: Er,
  max_size: Cr,
  size_equals: (e, t) => zr(e, t.size),
  string_format: (e, t) => {
    qo(e, t.format), t.pattern && Yo(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
  },
  mime_type: (e, t) => Go(e, t.mime)
};
function ie(e) {
  const t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
  for (const s of r)
    nl[s._zod.def.check]?.(t, s._zod.def);
  const o = e._zod.bag;
  o.minimum !== void 0 && Fe(t, "minimum", o.minimum), o.exclusiveMinimum !== void 0 && Fe(t, "exclusiveMinimum", o.exclusiveMinimum), o.maximum !== void 0 && je(t, "maximum", o.maximum), o.exclusiveMaximum !== void 0 && je(t, "exclusiveMaximum", o.exclusiveMaximum), o.multipleOf !== void 0 && Ko(t, o.multipleOf), o.format !== void 0 && (t.format ?? (t.format = o.format), o.format.includes("int") && (t.isInt = !0)), o.mime && Go(t, o.mime);
  for (const s of o.patterns ?? [])
    Yo(t, s);
  return t;
}
const rl = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, ol = /* @__PURE__ */ new Map([
  [Io, wa],
  [Rn, Sa]
]), Xo = (e) => ol.get(e) ?? e, sl = (e, t, n, r) => {
  const o = n;
  o.type = "string";
  const { minimum: s, maximum: i, format: a, patterns: u, contentEncoding: c, laxFormat: d } = ie(e);
  if (typeof s == "number" && (o.minLength = s), typeof i == "number" && (o.maxLength = i), a && (o.format = rl[a] ?? a, o.format === "" && delete o.format, (a === "time" || d) && delete o.format), c && (o.contentEncoding = c), u && u.size > 0) {
    const f = [...u].map(Xo);
    f.length === 1 ? o.pattern = f[0].source : f.length > 1 && (o.allOf = [
      ...f.map((h) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: h.source
      }))
    ]);
  }
}, il = (e, t, n, r) => {
  const o = n, { minimum: s, maximum: i, multipleOf: a, exclusiveMaximum: u, exclusiveMinimum: c, isInt: d } = ie(e);
  o.type = d ? "integer" : "number";
  const f = typeof c == "number" && c >= (s ?? Number.NEGATIVE_INFINITY), h = typeof u == "number" && u <= (i ?? Number.POSITIVE_INFINITY), m = t.target === "draft-04" || t.target === "openapi-3.0";
  if (f ? m ? (o.minimum = c, o.exclusiveMinimum = !0) : o.exclusiveMinimum = c : typeof s == "number" && (o.minimum = s), h ? m ? (o.maximum = u, o.exclusiveMaximum = !0) : o.exclusiveMaximum = u : typeof i == "number" && (o.maximum = i), a) {
    const g = /* @__PURE__ */ new Set();
    for (const S of a)
      Number.isFinite(S) && S !== 0 ? g.add(Math.abs(S)) : We(e, t, o, r, `A multipleOf divisor of ${S} cannot be represented in JSON Schema`);
    const [y, ...v] = g;
    y !== void 0 && (o.multipleOf = y), v.length && (o.allOf = [...o.allOf ?? [], ...v.map((S) => ({ multipleOf: S }))]);
  }
}, al = (e, t, n, r) => {
  n.type = "boolean";
}, cl = (e, t, n, r) => {
  n.not = {};
}, ul = (e, t, n, r) => {
}, ll = (e, t, n, r) => {
  const o = e._zod.def, s = nn(o.entries);
  if (s.length === 0) {
    n.not = {};
    return;
  }
  s.every((i) => typeof i == "number") && (n.type = "number"), s.every((i) => typeof i == "string") && (n.type = "string"), n.enum = s;
}, dl = (e, t, n, r) => {
  We(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, fl = (e, t, n, r) => {
  We(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, hl = (e, t, n, r) => {
  const o = n, s = e._zod.def, { minimum: i, maximum: a } = ie(e);
  typeof i == "number" && (o.minItems = i), typeof a == "number" && (o.maxItems = a), o.type = "array", o.items = Z(s.element, t, {
    ...r,
    path: [...r.path, "items"]
  });
};
function Ct(e) {
  const t = e._zod.def;
  return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? Ct(t.out) : t.type === "catch" ? Ct(t.innerType) : e._zod.optin;
}
const pl = (e, t, n, r) => {
  const o = n, s = e._zod.def, i = s.shape;
  if (Object.getOwnPropertySymbols(i).length && We(e, t, o, r, "Symbol keys cannot be represented in JSON Schema"))
    return;
  o.type = "object", o.properties = {};
  for (const c in i)
    Ce(o.properties, c, Z(i[c], t, {
      ...r,
      path: [...r.path, "properties", c]
    }));
  const u = [];
  for (const c of Object.keys(i)) {
    const d = s.shape[c];
    (t.io === "input" ? Ct(d) === void 0 : d._zod.optout === void 0) && u.push(c);
  }
  u.length > 0 && (o.required = u), s.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : s.catchall ? s.catchall && (o.additionalProperties = Z(s.catchall, t, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : t.io === "output" && (o.additionalProperties = !1);
}, ml = (e, t, n, r) => {
  const o = e._zod.def, s = o.inclusive === !1, i = o.options.map((a, u) => Z(a, t, {
    ...r,
    path: [...r.path, s ? "oneOf" : "anyOf", u]
  }));
  s ? n.oneOf = i : n.anyOf = i;
}, gl = (e, t, n, r) => {
  const o = e._zod.def, s = Z(o.left, t, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), i = Z(o.right, t, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), a = (c) => "allOf" in c && Object.keys(c).length === 1, u = [
    ...a(s) ? s.allOf : [s],
    ...a(i) ? i.allOf : [i]
  ];
  n.allOf = u, t.intersections.push(u);
};
function ln(e, t, n) {
  if (t.$ref) {
    if (n.has(t))
      return t;
    n.add(t);
    const g = e.get(t)?.def;
    if (!g)
      return t;
    const y = ln(e, g, n);
    return y === g ? t : y;
  }
  for (const g of ["anyOf", "oneOf"]) {
    const y = t[g];
    if (!Array.isArray(y))
      continue;
    const v = y.map((S) => ln(e, S, n));
    v.some((S, B) => S !== y[B]) && (t = { ...t, [g]: v });
  }
  const r = Array.isArray(t.type) ? t.type : [t.type], o = !r.includes("string") && r.some((g) => g === "number" || g === "integer"), s = t.enum ?? (t.const !== void 0 ? [t.const] : void 0);
  if (!o && !s?.some((g) => typeof g == "number"))
    return t;
  const { minimum: i, maximum: a, exclusiveMinimum: u, exclusiveMaximum: c, multipleOf: d, format: f, id: h, ...m } = t;
  return m.enum ? m.enum = m.enum.map((g) => typeof g == "number" ? String(g) : g) : typeof m.const == "number" && (m.const = String(m.const)), o && (m.type = "string", s || (m.pattern = (r.includes("number") ? Tn : Na).source)), m;
}
const dn = /* @__PURE__ */ new WeakMap();
function vl(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e.seen.values())
    r.def && !t.has(r.schema) && t.set(r.schema, r);
  const n = /* @__PURE__ */ new Map();
  for (const r of dn.get(e) ?? []) {
    const o = e.seen.get(r), s = (o?.def ?? o?.schema)?.propertyNames;
    if (!s || s === !0 || n.has(s))
      continue;
    const i = ln(t, s, /* @__PURE__ */ new Set());
    i !== s && n.set(s, i);
  }
  if (n.size)
    for (const r of e.seen.values())
      for (const o of [r.schema, r.def]) {
        const s = o && n.get(o.propertyNames);
        s && (o.propertyNames = s);
      }
}
const yl = (e, t, n, r) => {
  const o = n, s = e._zod.def;
  o.type = "object";
  const i = s.keyType, a = ie(i).patterns;
  if (s.mode === "loose" && a && a.size > 0) {
    const d = Z(s.valueType, t, {
      ...r,
      path: [...r.path, "patternProperties", "*"]
    });
    o.patternProperties = {};
    for (const f of a)
      Ce(o.patternProperties, Xo(f).source, d);
  } else {
    if (t.target === "draft-07" || t.target === "draft-2020-12") {
      o.propertyNames = Z(s.keyType, t, {
        ...r,
        path: [...r.path, "propertyNames"]
      });
      let d = dn.get(t);
      d || (d = [], dn.set(t, d), t.deferred.push(() => vl(t))), d.push(e);
    }
    o.additionalProperties = Z(s.valueType, t, {
      ...r,
      path: [...r.path, "additionalProperties"]
    });
  }
  const u = i._zod.values, c = t.io === "input" && Ct(s.valueType) !== void 0;
  if (u && !s.partial && !c) {
    const d = [...u].filter((f) => typeof f == "string" || typeof f == "number");
    d.length > 0 && (o.required = d.map(String));
  }
}, _l = (e, t, n, r) => {
  const o = e._zod.def, s = Z(o.innerType, t, r), i = t.seen.get(e);
  t.target === "openapi-3.0" ? (i.ref = o.innerType, n.nullable = !0) : n.anyOf = [s, { type: "null" }];
}, bl = (e, t, n, r) => {
  const o = e._zod.def;
  Z(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType;
}, Mn = /* @__PURE__ */ Symbol();
function Qo(e, t, n, r, o) {
  let s = !1;
  const i = JSON.stringify(e, (a, u) => typeof u != "bigint" ? u : (s = !0, null));
  return s ? (We(t, n, r, o, "BigInt defaults cannot be represented in JSON Schema"), Mn) : JSON.parse(i);
}
const wl = (e, t, n, r) => {
  const o = e._zod.def;
  Z(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType;
  const i = Qo(o.defaultValue, e, t, n, r);
  i !== Mn && (n.default = i);
}, Sl = (e, t, n, r) => {
  const o = e._zod.def;
  Z(o.innerType, t, r);
  const s = t.seen.get(e);
  if (s.ref = o.innerType, t.io !== "input")
    return;
  const i = Qo(o.defaultValue, e, t, n, r);
  i !== Mn && (n._prefault = i);
}, kl = (e, t, n, r) => {
  const o = e._zod.def;
  Z(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType;
  let i;
  try {
    i = o.catchValue(void 0);
  } catch {
    We(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  n.default = i;
}, Pl = (e, t, n, r) => {
  const o = e._zod.def, s = o.in._zod.traits.has("$ZodTransform"), i = t.io === "input" ? s ? o.out : o.in : o.out;
  Z(i, t, r);
  const a = t.seen.get(e);
  a.ref = i;
}, zl = (e, t, n, r) => {
  const o = e._zod.def;
  Z(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType, n.readOnly = !0;
}, es = (e, t, n, r) => {
  const o = e._zod.def;
  Z(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType;
}, $r = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function lt(e, t, n) {
  Object.defineProperty(e, t, {
    configurable: !0,
    enumerable: !1,
    get() {
      const r = n(this);
      return Object.defineProperty(this, t, { value: r, configurable: !0, writable: !0 }), r;
    },
    set(r) {
      Object.defineProperty(this, t, { value: r, configurable: !0, writable: !0 });
    }
  });
}
const ts = (e, t) => {
  xi.init(e, t), e.name = "ZodError";
  const n = Object.getPrototypeOf(e);
  $r.has(n) || ($r.add(n), lt(n, "format", (r) => (o) => Hi(r, o)), lt(n, "flatten", (r) => (o) => Wi(r, o)), lt(n, "addIssue", (r) => (o) => {
    r.issues.push(o), r.message = JSON.stringify(r.issues, rn, 2);
  }), lt(n, "addIssues", (r) => (o) => {
    r.issues.push(...o), r.message = JSON.stringify(r.issues, rn, 2);
  }), Object.defineProperty(n, "isEmpty", {
    configurable: !0,
    enumerable: !1,
    get() {
      return this.issues.length === 0;
    }
  }));
}, El = /* @__PURE__ */ p("ZodError", ts), ne = /* @__PURE__ */ p("ZodError", ts, void 0, {
  Parent: Error
}), Cl = /* @__PURE__ */ Cn(ne), Ol = /* @__PURE__ */ On(ne), $l = /* @__PURE__ */ $n(ne), Nl = /* @__PURE__ */ Nn(ne), Tl = /* @__PURE__ */ qi(ne), Al = /* @__PURE__ */ Xi(ne), Il = /* @__PURE__ */ Qi(ne), Rl = /* @__PURE__ */ ea(ne), Ml = /* @__PURE__ */ ta(ne), Ul = /* @__PURE__ */ na(ne), Zl = /* @__PURE__ */ ra(ne), Dl = /* @__PURE__ */ oa(ne);
function Fl() {
  ae.localeError || he(ou());
}
function Dt() {
  ae.memoizer || he({ memoizer: tu() });
}
const I = /* @__PURE__ */ p("ZodType", (e, t) => (Fl(), A.init(e, t), e.def = t, e.type = t.type, e), {
  check(...e) {
    const t = this.def;
    return this.clone(G(t, {
      checks: [
        ...t.checks ?? [],
        ...e.map((n) => typeof n == "function" ? { _zod: { check: n, def: { check: "custom" }, onattach: [] } } : n)
      ]
    }), { parent: !0 });
  },
  with(...e) {
    return this.check(...e);
  },
  clone(e, t) {
    return Oe(this, e, t);
  },
  brand() {
    return this;
  },
  register(e, t) {
    return e.add(this, t), this;
  },
  refine(e, t) {
    return this.check(Md(e, t));
  },
  superRefine(e, t) {
    return this.check(Ud(e, t));
  },
  overwrite(e) {
    return this.check(/* @__PURE__ */ Be(e));
  },
  optional() {
    return Ir(this);
  },
  exactOptional() {
    return Sd(this);
  },
  nullable() {
    return Rr(this);
  },
  nullish() {
    return Ir(Rr(this));
  },
  nonoptional(e) {
    return Od(this, e);
  },
  array() {
    return H(this);
  },
  or(e) {
    return vd([this, e]);
  },
  and(e) {
    return _d(this, e);
  },
  transform(e) {
    return Mr(this, wd(e));
  },
  default(e) {
    return zd(this, e);
  },
  prefault(e) {
    return Cd(this, e);
  },
  catch(e) {
    return Nd(this, e);
  },
  pipe(e) {
    return Mr(this, e);
  },
  readonly() {
    return Id(this);
  },
  describe(e) {
    const t = this.clone();
    return Ge.add(t, { description: e }), t;
  },
  meta(...e) {
    if (e.length === 0)
      return Ge.get(this);
    const t = this.clone();
    return Ge.add(t, e[0]), t;
  },
  isOptional() {
    return this.safeParse(void 0).success;
  },
  isNullable() {
    return this.safeParse(null).success;
  },
  apply(e, ...t) {
    return t.length === 0 ? e(this) : e(this, ...t);
  },
  // Overrides core's `~standard` to add `jsonSchema`. Must stay a prototype entry: redefining it per instance demotes instances to dictionary mode.
  get "~standard"() {
    return bo(this, "~standard", {
      ...Oo(this),
      jsonSchema: {
        input: Et(this, "input"),
        output: Et(this, "output")
      }
    });
  },
  set "~standard"(e) {
    ke(this, "~standard", e);
  },
  parse: function e(t, n) {
    return Cl(this, t, n, { callee: e });
  },
  parseAsync: async function e(t, n) {
    return await Ol(this, t, n, { callee: e });
  },
  safeParse(e, t) {
    return $l(this, e, t);
  },
  async safeParseAsync(e, t) {
    return Nl(this, e, t);
  },
  // `spa` is an alias: same function object as `safeParseAsync`, as before.
  get spa() {
    return this?.safeParseAsync;
  },
  set spa(e) {
    ke(this, "spa", e);
  },
  validate(e, t) {
    return Ki(this, e, t);
  },
  validateAsync(e, t) {
    return Gi(this, e, t);
  },
  encode: function e(t, n) {
    return Tl(this, t, n, { callee: e });
  },
  decode: function e(t, n) {
    return Al(this, t, n, { callee: e });
  },
  encodeAsync: async function e(t, n) {
    return await Il(this, t, n, { callee: e });
  },
  decodeAsync: async function e(t, n) {
    return await Rl(this, t, n, { callee: e });
  },
  safeEncode(e, t) {
    return Ml(this, e, t);
  },
  safeDecode(e, t) {
    return Ul(this, e, t);
  },
  async safeEncodeAsync(e, t) {
    return Zl(this, e, t);
  },
  async safeDecodeAsync(e, t) {
    return Dl(this, e, t);
  },
  toJSONSchema(e) {
    return tl(this, {})(e);
  },
  // Reads through to the registry on every access, so it must not cache.
  get description() {
    return Ge.get(this)?.description;
  },
  // No setter: `schema._def = x` throws, as it did when `_def` was a non-writable own property.
  get _def() {
    return this._zod.def;
  }
}), ns = /* @__PURE__ */ p(
  "_ZodString",
  (e, t) => {
    In.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => sl(e, n, r);
  },
  /* @__PURE__ */ wo({
    format: (e) => ie(e).format ?? null,
    minLength: (e) => ie(e).minimum ?? null,
    maxLength: (e) => ie(e).maximum ?? null
  }, {
    regex(...e) {
      return this.check(/* @__PURE__ */ Fu(...e));
    },
    includes(...e) {
      return this.check(/* @__PURE__ */ xu(...e));
    },
    startsWith(...e) {
      return this.check(/* @__PURE__ */ Bu(...e));
    },
    endsWith(...e) {
      return this.check(/* @__PURE__ */ Wu(...e));
    },
    min(...e) {
      return this.check(/* @__PURE__ */ zt(...e));
    },
    max(...e) {
      return this.check(/* @__PURE__ */ Lo(...e));
    },
    length(...e) {
      return this.check(/* @__PURE__ */ xo(...e));
    },
    nonempty(...e) {
      return this.check(/* @__PURE__ */ zt(1, ...e));
    },
    lowercase(e) {
      return this.check(/* @__PURE__ */ ju(e));
    },
    uppercase(e) {
      return this.check(/* @__PURE__ */ Lu(e));
    },
    trim() {
      return this.check(/* @__PURE__ */ Vu());
    },
    normalize(...e) {
      return this.check(/* @__PURE__ */ Hu(...e));
    },
    toLowerCase() {
      return this.check(/* @__PURE__ */ Ju());
    },
    toUpperCase() {
      return this.check(/* @__PURE__ */ Ku());
    },
    slugify() {
      return this.check(/* @__PURE__ */ Yu());
    }
  })
), jl = /* @__PURE__ */ p("ZodString", (e, t) => {
  In.init(e, t), ns.init(e, t);
}, {
  email(e) {
    return this.check(/* @__PURE__ */ cu(Hl, e));
  },
  url(e) {
    return this.check(/* @__PURE__ */ pu(Jl, e));
  },
  jwt(e) {
    return this.check(/* @__PURE__ */ $u(cd, e));
  },
  emoji(e) {
    return this.check(/* @__PURE__ */ mu(Kl, e));
  },
  guid(e) {
    return this.check(/* @__PURE__ */ uu(Vl, e));
  },
  uuid(e) {
    return this.check(/* @__PURE__ */ lu(dt, e));
  },
  uuidv4(e) {
    return this.check(/* @__PURE__ */ du(dt, e));
  },
  uuidv6(e) {
    return this.check(/* @__PURE__ */ fu(dt, e));
  },
  uuidv7(e) {
    return this.check(/* @__PURE__ */ hu(dt, e));
  },
  nanoid(e) {
    return this.check(/* @__PURE__ */ gu(Yl, e));
  },
  cuid(e) {
    return this.check(/* @__PURE__ */ vu(Gl, e));
  },
  cuid2(e) {
    return this.check(/* @__PURE__ */ yu(ql, e));
  },
  ulid(e) {
    return this.check(/* @__PURE__ */ _u(Xl, e));
  },
  base64(e) {
    return this.check(/* @__PURE__ */ Eu(sd, e));
  },
  base64url(e) {
    return this.check(/* @__PURE__ */ Cu(id, e));
  },
  xid(e) {
    return this.check(/* @__PURE__ */ bu(Ql, e));
  },
  ksuid(e) {
    return this.check(/* @__PURE__ */ wu(ed, e));
  },
  ipv4(e) {
    return this.check(/* @__PURE__ */ Su(td, e));
  },
  ipv6(e) {
    return this.check(/* @__PURE__ */ ku(nd, e));
  },
  cidrv4(e) {
    return this.check(/* @__PURE__ */ Pu(rd, e));
  },
  cidrv6(e) {
    return this.check(/* @__PURE__ */ zu(od, e));
  },
  e164(e) {
    return this.check(/* @__PURE__ */ Ou(ad, e));
  },
  datetime(e) {
    return this.check(/* @__PURE__ */ Nu(Ll, e));
  },
  date(e) {
    return this.check(/* @__PURE__ */ Tu(xl, e));
  },
  time(e) {
    return this.check(/* @__PURE__ */ Au(Bl, e));
  },
  duration(e) {
    return this.check(/* @__PURE__ */ Iu(Wl, e));
  }
});
function M(e) {
  return /* @__PURE__ */ au(jl, e);
}
const N = /* @__PURE__ */ p("ZodStringFormat", (e, t) => {
  O.init(e, t), ns.init(e, t);
}), Ll = /* @__PURE__ */ p("ZodISODateTime", (e, t) => {
  dc.init(e, t), N.init(e, t);
}), xl = /* @__PURE__ */ p("ZodISODate", (e, t) => {
  fc.init(e, t), N.init(e, t);
}), Bl = /* @__PURE__ */ p("ZodISOTime", (e, t) => {
  hc.init(e, t), N.init(e, t);
}), Wl = /* @__PURE__ */ p("ZodISODuration", (e, t) => {
  pc.init(e, t), N.init(e, t);
}), Hl = /* @__PURE__ */ p("ZodEmail", (e, t) => {
  qa.init(e, t), N.init(e, t);
}), Vl = /* @__PURE__ */ p("ZodGUID", (e, t) => {
  Ya.init(e, t), N.init(e, t);
}), dt = /* @__PURE__ */ p("ZodUUID", (e, t) => {
  Ga.init(e, t), N.init(e, t);
}), Jl = /* @__PURE__ */ p("ZodURL", (e, t) => {
  rc.init(e, t), N.init(e, t);
}), Kl = /* @__PURE__ */ p("ZodEmoji", (e, t) => {
  oc.init(e, t), N.init(e, t);
}), Yl = /* @__PURE__ */ p("ZodNanoID", (e, t) => {
  sc.init(e, t), N.init(e, t);
}), Gl = /* @__PURE__ */ p("ZodCUID", (e, t) => {
  ic.init(e, t), N.init(e, t);
}), ql = /* @__PURE__ */ p("ZodCUID2", (e, t) => {
  ac.init(e, t), N.init(e, t);
}), Xl = /* @__PURE__ */ p("ZodULID", (e, t) => {
  cc.init(e, t), N.init(e, t);
}), Ql = /* @__PURE__ */ p("ZodXID", (e, t) => {
  uc.init(e, t), N.init(e, t);
}), ed = /* @__PURE__ */ p("ZodKSUID", (e, t) => {
  lc.init(e, t), N.init(e, t);
}), td = /* @__PURE__ */ p("ZodIPv4", (e, t) => {
  mc.init(e, t), N.init(e, t);
}), nd = /* @__PURE__ */ p("ZodIPv6", (e, t) => {
  vc.init(e, t), N.init(e, t);
}), rd = /* @__PURE__ */ p("ZodCIDRv4", (e, t) => {
  yc.init(e, t), N.init(e, t);
}), od = /* @__PURE__ */ p("ZodCIDRv6", (e, t) => {
  bc.init(e, t), N.init(e, t);
}), sd = /* @__PURE__ */ p("ZodBase64", (e, t) => {
  wc.init(e, t), N.init(e, t);
}), id = /* @__PURE__ */ p("ZodBase64URL", (e, t) => {
  kc.init(e, t), N.init(e, t);
}), ad = /* @__PURE__ */ p("ZodE164", (e, t) => {
  Pc.init(e, t), N.init(e, t);
}), cd = /* @__PURE__ */ p("ZodJWT", (e, t) => {
  Ec.init(e, t), N.init(e, t);
}), rs = /* @__PURE__ */ p(
  "ZodNumber",
  (e, t) => {
    Ro.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => il(e, n, r, o), e.isFinite = !0;
  },
  /* @__PURE__ */ wo({
    minValue: (e) => {
      const { minimum: t, exclusiveMinimum: n } = ie(e);
      return Math.max(t ?? Number.NEGATIVE_INFINITY, n ?? Number.NEGATIVE_INFINITY);
    },
    maxValue: (e) => {
      const { maximum: t, exclusiveMaximum: n } = ie(e);
      return Math.min(t ?? Number.POSITIVE_INFINITY, n ?? Number.POSITIVE_INFINITY);
    },
    isInt: (e) => {
      const { isInt: t, multipleOf: n } = ie(e);
      return !!t || !!n?.some(Number.isSafeInteger);
    },
    format: (e) => ie(e).format ?? null
  }, {
    gt(e, t) {
      return this.check(/* @__PURE__ */ br(e, t));
    },
    gte(e, t) {
      return this.check(/* @__PURE__ */ Kt(e, t));
    },
    min(e, t) {
      return this.check(/* @__PURE__ */ Kt(e, t));
    },
    lt(e, t) {
      return this.check(/* @__PURE__ */ _r(e, t));
    },
    lte(e, t) {
      return this.check(/* @__PURE__ */ Jt(e, t));
    },
    max(e, t) {
      return this.check(/* @__PURE__ */ Jt(e, t));
    },
    int(e) {
      return this.check(Nr(e));
    },
    safe(e) {
      return this.check(Nr(e));
    },
    positive(e) {
      return this.check(/* @__PURE__ */ br(0, e));
    },
    nonnegative(e) {
      return this.check(/* @__PURE__ */ Kt(0, e));
    },
    negative(e) {
      return this.check(/* @__PURE__ */ _r(0, e));
    },
    nonpositive(e) {
      return this.check(/* @__PURE__ */ Jt(0, e));
    },
    multipleOf(e, t) {
      return this.check(/* @__PURE__ */ wr(e, t));
    },
    step(e, t) {
      return this.check(/* @__PURE__ */ wr(e, t));
    },
    finite() {
      return this;
    }
  })
);
function ce(e) {
  return /* @__PURE__ */ Ru(rs, e);
}
const ud = /* @__PURE__ */ p("ZodNumberFormat", (e, t) => {
  Cc.init(e, t), rs.init(e, t);
});
function Nr(e) {
  return /* @__PURE__ */ Mu(ud, e);
}
const ld = /* @__PURE__ */ p("ZodBoolean", (e, t) => {
  Oc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => al(e, n, r);
});
function le(e) {
  return /* @__PURE__ */ Uu(ld, e);
}
const dd = /* @__PURE__ */ p("ZodUnknown", (e, t) => {
  $c.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => ul();
});
function Tr() {
  return /* @__PURE__ */ Zu(dd);
}
const fd = /* @__PURE__ */ p("ZodNever", (e, t) => {
  Nc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => cl(e, n, r);
});
function hd(e) {
  return /* @__PURE__ */ Du(fd, e);
}
const pd = /* @__PURE__ */ p("ZodArray", (e, t) => {
  Dt(), Ic.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => hl(e, n, r, o), e.element = t.element;
}, {
  min(e, t) {
    return this.check(/* @__PURE__ */ zt(e, t));
  },
  nonempty(e) {
    return this.check(/* @__PURE__ */ zt(1, e));
  },
  max(e, t) {
    return this.check(/* @__PURE__ */ Lo(e, t));
  },
  length(e, t) {
    return this.check(/* @__PURE__ */ xo(e, t));
  },
  unwrap() {
    return this.element;
  }
});
function H(e, t) {
  return /* @__PURE__ */ Gu(pd, e, t);
}
const md = /* @__PURE__ */ p("ZodObject", (e, t) => {
  Dt(), Uc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => pl(e, n, r, o), Ri(e, "shape", (n) => n._zod.def.shape, !1);
}, {
  keyof() {
    return Un(Object.keys(this._zod.def.shape));
  },
  catchall(e) {
    return this.clone(G(this._zod.def, { catchall: e }));
  },
  passthrough() {
    return this.clone(G(this._zod.def, { catchall: Tr() }));
  },
  loose() {
    return this.clone(G(this._zod.def, { catchall: Tr() }));
  },
  strict() {
    return this.clone(G(this._zod.def, { catchall: hd() }));
  },
  strip() {
    return this.clone(G(this._zod.def, { catchall: void 0 }));
  },
  extend(e) {
    return ki(this, e);
  },
  safeExtend(e) {
    return Pi(this, e);
  },
  merge(e) {
    return zi(this, e);
  },
  pick(e) {
    return wi(this, e);
  },
  omit(e) {
    return Si(this, e);
  },
  partial(...e) {
    return tr(os, this, e[0]);
  },
  exactPartial(...e) {
    return tr(ss, this, e[0], "exactPartial");
  },
  required(...e) {
    return Ei(is, this, e[0]);
  }
});
function E(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...b(t)
  };
  return new md(n);
}
const gd = /* @__PURE__ */ p("ZodUnion", (e, t) => {
  Zc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => ml(e, n, r, o), e.options = t.options;
});
function vd(e, t) {
  return new gd({
    type: "union",
    options: e,
    ...b(t)
  });
}
const yd = /* @__PURE__ */ p("ZodIntersection", (e, t) => {
  Dc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => gl(e, n, r, o);
});
function _d(e, t) {
  return new yd({
    type: "intersection",
    left: e,
    right: t
  });
}
const Ar = /* @__PURE__ */ p("ZodRecord", (e, t) => {
  Dt(), Fc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => yl(e, n, r, o), e.keyType = t.keyType, e.valueType = t.valueType;
});
function tt(e, t, n) {
  return !t || !t._zod ? new Ar({
    type: "record",
    keyType: M(),
    valueType: e,
    ...b(t)
  }) : new Ar({
    type: "record",
    keyType: e,
    valueType: t,
    ...b(n)
  });
}
const fn = /* @__PURE__ */ p("ZodEnum", (e, t) => {
  jc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (r, o, s) => ll(e, r, o), e.enum = t.entries, e.options = [...e._zod.values];
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, o) => {
    const s = {};
    for (const i of r)
      if (n.has(i))
        s[i] = t.entries[i];
      else
        throw new Error(`Key ${i} not found in enum`);
    return new fn({
      ...t,
      checks: [],
      ...b(o),
      entries: s
    });
  }, e.exclude = (r, o) => {
    const s = { ...t.entries };
    for (const i of r)
      if (n.has(i))
        delete s[i];
      else
        throw new Error(`Key ${i} not found in enum`);
    return new fn({
      ...t,
      checks: [],
      ...b(o),
      entries: s
    });
  };
});
function Un(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new fn({
    type: "enum",
    entries: n,
    ...b(t)
  });
}
const bd = /* @__PURE__ */ p("ZodTransform", (e, t) => {
  Dt(), Lc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => fl(e, n, r, o), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new So(e.constructor.name);
    n.addIssue = (s) => {
      if (typeof s == "string")
        n.issues.push(et(s, n.value, t));
      else {
        const i = s;
        i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), "input" in i || (i.input = n.value), i.inst ?? (i.inst = e), n.issues.push(et(i));
      }
    };
    const o = t.transform(n.value, n);
    return o instanceof Promise ? o.then((s) => (n.value = s, n)) : (n.value = o, n);
  };
});
function wd(e) {
  return new bd({
    type: "transform",
    transform: e
  });
}
const os = /* @__PURE__ */ p("ZodOptional", (e, t) => {
  Zo.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => es(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Ir(e) {
  return new os({
    type: "optional",
    innerType: e
  });
}
const ss = /* @__PURE__ */ p("ZodExactOptional", (e, t) => {
  xc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => es(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Sd(e) {
  return new ss({
    type: "optional",
    innerType: e
  });
}
const kd = /* @__PURE__ */ p("ZodNullable", (e, t) => {
  Bc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => _l(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Rr(e) {
  return new kd({
    type: "nullable",
    innerType: e
  });
}
const Pd = /* @__PURE__ */ p("ZodDefault", (e, t) => {
  Wc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => wl(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function zd(e, t) {
  return new Pd({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : go(t);
    }
  });
}
const Ed = /* @__PURE__ */ p("ZodPrefault", (e, t) => {
  Hc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => Sl(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Cd(e, t) {
  return new Ed({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : go(t);
    }
  });
}
const is = /* @__PURE__ */ p("ZodNonOptional", (e, t) => {
  Vc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => bl(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Od(e, t) {
  return new is({
    type: "nonoptional",
    innerType: e,
    ...b(t)
  });
}
const $d = /* @__PURE__ */ p("ZodCatch", (e, t) => {
  Jc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => kl(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Nd(e, t) {
  return new $d({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : Ui(t)
  });
}
const Td = /* @__PURE__ */ p("ZodPipe", (e, t) => {
  Kc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => Pl(e, n, r, o), e.in = t.in, e.out = t.out;
});
function Mr(e, t) {
  return new Td({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Ad = /* @__PURE__ */ p("ZodReadonly", (e, t) => {
  Yc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => zl(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Id(e) {
  return new Ad({
    type: "readonly",
    innerType: e
  });
}
const Rd = /* @__PURE__ */ p("ZodCustom", (e, t) => {
  Gc.init(e, t), I.init(e, t), e._zod.processJSONSchema = (n, r, o) => dl(e, n, r, o);
});
function Md(e, t = {}) {
  return /* @__PURE__ */ qu(Rd, e, t);
}
function Ud(e, t) {
  return /* @__PURE__ */ Xu(e, t);
}
const Zd = ["hour", "day", "week", "month"], as = ["online", "error", "offline", "sleep", "maintenance"], Dd = ["pool", "network"], Fd = Un(Zd), we = ce().int().nonnegative(), me = ce().int().nonnegative(), C = ce().nonnegative(), w = ce().nullable();
E({
  statusCode: ce().int(),
  error: M(),
  message: M()
});
const Zn = E({ id: M(), name: M() }), Dn = E({
  id: M(),
  displayName: M(),
  vendor: M().nullable(),
  nominalHashrateThs: C.nullable(),
  nominalPowerW: C.nullable()
}), Fn = E({
  start: ce().int(),
  end: ce().int(),
  granularity: Fd,
  timezone: M()
}), jd = E({
  miners: le(),
  pool: le(),
  /** The pool's recent payouts carry the subsidy / fee split. */
  poolSplit: le(),
  /** The pool reports its own fee per payout, so gross revenue is known. */
  poolFee: le(),
  market: le(),
  /** At least one power meter other than the site meter. */
  meters: le(),
  siteMeter: le(),
  /** At least one month has a cost on Cost Input. */
  costs: le()
}), Ld = E({
  site: E({ name: M(), timezone: M() }),
  miningUnits: H(Zn),
  models: H(Dn),
  meters: H(E({ id: M(), label: M(), siteMeter: le() })),
  sources: jd,
  /** First and last stored miner sample; null before the first sample. */
  history: E({ firstTs: we.nullable(), lastTs: we.nullable() }),
  collector: E({
    kernelConnected: le(),
    lastSampleAt: we.nullable(),
    lastError: M().nullable(),
    sampleIntervalSec: ce().positive()
  })
}), Yt = E({
  site: w,
  byUnit: tt(M(), w),
  byModel: tt(M(), w)
}), Gt = E({
  hashrateThs: C,
  powerW: C,
  efficiencyWThs: w
}), xd = E({
  online: C,
  error: C,
  offline: C,
  sleep: C,
  maintenance: C
}), cs = E({
  /** Seconds the samples cover. */
  coveredSec: C,
  hashrateThs: Yt,
  powerW: Yt,
  energyMWh: C,
  efficiencyWThs: Yt,
  nominal: Gt.extend({
    byUnit: tt(M(), Gt),
    byModel: tt(M(), Gt)
  }),
  /** Average miners in the fleet. */
  miners: C,
  status: xd
}), Bd = cs.extend({ ts: we }), Wd = E({
  range: Fn,
  units: H(Zn),
  models: H(Dn),
  /** Buckets with at least one sample, in time order. */
  buckets: H(Bd),
  /** The whole period; null when it has no samples. */
  summary: cs.nullable()
}), hn = E({
  total: me,
  offline: me,
  error: me,
  sleep: me,
  low: me,
  normal: me,
  high: me,
  maintenance: me,
  powerW: C
}), Hd = Dn.extend(hn.shape), us = E({
  /** When the latest sample was taken; null before the first one. */
  ts: we.nullable(),
  intervalS: C.optional(),
  models: H(Hd),
  /** Every configured mining unit; the counts are absent for a unit with no miners sampled. */
  units: H(Zn.extend(hn.partial().shape)),
  site: hn.nullable()
}), Ur = E({ id: M(), label: M() }), Vd = E({
  range: Fn,
  /** The power meters other than the site meter. */
  meters: H(Ur),
  siteMeter: Ur.nullable(),
  buckets: H(
    E({
      ts: we,
      /** MWh per meter id; null when the meter has no sample in the bucket. */
      byMeter: tt(M(), C.nullable()),
      siteMeterMWh: C.nullable()
    })
  )
}), ls = E({
  // Pool payouts.
  payouts: me,
  /** Net of the pool fee: what the pool paid. */
  btc: C,
  /** The pool's fee on those payouts; null when the pool doesn't report it. */
  poolFeeBtc: C.nullable(),
  /** Net plus the pool fee. */
  grossBtc: C.nullable(),
  /** Block subsidy and transaction fees within `btc` (`split` on the report says where from). */
  subsidyBtc: C.nullable(),
  feesBtc: C.nullable(),
  feePercent: w,
  // Market, from the market-data worker.
  /** Mean daily BTC price. */
  priceUsd: w,
  /** Each payout at its day's price (production-date price). */
  revenueUsd: w,
  grossRevenueUsd: w,
  networkHashrateHs: w,
  networkHashpriceUsdPerPhsDay: w,
  networkHashpriceBtcPerPhsDay: w,
  /** The network's typical transaction fee rate: the mean of its daily median block fee rates. */
  networkFeeRateSatsVb: w,
  // Operations, from the miner samples.
  /** Seconds the miner samples cover. */
  coveredSec: C,
  hashrateThs: w,
  powerW: w,
  energyMWh: C,
  nominalHashrateThs: w,
  nominalPowerW: w,
  nominalEnergyMWh: C,
  /** Share of miner-time online (mining in any power mode). */
  uptimePercent: w,
  /** Hashrate over the fleet's nominal hashrate. */
  capacityFactorPercent: w,
  // Costs, from Cost Input: each month's totals prorated over the time the bucket covers.
  energyCostUsd: w,
  operationsCostUsd: w,
  allInCostUsd: w,
  // Derived. Net figures use `btc` and `revenueUsd`, gross ones `grossBtc` and `grossRevenueUsd`.
  revenueUsdPerMWh: w,
  grossRevenueUsdPerMWh: w,
  revenueSatsPerMWh: w,
  grossRevenueSatsPerMWh: w,
  hashRevenueUsdPerPhsDay: w,
  grossHashRevenueUsdPerPhsDay: w,
  hashRevenueSatsPerPhsDay: w,
  grossHashRevenueSatsPerPhsDay: w,
  energyCostUsdPerMWh: w,
  operationsCostUsdPerMWh: w,
  allInCostUsdPerMWh: w,
  hashCostUsdPerPhsDay: w,
  hashCostSatsPerPhsDay: w,
  /** All-in cost per BTC mined. */
  productionCostUsdPerBtc: w
}), Jd = ls.extend({ ts: we }), Kd = E({
  range: Fn,
  /** The latest BTC price (report price); null without market data. */
  latestPriceUsd: w,
  /** Where the subsidy / fee split comes from; null when no payout has one. */
  split: Un(Dd).nullable(),
  /** Buckets with miner samples or payouts, in time order. */
  buckets: H(Jd),
  /** The whole period; null when it has no samples and no payouts. */
  summary: ls.nullable()
}), Zr = ce().nonnegative().max(1e12).nullable(), ds = E({
  month: ce().int().min(1).max(12),
  energyUsd: Zr,
  operationsUsd: Zr
}), Yd = 2e3, Gd = 2100, fs = ce().int().min(Yd).max(Gd), hs = E({
  year: fs,
  months: H(ds.extend({ updatedAt: we.nullable() })).length(12)
});
E({
  year: fs,
  months: H(ds).min(1).max(12)
});
const $e = {
  SITE: "/api/reporting/site",
  OPERATIONS: "/api/reporting/operations",
  MINERS: "/api/reporting/miners",
  CONSUMPTION: "/api/reporting/consumption",
  FINANCIALS: "/api/reporting/financials",
  COSTS: "/api/reporting/costs"
}, ps = async (e, t) => t.parse(await oo(e)), qd = async (e, t, n) => n.parse(
  await oo(e, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  })
), jn = (e, t) => {
  const n = new URLSearchParams({
    start: String(t.start),
    end: String(t.end),
    granularity: t.granularity
  });
  return `${e}?${n.toString()}`;
}, nt = "reporting", Xd = 6e4, Ln = "Check that the reporting app is running in the stack (`mdk run`), then reload.", Qd = (e) => e;
function He(e, t, n = {}) {
  const r = Ns({
    queryKey: [nt, e],
    queryFn: () => ps(e, t),
    refetchInterval: Xd,
    placeholderData: n.keepPrevious === !0 ? Qd : void 0
  });
  return r.error instanceof El ? {
    status: "error",
    message: `${e} answered with a body that does not match the contract.`
  } : Ts(r, e, { unreachableHint: Ln });
}
const ef = () => {
  const { apiUrl: e } = ye();
  return He(e($e.SITE), Ld);
}, ms = Ys(null), tf = ({ children: e }) => {
  const t = ef();
  return t.status === "loading" ? /* @__PURE__ */ l("div", { className: "reporting-center", children: /* @__PURE__ */ l(rt, {}) }) : t.status === "error" ? /* @__PURE__ */ l("div", { className: "reporting-center", children: /* @__PURE__ */ l(Le, { title: "The reporting app is not reachable", error: t.message }) }) : /* @__PURE__ */ l(ms.Provider, { value: t.data, children: e });
};
function re() {
  const e = Gs(ms);
  if (e === null) throw new Error("useSiteInfo outside SiteGate");
  return e;
}
const oe = (e) => {
  const t = () => /* @__PURE__ */ l(tf, { children: /* @__PURE__ */ l(e, {}) });
  return t.displayName = `WithSite(${e.displayName ?? e.name})`, t;
};
function Q(e, t) {
  const n = e.status === "ready" ? e.data : void 0, r = xe(
    () => n === void 0 ? void 0 : { value: t(n) },
    [n, t]
  );
  return e.status === "error" ? e : r === void 0 ? { status: "loading" } : { status: "ready", data: r.value };
}
const Ve = (e) => {
  const { apiUrl: t } = ye();
  return He(jn(t($e.OPERATIONS), e), Wd, {
    keepPrevious: !0
  });
}, Ue = {
  hashrate: {
    key: "hashrate",
    label: "Hashrate",
    cut: (e) => e.hashrateThs,
    nominal: (e) => e.hashrateThs,
    unitFor: (e) => Yn(wn, e)
  },
  power: {
    key: "power",
    label: "Power Consumption",
    cut: (e) => e.powerW,
    nominal: (e) => e.powerW,
    unitFor: (e) => Yn(Nt, e)
  },
  efficiency: {
    key: "efficiency",
    label: "Efficiency",
    cut: (e) => e.efficiencyWThs,
    nominal: (e) => e.efficiencyWThs,
    unitFor: () => ({ unit: bn.EFFICIENCY_W_PER_TH_S, factor: 1 })
  }
}, gs = (e) => e.reduce((t, n) => typeof n == "number" && n > t ? n : t, 0), pn = (e, t) => e.map((n) => typeof n == "number" ? n / t : null), z = {
  actual: J.blue,
  nominal: J.red,
  online: se.GRASS_GREEN,
  error: se.BRICK_RED,
  offline: se.DARK_GREY,
  sleep: se.SLEEP_BLUE,
  maintenance: se.ORANGE_WARNING,
  // Power modes, as the design colours them.
  low: se.BRIGHT_YELLOW,
  normal: se.GRASS_GREEN,
  high: se.EMERALD,
  // Money series, the same on every Financials page.
  // As the design draws them: revenue green, cost purple (production cost
  // green beside the orange BTC price), the network's hashprice blue.
  revenue: J.green,
  cost: J.purple,
  productionCost: J.green,
  network: J.blue,
  // Hash Balance's own design: the site's hash revenue red, hashprice purple.
  hashRevenue: J.red,
  hashprice: J.purple,
  subsidy: se.INDIGO,
  fees: se.BLUE_SEA,
  feePercent: J.red,
  feeRate: J.purple,
  price: J.orange,
  energyCost: J.blue,
  operationsCost: J.purple
}, xn = (e) => Gn[e % Gn.length] ?? se.COLD_ORANGE, q = "all", Ft = (e) => e.buckets.map((t) => ci(t.ts, e.range.granularity, e.range.timezone));
function gt(e, t, n = {}) {
  const r = n.model ?? q, o = n.title ?? t.label, s = n.withNominal ?? !0, i = e.buckets.map(
    (f) => r === q ? t.cut(f).site : t.cut(f).byModel[r] ?? null
  ), a = e.buckets.map((f) => {
    if (r === q) return t.nominal(f.nominal);
    const h = f.nominal.byModel[r];
    return h === void 0 ? null : t.nominal(h);
  }), { unit: u, factor: c } = t.unitFor(gs(s ? [...i, ...a] : i)), d = [
    { label: o, values: pn(i, c), color: z.actual, type: "line" }
  ];
  return s && d.push({
    label: `Nominal ${o}`,
    values: pn(a, c),
    color: z.nominal,
    type: "line",
    dashed: !0
  }), { labels: Ft(e), unit: u, series: d, empty: e.buckets.length === 0 };
}
function nf(e, t, n, r = q) {
  const o = n === "model" ? e.models.map((c) => ({ id: c.id, label: c.displayName })) : e.units.filter((c) => r === q || c.id === r).map((c) => ({ id: c.id, label: c.name })), s = e.summary === null ? null : t.cut(e.summary), i = o.map((c) => s === null ? null : (n === "model" ? s.byModel[c.id] : s.byUnit[c.id]) ?? null), { unit: a, factor: u } = t.unitFor(gs(i));
  return {
    labels: o.map((c) => c.label),
    unit: a,
    series: [{ label: t.label, values: pn(i, u), color: xn(0) }],
    empty: e.summary === null
  };
}
function rf(e, t, n = q) {
  const r = e.summary;
  if (r === null) return null;
  if (n === q) return { actual: t.cut(r).site, nominal: t.nominal(r.nominal) };
  const o = r.nominal.byModel[n];
  return {
    actual: t.cut(r).byModel[n] ?? null,
    nominal: o === void 0 ? null : t.nominal(o)
  };
}
const of = {
  online: "Online",
  error: "Error",
  offline: "Offline",
  sleep: "Sleep",
  maintenance: "Maintenance"
}, vs = (e, t = as) => ({
  labels: Ft(e),
  unit: "miners",
  series: t.map((n) => ({
    label: of[n],
    values: e.buckets.map((r) => r.status[n]),
    color: z[n],
    stack: "status"
  })),
  empty: e.buckets.length === 0
}), sf = (e) => ({
  hashrate: gt(e, Ue.hashrate, { title: "Hashrate" }),
  power: gt(e, Ue.power, { title: "Power Consumption", withNominal: !1 }),
  efficiency: gt(e, Ue.efficiency, { title: "Site Efficiency" }),
  status: vs(e),
  empty: e.buckets.length === 0
}), af = (e) => Q(Ve(e), sf), cf = (e) => X(e, 0), uf = (e) => e.empty, lf = () => {
  const e = re().site.timezone, t = Pe(Ee(), e, { preset: "30d" }), n = af(t.query), r = j(n, uf), o = n.status === "ready" ? n.data : void 0;
  return /* @__PURE__ */ l(_e, { title: "Dashboard", actions: /* @__PURE__ */ l(ze, { state: t, timezone: e }), children: /* @__PURE__ */ _("div", { className: "reporting-grid", children: [
    /* @__PURE__ */ l($, { title: "Hashrate", state: r, expandable: !0, children: o === void 0 ? null : /* @__PURE__ */ l(U, { height: 240, ...o.hashrate }) }),
    /* @__PURE__ */ l($, { title: "Power Consumption", state: r, expandable: !0, children: o === void 0 ? null : /* @__PURE__ */ l(U, { height: 240, ...o.power }) }),
    /* @__PURE__ */ l($, { title: "Site Efficiency", state: r, expandable: !0, titleExtra: /* @__PURE__ */ l(io, {}), children: o === void 0 ? null : /* @__PURE__ */ l(U, { height: 240, ...o.efficiency }) }),
    /* @__PURE__ */ l($, { title: "Miners Status", state: r, expandable: !0, children: o === void 0 ? null : /* @__PURE__ */ l(U, { stacked: !0, formatValue: cf, ...o.status }) })
  ] }) });
}, Dr = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
], Fr = [
  { key: "energyUsd", header: "Monthly Energy Cost", label: "energy" },
  { key: "operationsUsd", header: "Monthly Operations Cost", label: "operations" }
], mn = (e, t) => Number(new Intl.DateTimeFormat("en-US", { timeZone: t, year: "numeric" }).format(e)), df = (e, t, n = Date.now()) => {
  const r = mn(n, t), o = r + 1, s = Math.min(e === null ? r : mn(e, t), r);
  return Array.from({ length: o - s + 1 }, (i, a) => o - a);
}, ff = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}), gn = (e) => e === null ? "" : ff.format(e), vn = (e) => e.months.map((t) => ({
  month: t.month,
  energyUsd: gn(t.energyUsd),
  operationsUsd: gn(t.operationsUsd)
})), de = (e) => {
  const t = e.trim().replace(/,/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : void 0;
}, hf = (e) => {
  const t = de(e);
  return t === void 0 ? e : gn(t);
}, ys = (e) => de(e.energyUsd) !== void 0 && de(e.operationsUsd) !== void 0;
function pf(e, t, n) {
  const r = [];
  for (const o of n) {
    const s = de(o.energyUsd), i = de(o.operationsUsd);
    if (s === void 0 || i === void 0) return null;
    const a = t.months.find((u) => u.month === o.month);
    a !== void 0 && a.energyUsd === s && a.operationsUsd === i || r.push({ month: o.month, energyUsd: s, operationsUsd: i });
  }
  return r.length === 0 ? null : { year: e, months: r };
}
const mf = (e, t) => vn(e).some(
  (n, r) => de(n.energyUsd) !== de(t[r]?.energyUsd ?? "") || de(n.operationsUsd) !== de(t[r]?.operationsUsd ?? "") || t[r] !== void 0 && !ys(t[r])
), _s = (e, t) => `${e}?year=${t}`, gf = (e) => {
  const { apiUrl: t } = ye();
  return He(_s(t($e.COSTS), e), hs);
}, vf = () => {
  const e = Kr(), { apiUrl: t } = ye(), [n, r] = F(!1), [o, s] = F(null);
  return { save: x(
    async (a) => {
      const u = t($e.COSTS);
      r(!0), s(null);
      try {
        const c = await qd(u, a, hs);
        return e.setQueryData([nt, _s(u, a.year)], c), await e.invalidateQueries({ queryKey: [nt] }), !0;
      } catch (c) {
        return s(so(c, u, { unreachableHint: Ln })), !1;
      } finally {
        r(!1);
      }
    },
    [e, t]
  ), saving: n, error: o };
}, yf = () => {
  const { site: e, history: t } = re(), n = xe(
    () => df(t.firstTs, e.timezone),
    [t.firstTs, e.timezone]
  ), [r, o] = F(() => mn(Date.now(), e.timezone)), s = gf(r);
  return /* @__PURE__ */ _(_e, { title: "Cost Input", children: [
    /* @__PURE__ */ _("div", { className: "reporting-page__header", children: [
      /* @__PURE__ */ l(Yr, { variant: "body", children: "Monthly Costs" }),
      /* @__PURE__ */ _(qr, { value: String(r), onValueChange: (i) => o(Number(i)), children: [
        /* @__PURE__ */ l(Xr, { className: "reporting-period__granularity", children: /* @__PURE__ */ l(Qr, {}) }),
        /* @__PURE__ */ l(eo, { children: n.map((i) => /* @__PURE__ */ l(tn, { value: String(i), children: i }, i)) })
      ] })
    ] }),
    s.status === "loading" ? /* @__PURE__ */ l(rt, {}) : null,
    s.status === "error" ? /* @__PURE__ */ l(Le, { title: "Could not load", error: s.message }) : null,
    s.status === "ready" ? (
      // A new draft for each year and each save.
      /* @__PURE__ */ l(bf, { year: r, saved: s.data }, `${r}-${_f(s.data)}`)
    ) : null
  ] });
}, _f = (e) => e.months.reduce((t, n) => Math.max(t, n.updatedAt ?? 0), 0), bf = ({ year: e, saved: t }) => {
  const [n, r] = F(() => vn(t)), { save: o, saving: s, error: i } = vf(), a = xe(() => pf(e, t, n), [e, t, n]), u = n.every(ys), c = (f, h, m) => r((g) => g.map((y) => y.month === f ? { ...y, [h]: m } : y)), d = mf(t, n);
  return /* @__PURE__ */ _(te, { children: [
    /* @__PURE__ */ _("table", { className: "reporting-costs", children: [
      /* @__PURE__ */ l("thead", { children: /* @__PURE__ */ _("tr", { children: [
        /* @__PURE__ */ l("th", { children: "Month" }),
        Fr.map((f) => /* @__PURE__ */ l("th", { children: f.header }, f.key))
      ] }) }),
      /* @__PURE__ */ l("tbody", { children: n.map((f) => /* @__PURE__ */ _("tr", { children: [
        /* @__PURE__ */ l("td", { children: Dr[f.month - 1] }),
        Fr.map(({ key: h, label: m }) => /* @__PURE__ */ l("td", { children: /* @__PURE__ */ l(
          Ls,
          {
            inputMode: "decimal",
            prefix: "$",
            wrapperClassName: "reporting-costs__input",
            "aria-label": `${Dr[f.month - 1]} ${m} cost`,
            "aria-invalid": de(f[h]) === void 0,
            value: f[h],
            placeholder: "Cost in USD",
            onChange: (g) => c(f.month, h, g.target.value),
            onBlur: () => c(f.month, h, hf(f[h]))
          }
        ) }, h))
      ] }, f.month)) })
    ] }),
    /* @__PURE__ */ _("div", { className: "reporting-costs__footer", children: [
      u ? null : /* @__PURE__ */ l("span", { className: "reporting-snapshot__error", children: "Enter amounts as non-negative numbers, or leave them blank." }),
      i === null ? null : /* @__PURE__ */ l("span", { className: "reporting-snapshot__error", children: i }),
      d ? /* @__PURE__ */ l(Ze, { variant: "secondary", disabled: s, onClick: () => r(vn(t)), children: "Discard changes" }) : null,
      /* @__PURE__ */ l(
        Ze,
        {
          variant: "primary",
          disabled: a === null || s,
          onClick: () => {
            a !== null && o(a);
          },
          children: s ? "Saving…" : "Save Costs"
        }
      )
    ] })
  ] });
}, Bn = () => {
  const e = Ks();
  return /* @__PURE__ */ l(Ze, { variant: "secondary", onClick: () => {
    e(`../${K.COST_INPUT}`);
  }, children: "Set Monthly Cost" });
}, wf = (e) => {
  const t = [e.detail, e.subtitle].filter((n) => n !== void 0);
  return t.length === 0 ? void 0 : t.map((n) => /* @__PURE__ */ l("div", { children: n }, n));
}, Re = ({ tiles: e, columns: t, className: n }) => {
  const r = ["reporting-tiles"];
  return t !== void 0 && r.push(`reporting-tiles--${t}`), n !== void 0 && r.push(n), /* @__PURE__ */ l("div", { className: r.join(" "), children: e.map((o) => {
    const s = {
      variant: "secondary",
      name: o.name,
      ...o.caption === void 0 ? {} : { caption: o.caption }
    }, i = `${o.name}-${o.caption ?? ""}`;
    return o.missing === void 0 ? /* @__PURE__ */ l(
      qe,
      {
        ...s,
        value: o.value,
        ...o.tag === void 0 ? {} : { tag: o.tag },
        ...o.accent === !0 ? { className: "reporting-tile--accent" } : {},
        detail: wf(o)
      },
      i
    ) : /* @__PURE__ */ l(
      qe,
      {
        ...s,
        className: "reporting-tile--not-wired",
        detail: /* @__PURE__ */ l(At, { source: o.missing, size: "inline" })
      },
      i
    );
  }) });
}, bs = ["USD", "BTC"], Sf = (e) => bs.some((t) => t === e), Wn = (e) => e === "USD" ? 2 : 8, Hn = (e, t) => t === null ? e : e.map((n) => n.needs === "costs" ? { ...n, missing: t } : n), W = (e, t, n) => {
  for (const r of e) {
    if (r === "pool" && !t.pool) return "pool";
    if (r === "market" && !t.market) return "market";
    if (r === "costs" && !t.costs) return "costs";
    const o = n !== void 0 && (n.summary?.payouts ?? 0) > 0;
    if (r === "poolSplit" && o && n.split !== "pool") return "poolSplit";
    if (r === "split" && o && n.split === null) return "split";
  }
  return e.includes("costs") && n !== void 0 && n.summary !== null && n.summary.allInCostUsd === null ? "costs" : null;
}, ee = (e, t, n, r) => {
  const o = n.map(({ read: i, ...a }) => ({ ...a, values: e.buckets.map(i) })), s = {
    labels: Ft(e),
    unit: t,
    series: o,
    empty: o.every((i) => i.values.every((a) => a === null || a === 0))
  };
  return r !== void 0 && (s.rightUnit = r), s;
}, Ot = (e, t, n = 1) => e === null || t === null || t === 0 ? null : e / t * n, jr = (e) => e === null ? null : e / 1e3;
function kf(e) {
  const t = e.summary, n = (r, o, s, i = !1) => ({
    name: r,
    needs: "costs",
    accent: i,
    value: fe(o, T.USD_PER_MWH),
    subtitle: `${Ke(s)} in the period`
  });
  return {
    tiles: [
      n("All-in Cost", t?.allInCostUsdPerMWh ?? null, t?.allInCostUsd ?? null, !0),
      n("Energy Cost", t?.energyCostUsdPerMWh ?? null, t?.energyCostUsd ?? null),
      n("Operations Cost", t?.operationsCostUsdPerMWh ?? null, t?.operationsCostUsd ?? null)
    ],
    productionCost: ee(e, T.KUSD_PER_BTC, [
      { label: "BTC Price", color: z.price, read: (r) => jr(r.priceUsd) },
      {
        label: "Production Cost",
        color: z.productionCost,
        read: (r) => jr(r.productionCostUsdPerBtc)
      }
    ]),
    allInCost: ee(e, T.USD_PER_MWH, [
      { label: "All-in Cost", color: z.cost, read: (r) => r.allInCostUsdPerMWh }
    ]),
    split: t === null || t.energyCostUsdPerMWh === null || t.operationsCostUsdPerMWh === null ? null : { energyCostsUSD: t.energyCostUsdPerMWh, operationalCostsUSD: t.operationsCostUsdPerMWh }
  };
}
const qt = 1e6, Pf = (e) => e === "USD" ? T.USD_PER_MWH : T.BTC_PER_MWH, Xt = (e, t) => t === "USD" ? { revenue: e.revenueUsdPerMWh, cost: e.allInCostUsdPerMWh } : {
  revenue: e.revenueSatsPerMWh === null ? null : e.revenueSatsPerMWh / It,
  cost: Ot(e.allInCostUsdPerMWh, e.priceUsd)
};
function zf(e, t, n, r = null) {
  const o = Pf(t), s = e.summary, i = (c, d, f = !1) => ({
    name: c,
    value: fe(d ?? null, T.USD_PER_MWH),
    ...f ? { needs: "costs" } : {}
  }), a = (c, d) => ({
    name: c,
    value: fe(d == null ? null : d / qt, "MW", 2)
  }), u = [
    {
      label: "Revenue",
      color: z.revenue,
      read: (c) => Xt(c, t).revenue
    }
  ];
  return n && u.unshift({
    label: "All-In Cost",
    color: z.cost,
    read: (c) => Xt(c, t).cost
  }), {
    revenueTiles: [
      {
        name: "Bitcoin Revenue",
        value: bt(s?.btc ?? null, "BTC"),
        subtitle: "From pool payouts",
        ...r === null ? {} : { missing: r }
      }
    ],
    revenue: ee(e, o, [
      {
        label: "Site Energy Revenue",
        color: z.revenue,
        read: (c) => Xt(c, t).revenue
      }
    ]),
    revenueVsCost: ee(e, o, u),
    power: ee(e, "MW", [
      {
        label: "Power Consumption",
        color: z.actual,
        type: "line",
        read: (c) => Ot(c.powerW, qt)
      },
      {
        label: "Nominal Power Consumption",
        color: z.nominal,
        type: "line",
        dashed: !0,
        read: (c) => Ot(c.nominalPowerW, qt)
      }
    ]),
    costTiles: [
      a("Avg Power Consumption", s?.powerW),
      i("Avg Energy Cost", s?.energyCostUsdPerMWh, !0),
      i("Avg All-In Cost", s?.allInCostUsdPerMWh, !0),
      a("Avg Nominal Power Consumption", s?.nominalPowerW),
      i("Avg Operations Cost", s?.operationsCostUsdPerMWh, !0),
      i("Avg Energy Revenue", s?.revenueUsdPerMWh)
    ]
  };
}
const Ef = 1e18, Lr = (e) => e === null ? null : e / It, xr = (e, t) => t === "USD" ? {
  revenue: e.hashRevenueUsdPerPhsDay,
  cost: e.hashCostUsdPerPhsDay,
  network: e.networkHashpriceUsdPerPhsDay
} : {
  revenue: Lr(e.hashRevenueSatsPerPhsDay),
  cost: Lr(e.hashCostSatsPerPhsDay),
  network: e.networkHashpriceBtcPerPhsDay
}, Cf = (e) => e === "USD" ? T.USD_PER_PHS_DAY : T.BTC_PER_PHS_DAY;
function Of(e, t, n) {
  const r = Cf(t), o = Wn(t), s = e.summary === null ? null : xr(e.summary, t), i = (c, d) => ({
    name: c,
    value: fe(d ?? null, r, o)
  }), a = (c) => (d) => xr(d, t)[c], u = [
    { label: "Hash Revenue", color: z.revenue, read: a("revenue") },
    { label: "Network Hashprice", color: z.network, read: a("network") }
  ];
  return n && u.unshift({ label: "Hash Cost", color: z.cost, read: a("cost") }), {
    revenueTiles: [
      i("Avg Hash Revenue", s?.revenue),
      i("Avg Network Hashprice", s?.network)
    ],
    costTiles: [
      { ...i("Avg Hash Cost", s?.cost), needs: "costs" },
      i("Avg Hash Revenue", s?.revenue),
      i("Avg Network Hashprice", s?.network)
    ],
    siteRevenue: ee(e, r, [
      { label: "Site Hash Revenue", color: z.hashRevenue, read: a("revenue") }
    ]),
    networkHashrate: ee(e, "EH/s", [
      {
        label: "Network Hashrate",
        color: z.price,
        type: "line",
        read: (c) => c.networkHashrateHs === null ? null : c.networkHashrateHs / Ef
      }
    ]),
    networkHashprice: ee(e, r, [
      { label: "Network Hashprice", color: z.hashprice, read: a("network") }
    ]),
    costRevenueNetwork: ee(e, r, u)
  };
}
const ws = [
  { value: "BTC", label: "BTC" },
  { value: "sats", label: "sats" },
  { value: "receipt", label: "USD at Receipt" },
  { value: "report", label: "USD at Report" }
], $f = (e) => ws.some((t) => t.value === e), ft = (e, t, n, r, o, s, i) => ({
  name: e,
  caption: t,
  ...i === null ? {} : { missing: i },
  value: fe(n, o, s),
  tag: "Net",
  subtitle: r === null ? "Gross: pool fee not reported" : `Gross ${fe(r, o, s)}`
});
function Nf(e, t, n) {
  const r = e.summary, o = W(["pool"], t), s = W(["pool", "market"], t), i = r?.btc ?? null, a = i === null || e.latestPriceUsd === null ? null : i * e.latestPriceUsd, u = (h, m) => h == null ? fe(null, "") : m(h), c = [
    {
      name: "Total Bitcoin",
      value: bt(i, n),
      accent: !0,
      // The same amount in the other unit, as the design shows it.
      ...i === null ? {} : { detail: bt(i, n === "BTC" ? "sats" : "BTC") },
      subtitle: "From pool payouts",
      ...o === null ? {} : { missing: o }
    },
    {
      name: "Revenue at Receipt Price",
      value: Ke(r?.revenueUsd ?? null),
      subtitle: `Effective ${Ke(Ot(r?.revenueUsd ?? null, i))}/BTC`,
      ...s === null ? {} : { missing: s }
    },
    {
      name: "Revenue at Report Price",
      value: Ke(a),
      subtitle: `Current ${Ke(e.latestPriceUsd)}/BTC`,
      ...s === null ? {} : { missing: s }
    }
  ], d = [
    ft(
      "Avg Mining Revenue per MWh",
      "At Prod. Date Price",
      r?.revenueUsdPerMWh ?? null,
      r?.grossRevenueUsdPerMWh ?? null,
      T.USD_PER_MWH,
      2,
      s
    ),
    ft(
      "Avg Hash Revenue",
      "At Prod. Date Price",
      r?.hashRevenueUsdPerPhsDay ?? null,
      r?.grossHashRevenueUsdPerPhsDay ?? null,
      T.USD_PER_PHS_DAY,
      2,
      s
    ),
    ft(
      "Avg Mining Revenue per MWh",
      "In Bitcoin Terms",
      r?.revenueSatsPerMWh ?? null,
      r?.grossRevenueSatsPerMWh ?? null,
      T.SATS_PER_MWH,
      0,
      o
    ),
    ft(
      "Avg Hash Revenue",
      "In Bitcoin Terms",
      r?.hashRevenueSatsPerPhsDay ?? null,
      r?.grossHashRevenueSatsPerPhsDay ?? null,
      T.SATS_PER_PHS_DAY,
      0,
      o
    ),
    {
      name: "Avg Power Consumption",
      value: u(r?.powerW, (h) => _t(yt(h, Nt)))
    },
    {
      name: "Avg Hashrate",
      value: u(r?.hashrateThs, (h) => _t(yt(h, wn)))
    },
    { name: "Mining Uptime", value: fe(r?.uptimePercent ?? null, T.PERCENT, 1) },
    {
      name: "Hashrate Capacity Factor",
      value: fe(r?.capacityFactorPercent ?? null, T.PERCENT, 1)
    }
  ], f = r === null || r.subsidyBtc === null || r.feesBtc === null ? null : {
    unit: n,
    slices: [
      { label: "Subsidy", value: r.subsidyBtc, color: z.subsidy },
      { label: "Fees", value: r.feesBtc, color: z.fees }
    ]
  };
  return { totals: c, metrics: d, split: f, empty: r === null || r.payouts === 0 };
}
const Tf = {
  BTC: { unit: T.BTC, read: (e) => e.btc },
  sats: { unit: T.SATS, read: (e) => e.btc * It },
  receipt: { unit: T.USD, read: (e) => e.revenueUsd },
  report: {
    unit: T.USD,
    read: (e, t) => t === null ? null : e.btc * t
  }
};
function Af(e, t, n) {
  const { unit: r, read: o } = Tf[t];
  return ee(e, r, [
    { label: n, color: z.revenue, read: (s) => o(s, e.latestPriceUsd) }
  ]);
}
const If = (e, t = "BTC") => {
  const n = (r) => r === null || t === "BTC" ? r : r * It;
  return ee(
    e,
    t === "BTC" ? T.BTC : T.SATS,
    [
      {
        label: "Subsidy",
        color: z.subsidy,
        stack: "split",
        read: (r) => n(r.subsidyBtc)
      },
      { label: "Fees", color: z.fees, stack: "split", read: (r) => n(r.feesBtc) },
      {
        label: "Fee %",
        color: z.feePercent,
        type: "line",
        axis: "right",
        read: (r) => r.feePercent
      }
    ],
    T.PERCENT
  );
}, Rf = (e) => ee(e, T.SATS_PER_VB, [
  { label: "Average Fee Rate", color: z.feeRate, read: (t) => t.networkFeeRateSatsVb }
]), ot = (e) => {
  const { apiUrl: t } = ye();
  return He(jn(t($e.FINANCIALS), e), Kd, {
    keepPrevious: !0
  });
}, Mf = (e, t, n) => {
  const { site: r, sources: o } = re();
  return Q(
    ot(e),
    x(
      (s) => ({
        ...Nf(s, o, t),
        chart: Af(s, n, r.name)
      }),
      [o, t, n, r.name]
    )
  );
}, Uf = (e, t) => Q(
  ot(e),
  x(
    (n) => ({
      chart: If(n, t),
      feeRate: Rf(n),
      report: n
    }),
    [t]
  )
), Zf = (e) => Q(
  ot(e),
  x((t) => ({ ...kf(t), report: t }), [])
), Df = (e, t, n) => Q(
  ot(e),
  x(
    (r) => ({ ...Of(r, t, n), report: r }),
    [t, n]
  )
), Ff = (e, t, n) => {
  const { sources: r } = re();
  return Q(
    ot(e),
    x(
      (o) => ({
        ...zf(o, t, n, W(["pool"], r)),
        report: o
      }),
      [t, n, r]
    )
  );
}, jf = (e) => e.productionCost.empty, Lf = (e) => e.allInCost.empty, xf = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), r = Zf(n.query), o = r.status === "ready" ? r.data : void 0, s = W(["costs"], t, o?.report);
  return /* @__PURE__ */ _(
    _e,
    {
      title: "Cost Summary",
      headerAction: /* @__PURE__ */ l(Bn, {}),
      actions: /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
      children: [
        /* @__PURE__ */ l($, { title: "Production Cost / Price", state: j(r, jf, s), children: o === void 0 ? null : /* @__PURE__ */ l(U, { showDataLabels: !0, formatValue: Bf, ...o.productionCost }) }),
        /* @__PURE__ */ _("div", { className: "reporting-costs-row", children: [
          s === null ? /* @__PURE__ */ l("div", { className: "reporting-card", children: /* @__PURE__ */ l(
            xs,
            {
              data: o?.split ?? void 0,
              isLoading: r.status === "loading",
              title: "Operations / Energy Cost"
            }
          ) }) : (
            // The devkit chart has no not-wired state: the card keeps its title over the message.
            /* @__PURE__ */ l(
              $,
              {
                title: "Operations / Energy Cost",
                state: { kind: "not-wired", source: s },
                notWiredSize: "short"
              }
            )
          ),
          o === void 0 ? /* @__PURE__ */ l("div", {}) : /* @__PURE__ */ l(Re, { columns: 1, tiles: Hn(o.tiles, s) }),
          /* @__PURE__ */ l($, { title: "Avg All-in Cost", state: j(r, Lf, s), children: o === void 0 ? null : /* @__PURE__ */ l(U, { height: 220, ...o.allInCost }) })
        ] })
      ]
    }
  );
}, Bf = (e) => X(e, 1), Ss = ({
  value: e,
  onChange: t
}) => /* @__PURE__ */ l(
  Tt,
  {
    currencies: [...bs],
    value: e,
    onChange: (n) => {
      Sf(n) && t(n);
    }
  }
), ks = ({
  value: e,
  onChange: t
}) => /* @__PURE__ */ l(co, { label: "Bitcoin Unit", children: /* @__PURE__ */ l(
  Tt,
  {
    currencies: [...lo],
    value: e,
    onChange: (n) => {
      ui(n) && t(n);
    }
  }
) }), Ps = ({ tabs: e, value: t, onChange: n }) => /* @__PURE__ */ l(
  Tt,
  {
    fullWidth: !0,
    currencies: e.map((r) => ({ value: r.value, label: r.label })),
    itemAriaLabel: (r) => `Show ${r}`,
    value: t,
    onChange: (r) => {
      const o = e.find((s) => s.value === r);
      o !== void 0 && n(o.value);
    }
  }
), Wf = [
  { value: "revenue", label: "Energy Revenue" },
  { value: "cost", label: "Energy Cost" }
], Qt = (e) => (t) => e(t).empty, Hf = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), [r, o] = F("revenue"), [s, i] = F("USD"), a = W(["costs"], t), u = Ff(n.query, s, a === null), c = u.status === "ready" ? u.data : void 0, d = W(["pool", "market"], t), f = W(["costs"], t, c?.report), h = Wn(s), m = (v) => X(v, h), g = /* @__PURE__ */ l(Ss, { value: s, onChange: i }), y = /* @__PURE__ */ l(
    $,
    {
      title: "Power",
      state: j(
        u,
        Qt((v) => v.power)
      ),
      children: c === void 0 ? null : /* @__PURE__ */ l(U, { ...c.power })
    }
  );
  return /* @__PURE__ */ _(
    _e,
    {
      title: "Energy Balance",
      headerAction: /* @__PURE__ */ l(Bn, {}),
      actions: /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
      children: [
        /* @__PURE__ */ l(Ps, { tabs: Wf, value: r, onChange: o }),
        r === "revenue" ? /* @__PURE__ */ _(te, { children: [
          c === void 0 ? null : /* @__PURE__ */ l(Re, { tiles: c.revenueTiles }),
          /* @__PURE__ */ l(
            $,
            {
              title: "Site Energy Revenue",
              state: j(
                u,
                Qt((v) => v.revenue),
                d
              ),
              headerAction: g,
              children: c === void 0 ? null : /* @__PURE__ */ l(U, { showDataLabels: !0, formatValue: m, ...c.revenue })
            }
          ),
          y
        ] }) : /* @__PURE__ */ _(te, { children: [
          c === void 0 ? null : /* @__PURE__ */ l(Re, { columns: 3, tiles: Hn(c.costTiles, f) }),
          /* @__PURE__ */ l(
            $,
            {
              title: "Site Revenue vs Cost",
              state: j(
                u,
                Qt((v) => v.revenueVsCost),
                d
              ),
              headerAction: g,
              children: c === void 0 ? null : /* @__PURE__ */ l(U, { showDataLabels: !0, formatValue: m, ...c.revenueVsCost })
            }
          ),
          f === null ? null : /* @__PURE__ */ l(At, { source: f, size: "inline" }),
          y
        ] })
      ]
    }
  );
}, Vf = [
  { value: "revenue", label: "Hash Revenue" },
  { value: "cost", label: "Hash Cost" }
], ht = (e) => (t) => e(t).empty, Jf = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), [r, o] = F("revenue"), [s, i] = F("USD"), a = W(["costs"], t), u = Df(n.query, s, a === null), c = u.status === "ready" ? u.data : void 0, d = W(["pool", "market"], t), f = W(["market"], t), h = W(["costs"], t, c?.report), m = Wn(s), g = (v) => X(v, m), y = /* @__PURE__ */ l(Ss, { value: s, onChange: i });
  return /* @__PURE__ */ _(
    _e,
    {
      title: "Hash Balance",
      headerAction: /* @__PURE__ */ l(Bn, {}),
      actions: /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
      children: [
        /* @__PURE__ */ l(Ps, { tabs: Vf, value: r, onChange: o }),
        r === "revenue" ? /* @__PURE__ */ _(te, { children: [
          /* @__PURE__ */ l(
            $,
            {
              title: "Site Hash Revenue",
              state: j(
                u,
                ht((v) => v.siteRevenue),
                d
              ),
              headerAction: y,
              children: c === void 0 ? null : /* @__PURE__ */ l(U, { showDataLabels: !0, formatValue: g, ...c.siteRevenue })
            }
          ),
          /* @__PURE__ */ _("div", { className: "reporting-hash-grid", children: [
            c === void 0 ? /* @__PURE__ */ l("div", {}) : /* @__PURE__ */ l(Re, { columns: 2, tiles: c.revenueTiles, className: "reporting-hash-grid__tiles" }),
            /* @__PURE__ */ l(
              $,
              {
                title: "Network Hashrate",
                className: "reporting-hash-grid__hashrate",
                state: j(
                  u,
                  ht((v) => v.networkHashrate),
                  f
                ),
                children: c === void 0 ? null : /* @__PURE__ */ l(U, { height: 200, ...c.networkHashrate })
              }
            ),
            /* @__PURE__ */ l(
              $,
              {
                title: "Bitcoin Network Hashprice",
                className: "reporting-hash-grid__hashprice",
                state: j(
                  u,
                  ht((v) => v.networkHashprice),
                  f
                ),
                children: c === void 0 ? null : /* @__PURE__ */ l(U, { height: 340, formatValue: g, ...c.networkHashprice })
              }
            )
          ] })
        ] }) : /* @__PURE__ */ _(te, { children: [
          c === void 0 ? null : /* @__PURE__ */ l(Re, { tiles: Hn(c.costTiles, h) }),
          /* @__PURE__ */ l(
            $,
            {
              title: "Cost / Revenue / Network Hashprice",
              state: j(
                u,
                ht((v) => v.costRevenueNetwork),
                d
              ),
              headerAction: y,
              children: c === void 0 ? null : /* @__PURE__ */ l(U, { formatValue: g, ...c.costRevenueNetwork })
            }
          ),
          h === null ? null : /* @__PURE__ */ l(At, { source: h, size: "inline" })
        ] })
      ]
    }
  );
}, Kf = (e) => e.chart.empty, Yf = (e) => e.split === null, Gf = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), [r, o] = F("BTC"), [s, i] = F("BTC"), a = Mf(n.query, r, s), u = a.status === "ready" ? a.data : void 0, c = W(["pool"], t), d = c ?? (u !== void 0 && !u.empty && u.split === null ? "split" : null);
  return /* @__PURE__ */ _(
    _e,
    {
      title: "Revenue Summary",
      actions: /* @__PURE__ */ _(te, { children: [
        /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
        /* @__PURE__ */ l(ks, { value: r, onChange: o })
      ] }),
      children: [
        u === void 0 ? null : /* @__PURE__ */ l(Re, { columns: 3, tiles: u.totals }),
        /* @__PURE__ */ l(
          $,
          {
            title: "Mining Revenue",
            state: j(a, Kf, c),
            headerAction: /* @__PURE__ */ l(
              Tt,
              {
                currencies: ws.map((f) => ({ value: f.value, label: f.label })),
                value: s,
                onChange: (f) => {
                  $f(f) && i(f);
                }
              }
            ),
            children: u === void 0 ? null : /* @__PURE__ */ l(U, { showDataLabels: !0, formatValue: qf(s), ...u.chart })
          }
        ),
        /* @__PURE__ */ _("div", { className: "reporting-split", children: [
          /* @__PURE__ */ l($, { title: "Subsidy / Fees", state: j(a, Yf, d), children: u?.split == null ? null : /* @__PURE__ */ l(
            to,
            {
              data: u.split.slices,
              legendPosition: "bottom",
              formatValue: (f) => bt(f, u.split?.unit ?? r)
            }
          ) }),
          u === void 0 ? null : /* @__PURE__ */ l(Re, { columns: 2, tiles: u.metrics })
        ] })
      ]
    }
  );
}, qf = (e) => (t) => X(t, e === en.BTC ? 2 : 0), Xf = (e) => X(e, 2), Qf = (e) => e.chart.empty, eh = (e) => e.feeRate.empty, th = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), [r, o] = F("BTC"), s = Uf(n.query, r), i = s.status === "ready" ? s.data : void 0, a = W(["pool", "poolSplit"], t, i?.report);
  return /* @__PURE__ */ _(
    _e,
    {
      title: "Subsidy / Fee",
      actions: /* @__PURE__ */ _(te, { children: [
        /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
        /* @__PURE__ */ l(ks, { value: r, onChange: o })
      ] }),
      children: [
        /* @__PURE__ */ l($, { title: "Subsidy / Fees", state: j(s, Qf, a), children: i === void 0 ? null : /* @__PURE__ */ l(U, { stacked: !0, ...i.chart }) }),
        /* @__PURE__ */ l(
          $,
          {
            title: "Average Fees in sats/vB",
            state: j(s, eh, W(["market"], t)),
            children: i === void 0 ? null : /* @__PURE__ */ l(U, { showDataLabels: !0, formatValue: Xf, ...i.feeRate })
          }
        )
      ]
    }
  );
}, nh = (e, t, n, r = q) => Q(
  Ve(e),
  x(
    (o) => ({ chart: nf(o, t, n, r) }),
    [t, n, r]
  )
), rh = (e, t, n = q) => Q(
  Ve(e),
  x(
    (r) => {
      const o = r.models.find((i) => i.id === n)?.displayName, s = o === void 0 ? `Site ${t.label}` : `${o} ${t.label}`;
      return {
        chart: gt(r, t, { model: n, title: s }),
        summary: rf(r, t, n)
      };
    },
    [t, n]
  )
), oh = (e) => Q(
  Ve(e),
  x((t) => ({ models: t.models, units: t.units }), [])
), Br = ({
  label: e,
  value: t,
  onChange: n,
  options: r
}) => /* @__PURE__ */ l(co, { label: e, children: /* @__PURE__ */ _(qr, { value: t, onValueChange: n, children: [
  /* @__PURE__ */ l(Xr, { className: "reporting-filter", children: /* @__PURE__ */ l(Qr, {}) }),
  /* @__PURE__ */ _(eo, { children: [
    /* @__PURE__ */ l(tn, { value: q, children: "All" }),
    r.map((o) => /* @__PURE__ */ l(tn, { value: o.value, children: o.label }, o.value))
  ] })
] }) }), zs = (e) => e.chart.empty, Vn = ({
  title: e,
  metric: t,
  titleExtra: n,
  siteViewExtra: r,
  extraTabs: o = []
}) => {
  const s = re().site.timezone, i = Ee(), a = Pe(i, s, { preset: "30d" }), [u, c] = i, d = u.get("view") ?? "site", f = x(
    (D) => c(
      (R) => {
        const P = new URLSearchParams(R);
        return P.set("view", D), P;
      },
      { replace: !0 }
    ),
    [c]
  ), [h, m] = F(q), [g, y] = F(q), v = oh(a.query), S = v.status === "ready" ? v.data.models : [], B = v.status === "ready" ? v.data.units : [], pe = o.find((D) => D.id === d);
  return /* @__PURE__ */ l(_e, { title: e, children: /* @__PURE__ */ _(Bs, { value: d, onValueChange: f, children: [
    /* @__PURE__ */ _(Ws, { children: [
      /* @__PURE__ */ l(st, { value: "site", children: "Site View" }),
      /* @__PURE__ */ l(st, { value: "type", children: "Miner Type View" }),
      /* @__PURE__ */ l(st, { value: "unit", children: "Mining Unit View" }),
      o.map((D) => /* @__PURE__ */ l(st, { value: D.id, children: D.label }, D.id))
    ] }),
    /* @__PURE__ */ _(ao, { children: [
      /* @__PURE__ */ l(
        ze,
        {
          state: a,
          timezone: s,
          showGranularity: d !== "type" && d !== "unit"
        }
      ),
      d === "site" ? /* @__PURE__ */ l(
        Br,
        {
          label: "Miner Type",
          value: h,
          onChange: m,
          options: S.map((D) => ({ value: D.id, label: D.displayName }))
        }
      ) : null,
      d === "unit" ? /* @__PURE__ */ l(
        Br,
        {
          label: "Mining Unit",
          value: g,
          onChange: y,
          options: B.map((D) => ({ value: D.id, label: D.name }))
        }
      ) : null
    ] }),
    /* @__PURE__ */ _(it, { value: "site", children: [
      /* @__PURE__ */ l(ih, { metric: t, query: a.query, model: h, titleExtra: n }),
      r?.(a)
    ] }),
    /* @__PURE__ */ l(it, { value: "type", children: /* @__PURE__ */ l(Wr, { metric: t, query: a.query, by: "model", only: q }) }),
    /* @__PURE__ */ l(it, { value: "unit", children: /* @__PURE__ */ l(Wr, { metric: t, query: a.query, by: "unit", only: g }) }),
    pe === void 0 ? null : /* @__PURE__ */ l(it, { value: pe.id, children: pe.render(a) })
  ] }) });
}, sh = ({ metric: e, summary: t }) => {
  const n = t?.actual ?? null;
  if (n === null) return null;
  const { unit: r, factor: o } = e.unitFor(n);
  return /* @__PURE__ */ _("div", { className: "reporting-highlight", children: [
    /* @__PURE__ */ _("span", { className: "reporting-highlight__label", children: [
      "Average ",
      e.label
    ] }),
    /* @__PURE__ */ _("span", { children: [
      /* @__PURE__ */ l("span", { className: "reporting-highlight__value", children: X(n / o, 2) }),
      " ",
      /* @__PURE__ */ l("span", { className: "reporting-highlight__unit", children: r })
    ] })
  ] });
}, ih = ({
  metric: e,
  query: t,
  model: n,
  titleExtra: r
}) => {
  const o = rh(t, e, n);
  return /* @__PURE__ */ l(
    $,
    {
      title: `Site ${e.label}`,
      titleExtra: r,
      state: j(o, zs),
      children: o.status === "ready" ? /* @__PURE__ */ _(te, { children: [
        /* @__PURE__ */ l(sh, { metric: e, summary: o.data.summary }),
        /* @__PURE__ */ l(U, { ...o.data.chart })
      ] }) : null
    }
  );
}, ah = (e) => X(e, 2), Wr = ({
  metric: e,
  query: t,
  by: n,
  only: r
}) => {
  const o = nh(t, e, n, r), s = `${e.label} by ${n === "model" ? "Miner Type" : "Mining Unit"}`;
  return /* @__PURE__ */ l($, { title: s, state: j(o, zs), children: o.status === "ready" ? /* @__PURE__ */ _(te, { children: [
    /* @__PURE__ */ l("p", { className: "reporting-note", children: "Average over the selected period." }),
    /* @__PURE__ */ l(U, { showDataLabels: !0, formatValue: ah, ...o.data.chart })
  ] }) : null });
}, ch = () => /* @__PURE__ */ l(Vn, { title: "Efficiency", metric: Ue.efficiency, titleExtra: /* @__PURE__ */ l(io, {}) });
function uh(e) {
  const t = Ft(e), n = e.meters.map((r, o) => ({
    label: r.label,
    values: e.buckets.map((s) => s.byMeter[r.id] ?? null),
    color: xn(o),
    stack: "meters"
  }));
  return e.siteMeter !== null && n.push({
    label: e.siteMeter.label,
    values: e.buckets.map((r) => r.siteMeterMWh),
    color: z.nominal,
    stack: "site"
  }), {
    report: e,
    rows: e.buckets.map((r, o) => ({
      ts: r.ts,
      period: t[o] ?? "",
      site: r.siteMeterMWh,
      byMeter: r.byMeter
    })),
    chart: { labels: t, unit: ai, series: n, empty: e.buckets.length === 0 }
  };
}
function lh(e) {
  const { report: t, rows: n } = e, r = t.meters.map((i) => ({ id: i.id, column: `${i.label} (MWh)` })), o = t.siteMeter === null ? null : `${t.siteMeter.label} (MWh)`;
  return {
    columns: ["Period", ...o === null ? [] : [o], ...r.map((i) => i.column)],
    rows: n.map((i) => {
      const a = { Period: new Date(i.ts).toISOString() };
      o !== null && (a[o] = i.site);
      for (const u of r) a[u.column] = i.byMeter[u.id];
      return a;
    })
  };
}
const dh = (e) => {
  const { apiUrl: t } = ye(), n = He(
    jn(t($e.CONSUMPTION), e),
    Vd,
    {
      keepPrevious: !0
    }
  );
  return Q(n, uh);
}, fh = (e, t) => {
  const { granularity: n, start: r } = t;
  return x(() => {
    if (e === void 0) return;
    const o = new Date(r).toISOString().slice(0, 10), { rows: s, columns: i } = lh(e);
    Xs(s, `consumption-${n}-${o}.csv`, i);
  }, [e, n, r]);
}, Hr = (e, t, n) => ({
  id: e,
  header: t,
  accessorFn: (r) => n(r) ?? null,
  cell: ({ row: r }) => X(n(r.original), 3)
}), hh = (e) => {
  if (e === void 0) return [];
  const { siteMeter: t, meters: n } = e.report, r = [
    { accessorKey: "period", header: "Period" }
  ];
  t !== null && r.push(Hr("site", `${t.label} total`, (o) => o.site));
  for (const o of n) r.push(Hr(o.id, o.label, (s) => s.byMeter[o.id]));
  return r;
}, ph = (e) => e.chart.empty, mh = ({ period: e }) => {
  const t = dh(e.query), n = t.status === "ready" ? t.data : void 0, [r, o] = F({ pageIndex: 0, pageSize: 20 }), s = xe(() => hh(n), [n]), i = fh(n, e.query), a = j(t, ph);
  return /* @__PURE__ */ _(te, { children: [
    /* @__PURE__ */ l("p", { className: "reporting-note", children: "Energy per power meter, in MWh." }),
    /* @__PURE__ */ l(
      $,
      {
        title: "Energy per Meter",
        state: a,
        headerAction: /* @__PURE__ */ l(
          Hs,
          {
            formats: ["csv"],
            label: "Export CSV",
            disabled: n === void 0 || n.chart.empty,
            onExport: i
          }
        ),
        children: n === void 0 ? null : /* @__PURE__ */ l(U, { ...n.chart })
      }
    ),
    /* @__PURE__ */ l($, { title: "Consumption by Period", state: a, children: n === void 0 ? null : /* @__PURE__ */ l(
      no,
      {
        data: n.rows,
        columns: s,
        getRowId: (u) => String(u.ts),
        enablePagination: !0,
        pagination: r,
        onPaginationChange: o
      }
    ) })
  ] });
}, gh = ["all", "offline", "maintenance"], yn = {
  all: { label: "All Miners", total: "Total Miner Count", count: "total" },
  offline: {
    label: "Miners Offline",
    total: "Miners Offline",
    count: "offline",
    statuses: ["offline"]
  },
  maintenance: {
    label: "Miners in Maintenance",
    total: "Miners in Maintenance",
    count: "maintenance",
    statuses: ["maintenance"]
  }
}, vh = (e, t) => {
  const n = e.models.map((r, o) => ({
    label: r.displayName,
    value: r[t],
    color: xn(o)
  }));
  return {
    slices: n,
    total: n.reduce((r, o) => r + o.value, 0),
    empty: e.models.length === 0,
    ts: e.ts
  };
}, Es = () => {
  const { apiUrl: e } = ye();
  return He(e($e.MINERS), us);
}, yh = (e) => Q(
  Es(),
  x((t) => vh(t, yn[e].count), [e])
), _h = (e, t) => Q(
  Ve(e),
  x((n) => vs(n, t), [t])
), bh = () => {
  const e = Kr(), { apiUrl: t } = ye(), [n, r] = F(!1), [o, s] = F(null), i = x(async () => {
    const u = t($e.MINERS), c = `${u}?refresh=true`;
    r(!0), s(null);
    try {
      e.setQueryData([nt, u], await ps(c, us)), await e.invalidateQueries({
        queryKey: [nt],
        predicate: (d) => d.queryKey[1] !== u
      });
    } catch (d) {
      s(so(d, c, { unreachableHint: Ln }));
    } finally {
      r(!1);
    }
  }, [e, t]);
  return { refresh: x(() => {
    i();
  }, [i]), refreshing: n, error: o };
}, Cs = ({ ts: e, timezone: t, subject: n }) => {
  const { refresh: r, refreshing: o, error: s } = bh(), i = typeof e == "number" ? `${n} as of ${li(e, t)}. Refresh to load the latest snapshot.` : "No snapshot yet. Refresh to take one.";
  return /* @__PURE__ */ _("div", { className: "reporting-snapshot", children: [
    /* @__PURE__ */ l("span", { className: "reporting-snapshot__dot", "aria-hidden": "true" }),
    /* @__PURE__ */ _("div", { className: "reporting-snapshot__text", children: [
      /* @__PURE__ */ l("span", { className: "reporting-snapshot__title", children: "Snapshot data" }),
      /* @__PURE__ */ l("span", { children: i }),
      s === null ? null : /* @__PURE__ */ _("span", { className: "reporting-snapshot__error", children: [
        "Refresh failed: ",
        s
      ] })
    ] }),
    /* @__PURE__ */ l(Ze, { variant: "secondary", size: "sm", onClick: r, loading: o, children: "Refresh" })
  ] });
}, wh = ({ value: e, color: t }) => /* @__PURE__ */ l("span", { className: "reporting-chip", style: { "--chip": t }, children: X(e, 0) }), Ne = (e, t) => ({
  id: e,
  header: t,
  size: 104,
  accessorFn: (n) => n[e],
  cell: ({ row: n }) => /* @__PURE__ */ l(wh, { value: n.original[e], color: z[e] })
}), Sh = [
  {
    accessorKey: "displayName",
    header: "Miner Type",
    size: 260,
    cell: ({ row: e }) => /* @__PURE__ */ _("div", { className: "reporting-model", children: [
      /* @__PURE__ */ l("span", { children: e.original.displayName }),
      /* @__PURE__ */ _("span", { className: "reporting-model__meta", children: [
        X(e.original.total, 0),
        " miners ·",
        " ",
        _t(yt(e.original.powerW, Nt))
      ] })
    ] })
  },
  Ne("offline", "Offline"),
  Ne("error", "Error"),
  Ne("sleep", "Sleep"),
  Ne("low", "Low"),
  Ne("normal", "Normal"),
  Ne("high", "High"),
  Ne("maintenance", "Maintenance")
], kh = ({ timezone: e }) => {
  const t = Es();
  return /* @__PURE__ */ _("section", { className: "reporting-section", children: [
    /* @__PURE__ */ l("h2", { className: "reporting-section__title", children: "Power Mode by Miner Type" }),
    /* @__PURE__ */ l(
      Cs,
      {
        ts: t.status === "ready" ? t.data.ts : void 0,
        timezone: e,
        subject: "Miner power modes"
      }
    ),
    t.status === "loading" ? /* @__PURE__ */ l(rt, {}) : null,
    t.status === "error" ? /* @__PURE__ */ l(Le, { title: "Could not load", error: t.message }) : null,
    t.status === "ready" && t.data.models.length === 0 ? /* @__PURE__ */ l(vt, { size: "sm", description: "No miners in the latest snapshot." }) : null,
    t.status === "ready" && t.data.models.length > 0 ? /* @__PURE__ */ l(
      no,
      {
        data: t.data.models,
        columns: Sh,
        getRowId: (n) => n.id,
        fullWidth: !0
      }
    ) : null
  ] });
}, Ph = {
  id: "consumption",
  label: "Consumption",
  render: (e) => /* @__PURE__ */ l(mh, { period: e })
}, zh = () => {
  const e = re(), t = e.site.timezone, n = e.sources.meters ? [Ph] : [];
  return /* @__PURE__ */ l(
    Vn,
    {
      title: "Energy",
      metric: Ue.power,
      siteViewExtra: () => /* @__PURE__ */ l(kh, { timezone: t }),
      extraTabs: n
    }
  );
}, Eh = () => /* @__PURE__ */ l(Vn, { title: "Hashrate", metric: Ue.hashrate }), _n = (e) => X(e, 0), Ch = (e) => e.empty, Oh = () => {
  const e = re().site.timezone, t = Pe(Ee(), e, { preset: "30d" }), [n, r] = F("all"), o = yn[n], s = yh(n), i = o.statuses ?? as, a = _h(t.query, i), u = s.status === "ready" ? s.data.ts : void 0;
  return /* @__PURE__ */ _(_e, { title: "Miners", actions: /* @__PURE__ */ l(ze, { state: t, timezone: e }), children: [
    /* @__PURE__ */ l(Cs, { ts: u, timezone: e, subject: "Miner counts" }),
    /* @__PURE__ */ _("div", { className: "reporting-panel", children: [
      /* @__PURE__ */ l("div", { className: "reporting-panel__tabs", role: "group", "aria-label": "Miners shown", children: gh.map((c) => /* @__PURE__ */ l(
        Ze,
        {
          variant: "secondary",
          "aria-pressed": c === n,
          className: c === n ? "reporting-pill reporting-pill--active" : "reporting-pill",
          onClick: () => r(c),
          children: yn[c].label
        },
        c
      )) }),
      /* @__PURE__ */ l($h, { view: s, total: o.total })
    ] }),
    /* @__PURE__ */ l($, { title: "Miner Status", state: j(a, Ch), children: a.status === "ready" ? /* @__PURE__ */ l(U, { stacked: !0, formatValue: _n, ...a.data }) : null })
  ] });
}, $h = ({ view: e, total: t }) => {
  if (e.status === "loading") return /* @__PURE__ */ l(rt, {});
  if (e.status === "error") return /* @__PURE__ */ l(Le, { title: "Could not load", error: e.message });
  const n = e.data;
  return n.empty ? /* @__PURE__ */ l(vt, { image: "simple", size: "sm", description: "No miners in the latest snapshot." }) : /* @__PURE__ */ _("div", { className: "reporting-types", children: [
    /* @__PURE__ */ _("div", { className: "reporting-types__total", children: [
      /* @__PURE__ */ l("span", { className: "reporting-field__label", children: t }),
      /* @__PURE__ */ l("span", { className: "reporting-types__count", children: _n(n.total) })
    ] }),
    n.total > 0 ? /* @__PURE__ */ l(to, { data: n.slices, legendPosition: "left", formatValue: _n }) : /* @__PURE__ */ l(vt, { image: "simple", size: "sm", description: "No miners in this state right now." })
  ] });
}, $t = 6e4, Vr = () => Math.ceil(Date.now() / $t) * $t, Nh = () => {
  const [e, t] = F(Vr);
  return qs(() => {
    const n = setInterval(() => t(Vr()), $t);
    return () => clearInterval(n);
  }, []), e;
}, Jr = (e, t) => typeof e == "number" ? _t(yt(e, t)) : Ae, Th = (e) => {
  const t = e.summary, n = t?.efficiencyWThs.site;
  return {
    hashrate: Jr(t?.hashrateThs.site, wn),
    power: Jr(t?.powerW.site, Nt),
    // A dash alone when missing, as hashrate and power show it
    efficiency: typeof n == "number" ? `${X(n)} ${bn.EFFICIENCY_W_PER_TH_S}` : Ae
  };
}, Ah = 1440 * $t, Ih = () => {
  const e = Nh(), t = xe(() => ({ start: e - Ah, end: e, granularity: "hour" }), [e]);
  return Q(Ve(t), Th);
}, Rh = () => {
  const { name: e } = ye(), t = Ih();
  return t.status === "loading" ? /* @__PURE__ */ l(rt, {}) : t.status === "error" ? /* @__PURE__ */ l(Le, { title: "Could not load the site's figures", error: t.message }) : /* @__PURE__ */ _("div", { className: "reporting-home", children: [
    /* @__PURE__ */ _("div", { className: "reporting-tiles", children: [
      /* @__PURE__ */ l(qe, { variant: "secondary", name: "Hashrate, 24h avg", value: t.data.hashrate }),
      /* @__PURE__ */ l(qe, { variant: "secondary", name: "Power, 24h avg", value: t.data.power }),
      /* @__PURE__ */ l(
        qe,
        {
          variant: "secondary",
          name: "Efficiency, 24h avg",
          value: t.data.efficiency
        }
      )
    ] }),
    /* @__PURE__ */ l(ro, { className: "reporting-home__link", to: `/app/${e}`, children: "Open the reports" })
  ] });
}, Y = {
  OPERATIONS: "Operations",
  FINANCIALS: "Financials"
}, Mh = [
  { label: Y.OPERATIONS, icon: Vs },
  { label: Y.FINANCIALS, icon: Js }
], Uh = [
  {
    path: K.DASHBOARD,
    label: "Dashboard",
    section: Y.OPERATIONS,
    component: oe(lf)
  },
  {
    path: K.HASHRATE,
    label: "Hashrate",
    section: Y.OPERATIONS,
    component: oe(Eh)
  },
  {
    path: K.ENERGY,
    label: "Energy",
    section: Y.OPERATIONS,
    component: oe(zh)
  },
  {
    path: K.EFFICIENCY,
    label: "Efficiency",
    section: Y.OPERATIONS,
    component: oe(ch)
  },
  {
    path: K.MINERS,
    label: "Miners",
    section: Y.OPERATIONS,
    component: oe(Oh)
  },
  {
    path: K.REVENUE_SUMMARY,
    label: "Revenue Summary",
    section: Y.FINANCIALS,
    component: oe(Gf)
  },
  {
    path: K.COST_SUMMARY,
    label: "Cost Summary",
    section: Y.FINANCIALS,
    component: oe(xf)
  },
  {
    path: K.SUBSIDY_FEE,
    label: "Subsidy / Fee",
    section: Y.FINANCIALS,
    component: oe(th)
  },
  {
    path: K.HASH_BALANCE,
    label: "Hash Balance",
    section: Y.FINANCIALS,
    component: oe(Jf)
  },
  {
    path: K.ENERGY_BALANCE,
    label: "Energy Balance",
    section: Y.FINANCIALS,
    component: oe(Hf)
  },
  {
    path: K.COST_INPUT,
    label: "Cost Input",
    section: Y.FINANCIALS,
    component: oe(yf)
  }
], Bh = As({
  // Must equal `id` in mdk-app.yaml: the dashboard refuses a mismatch.
  id: "io.tether.reporting-tool-lite",
  displayName: "Reporting Tool Lite",
  routes: Uh,
  sections: Mh,
  panels: [
    {
      id: "site-24h",
      slot: Is.HOME,
      title: "Reporting Tool Lite — last 24 hours",
      component: Rh
    }
  ]
});
export {
  Bh as default
};
