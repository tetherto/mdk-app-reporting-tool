import { useQuery as $s, toQueryView as Ts, useMdkApp as ve, usePeriod as Pe, useQueryClient as Jr, defineMdkApp as Ns, MDK_APP_PANEL_SLOT as As } from "@tetherto/mdk-react-adapter";
import { SimpleTooltip as Is, Typography as Kr, UNITS as wn, BITCOIN_UNITS as Qe, formatBitcoin as Rs, formatNumber as Ms, formatValueUnit as Yr, buildBarChartOptions as Us, defaultChartOptions as Zs, BarChart as Ds, EmptyState as Fs, ChartContainer as js, PlugIcon as Ls, ErrorCard as Le, RightArrowIcon as Bs, ExternalLinkIcon as xs, Button as Ze, Loader as ot, pickUnitScale as Gn, POWER_W_SCALES as Tt, HASHRATE_TH_S_SCALES as Sn, CHART_COLORS as S, PeriodControl as ze, Select as qr, SelectTrigger as Gr, SelectValue as Xr, SelectContent as Qr, SelectItem as tn, Input as Ws, SingleStatCard as qe, scaleToUnit as yt, OperationsEnergyCostChart as Hs, CurrencyToggler as Nt, DoughnutChart as eo, Tabs as Vs, TabsList as Js, TabsTrigger as it, TabsContent as at, ExportButton as Ks, DataTable as to, OperationsNavIcon as Ys, FinancialsNavIcon as qs } from "@tetherto/mdk-react-devkit";
import { jsx as l, jsxs as _, Fragment as te } from "react/jsx-runtime";
import { Link as no, useSearchParams as Ee, useNavigate as Gs } from "react-router";
import { useMemo as Ae, useState as j, createContext as Xs, useContext as Qs, useCallback as x, useEffect as ei } from "react";
import { mdkFetch as ro, describeRequestError as oo, downloadCsv as ti } from "@tetherto/mdk-ui-foundation";
const H = {
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
}, so = () => /* @__PURE__ */ l(
  Is,
  {
    side: "left",
    delayDuration: 200,
    content: "Power drawn by mining miners per unit of hashrate. Nominal is the hardware catalogue's rating for the fleet: nominal power over nominal hashrate.",
    children: /* @__PURE__ */ l("span", { className: "reporting-info", "aria-label": "About site efficiency", children: "ⓘ" })
  }
), ye = ({ title: e, actions: t, headerAction: n, children: r }) => /* @__PURE__ */ _("section", { className: "reporting-page", children: [
  /* @__PURE__ */ _("header", { className: "reporting-page__header", children: [
    /* @__PURE__ */ l(Kr, { variant: "heading3", children: e }),
    n
  ] }),
  t === void 0 ? null : /* @__PURE__ */ l(io, { children: t }),
  r
] }), io = ({ children: e }) => /* @__PURE__ */ l("div", { className: "reporting-page__toolbar", children: e }), ao = ({ label: e, children: t }) => /* @__PURE__ */ _("div", { className: "reporting-field", children: [
  /* @__PURE__ */ l("span", { className: "reporting-field__label", children: e }),
  t
] }), ni = 13, ri = (e, t) => {
  const n = e.series.filter((o) => o.type !== "line"), r = t ? new Set(n.map((o) => o.stack ?? "")).size : n.length;
  return e.labels.length * r <= ni;
}, oi = (e) => /[1-9]/.test(e) ? e : "", si = wn.ENERGY_MWH, we = "–", kn = (e) => ({
  maximumFractionDigits: e,
  minimumFractionDigits: 0
}), X = (e, t = 2) => Ms(e, kn(t), we), _t = (e, t = 2) => Yr(e.value, e.unit, kn(t), we), ii = (e, t, n) => {
  const r = { timeZone: n, month: "short" };
  return t === "hour" ? (r.day = "numeric", r.hour = "2-digit", r.minute = "2-digit", r.hourCycle = "h23") : t === "month" ? r.year = "numeric" : r.day = "numeric", new Intl.DateTimeFormat("en-US", r).format(e);
}, At = 1e8, A = {
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
}, co = [Qe.BTC, Qe.SATS], Pn = (e) => co.some((t) => t === e), nn = {
  [Qe.BTC]: "BTC",
  [Qe.SATS]: "Sats"
}, bt = (e, t) => Rs(e, t, we), de = (e, t, n = 2) => e == null ? we : Yr(e, t, kn(n), we), Je = (e, t = 0) => de(e, "$", t), ai = (e, t, n = Date.now()) => {
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
}, ci = [6, 4], Bt = (e) => e.toLocaleString("en-US", { maximumFractionDigits: 2 }), xt = (e, t) => {
  const n = e[t];
  return typeof n == "object" && n !== null && !Array.isArray(n) ? { ...n } : {};
}, ui = 24, Z = ({
  labels: e,
  series: t,
  unit: n,
  rightUnit: r,
  stacked: o,
  height: s = 280,
  formatValue: i = Bt,
  showDataLabels: a
}) => {
  const u = t.some((h) => h.axis === "right"), c = {
    labels: e,
    datasets: t.map((h) => {
      const y = h.type === "line";
      return {
        label: h.label,
        data: h.values,
        type: h.type ?? "bar",
        backgroundColor: h.color,
        borderColor: h.color,
        borderWidth: y ? 2 : 0,
        // Dashed per segment, not with `borderDash`: the legend copies that
        // onto its box and draws it broken.
        segment: h.dashed === !0 ? { borderDash: () => ci } : void 0,
        pointRadius: y ? 0 : void 0,
        stack: h.stack,
        order: y ? 0 : 1,
        yAxisID: h.axis === "right" ? "y1" : "y"
      };
    })
  }, d = Ae(() => {
    const h = Us({
      isStacked: o,
      yTicksFormatter: i,
      yRightTicksFormatter: u ? Bt : null,
      categoryTicksPadding: ui,
      legendPosition: "bottom"
    }), y = xt(h, "plugins"), v = xt(y, "legend");
    return {
      ...h,
      plugins: {
        ...y,
        legend: {
          ...v,
          labels: {
            ...xt(v, "labels"),
            generateLabels: Zs.plugins.legend.labels.generateLabels
          }
        }
      }
    };
  }, [u, o, i]), f = Ae(
    () => ({
      showTitle: !0,
      valueFormatter: (h, y) => {
        const v = y.raw;
        return typeof v != "number" ? we : t[y.datasetIndex]?.axis === "right" ? `${Bt(v)} ${r ?? ""}`.trim() : `${i(v)} ${n}`;
      }
    }),
    [t, i, n, r]
  ), p = a === !0 && ri({ labels: e, series: t }, o === !0), g = u ? r : void 0;
  return /* @__PURE__ */ _("div", { className: "reporting-time-chart", children: [
    /* @__PURE__ */ _("div", { className: "reporting-time-chart__units", children: [
      /* @__PURE__ */ l("span", { children: n }),
      g === void 0 ? null : /* @__PURE__ */ l("span", { children: g })
    ] }),
    /* @__PURE__ */ l(
      Ds,
      {
        data: c,
        options: d,
        height: s,
        isStacked: o,
        showDataLabels: p,
        formatDataLabel: (h) => oi(i(h)),
        formatYLabel: i,
        tooltip: f,
        legendPosition: "bottom"
      }
    )
  ] });
}, et = ({ icon: e, message: t, action: n, size: r = "block" }) => r === "inline" ? /* @__PURE__ */ _("div", { className: "reporting-notice reporting-notice--inline", children: [
  /* @__PURE__ */ _("span", { className: "reporting-notice__message", children: [
    e,
    t
  ] }),
  n
] }) : /* @__PURE__ */ l(
  Fs,
  {
    className: "reporting-notice",
    image: e ?? "simple",
    size: "md",
    description: /* @__PURE__ */ _(te, { children: [
      /* @__PURE__ */ l("span", { children: t }),
      n
    ] })
  }
), li = "https://github.com/tetherto/mdk-app-reporting-tool#", uo = {
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
    text: "Your pool does not report the subsidy / fee split. Revenue Summary estimates it from the network's fee share.",
    short: "No split reported",
    // The pool is wired and the operator can't change what it reports, so this
    // points to the estimate rather than to setup docs.
    link: "See the estimate",
    page: H.REVENUE_SUMMARY
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
    link: "Open Cost Input",
    page: H.COST_INPUT
  }
};
function L(e, t, n = null) {
  return e.status === "loading" ? { kind: "loading" } : e.status === "error" ? { kind: "error", message: e.message } : n !== null ? { kind: "not-wired", source: n } : t(e.data) ? { kind: "empty" } : { kind: "data" };
}
const di = ({ source: e }) => {
  const t = uo[e];
  return "page" in t ? /* @__PURE__ */ _(no, { className: "reporting-notice__link", to: `../${t.page}`, children: [
    t.link,
    /* @__PURE__ */ l(Bs, {})
  ] }) : /* @__PURE__ */ _(
    "a",
    {
      className: "reporting-notice__link",
      href: li + t.anchor,
      target: "_blank",
      rel: "noreferrer",
      children: [
        t.link,
        /* @__PURE__ */ l(xs, { size: 12 })
      ]
    }
  );
}, It = ({ source: e, size: t = "block" }) => {
  const { text: n, short: r } = uo[e], o = t === "inline";
  return /* @__PURE__ */ l(
    et,
    {
      icon: /* @__PURE__ */ l(Ls, { size: o ? 14 : 32 }),
      message: t === "block" ? n : o ? r : `${r}.`,
      action: /* @__PURE__ */ l(di, { source: e }),
      size: o ? "inline" : "block"
    }
  );
}, fi = "M6.5 6.5 2 2m0 4V2h4M9.5 6.5 14 2m-4 0h4v4M6.5 9.5 2 14m0-4v4h4M9.5 9.5 14 14m0-4v4h-4", hi = "M2 2l4.5 4.5m0-4v4h-4M14 2 9.5 6.5m0-4v4h4M2 14l4.5-4.5m-4 0h4v4M14 14l-4.5-4.5m4 0h-4v4", pi = ({ collapse: e }) => /* @__PURE__ */ l("svg", { width: "14", height: "14", viewBox: "0 0 16 16", fill: "none", "aria-hidden": "true", children: /* @__PURE__ */ l(
  "path",
  {
    d: e ? hi : fi,
    stroke: "currentColor",
    strokeWidth: "1.5",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }
) }), mi = "No data in this period. Pick another range above.", T = ({
  title: e,
  state: t,
  titleExtra: n,
  headerAction: r,
  expandable: o = !1,
  notWiredSize: s = "block",
  className: i,
  children: a
}) => {
  const [u, c] = j(!1), d = ["reporting-widget"];
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
        icon: /* @__PURE__ */ l(pi, { collapse: u }),
        onClick: () => c((p) => !p)
      }
    ) : null
  ] })), /* @__PURE__ */ l(
    js,
    {
      className: d.join(" "),
      title: e,
      titleExtra: n,
      headerAction: f,
      loading: t.kind === "loading",
      children: /* @__PURE__ */ l(gi, { state: t, notWiredSize: s, children: a })
    }
  );
}, gi = ({ state: e, notWiredSize: t, children: n }) => {
  switch (e.kind) {
    case "error":
      return /* @__PURE__ */ l(Le, { title: "Could not load", error: e.message });
    case "not-wired":
      return /* @__PURE__ */ l(It, { source: e.source, size: t });
    case "empty":
      return /* @__PURE__ */ l(et, { message: mi });
    default:
      return /* @__PURE__ */ l(te, { children: n });
  }
};
function rn(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e).filter(([r, o]) => t.indexOf(+r) === -1).map(([r, o]) => o);
}
function Xn(e, t = "|") {
  return e.map((n) => go(n)).join(t);
}
function on(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
class vi {
  constructor(t) {
    this._getter = t, this._value = void 0;
  }
  get value() {
    const t = this._getter;
    return t !== void 0 && (this._value = t(), this._getter = void 0), this._value;
  }
}
function zn(e) {
  return new vi(e);
}
function yi(e) {
  return e == null;
}
function En(e) {
  const t = e.startsWith("^") ? 1 : 0, n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function _i(e, t) {
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
function lo(e) {
  const t = Object.getOwnPropertyDescriptor(e, "shape");
  return t?.get ? t.get.raw : t?.value;
}
function ge(e) {
  return lo(e._zod.def) ?? e._zod.def.shape;
}
function fo(e, t, n) {
  Object.defineProperty(e, t, {
    get() {
      const r = n();
      return Ce(this, t, r), r;
    },
    enumerable: !0,
    configurable: !0
  });
}
function ho(e, t, n) {
  t in e ? Ce(e, t, n) : e[t] = n;
}
function Ie(e, t, n, r) {
  const o = ge(t);
  for (const s of n) {
    const i = Object.getOwnPropertyDescriptor(o, s);
    i.enumerable && (i.get ? fo(e, s, () => {
      const a = t._zod.def.shape[s];
      return r ? r(a, s) : a;
    }) : ho(e, s, r ? r(i.value, s) : i.value));
  }
}
function bi(e, t) {
  for (const n of Reflect.ownKeys(t)) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.enumerable && (r.get ? fo(e, n, () => t[n]) : ho(e, n, r.value));
  }
}
function q(...e) {
  const t = {};
  for (const n of e) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function wi(e) {
  return JSON.stringify(e);
}
function Si(e) {
  return e.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}
const po = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {
};
function wt(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const ki = /* @__PURE__ */ zn(() => {
  if (ie.jitless || typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare"))
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
function mo(e) {
  return De(e) ? { ...e } : Array.isArray(e) ? [...e] : e instanceof Map ? new Map(e) : e instanceof Set ? new Set(e) : e;
}
const Pi = /* @__PURE__ */ new Set(["string", "number", "symbol"]);
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
function go(e) {
  return typeof e == "bigint" ? e.toString() + "n" : typeof e == "string" ? `"${e}"` : `${e}`;
}
function zi(e) {
  return Object.keys(e).filter((t) => e[t]._zod.optin !== void 0 && e[t]._zod.optout === "optional");
}
const vo = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
}, Ei = {
  int64: [/* @__PURE__ */ BigInt("-9223372036854775808"), /* @__PURE__ */ BigInt("9223372036854775807")],
  uint64: [/* @__PURE__ */ BigInt(0), /* @__PURE__ */ BigInt("18446744073709551615")]
};
function Ci(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const s = {};
  return Ie(s, e, Mt(e, t)), Oe(e, q(n, { shape: s, checks: [] }));
}
function Mt(e, t) {
  const n = ge(e), r = [];
  for (const o of Reflect.ownKeys(t)) {
    if (!Object.getOwnPropertyDescriptor(n, o)?.enumerable)
      throw new Error(`Unrecognized key: "${String(o)}"`);
    t[o] && r.push(o);
  }
  return r;
}
function Oi(e, t) {
  const n = e._zod.def, r = n.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const s = new Set(Mt(e, t)), i = {};
  return Ie(i, e, Reflect.ownKeys(ge(e)).filter((a) => !s.has(a))), Oe(e, q(n, { shape: i, checks: [] }));
}
function $i(e, t) {
  if (!De(t))
    throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const o = ge(e);
    for (const s of Reflect.ownKeys(t))
      if (Object.getOwnPropertyDescriptor(o, s) !== void 0)
        throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
  }
  return Oe(e, q(e._zod.def, { shape: yo(e, t) }));
}
function yo(e, t) {
  const n = {};
  return Ie(n, e, Reflect.ownKeys(ge(e))), bi(n, t), n;
}
function Ti(e, t) {
  if (!De(t))
    throw new Error("Invalid input to safeExtend: expected a plain object");
  return Oe(e, q(e._zod.def, { shape: yo(e, t) }));
}
function Ni(e, t) {
  if (!t?._zod?.def)
    throw new Error("Invalid input to merge: expected an object schema. To merge a plain shape, use `.extend()`.");
  if (e._zod.def.checks?.length)
    throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
  const n = {};
  Ie(n, e, Reflect.ownKeys(ge(e))), Ie(n, t, Reflect.ownKeys(ge(t)));
  const r = q(e._zod.def, {
    shape: n,
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: t._zod.def.checks ?? []
  });
  return Oe(e, r);
}
function Qn(e, t, n, r = "partial") {
  const s = t._zod.def.checks;
  if (s && s.length > 0)
    throw new Error(`.${r}() cannot be used on object schemas containing refinements`);
  const a = n ? new Set(Mt(t, n)) : void 0, u = {};
  return Ie(u, t, Reflect.ownKeys(ge(t)), e && ((c, d) => a && !a.has(d) ? c : new e({ type: "optional", innerType: c }))), Oe(t, q(t._zod.def, { shape: u, checks: [] }));
}
function Ai(e, t, n) {
  const r = n ? new Set(Mt(t, n)) : void 0, o = {};
  return Ie(o, t, Reflect.ownKeys(ge(t)), (s, i) => (
    // overwrite with non-optional
    r && !r.has(i) ? s : new e({ type: "nonoptional", innerType: s })
  )), Oe(t, q(t._zod.def, { shape: o }));
}
function me(e, t = 0) {
  if (e.aborted === !0)
    return !0;
  for (let n = t; n < e.issues.length; n++)
    if (e.issues[n]?.continue !== !0)
      return !0;
  return !1;
}
function Ii(e, t = 0) {
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
function Ve(e) {
  return typeof e == "string" ? e : e?.message;
}
function er(e) {
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
function sn(e, t, n) {
  var r;
  for (let o = t; o < e.length; o++)
    (r = e[o]).schema ?? (r.schema = n);
}
function Se(e, t, n) {
  var r;
  const o = e.inst?._zod?.traits;
  o?.has("$ZodType") && (o.has("$ZodCheck") ? (r = e).schema ?? (r.schema = e.inst) : e.schema = e.inst);
  const s = e.schema !== e.inst ? e.schema?._zod.def?.error : void 0, i = e.message ? e.message : Ve(e.inst?._zod.def?.error?.(e)) ?? Ve(s?.(e)) ?? Ve(t?.error?.(e)) ?? Ve(n.customError?.(e)) ?? Ve(n.localeError?.(e)) ?? "Invalid input", a = {};
  for (const u of Object.keys(e))
    u === "inst" || u === "schema" || u === "continue" || u === "input" || u === "__proto__" || (a[u] = e[u]);
  return a.path ?? (a.path = []), a.message = i, t?.reportInput && (a.input = e.input), a;
}
const Ri = /[\uD800-\uDBFF]/;
function Cn(e) {
  const t = e.length;
  if (!Ri.test(e))
    return t;
  let n = t;
  for (let r = 0; r < t - 1; r++)
    (e.charCodeAt(r) & 64512) === 55296 && (e.charCodeAt(r + 1) & 64512) === 56320 && (n--, r++);
  return n;
}
function On(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function Mi(e) {
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
function tt(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? {
    message: t,
    code: "custom",
    input: n,
    inst: r
  } : { ...t };
}
function Ui(e, t) {
  for (const n in t) {
    const r = Object.getOwnPropertyDescriptor(t, n);
    r.get ? Object.defineProperty(e, n, { ...r, enumerable: !1 }) : Zi(e, n, r.value);
  }
}
function ke(e, t, n, r = !0) {
  return Object.defineProperty(e, t, { configurable: !0, writable: !0, enumerable: r, value: n }), n;
}
function _o(e, t, n) {
  return ke(e, t, n, !1);
}
function bo(e, t) {
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
function Zi(e, t, n) {
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
function Di(e, t) {
  const n = Object.getPrototypeOf(e);
  return t in n ? void 0 : n;
}
let Wt, _e = !1;
const Fi = {
  configurable: !0,
  get() {
    _e = !0;
  }
};
function P(e, t, n) {
  const r = Object.getPrototypeOf(e._zod);
  if (t in r && Wt !== e._zod) {
    Wt = void 0;
    return;
  }
  Wt = e._zod, Object.defineProperty(r, t, {
    configurable: !0,
    get() {
      Object.defineProperty(this, t, Fi);
      const o = _e;
      _e = !1;
      try {
        const s = n(this);
        return _e ? delete this[t] : Object.defineProperty(this, t, { configurable: !0, writable: !0, value: s }), _e = _e || o, s;
      } catch (s) {
        throw delete this[t], _e = _e || o, s;
      }
    },
    set(o) {
      Object.defineProperty(this, t, { configurable: !0, writable: !0, value: o });
    }
  });
}
function ji(e, t, n, r) {
  const o = Di(e, t);
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
const Li = "~constantCatch";
function Bi(e) {
  const t = () => e;
  return t[Li] = !0, t;
}
var tr;
const Ht = { value: void 0, enumerable: !1 };
let nr = "captureStackTrace" in Error ? Error : null;
function xi(e) {
  const t = nr;
  if (t) {
    const n = t.stackTraceLimit;
    if (typeof n == "number") {
      try {
        t.stackTraceLimit = 0;
      } catch {
        return nr = null, new e();
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
function m(e, t, n, r) {
  const o = {};
  function s(p) {
    this.def = p, this.constr = f, this.traits = /* @__PURE__ */ new Set();
  }
  s.prototype = o;
  const i = n, a = i && /* @__PURE__ */ new WeakSet();
  function u(p, g) {
    if (p._zod) {
      if (p._zod.traits.has(e))
        return;
    } else {
      Ht.value = new s(g);
      try {
        Object.defineProperty(p, "_zod", Ht);
      } finally {
        Ht.value = void 0;
      }
    }
    if (p._zod.traits.add(e), t(p, g), a) {
      const y = Object.getPrototypeOf(p), v = p._zod.constr.prototype;
      let k = y;
      for (; k && k !== v; )
        k = Object.getPrototypeOf(k);
      const W = k ?? y;
      a.has(W) || (a.add(W), Ui(W, i));
    }
    const h = f.prototype;
    for (const y in h)
      Object.prototype.hasOwnProperty.call(h, y) && (y in p || (p[y] = h[y].bind(p)));
  }
  const c = r?.Parent ?? Object;
  class d extends c {
  }
  Object.defineProperty(d, "name", { value: e });
  function f(p) {
    const g = r?.Parent ? xi(d) : this;
    u(g, p);
    const h = g._zod.deferred;
    if (h) {
      for (const v of h)
        v();
      g._zod.deferred = void 0;
    }
    const y = globalThis.__zod_globalConfig?.postProcessor;
    return y && y(g), g;
  }
  return Object.defineProperty(f, "init", { value: u }), Object.defineProperty(f, Symbol.hasInstance, {
    value: (p) => r?.Parent && p instanceof r.Parent ? !0 : p?._zod?.traits?.has(e)
  }), Object.defineProperty(f, "name", { value: e }), f;
}
class Ne extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class wo extends Error {
  constructor(t) {
    super(`Encountered unidirectional transform during encode: ${t}`), this.name = "ZodEncodeError";
  }
}
(tr = globalThis).__zod_globalConfig ?? (tr.__zod_globalConfig = {});
const ie = globalThis.__zod_globalConfig;
function fe(e) {
  return e && Object.assign(ie, e), ie;
}
function Wi() {
  const e = this._zod;
  return e.message ?? (e.message = JSON.stringify(e.def, on, 2)), e.message;
}
function Hi(e) {
  this._zod.message = e;
}
const Vi = {
  get: Wi,
  set: Hi,
  enumerable: !0,
  configurable: !0
}, Vt = { value: void 0, enumerable: !1 }, rr = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]), Ji = (e, t) => {
  e.name = "$ZodError", Vt.value = t, Object.defineProperty(e, "issues", Vt), Vt.value = void 0, Object.defineProperty(e, "message", Vi);
  const n = Object.getPrototypeOf(e);
  rr.has(n) || (rr.add(n), Object.defineProperty(n, "toString", {
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
}, Ki = m("$ZodError", Ji);
function Yi(e, t, n) {
  return Object.prototype.hasOwnProperty.call(e, t) || (t === "__proto__" ? Object.defineProperty(e, t, { value: n(), writable: !0, enumerable: !0, configurable: !0 }) : e[t] = n()), e[t];
}
function qi(e, t = (n) => n.message) {
  const n = {}, r = [];
  for (const o of e.issues)
    o.path.length > 0 ? Yi(n, o.path[0], () => []).push(t(o)) : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function Gi(e, t = (n) => n.message) {
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
            const p = u[d];
            f && p._errors.push(t(i)), u = p, c++;
          }
        }
      }
  };
  return r(e), n;
}
function Ut(e, t) {
  return { callee: t?.callee ?? e, Err: t?.Err };
}
const $n = (e) => {
  const t = (n, r, o, s) => {
    const i = o ? { ...o, async: !1 } : { async: !1 }, a = n._zod.run({ value: r, issues: [] }, i);
    if (a instanceof Promise)
      throw new Ne();
    if (a.issues.length) {
      const u = new (s?.Err ?? e)(a.issues.map((c) => Se(c, i, fe())));
      throw po(u, s?.callee ?? t), u;
    }
    return a.value;
  };
  return t;
}, Tn = (e) => {
  const t = async (n, r, o, s) => {
    const i = o ? { ...o, async: !0 } : { async: !0 };
    let a = n._zod.run({ value: r, issues: [] }, i);
    if (a instanceof Promise && (a = await a), a.issues.length) {
      const u = new (s?.Err ?? e)(a.issues.map((c) => Se(c, i, fe())));
      throw po(u, s?.callee ?? t), u;
    }
    return a.value;
  };
  return t;
}, Nn = (e) => (t, n, r) => {
  const o = r ? { ...r, async: !1 } : { async: !1 }, s = t._zod.run({ value: n, issues: [] }, o);
  if (s instanceof Promise)
    throw new Ne();
  return s.issues.length ? So(e, s.issues, o) : { success: !0, data: s.value };
};
function So(e, t, n) {
  let r;
  return {
    success: !1,
    get error() {
      return r || (r = new e(t.map((o) => Se(o, n, fe()))), t = void 0, n = void 0), r;
    },
    set error(o) {
      r = o, t = void 0, n = void 0;
    }
  };
}
const An = (e) => async (t, n, r) => {
  const o = r ? { ...r, async: !0 } : { async: !0 };
  let s = t._zod.run({ value: n, issues: [] }, o);
  return s instanceof Promise && (s = await s), s.issues.length ? So(e, s.issues, o) : { success: !0, data: s.value };
}, Xi = /* @__PURE__ */ Symbol.for("zod.compile.invalid"), Qi = /* @__PURE__ */ Symbol.for("zod.compile.fallback"), ea = ((e, t, n) => {
  const r = e._zod.bag.validator;
  if (r !== void 0) {
    if (r(t) !== Xi)
      return !0;
    if (r.definite === !0 && n === void 0)
      return !1;
  }
  return ta(e, t, n);
});
function ta(e, t, n) {
  const r = n ? { ...n, async: !1, abortEarly: !0 } : { async: !1, abortEarly: !0 }, o = e._zod.bag.fallbackRun;
  let s;
  if (o ? (r[Qi] = !0, s = o({ value: t, issues: [] }, r)) : s = e._zod.run({ value: t, issues: [] }, r), s instanceof Promise)
    throw new Ne();
  return s.issues.length === 0;
}
const na = async (e, t, n) => {
  const r = n ? { ...n, async: !0, abortEarly: !0 } : { async: !0, abortEarly: !0 };
  let o = e._zod.run({ value: t, issues: [] }, r);
  return o instanceof Promise && (o = await o), o.issues.length === 0;
}, ra = (e) => {
  const t = $n(e), n = (r, o, s, i) => {
    const a = s ? { ...s, direction: "backward" } : { direction: "backward" };
    return t(r, o, a, Ut(n, i));
  };
  return n;
}, oa = (e) => {
  const t = $n(e), n = (r, o, s, i) => t(r, o, s, Ut(n, i));
  return n;
}, sa = (e) => {
  const t = Tn(e), n = async (r, o, s, i) => {
    const a = s ? { ...s, direction: "backward" } : { direction: "backward" };
    return await t(r, o, a, Ut(n, i));
  };
  return n;
}, ia = (e) => {
  const t = Tn(e), n = async (r, o, s, i) => await t(r, o, s, Ut(n, i));
  return n;
}, aa = (e) => (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return Nn(e)(t, n, o);
}, ca = (e) => (t, n, r) => Nn(e)(t, n, r), ua = (e) => async (t, n, r) => {
  const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
  return An(e)(t, n, o);
}, la = (e) => async (t, n, r) => An(e)(t, n, r), da = /^[cC][0-9a-z]{6,}$/, fa = /^[0-9a-z]+$/, ha = /^[0-7][0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{25}$/, pa = /^[0-9a-vA-V]{20}$/, ma = /^[A-Za-z0-9]{27}$/, ga = /^[a-zA-Z0-9_-]{21}$/;
function va(e) {
  return new RegExp(`^[a-zA-Z0-9_-]{${e}}$`);
}
const ya = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/, _a = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/, or = (e) => e ? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`) : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/, ba = /^(?:[A-Za-z0-9_'+\-]+\.)*[A-Za-z0-9_'+\-]*[A-Za-z0-9_+-]@(?:[A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/, wa = "^(?=[\\s\\S]*[\\p{Extended_Pictographic}\\p{Regional_Indicator}\\u20E3])[\\p{Extended_Pictographic}\\p{Emoji_Component}]+$";
function Sa() {
  return new RegExp(wa, "u");
}
const ka = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/, Pa = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/, za = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/, Ea = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/, Ca = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/, Oa = /^(?:[A-Za-z0-9_-]{4})*(?:[A-Za-z0-9_-]{2,3})?$/, $a = /^https?$/, Ta = /^\+[1-9]\d{6,14}$/, ko = "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))";
function Na(e) {
  return new RegExp(`^${e}$`);
}
const Aa = /* @__PURE__ */ Na(ko);
function an(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number" ? e.precision === -1 ? `${t}` : e.precision === 0 ? `${t}:[0-5]\\d` : `${t}:[0-5]\\d\\.\\d{${e.precision}}` : e.seconds ? `${t}:[0-5]\\d(?:\\.\\d+)?` : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Ia(e) {
  return new RegExp(`^${an(e)}$`);
}
function Ra(e) {
  const t = ["Z"];
  e.offset && t.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)");
  const n = `${an({ precision: e.precision, seconds: !0 })}(?:${t.join("|")})`, r = e.local ? `${n}|${an({ precision: e.precision })}` : n;
  return new RegExp(`^${ko}T(?:${r})$`);
}
const Ma = /^[\s\S]{0,}$/, Ua = /^-?\d+$/, In = /^-?\d+(?:\.\d+)?$/, Za = /^(?:true|false)$/i, Da = /^[^A-Z]*$/, Fa = /^[^a-z]*$/, K = /* @__PURE__ */ m("$ZodCheck", (e, t) => {
  var n;
  e._zod ?? (e._zod = {}), e._zod.def = t, (n = e._zod).onattach ?? (n.onattach = []);
}), Rn = (e) => {
  const t = e.value;
  return !yi(t) && t.length !== void 0;
}, St = {
  number: "number",
  bigint: "bigint",
  object: "date"
}, Po = /* @__PURE__ */ m("$ZodCheckLessThan", (e, t) => {
  K.init(e, t);
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
}), zo = /* @__PURE__ */ m("$ZodCheckGreaterThan", (e, t) => {
  K.init(e, t);
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
}), ja = /* @__PURE__ */ m("$ZodCheckMultipleOf", (e, t) => {
  K.init(e, t), e._zod.check = (n) => {
    if (typeof n.value != typeof t.value)
      throw new Error("Cannot mix number and bigint in multiple_of check.");
    (typeof n.value == "bigint" ? (
      // `value % 0n` throws, and nothing is a multiple of zero — the number branch already fails this way via NaN
      t.value !== BigInt(0) && n.value % t.value === BigInt(0)
    ) : _i(n.value, t.value) === 0) || n.issues.push({
      origin: typeof n.value,
      code: "not_multiple_of",
      divisor: t.value,
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), La = /* @__PURE__ */ m("$ZodCheckNumberFormat", (e, t) => {
  K.init(e, t), t.format = t.format || "float64";
  const n = t.format?.includes("int"), r = n ? "int" : "number", [o, s] = vo[t.format];
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
}), Ba = /* @__PURE__ */ m("$ZodCheckMaxLength", (e, t) => {
  var n;
  K.init(e, t), (n = e._zod.def).when ?? (n.when = Rn), e._zod.check = (r) => {
    const o = r.value, s = o.length;
    if ((typeof o == "string" && s > t.maximum ? Cn(o) : s) <= t.maximum)
      return;
    const a = On(o);
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
}), xa = /* @__PURE__ */ m("$ZodCheckMinLength", (e, t) => {
  var n;
  K.init(e, t), (n = e._zod.def).when ?? (n.when = Rn), e._zod.check = (r) => {
    const o = r.value, s = o.length;
    if ((typeof o == "string" && s >= t.minimum && s < t.minimum * 2 ? Cn(o) : s) >= t.minimum)
      return;
    const a = On(o);
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
}), Wa = /* @__PURE__ */ m("$ZodCheckLengthEquals", (e, t) => {
  var n;
  K.init(e, t), (n = e._zod.def).when ?? (n.when = Rn), e._zod.check = (r) => {
    const o = r.value, s = o.length, i = typeof o == "string" && s >= t.length && s <= t.length * 2 ? Cn(o) : s;
    if (i === t.length)
      return;
    const a = On(o), u = i > t.length;
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
}), Zt = /* @__PURE__ */ m("$ZodCheckStringFormat", (e, t) => {
  var n, r;
  K.init(e, t), t.pattern ? (n = e._zod).check ?? (n.check = (o) => {
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
}), Ha = /* @__PURE__ */ m("$ZodCheckRegex", (e, t) => {
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
}), Va = /* @__PURE__ */ m("$ZodCheckLowerCase", (e, t) => {
  t.pattern ?? (t.pattern = Da), Zt.init(e, t);
}), Ja = /* @__PURE__ */ m("$ZodCheckUpperCase", (e, t) => {
  t.pattern ?? (t.pattern = Fa), Zt.init(e, t);
}), Ka = /* @__PURE__ */ m("$ZodCheckIncludes", (e, t) => {
  K.init(e, t);
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
}), Ya = /* @__PURE__ */ m("$ZodCheckStartsWith", (e, t) => {
  K.init(e, t);
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
}), qa = /* @__PURE__ */ m("$ZodCheckEndsWith", (e, t) => {
  K.init(e, t);
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
}), Ga = /* @__PURE__ */ m("$ZodCheckOverwrite", (e, t) => {
  K.init(e, t), e._zod.check = (n) => {
    n.value = t.tx(n.value);
  };
});
class Xa {
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
const Qa = {
  major: 4,
  minor: 6,
  patch: 7
}, I = /* @__PURE__ */ m("$ZodType", (e, t) => {
  var n;
  e ?? (e = {}), e._zod.def = t, e._zod.bag = e._zod.bag || {}, e._zod.version = Qa;
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
      let d = me(a), f;
      for (const p of u) {
        if (p._zod.def.when) {
          if (Ii(a) || !p._zod.def.when(a))
            continue;
        } else if (d)
          continue;
        const g = a.issues.length, h = p._zod.check(a);
        if (h instanceof Promise && c?.async === !1)
          throw new Ne();
        if (f || h instanceof Promise)
          f = (f ?? Promise.resolve()).then(async () => {
            await h, a.issues.length !== g && (sn(a.issues, g, e), d || (d = me(a, g)));
          });
        else {
          if (a.issues.length === g)
            continue;
          sn(a.issues, g, e), d || (d = me(a, g));
        }
      }
      return f ? f.then(() => a) : a;
    }, i = (a, u, c) => {
      if (me(a))
        return a.aborted = !0, a;
      const d = s(u, o, c);
      if (d instanceof Promise) {
        if (c.async === !1)
          throw new Ne();
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
          throw new Ne();
        return c.then((d) => s(d, o, u));
      }
      return s(c, o, u);
    };
  }
}, {
  // Wrappers extend this by installing a richer factory over it; reading it eagerly would defeat the laziness.
  get "~standard"() {
    return _o(this, "~standard", Co(this));
  },
  set "~standard"(e) {
    ke(this, "~standard", e);
  }
}), Eo = (e, t) => e.issues.length ? { issues: e.issues.map((n) => Se(n, t, fe())) } : { value: e.value };
async function ec(e, t) {
  const n = { async: !0 };
  return Eo(await e._zod.run({ value: t, issues: [] }, n), n);
}
function Co(e) {
  return {
    validate: (t) => {
      const n = { async: !1 };
      try {
        const r = e._zod.run({ value: t, issues: [] }, n);
        if (!(r instanceof Promise))
          return Eo(r, n);
      } catch {
      }
      return ec(e, t);
    },
    vendor: "zod",
    version: 1
  };
}
const Mn = /* @__PURE__ */ m("$ZodString", (e, t) => {
  I.init(e, t), e._zod.pattern = t.pattern ?? Ma, e._zod.parse = (n, r) => {
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
}), $ = /* @__PURE__ */ m("$ZodStringFormat", (e, t) => {
  Zt.init(e, t), Mn.init(e, t);
}), tc = /* @__PURE__ */ m("$ZodGUID", (e, t) => {
  t.pattern ?? (t.pattern = _a), $.init(e, t);
}), nc = /* @__PURE__ */ m("$ZodUUID", (e, t) => {
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
    t.pattern ?? (t.pattern = or(r));
  } else
    t.pattern ?? (t.pattern = or());
  $.init(e, t);
}), rc = /* @__PURE__ */ m("$ZodEmail", (e, t) => {
  t.pattern ?? (t.pattern = ba), $.init(e, t);
}), Oo = 1, kt = 2;
function $o(e) {
  try {
    return typeof URL < "u" && typeof URL.canParse == "function" ? URL.canParse(e) : (new URL(e), !0);
  } catch {
    return !1;
  }
}
function oc(e, t) {
  return !("normalize" in t) && !("hostname" in t) && !("protocol" in t) ? $o(e) || kt : sc(e, t);
}
function sc(e, t) {
  if (!t.normalize && t.protocol?.source === $a.source && !/^https?:\/\//i.test(e))
    return Oo;
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
const ic = /[\t\n\r]/g;
function sr(e) {
  return e.replace(ic, "");
}
function ac(e, t) {
  return t.lastIndex = 0, t.test(e.hostname);
}
function cc(e, t) {
  return t.lastIndex = 0, t.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol);
}
const uc = /* @__PURE__ */ m("$ZodURL", (e, t) => {
  $.init(e, t), e._zod.check = (n) => {
    try {
      const r = n.value.trim(), o = oc(r, t);
      if (o === Oo) {
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
        n.value = sr(r);
        return;
      }
      t.hostname && !ac(o, t.hostname) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid hostname",
        pattern: t.hostname.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), t.protocol && !cc(o, t.protocol) && n.issues.push({
        code: "invalid_format",
        format: "url",
        note: "Invalid protocol",
        pattern: t.protocol.source,
        input: n.value,
        inst: e,
        continue: !t.abort
      }), n.value = t.normalize ? o.href : sr(r);
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
}), lc = /* @__PURE__ */ m("$ZodEmoji", (e, t) => {
  t.pattern ?? (t.pattern = Sa()), $.init(e, t);
}), dc = /* @__PURE__ */ m("$ZodNanoID", (e, t) => {
  if (t.length !== void 0 && (!Number.isInteger(t.length) || t.length < 1))
    throw new Error(`Invalid nanoid length: ${t.length}`);
  t.pattern ?? (t.pattern = t.length === void 0 ? ga : va(t.length)), $.init(e, t);
}), fc = /* @__PURE__ */ m("$ZodCUID", (e, t) => {
  t.pattern ?? (t.pattern = da), $.init(e, t);
}), hc = /* @__PURE__ */ m("$ZodCUID2", (e, t) => {
  t.pattern ?? (t.pattern = fa), $.init(e, t);
}), pc = /* @__PURE__ */ m("$ZodULID", (e, t) => {
  t.pattern ?? (t.pattern = ha), $.init(e, t);
}), mc = /* @__PURE__ */ m("$ZodXID", (e, t) => {
  t.pattern ?? (t.pattern = pa), $.init(e, t);
}), gc = /* @__PURE__ */ m("$ZodKSUID", (e, t) => {
  t.pattern ?? (t.pattern = ma), $.init(e, t);
}), vc = /* @__PURE__ */ m("$ZodISODateTime", (e, t) => {
  t.pattern ?? (t.pattern = Ra(t)), $.init(e, t);
}), yc = /* @__PURE__ */ m("$ZodISODate", (e, t) => {
  t.pattern ?? (t.pattern = Aa), $.init(e, t);
}), _c = /* @__PURE__ */ m("$ZodISOTime", (e, t) => {
  t.pattern ?? (t.pattern = Ia(t)), $.init(e, t);
}), bc = /* @__PURE__ */ m("$ZodISODuration", (e, t) => {
  t.pattern ?? (t.pattern = ya), $.init(e, t);
}), wc = /* @__PURE__ */ m("$ZodIPv4", (e, t) => {
  t.pattern ?? (t.pattern = ka), $.init(e, t);
}), Sc = /^[0-9a-fA-F:.]+$/;
function To(e) {
  return Sc.test(e) ? $o(`http://[${e}]`) : !1;
}
const kc = /* @__PURE__ */ m("$ZodIPv6", (e, t) => {
  t.pattern ?? (t.pattern = Pa), $.init(e, t), e._zod.check = (n) => {
    To(n.value) || n.issues.push({
      code: "invalid_format",
      format: "ipv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Pc = /* @__PURE__ */ m("$ZodCIDRv4", (e, t) => {
  t.pattern ?? (t.pattern = za), $.init(e, t);
});
function zc(e) {
  const t = e.split("/");
  if (t.length !== 2)
    return !1;
  const [n, r] = t;
  if (!r)
    return !1;
  const o = Number(r);
  return `${o}` !== r || o < 0 || o > 128 ? !1 : To(n);
}
const Ec = /* @__PURE__ */ m("$ZodCIDRv6", (e, t) => {
  t.pattern ?? (t.pattern = Ea), $.init(e, t), e._zod.check = (n) => {
    zc(n.value) || n.issues.push({
      code: "invalid_format",
      format: "cidrv6",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
});
function No(e) {
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
const Ao = /^[0-9a-zA-Z+/]*={0,2}$/, Cc = /* @__PURE__ */ m("$ZodBase64", (e, t) => {
  t.pattern ?? (t.pattern = Ao), $.init(e, t), e._zod.check = (n) => {
    No(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Un = /^[A-Za-z0-9_-]*$/;
function Oc(e) {
  if (!Un.test(e))
    return !1;
  const t = e.replace(/[-_]/g, (r) => r === "-" ? "+" : "/"), n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return No(n);
}
const $c = /* @__PURE__ */ m("$ZodBase64URL", (e, t) => {
  t.pattern ?? (t.pattern = Un), $.init(e, t), e._zod.check = (n) => {
    Oc(n.value) || n.issues.push({
      code: "invalid_format",
      format: "base64url",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Tc = /* @__PURE__ */ m("$ZodE164", (e, t) => {
  t.pattern ?? (t.pattern = Ta), $.init(e, t);
});
function Nc(e, t = null) {
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
const Ac = /* @__PURE__ */ m("$ZodJWT", (e, t) => {
  $.init(e, t), e._zod.check = (n) => {
    Nc(n.value, t.alg) || n.issues.push({
      code: "invalid_format",
      format: "jwt",
      input: n.value,
      inst: e,
      continue: !t.abort
    });
  };
}), Io = /* @__PURE__ */ m("$ZodNumber", (e, t) => {
  I.init(e, t), e._zod.pattern = In, e._zod.parse = (n, r) => {
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
}), Ic = /* @__PURE__ */ m("$ZodNumberFormat", (e, t) => {
  La.init(e, t), Io.init(e, t);
}), Rc = /* @__PURE__ */ m("$ZodBoolean", (e, t) => {
  I.init(e, t), e._zod.pattern = Za, e._zod.parse = (n, r) => {
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
}), Mc = /* @__PURE__ */ m("$ZodUnknown", (e, t) => {
  I.init(e, t), e._zod.parse = (n) => n;
}), Uc = /* @__PURE__ */ m("$ZodNever", (e, t) => {
  I.init(e, t), e._zod.parse = (n, r) => (n.issues.push({
    expected: "never",
    code: "invalid_type",
    input: n.value,
    inst: e
  }), n);
});
function Zc(e, t) {
  const n = er(e._zod.def.checks);
  if (!n.length)
    return;
  const r = Math.min(...n.map((s) => s[0])), o = e._zod.parse;
  e._zod.parse = (s, i) => {
    const a = t(s.value);
    if (a > r && !i?.skipChecks && i?.direction !== "backward") {
      for (const [u, c] of er(e._zod.def.checks))
        if (a > u && c._zod.def.when(s)) {
          const d = s.issues.length;
          return c._zod.check(s), s.issues[d].continue = !1, sn(s.issues, d, e), s;
        }
    }
    return o(s, i);
  };
}
const Dc = (e) => Array.isArray(e) ? e.length : -1;
function ir(e, t, n) {
  e.issues.length && t.issues.push(...Me(n, e.issues)), t.value[n] = e.value;
}
const Fc = /* @__PURE__ */ m("$ZodArray", (e, t) => {
  I.init(e, t);
  const n = ie.memoizer;
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
        i.push(d.then((f) => ir(f, r, u)));
      else if (ir(d, r, u), a && d.issues.length !== 0 && me(d))
        break;
    }
    return i.length ? Promise.all(i).then(() => r) : r;
  }, Zc(e, Dc);
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
const jc = [];
function Ro(e) {
  const t = Object.keys(e.shape), n = Object.getOwnPropertySymbols(e.shape), r = n.length ? n : jc, o = r.length ? [...t, ...r] : t;
  for (const i of o)
    if (!e.shape?.[i]?._zod?.traits?.has("$ZodType"))
      throw new Error(`Invalid element at key "${String(i)}": expected a Zod schema`);
  const s = zi(e.shape);
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
function Mo(e, t, n, r, o, s, i) {
  const a = [], u = o.keySet, c = o.catchall._zod, d = c.def.type, f = c.optin, p = c.optout;
  let g = 0;
  for (const h in t) {
    if (i && n.issues.length !== g) {
      if (me(n, g))
        break;
      g = n.issues.length;
    }
    if (u.has(h))
      continue;
    if (h === "__proto__") {
      d === "never" && a.push(h);
      continue;
    }
    if (d === "never") {
      a.push(h);
      continue;
    }
    const y = c.run({ value: t[h], issues: [] }, r);
    y instanceof Promise ? e.push(y.then((v) => Pt(v, n, h, t, f, p))) : Pt(y, n, h, t, f, p);
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
const Lc = /* @__PURE__ */ m("$ZodObject", (e, t) => {
  I.init(e, t);
  const n = Object.getOwnPropertyDescriptor(t, "shape"), r = n?.get ? n.get.raw : t.shape ?? {};
  if (r) {
    const c = () => {
      const d = { ...r };
      return Object.defineProperty(t, "shape", { value: d }), c.raw = d, d;
    };
    c.raw = r, Object.defineProperty(t, "shape", { get: c });
  }
  const o = zn(() => Ro(t));
  P(e, "propValues", (c) => {
    const d = c.def.shape, f = {};
    for (const p in d) {
      const g = d[p]._zod;
      if (g.values) {
        Object.prototype.hasOwnProperty.call(f, p) || Ce(f, p, /* @__PURE__ */ new Set());
        for (const h of g.values)
          f[p].add(h);
        g.optin !== void 0 && f[p].add(void 0);
      }
    }
    return f;
  });
  const s = wt, i = t.catchall;
  let a;
  const u = ie.memoizer;
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
    const p = [], g = a.shape, h = d?.abortEarly;
    let y = c.issues.length;
    for (const v of a.allKeys) {
      if (h && c.issues.length !== y) {
        if (me(c, y))
          break;
        y = c.issues.length;
      }
      if (v === "__proto__")
        continue;
      const k = g[v], W = k._zod.optin, he = k._zod.optout, F = k._zod.run({ value: f[v], issues: [] }, d);
      F instanceof Promise ? p.push(F.then((M) => Pt(M, c, v, f, W, he))) : Pt(F, c, v, f, W, he);
    }
    return i ? Mo(p, f, c, d, o.value, e, h === !0) : p.length ? Promise.all(p).then(() => c) : c;
  };
}), Bc = /* @__PURE__ */ m("$ZodObjectJIT", (e, t) => {
  Lc.init(e, t);
  const n = e._zod.parse, r = zn(() => Ro(t)), o = ie.memoizer, s = (g) => {
    const h = r.value, y = h.symbolKeys, v = new Xa(["payload", "ctx"], { shape: g, inst: e, memo: o, syms: y }), k = (M) => `shape[${M}]._zod.run({ value: input[${M}], issues: [] }, ctx)`, W = (M, z) => `
          let ${M}_ab = false;
          for (let i = 0; i < ${M}.issues.length; i++) {
            const iss = ${M}.issues[i];
            iss.path = iss.path ? [${z}, ...iss.path] : [${z}];
            payload.issues.push(iss);
            if (iss.continue !== true) ${M}_ab = true;
          }
          if (${M}_ab && ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }`;
    v.write("const input = payload.value;");
    const he = /* @__PURE__ */ Object.create(null);
    let F = 0;
    for (const M of h.allKeys)
      he[M] = `key_${F++}`;
    v.write(o ? "const newResult = memo.alloc(inst, payload, {}, ctx);" : "const newResult = {};");
    for (const M of h.allKeys) {
      if (M === "__proto__")
        continue;
      const z = he[M], ce = typeof M == "symbol" ? `syms[${y.indexOf(M)}]` : wi(M), jt = `${ce} in input`, Yn = g[M], Lt = Yn?._zod?.optin, qn = Lt !== void 0, Cs = Yn?._zod?.optout === "optional";
      if (v.write(`const ${z} = ${k(ce)};`), qn && Cs) {
        const Os = Lt === "optional" ? `${z}_present` : `${z}.value !== undefined || ${z}_present`;
        v.write(`
        const ${z}_present = ${jt};
        if (!${z}.issues.length || ${z}_present) {
          if (${z}.issues.length) {${W(z, ce)}
          }

          if (${Os}) {
            newResult[${ce}] = ${z}.value;
          }
        }

      `);
      } else qn ? (v.write(`
        if (${z}.issues.length) {${W(z, ce)}
        }
      `), Lt === "defaulted" ? v.write(`newResult[${ce}] = ${z}.value;`) : v.write(`
        if (${z}.value !== undefined || ${jt}) {
          newResult[${ce}] = ${z}.value;
        }
      `)) : v.write(`
        const ${z}_present = ${jt};
        if (${z}.issues.length) {${W(z, ce)}
        }
        if (!${z}_present && !${z}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${ce}]
          });
          if (ctx && ctx.abortEarly) {
            payload.value = newResult;
            return payload;
          }
        }

        if (${z}_present) {
          newResult[${ce}] = ${z}.value;
        }

      `);
    }
    return v.write("payload.value = newResult;"), v.write("return payload;"), v.compile();
  };
  let i;
  const a = wt, u = !ie.jitless, d = u && ki.value, f = t.catchall;
  let p;
  e._zod.parse = (g, h) => {
    p ?? (p = r.value);
    const y = g.value;
    return a(y) ? u && d && h?.async === !1 && h.jitless !== !0 ? (i || (i = s(t.shape)), g = i(g, h), f ? Mo([], y, g, h, p, e, h?.abortEarly === !0) : g) : n(g, h) : (g.issues.push({
      expected: "object",
      code: "invalid_type",
      input: y,
      inst: e
    }), g);
  };
});
function ar(e, t, n, r) {
  for (const s of e)
    if (s.issues.length === 0)
      return t.value = s.value, t;
  const o = e.filter((s) => !me(s));
  return o.length === 1 ? (t.value = o[0].value, o[0]) : (t.issues.push({
    code: "invalid_union",
    input: t.value,
    inst: n,
    errors: e.map((s) => s.issues.map((i) => Se(i, r, fe())))
  }), t);
}
const xc = /* @__PURE__ */ m("$ZodUnion", (e, t) => {
  I.init(e, t), P(e, "optin", (r) => r.def.options.some((o) => o._zod.optin === "defaulted") ? "defaulted" : r.def.options.some((o) => o._zod.optin !== void 0) ? "optional" : void 0), P(e, "optout", (r) => r.def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0), P(e, "values", (r) => {
    if (r.def.options.every((o) => o._zod.values))
      return new Set(r.def.options.flatMap((o) => Array.from(o._zod.values)));
  }), P(e, "pattern", (r) => {
    if (r.def.options.every((o) => o._zod.pattern)) {
      const o = r.def.options.map((s) => s._zod.pattern);
      return new RegExp(`^(${o.map((s) => En(s.source)).join("|")})$`);
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
    return s ? Promise.all(i).then((a) => ar(a, r, e, o)) : ar(i, r, e, o);
  };
}), Wc = /* @__PURE__ */ m("$ZodIntersection", (e, t) => {
  I.init(e, t), e._zod.parse = (n, r) => {
    const o = n.value, s = t.left._zod.run({ value: o, issues: [] }, r), i = t.right._zod.run({ value: o, issues: [] }, r);
    return s instanceof Promise || i instanceof Promise ? Promise.all([s, i]).then(([u, c]) => cr(n, u, c)) : cr(n, s, i);
  };
});
function cn(e, t) {
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
      const i = cn(e[s], t[s]);
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
      const o = e[r], s = t[r], i = cn(o, s);
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
function cr(e, t, n) {
  const r = /* @__PURE__ */ new Map();
  let o;
  const s = /* @__PURE__ */ new Map(), i = (c, d) => {
    let f;
    if (c.code === "unrecognized_keys" && !c.path?.length)
      o ?? (o = c), f = c.keys;
    else if (c.code === "invalid_key" && c.origin === "record" && c.path?.length === 1) {
      const p = String(c.path[0]);
      s.has(p) || s.set(p, c), f = [p];
    } else
      return !1;
    for (const p of f)
      r.has(p) || r.set(p, {}), r.get(p)[d] = !0;
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
  const u = cn(t.value, n.value);
  if (!u.valid) {
    if (me(e))
      return e;
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(u.mergeErrorPath)}`);
  }
  return e.value = u.data, e;
}
const Hc = /* @__PURE__ */ m("$ZodRecord", (e, t) => {
  I.init(e, t);
  const n = ie.memoizer;
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
              issues: f.issues.map((h) => Se(h, o, fe())),
              input: d,
              path: [d],
              inst: e
            });
            continue;
          }
          const p = f.value;
          if (p === "__proto__")
            continue;
          const g = t.valueType._zod.run({ value: s[d], issues: [] }, o);
          g instanceof Promise ? i.push(g.then((h) => {
            h.issues.length && r.issues.push(...Me(d, h.issues)), r.value[p] = h.value;
          })) : (g.issues.length && r.issues.push(...Me(d, g.issues)), r.value[p] = g.value);
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
        if (typeof c == "string" && In.test(c) && d.issues.length) {
          const h = t.keyType._zod.run({ value: Number(c), issues: [] }, o);
          if (h instanceof Promise)
            throw new Error("Async schemas not supported in object keys currently");
          h.issues.length === 0 && (d = h);
        }
        if (d.issues.length) {
          t.mode === "loose" ? r.value[c] = s[c] : a ? (u = u ?? [], u.push(c)) : r.issues.push({
            code: "invalid_key",
            origin: "record",
            issues: d.issues.map((h) => Se(h, o, fe())),
            input: c,
            path: [c],
            inst: e
          });
          continue;
        }
        const p = d.value;
        if (p === "__proto__")
          continue;
        const g = t.valueType._zod.run({ value: s[c], issues: [] }, o);
        g instanceof Promise ? i.push(g.then((h) => {
          h.issues.length && r.issues.push(...Me(c, h.issues)), r.value[p] = h.value;
        })) : (g.issues.length && r.issues.push(...Me(c, g.issues)), r.value[p] = g.value);
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
}), Vc = /* @__PURE__ */ m("$ZodEnum", (e, t) => {
  I.init(e, t);
  const n = rn(t.entries), r = new Set(n);
  e._zod.values = r, P(e, "pattern", (o) => {
    const s = rn(o.def.entries).filter((i) => Pi.has(typeof i));
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
}), Jc = /* @__PURE__ */ m("$ZodTransform", (e, t) => {
  I.init(e, t), e._zod.optin = "optional", ie.memoizer?.guard(e), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new wo(e.constructor.name);
    const o = t.transform(n.value, n);
    if (r.async)
      return (o instanceof Promise ? o : Promise.resolve(o)).then((i) => (n.value = i, n));
    if (o instanceof Promise)
      throw new Ne();
    return n.value = o, n;
  };
});
function ur(e, t) {
  return e.value = t.issues.length ? void 0 : t.value, e;
}
const Uo = /* @__PURE__ */ m("$ZodOptional", (e, t) => {
  I.init(e, t), P(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), e._zod.optout = "optional", P(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? /* @__PURE__ */ new Set([...r, void 0]) : void 0;
  }), P(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${En(r.source)})?$`) : void 0;
  }), e._zod.parse = (n, r) => {
    if (n.value === void 0) {
      if (t.innerType._zod.optin !== "defaulted")
        return n;
      const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
      return o instanceof Promise ? o.then((s) => ur(n, s)) : ur(n, o);
    }
    return t.innerType._zod.run(n, r);
  };
}), Kc = /* @__PURE__ */ m("$ZodExactOptional", (e, t) => {
  Uo.init(e, t), P(e, "values", (n) => n.def.innerType._zod.values), P(e, "pattern", (n) => n.def.innerType._zod.pattern), e._zod.parse = (n, r) => t.innerType._zod.run(n, r);
}), Yc = /* @__PURE__ */ m("$ZodNullable", (e, t) => {
  I.init(e, t), P(e, "optin", (n) => n.def.innerType._zod.optin), P(e, "optout", (n) => n.def.innerType._zod.optout), P(e, "pattern", (n) => {
    const r = n.def.innerType._zod.pattern;
    return r ? new RegExp(`^(${En(r.source)}|null)$`) : void 0;
  }), P(e, "values", (n) => n.def.innerType._zod.values ? /* @__PURE__ */ new Set([...n.def.innerType._zod.values, null]) : void 0), e._zod.parse = (n, r) => n.value === null ? n : t.innerType._zod.run(n, r);
}), qc = /* @__PURE__ */ m("$ZodDefault", (e, t) => {
  I.init(e, t), e._zod.optin = "defaulted", P(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    if (n.value === void 0)
      return n.value = t.defaultValue, n;
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => lr(s, t)) : lr(o, t);
  };
});
function lr(e, t) {
  return e.value === void 0 && (e.value = t.defaultValue), e;
}
const Gc = /* @__PURE__ */ m("$ZodPrefault", (e, t) => {
  I.init(e, t), e._zod.optin = "defaulted", P(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => (r.direction === "backward" || n.value === void 0 && (n.value = t.defaultValue), t.innerType._zod.run(n, r));
}), Xc = /* @__PURE__ */ m("$ZodNonOptional", (e, t) => {
  I.init(e, t), P(e, "values", (n) => {
    const r = n.def.innerType._zod.values;
    return r ? new Set([...r].filter((o) => o !== void 0)) : void 0;
  }), e._zod.parse = (n, r) => {
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => dr(s, e)) : dr(o, e);
  };
});
function dr(e, t) {
  return !e.issues.length && e.value === void 0 && e.issues.push({
    code: "invalid_type",
    expected: "nonoptional",
    input: e.value,
    inst: t
  }), e;
}
function fr(e, t, n, r) {
  return t.issues.length ? (e.value = n.catchValue({
    ...t,
    value: e.value,
    error: {
      issues: t.issues.map((o) => Se(o, r, fe()))
    },
    input: e.value
  }), e) : (e.value = t.value, t.memo && (e.memo = !0), e);
}
const Qc = /* @__PURE__ */ m("$ZodCatch", (e, t) => {
  I.init(e, t), P(e, "optin", (n) => n.def.innerType._zod.optin === "defaulted" ? "defaulted" : "optional"), P(e, "optout", (n) => n.def.innerType._zod.optout), P(e, "values", (n) => n.def.innerType._zod.values), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run({ value: n.value, issues: [] }, r);
    return o instanceof Promise ? o.then((s) => fr(n, s, t, r)) : fr(n, o, t, r);
  };
}), eu = /* @__PURE__ */ m("$ZodPipe", (e, t) => {
  I.init(e, t), P(e, "values", (n) => n.def.in._zod.values), P(e, "optin", (n) => n.def.in._zod.optin), P(e, "optout", (n) => n.def.out._zod.optout), P(e, "propValues", (n) => n.def.in._zod.propValues), e._zod.parse = (n, r) => {
    if (r.direction === "backward") {
      const s = t.out._zod.run(n, r);
      return s instanceof Promise ? s.then((i) => ct(i, t.in, r)) : ct(s, t.in, r);
    }
    const o = t.in._zod.run(n, r);
    return o instanceof Promise ? o.then((s) => ct(s, t.out, r)) : ct(o, t.out, r);
  };
});
function ct(e, t, n) {
  return e.issues.some((r) => r.code !== "unrecognized_keys") ? (e.aborted = !0, e) : t._zod.run({ value: e.value, issues: e.issues }, n);
}
const tu = /* @__PURE__ */ m("$ZodReadonly", (e, t) => {
  I.init(e, t), P(e, "propValues", (n) => n.def.innerType._zod.propValues), P(e, "values", (n) => n.def.innerType._zod.values), P(e, "optin", (n) => n.def.innerType?._zod?.optin), P(e, "optout", (n) => n.def.innerType?._zod?.optout), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      return t.innerType._zod.run(n, r);
    const o = t.innerType._zod.run(n, r);
    return o instanceof Promise ? o.then(hr) : hr(o);
  };
});
function hr(e) {
  return e.memo || (e.value = Object.freeze(e.value)), e;
}
const nu = /* @__PURE__ */ m("$ZodCustom", (e, t) => {
  K.init(e, t), I.init(e, t), e._zod.parse = (n, r) => n, e._zod.check = (n) => {
    const r = n.value, o = t.fn(r);
    if (o instanceof Promise)
      return o.then((s) => pr(s, n, r, e));
    pr(o, n, r, e);
  };
});
function pr(e, t, n, r) {
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
    r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(tt(o));
  }
}
class ru extends Error {
  constructor() {
    super("Cannot parse a reference cycle that closes through a transform"), this.name = "ZodCyclicError";
  }
}
const un = "~memo", mr = [];
function Zo(e) {
  return e !== null && typeof e == "object";
}
function Jt(e) {
  return e.map((t) => t.path ? { ...t, path: t.path.slice() } : { ...t });
}
const Do = /* @__PURE__ */ new WeakMap(), Ke = 0, mt = 1, Ge = 2;
function gt(e, t, n) {
  const r = Do.get(e);
  if (r !== void 0)
    return r ? Ge : Ke;
  if (t.has(e))
    return Ge;
  t.add(e);
  let o = Ke;
  const s = (d) => {
    if (o !== Ge && d?._zod) {
      const f = gt(d, t);
      f > o && (o = f);
    }
  }, i = (d, f) => {
    let p = Ke;
    for (const g of Reflect.ownKeys(d)) {
      const h = Object.getOwnPropertyDescriptor(d, g);
      if (!h.enumerable)
        continue;
      const y = h.get ? mt : h.value?._zod ? gt(h.value, t) : Ke;
      y > p && (p = y);
    }
    return p;
  }, a = (d) => {
    d > o && (o = d);
  }, u = e._zod.def;
  switch (u.type) {
    case "object": {
      const d = lo(u);
      a(d ? i(d) : mt), s(u.catchall);
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
      a(d ? gt(d, t) : mt);
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
        const p = f.value;
        if (!(!p || typeof p != "object")) {
          if (p._zod)
            s(p);
          else if (Array.isArray(p))
            for (const g of p)
              s(g);
        }
      }
  }
  return t.delete(e), ou(e, o);
}
function ou(e, t) {
  return t !== mt && Do.set(e, t === Ge), t;
}
function su(e, t) {
  let n = e.buckets.get(t);
  return n || (n = /* @__PURE__ */ new WeakMap(), e.buckets.set(t, n)), n;
}
let ut;
const lt = [], iu = {
  alloc(e, t, n) {
    const r = ut;
    if (!r)
      return n;
    ut = void 0;
    const o = { value: n, issues: null };
    return r.set(t.value, o), lt.push(o), n;
  },
  guard(e) {
    var t;
    (t = e._zod).deferred ?? (t.deferred = []), e._zod.deferred.push(() => {
      const n = e._zod.parse, r = (o, s) => {
        if (s.direction !== "backward" && cu(s, o.value))
          throw new ru();
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
          const k = gt(e, /* @__PURE__ */ new Set());
          if (k === Ke)
            return e._zod.parse = i, e._zod.run === a && (e._zod.run = i), i(u, c);
          k === Ge || r ? n = !0 : r = !0;
        }
        const d = u.value;
        if (!Zo(d))
          return i(u, c);
        let f = c[un];
        f || (f = { buckets: /* @__PURE__ */ new WeakMap(), backEdges: void 0 }, c[un] = f);
        let p;
        o === c ? p = s : (p = su(f, e), o = c, s = p);
        const g = p.get(d);
        if (g)
          return u.value = g.value, g.issues ? g.issues.length && u.issues.push(...Jt(g.issues)) : (u.memo = !0, f.backEdges ?? (f.backEdges = /* @__PURE__ */ new WeakSet()), f.backEdges.add(g.value)), u;
        ut = p;
        const h = lt.length, y = i(u, c);
        ut = void 0;
        const v = lt.length > h ? lt.pop() : void 0;
        return y instanceof Promise ? y.then((k) => (v && (v.issues = k.issues.length ? Jt(k.issues) : mr), k)) : (v && (v.issues = y.issues.length ? Jt(y.issues) : mr), y);
      };
      e._zod.parse = a, e._zod.run === i && (e._zod.run = a);
    });
  }
};
function au() {
  return iu;
}
function cu(e, t) {
  const n = e[un]?.backEdges;
  return n !== void 0 && Zo(t) && n.has(t);
}
const uu = () => {
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
        const i = o(s.expected), a = Mi(s.input), u = o(a, s.input);
        return `Invalid input: expected ${i}, received ${u}`;
      }
      case "invalid_value":
        return s.values.length === 1 ? `Invalid input: expected ${go(s.values[0])}` : `Invalid option: expected one of ${Xn(s.values, "|")}`;
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
        return `Unrecognized key${s.keys.length > 1 ? "s" : ""}: ${Xn(s.keys, ", ")}`;
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
function lu() {
  return {
    localeError: uu()
  };
}
var gr;
class du {
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
function fu() {
  return new du();
}
(gr = globalThis).__zod_globalRegistry ?? (gr.__zod_globalRegistry = fu());
const Ye = globalThis.__zod_globalRegistry;
function Fo(e) {
  return e.checks && (e.checks = [...e.checks]), e;
}
// @__NO_SIDE_EFFECTS__
function hu(e, t) {
  return new e(Fo({ type: "string", ...b(t) }));
}
// @__NO_SIDE_EFFECTS__
function pu(e, t) {
  return new e({
    type: "string",
    format: "email",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function mu(e, t) {
  return new e({
    type: "string",
    format: "guid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function gu(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vu(e, t) {
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
function yu(e, t) {
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
function _u(e, t) {
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
function bu(e, t) {
  return new e({
    type: "string",
    format: "url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function wu(e, t) {
  return new e({
    type: "string",
    format: "emoji",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Su(e, t) {
  return new e({
    type: "string",
    format: "nanoid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ku(e, t) {
  return new e({
    type: "string",
    format: "cuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Pu(e, t) {
  return new e({
    type: "string",
    format: "cuid2",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function zu(e, t) {
  return new e({
    type: "string",
    format: "ulid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Eu(e, t) {
  return new e({
    type: "string",
    format: "xid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Cu(e, t) {
  return new e({
    type: "string",
    format: "ksuid",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ou(e, t) {
  return new e({
    type: "string",
    format: "ipv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function $u(e, t) {
  return new e({
    type: "string",
    format: "ipv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Tu(e, t) {
  return new e({
    type: "string",
    format: "cidrv4",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Nu(e, t) {
  return new e({
    type: "string",
    format: "cidrv6",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Au(e, t) {
  return new e({
    type: "string",
    format: "base64",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Iu(e, t) {
  return new e({
    type: "string",
    format: "base64url",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Ru(e, t) {
  return new e({
    type: "string",
    format: "e164",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Mu(e, t) {
  return new e({
    type: "string",
    format: "jwt",
    check: "string_format",
    abort: !1,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Uu(e, t) {
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
function Zu(e, t) {
  return new e({
    type: "string",
    format: "date",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Du(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Fu(e, t) {
  return new e({
    type: "string",
    format: "duration",
    check: "string_format",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function ju(e, t) {
  return new e(Fo({ type: "number", checks: [], ...b(t) }));
}
// @__NO_SIDE_EFFECTS__
function Lu(e, t) {
  return new e({
    type: "number",
    check: "number_format",
    abort: !1,
    format: "safeint",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function Bu(e, t) {
  return new e({
    type: "boolean",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function xu(e) {
  return new e({
    type: "unknown"
  });
}
// @__NO_SIDE_EFFECTS__
function Wu(e, t) {
  return new e({
    type: "never",
    ...b(t)
  });
}
// @__NO_SIDE_EFFECTS__
function vr(e, t) {
  return new Po({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Kt(e, t) {
  return new Po({
    check: "less_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function yr(e, t) {
  return new zo({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !1
  });
}
// @__NO_SIDE_EFFECTS__
function Yt(e, t) {
  return new zo({
    check: "greater_than",
    ...b(t),
    value: e,
    inclusive: !0
  });
}
// @__NO_SIDE_EFFECTS__
function _r(e, t) {
  return new ja({
    check: "multiple_of",
    ...b(t),
    value: e
  });
}
// @__NO_SIDE_EFFECTS__
function jo(e, t) {
  return new Ba({
    check: "max_length",
    ...b(t),
    maximum: e
  });
}
// @__NO_SIDE_EFFECTS__
function zt(e, t) {
  return new xa({
    check: "min_length",
    ...b(t),
    minimum: e
  });
}
// @__NO_SIDE_EFFECTS__
function Lo(e, t) {
  return new Wa({
    check: "length_equals",
    ...b(t),
    length: e
  });
}
// @__NO_SIDE_EFFECTS__
function Hu(e, t) {
  return new Ha({
    check: "string_format",
    format: "regex",
    ...b(t),
    pattern: e
  });
}
// @__NO_SIDE_EFFECTS__
function Vu(e) {
  return new Va({
    check: "string_format",
    format: "lowercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ju(e) {
  return new Ja({
    check: "string_format",
    format: "uppercase",
    ...b(e)
  });
}
// @__NO_SIDE_EFFECTS__
function Ku(e, t) {
  return new Ka({
    check: "string_format",
    format: "includes",
    ...b(t),
    includes: e
  });
}
// @__NO_SIDE_EFFECTS__
function Yu(e, t) {
  return new Ya({
    check: "string_format",
    format: "starts_with",
    ...b(t),
    prefix: e
  });
}
// @__NO_SIDE_EFFECTS__
function qu(e, t) {
  return new qa({
    check: "string_format",
    format: "ends_with",
    ...b(t),
    suffix: e
  });
}
// @__NO_SIDE_EFFECTS__
function Be(e) {
  return new Ga({
    check: "overwrite",
    tx: e
  });
}
// @__NO_SIDE_EFFECTS__
function Gu(e) {
  return /* @__PURE__ */ Be((t) => t.normalize(e));
}
// @__NO_SIDE_EFFECTS__
function Xu() {
  return /* @__PURE__ */ Be((e) => e.trim());
}
// @__NO_SIDE_EFFECTS__
function Qu() {
  return /* @__PURE__ */ Be((e) => e.toLowerCase());
}
// @__NO_SIDE_EFFECTS__
function el() {
  return /* @__PURE__ */ Be((e) => e.toUpperCase());
}
// @__NO_SIDE_EFFECTS__
function tl() {
  return /* @__PURE__ */ Be((e) => Si(e));
}
// @__NO_SIDE_EFFECTS__
function nl(e, t, n) {
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
function rl(e, t, n) {
  return new e({
    type: "custom",
    check: "custom",
    fn: t,
    ...b(n)
  });
}
// @__NO_SIDE_EFFECTS__
function ol(e, t) {
  const n = /* @__PURE__ */ sl((r) => (r.addIssue = (o) => {
    if (typeof o == "string")
      r.issues.push(tt(o, r.value, n._zod.def));
    else {
      const s = o;
      s.fatal && (s.continue = !1), s.code ?? (s.code = "custom"), "input" in s || (s.input = r.value), s.inst ?? (s.inst = n), s.continue ?? (s.continue = !n._zod.def.abort), r.issues.push(tt(s));
    }
  }, e(r.value, r)), t);
  return n;
}
// @__NO_SIDE_EFFECTS__
function sl(e, t) {
  const n = new K({
    check: "custom",
    ...b(t)
  });
  return n._zod.check = e, n;
}
function Xe(e, ...t) {
  for (const n of t)
    for (const r of Reflect.ownKeys(n))
      Object.prototype.propertyIsEnumerable.call(n, r) && Ce(e, r, n[r]);
  return e;
}
function Bo(e) {
  let t = e?.target ?? "draft-2020-12";
  return t === "draft-4" && (t = "draft-04"), t === "draft-7" && (t = "draft-07"), {
    processors: e.processors ?? {},
    metadataRegistry: e?.metadata ?? Ye,
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
function xe(e, t, n, r, o) {
  const s = typeof t.unrepresentable == "function" ? t.unrepresentable({ zodSchema: e, path: r.path, message: o }) : t.unrepresentable;
  if (s === "any")
    return !1;
  if (s === void 0 || s === "throw")
    throw new Error(o);
  return Object.assign(n, s), !0;
}
function D(e, t, n = { path: [], schemaPath: [] }) {
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
      const p = i.schema, g = t.processors[o.type];
      if (!g)
        throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      g(e, t, p, d);
    }
    const f = e._zod.parent;
    f && (i.ref || (i.ref = f), D(f, t, d), t.seen.get(f).isParent = !0);
  }
  const u = t.metadataRegistry.get(e);
  return u && Xe(i.schema, u), t.io === "input" && B(e) && (delete i.schema.examples, delete i.schema.default), t.io === "input" && "_prefault" in i.schema && ((r = i.schema).default ?? (r.default = i.schema._prefault)), delete i.schema._prefault, t.seen.get(e).schema;
}
function br(e) {
  return e.replace(/~/g, "~0").replace(/\//g, "~1");
}
function xo(e, t) {
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
      const f = e.external.registry.get(i[0])?.id, p = e.external.uri ?? ((h) => h);
      if (f)
        return { ref: p(f) };
      const g = i[1].defId ?? i[1].schema.id ?? `schema${e.counter++}`;
      return i[1].defId = g, { defId: g, ref: `${p("__shared")}#/${a}/${br(g)}` };
    }
    const u = "#", c = `${u}/${a}/`;
    if (i[1] === n && !i[1].schema.id)
      return { ref: u };
    const d = i[1].schema.id ?? `__schema${e.counter++}`;
    return { defId: d, ref: c + br(d) };
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
function Wo(e) {
  const t = e.anyOf;
  if (!Array.isArray(t) || t.length === 0 || e.type !== void 0)
    return;
  const n = [];
  for (const r of t) {
    if (!r || typeof r != "object")
      return;
    Wo(r);
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
const Ho = /* @__PURE__ */ new Set(["type", "properties", "required", "additionalProperties"]), wr = ["oneOf", "anyOf"];
function Sr(e) {
  const t = e.additionalProperties;
  return t === void 0 || t === !1 || typeof t != "object" || t === null ? null : Object.keys(t).length ? t : null;
}
function ln(e) {
  const t = [];
  for (const s of e) {
    if (typeof s != "object" || s.type !== "object")
      return null;
    for (const i in s)
      if (!Ho.has(i))
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
        const d = c.properties?.[i] ?? Sr(c);
        d != null && (a.some((f) => JSON.stringify(f) === JSON.stringify(d)) || a.push(d));
      }
      const u = a.length === 1 ? a[0] : ln(a) ?? { allOf: a };
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
      const a = Sr(i);
      a && !s.some((u) => JSON.stringify(u) === JSON.stringify(a)) && s.push(a);
    }
    s.length === 1 ? o.additionalProperties = s[0] : s.length > 1 && (o.additionalProperties = { allOf: s });
  }
  return o;
}
function il(e) {
  const t = e.allOf;
  if (!Array.isArray(t) || t.length < 2)
    return;
  for (const o of Ho)
    if (o in e)
      return;
  const n = t.filter((o) => wr.some((s) => Array.isArray(o[s])));
  let r = null;
  if (!n.length)
    r = ln(t);
  else {
    const o = n[0], s = wr.find((u) => Array.isArray(o[u]));
    if (Object.keys(o).length !== 1)
      return;
    const i = t.filter((u) => u !== o), a = o[s].map((u) => ln([...i, u]));
    if (a.some((u) => !u))
      return;
    r = { [s]: a };
  }
  r && (delete e.allOf, Xe(e, r));
}
function Vo(e, t) {
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
      const g = e.seen.get(f), h = g.schema;
      if (h.$ref && (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0") ? (c.allOf = c.allOf ?? [], c.allOf.push(h)) : Xe(c, h), Xe(c, d), a._zod.parent === f)
        for (const v in c)
          v === "$ref" || v === "allOf" || v in d || delete c[v];
      if (h.$ref && g.def)
        for (const v in c)
          v === "$ref" || v === "allOf" || v in g.def && JSON.stringify(c[v]) === JSON.stringify(g.def[v]) && delete c[v];
    }
    const p = a._zod.parent;
    if (p && p !== f) {
      r(p);
      const g = e.seen.get(p);
      if (g?.schema.$ref && (c.$ref = g.schema.$ref, g.def))
        for (const h in c)
          h === "$ref" || h === "allOf" || h in g.def && JSON.stringify(c[h]) === JSON.stringify(g.def[h]) && delete c[h];
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
        Wo(a[1].def ?? a[1].schema);
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
          il(c);
    }
  }
  const o = {};
  if (e.target === "draft-2020-12" ? o.$schema = "https://json-schema.org/draft/2020-12/schema" : e.target === "draft-07" ? o.$schema = "http://json-schema.org/draft-07/schema#" : e.target === "draft-04" ? o.$schema = "http://json-schema.org/draft-04/schema#" : e.target, e.external?.uri) {
    const a = e.external.registry.get(t)?.id;
    if (!a)
      throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(a);
  }
  Xe(o, n.defId ? n.schema : n.def ?? n.schema);
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
function B(e, t) {
  const n = t ?? { seen: /* @__PURE__ */ new Set() };
  if (n.seen.has(e))
    return !1;
  n.seen.add(e);
  const r = e._zod.def;
  if (r.type === "transform")
    return !0;
  if (r.type === "array")
    return B(r.element, n);
  if (r.type === "set")
    return B(r.valueType, n);
  if (r.type === "lazy")
    return B(r.getter(), n);
  if (r.type === "promise" || r.type === "optional" || r.type === "nonoptional" || r.type === "nullable" || r.type === "readonly" || r.type === "default" || r.type === "prefault" || r.type === "catch")
    return B(r.innerType, n);
  if (r.type === "intersection")
    return B(r.left, n) || B(r.right, n);
  if (r.type === "record" || r.type === "map")
    return B(r.keyType, n) || B(r.valueType, n);
  if (r.type === "pipe")
    return e._zod.traits.has("$ZodCodec") ? !0 : B(r.in, n) || B(r.out, n);
  if (r.type === "object") {
    for (const o in r.shape)
      if (B(r.shape[o], n))
        return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options)
      if (B(o, n))
        return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items)
      if (B(o, n))
        return !0;
    return !!(r.rest && B(r.rest, n));
  }
  return !1;
}
const al = (e, t = {}) => (n) => {
  const r = Bo({ ...n, processors: t });
  return D(e, r), xo(r, e), Vo(r, e);
}, Et = (e, t, n = {}) => (r) => {
  const { libraryOptions: o, target: s } = r ?? {}, i = Bo({ ...o ?? {}, target: s, io: t, processors: n });
  return D(e, i), xo(i, e), Vo(i, e);
}, Fe = (e, t, n) => {
  (e[t] === void 0 || n > e[t]) && (e[t] = n);
}, je = (e, t, n) => {
  (e[t] === void 0 || n < e[t]) && (e[t] = n);
}, kr = (e, t) => {
  Fe(e, "minimum", t), je(e, "maximum", t);
}, Jo = (e, t) => {
  e.multipleOf ?? (e.multipleOf = []), e.multipleOf.includes(t) || e.multipleOf.push(t);
}, Ko = (e, t) => {
  e.patterns ?? (e.patterns = /* @__PURE__ */ new Set()), e.patterns.add(t);
}, Yo = (e, t) => {
  e.mime = e.mime ? e.mime.filter((n) => t.includes(n)) : [...t];
}, qo = (e, t) => {
  e.format = t, t.includes("int") && (e.isInt = !0);
}, Pr = (e, t) => Fe(e, "minimum", t.minimum), zr = (e, t) => je(e, "maximum", t.maximum), Er = (e) => (t, n) => {
  qo(t, n.format);
  const [r, o] = e[n.format];
  Fe(t, "minimum", r), je(t, "maximum", o);
}, cl = {
  greater_than: (e, t) => Fe(e, t.inclusive ? "minimum" : "exclusiveMinimum", t.value),
  less_than: (e, t) => je(e, t.inclusive ? "maximum" : "exclusiveMaximum", t.value),
  multiple_of: (e, t) => Jo(e, t.value),
  number_format: Er(vo),
  bigint_format: Er(Ei),
  min_length: Pr,
  max_length: zr,
  length_equals: (e, t) => kr(e, t.length),
  min_size: Pr,
  max_size: zr,
  size_equals: (e, t) => kr(e, t.size),
  string_format: (e, t) => {
    qo(e, t.format), t.pattern && Ko(e, t.pattern), (t.format === "base64" || t.format === "base64url") && (e.contentEncoding = t.format), (t.local || t.precision === -1) && (e.laxFormat = !0);
  },
  mime_type: (e, t) => Yo(e, t.mime)
};
function se(e) {
  const t = {}, n = e._zod.def, r = e._zod.traits.has("$ZodCheck") ? [e, ...n.checks ?? []] : n.checks ?? [];
  for (const s of r)
    cl[s._zod.def.check]?.(t, s._zod.def);
  const o = e._zod.bag;
  o.minimum !== void 0 && Fe(t, "minimum", o.minimum), o.exclusiveMinimum !== void 0 && Fe(t, "exclusiveMinimum", o.exclusiveMinimum), o.maximum !== void 0 && je(t, "maximum", o.maximum), o.exclusiveMaximum !== void 0 && je(t, "exclusiveMaximum", o.exclusiveMaximum), o.multipleOf !== void 0 && Jo(t, o.multipleOf), o.format !== void 0 && (t.format ?? (t.format = o.format), o.format.includes("int") && (t.isInt = !0)), o.mime && Yo(t, o.mime);
  for (const s of o.patterns ?? [])
    Ko(t, s);
  return t;
}
const ul = {
  guid: "uuid",
  url: "uri",
  datetime: "date-time",
  json_string: "json-string",
  regex: ""
  // do not set
}, ll = /* @__PURE__ */ new Map([
  [Ao, Ca],
  [Un, Oa]
]), Go = (e) => ll.get(e) ?? e, dl = (e, t, n, r) => {
  const o = n;
  o.type = "string";
  const { minimum: s, maximum: i, format: a, patterns: u, contentEncoding: c, laxFormat: d } = se(e);
  if (typeof s == "number" && (o.minLength = s), typeof i == "number" && (o.maxLength = i), a && (o.format = ul[a] ?? a, o.format === "" && delete o.format, (a === "time" || d) && delete o.format), c && (o.contentEncoding = c), u && u.size > 0) {
    const f = [...u].map(Go);
    f.length === 1 ? o.pattern = f[0].source : f.length > 1 && (o.allOf = [
      ...f.map((p) => ({
        ...t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0" ? { type: "string" } : {},
        pattern: p.source
      }))
    ]);
  }
}, fl = (e, t, n, r) => {
  const o = n, { minimum: s, maximum: i, multipleOf: a, exclusiveMaximum: u, exclusiveMinimum: c, isInt: d } = se(e);
  o.type = d ? "integer" : "number";
  const f = typeof c == "number" && c >= (s ?? Number.NEGATIVE_INFINITY), p = typeof u == "number" && u <= (i ?? Number.POSITIVE_INFINITY), g = t.target === "draft-04" || t.target === "openapi-3.0";
  if (f ? g ? (o.minimum = c, o.exclusiveMinimum = !0) : o.exclusiveMinimum = c : typeof s == "number" && (o.minimum = s), p ? g ? (o.maximum = u, o.exclusiveMaximum = !0) : o.exclusiveMaximum = u : typeof i == "number" && (o.maximum = i), a) {
    const h = /* @__PURE__ */ new Set();
    for (const k of a)
      Number.isFinite(k) && k !== 0 ? h.add(Math.abs(k)) : xe(e, t, o, r, `A multipleOf divisor of ${k} cannot be represented in JSON Schema`);
    const [y, ...v] = h;
    y !== void 0 && (o.multipleOf = y), v.length && (o.allOf = [...o.allOf ?? [], ...v.map((k) => ({ multipleOf: k }))]);
  }
}, hl = (e, t, n, r) => {
  n.type = "boolean";
}, pl = (e, t, n, r) => {
  n.not = {};
}, ml = (e, t, n, r) => {
}, gl = (e, t, n, r) => {
  const o = e._zod.def, s = rn(o.entries);
  if (s.length === 0) {
    n.not = {};
    return;
  }
  s.every((i) => typeof i == "number") && (n.type = "number"), s.every((i) => typeof i == "string") && (n.type = "string"), n.enum = s;
}, vl = (e, t, n, r) => {
  xe(e, t, n, r, "Custom types cannot be represented in JSON Schema");
}, yl = (e, t, n, r) => {
  xe(e, t, n, r, "Transforms cannot be represented in JSON Schema");
}, _l = (e, t, n, r) => {
  const o = n, s = e._zod.def, { minimum: i, maximum: a } = se(e);
  typeof i == "number" && (o.minItems = i), typeof a == "number" && (o.maxItems = a), o.type = "array", o.items = D(s.element, t, {
    ...r,
    path: [...r.path, "items"]
  });
};
function Ct(e) {
  const t = e._zod.def;
  return t.type === "pipe" && t.in._zod.traits.has("$ZodTransform") ? Ct(t.out) : t.type === "catch" ? Ct(t.innerType) : e._zod.optin;
}
const bl = (e, t, n, r) => {
  const o = n, s = e._zod.def, i = s.shape;
  if (Object.getOwnPropertySymbols(i).length && xe(e, t, o, r, "Symbol keys cannot be represented in JSON Schema"))
    return;
  o.type = "object", o.properties = {};
  for (const c in i)
    Ce(o.properties, c, D(i[c], t, {
      ...r,
      path: [...r.path, "properties", c]
    }));
  const u = [];
  for (const c of Object.keys(i)) {
    const d = s.shape[c];
    (t.io === "input" ? Ct(d) === void 0 : d._zod.optout === void 0) && u.push(c);
  }
  u.length > 0 && (o.required = u), s.catchall?._zod.def.type === "never" ? o.additionalProperties = !1 : s.catchall ? s.catchall && (o.additionalProperties = D(s.catchall, t, {
    ...r,
    path: [...r.path, "additionalProperties"]
  })) : t.io === "output" && (o.additionalProperties = !1);
}, wl = (e, t, n, r) => {
  const o = e._zod.def, s = o.inclusive === !1, i = o.options.map((a, u) => D(a, t, {
    ...r,
    path: [...r.path, s ? "oneOf" : "anyOf", u]
  }));
  s ? n.oneOf = i : n.anyOf = i;
}, Sl = (e, t, n, r) => {
  const o = e._zod.def, s = D(o.left, t, {
    ...r,
    path: [...r.path, "allOf", 0]
  }), i = D(o.right, t, {
    ...r,
    path: [...r.path, "allOf", 1]
  }), a = (c) => "allOf" in c && Object.keys(c).length === 1, u = [
    ...a(s) ? s.allOf : [s],
    ...a(i) ? i.allOf : [i]
  ];
  n.allOf = u, t.intersections.push(u);
};
function dn(e, t, n) {
  if (t.$ref) {
    if (n.has(t))
      return t;
    n.add(t);
    const h = e.get(t)?.def;
    if (!h)
      return t;
    const y = dn(e, h, n);
    return y === h ? t : y;
  }
  for (const h of ["anyOf", "oneOf"]) {
    const y = t[h];
    if (!Array.isArray(y))
      continue;
    const v = y.map((k) => dn(e, k, n));
    v.some((k, W) => k !== y[W]) && (t = { ...t, [h]: v });
  }
  const r = Array.isArray(t.type) ? t.type : [t.type], o = !r.includes("string") && r.some((h) => h === "number" || h === "integer"), s = t.enum ?? (t.const !== void 0 ? [t.const] : void 0);
  if (!o && !s?.some((h) => typeof h == "number"))
    return t;
  const { minimum: i, maximum: a, exclusiveMinimum: u, exclusiveMaximum: c, multipleOf: d, format: f, id: p, ...g } = t;
  return g.enum ? g.enum = g.enum.map((h) => typeof h == "number" ? String(h) : h) : typeof g.const == "number" && (g.const = String(g.const)), o && (g.type = "string", s || (g.pattern = (r.includes("number") ? In : Ua).source)), g;
}
const fn = /* @__PURE__ */ new WeakMap();
function kl(e) {
  const t = /* @__PURE__ */ new Map();
  for (const r of e.seen.values())
    r.def && !t.has(r.schema) && t.set(r.schema, r);
  const n = /* @__PURE__ */ new Map();
  for (const r of fn.get(e) ?? []) {
    const o = e.seen.get(r), s = (o?.def ?? o?.schema)?.propertyNames;
    if (!s || s === !0 || n.has(s))
      continue;
    const i = dn(t, s, /* @__PURE__ */ new Set());
    i !== s && n.set(s, i);
  }
  if (n.size)
    for (const r of e.seen.values())
      for (const o of [r.schema, r.def]) {
        const s = o && n.get(o.propertyNames);
        s && (o.propertyNames = s);
      }
}
const Pl = (e, t, n, r) => {
  const o = n, s = e._zod.def;
  o.type = "object";
  const i = s.keyType, a = se(i).patterns;
  if (s.mode === "loose" && a && a.size > 0) {
    const d = D(s.valueType, t, {
      ...r,
      path: [...r.path, "patternProperties", "*"]
    });
    o.patternProperties = {};
    for (const f of a)
      Ce(o.patternProperties, Go(f).source, d);
  } else {
    if (t.target === "draft-07" || t.target === "draft-2020-12") {
      o.propertyNames = D(s.keyType, t, {
        ...r,
        path: [...r.path, "propertyNames"]
      });
      let d = fn.get(t);
      d || (d = [], fn.set(t, d), t.deferred.push(() => kl(t))), d.push(e);
    }
    o.additionalProperties = D(s.valueType, t, {
      ...r,
      path: [...r.path, "additionalProperties"]
    });
  }
  const u = i._zod.values, c = t.io === "input" && Ct(s.valueType) !== void 0;
  if (u && !s.partial && !c) {
    const d = [...u].filter((f) => typeof f == "string" || typeof f == "number");
    d.length > 0 && (o.required = d.map(String));
  }
}, zl = (e, t, n, r) => {
  const o = e._zod.def, s = D(o.innerType, t, r), i = t.seen.get(e);
  t.target === "openapi-3.0" ? (i.ref = o.innerType, n.nullable = !0) : n.anyOf = [s, { type: "null" }];
}, El = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType;
}, Zn = /* @__PURE__ */ Symbol();
function Xo(e, t, n, r, o) {
  let s = !1;
  const i = JSON.stringify(e, (a, u) => typeof u != "bigint" ? u : (s = !0, null));
  return s ? (xe(t, n, r, o, "BigInt defaults cannot be represented in JSON Schema"), Zn) : JSON.parse(i);
}
const Cl = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType;
  const i = Xo(o.defaultValue, e, t, n, r);
  i !== Zn && (n.default = i);
}, Ol = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const s = t.seen.get(e);
  if (s.ref = o.innerType, t.io !== "input")
    return;
  const i = Xo(o.defaultValue, e, t, n, r);
  i !== Zn && (n._prefault = i);
}, $l = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType;
  let i;
  try {
    i = o.catchValue(void 0);
  } catch {
    xe(e, t, n, r, "Dynamic catch values are not supported in JSON Schema");
    return;
  }
  n.default = i;
}, Tl = (e, t, n, r) => {
  const o = e._zod.def, s = o.in._zod.traits.has("$ZodTransform"), i = t.io === "input" ? s ? o.out : o.in : o.out;
  D(i, t, r);
  const a = t.seen.get(e);
  a.ref = i;
}, Nl = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType, n.readOnly = !0;
}, Qo = (e, t, n, r) => {
  const o = e._zod.def;
  D(o.innerType, t, r);
  const s = t.seen.get(e);
  s.ref = o.innerType;
}, Cr = /* @__PURE__ */ new WeakSet([Object.prototype, Error.prototype]);
function dt(e, t, n) {
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
const es = (e, t) => {
  Ki.init(e, t), e.name = "ZodError";
  const n = Object.getPrototypeOf(e);
  Cr.has(n) || (Cr.add(n), dt(n, "format", (r) => (o) => Gi(r, o)), dt(n, "flatten", (r) => (o) => qi(r, o)), dt(n, "addIssue", (r) => (o) => {
    r.issues.push(o), r.message = JSON.stringify(r.issues, on, 2);
  }), dt(n, "addIssues", (r) => (o) => {
    r.issues.push(...o), r.message = JSON.stringify(r.issues, on, 2);
  }), Object.defineProperty(n, "isEmpty", {
    configurable: !0,
    enumerable: !1,
    get() {
      return this.issues.length === 0;
    }
  }));
}, Al = /* @__PURE__ */ m("ZodError", es), ne = /* @__PURE__ */ m("ZodError", es, void 0, {
  Parent: Error
}), Il = /* @__PURE__ */ $n(ne), Rl = /* @__PURE__ */ Tn(ne), Ml = /* @__PURE__ */ Nn(ne), Ul = /* @__PURE__ */ An(ne), Zl = /* @__PURE__ */ ra(ne), Dl = /* @__PURE__ */ oa(ne), Fl = /* @__PURE__ */ sa(ne), jl = /* @__PURE__ */ ia(ne), Ll = /* @__PURE__ */ aa(ne), Bl = /* @__PURE__ */ ca(ne), xl = /* @__PURE__ */ ua(ne), Wl = /* @__PURE__ */ la(ne);
function Hl() {
  ie.localeError || fe(lu());
}
function Dt() {
  ie.memoizer || fe({ memoizer: au() });
}
const R = /* @__PURE__ */ m("ZodType", (e, t) => (Hl(), I.init(e, t), e.def = t, e.type = t.type, e), {
  check(...e) {
    const t = this.def;
    return this.clone(q(t, {
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
    return this.check(Ld(e, t));
  },
  superRefine(e, t) {
    return this.check(Bd(e, t));
  },
  overwrite(e) {
    return this.check(/* @__PURE__ */ Be(e));
  },
  optional() {
    return Nr(this);
  },
  exactOptional() {
    return Od(this);
  },
  nullable() {
    return Ar(this);
  },
  nullish() {
    return Nr(Ar(this));
  },
  nonoptional(e) {
    return Rd(this, e);
  },
  array() {
    return J(this);
  },
  or(e) {
    return kd([this, e]);
  },
  and(e) {
    return zd(this, e);
  },
  transform(e) {
    return Ir(this, Cd(e));
  },
  default(e) {
    return Nd(this, e);
  },
  prefault(e) {
    return Id(this, e);
  },
  catch(e) {
    return Ud(this, e);
  },
  pipe(e) {
    return Ir(this, e);
  },
  readonly() {
    return Fd(this);
  },
  describe(e) {
    const t = this.clone();
    return Ye.add(t, { description: e }), t;
  },
  meta(...e) {
    if (e.length === 0)
      return Ye.get(this);
    const t = this.clone();
    return Ye.add(t, e[0]), t;
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
    return _o(this, "~standard", {
      ...Co(this),
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
    return Il(this, t, n, { callee: e });
  },
  parseAsync: async function e(t, n) {
    return await Rl(this, t, n, { callee: e });
  },
  safeParse(e, t) {
    return Ml(this, e, t);
  },
  async safeParseAsync(e, t) {
    return Ul(this, e, t);
  },
  // `spa` is an alias: same function object as `safeParseAsync`, as before.
  get spa() {
    return this?.safeParseAsync;
  },
  set spa(e) {
    ke(this, "spa", e);
  },
  validate(e, t) {
    return ea(this, e, t);
  },
  validateAsync(e, t) {
    return na(this, e, t);
  },
  encode: function e(t, n) {
    return Zl(this, t, n, { callee: e });
  },
  decode: function e(t, n) {
    return Dl(this, t, n, { callee: e });
  },
  encodeAsync: async function e(t, n) {
    return await Fl(this, t, n, { callee: e });
  },
  decodeAsync: async function e(t, n) {
    return await jl(this, t, n, { callee: e });
  },
  safeEncode(e, t) {
    return Ll(this, e, t);
  },
  safeDecode(e, t) {
    return Bl(this, e, t);
  },
  async safeEncodeAsync(e, t) {
    return xl(this, e, t);
  },
  async safeDecodeAsync(e, t) {
    return Wl(this, e, t);
  },
  toJSONSchema(e) {
    return al(this, {})(e);
  },
  // Reads through to the registry on every access, so it must not cache.
  get description() {
    return Ye.get(this)?.description;
  },
  // No setter: `schema._def = x` throws, as it did when `_def` was a non-writable own property.
  get _def() {
    return this._zod.def;
  }
}), ts = /* @__PURE__ */ m(
  "_ZodString",
  (e, t) => {
    Mn.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => dl(e, n, r);
  },
  /* @__PURE__ */ bo({
    format: (e) => se(e).format ?? null,
    minLength: (e) => se(e).minimum ?? null,
    maxLength: (e) => se(e).maximum ?? null
  }, {
    regex(...e) {
      return this.check(/* @__PURE__ */ Hu(...e));
    },
    includes(...e) {
      return this.check(/* @__PURE__ */ Ku(...e));
    },
    startsWith(...e) {
      return this.check(/* @__PURE__ */ Yu(...e));
    },
    endsWith(...e) {
      return this.check(/* @__PURE__ */ qu(...e));
    },
    min(...e) {
      return this.check(/* @__PURE__ */ zt(...e));
    },
    max(...e) {
      return this.check(/* @__PURE__ */ jo(...e));
    },
    length(...e) {
      return this.check(/* @__PURE__ */ Lo(...e));
    },
    nonempty(...e) {
      return this.check(/* @__PURE__ */ zt(1, ...e));
    },
    lowercase(e) {
      return this.check(/* @__PURE__ */ Vu(e));
    },
    uppercase(e) {
      return this.check(/* @__PURE__ */ Ju(e));
    },
    trim() {
      return this.check(/* @__PURE__ */ Xu());
    },
    normalize(...e) {
      return this.check(/* @__PURE__ */ Gu(...e));
    },
    toLowerCase() {
      return this.check(/* @__PURE__ */ Qu());
    },
    toUpperCase() {
      return this.check(/* @__PURE__ */ el());
    },
    slugify() {
      return this.check(/* @__PURE__ */ tl());
    }
  })
), Vl = /* @__PURE__ */ m("ZodString", (e, t) => {
  Mn.init(e, t), ts.init(e, t);
}, {
  email(e) {
    return this.check(/* @__PURE__ */ pu(Gl, e));
  },
  url(e) {
    return this.check(/* @__PURE__ */ bu(Ql, e));
  },
  jwt(e) {
    return this.check(/* @__PURE__ */ Mu(pd, e));
  },
  emoji(e) {
    return this.check(/* @__PURE__ */ wu(ed, e));
  },
  guid(e) {
    return this.check(/* @__PURE__ */ mu(Xl, e));
  },
  uuid(e) {
    return this.check(/* @__PURE__ */ gu(ft, e));
  },
  uuidv4(e) {
    return this.check(/* @__PURE__ */ vu(ft, e));
  },
  uuidv6(e) {
    return this.check(/* @__PURE__ */ yu(ft, e));
  },
  uuidv7(e) {
    return this.check(/* @__PURE__ */ _u(ft, e));
  },
  nanoid(e) {
    return this.check(/* @__PURE__ */ Su(td, e));
  },
  cuid(e) {
    return this.check(/* @__PURE__ */ ku(nd, e));
  },
  cuid2(e) {
    return this.check(/* @__PURE__ */ Pu(rd, e));
  },
  ulid(e) {
    return this.check(/* @__PURE__ */ zu(od, e));
  },
  base64(e) {
    return this.check(/* @__PURE__ */ Au(dd, e));
  },
  base64url(e) {
    return this.check(/* @__PURE__ */ Iu(fd, e));
  },
  xid(e) {
    return this.check(/* @__PURE__ */ Eu(sd, e));
  },
  ksuid(e) {
    return this.check(/* @__PURE__ */ Cu(id, e));
  },
  ipv4(e) {
    return this.check(/* @__PURE__ */ Ou(ad, e));
  },
  ipv6(e) {
    return this.check(/* @__PURE__ */ $u(cd, e));
  },
  cidrv4(e) {
    return this.check(/* @__PURE__ */ Tu(ud, e));
  },
  cidrv6(e) {
    return this.check(/* @__PURE__ */ Nu(ld, e));
  },
  e164(e) {
    return this.check(/* @__PURE__ */ Ru(hd, e));
  },
  datetime(e) {
    return this.check(/* @__PURE__ */ Uu(Jl, e));
  },
  date(e) {
    return this.check(/* @__PURE__ */ Zu(Kl, e));
  },
  time(e) {
    return this.check(/* @__PURE__ */ Du(Yl, e));
  },
  duration(e) {
    return this.check(/* @__PURE__ */ Fu(ql, e));
  }
});
function U(e) {
  return /* @__PURE__ */ hu(Vl, e);
}
const N = /* @__PURE__ */ m("ZodStringFormat", (e, t) => {
  $.init(e, t), ts.init(e, t);
}), Jl = /* @__PURE__ */ m("ZodISODateTime", (e, t) => {
  vc.init(e, t), N.init(e, t);
}), Kl = /* @__PURE__ */ m("ZodISODate", (e, t) => {
  yc.init(e, t), N.init(e, t);
}), Yl = /* @__PURE__ */ m("ZodISOTime", (e, t) => {
  _c.init(e, t), N.init(e, t);
}), ql = /* @__PURE__ */ m("ZodISODuration", (e, t) => {
  bc.init(e, t), N.init(e, t);
}), Gl = /* @__PURE__ */ m("ZodEmail", (e, t) => {
  rc.init(e, t), N.init(e, t);
}), Xl = /* @__PURE__ */ m("ZodGUID", (e, t) => {
  tc.init(e, t), N.init(e, t);
}), ft = /* @__PURE__ */ m("ZodUUID", (e, t) => {
  nc.init(e, t), N.init(e, t);
}), Ql = /* @__PURE__ */ m("ZodURL", (e, t) => {
  uc.init(e, t), N.init(e, t);
}), ed = /* @__PURE__ */ m("ZodEmoji", (e, t) => {
  lc.init(e, t), N.init(e, t);
}), td = /* @__PURE__ */ m("ZodNanoID", (e, t) => {
  dc.init(e, t), N.init(e, t);
}), nd = /* @__PURE__ */ m("ZodCUID", (e, t) => {
  fc.init(e, t), N.init(e, t);
}), rd = /* @__PURE__ */ m("ZodCUID2", (e, t) => {
  hc.init(e, t), N.init(e, t);
}), od = /* @__PURE__ */ m("ZodULID", (e, t) => {
  pc.init(e, t), N.init(e, t);
}), sd = /* @__PURE__ */ m("ZodXID", (e, t) => {
  mc.init(e, t), N.init(e, t);
}), id = /* @__PURE__ */ m("ZodKSUID", (e, t) => {
  gc.init(e, t), N.init(e, t);
}), ad = /* @__PURE__ */ m("ZodIPv4", (e, t) => {
  wc.init(e, t), N.init(e, t);
}), cd = /* @__PURE__ */ m("ZodIPv6", (e, t) => {
  kc.init(e, t), N.init(e, t);
}), ud = /* @__PURE__ */ m("ZodCIDRv4", (e, t) => {
  Pc.init(e, t), N.init(e, t);
}), ld = /* @__PURE__ */ m("ZodCIDRv6", (e, t) => {
  Ec.init(e, t), N.init(e, t);
}), dd = /* @__PURE__ */ m("ZodBase64", (e, t) => {
  Cc.init(e, t), N.init(e, t);
}), fd = /* @__PURE__ */ m("ZodBase64URL", (e, t) => {
  $c.init(e, t), N.init(e, t);
}), hd = /* @__PURE__ */ m("ZodE164", (e, t) => {
  Tc.init(e, t), N.init(e, t);
}), pd = /* @__PURE__ */ m("ZodJWT", (e, t) => {
  Ac.init(e, t), N.init(e, t);
}), ns = /* @__PURE__ */ m(
  "ZodNumber",
  (e, t) => {
    Io.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => fl(e, n, r, o), e.isFinite = !0;
  },
  /* @__PURE__ */ bo({
    minValue: (e) => {
      const { minimum: t, exclusiveMinimum: n } = se(e);
      return Math.max(t ?? Number.NEGATIVE_INFINITY, n ?? Number.NEGATIVE_INFINITY);
    },
    maxValue: (e) => {
      const { maximum: t, exclusiveMaximum: n } = se(e);
      return Math.min(t ?? Number.POSITIVE_INFINITY, n ?? Number.POSITIVE_INFINITY);
    },
    isInt: (e) => {
      const { isInt: t, multipleOf: n } = se(e);
      return !!t || !!n?.some(Number.isSafeInteger);
    },
    format: (e) => se(e).format ?? null
  }, {
    gt(e, t) {
      return this.check(/* @__PURE__ */ yr(e, t));
    },
    gte(e, t) {
      return this.check(/* @__PURE__ */ Yt(e, t));
    },
    min(e, t) {
      return this.check(/* @__PURE__ */ Yt(e, t));
    },
    lt(e, t) {
      return this.check(/* @__PURE__ */ vr(e, t));
    },
    lte(e, t) {
      return this.check(/* @__PURE__ */ Kt(e, t));
    },
    max(e, t) {
      return this.check(/* @__PURE__ */ Kt(e, t));
    },
    int(e) {
      return this.check(Or(e));
    },
    safe(e) {
      return this.check(Or(e));
    },
    positive(e) {
      return this.check(/* @__PURE__ */ yr(0, e));
    },
    nonnegative(e) {
      return this.check(/* @__PURE__ */ Yt(0, e));
    },
    negative(e) {
      return this.check(/* @__PURE__ */ vr(0, e));
    },
    nonpositive(e) {
      return this.check(/* @__PURE__ */ Kt(0, e));
    },
    multipleOf(e, t) {
      return this.check(/* @__PURE__ */ _r(e, t));
    },
    step(e, t) {
      return this.check(/* @__PURE__ */ _r(e, t));
    },
    finite() {
      return this;
    }
  })
);
function ae(e) {
  return /* @__PURE__ */ ju(ns, e);
}
const md = /* @__PURE__ */ m("ZodNumberFormat", (e, t) => {
  Ic.init(e, t), ns.init(e, t);
});
function Or(e) {
  return /* @__PURE__ */ Lu(md, e);
}
const gd = /* @__PURE__ */ m("ZodBoolean", (e, t) => {
  Rc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => hl(e, n, r);
});
function ue(e) {
  return /* @__PURE__ */ Bu(gd, e);
}
const vd = /* @__PURE__ */ m("ZodUnknown", (e, t) => {
  Mc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => ml();
});
function $r() {
  return /* @__PURE__ */ xu(vd);
}
const yd = /* @__PURE__ */ m("ZodNever", (e, t) => {
  Uc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => pl(e, n, r);
});
function _d(e) {
  return /* @__PURE__ */ Wu(yd, e);
}
const bd = /* @__PURE__ */ m("ZodArray", (e, t) => {
  Dt(), Fc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => _l(e, n, r, o), e.element = t.element;
}, {
  min(e, t) {
    return this.check(/* @__PURE__ */ zt(e, t));
  },
  nonempty(e) {
    return this.check(/* @__PURE__ */ zt(1, e));
  },
  max(e, t) {
    return this.check(/* @__PURE__ */ jo(e, t));
  },
  length(e, t) {
    return this.check(/* @__PURE__ */ Lo(e, t));
  },
  unwrap() {
    return this.element;
  }
});
function J(e, t) {
  return /* @__PURE__ */ nl(bd, e, t);
}
const wd = /* @__PURE__ */ m("ZodObject", (e, t) => {
  Dt(), Bc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => bl(e, n, r, o), ji(e, "shape", (n) => n._zod.def.shape, !1);
}, {
  keyof() {
    return Dn(Object.keys(this._zod.def.shape));
  },
  catchall(e) {
    return this.clone(q(this._zod.def, { catchall: e }));
  },
  passthrough() {
    return this.clone(q(this._zod.def, { catchall: $r() }));
  },
  loose() {
    return this.clone(q(this._zod.def, { catchall: $r() }));
  },
  strict() {
    return this.clone(q(this._zod.def, { catchall: _d() }));
  },
  strip() {
    return this.clone(q(this._zod.def, { catchall: void 0 }));
  },
  extend(e) {
    return $i(this, e);
  },
  safeExtend(e) {
    return Ti(this, e);
  },
  merge(e) {
    return Ni(this, e);
  },
  pick(e) {
    return Ci(this, e);
  },
  omit(e) {
    return Oi(this, e);
  },
  partial(...e) {
    return Qn(rs, this, e[0]);
  },
  exactPartial(...e) {
    return Qn(os, this, e[0], "exactPartial");
  },
  required(...e) {
    return Ai(ss, this, e[0]);
  }
});
function C(e, t) {
  const n = {
    type: "object",
    shape: e ?? {},
    ...b(t)
  };
  return new wd(n);
}
const Sd = /* @__PURE__ */ m("ZodUnion", (e, t) => {
  xc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => wl(e, n, r, o), e.options = t.options;
});
function kd(e, t) {
  return new Sd({
    type: "union",
    options: e,
    ...b(t)
  });
}
const Pd = /* @__PURE__ */ m("ZodIntersection", (e, t) => {
  Wc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => Sl(e, n, r, o);
});
function zd(e, t) {
  return new Pd({
    type: "intersection",
    left: e,
    right: t
  });
}
const Tr = /* @__PURE__ */ m("ZodRecord", (e, t) => {
  Dt(), Hc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => Pl(e, n, r, o), e.keyType = t.keyType, e.valueType = t.valueType;
});
function nt(e, t, n) {
  return !t || !t._zod ? new Tr({
    type: "record",
    keyType: U(),
    valueType: e,
    ...b(t)
  }) : new Tr({
    type: "record",
    keyType: e,
    valueType: t,
    ...b(n)
  });
}
const hn = /* @__PURE__ */ m("ZodEnum", (e, t) => {
  Vc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (r, o, s) => gl(e, r, o), e.enum = t.entries, e.options = [...e._zod.values];
  const n = new Set(Object.keys(t.entries));
  e.extract = (r, o) => {
    const s = {};
    for (const i of r)
      if (n.has(i))
        s[i] = t.entries[i];
      else
        throw new Error(`Key ${i} not found in enum`);
    return new hn({
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
    return new hn({
      ...t,
      checks: [],
      ...b(o),
      entries: s
    });
  };
});
function Dn(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new hn({
    type: "enum",
    entries: n,
    ...b(t)
  });
}
const Ed = /* @__PURE__ */ m("ZodTransform", (e, t) => {
  Dt(), Jc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => yl(e, n, r, o), e._zod.parse = (n, r) => {
    if (r.direction === "backward")
      throw new wo(e.constructor.name);
    n.addIssue = (s) => {
      if (typeof s == "string")
        n.issues.push(tt(s, n.value, t));
      else {
        const i = s;
        i.fatal && (i.continue = !1), i.code ?? (i.code = "custom"), "input" in i || (i.input = n.value), i.inst ?? (i.inst = e), n.issues.push(tt(i));
      }
    };
    const o = t.transform(n.value, n);
    return o instanceof Promise ? o.then((s) => (n.value = s, n)) : (n.value = o, n);
  };
});
function Cd(e) {
  return new Ed({
    type: "transform",
    transform: e
  });
}
const rs = /* @__PURE__ */ m("ZodOptional", (e, t) => {
  Uo.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => Qo(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Nr(e) {
  return new rs({
    type: "optional",
    innerType: e
  });
}
const os = /* @__PURE__ */ m("ZodExactOptional", (e, t) => {
  Kc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => Qo(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Od(e) {
  return new os({
    type: "optional",
    innerType: e
  });
}
const $d = /* @__PURE__ */ m("ZodNullable", (e, t) => {
  Yc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => zl(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Ar(e) {
  return new $d({
    type: "nullable",
    innerType: e
  });
}
const Td = /* @__PURE__ */ m("ZodDefault", (e, t) => {
  qc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => Cl(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeDefault = e.unwrap;
});
function Nd(e, t) {
  return new Td({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : mo(t);
    }
  });
}
const Ad = /* @__PURE__ */ m("ZodPrefault", (e, t) => {
  Gc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => Ol(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Id(e, t) {
  return new Ad({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : mo(t);
    }
  });
}
const ss = /* @__PURE__ */ m("ZodNonOptional", (e, t) => {
  Xc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => El(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Rd(e, t) {
  return new ss({
    type: "nonoptional",
    innerType: e,
    ...b(t)
  });
}
const Md = /* @__PURE__ */ m("ZodCatch", (e, t) => {
  Qc.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => $l(e, n, r, o), e.unwrap = () => e._zod.def.innerType, e.removeCatch = e.unwrap;
});
function Ud(e, t) {
  return new Md({
    type: "catch",
    innerType: e,
    catchValue: typeof t == "function" ? t : Bi(t)
  });
}
const Zd = /* @__PURE__ */ m("ZodPipe", (e, t) => {
  eu.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => Tl(e, n, r, o), e.in = t.in, e.out = t.out;
});
function Ir(e, t) {
  return new Zd({
    type: "pipe",
    in: e,
    out: t
    // ...util.normalizeParams(params),
  });
}
const Dd = /* @__PURE__ */ m("ZodReadonly", (e, t) => {
  tu.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => Nl(e, n, r, o), e.unwrap = () => e._zod.def.innerType;
});
function Fd(e) {
  return new Dd({
    type: "readonly",
    innerType: e
  });
}
const jd = /* @__PURE__ */ m("ZodCustom", (e, t) => {
  nu.init(e, t), R.init(e, t), e._zod.processJSONSchema = (n, r, o) => vl(e, n, r, o);
});
function Ld(e, t = {}) {
  return /* @__PURE__ */ rl(jd, e, t);
}
function Bd(e, t) {
  return /* @__PURE__ */ ol(e, t);
}
const xd = ["hour", "day", "week", "month"], is = ["online", "error", "offline", "sleep", "maintenance"], Wd = ["pool", "network"], Hd = Dn(xd), be = ae().int().nonnegative(), pe = ae().int().nonnegative(), O = ae().nonnegative(), w = ae().nullable();
C({
  statusCode: ae().int(),
  error: U(),
  message: U()
});
const Fn = C({ id: U(), name: U() }), jn = C({
  id: U(),
  displayName: U(),
  vendor: U().nullable(),
  nominalHashrateThs: O.nullable(),
  nominalPowerW: O.nullable()
}), Ln = C({
  start: ae().int(),
  end: ae().int(),
  granularity: Hd,
  timezone: U()
}), Vd = C({
  miners: ue(),
  pool: ue(),
  /** The pool's recent payouts carry the subsidy / fee split. */
  poolSplit: ue(),
  /** The pool reports its own fee per payout, so gross revenue is known. */
  poolFee: ue(),
  market: ue(),
  /** At least one power meter other than the site meter. */
  meters: ue(),
  siteMeter: ue(),
  /** At least one month has a cost on Cost Input. */
  costs: ue()
}), Jd = C({
  site: C({ name: U(), timezone: U() }),
  miningUnits: J(Fn),
  models: J(jn),
  meters: J(C({ id: U(), label: U(), siteMeter: ue() })),
  sources: Vd,
  /** First and last stored miner sample; null before the first sample. */
  history: C({ firstTs: be.nullable(), lastTs: be.nullable() }),
  collector: C({
    kernelConnected: ue(),
    lastSampleAt: be.nullable(),
    lastError: U().nullable(),
    sampleIntervalSec: ae().positive()
  })
}), qt = C({
  site: w,
  byUnit: nt(U(), w),
  byModel: nt(U(), w)
}), Gt = C({
  hashrateThs: O,
  powerW: O,
  efficiencyWThs: w
}), Kd = C({
  online: O,
  error: O,
  offline: O,
  sleep: O,
  maintenance: O
}), as = C({
  /** Seconds the samples cover. */
  coveredSec: O,
  hashrateThs: qt,
  powerW: qt,
  energyMWh: O,
  efficiencyWThs: qt,
  nominal: Gt.extend({
    byUnit: nt(U(), Gt),
    byModel: nt(U(), Gt)
  }),
  /** Average miners in the fleet. */
  miners: O,
  status: Kd
}), Yd = as.extend({ ts: be }), qd = C({
  range: Ln,
  units: J(Fn),
  models: J(jn),
  /** Buckets with at least one sample, in time order. */
  buckets: J(Yd),
  /** The whole period; null when it has no samples. */
  summary: as.nullable()
}), pn = C({
  total: pe,
  offline: pe,
  error: pe,
  sleep: pe,
  low: pe,
  normal: pe,
  high: pe,
  maintenance: pe,
  powerW: O
}), Gd = jn.extend(pn.shape), cs = C({
  /** When the latest sample was taken; null before the first one. */
  ts: be.nullable(),
  intervalS: O.optional(),
  models: J(Gd),
  /** Every configured mining unit; the counts are absent for a unit with no miners sampled. */
  units: J(Fn.extend(pn.partial().shape)),
  site: pn.nullable()
}), Rr = C({ id: U(), label: U() }), Xd = C({
  range: Ln,
  /** The power meters other than the site meter. */
  meters: J(Rr),
  siteMeter: Rr.nullable(),
  buckets: J(
    C({
      ts: be,
      /** MWh per meter id; null when the meter has no sample in the bucket. */
      byMeter: nt(U(), O.nullable()),
      siteMeterMWh: O.nullable()
    })
  )
}), us = C({
  // Pool payouts.
  payouts: pe,
  /** Net of the pool fee: what the pool paid. */
  btc: O,
  /** The pool's fee on those payouts; null when the pool doesn't report it. */
  poolFeeBtc: O.nullable(),
  /** Net plus the pool fee. */
  grossBtc: O.nullable(),
  /** Block subsidy and transaction fees within `btc` (`split` on the report says where from). */
  subsidyBtc: O.nullable(),
  feesBtc: O.nullable(),
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
  coveredSec: O,
  hashrateThs: w,
  powerW: w,
  energyMWh: O,
  nominalHashrateThs: w,
  nominalPowerW: w,
  nominalEnergyMWh: O,
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
}), Qd = us.extend({ ts: be }), ef = C({
  range: Ln,
  /** The latest BTC price (report price); null without market data. */
  latestPriceUsd: w,
  /** Where the subsidy / fee split comes from; null when no payout has one. */
  split: Dn(Wd).nullable(),
  /** Buckets with miner samples or payouts, in time order. */
  buckets: J(Qd),
  /** The whole period; null when it has no samples and no payouts. */
  summary: us.nullable()
}), Mr = ae().nonnegative().max(1e12).nullable(), ls = C({
  month: ae().int().min(1).max(12),
  energyUsd: Mr,
  operationsUsd: Mr
}), tf = 2e3, nf = 2100, ds = ae().int().min(tf).max(nf), fs = C({
  year: ds,
  months: J(ls.extend({ updatedAt: be.nullable() })).length(12)
});
C({
  year: ds,
  months: J(ls).min(1).max(12)
});
const $e = {
  SITE: "/api/reporting/site",
  OPERATIONS: "/api/reporting/operations",
  MINERS: "/api/reporting/miners",
  CONSUMPTION: "/api/reporting/consumption",
  FINANCIALS: "/api/reporting/financials",
  COSTS: "/api/reporting/costs"
}, hs = async (e, t) => t.parse(await ro(e)), rf = async (e, t, n) => n.parse(
  await ro(e, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(t)
  })
), Bn = (e, t) => {
  const n = new URLSearchParams({
    start: String(t.start),
    end: String(t.end),
    granularity: t.granularity
  });
  return `${e}?${n.toString()}`;
}, rt = "reporting", of = 6e4, xn = "Check that the reporting app is running in the stack (`mdk run`), then reload.", sf = (e) => e;
function We(e, t, n = {}) {
  const r = $s({
    queryKey: [rt, e],
    queryFn: () => hs(e, t),
    refetchInterval: of,
    placeholderData: n.keepPrevious === !0 ? sf : void 0
  });
  return r.error instanceof Al ? {
    status: "error",
    message: `${e} answered with a body that does not match the contract.`
  } : Ts(r, e, { unreachableHint: xn });
}
const af = () => {
  const { apiUrl: e } = ve();
  return We(e($e.SITE), Jd);
}, ps = Xs(null), cf = ({ children: e }) => {
  const t = af();
  return t.status === "loading" ? /* @__PURE__ */ l("div", { className: "reporting-center", children: /* @__PURE__ */ l(ot, {}) }) : t.status === "error" ? /* @__PURE__ */ l("div", { className: "reporting-center", children: /* @__PURE__ */ l(Le, { title: "The reporting app is not reachable", error: t.message }) }) : /* @__PURE__ */ l(ps.Provider, { value: t.data, children: e });
};
function re() {
  const e = Qs(ps);
  if (e === null) throw new Error("useSiteInfo outside SiteGate");
  return e;
}
const oe = (e) => {
  const t = () => /* @__PURE__ */ l(cf, { children: /* @__PURE__ */ l(e, {}) });
  return t.displayName = `WithSite(${e.displayName ?? e.name})`, t;
};
function Q(e, t) {
  const n = e.status === "ready" ? e.data : void 0, r = Ae(
    () => n === void 0 ? void 0 : { value: t(n) },
    [n, t]
  );
  return e.status === "error" ? e : r === void 0 ? { status: "loading" } : { status: "ready", data: r.value };
}
const He = (e) => {
  const { apiUrl: t } = ve();
  return We(Bn(t($e.OPERATIONS), e), qd, {
    keepPrevious: !0
  });
}, Ue = {
  hashrate: {
    key: "hashrate",
    label: "Hashrate",
    cut: (e) => e.hashrateThs,
    nominal: (e) => e.hashrateThs,
    unitFor: (e) => Gn(Sn, e)
  },
  power: {
    key: "power",
    label: "Power Consumption",
    cut: (e) => e.powerW,
    nominal: (e) => e.powerW,
    unitFor: (e) => Gn(Tt, e)
  },
  efficiency: {
    key: "efficiency",
    label: "Efficiency",
    cut: (e) => e.efficiencyWThs,
    nominal: (e) => e.efficiencyWThs,
    unitFor: () => ({ unit: wn.EFFICIENCY_W_PER_TH_S, factor: 1 })
  }
}, ms = (e) => e.reduce((t, n) => typeof n == "number" && n > t ? n : t, 0), mn = (e, t) => e.map((n) => typeof n == "number" ? n / t : null), Ur = [
  S.blue,
  S.green,
  S.purple,
  S.orange,
  S.red,
  S.yellow,
  S.SKY_BLUE,
  S.VIOLET,
  S.LIGHT_BLUE,
  S.grey
], E = {
  actual: S.blue,
  nominal: S.red,
  // Miner statuses.
  online: S.green,
  error: S.red,
  offline: S.grey,
  sleep: S.blue,
  maintenance: S.orange,
  // Power modes.
  low: S.yellow,
  normal: S.green,
  high: S.SKY_BLUE,
  // Money series, the same on every Financials page.
  // As the design draws them: revenue green, cost purple (production cost
  // green beside the orange BTC price), the network's hashprice blue.
  revenue: S.green,
  cost: S.purple,
  productionCost: S.green,
  network: S.blue,
  // Hash Balance's site revenue chart, in its own design: the site's hash
  // revenue red and hashprice purple, where the cost chart beside it draws the
  // same figures as revenue green and network blue.
  hashRevenue: S.red,
  hashprice: S.purple,
  subsidy: S.VIOLET,
  fees: S.SKY_BLUE,
  feePercent: S.red,
  feeRate: S.purple,
  price: S.orange,
  energyCost: S.blue,
  operationsCost: S.purple
}, Wn = (e) => Ur[e % Ur.length] ?? S.blue, G = "all", Ft = (e) => e.buckets.map((t) => ii(t.ts, e.range.granularity, e.range.timezone));
function vt(e, t, n = {}) {
  const r = n.model ?? G, o = n.title ?? t.label, s = n.withNominal ?? !0, i = e.buckets.map(
    (f) => r === G ? t.cut(f).site : t.cut(f).byModel[r] ?? null
  ), a = e.buckets.map((f) => {
    if (r === G) return t.nominal(f.nominal);
    const p = f.nominal.byModel[r];
    return p === void 0 ? null : t.nominal(p);
  }), { unit: u, factor: c } = t.unitFor(ms(s ? [...i, ...a] : i)), d = [
    { label: o, values: mn(i, c), color: E.actual, type: "line" }
  ];
  return s && d.push({
    label: `Nominal ${o}`,
    values: mn(a, c),
    color: E.nominal,
    type: "line",
    dashed: !0
  }), { labels: Ft(e), unit: u, series: d, empty: e.buckets.length === 0 };
}
function uf(e, t, n, r = G) {
  const o = n === "model" ? e.models.map((c) => ({ id: c.id, label: c.displayName })) : e.units.filter((c) => r === G || c.id === r).map((c) => ({ id: c.id, label: c.name })), s = e.summary === null ? null : t.cut(e.summary), i = o.map((c) => s === null ? null : (n === "model" ? s.byModel[c.id] : s.byUnit[c.id]) ?? null), { unit: a, factor: u } = t.unitFor(ms(i));
  return {
    labels: o.map((c) => c.label),
    unit: a,
    series: [{ label: t.label, values: mn(i, u), color: Wn(0) }],
    empty: e.summary === null
  };
}
function lf(e, t, n = G) {
  const r = e.summary;
  if (r === null) return null;
  if (n === G) return { actual: t.cut(r).site, nominal: t.nominal(r.nominal) };
  const o = r.nominal.byModel[n];
  return {
    actual: t.cut(r).byModel[n] ?? null,
    nominal: o === void 0 ? null : t.nominal(o)
  };
}
const df = {
  online: "Online",
  error: "Error",
  offline: "Offline",
  sleep: "Sleep",
  maintenance: "Maintenance"
}, gs = (e, t = is) => ({
  labels: Ft(e),
  unit: "miners",
  series: t.map((n) => ({
    label: df[n],
    values: e.buckets.map((r) => r.status[n]),
    color: E[n],
    stack: "status"
  })),
  empty: e.buckets.length === 0
}), ff = (e) => ({
  hashrate: vt(e, Ue.hashrate, { title: "Hashrate" }),
  power: vt(e, Ue.power, { title: "Power Consumption", withNominal: !1 }),
  efficiency: vt(e, Ue.efficiency, { title: "Site Efficiency" }),
  status: gs(e),
  empty: e.buckets.length === 0
}), hf = (e) => Q(He(e), ff), pf = (e) => X(e, 0), mf = (e) => e.empty, gf = () => {
  const e = re().site.timezone, t = Pe(Ee(), e, { preset: "30d" }), n = hf(t.query), r = L(n, mf), o = n.status === "ready" ? n.data : void 0;
  return /* @__PURE__ */ l(ye, { title: "Dashboard", actions: /* @__PURE__ */ l(ze, { state: t, timezone: e }), children: /* @__PURE__ */ _("div", { className: "reporting-grid", children: [
    /* @__PURE__ */ l(T, { title: "Hashrate", state: r, expandable: !0, children: o === void 0 ? null : /* @__PURE__ */ l(Z, { height: 240, ...o.hashrate }) }),
    /* @__PURE__ */ l(T, { title: "Power Consumption", state: r, expandable: !0, children: o === void 0 ? null : /* @__PURE__ */ l(Z, { height: 240, ...o.power }) }),
    /* @__PURE__ */ l(T, { title: "Site Efficiency", state: r, expandable: !0, titleExtra: /* @__PURE__ */ l(so, {}), children: o === void 0 ? null : /* @__PURE__ */ l(Z, { height: 240, ...o.efficiency }) }),
    /* @__PURE__ */ l(T, { title: "Miners Status", state: r, expandable: !0, children: o === void 0 ? null : /* @__PURE__ */ l(Z, { stacked: !0, formatValue: pf, ...o.status }) })
  ] }) });
}, Zr = [
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
], Dr = [
  { key: "energyUsd", header: "Monthly Energy Cost", label: "energy" },
  { key: "operationsUsd", header: "Monthly Operations Cost", label: "operations" }
], gn = (e, t) => Number(new Intl.DateTimeFormat("en-US", { timeZone: t, year: "numeric" }).format(e)), vf = (e, t, n = Date.now()) => {
  const r = gn(n, t), o = r + 1, s = Math.min(e === null ? r : gn(e, t), r);
  return Array.from({ length: o - s + 1 }, (i, a) => o - a);
}, yf = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}), vn = (e) => e === null ? "" : yf.format(e), yn = (e) => e.months.map((t) => ({
  month: t.month,
  energyUsd: vn(t.energyUsd),
  operationsUsd: vn(t.operationsUsd)
})), le = (e) => {
  const t = e.trim().replace(/,/g, "");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? n : void 0;
}, _f = (e) => {
  const t = le(e);
  return t === void 0 ? e : vn(t);
}, vs = (e) => le(e.energyUsd) !== void 0 && le(e.operationsUsd) !== void 0;
function bf(e, t, n) {
  const r = [];
  for (const o of n) {
    const s = le(o.energyUsd), i = le(o.operationsUsd);
    if (s === void 0 || i === void 0) return null;
    const a = t.months.find((u) => u.month === o.month);
    a !== void 0 && a.energyUsd === s && a.operationsUsd === i || r.push({ month: o.month, energyUsd: s, operationsUsd: i });
  }
  return r.length === 0 ? null : { year: e, months: r };
}
const wf = (e, t) => yn(e).some(
  (n, r) => le(n.energyUsd) !== le(t[r]?.energyUsd ?? "") || le(n.operationsUsd) !== le(t[r]?.operationsUsd ?? "") || t[r] !== void 0 && !vs(t[r])
), ys = (e, t) => `${e}?year=${t}`, Sf = (e) => {
  const { apiUrl: t } = ve();
  return We(ys(t($e.COSTS), e), fs);
}, kf = () => {
  const e = Jr(), { apiUrl: t } = ve(), [n, r] = j(!1), [o, s] = j(null);
  return { save: x(
    async (a) => {
      const u = t($e.COSTS);
      r(!0), s(null);
      try {
        const c = await rf(u, a, fs);
        return e.setQueryData([rt, ys(u, a.year)], c), await e.invalidateQueries({ queryKey: [rt] }), !0;
      } catch (c) {
        return s(oo(c, u, { unreachableHint: xn })), !1;
      } finally {
        r(!1);
      }
    },
    [e, t]
  ), saving: n, error: o };
}, Pf = () => {
  const { site: e, history: t } = re(), n = Ae(
    () => vf(t.firstTs, e.timezone),
    [t.firstTs, e.timezone]
  ), [r, o] = j(() => gn(Date.now(), e.timezone)), s = Sf(r);
  return /* @__PURE__ */ _(ye, { title: "Cost Input", children: [
    /* @__PURE__ */ _("div", { className: "reporting-page__header", children: [
      /* @__PURE__ */ l(Kr, { variant: "body", children: "Monthly Costs" }),
      /* @__PURE__ */ _(qr, { value: String(r), onValueChange: (i) => o(Number(i)), children: [
        /* @__PURE__ */ l(Gr, { className: "reporting-period__granularity", children: /* @__PURE__ */ l(Xr, {}) }),
        /* @__PURE__ */ l(Qr, { children: n.map((i) => /* @__PURE__ */ l(tn, { value: String(i), children: i }, i)) })
      ] })
    ] }),
    s.status === "loading" ? /* @__PURE__ */ l(ot, {}) : null,
    s.status === "error" ? /* @__PURE__ */ l(Le, { title: "Could not load", error: s.message }) : null,
    s.status === "ready" ? (
      // A new draft for each year and each save.
      /* @__PURE__ */ l(Ef, { year: r, saved: s.data }, `${r}-${zf(s.data)}`)
    ) : null
  ] });
}, zf = (e) => e.months.reduce((t, n) => Math.max(t, n.updatedAt ?? 0), 0), Ef = ({ year: e, saved: t }) => {
  const [n, r] = j(() => yn(t)), { save: o, saving: s, error: i } = kf(), a = Ae(() => bf(e, t, n), [e, t, n]), u = n.every(vs), c = (f, p, g) => r((h) => h.map((y) => y.month === f ? { ...y, [p]: g } : y)), d = wf(t, n);
  return /* @__PURE__ */ _(te, { children: [
    /* @__PURE__ */ l("div", { className: "reporting-costs__scroll", children: /* @__PURE__ */ _("table", { className: "reporting-costs", children: [
      /* @__PURE__ */ l("thead", { children: /* @__PURE__ */ _("tr", { children: [
        /* @__PURE__ */ l("th", { children: "Month" }),
        Dr.map((f) => /* @__PURE__ */ l("th", { children: f.header }, f.key))
      ] }) }),
      /* @__PURE__ */ l("tbody", { children: n.map((f) => /* @__PURE__ */ _("tr", { children: [
        /* @__PURE__ */ l("td", { children: Zr[f.month - 1] }),
        Dr.map(({ key: p, label: g }) => /* @__PURE__ */ l("td", { children: /* @__PURE__ */ l(
          Ws,
          {
            inputMode: "decimal",
            prefix: "$",
            wrapperClassName: "reporting-costs__input",
            "aria-label": `${Zr[f.month - 1]} ${g} cost`,
            "aria-invalid": le(f[p]) === void 0,
            value: f[p],
            placeholder: "Cost in USD",
            onChange: (h) => c(f.month, p, h.target.value),
            onBlur: () => c(f.month, p, _f(f[p]))
          }
        ) }, p))
      ] }, f.month)) })
    ] }) }),
    /* @__PURE__ */ _("div", { className: "reporting-costs__footer", children: [
      u ? null : /* @__PURE__ */ l("span", { className: "reporting-snapshot__error", children: "Enter amounts as non-negative numbers, or leave them blank." }),
      i === null ? null : /* @__PURE__ */ l("span", { className: "reporting-snapshot__error", children: i }),
      d ? /* @__PURE__ */ l(Ze, { variant: "secondary", disabled: s, onClick: () => r(yn(t)), children: "Discard changes" }) : null,
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
}, Hn = () => {
  const e = Gs();
  return /* @__PURE__ */ l(Ze, { variant: "secondary", onClick: () => {
    e(`../${H.COST_INPUT}`);
  }, children: "Set Monthly Cost" });
}, Cf = "var(--mdk-color-primary)", Of = (e) => {
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
        ...o.accent === !0 ? { color: Cf } : {},
        detail: Of(o)
      },
      i
    ) : /* @__PURE__ */ l(
      qe,
      {
        ...s,
        className: "reporting-tile--not-wired",
        detail: /* @__PURE__ */ l(It, { source: o.missing, size: "inline" })
      },
      i
    );
  }) });
}, _s = ["USD", "BTC"], $f = (e) => _s.some((t) => t === e), Vn = (e) => e === "USD" ? 2 : 8, Jn = (e, t) => t === null ? e : e.map((n) => n.needs === "costs" ? { ...n, missing: t } : n), V = (e, t, n) => {
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
}, Ot = (e, t, n = 1) => e === null || t === null || t === 0 ? null : e / t * n, Fr = (e) => e === null ? null : e / 1e3;
function Tf(e) {
  const t = e.summary, n = (r, o, s, i = !1) => ({
    name: r,
    needs: "costs",
    accent: i,
    value: de(o, A.USD_PER_MWH),
    subtitle: `${Je(s)} in the period`
  });
  return {
    tiles: [
      n("All-in Cost", t?.allInCostUsdPerMWh ?? null, t?.allInCostUsd ?? null, !0),
      n("Energy Cost", t?.energyCostUsdPerMWh ?? null, t?.energyCostUsd ?? null),
      n("Operations Cost", t?.operationsCostUsdPerMWh ?? null, t?.operationsCostUsd ?? null)
    ],
    productionCost: ee(e, A.KUSD_PER_BTC, [
      { label: "BTC Price", color: E.price, read: (r) => Fr(r.priceUsd) },
      {
        label: "Production Cost",
        color: E.productionCost,
        read: (r) => Fr(r.productionCostUsdPerBtc)
      }
    ]),
    allInCost: ee(e, A.USD_PER_MWH, [
      { label: "All-in Cost", color: E.cost, read: (r) => r.allInCostUsdPerMWh }
    ]),
    split: t === null || t.energyCostUsdPerMWh === null || t.operationsCostUsdPerMWh === null ? null : { energyCostsUSD: t.energyCostUsdPerMWh, operationalCostsUSD: t.operationsCostUsdPerMWh }
  };
}
const Xt = 1e6, Nf = (e) => e === "USD" ? A.USD_PER_MWH : A.BTC_PER_MWH, Qt = (e, t) => t === "USD" ? { revenue: e.revenueUsdPerMWh, cost: e.allInCostUsdPerMWh } : {
  revenue: e.revenueSatsPerMWh === null ? null : e.revenueSatsPerMWh / At,
  cost: Ot(e.allInCostUsdPerMWh, e.priceUsd)
};
function Af(e, t, n, r = null) {
  const o = Nf(t), s = e.summary, i = (c, d, f = !1) => ({
    name: c,
    value: de(d ?? null, A.USD_PER_MWH),
    ...f ? { needs: "costs" } : {}
  }), a = (c, d) => ({
    name: c,
    value: de(d == null ? null : d / Xt, "MW", 2)
  }), u = [
    {
      label: "Revenue",
      color: E.revenue,
      read: (c) => Qt(c, t).revenue
    }
  ];
  return n && u.unshift({
    label: "All-In Cost",
    color: E.cost,
    read: (c) => Qt(c, t).cost
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
        color: E.revenue,
        read: (c) => Qt(c, t).revenue
      }
    ]),
    revenueVsCost: ee(e, o, u),
    power: ee(e, "MW", [
      {
        label: "Power Consumption",
        color: E.actual,
        type: "line",
        read: (c) => Ot(c.powerW, Xt)
      },
      {
        label: "Nominal Power Consumption",
        color: E.nominal,
        type: "line",
        dashed: !0,
        read: (c) => Ot(c.nominalPowerW, Xt)
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
const If = 1e18, jr = (e) => e === null ? null : e / At, Lr = (e, t) => t === "USD" ? {
  revenue: e.hashRevenueUsdPerPhsDay,
  cost: e.hashCostUsdPerPhsDay,
  network: e.networkHashpriceUsdPerPhsDay
} : {
  revenue: jr(e.hashRevenueSatsPerPhsDay),
  cost: jr(e.hashCostSatsPerPhsDay),
  network: e.networkHashpriceBtcPerPhsDay
}, Rf = (e) => e === "USD" ? A.USD_PER_PHS_DAY : A.BTC_PER_PHS_DAY;
function Mf(e, t, n) {
  const r = Rf(t), o = Vn(t), s = e.summary === null ? null : Lr(e.summary, t), i = (c, d) => ({
    name: c,
    value: de(d ?? null, r, o)
  }), a = (c) => (d) => Lr(d, t)[c], u = [
    { label: "Hash Revenue", color: E.revenue, read: a("revenue") },
    { label: "Network Hashprice", color: E.network, read: a("network") }
  ];
  return n && u.unshift({ label: "Hash Cost", color: E.cost, read: a("cost") }), {
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
      { label: "Site Hash Revenue", color: E.hashRevenue, read: a("revenue") }
    ]),
    networkHashrate: ee(e, "EH/s", [
      {
        label: "Network Hashrate",
        color: E.price,
        type: "line",
        read: (c) => c.networkHashrateHs === null ? null : c.networkHashrateHs / If
      }
    ]),
    networkHashprice: ee(e, r, [
      { label: "Network Hashprice", color: E.hashprice, read: a("network") }
    ]),
    costRevenueNetwork: ee(e, r, u)
  };
}
const bs = [
  { value: "BTC", label: nn.BTC },
  { value: "sats", label: nn.sats },
  { value: "receipt", label: "USD at Receipt" },
  { value: "report", label: "USD at Report" }
], Uf = (e) => bs.some((t) => t.value === e), Zf = (e) => Uf(e) && !Pn(e), ht = (e, t, n, r, o, s, i) => ({
  name: e,
  caption: t,
  ...i === null ? {} : { missing: i },
  value: de(n, o, s),
  tag: "Net",
  subtitle: r === null ? "Gross: pool fee not reported" : `Gross ${de(r, o, s)}`
});
function Df(e, t, n) {
  const r = e.summary, o = V(["pool"], t), s = V(["pool", "market"], t), i = r?.btc ?? null, a = i === null || e.latestPriceUsd === null ? null : i * e.latestPriceUsd, u = (p, g) => p == null ? de(null, "") : g(p), c = [
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
      value: Je(r?.revenueUsd ?? null),
      subtitle: `Effective ${Je(Ot(r?.revenueUsd ?? null, i))}/BTC`,
      ...s === null ? {} : { missing: s }
    },
    {
      name: "Revenue at Report Price",
      value: Je(a),
      subtitle: `Current ${Je(e.latestPriceUsd)}/BTC`,
      ...s === null ? {} : { missing: s }
    }
  ], d = [
    ht(
      "Avg Mining Revenue per MWh",
      "At Prod. Date Price",
      r?.revenueUsdPerMWh ?? null,
      r?.grossRevenueUsdPerMWh ?? null,
      A.USD_PER_MWH,
      2,
      s
    ),
    ht(
      "Avg Hash Revenue",
      "At Prod. Date Price",
      r?.hashRevenueUsdPerPhsDay ?? null,
      r?.grossHashRevenueUsdPerPhsDay ?? null,
      A.USD_PER_PHS_DAY,
      2,
      s
    ),
    ht(
      "Avg Mining Revenue per MWh",
      "In Bitcoin Terms",
      r?.revenueSatsPerMWh ?? null,
      r?.grossRevenueSatsPerMWh ?? null,
      A.SATS_PER_MWH,
      0,
      o
    ),
    ht(
      "Avg Hash Revenue",
      "In Bitcoin Terms",
      r?.hashRevenueSatsPerPhsDay ?? null,
      r?.grossHashRevenueSatsPerPhsDay ?? null,
      A.SATS_PER_PHS_DAY,
      0,
      o
    ),
    {
      name: "Avg Power Consumption",
      value: u(r?.powerW, (p) => _t(yt(p, Tt)))
    },
    {
      name: "Avg Hashrate",
      value: u(r?.hashrateThs, (p) => _t(yt(p, Sn)))
    },
    { name: "Mining Uptime", value: de(r?.uptimePercent ?? null, A.PERCENT, 1) },
    {
      name: "Hashrate Capacity Factor",
      value: de(r?.capacityFactorPercent ?? null, A.PERCENT, 1)
    }
  ], f = r === null || r.subsidyBtc === null || r.feesBtc === null ? null : {
    unit: n,
    slices: [
      { label: "Subsidy", value: r.subsidyBtc, color: E.subsidy },
      { label: "Fees", value: r.feesBtc, color: E.fees }
    ]
  };
  return { totals: c, metrics: d, split: f, empty: r === null || r.payouts === 0 };
}
const Ff = {
  BTC: { unit: A.BTC, read: (e) => e.btc },
  sats: { unit: A.SATS, read: (e) => e.btc * At },
  receipt: { unit: A.USD, read: (e) => e.revenueUsd },
  report: {
    unit: A.USD,
    read: (e, t) => t === null ? null : e.btc * t
  }
};
function jf(e, t, n) {
  const { unit: r, read: o } = Ff[t];
  return ee(e, r, [
    { label: n, color: E.revenue, read: (s) => o(s, e.latestPriceUsd) }
  ]);
}
const Lf = (e, t = "BTC") => {
  const n = (r) => r === null || t === "BTC" ? r : r * At;
  return ee(
    e,
    t === "BTC" ? A.BTC : A.SATS,
    [
      {
        label: "Subsidy",
        color: E.subsidy,
        stack: "split",
        read: (r) => n(r.subsidyBtc)
      },
      { label: "Fees", color: E.fees, stack: "split", read: (r) => n(r.feesBtc) },
      {
        label: "Fee %",
        color: E.feePercent,
        type: "line",
        axis: "right",
        read: (r) => r.feePercent
      }
    ],
    A.PERCENT
  );
}, Bf = (e) => ee(e, A.SATS_PER_VB, [
  { label: "Average Fee Rate", color: E.feeRate, read: (t) => t.networkFeeRateSatsVb }
]), st = (e) => {
  const { apiUrl: t } = ve();
  return We(Bn(t($e.FINANCIALS), e), ef, {
    keepPrevious: !0
  });
}, xf = (e, t, n) => {
  const { site: r, sources: o } = re();
  return Q(
    st(e),
    x(
      (s) => ({
        ...Df(s, o, t),
        chart: jf(s, n, r.name)
      }),
      [o, t, n, r.name]
    )
  );
}, Wf = (e, t) => Q(
  st(e),
  x(
    (n) => ({
      chart: Lf(n, t),
      feeRate: Bf(n),
      report: n
    }),
    [t]
  )
), Hf = (e) => Q(
  st(e),
  x((t) => ({ ...Tf(t), report: t }), [])
), Vf = (e, t, n) => Q(
  st(e),
  x(
    (r) => ({ ...Mf(r, t, n), report: r }),
    [t, n]
  )
), Jf = (e, t, n) => {
  const { sources: r } = re();
  return Q(
    st(e),
    x(
      (o) => ({
        ...Af(o, t, n, V(["pool"], r)),
        report: o
      }),
      [t, n, r]
    )
  );
}, Kf = (e) => e.productionCost.empty, Yf = (e) => e.allInCost.empty, qf = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), r = Hf(n.query), o = r.status === "ready" ? r.data : void 0, s = V(["costs"], t, o?.report);
  return /* @__PURE__ */ _(
    ye,
    {
      title: "Cost Summary",
      headerAction: /* @__PURE__ */ l(Hn, {}),
      actions: /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
      children: [
        /* @__PURE__ */ l(T, { title: "Production Cost / Price", state: L(r, Kf, s), children: o === void 0 ? null : /* @__PURE__ */ l(Z, { showDataLabels: !0, formatValue: Gf, ...o.productionCost }) }),
        /* @__PURE__ */ _("div", { className: "reporting-costs-row", children: [
          s === null ? /* @__PURE__ */ l("div", { className: "reporting-card", children: /* @__PURE__ */ l(
            Hs,
            {
              data: o?.split ?? void 0,
              isLoading: r.status === "loading",
              title: "Operations / Energy Cost"
            }
          ) }) : (
            // The devkit chart has no not-wired state: the card keeps its title over the message.
            /* @__PURE__ */ l(
              T,
              {
                title: "Operations / Energy Cost",
                state: { kind: "not-wired", source: s },
                notWiredSize: "short"
              }
            )
          ),
          o === void 0 ? /* @__PURE__ */ l("div", {}) : /* @__PURE__ */ l(Re, { columns: 1, tiles: Jn(o.tiles, s) }),
          /* @__PURE__ */ l(T, { title: "Avg All-in Cost", state: L(r, Yf, s), children: o === void 0 ? null : /* @__PURE__ */ l(Z, { height: 220, ...o.allInCost }) })
        ] })
      ]
    }
  );
}, Gf = (e) => X(e, 1), ws = ({
  value: e,
  onChange: t
}) => /* @__PURE__ */ l(
  Nt,
  {
    currencies: [..._s],
    value: e,
    onChange: (n) => {
      $f(n) && t(n);
    }
  }
), Ss = ({
  value: e,
  onChange: t
}) => /* @__PURE__ */ l(ao, { label: "Bitcoin Unit", children: /* @__PURE__ */ l(
  Nt,
  {
    currencies: co.map((n) => ({ value: n, label: nn[n] })),
    value: e,
    onChange: (n) => {
      Pn(n) && t(n);
    }
  }
) }), ks = ({ tabs: e, value: t, onChange: n }) => /* @__PURE__ */ l(
  Nt,
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
), Xf = [
  { value: "revenue", label: "Energy Revenue" },
  { value: "cost", label: "Energy Cost" }
], en = (e) => (t) => e(t).empty, Qf = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), [r, o] = j("revenue"), [s, i] = j("USD"), a = V(["costs"], t), u = Jf(n.query, s, a === null), c = u.status === "ready" ? u.data : void 0, d = V(["pool", "market"], t), f = V(["costs"], t, c?.report), p = Vn(s), g = (v) => X(v, p), h = /* @__PURE__ */ l(ws, { value: s, onChange: i }), y = /* @__PURE__ */ l(
    T,
    {
      title: "Power",
      state: L(
        u,
        en((v) => v.power)
      ),
      children: c === void 0 ? null : /* @__PURE__ */ l(Z, { ...c.power })
    }
  );
  return /* @__PURE__ */ _(
    ye,
    {
      title: "Energy Balance",
      headerAction: /* @__PURE__ */ l(Hn, {}),
      actions: /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
      children: [
        /* @__PURE__ */ l(ks, { tabs: Xf, value: r, onChange: o }),
        r === "revenue" ? /* @__PURE__ */ _(te, { children: [
          c === void 0 ? null : /* @__PURE__ */ l(Re, { tiles: c.revenueTiles }),
          /* @__PURE__ */ l(
            T,
            {
              title: "Site Energy Revenue",
              state: L(
                u,
                en((v) => v.revenue),
                d
              ),
              headerAction: h,
              children: c === void 0 ? null : /* @__PURE__ */ l(Z, { showDataLabels: !0, formatValue: g, ...c.revenue })
            }
          ),
          y
        ] }) : /* @__PURE__ */ _(te, { children: [
          c === void 0 ? null : /* @__PURE__ */ l(Re, { columns: 3, tiles: Jn(c.costTiles, f) }),
          /* @__PURE__ */ l(
            T,
            {
              title: "Site Revenue vs Cost",
              state: L(
                u,
                en((v) => v.revenueVsCost),
                d
              ),
              headerAction: h,
              children: c === void 0 ? null : /* @__PURE__ */ l(Z, { showDataLabels: !0, formatValue: g, ...c.revenueVsCost })
            }
          ),
          f === null ? null : /* @__PURE__ */ l(It, { source: f, size: "inline" }),
          y
        ] })
      ]
    }
  );
}, eh = [
  { value: "revenue", label: "Hash Revenue" },
  { value: "cost", label: "Hash Cost" }
], pt = (e) => (t) => e(t).empty, th = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), [r, o] = j("revenue"), [s, i] = j("USD"), a = V(["costs"], t), u = Vf(n.query, s, a === null), c = u.status === "ready" ? u.data : void 0, d = V(["pool", "market"], t), f = V(["market"], t), p = V(["costs"], t, c?.report), g = Vn(s), h = (v) => X(v, g), y = /* @__PURE__ */ l(ws, { value: s, onChange: i });
  return /* @__PURE__ */ _(
    ye,
    {
      title: "Hash Balance",
      headerAction: /* @__PURE__ */ l(Hn, {}),
      actions: /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
      children: [
        /* @__PURE__ */ l(ks, { tabs: eh, value: r, onChange: o }),
        r === "revenue" ? /* @__PURE__ */ _(te, { children: [
          /* @__PURE__ */ l(
            T,
            {
              title: "Site Hash Revenue",
              state: L(
                u,
                pt((v) => v.siteRevenue),
                d
              ),
              headerAction: y,
              children: c === void 0 ? null : /* @__PURE__ */ l(Z, { showDataLabels: !0, formatValue: h, ...c.siteRevenue })
            }
          ),
          /* @__PURE__ */ _("div", { className: "reporting-hash-grid", children: [
            c === void 0 ? /* @__PURE__ */ l("div", {}) : /* @__PURE__ */ l(Re, { columns: 2, tiles: c.revenueTiles, className: "reporting-hash-grid__tiles" }),
            /* @__PURE__ */ l(
              T,
              {
                title: "Network Hashrate",
                className: "reporting-hash-grid__hashrate",
                state: L(
                  u,
                  pt((v) => v.networkHashrate),
                  f
                ),
                children: c === void 0 ? null : /* @__PURE__ */ l(Z, { height: 200, ...c.networkHashrate })
              }
            ),
            /* @__PURE__ */ l(
              T,
              {
                title: "Bitcoin Network Hashprice",
                className: "reporting-hash-grid__hashprice",
                state: L(
                  u,
                  pt((v) => v.networkHashprice),
                  f
                ),
                children: c === void 0 ? null : /* @__PURE__ */ l(Z, { height: 340, formatValue: h, ...c.networkHashprice })
              }
            )
          ] })
        ] }) : /* @__PURE__ */ _(te, { children: [
          c === void 0 ? null : /* @__PURE__ */ l(Re, { tiles: Jn(c.costTiles, p) }),
          /* @__PURE__ */ l(
            T,
            {
              title: "Cost / Revenue / Network Hashprice",
              state: L(
                u,
                pt((v) => v.costRevenueNetwork),
                d
              ),
              headerAction: y,
              children: c === void 0 ? null : /* @__PURE__ */ l(Z, { formatValue: h, ...c.costRevenueNetwork })
            }
          ),
          p === null ? null : /* @__PURE__ */ l(It, { source: p, size: "inline" })
        ] })
      ]
    }
  );
}, nh = (e) => e.chart.empty, rh = (e) => e.split === null, oh = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), [r, o] = j("BTC"), [s, i] = j(null), a = s ?? r, u = (h) => {
    o(h), i(null);
  }, c = (h) => {
    Pn(h) ? u(h) : Zf(h) && i(h);
  }, d = xf(n.query, r, a), f = d.status === "ready" ? d.data : void 0, p = V(["pool"], t), g = p ?? (f !== void 0 && !f.empty && f.split === null ? "split" : null);
  return /* @__PURE__ */ _(
    ye,
    {
      title: "Revenue Summary",
      actions: /* @__PURE__ */ _(te, { children: [
        /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
        /* @__PURE__ */ l(Ss, { value: r, onChange: u })
      ] }),
      children: [
        f === void 0 ? null : /* @__PURE__ */ l(Re, { columns: 3, tiles: f.totals }),
        /* @__PURE__ */ l(
          T,
          {
            title: "Mining Revenue",
            state: L(d, nh, p),
            headerAction: /* @__PURE__ */ l(
              Nt,
              {
                currencies: bs.map((h) => ({ value: h.value, label: h.label })),
                value: a,
                onChange: c
              }
            ),
            children: f === void 0 ? null : /* @__PURE__ */ l(Z, { showDataLabels: !0, formatValue: sh(a), ...f.chart })
          }
        ),
        /* @__PURE__ */ _("div", { className: "reporting-split", children: [
          /* @__PURE__ */ l(T, { title: "Subsidy / Fees", state: L(d, rh, g), children: f?.split == null ? null : (
            // A 1px gap, not the devkit's 4px: the border is drawn over each
            // slice, and covered a small one (fees at 0.5% of revenue) whole.
            /* @__PURE__ */ l(
              eo,
              {
                data: f.split.slices,
                borderWidth: 1,
                legendPosition: "bottom",
                formatValue: (h) => bt(h, f.split?.unit ?? r)
              }
            )
          ) }),
          f === void 0 ? null : /* @__PURE__ */ l(Re, { columns: 2, tiles: f.metrics })
        ] })
      ]
    }
  );
}, sh = (e) => (t) => X(t, e === Qe.BTC ? 2 : 0), ih = (e) => X(e, 2), ah = (e) => e.chart.empty, ch = (e) => e.feeRate.empty, uh = () => {
  const { site: e, sources: t } = re(), n = Pe(Ee(), e.timezone, { preset: "12m" }), [r, o] = j("BTC"), s = Wf(n.query, r), i = s.status === "ready" ? s.data : void 0, a = V(["pool", "poolSplit"], t, i?.report);
  return /* @__PURE__ */ _(
    ye,
    {
      title: "Subsidy / Fee",
      actions: /* @__PURE__ */ _(te, { children: [
        /* @__PURE__ */ l(ze, { state: n, timezone: e.timezone }),
        /* @__PURE__ */ l(Ss, { value: r, onChange: o })
      ] }),
      children: [
        /* @__PURE__ */ l(T, { title: "Subsidy / Fees", state: L(s, ah, a), children: i === void 0 ? null : /* @__PURE__ */ l(Z, { stacked: !0, ...i.chart }) }),
        /* @__PURE__ */ l(
          T,
          {
            title: "Average Fees in sats/vB",
            state: L(s, ch, V(["market"], t)),
            children: i === void 0 ? null : /* @__PURE__ */ l(Z, { showDataLabels: !0, formatValue: ih, ...i.feeRate })
          }
        )
      ]
    }
  );
}, lh = (e, t, n, r = G) => Q(
  He(e),
  x(
    (o) => ({ chart: uf(o, t, n, r) }),
    [t, n, r]
  )
), dh = (e, t, n = G) => Q(
  He(e),
  x(
    (r) => {
      const o = r.models.find((i) => i.id === n)?.displayName, s = o === void 0 ? `Site ${t.label}` : `${o} ${t.label}`;
      return {
        chart: vt(r, t, { model: n, title: s }),
        summary: lf(r, t, n)
      };
    },
    [t, n]
  )
), fh = (e) => Q(
  He(e),
  x((t) => ({ models: t.models, units: t.units }), [])
), Br = ({
  label: e,
  value: t,
  onChange: n,
  options: r
}) => /* @__PURE__ */ l(ao, { label: e, children: /* @__PURE__ */ _(qr, { value: t, onValueChange: n, children: [
  /* @__PURE__ */ l(
    Gr,
    {
      className: "reporting-filter",
      title: r.find((o) => o.value === t)?.label ?? "All",
      children: /* @__PURE__ */ l(Xr, {})
    }
  ),
  /* @__PURE__ */ _(Qr, { className: "reporting-filter__menu", children: [
    /* @__PURE__ */ l(tn, { value: G, children: "All" }),
    r.map((o) => /* @__PURE__ */ l(tn, { value: o.value, children: o.label }, o.value))
  ] })
] }) }), Ps = (e) => e.chart.empty, Kn = ({
  title: e,
  metric: t,
  titleExtra: n,
  siteViewExtra: r,
  extraTabs: o = []
}) => {
  const s = re().site.timezone, i = Ee(), a = Pe(i, s, { preset: "30d" }), [u, c] = i, d = u.get("view") ?? "site", f = x(
    (F) => c(
      (M) => {
        const z = new URLSearchParams(M);
        return z.set("view", F), z;
      },
      { replace: !0 }
    ),
    [c]
  ), [p, g] = j(G), [h, y] = j(G), v = fh(a.query), k = v.status === "ready" ? v.data.models : [], W = v.status === "ready" ? v.data.units : [], he = o.find((F) => F.id === d);
  return /* @__PURE__ */ l(ye, { title: e, children: /* @__PURE__ */ _(Vs, { value: d, onValueChange: f, children: [
    /* @__PURE__ */ _(Js, { children: [
      /* @__PURE__ */ l(it, { value: "site", children: "Site View" }),
      /* @__PURE__ */ l(it, { value: "type", children: "Miner Type View" }),
      /* @__PURE__ */ l(it, { value: "unit", children: "Mining Unit View" }),
      o.map((F) => /* @__PURE__ */ l(it, { value: F.id, children: F.label }, F.id))
    ] }),
    /* @__PURE__ */ _(io, { children: [
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
          value: p,
          onChange: g,
          options: k.map((F) => ({ value: F.id, label: F.displayName }))
        }
      ) : null,
      d === "unit" ? /* @__PURE__ */ l(
        Br,
        {
          label: "Mining Unit",
          value: h,
          onChange: y,
          options: W.map((F) => ({ value: F.id, label: F.name }))
        }
      ) : null
    ] }),
    /* @__PURE__ */ _(at, { value: "site", children: [
      /* @__PURE__ */ l(ph, { metric: t, query: a.query, model: p, titleExtra: n }),
      r?.(a)
    ] }),
    /* @__PURE__ */ l(at, { value: "type", children: /* @__PURE__ */ l(xr, { metric: t, query: a.query, by: "model", only: G }) }),
    /* @__PURE__ */ l(at, { value: "unit", children: /* @__PURE__ */ l(xr, { metric: t, query: a.query, by: "unit", only: h }) }),
    he === void 0 ? null : /* @__PURE__ */ l(at, { value: he.id, children: he.render(a) })
  ] }) });
}, hh = ({ metric: e, summary: t }) => {
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
}, ph = ({
  metric: e,
  query: t,
  model: n,
  titleExtra: r
}) => {
  const o = dh(t, e, n);
  return /* @__PURE__ */ l(
    T,
    {
      title: `Site ${e.label}`,
      titleExtra: r,
      state: L(o, Ps),
      children: o.status === "ready" ? /* @__PURE__ */ _(te, { children: [
        /* @__PURE__ */ l(hh, { metric: e, summary: o.data.summary }),
        /* @__PURE__ */ l(Z, { ...o.data.chart })
      ] }) : null
    }
  );
}, mh = (e) => X(e, 2), xr = ({
  metric: e,
  query: t,
  by: n,
  only: r
}) => {
  const o = lh(t, e, n, r), s = `${e.label} by ${n === "model" ? "Miner Type" : "Mining Unit"}`;
  return /* @__PURE__ */ l(T, { title: s, state: L(o, Ps), children: o.status === "ready" ? /* @__PURE__ */ _(te, { children: [
    /* @__PURE__ */ l("p", { className: "reporting-note", children: "Average over the selected period." }),
    /* @__PURE__ */ l(Z, { showDataLabels: !0, formatValue: mh, ...o.data.chart })
  ] }) : null });
}, gh = () => /* @__PURE__ */ l(Kn, { title: "Efficiency", metric: Ue.efficiency, titleExtra: /* @__PURE__ */ l(so, {}) });
function vh(e) {
  const t = Ft(e), n = e.meters.map((r, o) => ({
    label: r.label,
    values: e.buckets.map((s) => s.byMeter[r.id] ?? null),
    color: Wn(o),
    stack: "meters"
  }));
  return e.siteMeter !== null && n.push({
    label: e.siteMeter.label,
    values: e.buckets.map((r) => r.siteMeterMWh),
    color: E.nominal,
    stack: "site"
  }), {
    report: e,
    rows: e.buckets.map((r, o) => ({
      ts: r.ts,
      period: t[o] ?? "",
      site: r.siteMeterMWh,
      byMeter: r.byMeter
    })),
    chart: { labels: t, unit: si, series: n, empty: e.buckets.length === 0 }
  };
}
function yh(e) {
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
const _h = (e) => {
  const { apiUrl: t } = ve(), n = We(
    Bn(t($e.CONSUMPTION), e),
    Xd,
    {
      keepPrevious: !0
    }
  );
  return Q(n, vh);
}, bh = (e, t) => {
  const { granularity: n, start: r } = t;
  return x(() => {
    if (e === void 0) return;
    const o = new Date(r).toISOString().slice(0, 10), { rows: s, columns: i } = yh(e);
    ti(s, `consumption-${n}-${o}.csv`, i);
  }, [e, n, r]);
}, Wr = (e, t, n) => ({
  id: e,
  header: t,
  accessorFn: (r) => n(r) ?? null,
  cell: ({ row: r }) => X(n(r.original), 3)
}), wh = (e) => {
  if (e === void 0) return [];
  const { siteMeter: t, meters: n } = e.report, r = [
    { accessorKey: "period", header: "Period" }
  ];
  t !== null && r.push(Wr("site", `${t.label} total`, (o) => o.site));
  for (const o of n) r.push(Wr(o.id, o.label, (s) => s.byMeter[o.id]));
  return r;
}, Sh = (e) => e.chart.empty, kh = ({ period: e }) => {
  const t = _h(e.query), n = t.status === "ready" ? t.data : void 0, [r, o] = j({ pageIndex: 0, pageSize: 20 }), s = Ae(() => wh(n), [n]), i = bh(n, e.query), a = L(t, Sh);
  return /* @__PURE__ */ _(te, { children: [
    /* @__PURE__ */ l("p", { className: "reporting-note", children: "Energy per power meter, in MWh." }),
    /* @__PURE__ */ l(
      T,
      {
        title: "Energy per Meter",
        state: a,
        headerAction: /* @__PURE__ */ l(
          Ks,
          {
            formats: ["csv"],
            label: "Export CSV",
            disabled: n === void 0 || n.chart.empty,
            onExport: i
          }
        ),
        children: n === void 0 ? null : /* @__PURE__ */ l(Z, { ...n.chart })
      }
    ),
    /* @__PURE__ */ l(T, { title: "Consumption by Period", state: a, children: n === void 0 ? null : /* @__PURE__ */ l(
      to,
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
}, Ph = ["all", "offline", "maintenance"], _n = {
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
}, zh = (e, t) => {
  const n = e.models.map((r, o) => ({
    label: r.displayName,
    value: r[t],
    color: Wn(o)
  }));
  return {
    slices: n,
    total: n.reduce((r, o) => r + o.value, 0),
    empty: e.models.length === 0,
    ts: e.ts
  };
}, zs = () => {
  const { apiUrl: e } = ve();
  return We(e($e.MINERS), cs);
}, Eh = (e) => Q(
  zs(),
  x((t) => zh(t, _n[e].count), [e])
), Ch = (e, t) => Q(
  He(e),
  x((n) => gs(n, t), [t])
), Oh = () => {
  const e = Jr(), { apiUrl: t } = ve(), [n, r] = j(!1), [o, s] = j(null), i = x(async () => {
    const u = t($e.MINERS), c = `${u}?refresh=true`;
    r(!0), s(null);
    try {
      e.setQueryData([rt, u], await hs(c, cs)), await e.invalidateQueries({
        queryKey: [rt],
        predicate: (d) => d.queryKey[1] !== u
      });
    } catch (d) {
      s(oo(d, c, { unreachableHint: xn }));
    } finally {
      r(!1);
    }
  }, [e, t]);
  return { refresh: x(() => {
    i();
  }, [i]), refreshing: n, error: o };
}, Es = ({ ts: e, timezone: t, subject: n }) => {
  const { refresh: r, refreshing: o, error: s } = Oh(), i = typeof e == "number" ? `${n} as of ${ai(e, t)}. Refresh to load the latest snapshot.` : "No snapshot yet. Refresh to take one.";
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
}, $h = ({ value: e, color: t }) => /* @__PURE__ */ l("span", { className: "reporting-chip", style: { "--chip": t }, children: X(e, 0) }), Te = (e, t) => ({
  id: e,
  header: t,
  size: 104,
  accessorFn: (n) => n[e],
  cell: ({ row: n }) => /* @__PURE__ */ l($h, { value: n.original[e], color: E[e] })
}), Th = [
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
        _t(yt(e.original.powerW, Tt))
      ] })
    ] })
  },
  Te("offline", "Offline"),
  Te("error", "Error"),
  Te("sleep", "Sleep"),
  Te("low", "Low"),
  Te("normal", "Normal"),
  Te("high", "High"),
  Te("maintenance", "Maintenance")
], Nh = ({ timezone: e }) => {
  const t = zs();
  return /* @__PURE__ */ _("section", { className: "reporting-section", children: [
    /* @__PURE__ */ l("h2", { className: "reporting-section__title", children: "Power Mode by Miner Type" }),
    /* @__PURE__ */ l(
      Es,
      {
        ts: t.status === "ready" ? t.data.ts : void 0,
        timezone: e,
        subject: "Miner power modes"
      }
    ),
    t.status === "loading" ? /* @__PURE__ */ l(ot, {}) : null,
    t.status === "error" ? /* @__PURE__ */ l(Le, { title: "Could not load", error: t.message }) : null,
    t.status === "ready" && t.data.models.length === 0 ? /* @__PURE__ */ l(et, { message: "No miners in the latest snapshot." }) : null,
    t.status === "ready" && t.data.models.length > 0 ? /* @__PURE__ */ l(
      to,
      {
        data: t.data.models,
        columns: Th,
        getRowId: (n) => n.id,
        fullWidth: !0
      }
    ) : null
  ] });
}, Ah = {
  id: "consumption",
  label: "Consumption",
  render: (e) => /* @__PURE__ */ l(kh, { period: e })
}, Ih = () => {
  const e = re(), t = e.site.timezone, n = e.sources.meters ? [Ah] : [];
  return /* @__PURE__ */ l(
    Kn,
    {
      title: "Energy",
      metric: Ue.power,
      siteViewExtra: () => /* @__PURE__ */ l(Nh, { timezone: t }),
      extraTabs: n
    }
  );
}, Rh = () => /* @__PURE__ */ l(Kn, { title: "Hashrate", metric: Ue.hashrate }), bn = (e) => X(e, 0), Mh = (e) => e.empty, Uh = () => {
  const e = re().site.timezone, t = Pe(Ee(), e, { preset: "30d" }), [n, r] = j("all"), o = _n[n], s = Eh(n), i = o.statuses ?? is, a = Ch(t.query, i), u = s.status === "ready" ? s.data.ts : void 0;
  return /* @__PURE__ */ _(ye, { title: "Miners", actions: /* @__PURE__ */ l(ze, { state: t, timezone: e }), children: [
    /* @__PURE__ */ l(Es, { ts: u, timezone: e, subject: "Miner counts" }),
    /* @__PURE__ */ _("div", { className: "reporting-panel", children: [
      /* @__PURE__ */ l("div", { className: "reporting-panel__tabs", role: "group", "aria-label": "Miners shown", children: Ph.map((c) => /* @__PURE__ */ l(
        Ze,
        {
          variant: "secondary",
          "aria-pressed": c === n,
          className: c === n ? "reporting-pill reporting-pill--active" : "reporting-pill",
          onClick: () => r(c),
          children: _n[c].label
        },
        c
      )) }),
      /* @__PURE__ */ l(Zh, { view: s, total: o.total })
    ] }),
    /* @__PURE__ */ l(T, { title: "Miner Status", state: L(a, Mh), children: a.status === "ready" ? /* @__PURE__ */ l(Z, { stacked: !0, formatValue: bn, ...a.data }) : null })
  ] });
}, Zh = ({ view: e, total: t }) => {
  if (e.status === "loading") return /* @__PURE__ */ l(ot, {});
  if (e.status === "error") return /* @__PURE__ */ l(Le, { title: "Could not load", error: e.message });
  const n = e.data;
  return n.empty ? /* @__PURE__ */ l(et, { message: "No miners in the latest snapshot." }) : n.total === 0 ? /* @__PURE__ */ l(et, { message: "No miners in this state right now." }) : /* @__PURE__ */ _("div", { className: "reporting-types", children: [
    /* @__PURE__ */ _("div", { className: "reporting-types__total", children: [
      /* @__PURE__ */ l("span", { className: "reporting-field__label", children: t }),
      /* @__PURE__ */ l("span", { className: "reporting-types__count", children: bn(n.total) })
    ] }),
    /* @__PURE__ */ l(
      eo,
      {
        data: n.slices,
        borderWidth: 1,
        legendPosition: "left",
        formatValue: bn
      }
    )
  ] });
}, $t = 6e4, Hr = () => Math.ceil(Date.now() / $t) * $t, Dh = () => {
  const [e, t] = j(Hr);
  return ei(() => {
    const n = setInterval(() => t(Hr()), $t);
    return () => clearInterval(n);
  }, []), e;
}, Vr = (e, t) => typeof e == "number" ? _t(yt(e, t)) : we, Fh = (e) => {
  const t = e.summary, n = t?.efficiencyWThs.site;
  return {
    hashrate: Vr(t?.hashrateThs.site, Sn),
    power: Vr(t?.powerW.site, Tt),
    // A dash alone when missing, as hashrate and power show it
    efficiency: typeof n == "number" ? `${X(n)} ${wn.EFFICIENCY_W_PER_TH_S}` : we
  };
}, jh = 1440 * $t, Lh = () => {
  const e = Dh(), t = Ae(() => ({ start: e - jh, end: e, granularity: "hour" }), [e]);
  return Q(He(t), Fh);
}, Bh = () => {
  const { name: e } = ve(), t = Lh();
  return t.status === "loading" ? /* @__PURE__ */ l(ot, {}) : t.status === "error" ? /* @__PURE__ */ l(Le, { title: "Could not load the site's figures", error: t.message }) : /* @__PURE__ */ _("div", { className: "reporting-home", children: [
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
    /* @__PURE__ */ l(no, { className: "reporting-home__link", to: `/app/${e}`, children: "Open the reports" })
  ] });
}, Y = {
  OPERATIONS: "Operations",
  FINANCIALS: "Financials"
}, xh = [
  { label: Y.OPERATIONS, icon: Ys },
  { label: Y.FINANCIALS, icon: qs }
], Wh = [
  {
    path: H.DASHBOARD,
    label: "Dashboard",
    section: Y.OPERATIONS,
    component: oe(gf)
  },
  {
    path: H.HASHRATE,
    label: "Hashrate",
    section: Y.OPERATIONS,
    component: oe(Rh)
  },
  {
    path: H.ENERGY,
    label: "Energy",
    section: Y.OPERATIONS,
    component: oe(Ih)
  },
  {
    path: H.EFFICIENCY,
    label: "Efficiency",
    section: Y.OPERATIONS,
    component: oe(gh)
  },
  {
    path: H.MINERS,
    label: "Miners",
    section: Y.OPERATIONS,
    component: oe(Uh)
  },
  {
    path: H.REVENUE_SUMMARY,
    label: "Revenue Summary",
    section: Y.FINANCIALS,
    component: oe(oh)
  },
  {
    path: H.COST_SUMMARY,
    label: "Cost Summary",
    section: Y.FINANCIALS,
    component: oe(qf)
  },
  {
    path: H.SUBSIDY_FEE,
    label: "Subsidy / Fee",
    section: Y.FINANCIALS,
    component: oe(uh)
  },
  {
    path: H.HASH_BALANCE,
    label: "Hash Balance",
    section: Y.FINANCIALS,
    component: oe(th)
  },
  {
    path: H.ENERGY_BALANCE,
    label: "Energy Balance",
    section: Y.FINANCIALS,
    component: oe(Qf)
  },
  {
    path: H.COST_INPUT,
    label: "Cost Input",
    section: Y.FINANCIALS,
    component: oe(Pf)
  }
], Gh = Ns({
  // Must equal `id` in mdk-app.yaml: the dashboard refuses a mismatch.
  id: "io.tether.reporting-tool-lite",
  displayName: "Reporting Tool Lite",
  routes: Wh,
  sections: xh,
  panels: [
    {
      id: "site-24h",
      slot: As.HOME,
      title: "Reporting Tool Lite — last 24 hours",
      component: Bh
    }
  ]
});
export {
  Gh as default
};
