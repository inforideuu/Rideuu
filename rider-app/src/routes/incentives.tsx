import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { Trophy, Zap, Target, Star, Crown } from "lucide-react";
import { useRider } from "../context/RiderContext";
import { useState, useEffect, useMemo } from "react";
import { api } from "../lib/api";

export const Route = createFileRoute("/incentives")({ component: Incentives });

function Incentives() {
  const { t, language, completedRides, phone } = useRider();
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const res = await api.getLeaderboard();
        if (res) {
          setLeaders(res);
        }
      } catch (err) {
        console.warn("Failed fetching leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const challenges = useMemo(() => {
    const tripProg = Math.min(100, Math.round((completedRides / 25) * 100));
    const streakProg = Math.min(100, Math.round((completedRides / 10) * 100));
    
    return [
      { id: "inc-1", icon: Target, title: language === "ta" ? "25 சவாரிகளை முடிக்கவும்" : "Complete 25 trips", sub: `Progress: ${completedRides} / 25 trips · Reward ₹500`, prog: tripProg },
      { id: "inc-2", icon: Zap, title: language === "ta" ? "10 சவாரிகள் போனஸ் சவால்" : "10 trips streak challenge", sub: `Progress: ${completedRides} / 10 trips · Reward ₹300`, prog: streakProg },
    ];
  }, [completedRides, language]);

  return (
    <MobileShell>
      <PageHeader subtitle={t("incentives_bonuses").toUpperCase()} title={language === "ta" ? "செயலில் உள்ள சவால்கள்" : "Active challenges"} />
      
      <div className="px-5 space-y-4 pb-8">
        {/* Targets list */}
        <div className="space-y-3">
          {challenges.map((c) => (
            <div key={c.id} className="rounded-3xl bg-card border border-border p-5 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3.5">
                <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <c.icon className="h-5.5 w-5.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-foreground tracking-tight truncate">{c.title}</div>
                  <div className="text-[10px] text-muted-foreground font-semibold uppercase mt-0.5">{c.sub}</div>
                </div>
                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{c.prog}%</span>
              </div>
              
              <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                  style={{ width: `${c.prog}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Chennai Leaderboard Panel */}
        <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex items-center gap-2 mb-4">
            <Crown className="h-5 w-5 text-yellow-400 animate-bounce" />
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              {language === "ta" ? "சென்னை லீடர்போர்டு" : "Chennai Leaderboard"}
            </h3>
          </div>

          <div className="space-y-3 border-t border-white/5 pt-4">
            {loading ? (
              <div className="text-center py-5 text-xs text-slate-400">Loading leaderboard...</div>
            ) : leaders.length === 0 ? (
              <div className="text-center py-5 text-xs text-slate-400">No leaderboard data found.</div>
            ) : (
              leaders.map((lead, idx) => {
                const isMe = lead.phone === phone;
                return (
                  <div
                    key={lead.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                      isMe
                        ? "bg-primary text-white border border-primary/20"
                        : "bg-white/5 border border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-black w-5 text-center ${isMe ? "text-white" : "text-slate-400"}`}>
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold block">{lead.name} {isMe ? "(You)" : ""}</span>
                        <span className={`text-[9px] font-semibold flex items-center gap-1 mt-0.5 ${isMe ? "text-red-100" : "text-slate-400"}`}>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> {lead.rating?.toFixed(1) || "5.0"} · {lead.completed_rides} Trips Completed
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      {isMe ? (
                        <span className="text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded">
                          Rider Rank
                        </span>
                      ) : (
                        <span className="text-xs font-black text-slate-300">
                          #{idx + 1}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
