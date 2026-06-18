import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, s as store } from "./router-BpidCmwR.mjs";
import { a as ArrowLeft, u as Globe, j as Check, K as Mic, I as MapPin } from "../_libs/lucide-react.mjs";
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
const langs = [{
  id: "en",
  label: "English",
  native: "English",
  sample: "Where would you like to go?"
}, {
  id: "ta",
  label: "Tamil",
  native: "தமிழ்",
  sample: "எங்கு செல்ல விரும்புகிறீர்கள்?"
}];
const regions = [{
  id: "chn",
  label: "Chennai Central & North",
  tamil: "சென்னை மத்திய & வடக்கு"
}, {
  id: "sou",
  label: "South Chennai (Adyar & OMR)",
  tamil: "தென் சென்னை"
}, {
  id: "wes",
  label: "West Chennai (Anna Nagar)",
  tamil: "மேற்கு சென்னை"
}];
function LanguagePage() {
  const {
    language,
    profile
  } = useAppStore();
  const [app, setApp] = reactExports.useState(language);
  const [voice, setVoice] = reactExports.useState(language === "en" ? "en" : "ta");
  const [region, setRegion] = reactExports.useState("chn");
  const handleSelectLanguage = (lang) => {
    setApp(lang);
    store.setLanguage(lang);
    store.addNotification({
      cat: "alerts",
      title: "Language preference updated",
      tamilTitle: "மொழி விருப்பம் புதுப்பிக்கப்பட்டது",
      body: `App language successfully set to ${lang === "en" ? "English" : "Tamil"}.`,
      tamilBody: `செயலி மொழி வெற்றிகரமாக தமிழ் என அமைக்கப்பட்டது.`
    });
  };
  const handleSelectVoiceLang = (lang) => {
    setVoice(lang);
    store.update((s) => {
      s.profile.ridePreference = lang === "ta" ? "tamil-voice" : "silent";
    });
  };
  const handleSelectRegion = (id) => {
    setRegion(id);
    store.addNotification({
      cat: "alerts",
      title: "Region Preference Locked",
      tamilTitle: "பிராந்திய விருப்பம் பூட்டப்பட்டது",
      body: `Your location tracking optimized for ${regions.find((r) => r.id === id)?.label}.`,
      tamilBody: `இருப்பிடக் கண்காணிப்பு சென்னை பகுதிக்கு உகந்ததாக மாற்றப்பட்டது.`
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-24 text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/account", className: "grid size-9 place-items-center rounded-xl bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base font-extrabold tracking-tight", children: "Language & Region" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-semibold", children: "மொழி மற்றும் பகுதி" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-2.5 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "size-4 text-primary" }),
          " App language"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 font-semibold", children: langs.map((l) => {
          const active = app === l.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectLanguage(l.id), className: `relative overflow-hidden rounded-2xl border-2 p-4 text-left transition duration-200 ${active ? "border-primary bg-primary/10 shadow-md scale-[1.01]" : "border-border bg-card hover:border-primary/40"}`, children: [
            active && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5", strokeWidth: 3.5 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-extrabold", children: l.native }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5", children: l.label }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3.5 text-xs text-foreground/80 leading-normal", children: l.sample })
          ] }, l.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-2.5 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-4 text-primary animate-pulse" }),
          " Voice booking language"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5 font-semibold text-xs", children: langs.map((l) => {
          const active = voice === l.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectVoiceLang(l.id), className: `flex w-full items-center justify-between rounded-2xl border p-3.5 transition ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid size-10 place-items-center rounded-xl transition ${active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "bg-muted text-muted-foreground"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-4.5" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold", children: l.native }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: [
                  l.label,
                  " Voice Assist"
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid size-5 place-items-center rounded-full border-2 transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`, children: active && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5", strokeWidth: 3.5 }) })
          ] }, l.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mb-2.5 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4 text-primary" }),
          " Regional preference (Chennai)"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2.5 font-semibold text-xs", children: regions.map((r) => {
          const active = region === r.id;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectRegion(r.id), className: `flex items-center justify-between rounded-2xl border p-4 transition ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold", children: r.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: r.tamil })
            ] }),
            active && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4.5 text-primary", strokeWidth: 3 })
          ] }, r.id);
        }) })
      ] })
    ] })
  ] });
}
export {
  LanguagePage as component
};
