import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, s as store, a as api, t as translate } from "./router-BpidCmwR.mjs";
import { h as Camera, P as Pen, ab as Wallet, l as ChevronRight, u as Globe, N as Moon, R as Plus, I as MapPin, a5 as Trash2, a8 as UserPlus, _ as ShieldCheck, K as Mic, B as Bell, y as LogOut, a7 as User } from "../_libs/lucide-react.mjs";
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
function Account() {
  const {
    language,
    theme,
    womenSafetyMode,
    profile,
    savedAddresses,
    trustedContacts,
    token
  } = useAppStore();
  const [isEditingProfile, setIsEditingProfile] = reactExports.useState(false);
  const [editName, setEditName] = reactExports.useState(profile.name);
  const [editEmail, setEditEmail] = reactExports.useState(profile.email);
  const [editPhone, setEditPhone] = reactExports.useState(profile.phone);
  const [editSosPin, setEditSosPin] = reactExports.useState(profile.sosPin || "1234");
  const [completedCount, setCompletedCount] = reactExports.useState(null);
  const [avgRating, setAvgRating] = reactExports.useState("N/A");
  reactExports.useEffect(() => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setEditSosPin(profile.sosPin || "1234");
  }, [profile]);
  reactExports.useEffect(() => {
    if (token) {
      store.loadUserData();
      api.getRides(token).then((res) => {
        if (res && Array.isArray(res)) {
          const completed = res.filter((r) => r.status === "completed");
          setCompletedCount(completed.length);
          const ratedRides = completed.filter((r) => r.rating_customer);
          if (ratedRides.length > 0) {
            const sum = ratedRides.reduce((acc, curr) => acc + curr.rating_customer, 0);
            setAvgRating((sum / ratedRides.length).toFixed(1));
          } else {
            setAvgRating("N/A");
          }
        } else {
          setCompletedCount(0);
          setAvgRating("N/A");
        }
      });
    } else {
      setCompletedCount(0);
      setAvgRating("N/A");
    }
  }, [token]);
  const [showAddressModal, setShowAddressModal] = reactExports.useState(false);
  const [newAddrLabel, setNewAddrLabel] = reactExports.useState("");
  const [newAddrVal, setNewAddrVal] = reactExports.useState("");
  const [showContactModal, setShowContactModal] = reactExports.useState(false);
  const [newContactName, setNewContactName] = reactExports.useState("");
  const [newContactPhone, setNewContactPhone] = reactExports.useState("");
  const fileInputRef = reactExports.useRef(null);
  const t = (key) => translate(key, language);
  const handleSaveProfile = async () => {
    store.updateProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
      sosPin: editSosPin
    });
    if (token) {
      try {
        const userMe = await api.getMe(token);
        if (userMe && userMe.id) {
          await api.updateUser(userMe.id, {
            name: editName,
            email: editEmail,
            phone: editPhone,
            sos_pin: editSosPin
          }, token);
        }
      } catch (err) {
        console.warn("Failed to sync profile changes to backend:", err);
      }
    }
    setIsEditingProfile(false);
  };
  const handleAddAddress = () => {
    if (!newAddrLabel || !newAddrVal) return;
    store.addAddress({
      id: "addr_" + Date.now(),
      label: newAddrLabel,
      tamilLabel: newAddrLabel,
      address: newAddrVal,
      icon: "star"
    });
    setNewAddrLabel("");
    setNewAddrVal("");
    setShowAddressModal(false);
  };
  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) return;
    store.addTrustedContact({
      id: "contact_" + Date.now(),
      name: newContactName,
      phone: newContactPhone
    });
    setNewContactName("");
    setNewContactPhone("");
    setShowContactModal(false);
  };
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        store.updateProfile({
          avatar: reader.result
        });
        store.addNotification({
          cat: "alerts",
          title: "Profile Image Uploaded",
          tamilTitle: "சுயவிவரப் படம் பதிவேற்றப்பட்டது",
          body: "Your profile picture was successfully updated.",
          tamilBody: "உங்கள் சுயவிவரப் படம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது."
        });
      };
      reader.readAsDataURL(file);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-24 text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative overflow-hidden bg-secondary text-secondary-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-10 -top-10 size-40 rounded-full bg-primary/25 blur-2xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative px-5 pt-12 pb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: handleAvatarClick, className: "group relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-secondary-foreground/20 bg-background shadow-md", children: [
            profile.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: profile.avatar, alt: "Avatar", className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full w-full place-items-center bg-primary text-xl font-extrabold text-primary-foreground", children: profile.name[0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "size-5 text-white" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, onChange: handleFileChange, accept: "image/*", className: "hidden" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-lg font-extrabold tracking-tight flex items-center gap-2", children: [
              profile.name,
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsEditingProfile(true), className: "text-secondary-foreground/60 hover:text-secondary-foreground transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "size-3.5" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-85 mt-0.5", children: [
              profile.phone,
              " · ",
              profile.email
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", onClick: () => store.logout(), className: "rounded-full border border-secondary-foreground/20 bg-secondary-foreground/5 px-3 py-1.5 text-[11px] font-bold shadow-sm transition hover:bg-secondary-foreground/10", children: language === "en" ? "Switch Account" : "மாற்று" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 grid grid-cols-3 gap-2 text-center font-semibold", children: [{
          v: completedCount !== null ? String(completedCount) : "0",
          l: "Trips",
          tl: "பயணங்கள்"
        }, {
          v: avgRating,
          l: "Rating",
          tl: "மதிப்பீடு"
        }, {
          v: `₹${store.getState().wallet.balance.toFixed(0)}`,
          l: "Wallet",
          tl: "நம்ம கேஷ்"
        }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-secondary-foreground/10 p-2.5 backdrop-blur-sm border border-secondary-foreground/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base font-extrabold text-primary", children: s.v }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase tracking-wider opacity-85 mt-0.5", children: language === "en" ? s.l : s.tl })
        ] }, s.l)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checkered-sm h-1.5 w-full" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-4 pt-4 space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1", children: "Quick Links" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/app/wallet", className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm hover:border-primary/30 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid size-9 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet, { className: "size-4.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold", children: t("Wallet & payments") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Manage cards, UPI and recharge Namma Cash" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => store.setLanguage(language === "en" ? "ta" : "en"), className: "w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm hover:border-primary/30 transition text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid size-9 place-items-center rounded-xl bg-violet-500/10 text-violet-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "size-4.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold", children: t("Language & Region") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "English / தமிழ் - Switch languages instantly" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600 uppercase", children: language === "en" ? "EN" : "தமிழ்" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => store.setTheme(theme === "dark" ? "light" : "dark"), className: "w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm hover:border-primary/30 transition text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "size-4.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold", children: theme === "dark" ? "Dark Premium Map Mode" : "Light Premium Map Mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Toggle browser layout and maps brightness" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase", children: theme.toUpperCase() })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pl-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: t("Saved addresses") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowAddressModal(true), className: "inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }),
            " ",
            language === "en" ? "Add Place" : "சேர்"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: savedAddresses.map((addr) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-xl bg-secondary text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold flex items-center gap-1.5", children: language === "en" ? addr.label : addr.tamilLabel }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground pr-2 line-clamp-1", children: addr.address })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.deleteAddress(addr.id), className: "grid size-8 place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
        ] }, addr.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pl-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest", children: t("Trusted contacts") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowContactModal(true), className: "inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "size-3.5" }),
            " ",
            t("Add")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: trustedContacts.map((contact) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-full bg-primary/10 text-primary text-xs font-extrabold", children: contact.name[0] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-extrabold", children: contact.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: contact.phone })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.deleteTrustedContact(contact.id), className: "grid size-8 place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
        ] }, contact.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1", children: t("Ride preferences") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-3 space-y-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-extrabold flex items-center gap-1 text-primary", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-3.5" }),
                " ",
                t("Women safety mode")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Prioritizes high safety routing and female rider matching" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              if (!womenSafetyMode) {
                if (profile.gender?.toLowerCase() !== "female") {
                  alert("Women Safety Mode can only be activated for female gender profiles.");
                  return;
                }
              }
              store.setWomenSafetyMode(!womenSafetyMode);
            }, className: `relative inline-flex h-5 w-10 items-center rounded-full transition ${womenSafetyMode ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4 transform rounded-full bg-background shadow transition ${womenSafetyMode ? "translate-x-5" : "translate-x-0.5"}` }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-extrabold flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-3.5 text-muted-foreground" }),
                " Quiet Mode Preferred"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Driver notified to keep chat to a minimum during transit" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.updateProfile({
              ridePreference: profile.ridePreference === "silent" ? "regular" : "silent"
            }), className: `relative inline-flex h-5 w-10 items-center rounded-full transition ${profile.ridePreference === "silent" ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4 transform rounded-full bg-background shadow transition ${profile.ridePreference === "silent" ? "translate-x-5" : "translate-x-0.5"}` }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-extrabold flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-3.5 text-muted-foreground" }),
                " ",
                t("Notifications")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Receive push updates for arrival, wallet recharge and offers" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.updateProfile({
              notificationsEnabled: !profile.notificationsEnabled
            }), className: `relative inline-flex h-5 w-10 items-center rounded-full transition ${profile.notificationsEnabled ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4 transform rounded-full bg-background shadow transition ${profile.notificationsEnabled ? "translate-x-5" : "translate-x-0.5"}` }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", onClick: () => store.logout(), className: "flex items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-extrabold text-destructive shadow-sm active:scale-[0.99] transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4" }),
          " ",
          t("Sign out")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-center text-[10px] text-muted-foreground", children: "Rideuu · v1.2 · Designed and engineered in Chennai" })
      ] })
    ] }),
    isEditingProfile && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-border pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base font-extrabold flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-4" }),
          " Edit Profile"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsEditingProfile(false), className: "text-xs font-bold text-muted-foreground", children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-muted-foreground uppercase tracking-wider block mb-1", children: "Full Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: editName, onChange: (e) => setEditName(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-muted-foreground uppercase tracking-wider block mb-1", children: "Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: editEmail, onChange: (e) => setEditEmail(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-muted-foreground uppercase tracking-wider block mb-1", children: "Phone Number" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: editPhone, onChange: (e) => setEditPhone(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-muted-foreground uppercase tracking-wider block mb-1", children: "Emergency SOS PIN" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", maxLength: 4, value: editSosPin, onChange: (e) => setEditSosPin(e.target.value.replace(/\D/g, "").slice(0, 4)), placeholder: "e.g. 1234", className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSaveProfile, className: "w-full rounded-2xl bg-primary py-4 text-xs font-extrabold text-primary-foreground shadow", children: "Save Profile" })
    ] }) }),
    showAddressModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-extrabold", children: "Add Saved Place" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Label (e.g. Gym, Library, Amma's House)", value: newAddrLabel, onChange: (e) => setNewAddrLabel(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { placeholder: "Full Chennai Address Details...", value: newAddrVal, onChange: (e) => setNewAddrVal(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 h-20 font-semibold outline-none focus:border-primary resize-none" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddAddress, className: "flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow", children: "Save Address" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAddressModal(false), className: "flex-1 rounded-xl border border-border bg-card py-3 text-xs font-semibold", children: "Cancel" })
      ] })
    ] }) }),
    showContactModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-extrabold", children: "Add Trusted Contact" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "This person will automatically receive live SMS tracking URLs for emergency SOS dispatches." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Contact Name (e.g. Appa, Sister)", value: newContactName, onChange: (e) => setNewContactName(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", placeholder: "Mobile Number (+91 99999 12345)", value: newContactPhone, onChange: (e) => setNewContactPhone(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddContact, className: "flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow", children: "Add Contact" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowContactModal(false), className: "flex-1 rounded-xl border border-border bg-card py-3 text-xs font-semibold", children: "Cancel" })
      ] })
    ] }) })
  ] });
}
export {
  Account as component
};
