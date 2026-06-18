import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, s as store, a as api, t as translate } from "./router-BpidCmwR.mjs";
import { R as RealTimeMap } from "./RealTimeMap-B4JiaLq8.mjs";
import { a as ArrowLeft, Z as ShieldAlert, _ as ShieldCheck, a1 as Star, J as MessageCircle, Q as Phone, j as Check, X as Share2, q as Compass, W as Send } from "../_libs/lucide-react.mjs";
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
function Track() {
  const {
    language,
    theme,
    ride,
    chatMessages,
    trustedContacts,
    avoidUnlit,
    prioritizeHighways,
    patrolRoutes
  } = useAppStore();
  const navigate = useNavigate();
  const [showChat, setShowChat] = reactExports.useState(false);
  const [msgText, setMsgText] = reactExports.useState("");
  const [copiedLink, setCopiedLink] = reactExports.useState(false);
  const [showShareToast, setShowShareToast] = reactExports.useState(false);
  const [nearbyDrivers, setNearbyDrivers] = reactExports.useState([]);
  const [completedFlowStep, setCompletedFlowStep] = reactExports.useState(null);
  const [driverRating, setDriverRating] = reactExports.useState(5);
  const [ratingHover, setRatingHover] = reactExports.useState(null);
  const [paymentMode, setPaymentMode] = reactExports.useState("wallet");
  const {
    wallet
  } = useAppStore();
  const calculateTrackDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };
  const displayDistance = ride.distance ? `${ride.distance} km` : ride.pickupCoords && ride.dropCoords ? `${calculateTrackDistance(ride.pickupCoords.lat, ride.pickupCoords.lon, ride.dropCoords.lat, ride.dropCoords.lon)} km` : "4.2 km";
  const platformFee = ride.vehicle === "bike" ? 3 : 5;
  const isSurge = ride.surgeApplied;
  const totalFare = ride.negotiatedPrice;
  const discount = ride.discount || 0;
  const undiscountedTotal = totalFare + discount;
  const baseRidePrice = isSurge ? Math.round((undiscountedTotal - platformFee) / 1.2) : undiscountedTotal - platformFee;
  const surgeAmt = isSurge ? undiscountedTotal - baseRidePrice - platformFee : 0;
  reactExports.useEffect(() => {
    let active = true;
    async function fetchNearby() {
      try {
        const users = await api.getUsers() || [];
        if (!active) return;
        const eligible = users.filter((u) => {
          if (u.role !== "driver") return false;
          if (u.status !== "active" && u.status !== "new") return false;
          if (u.kyc_status !== "VERIFIED") return false;
          if (!u.online && !u.is_online) return false;
          const activeMatch = u.active_vehicle_type ? u.active_vehicle_type === ride.vehicle : true;
          if (!activeMatch) return false;
          const hasMatchingVehicle = u.vehicles && u.vehicles.some((v) => v.vehicle_type === ride.vehicle);
          if (!hasMatchingVehicle) return false;
          return true;
        });
        const rideIdInt = parseInt(ride.id || "") || 1;
        const mapped = eligible.map((d, idx) => {
          const distInMeters = 300 + (d.id * 17 + rideIdInt * 31) % 2e3;
          const distanceStr = distInMeters >= 1e3 ? `${(distInMeters / 1e3).toFixed(1)}km` : `${distInMeters}m`;
          return {
            ...d,
            distanceVal: distInMeters,
            distanceStr
          };
        }).sort((a, b) => a.distanceVal - b.distanceVal);
        setNearbyDrivers(mapped);
      } catch (err) {
        console.error("Failed to load nearby drivers:", err);
      }
    }
    if (ride.step === "searching" || ride.step === "matching") {
      fetchNearby();
      const interval = setInterval(fetchNearby, 3e3);
      return () => {
        active = false;
        clearInterval(interval);
      };
    }
  }, [ride.step, ride.vehicle]);
  const chatEndRef = reactExports.useRef(null);
  const t = (key) => translate(key, language);
  reactExports.useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [chatMessages, showChat]);
  const handleVerifyOtp = () => {
    store.startTrip();
  };
  const handleSendChat = () => {
    if (!msgText.trim()) return;
    store.sendChatMessage(msgText);
    setMsgText("");
  };
  const handleShareTrip = () => {
    const shareUrl = `${window.location.origin}/app/track?rideId=${ride.id || "live"}`;
    const shareText = `I'm on a Rideuu! Track my live trip here: ${shareUrl}`;
    if (navigator.share) {
      navigator.share({
        title: "Track my Rideuu",
        text: shareText,
        url: shareUrl
      }).catch((err) => console.log("Error sharing", err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedLink(true);
        setShowShareToast(true);
        setTimeout(() => {
          setCopiedLink(false);
          setShowShareToast(false);
        }, 3e3);
      }).catch((err) => console.error("Could not copy text: ", err));
    }
  };
  const handleTriggerSos = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        store.triggerSos(pos.coords.latitude, pos.coords.longitude, pos.coords.speed || 0, pos.coords.heading ? String(pos.coords.heading) : "North");
      }, () => {
        store.triggerSos(ride.pickupCoords?.lat || 13.0382, ride.pickupCoords?.lon || 80.2785, 0, "North");
      });
    } else {
      store.triggerSos(ride.pickupCoords?.lat || 13.0382, ride.pickupCoords?.lon || 80.2785, 0, "North");
    }
    navigate({
      to: "/app/safety"
    });
  };
  reactExports.useEffect(() => {
  }, [ride.progress]);
  const getCoordinates = (pct) => {
    const p1 = {
      x: 50,
      y: 240
    };
    const p2 = {
      x: 160,
      y: 180
    };
    const p3 = {
      x: 260,
      y: 110
    };
    const p4 = {
      x: 320,
      y: 60
    };
    if (pct < 33) {
      const factor = pct / 33;
      return {
        x: p1.x + (p2.x - p1.x) * factor,
        y: p1.y + (p2.y - p1.y) * factor
      };
    } else if (pct < 66) {
      const factor = (pct - 33) / 33;
      return {
        x: p2.x + (p3.x - p2.x) * factor,
        y: p2.y + (p3.y - p2.y) * factor
      };
    } else {
      const factor = (pct - 66) / 34;
      return {
        x: p3.x + (p4.x - p3.x) * factor,
        y: p3.y + (p4.y - p3.y) * factor
      };
    }
  };
  getCoordinates(ride.progress);
  reactExports.useEffect(() => {
    if (ride.completion_step !== void 0 && ride.completion_step >= 0) {
      const step = ride.completion_step;
      if (step === 0) {
        setCompletedFlowStep("trip_completed");
      } else if (step === 1) {
        setCompletedFlowStep("final_fare");
      } else if (step === 2) {
        setCompletedFlowStep("payment");
      } else if (step === 3) {
        setCompletedFlowStep("payment_success");
      } else if (step === 4) {
        setCompletedFlowStep("rate_driver");
      } else if (step >= 5) {
        setCompletedFlowStep("trip_summary");
      }
    } else if (ride.step === "completed" && !completedFlowStep) {
      setCompletedFlowStep("trip_completed");
    }
  }, [ride.completion_step, ride.step]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-dvh text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-[48dvh] overflow-hidden bg-slate-950", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-x-0 top-10 z-30 flex items-center justify-between px-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.resetBooking(), className: "grid size-10 place-items-center rounded-xl border border-white/10 bg-black/60 text-white backdrop-blur-md shadow hover:bg-black/80 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleTriggerSos, className: `inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black text-white shadow-lg transition active:scale-95 ${ride.isSosTriggered ? "bg-emerald-600 shadow-emerald-600/30" : "bg-destructive animate-pulse shadow-destructive/30"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "size-4" }),
          " ",
          ride.isSosTriggered ? "SOS ACTIVE" : "PRESS SOS"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RealTimeMap, { pickupCoords: ride.step === "arriving" && ride.driver?.lat && ride.driver?.lng ? {
        lat: ride.driver.lat,
        lon: ride.driver.lng
      } : ride.pickupCoords, dropCoords: ride.step === "arriving" ? ride.pickupCoords : ride.dropCoords, progress: ride.progress, nearbyDrivers }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute left-1/2 top-24 -translate-x-1/2 rounded-full border border-white/10 bg-black/75 px-4.5 py-2 text-xs font-extrabold text-white backdrop-blur-md shadow-xl flex items-center gap-2", children: [
        ride.step === "arriving" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-primary animate-ping" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Arriving in ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-primary", children: "3 min" })
          ] })
        ] }),
        ride.step === "ongoing" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-emerald-500 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "In Transit · Speed ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-emerald-400", children: [
              ride.speed,
              " km/h"
            ] })
          ] })
        ] }),
        ride.step === "completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-emerald-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-emerald-400 font-black", children: "Ride Finished Successfully!" })
        ] }),
        ride.step === "cancelled" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-destructive font-black", children: "Ride Cancelled" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mt-6 relative z-30 rounded-t-3xl border border-border bg-background p-5 shadow-2xl transition-colors duration-300", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" }),
      ride.driver ? completedFlowStep ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 text-center py-2 animate-scale-in", children: [
        completedFlowStep === "trip_completed" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/15 animate-bounce", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black text-foreground", children: "Trip Completed! 🎉" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed", children: "You have arrived safely at your destination. Thank you for choosing Rideuu!" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCompletedFlowStep("final_fare"), className: "w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition", children: "View Final Fare" })
        ] }),
        completedFlowStep === "final_fare" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-foreground", children: "Fare Summary 💰" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 font-bold", children: "Official fare breakdown" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-bold space-y-2.5 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Base Ride Price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "₹",
                baseRidePrice,
                ".00"
              ] })
            ] }),
            isSurge && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-primary", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Surge Adjustment" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "₹",
                surgeAmt,
                ".00"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Platform Convenience Fee" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "₹",
                platformFee,
                ".00"
              ] })
            ] }),
            ride.discount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-emerald-600", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Coupon Discount" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "−₹",
                ride.discount,
                ".00"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border my-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-sm font-black text-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Payable Fare" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-black text-base", children: [
                "₹",
                ride.negotiatedPrice,
                ".00"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCompletedFlowStep("payment"), className: "w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition", children: "Proceed to Payment" })
        ] }),
        completedFlowStep === "payment" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-foreground", children: "Payment Collection 💳" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 font-bold", children: "Choose your payment method" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPaymentMode("wallet"), className: `w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${paymentMode === "wallet" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card hover:bg-muted/30"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold text-foreground", children: "Namma Cash Wallet" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground mt-0.5 font-bold", children: [
                  "Balance: ₹",
                  wallet.balance.toFixed(2)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `size-4 rounded-full border-2 flex items-center justify-center ${paymentMode === "wallet" ? "border-primary bg-primary" : "border-muted"}`, children: paymentMode === "wallet" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-primary-foreground" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPaymentMode("upi"), className: `w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${paymentMode === "upi" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card hover:bg-muted/30"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold text-foreground", children: "Razorpay UPI" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5 font-bold", children: "Pay via Google Pay, PhonePe, Paytm" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `size-4 rounded-full border-2 flex items-center justify-center ${paymentMode === "upi" ? "border-primary bg-primary" : "border-muted"}`, children: paymentMode === "upi" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-primary-foreground" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPaymentMode("cash"), className: `w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${paymentMode === "cash" ? "border-primary bg-primary/5 text-primary" : "border-border bg-card hover:bg-muted/30"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold text-foreground", children: "Pay by Cash" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5 font-bold", children: "Hand over physical cash to the Captain" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `size-4 rounded-full border-2 flex items-center justify-center ${paymentMode === "cash" ? "border-primary bg-primary" : "border-muted"}`, children: paymentMode === "cash" && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-primary-foreground" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: async () => {
            if (paymentMode === "wallet") {
              store.update((s) => {
                s.wallet.balance = Math.max(0, s.wallet.balance - ride.negotiatedPrice);
              });
              const token = store.getState().token;
              if (token) {
                const me = await api.getMe(token);
                if (me) {
                  await api.updateUser(me.id, {
                    wallet_balance: Math.max(0, me.wallet_balance - ride.negotiatedPrice)
                  });
                }
              }
            }
            if (ride.id) {
              await api.updateRide(ride.id, {
                completion_step: 3,
                payment_mode: paymentMode
              });
            }
            setCompletedFlowStep("payment_success");
          }, className: "w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition", children: [
            "Pay ₹",
            ride.negotiatedPrice,
            ".00"
          ] })
        ] }),
        completedFlowStep === "payment_success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 py-4 animate-scale-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/15", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-8" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black text-foreground", children: paymentMode === "cash" ? "Hand Over Cash! 💵" : "Payment Successful! 🎉" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed", children: paymentMode === "cash" ? `Please hand over ₹${ride.negotiatedPrice}.00 in cash directly to your Captain.` : `₹${ride.negotiatedPrice}.00 successfully paid via ${paymentMode === "wallet" ? "Namma Cash Wallet" : "Razorpay UPI"}.` })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCompletedFlowStep("rate_driver"), className: "w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition", children: "Rate Captain" })
        ] }),
        completedFlowStep === "rate_driver" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-foreground", children: "Rate your Captain ⭐" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground mt-0.5 font-bold", children: [
              "How was your ride with ",
              ride.driver.name,
              "?"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-2 py-3", children: [1, 2, 3, 4, 5].map((star) => {
            const isActive = (ratingHover !== null ? ratingHover : driverRating) >= star;
            return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onMouseEnter: () => setRatingHover(star), onMouseLeave: () => setRatingHover(null), onClick: () => setDriverRating(star), className: "text-amber-400 focus:outline-none transition active:scale-125 hover:scale-110", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: `size-9 ${isActive ? "fill-amber-400 text-amber-400" : "text-border"}` }) }, star);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            if (ride.id) {
              api.updateRide(ride.id, {
                rating_driver: driverRating
              });
            }
            setCompletedFlowStep("trip_summary");
          }, className: "w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition", children: "Submit Review" })
        ] }),
        completedFlowStep === "trip_summary" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black text-foreground", children: "Trip Summary 📄" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5 font-bold", children: "Settlement receipt & feedback saved" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-bold space-y-3 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground", children: ride.driver.name[0] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold text-foreground", children: ride.driver.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-muted-foreground mt-0.5", children: [
                  ride.driver.vehicle,
                  " · ",
                  ride.driver.plate
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-y-2 text-[10px] font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Rating Given" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right flex items-center justify-end gap-1 text-amber-500 font-extrabold", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-3 fill-amber-500 text-amber-500" }),
                " ",
                driverRating,
                " Stars"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Distance Traveled" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-foreground", children: displayDistance }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Payment Mode" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right text-foreground uppercase", children: paymentMode === "wallet" ? "Wallet" : paymentMode === "upi" ? "UPI" : "Cash" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: "Total Fare Paid" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-primary font-black", children: [
                "₹",
                ride.negotiatedPrice,
                ".00"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              store.resetBooking();
              navigate({
                to: "/app/trips"
              });
            }, className: "flex-1 rounded-full border border-border bg-card py-3.5 text-xs font-bold text-foreground hover:bg-muted transition", children: "View History" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              store.resetBooking();
              navigate({
                to: "/app/home"
              });
            }, className: "flex-1 rounded-full bg-primary text-primary-foreground py-3.5 text-xs font-black shadow shadow-primary/20 hover:brightness-105 transition", children: "Back to Home" })
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm relative overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-0 h-full w-1.5 bg-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-12 place-items-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground shadow-sm", children: ride.driver.name[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-extrabold flex items-center gap-1.5", children: [
              language === "en" ? ride.driver.name : ride.driver.tamilName,
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 text-[8px] font-black text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-2 fill-primary text-primary" }),
                " ",
                ride.driver.rating
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: language === "en" ? ride.driver.vehicle : ride.driver.tamilVehicle }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-secondary px-2 py-0.5 text-[9px] font-black tracking-wider text-primary border border-primary/20", children: ride.driver.plate }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-3" }),
                " ",
                ride.driver.trustScore,
                "% Trust Score"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowChat(true), className: "relative grid size-10 place-items-center rounded-xl border border-border bg-card hover:border-primary/20 active:scale-95 transition shadow-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "size-4.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -right-1 -top-1 size-2 rounded-full bg-primary animate-pulse" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: `tel:${ride.driver.phone}`, className: "grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground shadow active:scale-95 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-4.5 text-primary" }) })
          ] })
        ] }),
        (avoidUnlit || prioritizeHighways || patrolRoutes) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card px-3 py-2.5 shadow-sm text-xs font-semibold text-left flex flex-wrap gap-1.5 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase text-muted-foreground mr-1", children: "Active Safety Features:" }),
          avoidUnlit && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-600", children: "💡 Lit Lanes" }),
          prioritizeHighways && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-orange-500/10 px-2 py-0.5 text-[9px] font-black text-orange-600", children: "🛣️ Highway Priority" }),
          patrolRoutes && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-md bg-blue-500/10 px-2 py-0.5 text-[9px] font-black text-blue-600 animate-pulse", children: "🚓 Police Overlay" })
        ] }),
        ride.step === "arriving" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-dashed border-primary bg-primary/5 p-4 text-center space-y-2 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-black uppercase tracking-wider text-muted-foreground", children: t("OTP Verification") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-black tracking-widest text-primary font-mono", children: ride.otp }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground leading-normal", children: t("Give this OTP to driver on arrival") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleVerifyOtp, className: "mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[10px] font-black text-primary-foreground shadow shadow-primary/20 hover:brightness-105 active:scale-95 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }),
            " Start Trip (Simulate OTP Share)"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-3 shadow-sm text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground pl-1", children: "Live timeline" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 relative pl-5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1.5 top-1 bottom-1 w-0.5 bg-border" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1.5 top-1 w-0.5 bg-primary transition-all duration-300", style: {
              height: `${ride.progress}%`
            } }),
            [{
              label: "Ride Confirmed",
              desc: "Driver matching successful",
              active: true
            }, {
              label: "Driver Arrived at Pickup",
              desc: "Besant Nagar lighthouse entrance",
              active: ride.progress >= 25 || ride.step === "ongoing"
            }, {
              label: "Trip In Transit",
              desc: `Speed: ${ride.speed} km/h · passing Santhome`,
              active: ride.step === "ongoing" && ride.progress > 25
            }, {
              label: "Arrived at Destination",
              desc: `T. Nagar Pondy Bazaar`,
              active: ride.step === "completed"
            }].map((step, idx) => {
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative text-left", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute -left-5 top-0.5 size-2.5 rounded-full border-2 bg-card ${step.active ? "border-primary bg-primary animate-pulse" : "border-border"}` }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-extrabold ${step.active ? "text-foreground" : "text-muted-foreground"}`, children: step.label }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5 leading-normal", children: step.desc })
              ] }, idx);
            })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleShareTrip, className: "flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-3.5 shadow-sm hover:border-primary/20 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "size-4" }),
            " ",
            copiedLink ? "Link Copied!" : "Share Live Trip"
          ] }),
          ride.step !== "ongoing" && ride.step !== "completed" ? /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.cancelRide(), className: "rounded-2xl border border-destructive/20 bg-destructive/5 py-3.5 text-destructive hover:bg-destructive/10 transition", children: "Cancel Ride" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => store.toggleAudioRecording(), className: `flex items-center justify-center gap-1.5 rounded-2xl border py-3.5 transition ${ride.isAudioRecording ? "border-red-500 bg-red-500/10 text-red-600 animate-pulse" : "border-border bg-card"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `size-2 rounded-full bg-red-500 ${ride.isAudioRecording ? "animate-ping" : ""}` }),
            ride.isAudioRecording ? "Audio Recording Active" : "Record Audio Log"
          ] })
        ] })
      ] }) : ride.step === "searching" || ride.step === "matching" ? (
        /* Premium Searching/Matching Panel */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto size-20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-2 rounded-full border-4 border-primary/40 animate-pulse" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-4 rounded-full bg-primary/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Compass, { className: "size-8 text-primary animate-spin", style: {
              animationDuration: "3s"
            } }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-extrabold text-foreground animate-pulse", children: language === "ta" ? "சாரதியைத் தேடுகிறது..." : "Finding your Captain..." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground mt-1.5 max-w-xs mx-auto leading-normal", children: language === "ta" ? "உங்களுக்கு அருகில் உள்ள ஆட்டோ/பைக் தேடப்படுகிறது. தயவுசெய்து காத்திருக்கவும்." : "Connecting with nearest drivers in Chennai. Please wait..." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-3.5 shadow-sm text-left text-xs font-semibold space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-primary" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "From:" }),
                " ",
                ride.pickup
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-destructive" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "To:" }),
                " ",
                ride.drop
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-2 border-t border-border flex justify-between items-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase font-black tracking-wider text-muted-foreground", children: "Fare negotiated" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-black text-primary", children: [
                "₹",
                ride.negotiatedPrice
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm text-left text-xs space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-[11px] uppercase tracking-wider text-muted-foreground", children: "Available Captains Nearby" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-primary font-bold", children: [
                nearbyDrivers.length,
                " online"
              ] })
            ] }),
            nearbyDrivers.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-36 overflow-y-auto pr-1", children: nearbyDrivers.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center bg-muted/20 border border-border/40 p-2 rounded-lg", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-7 rounded bg-primary/10 text-primary font-extrabold flex items-center justify-center text-[10px]", children: d.name[0] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold text-foreground block", children: d.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground block", children: d.vehicles?.[0]?.model || (ride.vehicle === "bike" ? "Honda Activa" : "Bajaj RE Auto") })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground block", children: d.distanceStr }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] text-emerald-500 font-extrabold block", children: "KYC Verified" })
              ] })
            ] }, d.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-2 text-[10px] text-muted-foreground", children: [
              "No online ",
              ride.vehicle,
              " Captains currently match matching requirements."
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.cancelRide(), className: "w-full rounded-2xl border border-destructive/20 bg-destructive/5 py-3.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition", children: language === "ta" ? "பயணத்தை ரத்து செய்" : "Cancel Search" })
        ] })
      ) : (
        /* Empty/Cancelled state */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-14 mx-auto place-items-center rounded-full bg-destructive/10 text-destructive animate-pulse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "size-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-extrabold", children: ride.step === "cancelled" ? "Ride Cancelled" : "No Active Bookings" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-normal", children: ride.step === "cancelled" ? "Your booking was successfully terminated. You can rebook a bike or auto at any time." : "Book a ride from the dashboard or schedule page to begin tracking." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/home", onClick: () => store.resetBooking(), className: "inline-block rounded-2xl bg-secondary px-6 py-3.5 text-xs font-extrabold text-secondary-foreground shadow", children: "Back to Home" })
        ] })
      )
    ] }),
    showChat && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-end bg-black/60 backdrop-blur-xs p-0 sm:p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card flex flex-col h-[75dvh] shadow-2xl animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center px-5 py-4 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-8 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground", children: ride.driver?.name[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-extrabold", children: ride.driver?.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[9px] text-emerald-600 font-bold flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-emerald-500 animate-pulse" }),
              " Active Driver Chat"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowChat(false), className: "text-xs font-bold text-muted-foreground hover:text-foreground", children: "Close" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-muted/20", children: [
        chatMessages.map((msg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex flex-col max-w-[75%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `rounded-2xl px-4 py-2.5 text-xs font-semibold ${msg.sender === "user" ? "bg-primary text-primary-foreground shadow" : "bg-card border border-border text-foreground shadow-sm"}`, children: msg.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] text-muted-foreground mt-1 px-1.5", children: msg.time })
        ] }, msg.id)),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: chatEndRef })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-t border-border bg-card flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: msgText, onChange: (e) => setMsgText(e.target.value), placeholder: "Type message in தமிழ் or English...", onKeyDown: (e) => e.key === "Enter" && handleSendChat(), className: "flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSendChat, className: "grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground hover:brightness-105 transition shadow shadow-primary/25", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4" }) })
      ] })
    ] }) }),
    showShareToast && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-24 inset-x-4 z-40 mx-auto max-w-xs rounded-xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md p-3.5 text-center text-xs font-extrabold text-emerald-600 shadow shadow-emerald-500/10 animate-fade-in flex items-center justify-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-4.5", strokeWidth: 2.5 }),
      " Live Track URL copied to Clipboard!"
    ] })
  ] });
}
export {
  Track as component
};
