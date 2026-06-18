import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider, a as api } from "./router-CTtxc6Rr.mjs";
import { _ as Target, ac as Zap, s as Crown, Z as Star } from "../_libs/lucide-react.mjs";
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
function Incentives() {
  const {
    t,
    language,
    completedRides,
    phone
  } = useRider();
  const [leaders, setLeaders] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
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
  const challenges = reactExports.useMemo(() => {
    const tripProg = Math.min(100, Math.round(completedRides / 25 * 100));
    const streakProg = Math.min(100, Math.round(completedRides / 10 * 100));
    return [{
      id: "inc-1",
      icon: Target,
      title: language === "ta" ? "25 சவாரிகளை முடிக்கவும்" : "Complete 25 trips",
      sub: `Progress: ${completedRides} / 25 trips · Reward ₹500`,
      prog: tripProg
    }, {
      id: "inc-2",
      icon: Zap,
      title: language === "ta" ? "10 சவாரிகள் போனஸ் சவால்" : "10 trips streak challenge",
      sub: `Progress: ${completedRides} / 10 trips · Reward ₹300`,
      prog: streakProg
    }];
  }, [completedRides, language]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { subtitle: t("incentives_bonuses").toUpperCase(), title: language === "ta" ? "செயலில் உள்ள சவால்கள்" : "Active challenges" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 space-y-4 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: challenges.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(c.icon, { className: "h-5.5 w-5.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-sm text-foreground tracking-tight truncate", children: c.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold uppercase mt-0.5", children: c.sub })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded", children: [
            c.prog,
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-2 rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500", style: {
          width: `${c.prog}%`
        } }) })
      ] }, c.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-900 border border-white/10 p-5 text-white shadow-xl relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary/15 to-transparent rounded-bl-full pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "h-5 w-5 text-yellow-400 animate-bounce" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-sm uppercase tracking-wider text-white", children: language === "ta" ? "சென்னை லீடர்போர்டு" : "Chennai Leaderboard" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3 border-t border-white/5 pt-4", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-5 text-xs text-slate-400", children: "Loading leaderboard..." }) : leaders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-5 text-xs text-slate-400", children: "No leaderboard data found." }) : leaders.map((lead, idx) => {
          const isMe = lead.phone === phone;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center justify-between p-2.5 rounded-xl transition ${isMe ? "bg-primary text-white border border-primary/20" : "bg-white/5 border border-white/5"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-xs font-black w-5 text-center ${isMe ? "text-white" : "text-slate-400"}`, children: [
                "#",
                idx + 1
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold block", children: [
                  lead.name,
                  " ",
                  isMe ? "(You)" : ""
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `text-[9px] font-semibold flex items-center gap-1 mt-0.5 ${isMe ? "text-red-100" : "text-slate-400"}`, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-yellow-400 text-yellow-400" }),
                  " ",
                  lead.rating?.toFixed(1) || "5.0",
                  " · ",
                  lead.completed_rides,
                  " Trips Completed"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: isMe ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black uppercase bg-white/20 px-2 py-0.5 rounded", children: "Rider Rank" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black text-slate-300", children: [
              "#",
              idx + 1
            ] }) })
          ] }, lead.id);
        }) })
      ] })
    ] })
  ] });
}
export {
  Incentives as component
};
