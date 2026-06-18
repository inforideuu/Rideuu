import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { h as ChartNoAxesColumn, a0 as TrendingUp, L as Landmark } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
const tabs = ["Day", "Week", "Month", "Year"];
function Earnings() {
  const {
    t,
    language,
    transactions,
    completedRides,
    ridesList,
    noCommissionExpiry
  } = useRider();
  const [activeTab, setActiveTab] = reactExports.useState("Week");
  const barData = reactExports.useMemo(() => {
    const completedRidesMapped = ridesList.filter((ride) => ride.status === "completed" && ride.created_at).map((ride) => {
      const fare = parseFloat(ride.fare) || 0;
      const vType = ride.vehicle_type || "bike";
      const isAuto = vType.toLowerCase().includes("auto");
      const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1e3);
      const commPercent = hasNoComm ? 0 : isAuto ? 0.08 : 0.05;
      const commAmt = hasNoComm ? 3 : fare * commPercent;
      const netEarnings = Math.max(0, fare - commAmt);
      return {
        date: ride.created_at,
        val: netEarnings
      };
    });
    if (activeTab === "Day") {
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
      const weeklySum = {
        Sun: 0,
        Mon: 0,
        Tue: 0,
        Wed: 0,
        Thu: 0,
        Fri: 0,
        Sat: 0
      };
      completedRidesMapped.forEach((r) => {
        const d = new Date(r.date);
        if (!isNaN(d.getTime())) {
          const dayName = days[d.getDay()];
          weeklySum[dayName] += r.val;
        } else {
          const todayName = days[(/* @__PURE__ */ new Date()).getDay()];
          weeklySum[todayName] += r.val;
        }
      });
      const todayIndex = (/* @__PURE__ */ new Date()).getDay();
      return days.map((day, idx) => ({
        label: day,
        val: Math.round(weeklySum[day] * 100) / 100,
        highlight: idx === todayIndex
      }));
    }
    if (activeTab === "Month") {
      const weeklySum = [0, 0, 0, 0];
      completedRidesMapped.forEach((r) => {
        const d = new Date(r.date);
        if (!isNaN(d.getTime())) {
          const wkIdx = Math.min(3, Math.floor((d.getDate() - 1) / 7));
          weeklySum[wkIdx] += r.val;
        } else {
          const wkIdx = Math.min(3, Math.floor(((/* @__PURE__ */ new Date()).getDate() - 1) / 7));
          weeklySum[wkIdx] += r.val;
        }
      });
      return weeklySum.map((val, idx) => ({
        label: `Wk ${idx + 1}`,
        val: Math.round(val * 100) / 100,
        highlight: idx === Math.min(3, Math.floor(((/* @__PURE__ */ new Date()).getDate() - 1) / 7))
      }));
    }
    const yearlySum = {};
    completedRidesMapped.forEach((r) => {
      const d = new Date(r.date);
      const year = !isNaN(d.getTime()) ? String(d.getFullYear()) : String((/* @__PURE__ */ new Date()).getFullYear());
      yearlySum[year] = (yearlySum[year] || 0) + r.val;
    });
    const years = Object.keys(yearlySum).sort();
    if (years.length === 0) {
      years.push(String((/* @__PURE__ */ new Date()).getFullYear()));
    }
    return years.map((yr) => ({
      label: yr,
      val: Math.round((yearlySum[yr] || 0) * 100) / 100,
      highlight: yr === String((/* @__PURE__ */ new Date()).getFullYear())
    }));
  }, [ridesList, activeTab, noCommissionExpiry]);
  const totalSum = reactExports.useMemo(() => {
    return Math.round(barData.reduce((acc, curr) => acc + curr.val, 0) * 100) / 100;
  }, [barData]);
  const metrics = reactExports.useMemo(() => {
    const withdrawTxs = transactions.filter((tx) => !tx.positive && tx.titleEn.toLowerCase().includes("withdraw"));
    const totalFaresSum = ridesList.filter((ride) => ride.status === "completed").reduce((acc, ride) => {
      const fare = parseFloat(ride.fare) || 0;
      const vType = ride.vehicle_type || "bike";
      const isAuto = vType.toLowerCase().includes("auto");
      const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1e3);
      const commPercent = hasNoComm ? 0 : isAuto ? 0.08 : 0.05;
      const commAmt = hasNoComm ? 3 : fare * commPercent;
      const netEarnings = Math.max(0, fare - commAmt);
      return acc + netEarnings;
    }, 0);
    const totalWithdrawalsSum = withdrawTxs.reduce((acc, tx) => {
      const amt = parseFloat(tx.amount.replace(/[^\d.]/g, ""));
      return acc + (isNaN(amt) ? 0 : amt);
    }, 0);
    const tripCount = ridesList.filter((ride) => ride.status === "completed").length;
    const avgPerTrip = tripCount > 0 ? Math.round(totalFaresSum / tripCount) : 0;
    return {
      trips: tripCount,
      totalFares: Math.round(totalFaresSum * 100) / 100,
      withdrawals: Math.round(totalWithdrawalsSum * 100) / 100,
      avgTrip: avgPerTrip
    };
  }, [transactions, ridesList, noCommissionExpiry]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { subtitle: t("earnings_est").toUpperCase(), title: `₹${totalSum.toLocaleString()} this ${activeTab.toLowerCase()}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 rounded-full bg-card border border-border p-1 shadow-sm", children: tabs.map((tab) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTab(tab), className: `flex-1 py-2 text-xs font-black rounded-full transition-all ${activeTab === tab ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"}`, children: language === "ta" ? tab === "Day" ? "நாள்" : tab === "Week" ? "வாரம்" : tab === "Month" ? "மாதம்" : "ஆண்டு" : tab }, tab)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-3xl bg-card border border-border p-5 shadow-sm relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-bold mb-4 border-b border-border pb-3 text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChartNoAxesColumn, { className: "h-4 w-4 text-primary" }),
            " Shift Revenue analytics"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-black uppercase text-[10px]", children: "Chennai Hotspots" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end justify-between h-40 gap-3 mt-6", children: barData.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full text-center py-10 text-xs text-muted-foreground", children: "No earnings data for this period" }) : barData.map((bar, i) => {
          const maxVal = Math.max(...barData.map((b) => b.val));
          const heightPct = maxVal > 0 ? Math.round(bar.val / maxVal * 85) : 5;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col items-center gap-2 h-full justify-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-black text-foreground opacity-60", children: bar.val > 1e3 ? `${(bar.val / 1e3).toFixed(1)}k` : bar.val }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-full rounded-t-xl transition-all duration-700 relative overflow-hidden ${bar.highlight ? "bg-primary shadow-lg shadow-primary/30" : "bg-accent border border-primary/10"}`, style: {
              height: `${heightPct}%`
            }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15),transparent)]" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-extrabold uppercase", children: bar.label })
          ] }, i);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { label: t("trips"), value: String(metrics.trips), icon: TrendingUp }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { label: "Total Fares", value: `₹${metrics.totalFares}`, icon: Landmark }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { label: "Withdrawals", value: `₹${metrics.withdrawals}`, highlight: true, icon: TrendingUp }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { label: "Avg / trip", value: `₹${metrics.avgTrip}`, icon: Landmark })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-6 mb-3 font-black text-sm uppercase tracking-wider text-muted-foreground", children: language === "ta" ? "சமீபத்திய பணம் செலுத்துதல்" : "Recent settlements" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pb-8", children: [
        transactions.filter((tx) => !tx.positive && tx.titleEn.toLowerCase().includes("withdraw")).slice(0, 5).map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-card border border-border p-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground", children: tx.date }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-extrabold uppercase mt-0.5", children: tx.titleEn })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-base text-foreground", children: tx.amount }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-success font-bold uppercase tracking-wider mt-0.5", children: "Paid via Bank" })
          ] })
        ] }, tx.id)),
        transactions.filter((tx) => !tx.positive && tx.titleEn.toLowerCase().includes("withdraw")).length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-8 text-xs text-muted-foreground", children: "No recent settlements found." })
      ] })
    ] })
  ] });
}
function Card({
  label,
  value,
  highlight,
  icon: Icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `rounded-2xl p-4 border shadow-sm transition flex flex-col justify-between ${highlight ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] font-black uppercase tracking-wider ${highlight ? "opacity-90" : "text-muted-foreground"}`, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4.5 w-4.5 ${highlight ? "text-white" : "text-primary/70"}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-xl font-black tracking-tight", children: value })
  ] });
}
export {
  Earnings as component
};
