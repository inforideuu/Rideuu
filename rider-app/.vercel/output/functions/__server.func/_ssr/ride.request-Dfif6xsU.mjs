import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { y as MapPin, Y as Sparkles, v as IndianRupee, V as ShieldCheck, N as Navigation, ab as X, i as Check } from "../_libs/lucide-react.mjs";
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
function RideRequest() {
  const nav = useNavigate();
  const {
    incomingRequest,
    acceptRideRequest,
    rejectRideRequest,
    t,
    language
  } = useRider();
  const [seconds, setSeconds] = reactExports.useState(15);
  reactExports.useEffect(() => {
    if (seconds <= 0) {
      rejectRideRequest();
      nav({
        to: "/dashboard"
      });
      return;
    }
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1e3);
    return () => clearTimeout(timer);
  }, [seconds]);
  reactExports.useEffect(() => {
    if (!incomingRequest) {
      nav({
        to: "/dashboard"
      });
    }
  }, [incomingRequest, nav]);
  const activeReq = reactExports.useMemo(() => {
    if (incomingRequest) return incomingRequest;
    return {
      id: "req-fallback",
      fare: 142,
      distance: 4.2,
      duration: 18,
      pickup: "T.Nagar Bus Depot",
      pickupSub: "Usman Road · 2.1 km away",
      dropoff: "Anna Nagar W Block",
      dropoffSub: "Drop-off · landmark: behind Saravana Stores",
      customerName: "Priya",
      customerRating: 4.8,
      isFemaleOnly: true,
      surgeMultiplier: 1.2,
      rainBonus: 20
    };
  }, [incomingRequest]);
  const handleAccept = async () => {
    const success = await acceptRideRequest();
    if (success) {
      nav({
        to: "/ride/active"
      });
    } else {
      nav({
        to: "/dashboard"
      });
    }
  };
  const handleReject = () => {
    rejectRideRequest();
    nav({
      to: "/dashboard"
    });
  };
  const totalEarnings = activeReq.id.includes("fallback") ? Math.round((activeReq.fare + activeReq.rainBonus) * activeReq.surgeMultiplier) : activeReq.fare;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MobileShell, { showNav: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen relative overflow-hidden bg-slate-900", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.15)_0%,transparent_50%),radial-gradient(circle_at_70%_60%,rgba(15,23,42,0.95)_0%,rgba(15,23,42,1)_100%)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-1/3 left-1/2 -translate-x-1/2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-28 w-28 rounded-full bg-primary/10 pulse-ring flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-8 w-8 text-primary animate-bounce" }) }) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-6 inset-x-6 flex justify-between items-center z-10 text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black tracking-widest text-primary bg-primary/15 px-3 py-1 rounded-full border border-primary/20", children: t("built_for_chennai") }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black bg-slate-800 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-3.5 w-3.5 text-primary" }),
        "Smart Queue: High Priority"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-6 inset-x-4 rounded-3xl bg-slate-950/90 border border-white/15 p-6 backdrop-blur-lg slide-up text-white shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full h-1 bg-white/10 rounded-full overflow-hidden mb-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary rounded-full transition-all duration-1000", style: {
        width: `${seconds / 15 * 100}%`
      } }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-black tracking-widest text-primary bg-primary/15 px-2.5 py-0.5 rounded-md uppercase", children: [
          t("new_ride"),
          " · AUTO"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black bg-primary text-primary-foreground px-3 py-1 rounded-full animate-pulse", children: [
          seconds,
          "s left"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-baseline gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(IndianRupee, { className: "h-6 w-6 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-4xl font-black tracking-tight", children: totalEarnings }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-slate-400 font-semibold", children: [
          "· ",
          activeReq.distance,
          " km · ",
          activeReq.duration,
          " mins"
        ] })
      ] }),
      activeReq.isFemaleOnly && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-2 bg-pink-500/10 border border-pink-500/25 p-3 rounded-2xl text-pink-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-5 w-5 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold tracking-tight", children: [
          t("women_priority"),
          " Badge Match"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 space-y-4 border-y border-white/5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeReq.pickup)}`, "_blank"), className: "flex items-start gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all", title: "Touch to navigate to pickup location", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-success mt-1.5 shrink-0 ring-4 ring-success/20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-xs text-white uppercase tracking-wide flex items-center gap-1", children: [
              "PICKUP ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-3 w-3 text-primary animate-pulse" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-sm mt-0.5", children: activeReq.pickup }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 font-semibold", children: activeReq.pickupSub })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 ring-4 ring-primary/20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-white uppercase tracking-wide", children: t("dropoff") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-sm mt-0.5", children: activeReq.dropoff }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 font-semibold", children: activeReq.dropoffSub })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary", children: activeReq.customerName[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-white text-xs", children: activeReq.customerName }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-slate-400 font-bold", children: [
              "⭐ ",
              activeReq.customerRating,
              " rating"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-slate-400 font-bold", children: "SURGE / RAIN" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] font-black text-primary uppercase", children: [
            activeReq.surgeMultiplier,
            "x Surge · +₹",
            activeReq.rainBonus,
            " Bonus"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-5 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleReject, className: "col-span-2 rounded-full bg-white/10 border border-white/5 text-white hover:bg-white/20 font-black py-4 flex items-center justify-center gap-2 active:scale-95 transition text-xs tracking-wide", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4.5 w-4.5" }),
          " ",
          t("reject")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleAccept, className: "col-span-3 rounded-full bg-primary text-primary-foreground font-black py-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition text-xs tracking-wide uppercase", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4.5 w-4.5" }),
          " ",
          t("accept_ride")
        ] })
      ] })
    ] })
  ] }) });
}
export {
  RideRequest as component
};
