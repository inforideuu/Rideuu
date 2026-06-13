import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/rider/MobileShell";
import { Logo } from "@/components/rider/Logo";
import { InteractiveMap } from "@/components/rider/InteractiveMap";
import {
  Bell, MapPin, Zap, CloudRain, Star, TrendingUp, Trophy, Flame, ChevronRight,
  ShieldAlert, ShieldCheck, HelpCircle, User, Compass, Calendar, Clock, Smile,
  Crown, CreditCard, CheckSquare, Wallet
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRider } from "../context/RiderContext";
import { api } from "../lib/api";

const CHENNAI_HOTSPOTS = [
  { name: "T. Nagar Shopping Zone", lat: 13.0382, lng: 80.2337 },
  { name: "Velachery Hub", lat: 12.9915, lng: 80.2185 },
  { name: "Anna Nagar West", lat: 13.0850, lng: 80.2100 },
  { name: "Chennai Central Station", lat: 13.0827, lng: 80.2707 },
  { name: "Nungambakkam Station", lat: 13.0658, lng: 80.2328 },
  { name: "Airport Terminal", lat: 12.9941, lng: 80.1709 },
  { name: "Adyar Zone", lat: 13.0063, lng: 80.2520 },
  { name: "Guindy Station", lat: 13.0084, lng: 80.2131 },
  { name: "Marina Beach", lat: 13.0382, lng: 80.2785 },
];

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Rider Dashboard — Rideuu" }] }),
  component: Dashboard,
});

