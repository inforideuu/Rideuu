import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/rider/MobileShell";
import { CheckCircle2, Star, Sparkles, HelpCircle, ArrowRight, ShieldAlert } from "lucide-react";
import { useState, useMemo } from "react";
import { useRider } from "../context/RiderContext";

export const Route = createFileRoute("/ride/summary")({
  component: Summary,
});

function Summary() {
  const nav = useNavigate();
  const { activeRide, endActiveRide, t, language } = useRider();
  const [rating, setRating] = useState(5);

  const activeReq = useMemo(() => {
    if (activeRide.request) return activeRide.request;
    // fallback static data
    return {
      id: "req-summary-fallback",
      fare: 120,
      distance: 4.2,
      pickup: "T.Nagar Bus Depot",
      dropoff: "Anna Nagar W Block",
      customerName: "Priya",
      isFemaleOnly: true,
      surgeMultiplier: 1.2,
      rainBonus: 20,
    };
  }, [activeRide.request]);

  const surgeMult = activeReq.surgeMultiplier || 1.0;
  const baseFare = activeReq.id.includes("fallback")
    ? activeReq.fare
    : Math.round((activeReq.fare - activeReq.rainBonus) / surgeMult);
  const surgeAmt = activeReq.id.includes("fallback")
    ? Math.round(baseFare * (surgeMult - 1))
    : activeReq.fare - baseFare - activeReq.rainBonus;
  const rainBonus = activeReq.rainBonus;
  const totalEarned = activeReq.id.includes("fallback")
    ? Math.round((baseFare + rainBonus) * surgeMult)
    : activeReq.fare;

  const handleFinish = () => {
    endActiveRide(rating);
    nav({ to: "/dashboard" });
  };

  return (
    <MobileShell showNav={false}>
      <div className="px-5 pt-10 pb-8 text-center bg-background min-h-screen flex flex-col justify-between">
        <div>
          {/* Animated Green Check Ring */}
          <div className="mx-auto h-16 w-16 rounded-full bg-success/15 border border-success/30 text-success flex items-center justify-center animate-bounce">
            <CheckCircle2 className="h-9 w-9 fill-success/10" />
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground">{t("trip_complete")}</h1>
          <p className="text-xs text-muted-foreground font-bold mt-1 uppercase tracking-wider">
            {activeReq.customerName} · {activeReq.dropoff} · {activeReq.distance} km
          </p>

          {/* Premium Fare breakdown card */}
          <div className="mt-6 rounded-3xl bg-card border border-border p-6 text-left shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-success/5 to-transparent rounded-bl-full pointer-events-none" />
            
            <h4 className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest mb-4">
              Detailed Earnings Ledger
            </h4>
            
            <Row label={t("trip_fare")} value={`₹${baseFare}.00`} />
            
            {surgeAmt > 0 && (
              <Row
                label={`${t("surge_mult")} (${activeReq.surgeMultiplier}x)`}
                value={`+₹${surgeAmt}.00`}
                highlight
              />
            )}
            
            {rainBonus > 0 && (
              <Row
                label={t("rain_bonus_active")}
                value={`+₹${rainBonus}.00`}
                highlight
              />
            )}
            
            <div className="h-px bg-border my-4" />
            <Row label={t("you_earned")} value={`₹${totalEarned}.00`} bold />
          </div>

          {/* Customer Rating Star Selector */}
          <div className="mt-8 rounded-3xl bg-card border border-border p-5 shadow-sm text-center">
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">
              {t("rate_customer")} {activeReq.customerName}
            </p>
            <div className="mt-3.5 flex justify-center gap-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  className="active:scale-90 transition"
                >
                  <Star
                    className={`h-9 w-9 ${
                      i <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground font-semibold">
              Performance score completes target bonus track
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-primary text-primary-foreground font-black rounded-full shadow-lg active:scale-95 transition flex items-center justify-center gap-2 text-sm uppercase tracking-wide"
          >
            {t("back_to_dashboard")} <ArrowRight className="h-4.5 w-4.5" />
          </button>
          
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-bold">
            <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            <span>Chennai auto-verification system enabled</span>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}

function Row({ label, value, bold, highlight }: any) {
  return (
    <div className="flex justify-between py-2">
      <span className={`text-xs ${bold ? "font-black uppercase tracking-wider text-foreground" : "text-muted-foreground font-semibold"}`}>{label}</span>
      <span className={`text-xs ${bold ? "font-black text-xl text-foreground" : highlight ? "text-primary font-black" : "font-black text-foreground"}`}>
        {value}
      </span>
    </div>
  );
}
