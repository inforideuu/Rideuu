import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/rider/MobileShell";
import { MapPin, Navigation, Clock, IndianRupee, X, Check, ShieldCheck, Heart, Sparkles, MessageCircle } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useRider } from "../context/RiderContext";

export const Route = createFileRoute("/ride/request")({
  component: RideRequest,
});

function RideRequest() {
  const nav = useNavigate();
  const { incomingRequest, acceptRideRequest, rejectRideRequest, t, language } = useRider();
  const [seconds, setSeconds] = useState(15);

  // Auto reject request if timeout hits 0
  useEffect(() => {
    if (seconds <= 0) {
      rejectRideRequest();
      nav({ to: "/dashboard" });
      return;
    }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  // Redirect to dashboard if incoming request is cleared or timed out in the backend
  useEffect(() => {
    if (!incomingRequest) {
      nav({ to: "/dashboard" });
    }
  }, [incomingRequest, nav]);

  // Use state data or fallback to simulated PRIYA request if tester visits page directly
  const activeReq = useMemo(() => {
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
      rainBonus: 20,
    };
  }, [incomingRequest]);

  const handleAccept = async () => {
    // Save to active ride
    const success = await acceptRideRequest();
    if (success) {
      nav({ to: "/ride/active" });
    } else {
      nav({ to: "/dashboard" });
    }
  };

  const handleReject = () => {
    rejectRideRequest();
    nav({ to: "/dashboard" });
  };

  const totalEarnings = activeReq.id.includes("fallback")
    ? Math.round((activeReq.fare + activeReq.rainBonus) * activeReq.surgeMultiplier)
    : activeReq.fare;

  return (
    <MobileShell showNav={false}>
      <div className="min-h-screen relative overflow-hidden bg-slate-900">
        {/* Full-screen Dark Map simulation overlay for WOW styling */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.15)_0%,transparent_50%),radial-gradient(circle_at_70%_60%,rgba(15,23,42,0.95)_0%,rgba(15,23,42,1)_100%)]">
          {/* Glowing pulse rings representing customer location */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
            <div className="h-28 w-28 rounded-full bg-primary/10 pulse-ring flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-primary animate-bounce" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Header info */}
        <div className="absolute top-6 inset-x-6 flex justify-between items-center z-10 text-white">
          <span className="text-[10px] font-black tracking-widest text-primary bg-primary/15 px-3 py-1 rounded-full border border-primary/20">
            {t("built_for_chennai")}
          </span>
          <span className="text-xs font-black bg-slate-800 border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Smart Queue: High Priority
          </span>
        </div>

        {/* Floating accept/reject action dialog card */}
        <div className="absolute bottom-6 inset-x-4 rounded-3xl bg-slate-950/90 border border-white/15 p-6 backdrop-blur-lg slide-up text-white shadow-2xl">
          {/* Timeout Visual Indicator bar */}
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${(seconds / 15) * 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black tracking-widest text-primary bg-primary/15 px-2.5 py-0.5 rounded-md uppercase">
              {t("new_ride")} · AUTO
            </span>
            <span className="text-xs font-black bg-primary text-primary-foreground px-3 py-1 rounded-full animate-pulse">
              {seconds}s left
            </span>
          </div>

          {/* Fare & Metrics */}
          <div className="flex items-baseline gap-2">
            <IndianRupee className="h-6 w-6 text-primary" />
            <span className="text-4xl font-black tracking-tight">{totalEarnings}</span>
            <span className="text-xs text-slate-400 font-semibold">
              · {activeReq.distance} km · {activeReq.duration} mins
            </span>
          </div>

          {/* Women Safe Matching Indicator */}
          {activeReq.isFemaleOnly && (
            <div className="mt-4 flex items-center gap-2 bg-pink-500/10 border border-pink-500/25 p-3 rounded-2xl text-pink-300">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <div className="text-[10px] font-bold tracking-tight">
                {t("women_priority")} Badge Match
              </div>
            </div>
          )}

          {/* Route details */}
          <div className="mt-5 space-y-4 border-y border-white/5 py-4">
            <div 
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeReq.pickup)}`, "_blank")}
              className="flex items-start gap-3 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all"
              title="Touch to navigate to pickup location"
            >
              <div className="h-2 w-2 rounded-full bg-success mt-1.5 shrink-0 ring-4 ring-success/20" />
              <div>
                <div className="font-bold text-xs text-white uppercase tracking-wide flex items-center gap-1">
                  PICKUP <Navigation className="h-3 w-3 text-primary animate-pulse" />
                </div>
                <div className="font-black text-sm mt-0.5">{activeReq.pickup}</div>
                <div className="text-[10px] text-slate-400 font-semibold">{activeReq.pickupSub}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 ring-4 ring-primary/20" />
              <div>
                <div className="font-bold text-xs text-white uppercase tracking-wide">{t("dropoff")}</div>
                <div className="font-black text-sm mt-0.5">{activeReq.dropoff}</div>
                <div className="text-[10px] text-slate-400 font-semibold">{activeReq.dropoffSub}</div>
              </div>
            </div>
          </div>

          {/* Customer profile */}
          <div className="mt-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {activeReq.customerName[0]}
              </div>
              <div>
                <div className="font-bold text-white text-xs">{activeReq.customerName}</div>
                <div className="text-[10px] text-slate-400 font-bold">⭐ {activeReq.customerRating} rating</div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold">SURGE / RAIN</div>
              <div className="text-[11px] font-black text-primary uppercase">
                {activeReq.surgeMultiplier}x Surge · +₹{activeReq.rainBonus} Bonus
              </div>
            </div>
          </div>

          {/* Accept / Reject CTA Grid */}
          <div className="mt-6 grid grid-cols-5 gap-3">
            <button
              onClick={handleReject}
              className="col-span-2 rounded-full bg-white/10 border border-white/5 text-white hover:bg-white/20 font-black py-4 flex items-center justify-center gap-2 active:scale-95 transition text-xs tracking-wide"
            >
              <X className="h-4.5 w-4.5" /> {t("reject")}
            </button>
            <button
              onClick={handleAccept}
              className="col-span-3 rounded-full bg-primary text-primary-foreground font-black py-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition text-xs tracking-wide uppercase"
            >
              <Check className="h-4.5 w-4.5" /> {t("accept_ride")}
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
