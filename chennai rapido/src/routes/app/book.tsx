import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, Bike, Calendar, Heart, MapPin, Plus, Tag, ShieldCheck,
  Map, Sparkles, Navigation, Clock, Check, ChevronDown, Trash2
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAppStore, store, translate } from "@/lib/store";
import { api } from "../../lib/api";
import { RealTimeMap } from "../../components/RealTimeMap";

export const Route = createFileRoute("/app/book")({
  head: () => ({ meta: [{ title: "Book a ride · Rideuu" }] }),
  component: Book,
});

const landmarks = [
  { name: "Marina Beach (Behind Lighthouse)", area: "Mylapore", lat: 13.0382, lon: 80.2785 },
  { name: "Central Station (Near Gate 3)", area: "Park Town", lat: 13.0827, lon: 80.2707 },
  { name: "Pondy Bazaar (Near Saravana Stores)", area: "T. Nagar", lat: 13.0402, lon: 80.2337 },
  { name: "Tidel Park (Phase 1 Main entrance)", area: "Taramani", lat: 12.9895, lon: 80.2483 },
  { name: "Adyar Signal (Near flyover pillar 12)", area: "Adyar", lat: 13.0063, lon: 80.2520 },
];

function Book() {
  const { language, theme, womenSafetyMode, ride, wallet, savedAddresses, avoidUnlit, prioritizeHighways, patrolRoutes } = useAppStore();
  const petFriendly = ride.petFriendly || false;
  const navigate = useNavigate();

  // Local navigation/input states
  const [pickup, setPickup] = useState(ride.pickup);
  const [drop, setDrop] = useState(ride.drop);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lon: number }>(ride.pickupCoords || { lat: 13.0382, lon: 80.2785 });
  const [dropCoords, setDropCoords] = useState<{ lat: number; lon: number }>(ride.dropCoords || { lat: 13.0402, lon: 80.2337 });
  const [locationError, setLocationError] = useState<string | null>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [stops, setStops] = useState<string[]>([]);
  const [showMultiStop, setShowMultiStop] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<"bike" | "auto">("bike");

  // Dynamic Route & Fare Estimates from Django
  const [distance, setDistance] = useState(6.2);
  const [duration, setDuration] = useState(15);
  const [estimates, setEstimates] = useState<any>(null);
  const [selectedBidTier, setSelectedBidTier] = useState<"economy" | "standard" | "priority">("standard");
  const [couponAppliedCode, setCouponAppliedCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState<{ type: string, value: number } | null>(null);

  // Autocomplete Geocoding state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const isChennai = latitude >= 12.8 && latitude <= 13.2 && longitude >= 80.0 && longitude <= 80.3;
        const lat = isChennai ? latitude : 13.0382;
        const lon = isChennai ? longitude : 80.2785;
        const res = await api.reverseGeocode(lat, lon);
        if (res && res.address) {
          setPickup(res.address);
          setPickupCoords({ lat, lon });
          setLocationError(null);
        } else {
          setPickup(isChennai ? `Current Location (${lat.toFixed(4)}, ${lon.toFixed(4)})` : "Marina Beach Lighthouse");
          setPickupCoords({ lat, lon });
          setLocationError(null);
        }
      },
      (error) => {
        console.warn("GPS Access Error:", error);
        // Fallback directly to Chennai default coordinates if error/blocked
        setPickupCoords({ lat: 13.0382, lon: 80.2785 });
        setLocationError("Please enable location permission or enter pickup location manually.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Mount effect to request location permission
  useEffect(() => {
    useCurrentLocation();
  }, []);

  // Poll/fetch nearby drivers from database
  useEffect(() => {
    let active = true;
    async function fetchNearby() {
      try {
        const users = await api.getUsers() || [];
        if (!active) return;
        const eligible = users.filter((u: any) => {
          if (u.role !== "driver") return false;
          if (u.status !== "active" && u.status !== "new") return false;
          if (u.kyc_status !== "VERIFIED") return false;
          if (!u.online && !u.is_online) return false;
          const activeMatch = u.active_vehicle_type ? (u.active_vehicle_type === selectedVehicle) : true;
          if (!activeMatch) return false;
          const hasMatchingVehicle = u.vehicles && u.vehicles.some((v: any) => v.vehicle_type === selectedVehicle);
          if (!hasMatchingVehicle) return false;
          return true;
        });
        const mapped = eligible.map((d: any, idx: number) => {
          const distInMeters = 300 + ((d.id * 17) % 2000);
          const distanceStr = distInMeters >= 1000 ? `${(distInMeters / 1000).toFixed(1)}km` : `${distInMeters}m`;
          return {
            ...d,
            distanceVal: distInMeters,
            distanceStr,
            lat: d.current_latitude || (13.0382 + (Math.random() - 0.5) * 0.02),
            lng: d.current_longitude || (80.2785 + (Math.random() - 0.5) * 0.02)
          };
        }).sort((a: any, b: any) => a.distanceVal - b.distanceVal);
        setNearbyDrivers(mapped);
      } catch (err) {
        console.error("Failed to load nearby drivers:", err);
      }
    }
    fetchNearby();
    const interval = setInterval(fetchNearby, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedVehicle]);

  // Fetch estimates when pickup, drop or coupon changes
  useEffect(() => {
    async function loadEstimates() {
      const res = await api.getFareEstimate(
        pickup,
        drop,
        pickupCoords.lat,
        pickupCoords.lon,
        dropCoords.lat,
        dropCoords.lon,
        couponAppliedCode
      );
      if (res) {
        const displayDistance = res.distance_km > 50 ? 6.2 : res.distance_km;
        setDistance(displayDistance);
        setDuration(res.duration_min > 300 ? 15 : res.duration_min);
        setEstimates(res.rates);

        // Debugging report logging in console for Issue 5 visibility
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

  // Autocomplete search trigger
  useEffect(() => {
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
    }, 500); // debounce input
    return () => clearTimeout(timeout);
  }, [searchQuery]);
  const getVehiclePrice = (vKey: "bike" | "auto") => {
    let price = 0;
    let usingFallback = false;
    if (estimates && estimates[vKey]) {
      price = estimates[vKey][selectedBidTier];
    } else {
      const std = vKey === "bike" ? 45 : 82;
      const multiplier = selectedBidTier === "economy" ? 0.92 : selectedBidTier === "priority" ? 1.12 : 1.0;
      price = Math.round(std * multiplier);
      usingFallback = true;
    }
    if (usingFallback && couponDiscount) {
      const disc = couponDiscount.type === "percentage" ? (price * (couponDiscount.value / 100)) : couponDiscount.value;
      price = Math.max(vKey === "bike" ? 15 : 25, Math.round(price - disc));
    }
    // Apply Subscription Pass
    if (wallet.hasSubscribedPass) {
      if (wallet.passType === "Marina Beach Auto Pass" && vKey === "auto" && distance <= 5) {
        price = 0;
      } else if (wallet.passType === "Chennai Central Commuter" && vKey === "bike") {
        price = Math.max(vKey === "bike" ? 15 : 25, Math.round(price * 0.8));
      }
    }
    if (petFriendly) {
      const petFee = distance <= 10 ? 50 : 70;
      price += petFee;
    }
    return price;
  };

  const baseRate = useMemo(() => {
    return getVehiclePrice(selectedVehicle);
  }, [estimates, selectedVehicle, selectedBidTier, couponDiscount, wallet.hasSubscribedPass, wallet.passType, distance, petFriendly]);

  const finalCost = baseRate;

  // Modal toggles
  const [showLandmarks, setShowLandmarks] = useState<"pickup" | "drop" | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [showFallbackModal, setShowFallbackModal] = useState(false);

  // Scheduled date/time
  const [schDate, setSchDate] = useState(0);
  const [schTime, setSchTime] = useState("09:00");
  const [safetyFlowStep, setSafetyFlowStep] = useState<"none" | "no_female_ask" | "no_verified_ask">("none");

  const t = (key: string) => translate(key, language);

  const proceedConfirmRide = (isWomenSafetyMatch: boolean) => {
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
        const multiplier = selectedBidTier === "economy" ? 0.92 : selectedBidTier === "priority" ? 1.12 : 1.0;
        originalPrice = Math.round(std * multiplier);
      }
      discountAmount = couponDiscount.type === "percentage"
        ? Math.round(originalPrice * (couponDiscount.value / 100))
        : couponDiscount.value;
    }

    // Save state to store
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
      s.ride.petFriendly = petFriendly;
    });

    // Start automated search & match trigger
    store.startDriverSearch(isWomenSafetyMatch);
    navigate({ to: "/app/track" });
  };

  const handleConfirmRide = () => {
    if (womenSafetyMode) {
      const hasFemaleRider = nearbyDrivers.some(d => d.gender === "female");
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
      setCouponDiscount({ type: res.discount_type, value: res.value });
      setCouponCode("");
    } else {
      alert("Invalid or expired coupon code.");
    }
  };

  const handleSelectLandmark = (name: string, lat?: number, lon?: number) => {
    if (showLandmarks === "pickup") {
      setPickup(name);
      if (lat && lon) setPickupCoords({ lat, lon });
    } else if (showLandmarks === "drop") {
      setDrop(name);
      if (lat && lon) setDropCoords({ lat, lon });
    }
    setShowLandmarks(null);
    setSearchQuery("");
  };

  const handleSelectSearchResult = async (item: any) => {
    const details = await api.getPlaceDetails(item.place_id);
    if (details) {
      if (showLandmarks === "pickup") {
        setPickup(details.formatted_address);
        setPickupCoords({ lat: details.latitude, lon: details.longitude });
      } else if (showLandmarks === "drop") {
        setDrop(details.formatted_address);
        setDropCoords({ lat: details.latitude, lon: details.longitude });
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

  const handleRemoveStop = (idx: number) => {
    setStops(stops.filter((_, i) => i !== idx));
  };

  const handleUpdateStop = (idx: number, val: string) => {
    const next = [...stops];
    next[idx] = val;
    setStops(next);
  };

  const handleSaveSchedule = () => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
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
    navigate({ to: "/app/schedule" });
  };

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">

      {/* 1. Chennai Interactive Glowing SVG Vector Map */}
      <div className="relative h-[300px] overflow-hidden bg-slate-950">
        <Link
          to="/app/home"
          className="absolute left-4 top-10 z-30 grid size-10 place-items-center rounded-xl border border-white/10 bg-black/60 text-white backdrop-blur-md shadow hover:bg-black/80 transition"
        >
          <ArrowLeft className="size-4" />
        </Link>

        {/* Interactive Leaflet Map */}
        <RealTimeMap
          pickupCoords={pickupCoords}
          dropCoords={dropCoords}
          progress={0}
          nearbyDrivers={nearbyDrivers}
        />

        {/* Floating live location detector mock */}
        <button
          onClick={useCurrentLocation}
          className="absolute right-4 bottom-10 z-20 flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md px-3 py-1.5 text-[9px] font-bold text-white shadow shadow-black/25 active:scale-95 transition"
        >
          <Navigation className="size-3 text-emerald-400 fill-emerald-400 animate-ping" /> Use Live Location
        </button>

        {/* Dynamic Warning Card */}
        {!womenSafetyMode && (
          <div className="absolute left-4 bottom-10 z-20 flex items-center gap-1.5 rounded-lg border border-yellow-500/20 bg-yellow-500/10 backdrop-blur-md px-2.5 py-1 text-[9px] font-extrabold text-yellow-500">
            Surge pricing active · 1.2x demand
          </div>
        )}
      </div>

      {/* 2. Destination Input Drawer Panel */}
      <div className={`-mt-6 relative z-30 rounded-t-3xl border border-border p-5 shadow-2xl transition-all duration-300 ${
        petFriendly
          ? "bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-yellow-600/10"
          : "bg-background"
      }`}>
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" />

        {locationError && (
          <div className="mb-4 rounded-xl bg-destructive/15 border border-destructive/25 p-3 text-[10px] text-destructive font-black uppercase text-center animate-pulse">
            ✕ {locationError}
          </div>
        )}

        {/* Pickup & Drop addresses */}
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">

          {/* Pickup Selection */}
          <div className="flex items-center gap-3">
            <div className="size-3 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
            <div className="flex-1 text-left">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t("Pickup")}</div>
              <button
                onClick={() => setShowLandmarks("pickup")}
                className="w-full text-left bg-transparent text-xs font-bold focus:outline-none flex justify-between items-center"
              >
                <span className="line-clamp-1">{pickup}</span>
                <ChevronDown className="size-3.5 text-muted-foreground ml-1" />
              </button>
            </div>
            <button
              onClick={() => setShowLandmarks("pickup")} // Changing placeholder value name internally for consistency
              className="text-[10px] font-extrabold text-primary hover:underline"
            >
              {t("Change")}
            </button>
          </div>

          <div className="h-px bg-border" />

          {/* Dynamic Stops (Multi-stops) */}
          {showMultiStop && stops.map((stop, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-3 pl-1">
                <div className="size-2 shrink-0 rounded-full bg-amber-500" />
                <div className="flex-1">
                  <div className="text-[8px] font-bold uppercase text-muted-foreground">Middle Stop {idx + 1}</div>
                  <input
                    value={stop}
                    onChange={(e) => handleUpdateStop(idx, e.target.value)}
                    placeholder="Enter waypoint destination..."
                    className="w-full bg-transparent text-xs font-semibold outline-none text-foreground/90"
                  />
                </div>
                <button
                  onClick={() => handleRemoveStop(idx)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
              <div className="h-px bg-border" />
            </div>
          ))}

          {/* Drop Selection */}
          <div className="flex items-center gap-3">
            <div className="size-3 shrink-0 rounded-full bg-primary ring-4 ring-primary/10" />
            <div className="flex-1 text-left">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t("Drop")}</div>
              <button
                onClick={() => setShowLandmarks("drop")}
                className="w-full text-left bg-transparent text-xs font-bold focus:outline-none flex justify-between items-center"
              >
                <span className="line-clamp-1">{drop}</span>
                <ChevronDown className="size-3.5 text-muted-foreground ml-1" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleAddStop}
                className="grid size-7 place-items-center rounded-xl bg-muted hover:bg-primary/10 hover:text-primary transition text-muted-foreground shadow-sm"
                title="Add multi-stop waypoint"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Pet Friendly Toggle Widget */}
        <div className={`mt-3 flex items-center justify-between rounded-2xl border p-4 shadow-sm transition-all duration-300 ${
          petFriendly 
            ? "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100" 
            : "border-border bg-card text-foreground"
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-xl">🐾</span>
            <div className="text-left">
              <div className="text-xs font-bold flex items-center gap-1.5">
                Pet Friendly Ride
                {petFriendly && (
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[8px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider animate-pulse">
                    Active
                  </span>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground leading-normal mt-0.5">
                Bring your furry companion. Extra charge: {distance <= 10 ? "₹50" : "₹70"} (100% goes to Captain)
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              store.update((s) => {
                s.ride.petFriendly = !petFriendly;
              });
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              petFriendly ? "bg-amber-500" : "bg-muted"
            }`}
          >
            <span
              className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                petFriendly ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Direct Action triggers (Now, Schedule, Landmark modes) */}
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1.5 no-scrollbar font-bold text-[11px]">
          <button
            onClick={() => { setShowMultiStop(false); setStops([]); }}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 transition ${
              petFriendly
                ? "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                : "border-primary bg-primary/10 text-primary"
            }`}
          >
            {t("Now")}
          </button>
          <button
            onClick={() => setShowSchedule(true)}
            className="shrink-0 rounded-full border border-border bg-card text-muted-foreground px-3.5 py-1.5 hover:border-primary/30 transition flex items-center gap-1"
          >
            <Calendar className="size-3" /> {t("Schedule")}
          </button>
          <button
            onClick={() => setShowLandmarks("drop")}
            className="shrink-0 rounded-full border border-border bg-card text-muted-foreground px-3.5 py-1.5 hover:border-primary/30 transition"
          >
            {t("Landmark pickup")}
          </button>
          <button
            onClick={() => { setShowMultiStop(true); handleAddStop(); }}
            className="shrink-0 rounded-full border border-border bg-card text-muted-foreground px-3.5 py-1.5 hover:border-primary/30 transition"
          >
            + {t("Multi-stop")}
          </button>
        </div>

        {/* 3. Vehicle Comparer Widget */}
        <div className="mt-5 space-y-2.5">
          {[
            { key: "bike" as const, name: "Bike Option", tamil: "பைக் சவாரி", icon: Bike, eta: `${duration} min`, desc: "Fast transit · Avoids highway congestions" },
            { key: "auto" as const, name: "Auto Rickshaw", tamil: "ஆட்டோ சவாரி", icon: null, eta: `${duration + 2} min`, desc: "Classic Chennai auto · Rain protection ready" },
          ].map((v) => {
            const active = selectedVehicle === v.key;
            const displayPrice = getVehiclePrice(v.key);
            const originalPrice = displayPrice + 20;

            const isPassApplied = wallet.hasSubscribedPass && (
              (wallet.passType === "Marina Beach Auto Pass" && v.key === "auto" && distance <= 5) ||
              (wallet.passType === "Chennai Central Commuter" && v.key === "bike")
            );

            return (
              <button
                key={v.key}
                onClick={() => setSelectedVehicle(v.key)}
                className={`flex w-full items-center gap-4 rounded-2xl border-2 p-3 text-left transition duration-200 ${active ? "border-primary bg-primary/10 shadow-md" : "border-border bg-card hover:border-primary/20"}`}
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-secondary text-primary shadow-sm font-black">
                  {v.key === "bike" ? <Bike className="size-5.5" /> : <span className="text-sm">A</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">
                    {language === "en" ? v.name : v.tamil}
                    {active && <span className="rounded bg-primary/20 px-1 py-0.5 text-[8px] font-black text-primary">SELECTED</span>}
                    {isPassApplied && <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-[8px] font-black text-emerald-600">PASS APPLIED</span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground leading-normal mt-0.5">{v.desc}</div>
                  <div className="text-[9px] text-muted-foreground/80 mt-0.5">Distance: {distance} km · arrives in {v.eta}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-black">{displayPrice === 0 ? "FREE" : `₹${displayPrice}`}</div>
                  <div className="text-[9px] text-muted-foreground line-through">₹{originalPrice}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* 4. AI Fare Negotiation Selection Cards */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-semibold space-y-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary animate-pulse" />
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-muted-foreground">AI Fare Negotiation (Suggestions)</h3>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { tier: "economy" as const, label: "Economy", desc: "~5m match", rate: estimates && estimates[selectedVehicle] ? estimates[selectedVehicle]["economy"] : Math.round(baseRate * 0.92) },
              { tier: "standard" as const, label: "Standard", desc: "~2m match", rate: estimates && estimates[selectedVehicle] ? estimates[selectedVehicle]["standard"] : baseRate },
              { tier: "priority" as const, label: "Priority", desc: "<30s match", rate: estimates && estimates[selectedVehicle] ? estimates[selectedVehicle]["priority"] : Math.round(baseRate * 1.12) }
            ].map((offer) => {
              const active = selectedBidTier === offer.tier;
              return (
                <button
                  key={offer.tier}
                  onClick={() => setSelectedBidTier(offer.tier)}
                  className={`rounded-xl border p-2.5 text-center transition-all duration-200 ${active ? "border-primary bg-primary/10 text-primary font-bold shadow-xs scale-102" : "border-border bg-card hover:border-primary/15 text-muted-foreground"}`}
                >
                  <div className="text-[9px] uppercase font-bold tracking-wider">{offer.label}</div>
                  <div className="text-sm font-black mt-1 text-foreground">₹{offer.rate}</div>
                  <div className="text-[8px] mt-0.5 text-muted-foreground/80 font-semibold">{offer.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chennai Safety Routing Controls */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-semibold space-y-3 text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              🛡️ Chennai Safety Routing Options
            </h3>
            <Link to="/app/safety" className="text-[10px] text-primary font-bold hover:underline">
              Manage Safety Kit
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <button
              onClick={() => store.setAvoidUnlit(!avoidUnlit)}
              className={`rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition-all ${avoidUnlit ? "border-emerald-500 bg-emerald-500/10 text-emerald-700" : "border-border bg-card text-muted-foreground"}`}
            >
              <span>💡</span>
              <span className="font-bold">Avoid Unlit</span>
            </button>

            <button
              onClick={() => store.setPrioritizeHighways(!prioritizeHighways)}
              className={`rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition-all ${prioritizeHighways ? "border-orange-500 bg-orange-500/10 text-orange-700" : "border-border bg-card text-muted-foreground"}`}
            >
              <span>🛣️</span>
              <span className="font-bold">Highways</span>
            </button>

            <button
              onClick={() => store.setPatrolRoutes(!patrolRoutes)}
              className={`rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition-all ${patrolRoutes ? "border-blue-500 bg-blue-500/10 text-blue-700" : "border-border bg-card text-muted-foreground"}`}
            >
              <span>🚓</span>
              <span className="font-bold">Patrol Overlay</span>
            </button>
          </div>
        </div>

        {/* 5. Razorpay Payments and Coupons */}
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-bold">
          {/* Coupon */}
          <div className="flex flex-col gap-1 text-[9px] text-muted-foreground">
            <span>Apply Coupon</span>
            {couponAppliedCode ? (
              <div className="flex items-center justify-between rounded-xl border border-dashed border-emerald-500 bg-emerald-500/5 p-3 text-xs text-emerald-600">
                <span className="flex items-center gap-1"><Tag className="size-3 text-emerald-500 animate-bounce" /> {couponAppliedCode}</span>
                <button onClick={() => { setCouponAppliedCode(""); setCouponDiscount(null); }} className="text-[9px] font-black text-muted-foreground">REMOVE</button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card p-1 shadow-sm">
                <input
                  type="text"
                  placeholder="WELCOME50"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full bg-transparent p-2 text-xs font-bold outline-none uppercase placeholder:text-muted-foreground/60"
                />
                <button
                  onClick={handleApplyPromo}
                  className="rounded-lg bg-secondary px-2.5 py-2 text-[10px] font-black text-secondary-foreground"
                >
                  APPLY
                </button>
              </div>
            )}
          </div>

          {/* Payment gateway */}
          <div className="flex flex-col gap-1 text-[9px] text-muted-foreground">
            <span>Payment Method</span>
            <Link to="/app/wallet" className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm hover:border-primary/20 transition text-xs text-foreground">
              <span className="flex items-center gap-1.5">
                <span className="rounded bg-secondary px-1 py-0.5 text-[8px] font-black text-secondary-foreground">UPI</span>
                Pay via Wallet
              </span>
              <span className="text-[10px] text-primary">₹{wallet.balance.toFixed(0)}</span>
            </Link>
          </div>
        </div>

        {/* Confirm Book Trigger */}
        <button
          onClick={handleConfirmRide}
          className={`mt-5 flex w-full items-center justify-between rounded-2xl px-5 py-4 text-xs font-extrabold text-primary-foreground shadow-lg transition duration-150 active:scale-[0.99] ${
            petFriendly
              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105 shadow-amber-500/25"
              : "bg-primary shadow-primary/25 hover:brightness-105"
          }`}
        >
          <span className="flex items-center gap-2">
            {petFriendly ? (
              <span className="text-sm animate-bounce">🐾</span>
            ) : (
              <Check className="size-4 animate-ping" />
            )}
            {selectedVehicle === "bike" ? t("Confirm Bike") : t("Confirm Auto")}
          </span>
          <span className="text-sm font-black">₹{finalCost} →</span>
        </button>

        <div className="mt-4 flex items-center justify-center gap-1 text-[9px] text-muted-foreground">
          <Heart className="size-3 text-primary animate-pulse" /> {t("Add favourite rider on next trip")}
        </div>
      </div>

      {/* 6. Chennai Landmarks Modal Selection Popup */}
      {showLandmarks && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-extrabold flex items-center gap-1.5">
                <Map className="size-4 text-primary" /> Location Search
              </h2>
              <button
                onClick={() => { setShowLandmarks(null); setSearchQuery(""); }}
                className="text-xs text-muted-foreground font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="Search streets, areas, IT parks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary p-3 text-xs font-bold outline-none focus:border-primary transition"
              />
            </div>

            <ul className="space-y-1.5 text-xs font-semibold max-h-56 overflow-y-auto no-scrollbar">
              {searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => handleSelectSearchResult(item)}
                      className="w-full flex items-start gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 text-left transition"
                    >
                      <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary mt-0.5">
                        <MapPin className="size-4" />
                      </div>
                      <div>
                        <div className="font-extrabold line-clamp-2 text-foreground/90">{item.name}</div>
                      </div>
                    </button>
                  </li>
                ))
              ) : (
                <>
                  <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2 pl-1">Popular Places</div>
                  {landmarks.map((landmark) => (
                    <li key={landmark.name}>
                      <button
                        onClick={() => handleSelectLandmark(landmark.name, landmark.lat, landmark.lon)}
                        className="w-full flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 text-left transition"
                      >
                        <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <MapPin className="size-4" />
                        </div>
                        <div>
                          <div className="font-extrabold">{landmark.name}</div>
                          <div className="text-[9px] text-muted-foreground">{landmark.area} · Chennai</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>
        </div>
      )}

      {/* 7. Ride Scheduling Dialog popup */}
      {showSchedule && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-extrabold">Schedule Future Ride</h2>
              <button onClick={() => setShowSchedule(false)} className="text-xs text-muted-foreground font-bold">Cancel</button>
            </div>

            {/* Days picker */}
            <div>
              <div className="mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Date</div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {Array.from({ length: 5 }).map((_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() + i);
                  const active = schDate === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setSchDate(i)}
                      className={`min-w-[56px] rounded-xl border p-2 text-center transition ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}
                    >
                      <div className="text-[8px] uppercase">{d.toLocaleDateString("en", { weekday: "short" })}</div>
                      <div className="text-sm font-black mt-0.5">{d.getDate()}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <div className="mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Time Slot</div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {["08:30 AM", "10:00 AM", "12:30 PM", "05:00 PM", "06:30 PM", "09:00 PM"].map((tSlot) => {
                  const active = schTime === tSlot;
                  return (
                    <button
                      key={tSlot}
                      onClick={() => setSchTime(tSlot)}
                      className={`rounded-xl border py-2 transition ${active ? "border-primary bg-primary/10 text-primary font-extrabold" : "border-border bg-card"}`}
                    >
                      {tSlot}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSaveSchedule}
              className="w-full rounded-2xl bg-secondary py-3.5 text-xs font-extrabold text-secondary-foreground shadow"
            >
              Confirm Schedule Slot
            </button>
          </div>
        </div>
      )}

      {/* Step 1 Fallback: No Female Captains Available */}
      {safetyFlowStep === "no_female_ask" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-extrabold text-red-500">No Female Captains Nearby</h2>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              no female {selectedVehicle === "bike" ? "bike-taxi" : "auto-rickshaw"} rider nearly available can you go with women verified badge {selectedVehicle === "bike" ? "bike-taxi" : "auto-rickshaw"} riders?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSafetyFlowStep("none")}
                className="flex-1 rounded-2xl border border-border bg-card py-3.5 text-xs font-extrabold text-foreground active:scale-95 transition"
              >
                Cancel ride
              </button>
              <button
                onClick={() => {
                  const hasVerified = nearbyDrivers.some(d => d.women_safety_verified === true);
                  if (hasVerified) {
                    setSafetyFlowStep("none");
                    proceedConfirmRide(true);
                  } else {
                    setSafetyFlowStep("no_verified_ask");
                  }
                }}
                className="flex-1 rounded-2xl bg-primary py-3.5 text-xs font-extrabold text-primary-foreground shadow active:scale-95 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2 Fallback: No Women Safe Verified Captains Available */}
      {safetyFlowStep === "no_verified_ask" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in text-xs font-semibold">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-extrabold text-red-500">No Verified Riders Nearby</h2>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              can you go with any available {selectedVehicle === "bike" ? "bike -taxi" : "auto-rickshaw"} riders nearly available?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSafetyFlowStep("none")}
                className="flex-1 rounded-2xl border border-border bg-card py-3.5 text-xs font-extrabold text-foreground active:scale-95 transition"
              >
                Cancel ride
              </button>
              <button
                onClick={() => {
                  if (nearbyDrivers.length > 0) {
                    setSafetyFlowStep("none");
                    proceedConfirmRide(false);
                  } else {
                    alert(`No ${selectedVehicle === "bike" ? "bike-taxis" : "auto-rickshaws"} available nearby at this moment.`);
                    setSafetyFlowStep("none");
                  }
                }}
                className="flex-1 rounded-2xl bg-primary py-3.5 text-xs font-extrabold text-primary-foreground shadow active:scale-95 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}