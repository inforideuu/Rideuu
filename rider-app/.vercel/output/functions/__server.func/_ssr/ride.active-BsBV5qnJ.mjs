import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell } from "./MobileShell-p1-8Yc6U.mjs";
import { I as InteractiveMap } from "./InteractiveMap-DmgnwrGd.mjs";
import { u as useRider, a as api } from "./router-CTtxc6Rr.mjs";
import { p as Compass, U as ShieldAlert, a1 as TriangleAlert, z as MessageCircle, J as Phone, w as Info, N as Navigation, a8 as Volume2, O as Play, P as Pause, k as CircleAlert, Z as Star, V as ShieldCheck, ab as X, S as Send, i as Check } from "../_libs/lucide-react.mjs";
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
function ActiveRide() {
  const nav = useNavigate();
  const {
    activeRide,
    setRideStage,
    setOtpInput,
    advanceActiveRideStep,
    togglePauseRide,
    reportRideIssue,
    endActiveRide,
    floodAlert,
    triggerSOS,
    sosTriggered,
    cancelSOS,
    t,
    language,
    phone,
    noCommissionExpiry
  } = useRider();
  const [chatOpen, setChatOpen] = reactExports.useState(false);
  const [chatInput, setChatInput] = reactExports.useState("");
  const [chatLog, setChatLog] = reactExports.useState([{
    sender: "customer",
    text: "Please wait near the main depot entrance",
    time: "4:01 pm"
  }]);
  const [issueOpen, setIssueOpen] = reactExports.useState(false);
  const [issueText, setIssueText] = reactExports.useState("");
  const [issueSubmitted, setIssueSubmitted] = reactExports.useState(false);
  const [detourAccepted, setDetourAccepted] = reactExports.useState(false);
  const [completionStep, setCompletionStep] = reactExports.useState(0);
  const [riderRatingInput, setRiderRatingInput] = reactExports.useState(5);
  reactExports.useEffect(() => {
    if (activeRide.stage === "completion") {
      if (activeRide.completionStep !== void 0 && activeRide.completionStep >= 0) {
        setCompletionStep(activeRide.completionStep);
      } else {
        setCompletionStep(0);
      }
    }
  }, [activeRide.stage, activeRide.completionStep]);
  const handleNextCompletionStep = async () => {
    const nextStep = completionStep + 1;
    if (completionStep === 3) {
      if (activeRide.request) {
        await api.updateRide(activeRide.request.id, {
          status: "completed",
          completion_step: nextStep
        });
      }
    } else if (completionStep === 4) {
      if (activeRide.request) {
        await api.updateRide(activeRide.request.id, {
          rating_customer: riderRatingInput,
          completion_step: nextStep
        });
      }
    } else {
      if (activeRide.request) {
        await api.updateRide(activeRide.request.id, {
          completion_step: nextStep
        });
      }
    }
    if (completionStep >= 6) {
      await endActiveRide(riderRatingInput);
      nav({
        to: "/dashboard"
      });
      return;
    }
    setCompletionStep(nextStep);
  };
  const getCompletionButtonLabel = () => {
    switch (completionStep) {
      case 0:
        return `Verify GPS Distance (${finalDistance} km)`;
      case 1:
        return `Calculate Final Fare (₹${totalEarnings})`;
      case 2:
        return "Collect Payment from Customer";
      case 3:
        return "Confirm Payment Received (Cash/Wallet)";
      case 4:
        return `Submit Customer Rating (${riderRatingInput} Stars)`;
      case 5:
        return "Archive Trip History";
      case 6:
        return "Finish & Go Available";
      default:
        return "Next Step";
    }
  };
  const activeReq = reactExports.useMemo(() => {
    if (activeRide.request) return activeRide.request;
    return {
      id: "req-active-fallback",
      fare: 142,
      distance: 4.2,
      duration: 18,
      pickup: "T.Nagar Bus Depot",
      pickupSub: "Usman Road · 2.1 km away",
      dropoff: "Anna Nagar W Block",
      dropoffSub: "Drop-off · landmark: behind Saravana Stores",
      customerName: "Priya",
      customerRating: 4.8,
      isFemaleOnly: true,
      surgeMultiplier: 1.2,
      rainBonus: 20,
      otp: "4821"
    };
  }, [activeRide.request]);
  const finalDistance = reactExports.useMemo(() => {
    const dist = typeof activeReq.distance === "string" ? parseFloat(activeReq.distance) : activeReq.distance;
    return detourAccepted ? Math.round((dist + 1.3) * 10) / 10 : dist;
  }, [detourAccepted, activeReq.distance]);
  const totalEarnings = activeReq.id.includes("fallback") ? Math.round((activeReq.fare + activeReq.rainBonus) * activeReq.surgeMultiplier) : activeReq.fare;
  const navInstructions = [{
    en: "Head North-East on Usman Road toward T.Nagar Terminal",
    ta: "தி.நகர் முனையத்தை நோக்கி உஸ்மான் சாலையில் வடகிழக்கே செல்லவும்"
  }, {
    en: "Turn left at Usman Road Subway intersection",
    ta: "உஸ்மான் சாலை சுரங்கப்பாதை சந்திப்பில் இடதுபுறம் திரும்பவும்"
  }, {
    en: "Merge onto Chennai Bypass Flyover to avoid water logging",
    ta: "வெள்ள நீர் தேங்குவதைத் தவிர்க்க சென்னை மாற்று மேம்பாலத்தில் இணையவும்"
  }, {
    en: "Take the second exit toward Anna Nagar West Block",
    ta: "அண்ணா நகர் மேற்குப் பகுதியை நோக்கி இரண்டாவது வழியில் வெளியேறவும்"
  }, {
    en: "Destination on the left, behind Saravana Stores",
    ta: "இடதுபுறம் இலக்கு உள்ளது, சரவணா ஸ்டோர்ஸ் பின்புறம்"
  }];
  const currentGuidance = reactExports.useMemo(() => {
    const idx = Math.min(activeRide.currentStepIndex, navInstructions.length - 1);
    return language === "ta" ? navInstructions[idx].ta : navInstructions[idx].en;
  }, [activeRide.currentStepIndex, language]);
  const handleSendChat = () => {
    if (!chatInput) return;
    setChatLog([...chatLog, {
      sender: "rider",
      text: chatInput,
      time: "Just now"
    }]);
    setChatInput("");
    setTimeout(() => {
      setChatLog((prev) => [...prev, {
        sender: "customer",
        text: "Got it! I am standing right there.",
        time: "Just now"
      }]);
    }, 1500);
  };
  const handleIssueSubmit = () => {
    if (!issueText) return;
    reportRideIssue(issueText);
    setIssueSubmitted(true);
    setTimeout(() => {
      setIssueSubmitted(false);
      setIssueOpen(false);
      setIssueText("");
    }, 2e3);
  };
  const handleCancelRide = async () => {
    await endActiveRide(5);
    nav({
      to: "/dashboard"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { showNav: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen relative flex flex-col bg-background", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InteractiveMap, { height: "h-[360px]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 inset-x-4 flex justify-between items-center pointer-events-none z-10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "h-10 px-3 rounded-full bg-slate-900/90 border border-white/10 flex items-center gap-1.5 text-[10px] font-bold text-white pointer-events-auto shadow-md", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "h-4 w-4 text-primary animate-spin", style: {
              animationDuration: "12s"
            } }),
            "GPS Navigation Active"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: triggerSOS, className: "h-10 px-4 rounded-full bg-red-600 border border-red-500 flex items-center gap-1.5 text-xs font-black text-white pointer-events-auto shadow-lg hover:scale-105 active:scale-95 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-4.5 w-4.5 text-white animate-pulse" }),
            t("sos")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-t-3xl bg-card border-t border-border p-5 relative shadow-2xl z-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto h-1 w-12 rounded-full bg-muted mb-4" }),
        sosTriggered && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-red-650 text-white rounded-2xl p-4 mb-4 slide-up shadow-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-8 w-8 text-white shrink-0 mt-0.5 animate-bounce" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-sm", children: t("emergency_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] leading-relaxed text-red-100 mt-0.5", children: t("emergency_desc") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: cancelSOS, className: "px-3 py-1.5 bg-white text-red-600 rounded-full text-[10px] font-bold", children: "Dismiss Alert" }) })
          ] })
        ] }) }),
        floodAlert && activeRide.stage === "trip" && !detourAccepted && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4 mb-4 text-blue-500 slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "h-5 w-5 shrink-0 text-blue-500 mt-0.5 animate-bounce" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-xs uppercase tracking-wide", children: t("flood_warning_title") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-500 leading-relaxed mt-1", children: t("flood_warning_desc") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                setDetourAccepted(true);
                advanceActiveRideStep();
              }, className: "px-4 py-1.5 bg-blue-500 text-white rounded-full text-[10px] font-black hover:bg-blue-600 active:scale-95 transition", children: "Accept Detour (Flood Bypass)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setDetourAccepted(true), className: "px-3 py-1.5 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-[10px] font-bold", children: "Ignore" })
            ] })
          ] })
        ] }) }),
        activeRide.stage === "pickup" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-extrabold tracking-widest text-primary uppercase", children: t("head_to_pickup") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-xl font-black text-foreground tracking-tight", children: activeReq.pickup }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-0.5 font-semibold", children: "2.1 km · 6 min via Usman Road Subway" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center gap-3 rounded-2xl bg-secondary p-3.5 border border-border", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-sm", children: activeReq.customerName[0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-bold text-sm text-foreground truncate", children: [
                activeReq.customerName,
                " · ⭐ ",
                activeReq.customerRating
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-bold", children: t("customer") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setChatOpen(true), className: "h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4.5 w-4.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${phone}`, className: "h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/95 active:scale-95 transition shadow-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4.5 w-4.5" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRideStage("otp"), className: "flex-1 rounded-full bg-primary text-primary-foreground font-black py-4 shadow-md active:scale-95 transition text-sm uppercase tracking-wide", children: t("arrived_pickup") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCancelRide, className: "px-5 rounded-full bg-secondary border border-border text-foreground font-bold text-xs hover:bg-muted active:scale-95 transition", children: "Cancel Ride" })
          ] })
        ] }),
        activeRide.stage === "otp" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-extrabold tracking-widest text-primary uppercase", children: t("ride_otp") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-xl font-black text-foreground tracking-tight", children: t("ask_customer_otp") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: activeRide.otpInput, onChange: (e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 4)), inputMode: "numeric", placeholder: "0 0 0 0", className: "mt-4 w-full text-center text-3xl font-black tracking-[0.8em] py-4 rounded-2xl bg-secondary border-2 border-border focus:border-primary outline-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Info, { className: "h-3.5 w-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              "Simulation: Enter code ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: activeReq.otp || "4821" }),
              " to start ride."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: activeRide.otpInput !== activeReq.otp, onClick: () => setRideStage("trip"), className: "flex-1 rounded-full bg-primary text-primary-foreground font-black py-4 disabled:opacity-50 active:scale-95 transition text-sm uppercase tracking-wide", children: t("start_trip") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCancelRide, className: "px-5 rounded-full bg-secondary border border-border text-foreground font-bold text-xs hover:bg-muted active:scale-95 transition", children: "Cancel Ride" })
          ] })
        ] }),
        activeRide.stage === "trip" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-extrabold tracking-widest text-success uppercase", children: t("trip_in_progress") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-lg font-black text-foreground tracking-tight", children: activeReq.dropoff })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-black text-foreground", children: [
                "₹",
                totalEarnings
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground font-extrabold uppercase", children: t("earnings_est") })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl bg-secondary border border-border p-4 flex items-start gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { className: "h-4.5 w-4.5 -rotate-45" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-foreground uppercase tracking-wider", children: "NAVIGATION" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground leading-relaxed mt-0.5 font-bold", children: currentGuidance }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2.5 flex items-center gap-1.5 text-[10px] text-primary font-bold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("voice_navigation") })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: advanceActiveRideStep, className: "py-1 px-2 bg-primary/15 text-primary text-[9px] font-black rounded border border-primary/20 hover:bg-primary/20", children: "NEXT TURN" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2.5 text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tile, { label: t("distance"), value: `${finalDistance} km` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tile, { label: t("eta"), value: `${activeReq.duration} min` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tile, { label: t("speed"), value: "32 km/h" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: togglePauseRide, className: "py-3.5 rounded-full bg-secondary border border-border font-bold text-xs text-foreground active:scale-95 transition flex items-center justify-center gap-1.5 shadow-sm", children: activeRide.isPaused ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "h-4 w-4 text-primary" }),
              " ",
              t("resume_trip")
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "h-4 w-4 text-primary" }),
              " ",
              t("pause_trip")
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setIssueOpen(true), className: "py-3.5 rounded-full bg-secondary border border-border font-bold text-xs text-foreground active:scale-95 transition flex items-center justify-center gap-1.5 shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-4 w-4 text-primary" }),
              " ",
              t("report_issue")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: async () => {
            setRideStage("completion");
            if (activeRide.request) {
              await api.updateRide(activeRide.request.id, {
                completion_step: 0
              });
            }
          }, className: "mt-4 w-full rounded-full bg-primary text-primary-foreground font-black py-4 shadow-md hover:bg-primary/95 transition text-sm uppercase tracking-wide", children: t("end_trip") })
        ] }),
        activeRide.stage === "completion" && (() => {
          const vType = activeReq.vehicle_type || "bike";
          const isAuto = vType.toLowerCase().includes("auto");
          const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1e3);
          const commissionPercent = hasNoComm ? 0 : isAuto ? 0.08 : 0.05;
          const commissionLabel = hasNoComm ? "No Commission (Flat ₹3)" : isAuto ? "8%" : "5%";
          const commissionVal = hasNoComm ? 3 : Math.round(totalEarnings * commissionPercent * 100) / 100;
          const remainingEarnings = Math.round((totalEarnings - commissionVal) * 100) / 100;
          const pMode = activeReq.payment_mode || "cash";
          `Platform commission of ${commissionLabel} (₹${commissionVal.toFixed(2)}) processed`;
          pMode === "cash" ? `Commission deducted: -₹${commissionVal.toFixed(2)} (You kept ₹${totalEarnings} in cash)` : `Earnings added to wallet: +₹${remainingEarnings.toFixed(2)} (Fare: ₹${totalEarnings} minus commission of ₹${commissionVal.toFixed(2)})`;
          const completionSteps = [{
            label: "Calculating Final Distance...",
            desc: `GPS verified: ${finalDistance} km`
          }, {
            label: "Calculating Final Fare...",
            desc: `Total Fare calculated: ₹${totalEarnings}`
          }, {
            label: "Initiating Payment Collection...",
            desc: `Requesting payment via ${pMode === "cash" ? "Pay by Cash" : "Online Payment"}`
          }, {
            label: "Payment Success!",
            desc: "Ride completed successfully"
          }, {
            label: "Rating & Reviews...",
            desc: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold leading-normal", children: activeReq.rating_driver ? `Customer rated you: ${activeReq.rating_driver} stars` : "Default customer rating processed (5 stars)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-1 mt-1 bg-background/40 p-2 rounded-xl border border-border/40", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black uppercase tracking-wider text-primary", children: "Rate Chennai Rapido:" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1.5 mt-0.5", children: [1, 2, 3, 4, 5].map((star) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: (e) => {
                  e.stopPropagation();
                  setRiderRatingInput(star);
                }, className: "focus:outline-none transition active:scale-125 hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `size-5 ${riderRatingInput >= star ? "fill-amber-400 text-amber-400" : "text-border"}` }) }, star)) })
              ] })
            ] })
          }, {
            label: "Updating Ride History...",
            desc: "Saved trip in database archives"
          }, {
            label: "Rider Available for Next Ride",
            desc: "Setting driver status to online & available"
          }];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-black uppercase tracking-widest text-primary animate-pulse", children: "Ride Completion Lifecycle" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-foreground mt-1", children: "Processing Ride Settlement" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5 max-h-[360px] overflow-y-auto pr-1", children: completionSteps.map((step, idx) => {
              const isDone = completionStep > idx;
              const isCurrent = completionStep === idx;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-start gap-3 p-3 rounded-2xl border transition-all duration-300 ${isDone ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-500" : isCurrent ? "bg-primary/5 border-primary/25 text-primary scale-[1.01] shadow-sm" : "bg-secondary/40 border-border/50 text-muted-foreground opacity-60"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 shrink-0", children: isDone ? /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-4.5 w-4.5 text-emerald-500" }) : isCurrent ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex h-4.5 w-4.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex rounded-full h-4.5 w-4.5 bg-primary/25 border border-primary text-[10px] font-black items-center justify-center text-primary", children: idx + 1 })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-4.5 w-4.5 rounded-full border-2 border-muted flex items-center justify-center text-[9px] font-bold", children: idx + 1 }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 text-left", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold leading-none", children: step.label }),
                  (isCurrent || isDone) && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-1 leading-normal font-semibold", children: step.desc })
                ] })
              ] }, idx);
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleNextCompletionStep, className: "mt-4 w-full rounded-full bg-primary text-primary-foreground font-black py-4 shadow-md hover:bg-primary/95 transition text-sm uppercase tracking-wide", children: getCompletionButtonLabel() })
          ] });
        })()
      ] })
    ] }),
    chatOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-50 bg-slate-900 text-white flex flex-col justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 pt-12 pb-4 bg-slate-950 border-b border-white/5 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-8 w-8 rounded-full bg-primary flex items-center justify-center font-bold text-white", children: activeReq.customerName[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-sm block", children: activeReq.customerName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-slate-400 font-bold uppercase", children: t("customer") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setChatOpen(false), className: "text-slate-400 hover:text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-6 w-6" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-5 space-y-4", children: chatLog.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${c.sender === "rider" ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[75%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed shadow ${c.sender === "rider" ? "bg-primary text-white rounded-tr-none" : "bg-slate-800 text-slate-100 rounded-tl-none"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: c.text }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[8px] text-white/40 text-right mt-1 font-bold", children: c.time })
      ] }) }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-slate-950 border-t border-white/5 flex gap-2 items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: chatInput, onChange: (e) => setChatInput(e.target.value), placeholder: "Type message to passenger...", className: "flex-1 bg-slate-900 border border-white/10 rounded-full px-4 py-3 text-xs outline-none text-white focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSendChat, className: "h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 hover:scale-105 active:scale-95 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
      ] })
    ] }),
    issueOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl relative slide-up text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIssueOpen(false), className: "absolute top-4 right-4 text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-black tracking-tight mb-2 flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "h-5 w-5 text-primary" }),
        t("complaint_title")
      ] }),
      issueSubmitted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-6 text-center py-4 bg-success/10 rounded-2xl text-success font-bold text-xs flex items-center justify-center gap-2 animate-bounce", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("issue_reported_ok") })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: issueText, onChange: (e) => setIssueText(e.target.value), placeholder: t("complaint_placeholder"), rows: 4, className: "w-full bg-secondary border border-border rounded-2xl p-4 text-xs font-semibold outline-none focus:border-primary transition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleIssueSubmit, className: "flex-1 py-3 rounded-full bg-primary text-primary-foreground font-black text-xs shadow hover:bg-primary/95 transition active:scale-95", children: "Submit Ticket" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIssueOpen(false), className: "px-4 py-3 rounded-full bg-secondary border border-border text-foreground font-bold text-xs", children: "Cancel" })
        ] })
      ] })
    ] }) })
  ] });
}
function Tile({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-secondary border border-border p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-sm text-foreground mt-0.5", children: value })
  ] });
}
export {
  ActiveRide as component
};
