import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, Bike, Car, Zap, Moon, TicketPercent, Sparkles, MapPin, Clock, Check, HelpCircle, Map } from "lucide-react";
import { useAppStore, store, translate } from "@/lib/store";
import { api } from "../../lib/api";

export const Route = createFileRoute("/app/fare")({
  component: FarePage,
});

type Vehicle = { id: string; name: string; tamil: string; icon: typeof Bike; eta: string; base: number; perKm: number };

const vehicles: Vehicle[] = [
  { id: "bike", name: "Bike Option", tamil: "பைக் சவாரி", icon: Bike, eta: "2 min", base: 25, perKm: 8 },
  { id: "auto", name: "Auto Rickshaw", tamil: "ஆட்டோ சவாரி", icon: Car, eta: "4 min", base: 40, perKm: 14 },
];

const coupons = [
  { code: "CHENNAI50", label: "50% off first ride · max ₹75", value: 0.5, cap: 75 },
  { code: "RAINY20", label: "Flat ₹30 monsoon discount", value: 30, cap: 0 },
];

const landmarks = [
  { name: "Marina Beach (Behind Lighthouse)", area: "Mylapore", lat: 13.0382, lon: 80.2785 },
  { name: "Central Station (Near Gate 3)", area: "Park Town", lat: 13.0827, lon: 80.2707 },
  { name: "Pondy Bazaar (Near Saravana Stores)", area: "T. Nagar", lat: 13.0402, lon: 80.2337 },
  { name: "Tidel Park (Phase 1 Main entrance)", area: "Taramani", lat: 12.9895, lon: 80.2483 },
  { name: "Adyar Signal (Near flyover pillar 12)", area: "Adyar", lat: 13.0063, lon: 80.2520 },
];

