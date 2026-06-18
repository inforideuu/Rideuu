import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { e as Bell, o as CloudRain, a9 as Wallet, a2 as Trophy, U as ShieldAlert, l as CircleCheck, w as Info, a6 as UserPlus } from "../_libs/lucide-react.mjs";
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
function Notifications() {
  const {
    notificationsList,
    clearNotifications,
    t,
    language
  } = useRider();
  const handleClear = () => {
    clearNotifications();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: t("notifications"), right: notificationsList.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleClear, className: "text-[10px] font-black text-primary underline", children: "Clear All" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 space-y-3 pb-8", children: notificationsList.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-16 bg-card border border-border rounded-3xl p-6 text-muted-foreground shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-10 w-10 text-muted-foreground/30 mx-auto mb-2 animate-bounce" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-bold text-xs text-foreground uppercase tracking-wider", children: "No notifications yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1 leading-relaxed", children: "We'll alert you about Chennai rain bonuses, surge updates, and active KYC statuses." })
    ] }) : notificationsList.map((n) => {
      let IconComponent = Bell;
      if (n.iconName === "CloudRain") IconComponent = CloudRain;
      else if (n.iconName === "Wallet" || n.iconName === "ArrowDownToLine") IconComponent = Wallet;
      else if (n.iconName === "Trophy") IconComponent = Trophy;
      else if (n.iconName === "ShieldAlert") IconComponent = ShieldAlert;
      else if (n.iconName === "CheckCircle2") IconComponent = CircleCheck;
      else if (n.iconName === "Upload" || n.iconName === "Info") IconComponent = Info;
      else if (n.iconName === "UserPlus") IconComponent = UserPlus;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-3.5 rounded-2xl bg-card border p-4 shadow-sm hover:border-primary/25 transition slide-up ${n.type === "alert" || n.type === "safety" ? "border-red-500/20 bg-red-500/[0.02]" : "border-border"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${n.type === "safety" || n.type === "alert" ? "bg-red-500/10 text-red-500 animate-pulse" : n.type === "earnings" ? "bg-success/10 text-success" : "bg-accent text-primary"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-foreground tracking-tight leading-snug", children: language === "ta" ? t(n.titleKey) : n.titleEn }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1", children: language === "ta" ? t(n.subKey) : n.subEn })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground shrink-0 font-bold uppercase", children: n.time })
      ] }, n.id);
    }) })
  ] });
}
export {
  Notifications as component
};
