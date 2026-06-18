import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, s as store, t as translate } from "./router-BpidCmwR.mjs";
import { I as MapPin, Q as Phone, a2 as Sun, N as Moon, b as ArrowRight, $ as Smartphone, D as Download, ad as X, a1 as Star, _ as ShieldCheck, ae as Zap, f as Bike } from "../_libs/lucide-react.mjs";
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
const heroVideo = "/assets/hero_video-DZlrspGw.mp4";
function Landing() {
  const {
    language,
    theme,
    womenSafetyMode,
    isPwaInstalled
  } = useAppStore();
  const [showContent, setShowContent] = reactExports.useState(false);
  const videoRef = reactExports.useRef(null);
  const [showBanner, setShowBanner] = reactExports.useState(true);
  const [deferredPrompt, setDeferredPrompt] = reactExports.useState(null);
  const [isStandalone, setIsStandalone] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone || document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        store.setPwaInstalled(true);
      }
    };
    checkStandalone();
  }, []);
  reactExports.useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const {
          outcome
        } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          store.setPwaInstalled(true);
          setShowBanner(false);
        }
      } catch (err) {
        console.error("[PWA] Error executing prompt():", err);
      }
      setDeferredPrompt(null);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert(language === "en" ? "To install Rideuu on iOS:\n1. Tap the Share button in Safari (at the bottom).\n2. Scroll down and tap 'Add to Home Screen'." : "iOS இல் ரைடு நிறுவுவதற்கு:\n1. சஃபாரியில் ஷேர் (Share) பொத்தானைத் தட்டவும் (கீழே).\n2. கீழே உருட்டி 'முகப்புத் திரையில் சேர்' (Add to Home Screen) என்பதைத் தட்டவும்.");
      } else {
        alert(language === "en" ? "To install Rideuu on your browser:\n1. Tap the 3 dots in the top-right corner.\n2. Tap 'Install App' or 'Add to Home Screen'." : "உங்கள் சாதனத்தில் ரைடு நிறுவுவதற்கு:\n1. மேல் வலது மூலையில் உள்ள 3 புள்ளிகளைத் தட்டவும்.\n2. 'ஆப்பை நிறுவு' அல்லது 'முகப்புத் திரையில் சேர்' என்பதைத் தேர்ந்தெடுக்கவும்.");
      }
      store.setPwaInstalled(true);
      setShowBanner(false);
      store.addNotification({
        cat: "alerts",
        title: "App Shortcut Guide Shown!",
        tamilTitle: "செயலி நிறுவல் வழிகாட்டி!",
        body: "Follow the prompt details to add Rideuu to your home screen.",
        tamilBody: "ரைடு உங்கள் முகப்புத் திரையில் சேர்க்க வழிகாட்டியைப் பின்பற்றவும்."
      });
    }
  };
  const handleTimeUpdate = (e) => {
    if (e.currentTarget.currentTime >= 12) {
      setShowContent(true);
    }
  };
  reactExports.useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 4e3);
    return () => clearTimeout(timer);
  }, []);
  const t = (key) => translate(key, language);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh bg-background text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-primary text-primary-foreground text-[10px] font-bold tracking-widest uppercase transition-colors duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-3" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Serving all of Chennai · 24×7 · சென்னை முழுவதும்" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden items-center gap-4 sm:flex opacity-90", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-3" }),
            " +91 98842 64816"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "zenelaitinfotech@gmail.com" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checkered-sm h-1.5 w-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl items-center justify-between px-4 py-3 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "./ridu_logo.png", alt: "Rideuu", className: "h-8 sm:h-12 w-auto object-contain" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "hidden items-center gap-6 text-xs font-bold uppercase tracking-wider text-muted-foreground md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#how", className: "hover:text-primary transition-colors", children: "How it works" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#safety", className: "hover:text-primary transition-colors", children: "Safety" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#download", className: "hover:text-primary transition-colors", children: "Get the App" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.setLanguage(language === "en" ? "ta" : "en"), className: "rounded-full border border-border bg-card px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-bold shadow-sm transition hover:bg-muted", children: language === "en" ? "தமிழ்" : "EN" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.setTheme(theme === "dark" ? "light" : "dark"), className: "grid size-7 sm:size-8 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground transition shadow-sm", "aria-label": "Toggle theme", children: theme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "size-3.5 sm:size-4 text-amber-500" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-3.5 sm:size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/home", className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-extrabold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-105 active:scale-[0.98]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: language === "en" ? "Book a Ride" : "சவாரி செய்" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "sm:hidden", children: language === "en" ? "Book" : "சவாரி" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3 sm:size-3.5" })
        ] })
      ] })
    ] }) }),
    showBanner && !isStandalone && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/10 border-b border-primary/20 p-3 sm:p-4 text-xs font-semibold", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-3 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow shadow-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold text-foreground text-xs sm:text-sm", children: language === "en" ? "Install Rideuu App" : "நம்ம ரைடு செயலியை நிறுவவும்" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 leading-normal", children: language === "en" ? "Add to home screen for 1-tap offline ride booking and safe routes" : "ஆஃப்லைன் சவாரி முன்பதிவுக்கு முகப்புத் திரையில் சேர்க்கவும்" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 w-full sm:w-auto justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleInstallPwa, className: "rounded-xl bg-primary px-3.5 py-1.5 sm:px-4 sm:py-2 text-[10px] font-black text-primary-foreground shadow flex items-center gap-1 hover:brightness-105 active:scale-95 transition cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-3" }),
          " ",
          language === "en" ? "Install" : "நிறுவவும்"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowBanner(false), className: "text-muted-foreground hover:text-foreground cursor-pointer p-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative min-h-[600px] grid place-items-center overflow-hidden bg-black text-white", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("video", { ref: videoRef, src: heroVideo, autoPlay: true, muted: true, loop: true, playsInline: true, onTimeUpdate: handleTimeUpdate, className: "absolute inset-0 h-full w-full object-cover opacity-60 z-0" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 z-10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative z-20 mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20 transition-all duration-1000 ease-out ${showContent ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-98 pointer-events-none"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary animate-pulse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-primary" }),
            "வணக்கம் Chennai · Welcome to Rideuu"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-5 text-3xl sm:text-4xl font-extrabold leading-[1.1] tracking-tight text-balance md:text-6xl text-white", children: language === "en" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "Fast & affordable",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "bike & auto" }),
            " rides."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            "வேகமான மற்றும் மலிவான",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-tamil", children: "பைக் & ஆட்டோ" }),
            " சவாரிகள்."
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 max-w-lg text-xs sm:text-sm text-white/80 md:text-base leading-relaxed", children: language === "en" ? "Rideuu is Chennai-first. Tamil voice booking, women safety mode, flood-aware routing and zero surge surprises — built for our city." : "நம்ம ரைடு சென்னைக்கானது. தமிழ் குரல் பதிவு, பெண்கள் பாதுகாப்பு பயன்முறை, வெள்ள அபாய வழித்தடங்கள் மற்றும் கூடுதல் கட்டணங்கள் இல்லை." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/home", className: "inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 sm:px-6 sm:py-3.5 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition hover:brightness-105", children: [
              language === "en" ? "Launch Web App" : "செயலியைத் தொடங்கு",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#how", className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-xs px-5 py-3 sm:px-6 sm:py-3.5 text-xs font-bold text-white transition hover:bg-white/15", children: language === "en" ? "How it works" : "எப்படி செயல்படுகிறது" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap items-center gap-5 text-xs text-white/70", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-4.5 fill-primary text-primary" }),
              " 4.9 ",
              t("Rating") || "Rating"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-4.5 text-primary" }),
              " Verified drivers"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Zap, { className: "size-4.5 text-primary" }),
              " 3 min ETA avg"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-full max-w-[320px] xs:max-w-sm float-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-6 rounded-[40px] bg-primary/10 blur-3xl" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative rounded-[36px] border border-white/10 bg-background/90 backdrop-blur-md p-3 text-foreground shadow-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-[28px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `map-grid relative h-64 sm:h-72 ${theme === "dark" ? "map-grid-dark" : "map-grid"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-[30%] top-[40%] size-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/30" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-[65%] top-[60%] size-2.5 rounded-full bg-primary ring-4 ring-primary/30" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("svg", { viewBox: "0 0 200 200", className: "absolute inset-0 h-full w-full opacity-70", children: /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M 60 80 Q 90 100, 130 120", stroke: "oklch(0.65 0.25 140)", strokeWidth: "3", fill: "none", "stroke-dasharray": "5 4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-4 top-4 rounded-full bg-card/95 px-2.5 py-1 text-[9px] font-bold shadow-md border border-border", children: "12 riders nearby" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-6 bottom-4 rounded-lg bg-blue-500/10 border border-blue-500/30 backdrop-blur-xs px-2 py-1 text-[8px] font-extrabold text-blue-500 flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-blue-500 animate-ping" }),
                " Safe Routing Active"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 bg-card p-3 sm:p-4 border-t border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border p-3 space-y-2.5 text-xs font-semibold bg-muted/30", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 rounded-full bg-emerald-500" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Marina Lighthouse" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4 w-px border-l border-dashed border-border ml-1" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 rounded-full bg-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "T. Nagar · Pondy Bazaar" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border-2 border-primary bg-primary/5 p-3 text-left", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "size-4.5 text-primary" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[11px] font-extrabold", children: t("Bike") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "₹45 · 3 min" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-3 text-left", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-4.5 place-items-center rounded bg-secondary text-[9px] font-black text-secondary-foreground", children: "A" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[11px] font-extrabold", children: t("Auto") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "₹82 · 5 min" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/home", className: "block w-full text-center rounded-2xl bg-secondary py-3 text-xs font-extrabold text-secondary-foreground shadow shadow-secondary/15 transition hover:brightness-105 active:scale-[0.99]", children: t("Confirm ride") })
            ] })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checkered h-3 w-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "how", className: "mx-auto max-w-6xl px-4 py-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-12 max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-black uppercase tracking-[0.2em] text-primary", children: "Rideuu Benefits" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-3xl font-extrabold tracking-tight md:text-4xl", children: language === "en" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Not just a ride app. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "A city companion." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "சவாரி செயலி மட்டுமல்ல. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "நமது சென்னைத் துணைவன்." })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-5 md:grid-cols-3", children: [{
        icon: Bike,
        title: "Bike & Auto Only",
        body: "No bloated car options or traffic delays. Fast and quick dispatch tailor-made for Chennai transit."
      }, {
        icon: ShieldCheck,
        title: "Women safety mode",
        body: "Equipped with Ladies Priority matching, certified female drivers, audio-recording logs and active SOS escalation."
      }, {
        icon: Zap,
        title: "Rain & flood aware",
        body: "Integrated waterlogging zone visualization, traffic overlays and dynamic high-demand smart pricing."
      }, {
        icon: MapPin,
        title: "Landmark pickup",
        body: 'Visual landmark selectors - "Near T-Nagar Saravana Stores" or "Marina Gate 2" - we get it right away.'
      }, {
        icon: Star,
        title: "Tamil-first experience",
        body: "Fully translated app pages, onboarding panels, voice assistants, and Tamil notification support."
      }, {
        icon: Phone,
        title: "Family tracking links",
        body: "Register emergency trusted contacts and automatically broadcast live trip timeline URLs for every booking."
      }].map((f, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group rounded-3xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${idx === 0 ? "border-primary/50" : "border-border hover:border-primary/20"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-11 place-items-center rounded-2xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 text-sm font-extrabold tracking-tight", children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs text-muted-foreground leading-relaxed", children: f.body })
      ] }, f.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "download", className: "relative overflow-hidden bg-primary text-primary-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-[0.06] checkered" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 md:flex-row md:items-center relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-extrabold tracking-tight md:text-3xl", children: language === "en" ? "Ready to explore Chennai with Rideuu?" : "ரைடு மூலம் சவாரி செய்யத் தயாராக இருக்கிறீர்களா?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-xs opacity-90 font-medium", children: "Install Rideuu to your homescreen as an offline-capable PWA instantly." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/home", className: "inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-4 text-xs font-black text-secondary-foreground shadow-xl transition hover:brightness-110 hover:scale-105 active:scale-[0.98]", children: [
            language === "en" ? "Launch Web App" : "செயலியைத் தொடங்கு",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/chennai_rapido.apk", download: true, className: "inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-xs px-6 py-4 text-xs font-black text-white shadow-xl transition hover:bg-white/20 hover:scale-105 active:scale-[0.98]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
            " ",
            language === "en" ? "Download Android APK" : "ஏபிகே பதிவிறக்க"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checkered-sm h-2 w-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border bg-card py-10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl px-4 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-muted-foreground font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "./ridu_logo.png", alt: "Rideuu", height: 150, width: 150 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "© ",
          (/* @__PURE__ */ new Date()).getFullYear()
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "hover:text-primary transition-colors", children: "Privacy policy" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "hover:text-primary transition-colors", children: "Terms of service" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "hover:text-primary transition-colors", children: "Drive with Rideuu" })
      ] })
    ] }) })
  ] });
}
export {
  Landing as component
};
