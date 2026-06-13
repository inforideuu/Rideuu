import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Star, Bike, Check, ChevronDown, Map } from "lucide-react";
import { useAppStore, store, translate } from "@/lib/store";
import { api } from "../../lib/api";

export const Route = createFileRoute("/app/schedule")({
  component: SchedulePage,
});

const times = ["06:00 AM", "07:30 AM", "09:00 AM", "10:30 AM", "02:00 PM", "05:30 PM", "07:00 PM", "09:00 PM"];

const landmarks = [
  { name: "Marina Beach (Behind Lighthouse)", area: "Mylapore", lat: 13.0382, lon: 80.2785 },
  { name: "Central Station (Near Gate 3)", area: "Park Town", lat: 13.0827, lon: 80.2707 },
  { name: "Pondy Bazaar (Near Saravana Stores)", area: "T. Nagar", lat: 13.0402, lon: 80.2337 },
  { name: "Tidel Park (Phase 1 Main entrance)", area: "Taramani", lat: 12.9895, lon: 80.2483 },
  { name: "Adyar Signal (Near flyover pillar 12)", area: "Adyar", lat: 13.0063, lon: 80.2520 },
];

function SchedulePage() {
  const { language, theme, savedAddresses, ride, profile } = useAppStore();
  const navigate = useNavigate();

  // local scheduler states
  const [date, setDate] = useState(0);
  const [time, setTime] = useState("09:00 AM");
  const [locId, setLocId] = useState(savedAddresses[0]?.id || "home");
  const [selectedVehicle, setSelectedVehicle] = useState<"bike" | "auto">("auto");
  const [confirmed, setConfirmed] = useState(false);

  const [pickup, setPickup] = useState(ride.pickup || "Marina Beach Gate 2");
  const [drop, setDrop] = useState(ride.drop || "T. Nagar Pondy Bazaar");
  const [pickupCoords, setPickupCoords] = useState(ride.pickupCoords || { lat: 13.0382, lon: 80.2785 });
  const [dropCoords, setDropCoords] = useState(ride.dropCoords || { lat: 13.0402, lon: 80.2337 });

  const [showLandmarks, setShowLandmarks] = useState<"pickup" | "drop" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const [bikePrice, setBikePrice] = useState(45);
  const [autoPrice, setAutoPrice] = useState(82);
  const [distance, setDistance] = useState(6.2);
  const [duration, setDuration] = useState(15);
  const [loadingEstimates, setLoadingEstimates] = useState(false);

  const t = (key: string) => translate(key, language);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  useEffect(() => {
    let active = true;
    async function loadEstimates() {
      if (!pickup || !drop) return;
      setLoadingEstimates(true);
      try {
        const res = await api.getFareEstimate(
          pickup,
          drop,
          pickupCoords.lat,
          pickupCoords.lon,
          dropCoords.lat,
          dropCoords.lon
        );
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

  const handleSelectShortcut = (addr: any) => {
    setLocId(addr.id);
    const fullAddr = addr.label + " · " + addr.address;
    setPickup(fullAddr);
    if (addr.id === "home") {
      setPickupCoords({ lat: 13.0003, lon: 80.2667 });
    } else if (addr.id === "work") {
      setPickupCoords({ lat: 12.9895, lon: 80.2483 });
    } else {
      setPickupCoords({ lat: 13.0063, lon: 80.2520 });
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
      pickup: pickup,
      pickup_sub: "Chennai",
      dropoff: drop,
      dropoff_sub: "Chennai",
      fare: price,
      distance: distance,
      duration: duration,
      ride_type: "SCHEDULED",
      status: "SCHEDULED",
      scheduled_date: dateStr,
      scheduled_time: time,
      vehicle_type: selectedVehicle
    });

    if (dbRide) {
      // update store scheduled state
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
    navigate({ to: "/app/trips" });
  };

  if (confirmed) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 p-6 text-center animate-fade-in bg-background text-foreground transition-colors duration-300">
        
        {/* Glowing Success Pulsing ring */}
        <div className="relative my-4">
          <div className="pulse-ring absolute inset-0 rounded-full bg-primary/20 scale-125" />
          <div className="relative grid size-24 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl shadow-primary/20 animate-scale-in">
            <Check className="size-12" strokeWidth={3.5} />
          </div>
        </div>
        
        <div className="space-y-1">
          <h1 className="text-xl font-black tracking-tight text-foreground">Ride Scheduled Successful!</h1>
          <p className="text-xs text-muted-foreground leading-normal" style={{ fontFamily: "var(--font-tamil)" }}>
            உங்கள் பயணம் வெற்றிகரமாக உறுதி செய்யப்பட்டது
          </p>
        </div>

        <div className="w-full max-w-xs rounded-3xl border border-border bg-card p-5 text-left shadow-sm space-y-3.5 text-xs font-semibold">
          <div className="flex items-center justify-between border-b border-border pb-2.5">
            <span className="text-muted-foreground flex items-center gap-1"><Clock className="size-3.5" /> Departure</span>
            <span className="font-extrabold text-foreground">{days[date].toLocaleDateString("en", { day: "numeric", month: "short" })} at {time}</span>
          </div>
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-muted-foreground flex items-center gap-1"><MapPin className="size-3.5 text-emerald-500" /> Pickup Location</span>
            <span className="font-extrabold text-foreground line-clamp-2">{pickup}</span>
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-2.5">
            <span className="text-muted-foreground flex items-center gap-1"><MapPin className="size-3.5 text-primary" /> Drop Location</span>
            <span className="font-extrabold text-foreground line-clamp-2">{drop}</span>
          </div>
        </div>
        
        <button
          onClick={handleBackToTrips}
          className="rounded-2xl bg-secondary px-6 py-4 text-xs font-black text-secondary-foreground shadow active:scale-95 transition"
        >
          View Scheduled Ride History
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <Link to="/app/home" className="grid size-9 place-items-center rounded-xl bg-muted">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="text-left">
          <h1 className="text-base font-extrabold tracking-tight">{t("Schedule") || "Schedule a Ride"}</h1>
          <p className="text-[10px] text-muted-foreground font-semibold">
            பின்னர் பயணம் செய்ய திட்டமிடுங்கள்
          </p>
        </div>
      </header>

      <div className="space-y-6 p-4 text-xs font-semibold text-left">
        
        {/* Calendar Picker next 7 days */}
        <section>
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
            <CalendarIcon className="size-4 text-primary animate-pulse" /> Select departure date
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-1.5 no-scrollbar">
            {days.map((d, i) => {
              const active = date === i;
              return (
                <button
                  key={i}
                  onClick={() => setDate(i)}
                  className={`min-w-[64px] rounded-2xl border-2 p-3 text-center transition duration-150 ${active ? "border-primary bg-primary/10 text-primary shadow-sm scale-[1.01]" : "border-border bg-card hover:border-primary/20"}`}
                >
                  <div className="text-[8px] uppercase tracking-wider font-bold">
                    {d.toLocaleDateString("en", { weekday: "short" })}
                  </div>
                  <div className="text-base font-black my-1">{d.getDate()}</div>
                  <div className="text-[8px] uppercase tracking-wider font-bold opacity-80">
                    {d.toLocaleDateString("en", { month: "short" })}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Time Slots */}
        <section>
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
            <Clock className="size-4 text-primary" /> Select time slot
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
            {times.map((tSlot) => {
              const active = time === tSlot;
              return (
                <button
                  key={tSlot}
                  onClick={() => setTime(tSlot)}
                  className={`rounded-xl border py-2.5 transition duration-150 ${active ? "border-secondary bg-secondary text-secondary-foreground font-black shadow-sm" : "border-border bg-card hover:border-primary/25"}`}
                >
                  {tSlot}
                </button>
              );
            })}
          </div>
        </section>

        {/* Vehicle Selection */}
        <section>
          <div className="mb-2.5 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
            <Bike className="size-4 text-primary animate-pulse" /> Select vehicle type
          </div>
          <div className="grid grid-cols-2 gap-3 text-center text-xs font-extrabold">
            <button
              onClick={() => setSelectedVehicle("bike")}
              className={`rounded-2xl border p-4 flex flex-col items-center justify-center gap-1.5 transition ${selectedVehicle === "bike" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-card"}`}
            >
              <Bike className="size-5" />
              <span>Bike</span>
              <span className="text-[10px] text-muted-foreground">
                {loadingEstimates ? "Calculating..." : `₹${bikePrice}`}
              </span>
            </button>
            <button
              onClick={() => setSelectedVehicle("auto")}
              className={`rounded-2xl border p-4 flex flex-col items-center justify-center gap-1.5 transition ${selectedVehicle === "auto" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-card"}`}
            >
              <span className="text-base font-black leading-none">A</span>
              <span>Auto Rickshaw</span>
              <span className="text-[10px] text-muted-foreground">
                {loadingEstimates ? "Calculating..." : `₹${autoPrice}`}
              </span>
            </button>
          </div>
        </section>

        {/* Pickup & Drop Custom Locations Selection Card */}
        <section className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
            <Map className="size-4 text-primary animate-pulse" /> Custom Route Details
          </div>
          
          <div className="flex items-center gap-3">
            <div className="size-3 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
            <div className="flex-1 text-left">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t("Pickup")}</div>
              <button 
                onClick={() => setShowLandmarks("pickup")}
                className="w-full text-left bg-transparent text-xs font-bold focus:outline-none flex justify-between items-center text-foreground"
              >
                <span className="line-clamp-1">{pickup}</span>
                <ChevronDown className="size-3.5 text-muted-foreground ml-1" />
              </button>
            </div>
            <button 
              onClick={() => setShowLandmarks("pickup")} 
              className="text-[10px] font-extrabold text-primary hover:underline"
            >
              {t("Change")}
            </button>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center gap-3">
            <div className="size-3 shrink-0 rounded-full bg-primary ring-4 ring-primary/10" />
            <div className="flex-1 text-left">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t("Drop")}</div>
              <button 
                onClick={() => setShowLandmarks("drop")}
                className="w-full text-left bg-transparent text-xs font-bold focus:outline-none flex justify-between items-center text-foreground"
              >
                <span className="line-clamp-1">{drop}</span>
                <ChevronDown className="size-3.5 text-muted-foreground ml-1" />
              </button>
            </div>
            <button 
              onClick={() => setShowLandmarks("drop")} 
              className="text-[10px] font-extrabold text-primary hover:underline"
            >
              {t("Change")}
            </button>
          </div>
        </section>

        {/* Pickup Location shortcuts */}
        <section className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
            <MapPin className="size-4 text-primary" /> Select pickup address shortcut
          </div>
          <div className="space-y-2 font-semibold">
            {savedAddresses.map((l) => {
              const active = locId === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => handleSelectShortcut(l)}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"}`}
                >
                  <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                    <MapPin className="size-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-foreground">
                      {l.label}
                      <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "var(--font-tamil)" }}>
                        {l.tamilLabel}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground leading-normal mt-0.5 line-clamp-1">{l.address}</div>
                  </div>
                  <div className={`grid size-5 place-items-center rounded-full border-2 transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                    {active && <Check className="size-3.5" strokeWidth={3.5} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Local Chennai rider density advisory card */}
        <section className="rounded-3xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Bike className="size-4 text-primary animate-bounce" /> Chennai Rider Density
            </div>
            <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600">
              <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" /> HIGH DENSITY
            </span>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="flex -space-x-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="grid size-8 place-items-center rounded-full border border-card bg-primary text-[10px] font-black text-primary-foreground">
                  {i}
                </div>
              ))}
            </div>
            <div className="text-[10px] text-muted-foreground leading-relaxed">
              <span className="font-extrabold text-foreground">12+ drivers ready</span> within 2km in Besant Nagar.
              <div className="flex items-center gap-1 mt-0.5"><Star className="size-3 fill-primary text-primary" /> 4.8 avg rating verified</div>
            </div>
          </div>
        </section>
      </div>

      {/* Confirm scheduled buttons */}
      <div className="fixed inset-x-0 bottom-16 z-30 mx-auto max-w-md p-4">
        <button
          onClick={handleConfirmSchedule}
          className="w-full rounded-2xl bg-secondary py-4 text-center text-xs font-black text-secondary-foreground shadow-xl active:scale-[0.99] transition"
        >
          Confirm Schedule (₹{selectedVehicle === "bike" ? bikePrice : autoPrice}) · {days[date].toLocaleDateString("en", { day: "numeric", month: "short" })} at {time}
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