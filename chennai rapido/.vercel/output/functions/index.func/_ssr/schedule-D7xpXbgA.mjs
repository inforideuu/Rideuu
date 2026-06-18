import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, a as api, t as translate, s as store } from "./router-BpidCmwR.mjs";
import { j as Check, o as Clock, I as MapPin, a as ArrowLeft, C as Calendar, f as Bike, z as Map, k as ChevronDown, a1 as Star } from "../_libs/lucide-react.mjs";
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
const times = ["06:00 AM", "07:30 AM", "09:00 AM", "10:30 AM", "02:00 PM", "05:30 PM", "07:00 PM", "09:00 PM"];
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
function SchedulePage() {
  const {
    language,
    theme,
    savedAddresses,
    ride,
    profile
  } = useAppStore();
  const navigate = useNavigate();
  const [date, setDate] = reactExports.useState(0);
  const [time, setTime] = reactExports.useState("09:00 AM");
  const [locId, setLocId] = reactExports.useState(savedAddresses[0]?.id || "home");
  const [selectedVehicle, setSelectedVehicle] = reactExports.useState("auto");
  const [confirmed, setConfirmed] = reactExports.useState(false);
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
  const [showLandmarks, setShowLandmarks] = reactExports.useState(null);
  const [searchQuery, setSearchQuery] = reactExports.useState("");
  const [searchResults, setSearchResults] = reactExports.useState([]);
  const [bikePrice, setBikePrice] = reactExports.useState(45);
  const [autoPrice, setAutoPrice] = reactExports.useState(82);
  const [distance, setDistance] = reactExports.useState(6.2);
  const [duration, setDuration] = reactExports.useState(15);
  const [loadingEstimates, setLoadingEstimates] = reactExports.useState(false);
  const t = (key) => translate(key, language);
  const days = Array.from({
    length: 7
  }).map((_, i) => {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  reactExports.useEffect(() => {
    let active = true;
    async function loadEstimates() {
      if (!pickup || !drop) return;
      setLoadingEstimates(true);
      try {
        const res = await api.getFareEstimate(pickup, drop, pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon);
        if (res && active) {
          setDistance(res.distance_km);
          setDuration(res.duration_min);
          if (res.rates) {
            if (res.rates.bike && res.rates.bike.standard) {
              setBikePrice(res.rates.bike.standard);
            }
            if (res.rates.auto && res.rates.auto.standard) {
              setAutoPrice(res.rates.auto.standard);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load fare estimates for scheduling", err);
      } finally {
        if (active) setLoadingEstimates(false);
      }
    }
    loadEstimates();
    return () => {
      active = false;
    };
  }, [pickup, drop, pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon]);
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
  const handleSelectShortcut = (addr) => {
    setLocId(addr.id);
    const fullAddr = addr.label + " · " + addr.address;
    setPickup(fullAddr);
    if (addr.id === "home") {
      setPickupCoords({
        lat: 13.0003,
        lon: 80.2667
      });
    } else if (addr.id === "work") {
      setPickupCoords({
        lat: 12.9895,
        lon: 80.2483
      });
    } else {
      setPickupCoords({
        lat: 13.0063,
        lon: 80.252
      });
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
  const handleConfirmSchedule = async () => {
    const dateStr = days[date].toDateString();
    const isBike = selectedVehicle === "bike";
    const price = isBike ? bikePrice : autoPrice;
    const customerObj = await api.getUserByPhone(profile.phone, "customer", profile.name);
    if (!customerObj) {
      alert("Failed to schedule ride: Customer account verification failed.");
      return;
    }
    const dbRide = await api.createRide({
      customer: customerObj.id,
      pickup,
      pickup_sub: "Chennai",
      dropoff: drop,
      dropoff_sub: "Chennai",
      fare: price,
      distance,
      duration,
      ride_type: "SCHEDULED",
      status: "SCHEDULED",
      scheduled_date: dateStr,
      scheduled_time: time,
      vehicle_type: selectedVehicle
    });
    if (dbRide) {
      store.update((s) => {
        s.ride.scheduledTime = `${dateStr} at ${time}`;
        s.ride.pickup = pickup;
        s.ride.drop = drop;
        s.ride.pickupCoords = pickupCoords;
        s.ride.dropCoords = dropCoords;
        s.ride.vehicle = selectedVehicle;
        s.ride.basePrice = price;
        s.ride.negotiatedPrice = price;
        s.ride.step = "idle";
      });
      store.addNotification({
        cat: "rides",
        title: "Commute Scheduled Successful",
        tamilTitle: "பயணம் திட்டமிடப்பட்டது வெற்றி",
        body: `Your ${selectedVehicle} ride is successfully scheduled for ${dateStr} at ${time}.`,
        tamilBody: `உங்கள் ${selectedVehicle === "bike" ? "பைக்" : "ஆட்டோ"} பயணம் வெற்றிகரமாக ${dateStr} அன்று ${time} மணிக்கு திட்டமிடப்பட்டது.`
      });
      setConfirmed(true);
    } else {
      alert("Failed to schedule ride. Please check connection and try again.");
    }
  };
  const handleBackToTrips = () => {
    setConfirmed(false);
    navigate({
      to: "/app/trips"
    });
  };
  if (confirmed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center animate-fade-in bg-background text-foreground transition-colors duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pulse-ring absolute inset-0 rounded-full bg-primary/20 scale-125" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid size-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/20 animate-scale-in", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-12", strokeWidth: 3.5 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-black tracking-tight text-foreground", children: "Ride Scheduled Successful!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-normal", style: {
          fontFamily: "var(--font-tamil)"
        }, children: "உங்கள் பயணம் வெற்றிகரமாக உறுதி செய்யப்பட்டது" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xs rounded-3xl border border-border bg-card p-5 text-left shadow-sm space-y-3.5 text-xs font-semibold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3.5" }),
            " Departure"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-extrabold text-foreground", children: [
            days[date].toLocaleDateString("en", {
              day: "numeric",
              month: "short"
            }),
            " at ",
            time
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-3.5 text-emerald-500" }),
            " Pickup Location"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-foreground line-clamp-2", children: pickup })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 border-t border-border pt-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-3.5 text-primary" }),
            " Drop Location"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-foreground line-clamp-2", children: drop })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBackToTrips, className: "rounded-2xl bg-secondary px-6 py-4 text-xs font-black text-secondary-foreground shadow active:scale-95 transition", children: "View Scheduled Ride History" })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-24 text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/home", className: "grid size-9 place-items-center rounded-xl bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-extrabold tracking-tight", children: t("Schedule") || "Schedule a Ride" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-semibold", children: "பின்னர் பயணம் செய்ய திட்டமிடுங்கள்" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-4 text-xs font-semibold text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-4 text-primary animate-pulse" }),
          " Select departure date"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar", children: days.map((d, i) => {
          const active = date === i;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setDate(i), className: `min-w-[64px] rounded-2xl border-2 p-3 text-center transition duration-150 ${active ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.01]" : "border-border bg-card hover:border-primary/20"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] uppercase tracking-wider font-bold", children: d.toLocaleDateString("en", {
              weekday: "short"
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-black my-1", children: d.getDate() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] uppercase tracking-wider font-bold opacity-80", children: d.toLocaleDateString("en", {
              month: "short"
            }) })
          ] }, i);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-4 text-primary" }),
          " Select time slot"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2 text-center text-[10px] font-bold", children: times.map((tSlot) => {
          const active = time === tSlot;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTime(tSlot), className: `rounded-xl border py-2.5 transition duration-150 ${active ? "border-secondary bg-secondary text-secondary-foreground font-black shadow-sm" : "border-border bg-card hover:border-primary/25"}`, children: tSlot }, tSlot);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-2.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "size-4 text-primary animate-pulse" }),
          " Select vehicle type"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-center text-xs font-extrabold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedVehicle("bike"), className: `rounded-2xl border p-4 flex flex-col items-center justify-center gap-1.5 transition ${selectedVehicle === "bike" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-card"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "size-5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Bike" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: loadingEstimates ? "Calculating..." : `₹${bikePrice}` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setSelectedVehicle("auto"), className: `rounded-2xl border p-4 flex flex-col items-center justify-center gap-1.5 transition ${selectedVehicle === "auto" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-card"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-black leading-none", children: "A" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Auto Rickshaw" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: loadingEstimates ? "Calculating..." : `₹${autoPrice}` })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Map, { className: "size-4 text-primary animate-pulse" }),
          " Custom Route Details"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-3 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: t("Pickup") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowLandmarks("pickup"), className: "w-full text-left bg-transparent text-xs font-bold focus:outline-none flex justify-between items-center text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: pickup }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-3.5 text-muted-foreground ml-1" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowLandmarks("pickup"), className: "text-[10px] font-extrabold text-primary hover:underline", children: t("Change") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-3 shrink-0 rounded-full bg-primary ring-4 ring-primary/10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: t("Drop") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowLandmarks("drop"), className: "w-full text-left bg-transparent text-xs font-bold focus:outline-none flex justify-between items-center text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "line-clamp-1", children: drop }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "size-3.5 text-muted-foreground ml-1" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowLandmarks("drop"), className: "text-[10px] font-extrabold text-primary hover:underline", children: t("Change") })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4 text-primary" }),
          " Select pickup address shortcut"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 font-semibold", children: savedAddresses.map((l) => {
          const active = locId === l.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectShortcut(l), className: `flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-10 place-items-center rounded-xl bg-secondary text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs font-extrabold text-foreground", children: [
                l.label,
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", style: {
                  fontFamily: "var(--font-tamil)"
                }, children: l.tamilLabel })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground leading-normal mt-0.5 line-clamp-1", children: l.address })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid size-5 place-items-center rounded-full border-2 transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`, children: active && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5", strokeWidth: 3.5 }) })
          ] }, l.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "size-4 text-primary animate-bounce" }),
            " Chennai Rider Density"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[9px] font-black text-emerald-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 animate-pulse rounded-full bg-emerald-500" }),
            " HIGH DENSITY"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex -space-x-2.5", children: [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-8 place-items-center rounded-full border border-card bg-primary text-[10px] font-black text-primary-foreground", children: i }, i)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground leading-relaxed", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-foreground", children: "12+ drivers ready" }),
            " within 2km in Besant Nagar.",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 mt-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-3 fill-primary text-primary" }),
              " 4.8 avg rating verified"
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleConfirmSchedule, className: "w-full rounded-2xl bg-secondary py-4 text-center text-xs font-black text-secondary-foreground shadow-xl active:scale-[0.99] transition", children: [
      "Confirm Schedule (₹",
      selectedVehicle === "bike" ? bikePrice : autoPrice,
      ") · ",
      days[date].toLocaleDateString("en", {
        day: "numeric",
        month: "short"
      }),
      " at ",
      time
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
  SchedulePage as component
};
