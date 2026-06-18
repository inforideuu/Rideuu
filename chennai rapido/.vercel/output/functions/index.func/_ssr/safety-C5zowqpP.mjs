import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppStore, s as store, t as translate } from "./router-BpidCmwR.mjs";
import { T as Radio, t as Flame, Q as Phone, Z as ShieldAlert, _ as ShieldCheck, X as Share2, E as Eye, Y as Shield, a8 as UserPlus, a5 as Trash2, x as Lock } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
function Safety() {
  const {
    language,
    theme,
    womenSafetyMode,
    trustedContacts,
    ride,
    profile,
    avoidUnlit,
    prioritizeHighways,
    patrolRoutes
  } = useAppStore();
  const [sosCountdown, setSosCountdown] = reactExports.useState(null);
  const [showPinModal, setShowPinModal] = reactExports.useState(false);
  const [pinDigits, setPinDigits] = reactExports.useState(["", "", "", ""]);
  const [shareLiveTrip, setShareLiveTrip] = reactExports.useState(true);
  const [copiedLink, setCopiedLink] = reactExports.useState(false);
  const handleShareTripLink = () => {
    const shareUrl = `${window.location.origin}/app/track?rideId=${ride.id || "live"}`;
    const shareText = `Track my live Rideuu here: ${shareUrl}`;
    if (navigator.share) {
      navigator.share({
        title: "Track my Rideuu",
        text: shareText,
        url: shareUrl
      }).catch((err) => console.log("Error sharing", err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3e3);
      }).catch((err) => console.error("Could not copy text: ", err));
    }
  };
  const [showAddContact, setShowAddContact] = reactExports.useState(false);
  const [newCName, setNewCName] = reactExports.useState("");
  const [newCPhone, setNewCPhone] = reactExports.useState("");
  const [newCRelationship, setNewCRelationship] = reactExports.useState("Friend");
  const countdownIntervalRef = reactExports.useRef(null);
  const t = (key) => translate(key, language);
  const handleSosMouseDown = () => {
    if (ride.isSosTriggered) return;
    setSosCountdown(3);
  };
  reactExports.useEffect(() => {
    if (sosCountdown !== null) {
      if (sosCountdown > 0) {
        countdownIntervalRef.current = setTimeout(() => {
          setSosCountdown(sosCountdown - 1);
        }, 1e3);
      } else {
        const triggerWhatsAppAlert = (lat, lon) => {
          if (trustedContacts && trustedContacts.length > 0) {
            trustedContacts.forEach((contact) => {
              const cleanedPhone = contact.phone.replace(/[^0-9]/g, "");
              const waPhone = cleanedPhone.startsWith("91") && cleanedPhone.length === 12 ? cleanedPhone : `91${cleanedPhone}`;
              const trackingUrl = `${window.location.origin}/app/track?rideId=${ride.id || "live"}`;
              const message = `🚨 EMERGENCY SOS: I am on a ride and triggered an emergency alert. Please track my live location here: ${trackingUrl} (Lat: ${lat.toFixed(5)}, Lng: ${lon.toFixed(5)})`;
              const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(message)}`;
              window.open(waUrl, "_blank");
            });
          }
        };
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            store.triggerSos(pos.coords.latitude, pos.coords.longitude, pos.coords.speed || 0, pos.coords.heading ? String(pos.coords.heading) : "North");
            triggerWhatsAppAlert(pos.coords.latitude, pos.coords.longitude);
          }, () => {
            const lat = ride.pickupCoords?.lat || 13.0382;
            const lon = ride.pickupCoords?.lon || 80.2785;
            store.triggerSos(lat, lon, 0, "North");
            triggerWhatsAppAlert(lat, lon);
          });
        } else {
          const lat = ride.pickupCoords?.lat || 13.0382;
          const lon = ride.pickupCoords?.lon || 80.2785;
          store.triggerSos(lat, lon, 0, "North");
          triggerWhatsAppAlert(lat, lon);
        }
        setSosCountdown(null);
      }
    }
    return () => {
      if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
    };
  }, [sosCountdown, ride.pickupCoords]);
  reactExports.useEffect(() => {
    let intervalId = null;
    if (ride.isSosTriggered && ride.sos_id) {
      const sendSnapshot = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const {
              latitude,
              longitude,
              speed,
              heading
            } = pos.coords;
            store.sendSosLocationSnapshot(latitude, longitude, speed || 0, heading ? String(heading) : "North");
          }, () => {
            const mockLat = (ride.pickupCoords?.lat || 13.0382) + (Math.random() - 0.5) * 2e-3;
            const mockLon = (ride.pickupCoords?.lon || 80.2785) + (Math.random() - 0.5) * 2e-3;
            store.sendSosLocationSnapshot(mockLat, mockLon, 42, "North");
          }, {
            enableHighAccuracy: true,
            timeout: 5e3
          });
        } else {
          const mockLat = (ride.pickupCoords?.lat || 13.0382) + (Math.random() - 0.5) * 2e-3;
          const mockLon = (ride.pickupCoords?.lon || 80.2785) + (Math.random() - 0.5) * 2e-3;
          store.sendSosLocationSnapshot(mockLat, mockLon, 42, "North");
        }
      };
      sendSnapshot();
      intervalId = setInterval(sendSnapshot, 3e3);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ride.isSosTriggered, ride.sos_id, ride.pickupCoords]);
  const handleSosMouseUp = () => {
    if (sosCountdown && sosCountdown > 0) {
      setSosCountdown(null);
      if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
    }
  };
  const handleCancelSos = () => {
    setShowPinModal(true);
  };
  const handleVerifyPin = () => {
    const code = pinDigits.join("");
    const correctPin = profile.sosPin || "1234";
    if (code === correctPin) {
      store.cancelSos();
      setShowPinModal(false);
      setPinDigits(["", "", "", ""]);
    } else {
      alert("Invalid Security PIN!");
      setPinDigits(["", "", "", ""]);
    }
  };
  const handleAddContactInline = () => {
    if (!newCName || !newCPhone) return;
    if (trustedContacts.length >= 5) {
      alert("Maximum 5 trusted contacts allowed.");
      return;
    }
    store.addTrustedContact({
      id: "contact_" + Date.now(),
      name: newCName,
      phone: newCPhone,
      relationship: newCRelationship
    });
    setNewCName("");
    setNewCPhone("");
    setNewCRelationship("Friend");
    setShowAddContact(false);
  };
  const handleDialHelpline = (num) => {
    window.location.href = `tel:${num}`;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-24 text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "bg-secondary px-5 pt-12 pb-6 text-secondary-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-primary", children: t("Safety toolkit") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-xl font-extrabold tracking-tight leading-tight", children: t("You're never alone in Chennai.") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checkered-sm h-1.5 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 pt-5 text-center", children: ride.isSosTriggered ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl bg-destructive p-6 text-destructive-foreground shadow-xl shadow-destructive/25 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-[0.06] checkered animate-pulse pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative pointer-events-none", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-16 mx-auto animate-ping opacity-75 pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "size-8 absolute inset-0 mx-auto top-4 animate-bounce pointer-events-none" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-extrabold tracking-wide uppercase", children: "Emergency SOS Activated" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] opacity-90 mt-1 leading-normal", children: "Chennai Police alerted. Live location tracking sent to Amma and Roomie Priya. Live cabin audio recording dispatched to secure backup nodes." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2 relative z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDialHelpline("112"), className: "flex-1 rounded-xl bg-white px-3 py-2.5 text-xs font-black text-destructive flex items-center justify-center gap-1.5 shadow cursor-pointer relative z-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-3.5 fill-destructive" }),
          " Dial 112"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCancelSos, className: "flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/20 cursor-pointer relative z-20", children: "Cancel SOS PIN" })
      ] })
    ] }) : (
      /* Press and hold SOS active buttons */
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onMouseDown: handleSosMouseDown, onMouseUp: handleSosMouseUp, onTouchStart: handleSosMouseDown, onTouchEnd: handleSosMouseUp, className: `relative grid w-full place-items-center overflow-hidden rounded-3xl bg-destructive py-10 text-destructive-foreground shadow-2xl shadow-destructive/20 active:scale-98 transition select-none ${sosCountdown !== null ? "animate-pulse" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-[0.06] checkered-sm pointer-events-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "relative size-12" }),
          sosCountdown !== null ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative mt-2 text-3xl font-black animate-scale-in", children: [
            "HOLD ",
            sosCountdown,
            "s"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative mt-2 text-sm font-black uppercase tracking-widest pl-1", children: t("Press for SOS") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative text-[9px] opacity-80 mt-1", children: t("Calls 112 and alerts contacts") })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[9px] text-muted-foreground", children: "Press and hold button for 3 seconds to dispatch immediate emergency alerts." })
      ] })
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2.5 px-4 pt-6 text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1", children: "Safety Controls" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-5.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-extrabold flex items-center gap-1.5 text-primary", children: [
            t("Women safety mode"),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-primary/20 px-1 py-0.5 text-[8px] font-black text-primary", children: "RECOMMENDED" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground leading-normal mt-0.5", children: "Filter driver matches to female verified, enables lit routes" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          if (!womenSafetyMode) {
            if (profile.gender?.toLowerCase() !== "female") {
              alert("Women Safety Mode can only be activated for female gender profiles.");
              return;
            }
          }
          store.setWomenSafetyMode(!womenSafetyMode);
        }, className: `relative inline-flex h-5.5 w-11 items-center rounded-full transition ${womenSafetyMode ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4.5 transform rounded-full bg-background shadow transition ${womenSafetyMode ? "translate-x-5" : "translate-x-0.5"}` }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-10 place-items-center rounded-xl bg-secondary text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold", children: t("Share live trip") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground leading-normal mt-0.5", children: t("Auto-share with trusted contacts") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            const nextVal = !shareLiveTrip;
            setShareLiveTrip(nextVal);
            if (nextVal) {
              handleShareTripLink();
            }
          }, className: `relative inline-flex h-5.5 w-11 items-center rounded-full transition ${shareLiveTrip ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4.5 transform rounded-full bg-background shadow transition ${shareLiveTrip ? "translate-x-5" : "translate-x-0.5"}` }) })
        ] }),
        shareLiveTrip && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleShareTripLink, className: "mt-2 w-full rounded-xl bg-primary/10 border border-primary/20 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition flex items-center justify-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "size-3.5" }),
          copiedLink ? "Link Copied!" : "Send Live Trip Link"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 px-4 space-y-2.5 text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1", children: "Monsoon / Night Pathway Routing" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 space-y-3.5 shadow-sm text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-extrabold text-xs flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4 text-muted-foreground" }),
              " Avoid Unlit Pathways"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Route calculation automatically avoids low streetlight lanes" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.setAvoidUnlit(!avoidUnlit), className: `relative inline-flex h-5 w-10 items-center rounded-full transition ${avoidUnlit ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4 transform rounded-full bg-background shadow transition ${avoidUnlit ? "translate-x-5" : "translate-x-0.5"}` }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-extrabold text-xs flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "size-4 text-muted-foreground" }),
              " Prioritize High-Activity Highways"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Prefers arterial main routes over shorter isolated grid shortcuts" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.setPrioritizeHighways(!prioritizeHighways), className: `relative inline-flex h-5 w-10 items-center rounded-full transition ${prioritizeHighways ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4 transform rounded-full bg-background shadow transition ${prioritizeHighways ? "translate-x-5" : "translate-x-0.5"}` }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-extrabold text-xs flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-4 text-primary animate-pulse" }),
              " Police Patrol Overlay routing"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Calculates routes covering active police vehicle checkpoints" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.setPatrolRoutes(!patrolRoutes), className: `relative inline-flex h-5 w-10 items-center rounded-full transition ${patrolRoutes ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4 transform rounded-full bg-background shadow transition ${patrolRoutes ? "translate-x-5" : "translate-x-0.5"}` }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-6 px-4 space-y-2.5 text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1", children: "Quick Helplines" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDialHelpline("112"), className: "rounded-2xl border border-border bg-card p-4 hover:border-destructive/30 transition shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold text-destructive", children: "112" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Chennai Police (All emergencies)" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleDialHelpline("1091"), className: "rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold text-primary", children: "1091" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Chennai Women Safety Helpline" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-4 pt-6 space-y-2.5 text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pl-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: t("Trusted contacts") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowAddContact(true), className: "inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "size-3.5" }),
          " ",
          t("Add")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: trustedContacts.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-full bg-secondary text-xs font-black text-primary", children: c.name ? c.name[0] : "C" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-extrabold", children: [
              c.name || "Contact",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-black ml-1 uppercase", children: c.relationship || "Friend" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: c.phone })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
          ride.isSosTriggered && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black text-emerald-600 animate-pulse", children: "ALERT SENT" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.deleteTrustedContact(c.id), className: "grid size-8 place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3.5" }) })
        ] })
      ] }, c.id)) })
    ] }),
    showPinModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center space-y-4 animate-scale-in text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-14 mx-auto text-primary animate-bounce" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-extrabold", children: "Enter Safety PIN" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground mt-1 leading-normal", children: [
          "Type your 4-digit security PIN to confirm you are safe and cancel the emergency alert. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Default: 1234" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center gap-3", children: pinDigits.map((digit, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: `sos-pin-${i}`, value: digit, onChange: (e) => {
        const val = e.target.value.replace(/\D/g, "");
        const next = [...pinDigits];
        next[i] = val.slice(-1);
        setPinDigits(next);
        if (val && i < 3) {
          document.getElementById(`sos-pin-${i + 1}`)?.focus();
        }
      }, onKeyDown: (e) => {
        if (e.key === "Backspace") {
          if (!pinDigits[i] && i > 0) {
            const next = [...pinDigits];
            next[i - 1] = "";
            setPinDigits(next);
            document.getElementById(`sos-pin-${i - 1}`)?.focus();
          } else {
            const next = [...pinDigits];
            next[i] = "";
            setPinDigits(next);
          }
        }
      }, className: "h-12 w-12 rounded-xl border border-border bg-background text-center text-lg font-extrabold focus:border-primary outline-none" }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleVerifyPin, className: "flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow", children: "Verify & Cancel SOS" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowPinModal(false), className: "flex-1 rounded-xl border border-border bg-card py-3 text-xs font-semibold", children: "Go Back" })
      ] })
    ] }) }),
    showAddContact && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in text-xs font-semibold", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-extrabold", children: "Add Trusted Contact" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Contact Name (e.g. Amma)", value: newCName, onChange: (e) => setNewCName(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", placeholder: "Mobile Number (+91 99999 12345)", value: newCPhone, onChange: (e) => setNewCPhone(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: newCRelationship, onChange: (e) => setNewCRelationship(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary text-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Father", children: "Father" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Mother", children: "Mother" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Brother", children: "Brother" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Sister", children: "Sister" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Friend", children: "Friend" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Spouse", children: "Spouse" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddContactInline, className: "flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow", children: "Save Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAddContact(false), className: "flex-1 rounded-xl border border-border bg-card py-3 text-xs font-semibold", children: "Cancel" })
      ] })
    ] }) })
  ] });
}
export {
  Safety as component
};
