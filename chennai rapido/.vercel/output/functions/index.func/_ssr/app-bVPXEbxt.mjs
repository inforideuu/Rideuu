import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { O as Outlet, u as useLocation, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, s as store } from "./router-BpidCmwR.mjs";
import { ac as WifiOff, V as RefreshCw, $ as Smartphone, D as Download, ad as X, v as House, U as Receipt, a3 as Tag, Z as ShieldAlert, a7 as User } from "../_libs/lucide-react.mjs";
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
const items = [
  { to: "/app/home", label: "Home", icon: House },
  { to: "/app/trips", label: "Trips", icon: Receipt },
  { to: "/app/offers", label: "Offers", icon: Tag },
  { to: "/app/safety", label: "Safety", icon: ShieldAlert },
  { to: "/app/account", label: "Account", icon: User }
];
function BottomNav() {
  const { pathname } = useLocation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mx-auto flex max-w-md items-center justify-around px-2 py-2", children: items.map(({ to, label, icon: Icon }) => {
    const active = pathname === to || pathname.startsWith(to + "/");
    return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to,
        className: "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition " + (active ? "text-secondary-foreground" : "text-muted-foreground hover:text-foreground"),
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "grid size-9 place-items-center rounded-xl transition " + (active ? "bg-primary text-primary-foreground" : "bg-transparent"),
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" })
            }
          ),
          label
        ]
      }
    ) }, to);
  }) }) });
}
function AppShell() {
  const {
    isPwaInstalled,
    token
  } = useAppStore();
  const [showBanner, setShowBanner] = reactExports.useState(!isPwaInstalled);
  const [isOffline, setIsOffline] = reactExports.useState(false);
  const [syncing, setSyncing] = reactExports.useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = reactExports.useState(false);
  const [showSplash, setShowSplash] = reactExports.useState(true);
  const [deferredPrompt, setDeferredPrompt] = reactExports.useState(null);
  const [isStandalone, setIsStandalone] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone || document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        console.log("[PWA] App is running in standalone mode (already installed).");
        store.setPwaInstalled(true);
      }
    };
    checkStandalone();
  }, []);
  reactExports.useEffect(() => {
    console.log("[PWA] Registering beforeinstallprompt listener");
    const handler = (e) => {
      console.log("[PWA] beforeinstallprompt event fired:", e);
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      console.log("[PWA] Cleaning up beforeinstallprompt listener");
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);
  reactExports.useEffect(() => {
    if (token) {
      store.loadUserData();
    }
  }, [token]);
  reactExports.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  const handleInstallPwa = async () => {
    console.log("[PWA] Install button clicked. deferredPrompt exists:", !!deferredPrompt);
    if (deferredPrompt) {
      try {
        console.log("[PWA] Executing prompt() call");
        await deferredPrompt.prompt();
        console.log("[PWA] Prompt shown, awaiting userChoice result");
        const {
          outcome
        } = await deferredPrompt.userChoice;
        console.log("[PWA] userChoice result outcome:", outcome);
        if (outcome === "accepted") {
          store.setPwaInstalled(true);
          setShowBanner(false);
        }
      } catch (err) {
        console.error("[PWA] Error executing prompt():", err);
      }
      setDeferredPrompt(null);
    } else {
      console.log("[PWA] No deferredPrompt available. Hiding install option since native installation is not available.");
      store.setPwaInstalled(true);
      setShowBanner(false);
      store.addNotification({
        cat: "alerts",
        title: "App Shortcut Added!",
        tamilTitle: "செயலி குறுக்குவழி சேர்க்கப்பட்டது!",
        body: "Rideuu is successfully added to your home screen.",
        tamilBody: "ரைடு உங்கள் முகப்புத் திரையில் சேர்க்கப்பட்டது."
      });
    }
  };
  const handleSimulateSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 2e3);
      store.addNotification({
        cat: "alerts",
        title: "Background Sync Complete",
        tamilTitle: "பின்னணி ஒத்திசைவு முடிந்தது",
        body: "All offline trip requests synced to Chennai servers.",
        tamilBody: "ஆஃப்லைன் பயண கோரிக்கைகள் ஒத்திசைக்கப்பட்டன."
      });
    }, 2e3);
  };
  if (showSplash) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pulse-ring absolute inset-0 rounded-full bg-primary/20 scale-125" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative grid size-20 place-items-center rounded-3xl bg-primary text-slate-950 font-black text-3xl shadow-2xl animate-scale-in", children: "N" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-1 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-extrabold tracking-tight", children: "Rideuu" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/50 font-bold uppercase tracking-widest pl-0.5", children: "சென்னை · v1.2" })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh bg-background text-foreground transition-colors duration-300 relative", children: [
    isOffline && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-0 z-50 bg-amber-500 text-slate-950 text-[10px] font-bold px-4 py-2 flex items-center justify-between shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "size-3.5 animate-bounce" }),
        " Offline Mode Active · Using Sync Cache"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSimulateSync, disabled: syncing, className: "rounded bg-slate-950 px-2 py-0.5 text-[8px] font-black text-amber-500 uppercase flex items-center gap-1", children: syncing ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-2 animate-spin" }) : "Sync Now" })
    ] }),
    showSyncSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed top-12 left-1/2 -translate-x-1/2 z-50 rounded-full bg-emerald-500 px-4 py-1.5 text-[10px] font-black text-white shadow shadow-emerald-500/25 animate-scale-in", children: "✓ Sync completed!" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed right-4 bottom-24 z-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsOffline(!isOffline), className: `grid size-9 place-items-center rounded-full border shadow backdrop-blur-md active:scale-90 transition ${isOffline ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-border bg-card text-muted-foreground"}`, title: "Toggle PWA Offline Mode simulation", children: /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "size-4" }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto min-h-dvh max-w-md pb-24 relative", children: [
      showBanner && !isStandalone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-4 mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm text-xs font-semibold flex items-center justify-between text-left animate-fade-in relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow shadow-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold text-foreground", children: "Install Rideuu App" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 leading-normal", children: "Add to home screen for 1-tap offline ride booking" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleInstallPwa, className: "rounded-xl bg-primary px-3.5 py-2 text-[10px] font-black text-primary-foreground shadow flex items-center gap-1 hover:brightness-105 active:scale-95 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-3" }),
            " Install"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowBanner(false), className: "text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
}
export {
  AppShell as component
};
