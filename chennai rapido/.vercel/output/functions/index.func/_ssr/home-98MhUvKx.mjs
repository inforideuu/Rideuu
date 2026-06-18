import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, t as translate, s as store } from "./router-BpidCmwR.mjs";
import { B as Bell, a6 as TriangleAlert, p as CloudRain, I as MapPin, K as Mic, f as Bike, Z as ShieldAlert, g as CalendarClock, U as Receipt, u as Globe, l as ChevronRight, a0 as Sparkles } from "../_libs/lucide-react.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function Home() {
  const {
    language,
    theme,
    profile,
    savedAddresses,
    notifications,
    wallet
  } = useAppStore();
  const navigate = useNavigate();
  const t = (key) => translate(key, language);
  const unreadNotifications = notifications.filter((n) => n.unread).length;
  const handleQuickBook = (destLabel, destAddr) => {
    store.update((s) => {
      s.ride.drop = destLabel + " · " + destAddr;
      s.ride.step = "vehicle";
    });
    navigate({
      to: "/app/book"
    });
  };
  const handleMicClick = () => {
    navigate({
      to: "/app/voice"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-24 text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative overflow-hidden bg-secondary text-secondary-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-10 -top-10 size-40 rounded-full bg-primary/20 blur-2xl animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between px-5 pt-12 pb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-primary", children: language === "en" ? `வணக்கம், ${profile.name.split(" ")[0]}` : `வணக்கம், ${profile.name.split(" ")[0]}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-xl font-extrabold tracking-tight", children: t("Where to today?") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/notifications", className: "relative grid size-10 place-items-center rounded-2xl bg-secondary-foreground/10 border border-secondary-foreground/5 shadow-sm active:scale-95 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-4.5" }),
          unreadNotifications > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[8px] font-black text-primary-foreground animate-bounce", children: unreadNotifications })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checkered-sm h-1.5 w-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 animate-bounce", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-4.5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-amber-600 flex items-center gap-1.5", children: [
          "Chennai Rain Advisory ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "size-3.5 text-amber-500" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 leading-relaxed", children: language === "en" ? "Waterlogging reported near Velachery & OMR hubs. Auto-flood routing enabled. Safe pathways prioritized." : "வேளச்சேரி மற்றும் ஓஎம்ஆர் பகுதிகளில் வெள்ளப்பெருக்கு. மாற்றுப்பாதை பாதுகாப்புடன் இயக்கப்படுகிறது." })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-4 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: () => navigate({
      to: "/app/book"
    }), className: "relative block rounded-2xl border border-border bg-card p-4 shadow-md shadow-black/5 hover:border-primary/30 transition cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-5 animate-pulse" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold uppercase tracking-wider text-muted-foreground", children: t("Search destination") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold text-foreground/80 mt-0.5", children: language === "en" ? "Where would you like to ride?" : "எங்கு செல்ல விரும்புகிறீர்கள்?" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: (e) => {
        e.stopPropagation();
        handleMicClick();
      }, className: "relative grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground shadow active:scale-95 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-4.5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -inset-1.5 rounded-full border border-primary/20 animate-ping opacity-60" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-end justify-between px-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-black uppercase tracking-widest text-muted-foreground", children: t("Quick ride") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/book", className: "text-xs font-bold text-primary hover:underline", children: language === "en" ? "All Options →" : "அனைத்து வழிகள் →" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleQuickBook("Marina Beach", "Besant Nagar, Beach Road"), className: "rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:border-primary/30 active:scale-[0.99] transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-sm font-extrabold", children: t("Bike") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: "From ₹35 · arrives 2 min" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleQuickBook("Central Station", "Park Town, Chennai Central"), className: "rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:border-primary/30 active:scale-[0.99] transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-xl bg-secondary text-primary font-black text-sm", children: "A" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 text-sm font-extrabold", children: t("Auto") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: "From ₹65 · arrives 4 min" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground px-1", children: t("Chennai essentials") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2 text-center", children: [{
        icon: ShieldAlert,
        label: t("SOS"),
        to: "/app/safety",
        tint: "bg-destructive/10 text-destructive border-destructive/20"
      }, {
        icon: CalendarClock,
        label: t("Schedule"),
        to: "/app/schedule",
        tint: "bg-blue-500/10 text-blue-500 border-blue-500/20"
      }, {
        icon: Receipt,
        label: t("Fare"),
        to: "/app/fare",
        tint: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
      }, {
        icon: Globe,
        label: t("Language"),
        to: "/app/language",
        tint: "bg-violet-500/10 text-violet-500 border-violet-500/20"
      }].map(({
        icon: Icon,
        label,
        to,
        tint
      }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to, className: `flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm hover:border-primary/30 active:scale-95 transition`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `grid size-9 place-items-center rounded-xl border ${tint}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-extrabold tracking-tight", children: label })
      ] }, label)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground px-1", children: t("Saved addresses") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: savedAddresses.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleQuickBook(p.label, p.address), className: "w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm hover:border-primary/30 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold", children: language === "en" ? p.label : p.tamilLabel }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground line-clamp-1", children: p.address })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-3.5 text-muted-foreground shrink-0" })
      ] }) }, p.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-6 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 p-5 text-card-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-0 h-full w-24 checkered-sm opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-primary", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3" }),
          " CHENNAI FESTIVALS SPECIAL"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-black tracking-tight", children: t("First ride offer") || "First Ride Offer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold text-primary", children: t("Save 50% up to ₹75") || "Save 50% up to ₹75" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground", children: [
          t("Use code"),
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-secondary font-black", children: "CHENNAI50" })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Home as component
};
