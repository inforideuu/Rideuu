import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider, a as api } from "./router-CTtxc6Rr.mjs";
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
import "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function History() {
  const {
    t
  } = useRider();
  const [completedRides, setCompletedRides] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    async function loadHistory() {
      try {
        const rides = await api.getRides();
        if (rides) {
          const completed = rides.filter((r) => r.status === "completed" || r.status === "COMPLETED");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { subtitle: "RIDE HISTORY", title: "All Completed Trips" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 space-y-3", children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-xs text-muted-foreground", children: "Loading history..." }) : completedRides.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-10 text-xs text-muted-foreground", children: "No completed rides found." }) : completedRides.map((r) => {
      const timeStr = r.created_at ? new Date(r.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      }) : "Recently";
      const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString([], {
        day: "numeric",
        month: "short"
      }) : "Today";
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider bg-accent text-primary px-2 py-1 rounded-full", children: r.vehicle_type || "Auto" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
            dateStr,
            " · ",
            timeStr
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-success" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-border my-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-primary" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: r.pickup }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground my-1", children: "↓" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: r.dropoff })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold", children: [
              "₹",
              r.fare
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-success font-bold uppercase tracking-wider mt-1", children: r.payment_mode === "cash" ? "Paid (Cash)" : "Paid (Wallet)" })
          ] })
        ] })
      ] }, r.id);
    }) })
  ] });
}
export {
  History as component
};
