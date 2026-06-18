import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider, a as api } from "./router-CTtxc6Rr.mjs";
import { V as ShieldCheck, Z as Star, $ as ThumbsUp, H as Heart, E as MessageSquare } from "../_libs/lucide-react.mjs";
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
function Ratings() {
  const {
    t,
    language,
    rating
  } = useRider();
  const [rides, setRides] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    async function loadRatings() {
      try {
        const res = await api.getRides();
        if (res) {
          const rated = res.filter((r) => r.status === "completed" && r.rating_driver !== null && r.rating_driver !== void 0);
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
  const breakdown = reactExports.useMemo(() => {
    const counts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };
    rides.forEach((r) => {
      const s = Math.round(r.rating_driver);
      if (s >= 1 && s <= 5) {
        counts[s] += 1;
      }
    });
    const total = rides.length;
    const percentages = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };
    if (total > 0) {
      [1, 2, 3, 4, 5].forEach((s) => {
        percentages[s] = Math.round(counts[s] / total * 100);
      });
    } else {
      percentages[5] = 100;
    }
    return percentages;
  }, [rides]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { subtitle: t("ratings_reviews").toUpperCase(), title: `${rating.toFixed(2)} ★ (${rides.length} Rated Trips)` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pb-8 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5 mb-4 border-b border-border pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-6 w-6 text-success fill-success/10 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-foreground uppercase tracking-wide", children: "TRUSTED DRIVER SCORE" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold mt-0.5", children: "Rating from completed trips" })
          ] })
        ] }),
        [5, 4, 3, 2, 1].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-1 font-semibold text-xs text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-3 text-right", children: s }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 text-primary fill-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary rounded-full transition-all", style: {
            width: `${breakdown[s]}%`
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-muted-foreground w-8 text-right font-bold", children: [
            breakdown[s],
            "%"
          ] })
        ] }, s))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: "h-5 w-5 text-primary mx-auto mb-1.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-sm text-foreground", children: rides.length > 0 ? `${Math.round(rides.filter((r) => r.rating_driver >= 4).length / rides.length * 100)}%` : "100%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground font-bold uppercase mt-0.5", children: "Safe Driving" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "h-5 w-5 text-pink-500 mx-auto mb-1.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-sm text-foreground", children: rides.length > 0 ? `${Math.round(rides.filter((r) => r.rating_driver >= 4).length / rides.length * 100)}%` : "100%" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground font-bold uppercase mt-0.5", children: "Politeness Rate" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-black text-sm uppercase tracking-wider text-muted-foreground mt-4 mb-2 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4 w-4 text-primary" }),
        language === "ta" ? "வாடிக்கையாளர் விமர்சனங்கள்" : "Customer reviews"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-5 text-xs text-muted-foreground", children: "Loading reviews..." }) : rides.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-5 text-xs text-muted-foreground", children: "No customer reviews yet." }) : rides.map((r, i) => {
        const timeStr = r.created_at ? new Date(r.created_at).toLocaleDateString([], {
          day: "numeric",
          month: "short"
        }) : "Recently";
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground", children: r.customer_name || "Passenger" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground font-bold uppercase", children: timeStr })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0.5 mb-3", children: Array.from({
            length: 5
          }).map((_, j) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `h-3.5 w-3.5 ${j < r.rating_driver ? "fill-primary text-primary" : "text-muted-foreground/20"}` }, j)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground leading-relaxed font-semibold italic", children: [
            '"',
            language === "ta" ? `சவாரி வெற்றி. பயணி மதிப்பீடு: ${r.rating_driver} நட்சத்திரங்கள்.` : `Ride complete. Rated ${r.rating_driver} stars by the customer.`,
            '"'
          ] })
        ] }, r.id);
      }) })
    ] })
  ] });
}
export {
  Ratings as component
};
