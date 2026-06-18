import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, a as api, s as store, t as translate } from "./router-BpidCmwR.mjs";
import { R as RealTimeMap } from "./RealTimeMap-B4JiaLq8.mjs";
import { a as ArrowLeft, O as Navigation, k as ChevronDown, a5 as Trash2, R as Plus, C as Calendar, f as Bike, a0 as Sparkles, a3 as Tag, j as Check, H as Heart, z as Map, I as MapPin } from "../_libs/lucide-react.mjs";
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
function Book() {
  const {
    language,
    theme,
    womenSafetyMode,
    ride,
    wallet,
    savedAddresses,
    avoidUnlit,
    prioritizeHighways,
    patrolRoutes
  } = useAppStore();
  const navigate = useNavigate();
  const [pickup, setPickup] = reactExports.useState(ride.pickup);
  const [drop, setDrop] = reactExports.useState(ride.drop);
  const [pickupCoords, setPickupCoords] = reactExports.useState(ride.pickupCoords || {
    lat: 13.0382,
    lon: 80.2785
  });
  const [dropCoords, setDropCoords] = reactExports.useState(ride.dropCoords || {
    lat: 13.0402,
    lon: 80.2337
  });
  const [locationError, setLocationError] = reactExports.useState(null);
  const [nearbyDrivers, setNearbyDrivers] = reactExports.useState([]);
  const [stops, setStops] = reactExports.useState([]);
  const [showMultiStop, setShowMultiStop] = reactExports.useState(false);
  const [selectedVehicle, setSelectedVehicle] = reactExports.useState("bike");
  const [distance, setDistance] = reactExports.useState(6.2);
  const [duration, setDuration] = reactExports.useState(15);
  const [estimates, setEstimates] = reactExports.useState(null);
  const [selectedBidTier, setSelectedBidTier] = reactExports.useState("standard");
  const [couponAppliedCode, setCouponAppliedCode] = reactExports.useState("");
  const [couponDiscount, setCouponDiscount] = reactExports.useState(null);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [searchResults, setSearchResults] = reactExports.useState([]);
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const {
        latitude,
        longitude
      } = position.coords;
      const res = await api.reverseGeocode(latitude, longitude);
      if (res && res.address) {
        setPickup(res.address);
        setPickupCoords({
          lat: latitude,
          lon: longitude
        });
        setLocationError(null);
      } else {
        setPickup(`Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        setPickupCoords({
          lat: latitude,
          lon: longitude
        });
        setLocationError(null);
      }
    }, (error) => {
      console.warn("GPS Access Error:", error);
      setLocationError("Please enable location permission or enter pickup location manually.");
    }, {
      enableHighAccuracy: true,
      timeout: 1e4,
      maximumAge: 0
    });
  };
  reactExports.useEffect(() => {
    useCurrentLocation();
  }, []);
  reactExports.useEffect(() => {
    let active = true;
    async function fetchNearby() {
      try {
        const users = await api.getUsers() || [];
        if (!active) return;
        const eligible = users.filter((u) => {
          if (u.role !== "driver") return false;
          if (u.status !== "active" && u.status !== "new") return false;
          if (u.kyc_status !== "VERIFIED") return false;
          if (!u.online && !u.is_online) return false;
          const activeMatch = u.active_vehicle_type ? u.active_vehicle_type === selectedVehicle : true;
          if (!activeMatch) return false;
          const hasMatchingVehicle = u.vehicles && u.vehicles.some((v) => v.vehicle_type === selectedVehicle);
          if (!hasMatchingVehicle) return false;
          return true;
        });
        const mapped = eligible.map((d, idx) => {
          const distInMeters = 300 + d.id * 17 % 2e3;
          const distanceStr = distInMeters >= 1e3 ? `${(distInMeters / 1e3).toFixed(1)}km` : `${distInMeters}m`;
          return {
            ...d,
            distanceVal: distInMeters,
            distanceStr,
            lat: d.current_latitude || 13.0382 + (Math.random() - 0.5) * 0.02,
            lng: d.current_longitude || 80.2785 + (Math.random() - 0.5) * 0.02
          };
        }).sort((a, b) => a.distanceVal - b.distanceVal);
        setNearbyDrivers(mapped);
      } catch (err) {
        console.error("Failed to load nearby drivers:", err);
      }
    }
    fetchNearby();
    const interval = setInterval(fetchNearby, 5e3);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedVehicle]);
  reactExports.useEffect(() => {
    async function loadEstimates() {
      const res = await api.getFareEstimate(pickup, drop, pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon, couponAppliedCode);
      if (res) {
        setDistance(res.distance_km);
        setDuration(res.duration_min);
        setEstimates(res.rates);
        console.log("---- RIDE ESTIMATE DEBUGGING REPORT ----");
        console.log(`Pickup: ${pickup}`);
        console.log(`Drop: ${drop}`);
        console.log(`Route Distance: ${res.distance_km} km`);
        console.log(`Route Duration: ${res.duration_min} mins`);
        console.log(`Surge Multiplier: ${res.surge_multiplier}x`);
        console.log(`Coupon Applied: ${res.coupon_applied || "None"}`);
        console.log("Rates Breakdown:", res.rates);
      }
    }
    loadEstimates();
  }, [pickup, drop, pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon, couponAppliedCode]);
  reactExports.useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      console.log(`[FRONTEND SEARCH REQUEST] Keyword: "${searchQuery}"`);
      const res = await api.searchLocations(searchQuery);
      if (res) {
        console.log(`[FRONTEND SEARCH RESPONSE] Keyword: "${searchQuery}" | Returned: ${res.length} items`);
        setSearchResults(res);
      } else {
        console.log(`[FRONTEND SEARCH RESPONSE] Keyword: "${searchQuery}" | Request failed or returned null`);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);
  const getVehiclePrice = (vKey) => {
    let price = 0;
    let usingFallback = false;
    if (estimates && estimates[vKey]) {
      price = estimates[vKey][selectedBidTier];
    } else {
      const std = vKey === "bike" ? 45 : 82;
      const multiplier = selectedBidTier === "economy" ? 0.92 : selectedBidTier === "priority" ? 1.12 : 1;
      price = Math.round(std * multiplier);
      usingFallback = true;
    }
    if (usingFallback && couponDiscount) {
      const disc = couponDiscount.type === "percentage" ? price * (couponDiscount.value / 100) : couponDiscount.value;
      price = Math.max(vKey === "bike" ? 15 : 25, Math.round(price - disc));
    }
    if (wallet.hasSubscribedPass) {
      if (wallet.passType === "Marina Beach Auto Pass" && vKey === "auto" && distance <= 5) {
        price = 0;
      } else if (wallet.passType === "Chennai Central Commuter" && vKey === "bike") {
        price = Math.max(vKey === "bike" ? 15 : 25, Math.round(price * 0.8));
      }
    }
    return price;
  };
  const baseRate = reactExports.useMemo(() => {
    return getVehiclePrice(selectedVehicle);
  }, [estimates, selectedVehicle, selectedBidTier, couponDiscount, wallet.hasSubscribedPass, wallet.passType, distance]);
  const finalCost = baseRate;
  const [showLandmarks, setShowLandmarks] = reactExports.useState(null);
  const [showSchedule, setShowSchedule] = reactExports.useState(false);
  const [couponCode, setCouponCode] = reactExports.useState("");
  const [showFallbackModal, setShowFallbackModal] = reactExports.useState(false);
  const [schDate, setSchDate] = reactExports.useState(0);
  const [schTime, setSchTime] = reactExports.useState("09:00");
  const [safetyFlowStep, setSafetyFlowStep] = reactExports.useState("none");
  const t = (key) => translate(key, language);
  const proceedConfirmRide = (isWomenSafetyMatch) => {
    let discountAmount = 0;
    if (couponDiscount) {
      let originalPrice = 0;
      if (estimates && estimates[selectedVehicle]) {
        const discountedPrice = estimates[selectedVehicle][selectedBidTier];
        if (couponDiscount.type === "percentage") {
          const pct = couponDiscount.value;
          if (pct < 100) {
            originalPrice = discountedPrice / (1 - pct / 100);
          } else {
            originalPrice = discountedPrice;
          }
        } else {
          originalPrice = discountedPrice + couponDiscount.value;
        }
      } else {
        const std = selectedVehicle === "bike" ? 45 : 82;
        const multiplier = selectedBidTier === "economy" ? 0.92 : selectedBidTier === "priority" ? 1.12 : 1;
        originalPrice = Math.round(std * multiplier);
      }
      discountAmount = couponDiscount.type === "percentage" ? Math.round(originalPrice * (couponDiscount.value / 100)) : couponDiscount.value;
    }
    store.update((s) => {
      s.ride.pickup = pickup;
      s.ride.drop = drop;
      s.ride.pickupCoords = pickupCoords;
      s.ride.dropCoords = dropCoords;
      s.ride.waypoints = stops;
      s.ride.vehicle = selectedVehicle;
      s.ride.basePrice = baseRate;
      s.ride.negotiatedPrice = finalCost;
      s.ride.couponCode = couponAppliedCode;
      s.ride.discount = discountAmount;
      s.ride.surgeApplied = !womenSafetyMode;
    });
    store.startDriverSearch(isWomenSafetyMatch);
    navigate({
      to: "/app/track"
    });
  };
  const handleConfirmRide = () => {
    if (womenSafetyMode) {
      const hasFemaleRider = nearbyDrivers.some((d) => d.gender === "female");
      if (hasFemaleRider) {
        proceedConfirmRide(true);
      } else {
        setSafetyFlowStep("no_female_ask");
      }
    } else {
      proceedConfirmRide(false);
    }
  };
  const handleApplyPromo = async () => {
    const res = await api.validateCoupon(couponCode);
    if (res && res.valid) {
      setCouponAppliedCode(res.code);
      setCouponDiscount({
        type: res.discount_type,
        value: res.value
      });
      setCouponCode("");
    } else {
      alert("Invalid or expired coupon code.");
    }
  };
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
  const handleAddStop = () => {
    setStops([...stops, ""]);
  };
  const handleRemoveStop = (idx) => {
    setStops(stops.filter((_, i) => i !== idx));
  };
  const handleUpdateStop = (idx, val) => {
    const next = [...stops];
    next[idx] = val;
    setStops(next);
  };
  const handleSaveSchedule = () => {
    const days = Array.from({
      length: 7
    }).map((_, i) => {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
    const dateStr = days[schDate].toDateString();
    store.update((s) => {
      s.ride.scheduledTime = `${dateStr} at ${schTime}`;
      s.ride.pickup = pickup;
      s.ride.drop = drop;
    });
    setShowSchedule(false);
    navigate({
      to: "/app/schedule"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-24 text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[300px] overflow-hidden bg-slate-950", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/home", className: "absolute left-4 top-10 z-30 grid size-10 place-items-center rounded-xl border border-white/10 bg-black/60 text-white backdrop-blur-md shadow hover:bg-black/80 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RealTimeMap, { pickupCoords, dropCoords, progress: 0, nearbyDrivers }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: useCurrentLocation, className: "absolute right-4 bottom-10 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md px-3 py-1.5 text-[9px] font-bold text-white shadow shadow-black/25 active:scale-95 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "size-3 text-emerald-400 fill-emerald-400 animate-ping" }),
        " Use Live Location"
      ] }),
      !womenSafetyMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 bottom-10 z-20 flex items-center gap-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 backdrop-blur-md px-2.5 py-1 text-[9px] font-extrabold text-yellow-500", children: "Surge pricing active · 1.2x demand" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mt-6 relative z-30 rounded-t-3xl border border-border bg-background p-5 shadow-2xl transition-colors duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" }),
      locationError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 rounded-xl bg-destructive/15 border border-destructive/25 p-3 text-[10px] text-destructive font-black uppercase text-center animate-pulse", children: [
        "✕ ",
        locationError
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-3 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: t("Pickup") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowLandmarks("pickup"), className: "w-full text-left bg-transparent text-xs font-bold focus:outline-none flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: pickup }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-3.5 text-muted-foreground ml-1" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setShowLandmarks("pickup"),
              className: "text-[10px] font-extrabold text-primary hover:underline",
              children: t("Change")
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" }),
        showMultiStop && stops.map((stop, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pl-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 shrink-0 rounded-full bg-amber-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[8px] font-bold uppercase text-muted-foreground", children: [
                "Middle Stop ",
                idx + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: stop, onChange: (e) => handleUpdateStop(idx, e.target.value), placeholder: "Enter waypoint destination...", className: "w-full bg-transparent text-xs font-semibold outline-none text-foreground/90" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRemoveStop(idx), className: "text-muted-foreground hover:text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3.5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" })
        ] }, idx)),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-3 shrink-0 rounded-full bg-primary ring-4 ring-primary/10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: t("Drop") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowLandmarks("drop"), className: "w-full text-left bg-transparent text-xs font-bold focus:outline-none flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: drop }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-3.5 text-muted-foreground ml-1" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddStop, className: "grid size-7 place-items-center rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition text-muted-foreground shadow-sm", title: "Add multi-stop waypoint", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }) }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2 overflow-x-auto pb-1.5 no-scrollbar font-bold text-[11px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setShowMultiStop(false);
          setStops([]);
        }, className: "shrink-0 rounded-full border border-primary bg-primary/10 text-primary px-3.5 py-1.5 transition", children: t("Now") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowSchedule(true), className: "shrink-0 rounded-full border border-border bg-card text-muted-foreground px-3.5 py-1.5 hover:border-primary/30 transition flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-3" }),
          " ",
          t("Schedule")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowLandmarks("drop"), className: "shrink-0 rounded-full border border-border bg-card text-muted-foreground px-3.5 py-1.5 hover:border-primary/30 transition", children: t("Landmark pickup") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setShowMultiStop(true);
          handleAddStop();
        }, className: "shrink-0 rounded-full border border-border bg-card text-muted-foreground px-3.5 py-1.5 hover:border-primary/30 transition", children: [
          "+ ",
          t("Multi-stop")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 space-y-2.5", children: [{
        key: "bike",
        name: "Bike Option",
        tamil: "பைக் சவாரி",
        icon: Bike,
        eta: `${duration} min`,
        desc: "Fast transit · Avoids highway congestions"
      }, {
        key: "auto",
        name: "Auto Rickshaw",
        tamil: "ஆட்டோ சவாரி",
        icon: null,
        eta: `${duration + 2} min`,
        desc: "Classic Chennai auto · Rain protection ready"
      }].map((v) => {
        const active = selectedVehicle === v.key;
        const displayPrice = getVehiclePrice(v.key);
        const originalPrice = displayPrice + 20;
        const isPassApplied = wallet.hasSubscribedPass && (wallet.passType === "Marina Beach Auto Pass" && v.key === "auto" && distance <= 5 || wallet.passType === "Chennai Central Commuter" && v.key === "bike");
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedVehicle(v.key), className: `flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition duration-200 ${active ? "border-primary bg-primary/10 shadow-md" : "border-border bg-card hover:border-primary/20"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary shadow-sm font-black", children: v.key === "bike" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "size-5.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "A" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-extrabold text-foreground", children: [
              language === "en" ? v.name : v.tamil,
              active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-primary/20 px-1 py-0.5 text-[8px] font-black text-primary", children: "SELECTED" }),
              isPassApplied && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-emerald-500/20 px-1 py-0.5 text-[8px] font-black text-emerald-600", children: "PASS APPLIED" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground leading-normal mt-0.5", children: v.desc }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-muted-foreground/80 mt-0.5", children: [
              "Distance: ",
              distance,
              " km · arrives in ",
              v.eta
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black", children: displayPrice === 0 ? "FREE" : `₹${displayPrice}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-muted-foreground line-through", children: [
              "₹",
              originalPrice
            ] })
          ] })
        ] }, v.key);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-semibold space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5 text-primary animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold text-[11px] uppercase tracking-wider text-muted-foreground", children: "AI Fare Negotiation (Suggestions)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: [{
          tier: "economy",
          label: "Economy",
          desc: "~5m match",
          rate: estimates && estimates[selectedVehicle] ? estimates[selectedVehicle]["economy"] : Math.round(baseRate * 0.92)
        }, {
          tier: "standard",
          label: "Standard",
          desc: "~2m match",
          rate: estimates && estimates[selectedVehicle] ? estimates[selectedVehicle]["standard"] : baseRate
        }, {
          tier: "priority",
          label: "Priority",
          desc: "<30s match",
          rate: estimates && estimates[selectedVehicle] ? estimates[selectedVehicle]["priority"] : Math.round(baseRate * 1.12)
        }].map((offer) => {
          const active = selectedBidTier === offer.tier;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedBidTier(offer.tier), className: `rounded-xl border p-2.5 text-center transition-all duration-200 ${active ? "border-primary bg-primary/10 text-primary font-bold shadow-xs scale-102" : "border-border bg-card hover:border-primary/15 text-muted-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase font-bold tracking-wider", children: offer.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-black mt-1 text-foreground", children: [
              "₹",
              offer.rate
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] mt-0.5 text-muted-foreground/80 font-semibold", children: offer.desc })
          ] }, offer.tier);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-semibold space-y-3 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5", children: "🛡️ Chennai Safety Routing Options" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/safety", className: "text-[10px] text-primary font-bold hover:underline", children: "Manage Safety Kit" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-2 text-center text-[10px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => store.setAvoidUnlit(!avoidUnlit), className: `rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition-all ${avoidUnlit ? "border-emerald-500 bg-emerald-500/10 text-emerald-700" : "border-border bg-card text-muted-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "💡" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Avoid Unlit" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => store.setPrioritizeHighways(!prioritizeHighways), className: `rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition-all ${prioritizeHighways ? "border-orange-500 bg-orange-500/10 text-orange-700" : "border-border bg-card text-muted-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🛣️" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Highways" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => store.setPatrolRoutes(!patrolRoutes), className: `rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition-all ${patrolRoutes ? "border-blue-500 bg-blue-500/10 text-blue-700" : "border-border bg-card text-muted-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "🚓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: "Patrol Overlay" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3 text-xs font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 text-[9px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Apply Coupon" }),
          couponAppliedCode ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl border border-dashed border-emerald-500 bg-emerald-500/5 p-3 text-xs text-emerald-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "size-3 text-emerald-500 animate-bounce" }),
              " ",
              couponAppliedCode
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setCouponAppliedCode("");
              setCouponDiscount(null);
            }, className: "text-[9px] font-black text-muted-foreground", children: "REMOVE" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "WELCOME50", value: couponCode, onChange: (e) => setCouponCode(e.target.value), className: "w-full bg-transparent p-2 text-xs font-bold outline-none uppercase placeholder:text-muted-foreground/60" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleApplyPromo, className: "rounded-lg bg-secondary px-2.5 py-2 text-[10px] font-black text-secondary-foreground", children: "APPLY" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 text-[9px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Payment Method" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/wallet", className: "flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm hover:border-primary/20 transition text-xs text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-secondary px-1 py-0.5 text-[8px] font-black text-secondary-foreground", children: "UPI" }),
              "Pay via Wallet"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-primary", children: [
              "₹",
              wallet.balance.toFixed(0)
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleConfirmRide, className: "mt-5 flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-xs font-extrabold text-primary-foreground shadow-lg shadow-primary/25 hover:brightness-105 active:scale-[0.99] transition duration-150", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 animate-ping" }),
          " ",
          selectedVehicle === "bike" ? t("Confirm Bike") : t("Confirm Auto")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-black", children: [
          "₹",
          finalCost,
          " →"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-center gap-1 text-[9px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "size-3 text-primary animate-pulse" }),
        " ",
        t("Add favourite rider on next trip")
      ] })
    ] }),
    showLandmarks && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-extrabold flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "size-4 text-primary" }),
          " Location Search"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setShowLandmarks(null);
          setSearchQuery("");
        }, className: "text-xs text-muted-foreground font-bold", children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", autoFocus: true, placeholder: "Search streets, areas, IT parks...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full rounded-xl border border-border bg-secondary p-3 text-xs font-bold outline-none focus:border-primary transition" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-1.5 text-xs font-semibold max-h-56 overflow-y-auto no-scrollbar", children: searchResults.length > 0 ? searchResults.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectSearchResult(item), className: "w-full flex items-start gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 text-left transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary mt-0.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-extrabold line-clamp-2 text-foreground/90", children: item.name }) })
      ] }) }, idx)) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 pl-1", children: "Popular Places" }),
        landmarks.map((landmark) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectLandmark(landmark.name, landmark.lat, landmark.lon), className: "w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 text-left transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-extrabold", children: landmark.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-muted-foreground", children: [
              landmark.area,
              " · Chennai"
            ] })
          ] })
        ] }) }, landmark.name))
      ] }) })
    ] }) }),
    showSchedule && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-extrabold", children: "Schedule Future Ride" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowSchedule(false), className: "text-xs text-muted-foreground font-bold", children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto pb-1 no-scrollbar", children: Array.from({
          length: 5
        }).map((_, i) => {
          const d = /* @__PURE__ */ new Date();
          d.setDate(d.getDate() + i);
          const active = schDate === i;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSchDate(i), className: `min-w-[56px] rounded-xl border p-2 text-center transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] uppercase", children: d.toLocaleDateString("en", {
              weekday: "short"
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black mt-0.5", children: d.getDate() })
          ] }, i);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1", children: "Time Slot" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 text-center", children: ["08:30 AM", "10:00 AM", "12:30 PM", "05:00 PM", "06:30 PM", "09:00 PM"].map((tSlot) => {
          const active = schTime === tSlot;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSchTime(tSlot), className: `rounded-xl border py-2 transition ${active ? "border-primary bg-primary/10 text-primary font-extrabold" : "border-border bg-card"}`, children: tSlot }, tSlot);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSaveSchedule, className: "w-full rounded-2xl bg-secondary py-3.5 text-xs font-extrabold text-secondary-foreground shadow", children: "Confirm Schedule Slot" })
    ] }) }),
    safetyFlowStep === "no_female_ask" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between border-b border-border pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-extrabold text-red-500", children: "No Female Captains Nearby" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
        "no female ",
        selectedVehicle === "bike" ? "bike-taxi" : "auto-rickshaw",
        " rider nearly available can you go with women verified badge ",
        selectedVehicle === "bike" ? "bike-taxi" : "auto-rickshaw",
        " riders?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSafetyFlowStep("none"), className: "flex-1 rounded-2xl border border-border bg-card py-3.5 text-xs font-extrabold text-foreground active:scale-95 transition", children: "Cancel ride" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          const hasVerified = nearbyDrivers.some((d) => d.women_safety_verified === true);
          if (hasVerified) {
            setSafetyFlowStep("none");
            proceedConfirmRide(true);
          } else {
            setSafetyFlowStep("no_verified_ask");
          }
        }, className: "flex-1 rounded-2xl bg-primary py-3.5 text-xs font-extrabold text-primary-foreground shadow active:scale-95 transition", children: "Yes" })
      ] })
    ] }) }),
    safetyFlowStep === "no_verified_ask" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between border-b border-border pb-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-extrabold text-red-500", children: "No Verified Riders Nearby" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
        "can you go with any available ",
        selectedVehicle === "bike" ? "bike -taxi" : "auto-rickshaw",
        " riders nearly available?"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSafetyFlowStep("none"), className: "flex-1 rounded-2xl border border-border bg-card py-3.5 text-xs font-extrabold text-foreground active:scale-95 transition", children: "Cancel ride" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          if (nearbyDrivers.length > 0) {
            setSafetyFlowStep("none");
            proceedConfirmRide(false);
          } else {
            alert(`No ${selectedVehicle === "bike" ? "bike-taxis" : "auto-rickshaws"} available nearby at this moment.`);
            setSafetyFlowStep("none");
          }
        }, className: "flex-1 rounded-2xl bg-primary py-3.5 text-xs font-extrabold text-primary-foreground shadow active:scale-95 transition", children: "Yes" })
      ] })
    ] }) })
  ] });
}
export {
  Book as component
};
