import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { l as CircleCheck, Z as Star, b as ArrowRight, U as ShieldAlert } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function Summary() {
  const nav = useNavigate();
  const {
    activeRide,
    endActiveRide,
    t,
    language
  } = useRider();
  const [rating, setRating] = reactExports.useState(5);
  const activeReq = reactExports.useMemo(() => {
    if (activeRide.request) return activeRide.request;
    return {
      id: "req-summary-fallback",
      fare: 120,
      distance: 4.2,
      pickup: "T.Nagar Bus Depot",
      dropoff: "Anna Nagar W Block",
      customerName: "Priya",
      isFemaleOnly: true,
      surgeMultiplier: 1.2,
      rainBonus: 20
    };
  }, [activeRide.request]);
  const surgeMult = activeReq.surgeMultiplier || 1;
  const baseFare = activeReq.id.includes("fallback") ? activeReq.fare : Math.round((activeReq.fare - activeReq.rainBonus) / surgeMult);
  const surgeAmt = activeReq.id.includes("fallback") ? Math.round(baseFare * (surgeMult - 1)) : activeReq.fare - baseFare - activeReq.rainBonus;
  const rainBonus = activeReq.rainBonus;
  const totalEarned = activeReq.id.includes("fallback") ? Math.round((baseFare + rainBonus) * surgeMult) : activeReq.fare;
  const handleFinish = () => {
    endActiveRide(rating);
    nav({
      to: "/dashboard"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MobileShell, { showNav: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pt-10 pb-8 text-center bg-background min-h-screen flex flex-col justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-16 w-16 rounded-full bg-success/15 border border-success/30 text-success flex items-center justify-center animate-bounce", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-9 w-9 fill-success/10" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-4 text-3xl font-black tracking-tight text-foreground", children: t("trip_complete") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider", children: [
        activeReq.customerName,
        " · ",
        activeReq.dropoff,
        " · ",
        activeReq.distance,
        " km"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-3xl bg-card border border-border p-6 text-left shadow-xl relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-success/5 to-transparent rounded-bl-full pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-4", children: "Detailed Earnings Ledger" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: t("trip_fare"), value: `₹${baseFare}.00` }),
        surgeAmt > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: `${t("surge_mult")} (${activeReq.surgeMultiplier}x)`, value: `+₹${surgeAmt}.00`, highlight: true }),
        rainBonus > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: t("rain_bonus_active"), value: `+₹${rainBonus}.00`, highlight: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border my-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { label: t("you_earned"), value: `₹${totalEarned}.00`, bold: true })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 rounded-3xl bg-card border border-border p-5 shadow-sm text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold text-foreground uppercase tracking-wider", children: [
          t("rate_customer"),
          " ",
          activeReq.customerName
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3.5 flex justify-center gap-2.5", children: [1, 2, 3, 4, 5].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRating(i), className: "active:scale-90 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-9 w-9 ${i <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"}` }) }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-[10px] text-muted-foreground font-semibold", children: "Performance score completes target bonus track" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleFinish, className: "w-full py-4 bg-primary text-primary-foreground font-black rounded-full shadow-lg active:scale-95 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wide", children: [
        t("back_to_dashboard"),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4.5 w-4.5" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3.5 w-3.5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Chennai auto-verification system enabled" })
      ] })
    ] })
  ] }) });
}
function Row({
  label,
  value,
  bold,
  highlight
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs ${bold ? "font-black uppercase tracking-wider text-foreground" : "text-muted-foreground font-semibold"}`, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-xs ${bold ? "font-black text-xl text-foreground" : highlight ? "text-primary font-black" : "font-black text-foreground"}`, children: value })
  ] });
}
export {
  Summary as component
};
