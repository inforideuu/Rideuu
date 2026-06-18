import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { c as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { aa as WifiOff, X as Smartphone, D as Download, ab as X, u as House, a0 as TrendingUp, a9 as Wallet, n as Clock, a4 as User, W as SlidersVertical, Y as Sparkles, k as CircleAlert, o as CloudRain, T as Shield, i as Check, e as Bell, a6 as UserPlus } from "../_libs/lucide-react.mjs";
function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { language } = useRider();
  const items = [
    { to: "/dashboard", label: language === "ta" ? "முகப்பு" : "Home", icon: House },
    { to: "/earnings", label: language === "ta" ? "வருவாய்" : "Earnings", icon: TrendingUp },
    { to: "/wallet", label: language === "ta" ? "வாலட்" : "Wallet", icon: Wallet },
    { to: "/history", label: language === "ta" ? "சவாரிகள்" : "History", icon: Clock },
    { to: "/profile", label: language === "ta" ? "விவரம்" : "Profile", icon: User }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 pb-[env(safe-area-inset-bottom)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-md grid grid-cols-5", children: items.map(({ to, label, icon: Icon }) => {
    const active = pathname === to || pathname.startsWith(to + "/");
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Link,
      {
        to,
        className: "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px]",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Icon,
            {
              className: `h-5 w-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`,
              strokeWidth: active ? 2.5 : 2
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: active ? "text-primary font-semibold" : "text-muted-foreground", children: label })
        ]
      },
      to
    );
  }) }) });
}
const SimulationPanel = () => {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const {
    rainActive,
    setRainActive,
    floodAlert,
    setFloodAlert,
    lowNetwork,
    setLowNetwork,
    adminSetKYCStatus,
    setIncomingRequest,
    addReferral,
    addNotification,
    setPayoutStatus,
    activeRide,
    language
  } = useRider();
  const [rejReason, setRejReason] = reactExports.useState("License details unclear. Upload high-res photo.");
  const triggerRequest = (type) => {
    if (type === "fake") {
      const req2 = {
        id: `req-${Date.now()}`,
        fare: 80,
        distance: 1.8,
        duration: 8,
        pickup: "Usman Road Subway",
        pickupSub: "T. Nagar Depot",
        dropoff: "Panagal Park",
        dropoffSub: "Landmark: Chennai Silks",
        customerName: "Sanjay (Fake Profile)",
        customerRating: 2.1,
        isFemaleOnly: false,
        surgeMultiplier: 1,
        rainBonus: 0
      };
      setIncomingRequest(req2);
      addNotification("app_name", "new_ride", "Incoming request detected", "Analyzing booking integrity...", "info", "Shield");
      setTimeout(() => {
        setIncomingRequest(null);
        addNotification("SOS", "fake_booking_detected", "FRAUD ALERT: Fake Booking Blocked", "System automatically cancelled ride request from suspicious user ID.", "safety", "ShieldAlert");
      }, 3500);
      setIsOpen(false);
      return;
    }
    let req = {
      id: `req-${Date.now()}`,
      fare: 120,
      distance: 4.2,
      duration: 18,
      pickup: "T.Nagar Bus Depot",
      pickupSub: "Usman Road · 2.1 km away",
      dropoff: "Anna Nagar W Block",
      dropoffSub: "Drop-off · landmark: behind Saravana Stores",
      customerName: "Priya",
      customerRating: 4.8,
      isFemaleOnly: false,
      surgeMultiplier: 1,
      rainBonus: 0
    };
    if (type === "surge") {
      req.fare = 150;
      req.surgeMultiplier = 1.8;
      req.customerName = "Arjun";
      req.customerRating = 4.9;
    } else if (type === "female") {
      req.fare = 130;
      req.customerName = "Meena (Female Rider Match)";
      req.customerRating = 4.7;
      req.isFemaleOnly = true;
      req.surgeMultiplier = 1.2;
    } else if (type === "rain") {
      req.fare = 140;
      req.customerName = "Senthil";
      req.customerRating = 4.5;
      req.rainBonus = 40;
      req.pickup = "Velachery Lake View Road";
      req.pickupSub = "Flood zone · 3 km away";
      setRainActive(true);
      setFloodAlert(true);
    }
    setIncomingRequest(req);
    setIsOpen(false);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(580, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log("Audio simulation blocked by user interaction");
    }
  };
  const notifyTester = (type) => {
    if (type === "kyc") {
      addNotification(
        "kyc_header",
        "verified",
        "KYC VERIFICATION COMPLETE",
        "Congratulations! Your riding credentials have been approved by the Admin.",
        "kyc",
        "CheckCircle2"
      );
      adminSetKYCStatus("aadhaar", "done");
      adminSetKYCStatus("license", "done");
      adminSetKYCStatus("vehicle", "done");
      adminSetKYCStatus("insurance", "done");
      adminSetKYCStatus("selfie", "done");
    } else if (type === "incentive") {
      addNotification(
        "incentives_bonuses",
        "bonus_wallet",
        "CONSECUTIVE TRIP BONUS CREDITED",
        "Completed 3 peak hour rides! ₹300 incentive credited to wallet.",
        "earnings",
        "Zap"
      );
    } else if (type === "danger") {
      addNotification(
        "sos",
        "unsafe_zone_warnings",
        "SAFETY ALERT: Red Zone Active",
        "Heavy water logging in Velachery Usman subway. Avoid speed routes.",
        "safety",
        "ShieldAlert"
      );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-24 right-4 z-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        className: "h-12 w-12 rounded-full bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition",
        style: {
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersVertical, { className: "h-5 w-5 animate-pulse text-primary" })
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-14 right-0 w-80 max-h-[80vh] overflow-y-auto rounded-3xl bg-slate-950/95 border border-white/10 p-5 shadow-2xl backdrop-blur-xl text-white slide-up", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-white/10 pb-3 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm tracking-wide", children: "Rideuu SIMULATOR" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsOpen(false), className: "text-white/40 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-3", children: "1. Trigger Ride Scenarios" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => triggerRequest("standard"),
            className: "py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-left hover:bg-white/10 transition",
            children: "Standard Ride"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => triggerRequest("surge"),
            className: "py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-left hover:bg-white/10 text-primary transition",
            children: "Peak Surge (1.8x)"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => triggerRequest("female"),
            className: "py-2 px-3 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs font-semibold text-left text-pink-300 hover:bg-pink-900/40 transition",
            children: "Women Match"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => triggerRequest("rain"),
            className: "py-2 px-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs font-semibold text-left text-blue-300 hover:bg-blue-900/40 transition",
            children: "Velachery Rain"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => triggerRequest("fake"),
            className: "col-span-2 py-2 px-3 rounded-xl bg-yellow-950/40 border border-yellow-500/20 text-xs font-semibold text-center text-yellow-300 hover:bg-yellow-900/40 transition flex items-center justify-center gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5" }),
              "Fake Booking Attack"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-3", children: "2. Weather & Environment" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-white/5 rounded-xl p-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CloudRain, { className: "h-4 w-4 text-blue-400" }),
            " Rain Emergency Bonus"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setRainActive(!rainActive),
              className: `h-5 w-9 rounded-full transition relative ${rainActive ? "bg-blue-500" : "bg-white/10"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-4 w-4 rounded-full bg-white absolute top-0.5 transition ${rainActive ? "left-4.5" : "left-0.5"}` })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-white/5 rounded-xl p-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-yellow-500" }),
            " Chennai Flood Overlays"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setFloodAlert(!floodAlert),
              className: `h-5 w-9 rounded-full transition relative ${floodAlert ? "bg-yellow-500" : "bg-white/10"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-4 w-4 rounded-full bg-white absolute top-0.5 transition ${floodAlert ? "left-4.5" : "left-0.5"}` })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between bg-white/5 rounded-xl p-2.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-orange-500" }),
            " Low Network / Offline Mode"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setLowNetwork(!lowNetwork),
              className: `h-5 w-9 rounded-full transition relative ${lowNetwork ? "bg-orange-500" : "bg-white/10"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-4 w-4 rounded-full bg-white absolute top-0.5 transition ${lowNetwork ? "left-4.5" : "left-0.5"}` })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-2", children: "3. Adjust Driver KYC Approval" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => adminSetKYCStatus("license", "done"),
              className: "py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-[10px] font-bold",
              children: "Verify DL"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => adminSetKYCStatus("license", "progress"),
              className: "py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded text-[10px] font-bold",
              children: "Review DL"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => adminSetKYCStatus("license", "rejected", rejReason),
              className: "py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-[10px] font-bold",
              children: "Reject DL"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            value: rejReason,
            onChange: (e) => setRejReason(e.target.value),
            placeholder: "Custom Rejection Reason",
            className: "w-full text-[10px] bg-slate-900 border border-white/10 p-1.5 rounded outline-none"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-3", children: "4. Simulation Events" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => notifyTester("kyc"),
            className: "w-full py-2 bg-emerald-900/40 border border-emerald-500/20 text-xs font-semibold text-emerald-200 rounded-xl hover:bg-emerald-850/40 transition flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
              " Approve Full KYC Status"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => notifyTester("incentive"),
            className: "w-full py-2 bg-indigo-900/40 border border-indigo-500/20 text-xs font-semibold text-indigo-200 rounded-xl hover:bg-indigo-850/40 transition flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-3.5 w-3.5 text-indigo-400" }),
              " Send Target Bonus Alert"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => notifyTester("danger"),
            className: "w-full py-2 bg-red-950/40 border border-red-500/20 text-xs font-semibold text-red-200 rounded-xl hover:bg-red-900/40 transition flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-3.5 w-3.5 text-red-500" }),
              " Send Subway Flood Alert"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => addReferral("+91 95000 12345"),
            className: "w-full py-2 bg-cyan-900/40 border border-cyan-500/20 text-xs font-semibold text-cyan-200 rounded-xl hover:bg-cyan-850/40 transition flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "h-3.5 w-3.5 text-cyan-400" }),
              " Simulate Referral Signup (+₹300)"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => setPayoutStatus("failed"),
            className: "w-full py-2 bg-rose-950/60 border border-rose-500/30 text-xs font-semibold text-rose-200 rounded-xl hover:bg-rose-900/60 transition flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3.5 w-3.5 text-red-400" }),
              " Trigger Settlement Failure"
            ]
          }
        )
      ] })
    ] })
  ] });
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
function MobileShell({
  children,
  showNav = true,
  className,
  style
}) {
  const { lowNetwork, language, t, addNotification } = useRider();
  const [showBanner, setShowBanner] = reactExports.useState(true);
  const [deferredPrompt, setDeferredPrompt] = reactExports.useState(null);
  const [isStandalone, setIsStandalone] = reactExports.useState(false);
  const [isPwaInstalled, setIsPwaInstalled] = reactExports.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("namma_rider_pwa_installed") === "true";
    }
    return false;
  });
  reactExports.useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone || document.referrer.includes("android-app://");
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setIsPwaInstalled(true);
        localStorage.setItem("namma_rider_pwa_installed", "true");
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
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsPwaInstalled(true);
          localStorage.setItem("namma_rider_pwa_installed", "true");
          setShowBanner(false);
        }
      } catch (err) {
        console.error("[PWA] Error executing prompt():", err);
      }
      setDeferredPrompt(null);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIOS) {
        alert(
          language === "ta" ? "iOS இல் ரைடு நிறுவுவதற்கு:\n1. சஃபாரியில் ஷேர் (Share) பொத்தானைத் தட்டவும் (கீழே).\n2. கீழே உருட்டி 'முகப்புத் திரையில் சேர்' (Add to Home Screen) என்பதைத் தட்டவும்." : "To install Rideuu on iOS:\n1. Tap the Share button in Safari (at the bottom).\n2. Scroll down and tap 'Add to Home Screen'."
        );
      } else {
        alert(
          language === "ta" ? "உங்கள் சாதனத்தில் ரைடு நிறுவுவதற்கு:\n1. மேல் வலது மூலையில் உள்ள 3 புள்ளிகளைத் தட்டவும்.\n2. 'ஆப்பை நிறுவு' அல்லது 'முகப்புத் திரையில் சேர்' என்பதைத் தேர்ந்தெடுக்கவும்." : "To install Rideuu on your browser:\n1. Tap the 3 dots in the top-right corner.\n2. Tap 'Install App' or 'Add to Home Screen'."
        );
      }
      setIsPwaInstalled(true);
      localStorage.setItem("namma_rider_pwa_installed", "true");
      setShowBanner(false);
      addNotification(
        "install_pwa",
        "pwa_installed_success",
        "App Shortcut Guide Shown!",
        "Follow the prompt details to add Rideuu to your home screen.",
        "info",
        "Smartphone"
      );
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background relative", style, children: [
    lowNetwork && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-md bg-orange-600 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold gap-2 sticky top-0 z-50 animate-bounce", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WifiOff, { className: "h-4 w-4" }),
        t("offline_mode_active")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase", children: "PWA" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("mx-auto max-w-md min-h-screen bg-background relative border-x border-border shadow-2xl", className), children: [
      showBanner && !isStandalone && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-4 mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm text-xs font-semibold flex items-center justify-between text-left animate-fade-in relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow shadow-primary/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold text-foreground", children: language === "ta" ? "முகப்புத் திரையில் ஆப்பை நிறுவவும்" : "Install Rider App" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 leading-normal", children: language === "ta" ? "ஆஃப்லைன் சவாரி முன்பதிவுக்கு முகப்புத் திரையில் சேர்க்கவும்" : "Add to home screen for 1-tap offline passenger booking" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: handleInstallPwa,
              className: "rounded-xl bg-primary px-3.5 py-2 text-[10px] font-black text-primary-foreground shadow flex items-center gap-1 hover:brightness-105 active:scale-95 transition cursor-pointer",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-3 w-3" }),
                " ",
                language === "ta" ? "நிறுவ" : "Install"
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowBanner(false), className: "text-muted-foreground hover:text-foreground cursor-pointer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-4 w-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: showNav ? "pb-24" : "", children }),
      showNav && /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SimulationPanel, {})
    ] })
  ] });
}
function PageHeader({
  title,
  subtitle,
  right
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "px-5 pt-6 pb-4 flex items-start justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      subtitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold tracking-widest text-primary uppercase mb-1", children: subtitle }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold tracking-tight text-foreground", children: title })
    ] }),
    right
  ] });
}
export {
  MobileShell as M,
  PageHeader as P
};