function Dashboard() {
  const nav = useNavigate();
  const {
    online, setOnline,
    sosTriggered, triggerSOS, cancelSOS,
    t, language,
    rainActive, floodAlert,
    womenPriorityMatch, setWomenPriorityMatch,
    womenSafetyVerified,
    profileName, activeRide, incomingRequest,
    currentAddress,
    manualLocation, setManualLocation, clearManualLocation,
    rating, completedRides, transactions,
    noCommissionExpiry, purchaseNoCommission, walletBalance, vehicles, activeVehicleId, phone, ridesList
  } = useRider();

  const todayEarnings = useMemo(() => {
    let sum = 0;
    const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    ridesList.forEach((ride) => {
      if (ride.status === "completed" && ride.created_at) {
        const rideDate = ride.created_at.split("T")[0];
        if (rideDate === todayStr) {
          const fare = parseFloat(ride.fare);
          if (!isNaN(fare)) {
            // Apply commission deduction:
            const vType = ride.vehicle_type || "bike";
            const isAuto = vType.toLowerCase().includes("auto");
            const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1000);
            const commPercent = hasNoComm ? 0.0 : (isAuto ? 0.08 : 0.05);
            const commAmt = hasNoComm ? 3.0 : (fare * commPercent);
            sum += (fare - commAmt);
          }
        }
      }
    });
    return Math.round(sum * 100) / 100;
  }, [ridesList, noCommissionExpiry]);

  const [showLocationAlert, setShowLocationAlert] = useState(true);
  const [showSubModal, setShowSubModal] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [razorpayPlan, setRazorpayPlan] = useState<any>(null);
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);

  // Determine driver vehicle type
  const activeVehicle = vehicles.find(v => v.id === activeVehicleId);
  const vehicleType = activeVehicle?.type || (localStorage.getItem("namma_vehicle_type") as "auto" | "bike") || "bike";

  const [dbPlans, setDbPlans] = useState<any[]>([]);

  useEffect(() => {
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

  const plans = useMemo(() => {
    const activeList = dbPlans.length > 0 ? dbPlans : (
      vehicleType === "auto" ? [
        { price: 19, days: 1, label: "24 Hours", desc: "No commission for 24 hours. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "auto" },
        { price: 49, days: 3, label: "3 Days", desc: "No commission for 3 days. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "auto" },
        { price: 99, days: 7, label: "7 Days", desc: "No commission for 7 days. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "auto" },
        { price: 499, days: 30, label: "1 Month", desc: "No commission for 1 month. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "auto" }
      ] : [
        { price: 15, days: 1, label: "24 Hours", desc: "No commission for 24 hours. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "bike" },
        { price: 45, days: 3, label: "3 Days", desc: "No commission for 3 days. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "bike" },
        { price: 95, days: 7, label: "7 Days", desc: "No commission for 7 days. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "bike" },
        { price: 495, days: 30, label: "1 Month", desc: "No commission for 1 month. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "bike" }
      ]
    );

    return activeList.filter((p: any) => p.vehicle_type === vehicleType || p.vehicleType === vehicleType);
  }, [dbPlans, vehicleType]);

  const subActive = useMemo(() => {
    return noCommissionExpiry > Math.floor(Date.now() / 1000);
  }, [noCommissionExpiry]);

  const activeTimeLeft = useMemo(() => {
    if (!subActive) return "";
    const seconds = noCommissionExpiry - Math.floor(Date.now() / 1000);
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    if (days > 0) return `${days}d ${hours}h left`;
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m left`;
  }, [noCommissionExpiry, subActive]);

  // Auto transition to request page if there is an incoming request
  useMemo(() => {
    if (incomingRequest) {
      setTimeout(() => nav({ to: "/ride/request" }), 200);
    }
  }, [incomingRequest]);

  // Auto transition to active ride page if a ride is in progress
  useMemo(() => {
    if (activeRide.request) {
      setTimeout(() => nav({ to: "/ride/active" }), 200);
    }
  }, [activeRide.request]);

  const activeZoneText = useMemo(() => {
    if (rainActive && floodAlert) return language === "ta" ? "வேளச்சேரி (வெள்ள அபாயம்)" : "Velachery (Flood Warning)";
    if (rainActive) return language === "ta" ? "மழைக்கால வேளச்சேரி" : "Rainy Velachery Hub";
    return currentAddress;
  }, [rainActive, floodAlert, language, currentAddress]);

  return (
    <MobileShell>
      {/* Header */}
      <header className="px-5 pt-6 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="text-[10px] font-black tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
            {t("rider")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Female Only matching indicator */}
          {womenSafetyVerified && (
            <button
              onClick={() => setWomenPriorityMatch(!womenPriorityMatch)}
              className={`h-9 px-3 rounded-full border text-xs font-bold flex items-center gap-1.5 transition ${womenPriorityMatch
                  ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                  : "bg-card border-border text-muted-foreground"
                }`}
              title="Women Rider Preference Badge"
            >
              <ShieldCheck className="h-4 w-4" />
              <span className="text-[10px] hidden xs:inline">{t("women_only_rides")}</span>
            </button>
          )}

          <Link
            to="/notifications"
            className="relative h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </div>
      </header>

      {/* Online/Offline Toggle Hero Widget */}
      <section className="mx-5 mt-4 rounded-3xl bg-primary text-primary-foreground p-5 overflow-hidden relative shadow-lg">
        <div className="flex items-start justify-between z-10 relative">
          <div>
            <p className="text-[10px] font-extrabold tracking-widest uppercase opacity-90 flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: "8s" }} />
              {online ? `${t("you_are_live_in")} ${activeZoneText}` : t("you_are_offline")}
            </p>
            <h2 className="mt-1 text-xl font-black tracking-tight leading-tight max-w-[190px]">
              {online ? t("catching_rides") : t("go_online_start")}
            </h2>
          </div>

          {/* Online Toggle Switch */}
          <button
            onClick={async () => {
              const nextOnline = !online;
              await setOnline(nextOnline);
              if (nextOnline) {
                const now = Math.floor(Date.now() / 1000);
                if (noCommissionExpiry < now) {
                  setShowSubModal(true);
                }
              }
            }}
            className={`relative shrink-0 h-9 w-16 rounded-full border-2 border-white/20 transition ${online ? "bg-emerald-500" : "bg-white/10"
              }`}
          >
            <span
              className={`absolute top-0.5 h-7 w-7 rounded-full bg-white flex items-center justify-center text-[10px] font-bold shadow-md transition-all ${online ? "left-7.5 text-emerald-500" : "left-0.5 text-slate-500"
                }`}
            >
              {online ? "ON" : "OFF"}
            </span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="mt-6 grid grid-cols-2 gap-2.5 text-center">
          <div className="rounded-2xl bg-white/15 backdrop-blur px-2.5 py-2">
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">{t("today")}</div>
            <div className="font-black text-sm tracking-tight">₹{todayEarnings}</div>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur px-2.5 py-2">
            <div className="text-[9px] font-bold uppercase tracking-wider opacity-80">{t("trips")}</div>
            <div className="font-black text-sm tracking-tight">{completedRides}</div>
          </div>
        </div>

        {/* Manual Location Simulation Selector (Rider manual override) */}
        {online && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider opacity-90">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-emerald-300" /> {language === "ta" ? "கைமுறை இருப்பிடம்" : "Manual Location Override"}
              </span>
              {manualLocation && (
                <button
                  type="button"
                  onClick={clearManualLocation}
                  className="text-[9px] font-black underline hover:text-emerald-300 cursor-pointer"
                >
                  {language === "ta" ? "தானியங்கி ஜிபிஎஸ்" : "Reset to Auto GPS"}
                </button>
              )}
            </div>
            <select
              value={manualLocation ? manualLocation.address : ""}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  clearManualLocation();
                  return;
                }
                const found = CHENNAI_HOTSPOTS.find(h => h.name === val);
                if (found) {
                  setManualLocation(found.name, found.lat, found.lng);
                }
              }}
              className="w-full bg-white/10 text-white border border-white/20 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400/50 cursor-pointer"
            >
              <option value="" className="text-slate-900 bg-white">{language === "ta" ? "தானியங்கி ஜிபிஎஸ் (உலாவி)" : "Browser Auto GPS"}</option>
              {CHENNAI_HOTSPOTS.map((h) => (
                <option key={h.name} value={h.name} className="text-slate-900 bg-white">
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="checker-stripe absolute -bottom-2 left-0 right-0 h-3.5 opacity-30" />
      </section>

      {/* Chennai Water Logging/Flood warning Banner on Dashboard */}
      {online && floodAlert && showLocationAlert && (
        <div className="mx-5 mt-4 rounded-2xl bg-blue-500/15 border border-blue-500/20 p-4 text-blue-400 flex items-start gap-3 relative">
          <CloudRain className="h-5 w-5 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1 min-w-0">
            <div className="font-black text-xs uppercase tracking-wide">
              {t("flood_warning_title")} (Velachery Zone)
            </div>
            <p className="text-[10px] leading-relaxed mt-1 text-slate-300">
              {t("flood_warning_desc")}
            </p>
          </div>
          <button
            onClick={() => setShowLocationAlert(false)}
            className="text-slate-400 hover:text-white absolute top-2 right-2 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* No Commission Subscription Status Banner */}
      {online && (
        <div className="mx-5 mt-4">
          <div className={`rounded-3xl border p-4 transition-all ${subActive
              ? "bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border-amber-500/30"
              : "bg-gradient-to-r from-slate-500/5 to-slate-600/5 border-border"
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${subActive ? "bg-amber-500/20 text-amber-500" : "bg-slate-500/10 text-slate-400"
                  }`}>
                  <Crown className="h-4.5 w-4.5" />
                </div>
                <div>
                  <div className="font-black text-xs tracking-tight text-foreground flex items-center gap-1.5">
                    No Commission Plan
                    {subActive ? (
                      <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-500/15 px-1.5 py-0.5 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="text-[9px] font-black uppercase text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                    {subActive
                      ? `Flat ₹3 admin fee per ride · ${activeTimeLeft}`
                      : `Standard ${vehicleType === "auto" ? "8%" : "5%"} commission active`}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSubModal(true)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-black transition active:scale-95 ${subActive
                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                    : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-sm"
                  }`}
              >
                {subActive ? "Extend" : "Upgrade"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chennai Custom SVG Interactive Navigation Map */}
      <section className="px-5 mt-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-primary" />
            {t("heatmap")}
          </h3>
          <span className="text-[10px] font-bold text-primary flex items-center gap-1">
            <Zap className="h-3 w-3 animate-bounce" />
            {language === "ta" ? "நேரடி கட்டண உயர்வு" : "SURGE PRICING ACTIVE"}
          </span>
        </div>
        <InteractiveMap height="h-[280px]" />
      </section>

      {/* SOS Dispatch Emergency System */}
      <section className="px-5 mt-4">
        {sosTriggered ? (
          <div className="rounded-3xl bg-red-600 border border-red-500 text-white p-5 shadow-lg relative slide-up">
            <div className="flex items-start gap-4">
              <ShieldAlert className="h-10 w-10 shrink-0 text-white animate-bounce" />
              <div className="flex-1">
                <div className="font-black text-base tracking-tight">{t("emergency_title")}</div>
                <p className="text-xs mt-1 text-red-100 leading-relaxed">{t("emergency_desc")}</p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={cancelSOS}
                    className="px-4 py-2 bg-white text-red-600 rounded-full text-xs font-black hover:bg-slate-100 transition active:scale-95"
                  >
                    Cancel Alert
                  </button>
                  <a
                    href="tel:100"
                    className="px-4 py-2 bg-slate-900 border border-white/20 text-white rounded-full text-xs font-black text-center"
                  >
                    Call 100
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={triggerSOS}
            className="w-full rounded-2xl bg-card border border-red-500/30 hover:border-red-500 p-4 flex items-center justify-between shadow-sm active:scale-[0.99] transition text-red-500"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
              <div className="text-left">
                <div className="font-black text-sm tracking-tight">{t("sos")} EMERGENCY HELP</div>
                <div className="text-[10px] text-muted-foreground font-semibold">1-Tap GPS Share to Police</div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-red-400" />
          </button>
        )}
      </section>

      {/* Availability Shift Widgets */}
      <section className="px-5 mt-5">
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-primary" />
              <span className="font-black text-xs uppercase tracking-wider text-foreground">
                {t("shift_scheduling")}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
              Active Shift
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary/10 rounded-full flex items-center justify-center" />
              <div>
                <div className="font-bold text-xs text-foreground">{t("current_shift")}</div>
                <div className="text-[10px] text-muted-foreground font-semibold">Usman Road Hub · Chennai</div>
              </div>
            </div>
            <button
              onClick={() => nav({ to: "/profile" })}
              className="text-primary font-bold text-[11px] underline"
            >
              Scheduler →
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Quick Links list */}
      <section className="px-5 mt-6 space-y-3 pb-8">
        <RowLink to="/incentives" icon={Zap} title={t("incentives_bonuses")} sub="View incentive challenges" />
        <RowLink to="/earnings" icon={TrendingUp} title={language === "ta" ? "இன்றைய வருவாய்" : "Today's Earnings"} sub={`₹${todayEarnings} · view breakdown graph`} />
        <RowLink to="/ratings" icon={Star} title={t("ratings_reviews")} sub={`${rating.toFixed(2)} ★ · Customer Rating`} />
      </section>

      {/* "No Commission" Subscription Modal */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md rounded-t-[32px] rounded-b-[24px] p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Crown className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground tracking-tight">No Commission Plan</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{vehicleType} rider plans</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubModal(false)}
                className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center text-foreground font-black text-sm hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              Activate a plan below to keep <strong className="text-foreground">100% of your ride fares</strong>. Only pay a flat admin fee of <strong className="text-foreground">₹3 per completed ride</strong> directly from your wallet balance.
            </p>

            <div className="space-y-2.5 mb-5">
              {plans.map((plan, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPlanIndex(idx)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${selectedPlanIndex === idx
                      ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500 shadow-sm"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                    }`}
                >
                  <div className="flex-1 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-foreground">{plan.label} Plan</span>
                      {idx === 1 && (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded">
                          Best Value
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-1 leading-snug">
                      {plan.desc}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-foreground">₹{plan.price}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Payment Actions */}
            <div className="space-y-3">
              <button
                onClick={async () => {
                  const plan = plans[selectedPlanIndex];
                  const success = await purchaseNoCommission(plan.price, plan.days, 'wallet');
                  if (success) {
                    setShowSubModal(false);
                  }
                }}
                className="w-full h-12 rounded-2xl bg-amber-500 text-white hover:bg-amber-600 font-black text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-md"
              >
                <Wallet className="h-4.5 w-4.5" />
                Pay via Wallet (Bal: ₹{walletBalance.toFixed(2)})
              </button>

              <button
                onClick={() => {
                  setRazorpayPlan(plans[selectedPlanIndex]);
                }}
                className="w-full h-12 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 font-black text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-md"
              >
                <CreditCard className="h-4.5 w-4.5" />
                Pay via Razorpay Gateway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulated Razorpay Checkout Modal */}
      {razorpayPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1c2438] w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-blue-500/20 text-white">
            {/* Header */}
            <div className="bg-[#121826] p-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-blue-400">Razorpay</span>
                <span className="text-[10px] uppercase font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">TEST MODE</span>
              </div>
              <button
                onClick={() => setRazorpayPlan(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">PAYING FOR NO COMMISSION PLAN</p>
                <p className="text-3xl font-black text-white mt-1.5">₹{razorpayPlan.price.toFixed(2)}</p>
                <p className="text-[11px] text-blue-300 font-bold mt-1">Duration: {razorpayPlan.label}</p>
              </div>

              <div className="bg-[#121826]/60 rounded-2xl p-4 border border-white/5 space-y-3 mb-6">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Merchant</span>
                  <span className="font-bold">Rideuu Platform</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Contact</span>
                  <span className="font-bold">{phone || "+91 99999 99999"}</span>
                </div>
              </div>

              {isProcessingRazorpay ? (
                <div className="text-center py-8 space-y-3">
                  <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Authorizing Payment via Bank Gateway...</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <button
                    onClick={async () => {
                      setIsProcessingRazorpay(true);
                      setTimeout(async () => {
                        setIsProcessingRazorpay(false);
                        const success = await purchaseNoCommission(razorpayPlan.price, razorpayPlan.days, 'razorpay');
                        if (success) {
                          setRazorpayPlan(null);
                          setShowSubModal(false);
                        }
                      }, 1800);
                    }}
                    className="w-full h-12 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-black text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                  >
                    Simulate Payment Success
                  </button>
                  <button
                    onClick={() => {
                      alert("Payment failed / cancelled.");
                      setRazorpayPlan(null);
                    }}
                    className="w-full h-12 rounded-xl bg-red-600/30 text-red-200 hover:bg-red-600/40 border border-red-500/20 font-black text-sm flex items-center justify-center active:scale-95 transition"
                  >
                    Simulate Payment Failure
                  </button>
                </div>
              )}
            </div>
            <div className="bg-[#121826] p-4 text-center text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
              Secured by Razorpay. Do not refresh.
            </div>
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function BoostCard({
  icon: Icon,
  title,
  sub,
  highlight,
}: {
  icon: any;
  title: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${highlight
          ? "bg-card border-primary ring-2 ring-primary/20 shadow-md scale-102"
          : "bg-card border-border hover:border-primary/20"
        }`}
    >
      <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-2 shadow-sm">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="font-black text-xs text-foreground leading-tight tracking-tight">{title}</div>
      <div className="text-[10px] text-muted-foreground mt-1 font-semibold leading-tight">{sub}</div>
    </div>
  );
}

function RowLink({
  to, icon: Icon, title, sub,
}: { to: string; icon: any; title: string; sub: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 hover:border-primary/20 active:scale-[0.99] transition shadow-sm"
    >
      <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-foreground tracking-tight truncate">{title}</div>
        <div className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">{sub}</div>
      </div>
      <ChevronRight className="h-4.5 w-4.5 text-muted-foreground" />
    </Link>
  );
}
