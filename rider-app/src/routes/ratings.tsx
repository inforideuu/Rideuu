import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { Star, ShieldCheck, MessageSquare, ThumbsUp, Heart } from "lucide-react";
import { useRider } from "../context/RiderContext";
import { useState, useEffect, useMemo } from "react";
import { api } from "../lib/api";

export const Route = createFileRoute("/ratings")({ component: Ratings });

function Ratings() {
  const { t, language, rating } = useRider();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRatings() {
      try {
        const res = await api.getRides();
        if (res) {
          const rated = res.filter((r: any) => r.status === "completed" && r.rating_driver !== null && r.rating_driver !== undefined);
          setRides(rated);
        }
      } catch (err) {
        console.warn("Failed fetching ratings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRatings();
  }, []);

  const breakdown = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    rides.forEach((r: any) => {
      const s = Math.round(r.rating_driver);
      if (s >= 1 && s <= 5) {
        counts[s as 5|4|3|2|1] += 1;
      }
    });
    
    const total = rides.length;
    const percentages = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (total > 0) {
      [1, 2, 3, 4, 5].forEach(s => {
        percentages[s as 5|4|3|2|1] = Math.round((counts[s as 5|4|3|2|1] / total) * 100);
      });
    } else {
      percentages[5] = 100;
    }
    return percentages;
  }, [rides]);

  return (
    <MobileShell>
      <PageHeader subtitle={t("ratings_reviews").toUpperCase()} title={`${rating.toFixed(2)} ★ (${rides.length} Rated Trips)`} />

      <div className="px-5 pb-8 space-y-4">
        {/* Rating Breakdown bars */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center gap-3.5 mb-4 border-b border-border pb-3">
            <ShieldCheck className="h-6 w-6 text-success fill-success/10 shrink-0" />
            <div>
              <div className="font-bold text-xs text-foreground uppercase tracking-wide">TRUSTED DRIVER SCORE</div>
              <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">Rating from completed trips</div>
            </div>
          </div>

          {[5, 4, 3, 2, 1].map((s) => (
            <div key={s} className="flex items-center gap-3 py-1 font-semibold text-xs text-foreground">
              <span className="w-3 text-right">{s}</span>
              <Star className="h-3 w-3 text-primary fill-primary" />
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${breakdown[s as 5|4|3|2|1]}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground w-8 text-right font-bold">{breakdown[s as 5|4|3|2|1]}%</span>
            </div>
          ))}
        </div>

        {/* Feedback highlights */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <ThumbsUp className="h-5 w-5 text-primary mx-auto mb-1.5" />
            <div className="font-black text-sm text-foreground">
              {rides.length > 0 ? `${Math.round((rides.filter(r => r.rating_driver >= 4).length / rides.length) * 100)}%` : "100%"}
            </div>
            <div className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Safe Driving</div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 text-center">
            <Heart className="h-5 w-5 text-pink-500 mx-auto mb-1.5" />
            <div className="font-black text-sm text-foreground">
              {rides.length > 0 ? `${Math.round((rides.filter(r => r.rating_driver >= 4).length / rides.length) * 100)}%` : "100%"}
            </div>
            <div className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Politeness Rate</div>
          </div>
        </div>

        {/* Reviews Feed */}
        <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground mt-4 mb-2 flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-primary" />
          {language === "ta" ? "வாடிக்கையாளர் விமர்சனங்கள்" : "Customer reviews"}
        </h3>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-5 text-xs text-muted-foreground">Loading reviews...</div>
          ) : rides.length === 0 ? (
            <div className="text-center py-5 text-xs text-muted-foreground">No customer reviews yet.</div>
          ) : (
            rides.map((r, i) => {
              const timeStr = r.created_at ? new Date(r.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' }) : "Recently";
              return (
                <div key={r.id} className="rounded-3xl bg-card border border-border p-5 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-bold text-sm text-foreground">{r.customer_name || "Passenger"}</div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">{timeStr}</span>
                  </div>
                  
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        className={`h-3.5 w-3.5 ${
                          j < r.rating_driver ? "fill-primary text-primary" : "text-muted-foreground/20"
                        }`}
                      />
                    ))}
                  </div>
                  
                  <p className="text-xs text-muted-foreground leading-relaxed font-semibold italic">
                    "{language === "ta" 
                      ? `சவாரி வெற்றி. பயணி மதிப்பீடு: ${r.rating_driver} நட்சத்திரங்கள்.` 
                      : `Ride complete. Rated ${r.rating_driver} stars by the customer.`}"
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </MobileShell>
  );
}