function FarePage() {
  const { language, theme, ride, womenSafetyMode } = useAppStore();
  const navigate = useNavigate();

  const [veh, setVeh] = useState<string>("auto");
  const [surge, setSurge] = useState(!womenSafetyMode);
  const [night, setNight] = useState(false);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<typeof coupons[number] | null>(
    ride.couponCode === "CHENNAI50" ? coupons[0] : null
  );

  const t = (key: string) => translate(key, language);

  const [pickup, setPickup] = useState(ride.pickup || "Marina Beach Gate 2");
  const [drop, setDrop] = useState(ride.drop || "T. Nagar Pondy Bazaar");
  const [pickupCoords, setPickupCoords] = useState(ride.pickupCoords || { lat: 13.0382, lon: 80.2785 });
  const [dropCoords, setDropCoords] = useState(ride.dropCoords || { lat: 13.0402, lon: 80.2337 });
  const [distance, setDistance] = useState(6.2);
  const [minutes, setMinutes] = useState(18);
  const [toll, setToll] = useState(15);

  const [adminBikeBase, setAdminBikeBase] = useState(25);
  const [adminBikePerKm, setAdminBikePerKm] = useState(6);
  const [adminAutoBase, setAdminAutoBase] = useState(40);
  const [adminAutoPerKm, setAdminAutoPerKm] = useState(14);

  const [showLandmarks, setShowLandmarks] = useState<"pickup" | "drop" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
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

  useEffect(() => {
    async function loadEstimates() {
      const res = await api.getFareEstimate(
        pickup,
        drop,
        pickupCoords.lat,
        pickupCoords.lon,
        dropCoords.lat,
        dropCoords.lon,
        applied ? applied.code : ""
      );
      if (res) {
        setDistance(res.distance_km);
        setMinutes(res.duration_min);
      }
    }
    loadEstimates();
  }, [pickup, drop, pickupCoords.lat, pickupCoords.lon, dropCoords.lat, dropCoords.lon, applied]);

  useEffect(() => {
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

  const breakdown = useMemo(() => {
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
    navigate({ to: "/app/track" });
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

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <Link to="/app/home" className="grid size-9 place-items-center rounded-xl bg-muted">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="text-left">
          <h1 className="text-base font-extrabold tracking-tight">{t("Fare") || "Fare Details"}</h1>
          <p className="text-[10px] text-muted-foreground font-semibold">
            சவாரி கட்டண விவரங்கள்
          </p>
        </div>
      </header>

      <div className="space-y-4 p-4 text-xs font-semibold text-left">
        
        {/* Route Summary Map card */}
        <section className="map-grid rounded-3xl border border-border bg-card p-4 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] checkered" />
          
          <div className="relative flex flex-col gap-2.5 text-xs font-extrabold">
            <button 
              onClick={() => setShowLandmarks("pickup")}
              className="flex items-center gap-2 text-left hover:text-primary transition"
            >
              <MapPin className="size-4 text-emerald-500 shrink-0" />
              <span className="line-clamp-1">{pickup}</span>
            </button>
            <div className="w-0.5 h-3 bg-border ml-2" />
            <button 
              onClick={() => setShowLandmarks("drop")}
              className="flex items-center gap-2 text-left hover:text-primary transition"
            >
              <MapPin className="size-4 text-primary shrink-0 animate-pulse" />
              <span className="line-clamp-1">{drop}</span>
            </button>
          </div>

          <div className="relative mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-2xl bg-muted/50 border border-border/10 p-3 shadow-inner">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Distance</div>
              <div className="text-base font-black text-foreground mt-0.5">{distance} km</div>
            </div>
            <div className="rounded-2xl bg-muted/50 border border-border/10 p-3 shadow-inner">
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1">
                <Clock className="size-3" /> Duration
              </div>
              <div className="text-base font-black text-foreground mt-0.5">{minutes} mins</div>
            </div>
          </div>
        </section>

        {/* Vehicle compare table */}
        <section>
          <h2 className="mb-2.5 text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Choose a vehicle</h2>
          <div className="grid grid-cols-2 gap-3">
            {vehicles.map((v) => {
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
              return (
                <button
                  key={v.id}
                  onClick={() => setVeh(v.id)}
                  className={`rounded-2xl border-2 p-4 text-center transition duration-200 ${active ? "border-primary bg-primary/10 shadow-md scale-[1.01]" : "border-border bg-card hover:border-primary/20"}`}
                >
                  <v.icon className={`mx-auto size-7 ${active ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                  <div className="mt-2 text-xs font-extrabold text-foreground">{v.name}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">{language === "en" ? v.name.split(" ")[0] : v.tamil}</div>
                  <div className="mt-3 text-base font-black text-primary">₹{Math.round(est)}</div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">ETA: {v.eta}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Dynamic toggles */}
        <section className="grid grid-cols-2 gap-3 font-semibold text-xs">
          <button
            onClick={() => setSurge(!surge)}
            className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${surge ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"}`}
          >
            <Zap className={`size-5 shrink-0 ${surge ? "text-destructive animate-bounce" : "text-muted-foreground"}`} />
            <div>
              <div className="text-xs font-extrabold">Demand Surge</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">Weather surge enabled</div>
            </div>
          </button>

          <button
            onClick={() => setNight(!night)}
            className={`flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${night ? "border-primary bg-primary/10" : "border-border bg-card"}`}
          >
            <Moon className={`size-5 shrink-0 ${night ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
            <div>
              <div className="text-xs font-extrabold">Night Charge</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">10 PM - 5 AM active</div>
            </div>
          </button>
        </section>

        {/* Applied Coupon codes */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Apply Coupons</h2>
          
          <div className="flex gap-2">
            {coupons.map((c) => {
              const active = applied?.code === c.code;
              return (
                <button
                  key={c.code}
                  onClick={() => setApplied(active ? null : c)}
                  className={`flex-1 rounded-xl border border-dashed p-2.5 text-left transition ${active ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 font-extrabold" : "border-border bg-card hover:border-primary/20"}`}
                >
                  <div className="flex items-center gap-1">
                    <Sparkles className="size-3 text-emerald-500" />
                    <span className="text-[10px] font-black">{c.code}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-normal">{c.label.split("·")[0]}</p>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2">
            <input 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Enter Custom Promo Code"
              className="flex-1 rounded-xl border border-border bg-card px-3.5 py-3 text-xs font-semibold focus:border-primary focus:outline-none placeholder:text-muted-foreground/60"
            />
            <button 
              onClick={handleApplyPromo}
              className="rounded-xl bg-secondary px-5 text-xs font-black text-secondary-foreground shadow active:scale-95"
            >
              Apply
            </button>
          </div>
        </section>

        {/* Cost breakdown checklist */}
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-2.5">
          <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-0.5 border-b border-border pb-2">Fare Breakdown</h2>
          
          <div className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground">Base Fare</span>
            <span>₹{breakdown.base.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground">Distance Tariff ({distance.toFixed(2)} km × ₹{breakdown.perKm}/km)</span>
            <span>₹{breakdown.distFare.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground">Duration Tariff ({minutes} mins × ₹{veh === "bike" ? "1.00" : "1.50"}/min)</span>
            <span>₹{breakdown.timeFare.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground">Platform / Convenience Fee</span>
            <span>₹{breakdown.fee.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between py-0.5">
            <span className="text-muted-foreground">Chennai Toll Charges</span>
            <span>₹{breakdown.toll.toFixed(2)}</span>
          </div>
          {surge && (
            <div className="flex items-center justify-between py-0.5 text-destructive font-bold">
              <span>Rain/Demand Surge (1.25x)</span>
              <span>+₹{breakdown.surgeAmt.toFixed(2)}</span>
            </div>
          )}
          {night && (
            <div className="flex items-center justify-between py-0.5 text-primary font-bold">
              <span>Late Night Commute</span>
              <span>+₹{breakdown.nightAmt.toFixed(2)}</span>
            </div>
          )}
          {applied && (
            <div className="flex items-center justify-between py-0.5 text-emerald-600 font-bold">
              <span>Promo Code {applied.code}</span>
              <span>-₹{breakdown.discount.toFixed(2)}</span>
            </div>
          )}

          <div className="h-px bg-border pt-1" />

          <div className="flex items-end justify-between font-black text-xs pt-1">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Total Payable Cost</div>
              <div className="text-[9px] text-muted-foreground mt-0.5">சவாரி மொத்தம்</div>
            </div>
            <div className="text-2xl font-black text-primary tracking-tight">
              ₹{Math.round(breakdown.total)}
            </div>
          </div>
        </section>
      </div>

      {/* Booking Confirm Bottom sheet bar */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md p-4">
        <button
          onClick={handleBookAtEstimate}
          className="w-full rounded-2xl bg-secondary py-4 text-center text-xs font-black text-secondary-foreground shadow-xl active:scale-[0.99] transition"
        >
          Book Ride at ₹{Math.round(breakdown.total)}
        </button>
      </div>

      {/* Chennai Landmarks Modal Selection Popup */}
      {showLandmarks && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-sm font-extrabold flex items-center gap-1.5 text-foreground">
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
                className="w-full rounded-xl border border-border bg-secondary p-3 text-xs font-bold outline-none focus:border-primary text-foreground transition"
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
                          <div className="font-extrabold text-foreground">{landmark.name}</div>
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
    </div>
  );
}