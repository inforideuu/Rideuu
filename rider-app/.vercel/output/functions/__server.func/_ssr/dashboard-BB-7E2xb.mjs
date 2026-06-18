import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell } from "./MobileShell-p1-8Yc6U.mjs";
import { L as Logo } from "./Logo-BWmppa6E.mjs";
import { I as InteractiveMap } from "./InteractiveMap-DmgnwrGd.mjs";
import { u as useRider, a as api } from "./router-CTtxc6Rr.mjs";
import { V as ShieldCheck, e as Bell, p as Compass, y as MapPin, o as CloudRain, s as Crown, ac as Zap, U as ShieldAlert, j as ChevronRight, C as Calendar, n as Clock, a0 as TrendingUp, Z as Star, a9 as Wallet, r as CreditCard } from "../_libs/lucide-react.mjs";
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
const CHENNAI_HOTSPOTS = [{
  name: "T. Nagar Shopping Zone",
  lat: 13.0382,
  lng: 80.2337
}, {
  name: "Velachery Hub",
  lat: 12.9915,
  lng: 80.2185
}, {
  name: "Anna Nagar West",
  lat: 13.085,
  lng: 80.21
}, {
  name: "Chennai Central Station",
  lat: 13.0827,
  lng: 80.2707
}, {
  name: "Nungambakkam Station",
  lat: 13.0658,
  lng: 80.2328
}, {
  name: "Airport Terminal",
  lat: 12.9941,
  lng: 80.1709
}, {
  name: "Adyar Zone",
  lat: 13.0063,
  lng: 80.252
}, {
  name: "Guindy Station",
  lat: 13.0084,
  lng: 80.2131
}, {
  name: "Marina Beach",
  lat: 13.0382,
  lng: 80.2785
}];
function Dashboard() {
  const nav = useNavigate();
  const {
    online,
    setOnline,
    sosTriggered,
    triggerSOS,
    cancelSOS,
    t,
    language,
    rainActive,
    floodAlert,
    womenPriorityMatch,
    setWomenPriorityMatch,
    womenSafetyVerified,
    profileName,
    activeRide,
    incomingRequest,
    currentAddress,
    manualLocation,
    setManualLocation,
    clearManualLocation,
    rating,
    completedRides,
    transactions,
    noCommissionExpiry,
    purchaseNoCommission,
    walletBalance,
    vehicles,
    activeVehicleId,
    phone,
    ridesList
  } = useRider();
  const todayEarnings = reactExports.useMemo(() => {
    let sum = 0;
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    ridesList.forEach((ride) => {
      if (ride.status === "completed" && ride.created_at) {
        const rideDate = ride.created_at.split("T")[0];
        if (rideDate === todayStr) {
          const fare = parseFloat(ride.fare);
          if (!isNaN(fare)) {
            const vType = ride.vehicle_type || "bike";
            const isAuto = vType.toLowerCase().includes("auto");
            const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1e3);
            const commPercent = hasNoComm ? 0 : isAuto ? 0.08 : 0.05;
            const commAmt = hasNoComm ? 3 : fare * commPercent;
            sum += fare - commAmt;
          }
        }
      }
    });
    return Math.round(sum * 100) / 100;
  }, [ridesList, noCommissionExpiry]);
  const [showLocationAlert, setShowLocationAlert] = reactExports.useState(true);
  const [showSubModal, setShowSubModal] = reactExports.useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = reactExports.useState(0);
  const [razorpayPlan, setRazorpayPlan] = reactExports.useState(null);
  const [isProcessingRazorpay, setIsProcessingRazorpay] = reactExports.useState(false);
  const activeVehicle = vehicles.find((v) => v.id === activeVehicleId);
  const vehicleType = activeVehicle?.type || localStorage.getItem("namma_vehicle_type") || "bike";
  const [dbPlans, setDbPlans] = reactExports.useState([]);
  reactExports.useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await api.getSetting("no_commission_plans");
        if (Array.isArray(res)) {
          setDbPlans(res);
        }
      } catch (err) {
        console.warn("Failed fetching subscription plans from backend:", err);
      }
    }
    fetchPlans();
  }, []);
  const plans = reactExports.useMemo(() => {
    const activeList = dbPlans.length > 0 ? dbPlans : vehicleType === "auto" ? [{
      price: 19,
      days: 1,
      label: "24 Hours",
      desc: "No commission for 24 hours. Only admin receives ₹3 for each ride from wallet.",
      vehicle_type: "auto"
    }, {
      price: 49,
      days: 3,
      label: "3 Days",
      desc: "No commission for 3 days. Only admin receives ₹3 for each ride from wallet.",
      vehicle_type: "auto"
    }, {
      price: 99,
      days: 7,
      label: "7 Days",
      desc: "No commission for 7 days. Only admin receives ₹3 for each ride from wallet.",
      vehicle_type: "auto"
    }, {
      price: 499,
      days: 30,
      label: "1 Month",
      desc: "No commission for 1 month. Only admin receives ₹3 for each ride from wallet.",
      vehicle_type: "auto"
    }] : [{
      price: 15,
      days: 1,
      label: "24 Hours",
      desc: "No commission for 24 hours. Only admin receives ₹3 for each ride from wallet.",
      vehicle_type: "bike"
    }, {
      price: 45,
      days: 3,
      label: "3 Days",
      desc: "No commission for 3 days. Only admin receives ₹3 for each ride from wallet.",
      vehicle_type: "bike"
    }, {
      price: 95,
      days: 7,
      label: "7 Days",
      desc: "No commission for 7 days. Only admin receives ₹3 for each ride from wallet.",
      vehicle_type: "bike"
    }, {
      price: 495,
      days: 30,
      label: "1 Month",
      desc: "No commission for 1 month. Only admin receives ₹3 for each ride from wallet.",
      vehicle_type: "bike"
    }];
    return activeList.filter((p) => p.vehicle_type === vehicleType || p.vehicleType === vehicleType);
  }, [dbPlans, vehicleType]);
  const subActive = reactExports.useMemo(() => {
    return noCommissionExpiry > Math.floor(Date.now() / 1e3);
  }, [noCommissionExpiry]);
  const activeTimeLeft = reactExports.useMemo(() => {
    if (!subActive) return "";
    const seconds = noCommissionExpiry - Math.floor(Date.now() / 1e3);
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor(seconds % (24 * 3600) / 3600);
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor(seconds % 3600 / 60);
    return `${hours}h ${mins}m left`;
  }, [noCommissionExpiry, subActive]);
  reactExports.useMemo(() => {
    if (incomingRequest) {
      setTimeout(() => nav({
        to: "/ride/request"
      }), 200);
    }
  }, [incomingRequest]);
  reactExports.useMemo(() => {
    if (activeRide.request) {
      setTimeout(() => nav({
        to: "/ride/active"
      }), 200);
    }
  }, [activeRide.request]);
  const activeZoneText = reactExports.useMemo(() => {
    if (rainActive && floodAlert) return language === "ta" ? "வேளச்சேரி (வெள்ள அபாயம்)" : "Velachery (Flood Warning)";
    if (rainActive) return language === "ta" ? "மழைக்கால வேளச்சேரி" : "Rainy Velachery Hub";
    return currentAddress;
  }, [rainActive, floodAlert, language, currentAddress]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-5 pt-6 pb-2 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded uppercase", children: t("rider") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        womenSafetyVerified && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setWomenPriorityMatch(!womenPriorityMatch), className: `h-9 px-3 rounded-full border text-xs font-bold flex items-center gap-1.5 transition ${womenPriorityMatch ? "bg-pink-500 text-white border-pink-500 shadow-sm" : "bg-card border-border text-muted-foreground"}`, title: "Women Rider Preference Badge", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] hidden xs:inline", children: t("women_only_rides") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/notifications", className: "relative h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4.5 w-4.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-5 mt-4 rounded-3xl bg-primary text-primary-foreground p-5 overflow-hidden relative shadow-lg", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between z-10 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-extrabold tracking-widest uppercase opacity-90 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "h-3.5 w-3.5 animate-spin", style: {
              animationDuration: "8s"
            } }),
            online ? `${t("you_are_live_in")} ${activeZoneText}` : t("you_are_offline")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-xl font-black tracking-tight leading-tight max-w-[190px]", children: online ? t("catching_rides") : t("go_online_start") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
          const nextOnline = !online;
          await setOnline(nextOnline);
          if (nextOnline) {
            const now = Math.floor(Date.now() / 1e3);
            if (noCommissionExpiry < now) {
              setShowSubModal(true);
            }
          }
        }, className: `relative shrink-0 h-9 w-16 rounded-full border-2 border-white/20 transition ${online ? "bg-emerald-500" : "bg-white/10"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-0.5 h-7 w-7 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shadow-md transition-all ${online ? "left-7.5 text-emerald-500" : "left-0.5 text-slate-500"}`, children: online ? "ON" : "OFF" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 grid grid-cols-2 gap-2.5 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white/15 backdrop-blur px-2.5 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-wider opacity-80", children: t("today") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-black text-sm tracking-tight", children: [
            "₹",
            todayEarnings
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white/15 backdrop-blur px-2.5 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-wider opacity-80", children: t("trips") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-sm tracking-tight", children: completedRides })
        ] })
      ] }),
      online && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-white/10 flex flex-col gap-1.5 relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "h-3 w-3 text-emerald-300" }),
            " ",
            language === "ta" ? "கைமுறை இருப்பிடம்" : "Manual Location Override"
          ] }),
          manualLocation && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: clearManualLocation, className: "text-[9px] font-black underline hover:text-emerald-300 cursor-pointer", children: language === "ta" ? "தானியங்கி ஜிபிஎஸ்" : "Reset to Auto GPS" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: manualLocation ? manualLocation.address : "", onChange: (e) => {
          const val = e.target.value;
          if (!val) {
            clearManualLocation();
            return;
          }
          const found = CHENNAI_HOTSPOTS.find((h) => h.name === val);
          if (found) {
            setManualLocation(found.name, found.lat, found.lng);
          }
        }, className: "w-full bg-white/10 text-white border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", className: "text-slate-900 bg-white", children: language === "ta" ? "தானியங்கி ஜிபிஎஸ் (உலாவி)" : "Browser Auto GPS" }),
          CHENNAI_HOTSPOTS.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: h.name, className: "text-slate-900 bg-white", children: h.name }, h.name))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checker-stripe absolute -bottom-2 left-0 right-0 h-3.5 opacity-30" })
    ] }),
    online && floodAlert && showLocationAlert && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mt-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 p-4 text-blue-400 flex items-start gap-3 relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "h-5 w-5 shrink-0 mt-0.5 animate-bounce" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-black text-xs uppercase tracking-wide", children: [
          t("flood_warning_title"),
          " (Velachery Zone)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed mt-1 text-slate-300", children: t("flood_warning_desc") })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowLocationAlert(false), className: "text-slate-400 hover:text-white absolute top-2 right-2 text-xs", children: "✕" })
    ] }),
    online && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-5 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-3xl border p-4 transition-all ${subActive ? "bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border-amber-500/30" : "bg-gradient-to-r from-slate-500/5 to-slate-600/5 border-border"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-9 w-9 rounded-full flex items-center justify-center ${subActive ? "bg-amber-500/20 text-amber-500" : "bg-slate-500/10 text-slate-400"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-4.5 w-4.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-black text-xs tracking-tight text-foreground flex items-center gap-1.5", children: [
            "No Commission Plan",
            subActive ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black uppercase text-amber-600 bg-amber-500/15 px-1.5 py-0.5 rounded", children: "Active" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded", children: "Inactive" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold mt-0.5", children: subActive ? `Flat ₹3 admin fee per ride · ${activeTimeLeft}` : `Standard ${vehicleType === "auto" ? "8%" : "5%"} commission active` })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowSubModal(true), className: `px-3 py-1.5 rounded-full text-[10px] font-black transition active:scale-95 ${subActive ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm" : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"}`, children: subActive ? "Extend" : "Upgrade" })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-5 mt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-black text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "h-4 w-4 text-primary" }),
          t("heatmap")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold text-primary flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "h-3 w-3 animate-bounce" }),
          language === "ta" ? "நேரடி கட்டண உயர்வு" : "SURGE PRICING ACTIVE"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(InteractiveMap, { height: "h-[280px]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-5 mt-4", children: sosTriggered ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl bg-red-600 border border-red-500 text-white p-5 shadow-lg relative slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-10 w-10 shrink-0 text-white animate-bounce" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-base tracking-tight", children: t("emergency_title") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs mt-1 text-red-100 leading-relaxed", children: t("emergency_desc") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: cancelSOS, className: "px-4 py-2 bg-white text-red-600 rounded-full text-xs font-black hover:bg-slate-100 transition active:scale-95", children: "Cancel Alert" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "tel:100", className: "px-4 py-2 bg-slate-900 border border-white/20 text-white rounded-full text-xs font-black text-center", children: "Call 100" })
        ] })
      ] })
    ] }) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: triggerSOS, className: "w-full rounded-2xl bg-card border border-red-500/30 hover:border-red-500 p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition text-red-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5 animate-pulse" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-black text-sm tracking-tight", children: [
            t("sos"),
            " EMERGENCY HELP"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold", children: "1-Tap GPS Share to Police" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-5 w-5 text-red-400" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-5 mt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 border-b border-border pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4.5 w-4.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xs uppercase tracking-wider text-foreground", children: t("shift_scheduling") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded", children: "Active Shift" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-8 w-8 text-primary/10 rounded-full flex items-center justify-center" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-foreground", children: t("current_shift") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold", children: "Usman Road Hub · Chennai" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => nav({
          to: "/profile"
        }), className: "text-primary font-bold text-[11px] underline", children: "Scheduler →" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-5 mt-6 space-y-3 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RowLink, { to: "/incentives", icon: Zap, title: t("incentives_bonuses"), sub: "View incentive challenges" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RowLink, { to: "/earnings", icon: TrendingUp, title: language === "ta" ? "இன்றைய வருவாய்" : "Today's Earnings", sub: `₹${todayEarnings} · view breakdown graph` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RowLink, { to: "/ratings", icon: Star, title: t("ratings_reviews"), sub: `${rating.toFixed(2)} ★ · Customer Rating` })
    ] }),
    showSubModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card w-full max-w-md rounded-t-[32px] rounded-b-[24px] p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-4 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5 animate-pulse" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-base text-foreground tracking-tight", children: "No Commission Plan" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground font-semibold uppercase tracking-wider", children: [
              vehicleType,
              " rider plans"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowSubModal(false), className: "h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition", children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed mb-4", children: [
        "Activate a plan below to keep ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "100% of your ride fares" }),
        ". Only pay a flat admin fee of ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "₹3 per completed ride" }),
        " directly from your wallet balance."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5 mb-5", children: plans.map((plan, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedPlanIndex(idx), className: `w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${selectedPlanIndex === idx ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500 shadow-sm" : "border-border bg-muted/30 hover:bg-muted/50"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 pr-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-extrabold text-sm text-foreground", children: [
              plan.label,
              " Plan"
            ] }),
            idx === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-black uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded", children: "Best Value" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground block mt-1 leading-snug", children: plan.desc })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-black text-foreground", children: [
          "₹",
          plan.price
        ] }) })
      ] }, idx)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: async () => {
          const plan = plans[selectedPlanIndex];
          const success = await purchaseNoCommission(plan.price, plan.days, "wallet");
          if (success) {
            setShowSubModal(false);
          }
        }, className: "w-full h-12 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 font-black text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "h-4.5 w-4.5" }),
          "Pay via Wallet (Bal: ₹",
          walletBalance.toFixed(2),
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setRazorpayPlan(plans[selectedPlanIndex]);
        }, className: "w-full h-12 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-black text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-md", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CreditCard, { className: "h-4.5 w-4.5" }),
          "Pay via Razorpay Gateway"
        ] })
      ] })
    ] }) }),
    razorpayPlan && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#1c2438] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-blue-500/20 text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#121826] p-5 border-b border-white/5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-lg tracking-tight text-blue-400", children: "Razorpay" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20", children: "TEST MODE" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRazorpayPlan(null), className: "text-slate-400 hover:text-white font-bold", children: "✕" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-slate-400 font-semibold uppercase tracking-wider", children: "PAYING FOR NO COMMISSION PLAN" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-black text-white mt-1.5", children: [
            "₹",
            razorpayPlan.price.toFixed(2)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-blue-300 font-bold mt-1", children: [
            "Duration: ",
            razorpayPlan.label
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-[#121826]/60 rounded-2xl p-4 border border-white/5 space-y-3 mb-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "Merchant" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Rideuu Platform" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-xs", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-slate-400", children: "Contact" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: phone || "+91 99999 99999" })
          ] })
        ] }),
        isProcessingRazorpay ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-8 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-slate-300", children: "Authorizing Payment via Bank Gateway..." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
            setIsProcessingRazorpay(true);
            setTimeout(async () => {
              setIsProcessingRazorpay(false);
              const success = await purchaseNoCommission(razorpayPlan.price, razorpayPlan.days, "razorpay");
              if (success) {
                setRazorpayPlan(null);
                setShowSubModal(false);
              }
            }, 1800);
          }, className: "w-full h-12 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition", children: "Simulate Payment Success" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            alert("Payment failed / cancelled.");
            setRazorpayPlan(null);
          }, className: "w-full h-12 rounded-xl bg-red-600/30 text-red-200 hover:bg-red-600/40 border border-red-500/20 font-black text-sm flex items-center justify-center active:scale-95 transition", children: "Simulate Payment Failure" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-[#121826] p-4 text-center text-[9px] text-slate-500 font-semibold uppercase tracking-wider", children: "Secured by Razorpay. Do not refresh." })
    ] }) })
  ] });
}
function RowLink({
  to,
  icon: Icon,
  title,
  sub
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: "flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 hover:border-primary/20 active:scale-[0.99] transition shadow-sm", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4.5 w-4.5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground tracking-tight truncate", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold truncate mt-0.5", children: sub })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4.5 w-4.5 text-muted-foreground" })
  ] });
}
export {
  Dashboard as component
};
