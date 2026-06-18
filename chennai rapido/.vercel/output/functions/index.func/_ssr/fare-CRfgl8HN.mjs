import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, a as api, t as translate, s as store } from "./router-BpidCmwR.mjs";
import { a as ArrowLeft, I as MapPin, o as Clock, f as Bike, i as Car, ae as Zap, N as Moon, a0 as Sparkles, z as Map } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
const vehicles = [{
  id: "bike",
  name: "Bike Option",
  tamil: "பைக் சவாரி",
  icon: Bike,
  eta: "2 min",
  base: 25,
  perKm: 8
}, {
  id: "auto",
  name: "Auto Rickshaw",
  tamil: "ஆட்டோ சவாரி",
  icon: Car,
  eta: "4 min",
  base: 40,
  perKm: 14
}];
const coupons = [{
  code: "CHENNAI50",
  label: "50% off first ride · max ₹75",
  value: 0.5,
  cap: 75
}, {
  code: "RAINY20",
  label: "Flat ₹30 monsoon discount",
  value: 30,
  cap: 0
}];
const landmarks = [{
  name: "Marina Beach (Behind Lighthouse)",
  area: "Mylapore",
  lat: 13.0382,
  lon: 80.2785
}, {
  name: "Central Station (Near Gate 3)",
  area: "Park Town",
  lat: 13.0827,
  lon: 80.2707
}, {
  name: "Pondy Bazaar (Near Saravana Stores)",
  area: "T. Nagar",
  lat: 13.0402,
  lon: 80.2337
}, {
  name: "Tidel Park (Phase 1 Main entrance)",
  area: "Taramani",
  lat: 12.9895,
  lon: 80.2483
}, {
  name: "Adyar Signal (Near flyover pillar 12)",
  area: "Adyar",
  lat: 13.0063,
  lon: 80.252
}];
function FarePage() {
  const {
    language,
    theme,
    ride,
    womenSafetyMode
  } = useAppStore();
  const navigate = useNavigate();
  const [veh, setVeh] = reactExports.useState("auto");
  const [surge, setSurge] = reactExports.useState(!womenSafetyMode);
  const [night, setNight] = reactExports.useState(false);
  const [code, setCode] = reactExports.useState("");
  const [applied, setApplied] = reactExports.useState(ride.couponCode === "CHENNAI50" ? coupons[0] : null);
  const t = (key) => translate(key, language);
  const [pickup, setPickup] = reactExports.useState(ride.pickup || "Marina Beach Gate 2");
  const [drop, setDrop] = reactExports.useState(ride.drop || "T. Nagar Pondy Bazaar");
  const [pickupCoords, setPickupCoords] = reactExports.useState(ride.pickupCoords || {
    lat: 13.0382,
    lon: 80.2785
  });
  const [dropCoords, setDropCoords] = reactExports.useState(ride.dropCoords || {
    lat: 13.0402,
    lon: 80.2337
  });
  const [distance, setDistance] = reactExports.useState(6.2);
  const [minutes, setMinutes] = reactExports.useState(18);
  const [toll, setToll] = reactExports.useState(15);
  const [adminBikeBase, setAdminBikeBase] = reactExports.useState(25);
  const [adminBikePerKm, setAdminBikePerKm] = reactExports.useState(6);
  const [adminAutoBase, setAdminAutoBase] = reactExports.useState(40);
  const [adminAutoPerKm, setAdminAutoPerKm] = reactExports.useState(14);
  const [showLandmarks, setShowLandmarks] = reactExports.useState(null);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [searchResults, setSearchResults] = reactExports.useState([]);
  reactExports.useEffect(() => {
    async function loadTariffs() {
      try {
        const res = await api.getSetting("admin_general_settings");
        if (res) {
          if (res.bikeBase) setAdminBikeBase(Number(res.bikeBase));
          if (res.bikePerKm) setAdminBikePerKm(Number(res.bikePerKm));
          if (res.autoBase) setAdminAutoBase(Number(res.autoBase));
          if (res.autoPerKm) setAdminAutoPerKm(Number(res.autoPerKm));
        }
      } catch (err) {
        console.warn("Failed to load admin tariffs", err);
      }
    }
    loadTariffs();
  }, []);
  reactExports.useEffect(() => {
    async function loadEstimates() {
      const res = await api.getFareEstimate(pickup, drop, pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon, applied ? applied.code : "");
      if (res) {
        setDistance(res.distance_km);
        setMinutes(res.duration_min);
      }
    }
    loadEstimates();
  }, [pickup, drop, pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon, applied]);
  reactExports.useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await api.searchLocations(searchQuery);
      if (res) {
        setSearchResults(res);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);
  const handleSelectLandmark = (name, lat, lon) => {
    if (showLandmarks === "pickup") {
      setPickup(name);
      if (lat && lon) setPickupCoords({
        lat,
        lon
      });
    } else if (showLandmarks === "drop") {
      setDrop(name);
      if (lat && lon) setDropCoords({
        lat,
        lon
      });
    }
    setShowLandmarks(null);
    setSearchQuery("");
  };
  const handleSelectSearchResult = async (item) => {
    const details = await api.getPlaceDetails(item.place_id);
    if (details) {
      if (showLandmarks === "pickup") {
        setPickup(details.formatted_address);
        setPickupCoords({
          lat: details.latitude,
          lon: details.longitude
        });
      } else if (showLandmarks === "drop") {
        setDrop(details.formatted_address);
        setDropCoords({
          lat: details.latitude,
          lon: details.longitude
        });
      }
    } else {
      if (showLandmarks === "pickup") {
        setPickup(item.name);
      } else if (showLandmarks === "drop") {
        setDrop(item.name);
      }
    }
    setShowLandmarks(null);
    setSearchQuery("");
  };
  const breakdown = reactExports.useMemo(() => {
    const isBike = veh === "bike";
    const baseRate = isBike ? adminBikeBase : adminAutoBase;
    const perKmRate = isBike ? adminBikePerKm : adminAutoPerKm;
    const distFare = distance * perKmRate;
    const timeFare = minutes * (isBike ? 1 : 1.5);
    const fee = isBike ? 3 : 5;
    const surgeAmt = surge ? (baseRate + distFare + timeFare) * 0.25 : 0;
    const nightAmt = night ? 30 : 0;
    const subtotal = baseRate + distFare + timeFare + fee + surgeAmt + nightAmt + toll;
    let discount = 0;
    if (applied) {
      discount = applied.cap === 0 ? applied.value : Math.min(subtotal * applied.value, applied.cap);
    }
    const total = Math.max(15, subtotal - discount);
    return {
      base: baseRate,
      perKm: perKmRate,
      distFare,
      timeFare,
      fee,
      surgeAmt,
      nightAmt,
      toll,
      discount,
      total
    };
  }, [veh, surge, night, applied, distance, minutes, adminBikeBase, adminAutoBase, adminBikePerKm, adminAutoPerKm]);
  const handleBookAtEstimate = () => {
    store.update((s) => {
      s.ride.pickup = pickup;
      s.ride.drop = drop;
      s.ride.pickupCoords = pickupCoords;
      s.ride.dropCoords = dropCoords;
      s.ride.vehicle = veh === "bike" ? "bike" : "auto";
      s.ride.basePrice = veh === "bike" ? adminBikeBase : adminAutoBase;
      s.ride.negotiatedPrice = Math.round(breakdown.total);
      s.ride.couponCode = applied ? applied.code : "";
      s.ride.discount = Math.round(breakdown.discount);
      s.ride.surgeApplied = surge;
      s.ride.nightApplied = night;
    });
    store.startDriverSearch();
    navigate({
      to: "/app/track"
    });
  };
  const handleApplyPromo = () => {
    const found = coupons.find((c) => c.code === code.toUpperCase());
    if (found) {
      setApplied(found);
      setCode("");
    } else {
      alert("Invalid Promo Code! Try using 'CHENNAI50'");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-24 text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/home", className: "grid size-9 place-items-center rounded-xl bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-extrabold tracking-tight", children: t("Fare") || "Fare Details" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-semibold", children: "சவாரி கட்டண விவரங்கள்" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-4 text-xs font-semibold text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "map-grid rounded-3xl border border-border bg-card p-4 shadow-sm relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-[0.03] checkered" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-col gap-2.5 text-xs font-extrabold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowLandmarks("pickup"), className: "flex items-center gap-2 text-left hover:text-primary transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4 text-emerald-500 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: pickup })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-0.5 h-3 bg-border ml-2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowLandmarks("drop"), className: "flex items-center gap-2 text-left hover:text-primary transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4 text-primary shrink-0 animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: drop })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-4 grid grid-cols-2 gap-3 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-muted/50 border border-border/10 p-3 shadow-inner", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase tracking-widest text-muted-foreground", children: "Distance" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-black text-foreground mt-0.5", children: [
              distance,
              " km"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-muted/50 border border-border/10 p-3 shadow-inner", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3" }),
              " Duration"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-base font-black text-foreground mt-0.5", children: [
              minutes,
              " mins"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-2.5 text-xs font-black text-muted-foreground uppercase tracking-widest pl-1", children: "Choose a vehicle" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: vehicles.map((v) => {
          const active = veh === v.id;
          const isBike = v.id === "bike";
          const baseRate = isBike ? adminBikeBase : adminAutoBase;
          const perKmRate = isBike ? adminBikePerKm : adminAutoPerKm;
          const distFare = distance * perKmRate;
          const timeFare = minutes * (isBike ? 1 : 1.5);
          const fee = isBike ? 3 : 5;
          const surgeAmt = surge ? (baseRate + distFare + timeFare) * 0.25 : 0;
          const nightAmt = night ? 30 : 0;
          const subtotal = baseRate + distFare + timeFare + fee + surgeAmt + nightAmt + toll;
          let discount = 0;
          if (applied) {
            discount = applied.cap === 0 ? applied.value : Math.min(subtotal * applied.value, applied.cap);
          }
          const est = Math.max(15, subtotal - discount);
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setVeh(v.id), className: `rounded-2xl border-2 p-4 text-center transition duration-200 ${active ? "border-primary bg-primary/10 shadow-md scale-[1.01]" : "border-border bg-card hover:border-primary/20"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(v.icon, { className: `mx-auto size-7 ${active ? "text-primary animate-pulse" : "text-muted-foreground"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs font-extrabold text-foreground", children: v.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground mt-0.5", children: language === "en" ? v.name.split(" ")[0] : v.tamil }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-base font-black text-primary", children: [
              "₹",
              Math.round(est)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-muted-foreground mt-0.5", children: [
              "ETA: ",
              v.eta
            ] })
          ] }, v.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid grid-cols-2 gap-3 font-semibold text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSurge(!surge), className: `flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${surge ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: `size-5 shrink-0 ${surge ? "text-destructive animate-bounce" : "text-muted-foreground"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold", children: "Demand Surge" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground mt-0.5", children: "Weather surge enabled" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setNight(!night), className: `flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${night ? "border-primary bg-primary/10" : "border-border bg-card"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: `size-5 shrink-0 ${night ? "text-primary animate-pulse" : "text-muted-foreground"}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold", children: "Night Charge" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground mt-0.5", children: "10 PM - 5 AM active" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1", children: "Apply Coupons" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: coupons.map((c) => {
          const active = applied?.code === c.code;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setApplied(active ? null : c), className: `flex-1 rounded-xl border border-dashed p-2.5 text-left transition ${active ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-extrabold" : "border-border bg-card hover:border-primary/20"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3 text-emerald-500" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black", children: c.code })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] text-muted-foreground mt-0.5 leading-normal", children: c.label.split("·")[0] })
          ] }, c.code);
        }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: code, onChange: (e) => setCode(e.target.value.toUpperCase()), placeholder: "Enter Custom Promo Code", className: "flex-1 rounded-xl border border-border bg-card px-3.5 py-3 text-xs font-semibold focus:border-primary focus:outline-none placeholder:text-muted-foreground/60" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleApplyPromo, className: "rounded-xl bg-secondary px-5 text-xs font-black text-secondary-foreground shadow active:scale-95", children: "Apply" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl border border-border bg-card p-4 shadow-sm space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-black text-muted-foreground uppercase tracking-widest pl-0.5 border-b border-border pb-2", children: "Fare Breakdown" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Base Fare" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "₹",
            breakdown.base.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "Distance Tariff (",
            distance.toFixed(2),
            " km × ₹",
            breakdown.perKm,
            "/km)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "₹",
            breakdown.distFare.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "Duration Tariff (",
            minutes,
            " mins × ₹",
            veh === "bike" ? "1.00" : "1.50",
            "/min)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "₹",
            breakdown.timeFare.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Platform / Convenience Fee" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "₹",
            breakdown.fee.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Chennai Toll Charges" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "₹",
            breakdown.toll.toFixed(2)
          ] })
        ] }),
        surge && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-0.5 text-destructive font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Rain/Demand Surge (1.25x)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "+₹",
            breakdown.surgeAmt.toFixed(2)
          ] })
        ] }),
        night && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-0.5 text-primary font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Late Night Commute" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "+₹",
            breakdown.nightAmt.toFixed(2)
          ] })
        ] }),
        applied && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between py-0.5 text-emerald-600 font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Promo Code ",
            applied.code
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "-₹",
            breakdown.discount.toFixed(2)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border pt-1" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between font-black text-xs pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground uppercase tracking-widest", children: "Total Payable Cost" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground mt-0.5", children: "சவாரி மொத்தம்" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-black text-primary tracking-tight", children: [
            "₹",
            Math.round(breakdown.total)
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleBookAtEstimate, className: "w-full rounded-2xl bg-secondary py-4 text-center text-xs font-black text-secondary-foreground shadow-xl active:scale-[0.99] transition", children: [
      "Book Ride at ₹",
      Math.round(breakdown.total)
    ] }) }),
    showLandmarks && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-extrabold flex items-center gap-1.5 text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "size-4 text-primary" }),
          " Location Search"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setShowLandmarks(null);
          setSearchQuery("");
        }, className: "text-xs text-muted-foreground font-bold", children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", autoFocus: true, placeholder: "Search streets, areas, IT parks...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full rounded-xl border border-border bg-secondary p-3 text-xs font-bold outline-none focus:border-primary text-foreground transition" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 text-xs font-semibold max-h-56 overflow-y-auto no-scrollbar", children: searchResults.length > 0 ? searchResults.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectSearchResult(item), className: "w-full flex items-start gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 text-left transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-extrabold line-clamp-2 text-foreground/90", children: item.name }) })
      ] }) }, idx)) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 pl-1", children: "Popular Places" }),
        landmarks.map((landmark) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectLandmark(landmark.name, landmark.lat, landmark.lon), className: "w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 text-left transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-extrabold text-foreground", children: landmark.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-muted-foreground", children: [
              landmark.area,
              " · Chennai"
            ] })
          ] })
        ] }) }, landmark.name))
      ] }) })
    ] }) })
  ] });
}
export {
  FarePage as component
};
