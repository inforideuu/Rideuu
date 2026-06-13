import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { useRider } from "../context/RiderContext";

export const Route = createFileRoute("/history")({ component: History });

function History() {
  const { t } = useRider();
  const [completedRides, setCompletedRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const rides = await api.getRides();
        if (rides) {
          // Filter to show only completed rides
          const completed = rides.filter((r: any) => r.status === "completed" || r.status === "COMPLETED");
          setCompletedRides(completed);
        }
      } catch (err) {
        console.warn("Failed fetching ride history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  return (
    <MobileShell>
      <PageHeader subtitle="RIDE HISTORY" title="All Completed Trips" />
      <div className="px-5 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-xs text-muted-foreground">Loading history...</div>
        ) : completedRides.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted-foreground">No completed rides found.</div>
        ) : (
          completedRides.map((r: any) => {
            const timeStr = r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently";
            const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString([], { day: 'numeric', month: 'short' }) : "Today";
            return (
              <div key={r.id} className="rounded-2xl bg-card border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent text-primary px-2 py-1 rounded-full">
                    {r.vehicle_type || "Auto"}
                  </span>
                  <span className="text-xs text-muted-foreground">{dateStr} · {timeStr}</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <div className="w-px h-6 bg-border my-1" />
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{r.pickup}</div>
                    <div className="text-xs text-muted-foreground my-1">↓</div>
                    <div className="font-semibold text-sm">{r.dropoff}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">₹{r.fare}</div>
                    <div className="text-[10px] text-success font-bold uppercase tracking-wider mt-1">
                      {r.payment_mode === "cash" ? "Paid (Cash)" : "Paid (Wallet)"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </MobileShell>
  );
}
