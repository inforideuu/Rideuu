import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { TrendingUp, BarChart2, Zap, CloudRain, Clock, Landmark, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { useRider } from "../context/RiderContext";

export const Route = createFileRoute("/earnings")({
  component: Earnings,
});

const tabs = ["Day", "Week", "Month", "Year"] as const;

function Earnings() {
  const { t, language, transactions, completedRides, ridesList, noCommissionExpiry } = useRider();
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Week");

  // Dynamic graph bars based on active period using real rides
  const barData = useMemo(() => {
    // Map completed rides to earning amounts and dates
    const completedRidesMapped = ridesList
      .filter(ride => ride.status === "completed" && ride.created_at)
      .map(ride => {
        const fare = parseFloat(ride.fare) || 0;
        const vType = ride.vehicle_type || "bike";
        const isAuto = vType.toLowerCase().includes("auto");
        const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1000);
        const commPercent = hasNoComm ? 0.0 : (isAuto ? 0.08 : 0.05);
        const commAmt = hasNoComm ? 3.0 : (fare * commPercent);
        const netEarnings = Math.max(0, fare - commAmt);
        return {
          date: ride.created_at,
          val: netEarnings
        };
      });

    if (activeTab === "Day") {
      // Group by last 5 rides for visual distribution
      const lastRides = completedRidesMapped.slice(0, 5).reverse();
      return lastRides.map((r, idx) => {
        return {
          label: r.date.includes("T") ? r.date.split("T")[0].split("-")[2] : `T-${idx}`,
          val: Math.round(r.val * 100) / 100,
          highlight: idx === lastRides.length - 1
        };
      });
    }
    
    if (activeTab === "Week") {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const weeklySum: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
      
      completedRidesMapped.forEach(r => {
        const d = new Date(r.date);
        if (!isNaN(d.getTime())) {
          const dayName = days[d.getDay()];
          weeklySum[dayName] += r.val;
        } else {
          const todayName = days[new Date().getDay()];
          weeklySum[todayName] += r.val;
        }
      });
      
      const todayIndex = new Date().getDay();
      return days.map((day, idx) => ({
        label: day,
        val: Math.round(weeklySum[day] * 100) / 100,
        highlight: idx === todayIndex
      }));
    }

    if (activeTab === "Month") {
      const weeklySum = [0, 0, 0, 0];
      completedRidesMapped.forEach(r => {
        const d = new Date(r.date);
        if (!isNaN(d.getTime())) {
          const wkIdx = Math.min(3, Math.floor((d.getDate() - 1) / 7));
          weeklySum[wkIdx] += r.val;
        } else {
          const wkIdx = Math.min(3, Math.floor((new Date().getDate() - 1) / 7));
          weeklySum[wkIdx] += r.val;
        }
      });
      return weeklySum.map((val, idx) => ({
        label: `Wk ${idx + 1}`,
        val: Math.round(val * 100) / 100,
        highlight: idx === Math.min(3, Math.floor((new Date().getDate() - 1) / 7))
      }));
    }

    const yearlySum: Record<string, number> = {};
    completedRidesMapped.forEach(r => {
      const d = new Date(r.date);
      const year = !isNaN(d.getTime()) ? String(d.getFullYear()) : String(new Date().getFullYear());
      yearlySum[year] = (yearlySum[year] || 0) + r.val;
    });
    const years = Object.keys(yearlySum).sort();
    if (years.length === 0) {
      years.push(String(new Date().getFullYear()));
    }
    return years.map(yr => ({
      label: yr,
      val: Math.round((yearlySum[yr] || 0) * 100) / 100,
      highlight: yr === String(new Date().getFullYear())
    }));
  }, [ridesList, activeTab, noCommissionExpiry]);

  const totalSum = useMemo(() => {
    return Math.round(barData.reduce((acc, curr) => acc + curr.val, 0) * 100) / 100;
  }, [barData]);

  // Derived metrics from transactions and ridesList
  const metrics = useMemo(() => {
    const withdrawTxs = transactions.filter(tx => !tx.positive && tx.titleEn.toLowerCase().includes("withdraw"));
    
    const totalFaresSum = ridesList
      .filter(ride => ride.status === "completed")
      .reduce((acc, ride) => {
        const fare = parseFloat(ride.fare) || 0;
        const vType = ride.vehicle_type || "bike";
        const isAuto = vType.toLowerCase().includes("auto");
        const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1000);
        const commPercent = hasNoComm ? 0.0 : (isAuto ? 0.08 : 0.05);
        const commAmt = hasNoComm ? 3.0 : (fare * commPercent);
        const netEarnings = Math.max(0, fare - commAmt);
        return acc + netEarnings;
      }, 0);
    
    const totalWithdrawalsSum = withdrawTxs.reduce((acc, tx) => {
      const amt = parseFloat(tx.amount.replace(/[^\d.]/g, ""));
      return acc + (isNaN(amt) ? 0 : amt);
    }, 0);

    const tripCount = ridesList.filter(ride => ride.status === "completed").length;
    const avgPerTrip = tripCount > 0 ? Math.round(totalFaresSum / tripCount) : 0;

    return {
      trips: tripCount,
      totalFares: Math.round(totalFaresSum * 100) / 100,
      withdrawals: Math.round(totalWithdrawalsSum * 100) / 100,
      avgTrip: avgPerTrip
    };
  }, [transactions, ridesList, noCommissionExpiry]);

  return (
    <MobileShell>
      <PageHeader
        subtitle={t("earnings_est").toUpperCase()}
        title={`₹${totalSum.toLocaleString()} this ${activeTab.toLowerCase()}`}
      />

      <div className="px-5">
        {/* Dynamic Period Tabs */}
        <div className="flex gap-1.5 rounded-full bg-card border border-border p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-black rounded-full transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {language === "ta"
                ? tab === "Day" ? "நாள்" : tab === "Week" ? "வாரம்" : tab === "Month" ? "மாதம்" : "ஆண்டு"
                : tab}
            </button>
          ))}
        </div>

        {/* Premium Graph Plotter */}
        <div className="mt-5 rounded-3xl bg-card border border-border p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold mb-4 border-b border-border pb-3 text-muted-foreground">
            <span className="flex items-center gap-1"><BarChart2 className="h-4 w-4 text-primary" /> Shift Revenue analytics</span>
            <span className="text-primary font-black uppercase text-[10px]">Chennai Hotspots</span>
          </div>

          <div className="flex items-end justify-between h-40 gap-3 mt-6">
            {barData.length === 0 ? (
              <div className="w-full text-center py-10 text-xs text-muted-foreground">No earnings data for this period</div>
            ) : (
              barData.map((bar, i) => {
                const maxVal = Math.max(...barData.map(b => b.val));
                const heightPct = maxVal > 0 ? Math.round((bar.val / maxVal) * 85) : 5;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[8px] font-black text-foreground opacity-60">
                      {bar.val > 1000 ? `${(bar.val / 1000).toFixed(1)}k` : bar.val}
                    </div>
                    <div
                      className={`w-full rounded-t-xl transition-all duration-700 relative overflow-hidden ${
                        bar.highlight
                          ? "bg-primary shadow-lg shadow-primary/30"
                          : "bg-accent border border-primary/10"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15),transparent)]" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-extrabold uppercase">{bar.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Dynamic Analytics Stats Card grid */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Card label={t("trips")} value={String(metrics.trips)} icon={TrendingUp} />
          <Card label="Total Fares" value={`₹${metrics.totalFares}`} icon={Landmark} />
          <Card label="Withdrawals" value={`₹${metrics.withdrawals}`} highlight icon={TrendingUp} />
          <Card label="Avg / trip" value={`₹${metrics.avgTrip}`} icon={Landmark} />
        </div>

        {/* Payout history tracking log */}
        <h3 className="mt-6 mb-3 font-black text-sm uppercase tracking-wider text-muted-foreground">
          {language === "ta" ? "சமீபத்திய பணம் செலுத்துதல்" : "Recent settlements"}
        </h3>
        <div className="space-y-3 pb-8">
          {transactions.filter(tx => !tx.positive && tx.titleEn.toLowerCase().includes("withdraw")).slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex items-center justify-between rounded-2xl bg-card border border-border p-4 shadow-sm">
              <div>
                <div className="font-bold text-sm text-foreground">{tx.date}</div>
                <div className="text-[10px] text-muted-foreground font-extrabold uppercase mt-0.5">{tx.titleEn}</div>
              </div>
              <div className="text-right">
                <div className="font-black text-base text-foreground">{tx.amount}</div>
                <div className="text-[10px] text-success font-bold uppercase tracking-wider mt-0.5">Paid via Bank</div>
              </div>
            </div>
          ))}
          {transactions.filter(tx => !tx.positive && tx.titleEn.toLowerCase().includes("withdraw")).length === 0 && (
            <div className="text-center py-8 text-xs text-muted-foreground">No recent settlements found.</div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}

function Card({
  label, value, highlight, icon: Icon
}: {
  label: string;
  value: string;
  highlight?: boolean;
  icon: any;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border shadow-sm transition flex flex-col justify-between ${
        highlight
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card border-border"
      }`}
    >
      <div className="flex justify-between items-start">
        <span className={`text-[10px] font-black uppercase tracking-wider ${highlight ? "opacity-90" : "text-muted-foreground"}`}>
          {label}
        </span>
        <Icon className={`h-4.5 w-4.5 ${highlight ? "text-white" : "text-primary/70"}`} />
      </div>
      <div className="mt-3 text-xl font-black tracking-tight">{value}</div>
    </div>
  );
}
