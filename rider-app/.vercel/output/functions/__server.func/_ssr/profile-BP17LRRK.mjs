import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { g as Camera, Z as Star, G as Globe, f as Bike, C as Calendar, J as Phone, e as Bell, T as Shield, a7 as Users, m as CircleQuestionMark, F as FileText, x as LogOut, j as ChevronRight } from "../_libs/lucide-react.mjs";
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
function Profile() {
  const nav = useNavigate();
  const {
    language,
    setLanguage,
    t,
    profileName,
    setProfileName,
    profilePhoto,
    setProfilePhoto,
    phone,
    setPhone,
    email,
    setEmail,
    vehicles,
    activeVehicleId,
    setActiveVehicleId,
    addVehicle,
    availabilitySchedule,
    toggleSchedule,
    logout,
    rating,
    completedRides,
    gender,
    setGender,
    emergencyName,
    setEmergencyName,
    emergencyPhone,
    setEmergencyPhone,
    notifPush,
    setNotifPush,
    notifIncentives,
    setNotifIncentives
  } = useRider();
  const [activeVehTab, setActiveVehTab] = reactExports.useState(activeVehicleId);
  const [newVehModel, setNewVehModel] = reactExports.useState("");
  const [newVehPlate, setNewVehPlate] = reactExports.useState("");
  const [newVehType, setNewVehType] = reactExports.useState("auto");
  const [showAddVeh, setShowAddVeh] = reactExports.useState(false);
  const activeVehicle = reactExports.useMemo(() => {
    return vehicles.find((v) => v.id === activeVehTab) || vehicles[0] || {
      model: "Unknown",
      type: "auto",
      insuranceExpiry: "N/A",
      pollutionExpiry: "N/A",
      maintenanceDays: 0
    };
  }, [vehicles, activeVehTab]);
  reactExports.useEffect(() => {
    setActiveVehTab(activeVehicleId);
  }, [activeVehicleId]);
  const handleLangToggle = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };
  const handleAddVeh = () => {
    if (!newVehModel || !newVehPlate) return;
    addVehicle(newVehModel, newVehPlate, newVehType);
    setShowAddVeh(false);
    setNewVehModel("");
    setNewVehPlate("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { title: language === "ta" ? "விவரக்குறிப்பு" : "Rider Profile" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 space-y-5 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 flex items-center gap-4 shadow-sm relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-black shadow shadow-primary/20", children: profileName[0] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "absolute bottom-0 right-0 h-5.5 w-5.5 rounded-full bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-3 w-3" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: profileName, onChange: (e) => setProfileName(e.target.value), className: "font-black text-base text-foreground bg-transparent border-b border-transparent focus:border-primary/55 outline-none w-full" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground mt-0.5 font-bold", children: phone.startsWith("+91") || phone.startsWith("+") ? phone : `+91 ${phone}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-muted-foreground uppercase", children: "Gender:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { disabled: true, value: gender, onChange: (e) => setGender(e.target.value), className: "text-[10px] font-extrabold text-foreground bg-secondary/80 border border-border rounded px-1.5 py-0.5 outline-none cursor-not-allowed opacity-70", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "male", children: "Male" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "female", children: "Female" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "others", children: "Others" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 inline-flex items-center gap-1.5 text-[10px] font-black text-primary uppercase", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3.5 w-3.5 fill-primary text-primary" }),
            " ",
            rating.toFixed(2),
            " · ",
            completedRides,
            " Chennai Trips"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-4 shadow-sm flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-5 w-5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-foreground uppercase tracking-wide", children: "Language preference" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold", children: "தமிழ் / English Switch" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleLangToggle, className: "px-4 py-2 bg-primary text-primary-foreground font-black text-[10px] rounded-full active:scale-95 transition uppercase tracking-wider", children: language === "en" ? "SWITCH TO தமிழ்" : "SWITCH TO ENGLISH" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border pb-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bike, { className: "h-4.5 w-4.5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xs uppercase tracking-wider text-foreground", children: "Vehicle credentials" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAddVeh(!showAddVeh), className: "text-[10px] font-black text-primary underline", children: "+ Add Vehicle" })
        ] }),
        showAddVeh && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-2xl p-4 border border-border mb-4 space-y-3 slide-up", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs uppercase tracking-wide", children: "Register new vehicle" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Vehicle Model (e.g. TVS XL 100)", value: newVehModel, onChange: (e) => setNewVehModel(e.target.value), className: "w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "Plate Number (e.g. TN 22 AB 1234)", value: newVehPlate, onChange: (e) => setNewVehPlate(e.target.value), className: "w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: newVehType, onChange: (e) => setNewVehType(e.target.value), className: "w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "auto", children: "🛺 Auto rickshaw" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "bike", children: "🏍️ Bike taxi" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddVeh, className: "w-full py-2 bg-primary text-white rounded-xl text-xs font-black", children: "Submit Registration" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 mb-4 bg-muted p-1 rounded-xl", children: vehicles.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          setActiveVehTab(v.id);
          setActiveVehicleId(v.id);
        }, className: `flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${activeVehTab === v.id ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground"}`, children: v.plateNumber }, v.id)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-border/50 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Model & Type:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground uppercase", children: [
              activeVehicle.model,
              " (",
              activeVehicle.type,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-border/50 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Insurance expiry alert:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-bold", children: [
              "Expires: ",
              activeVehicle.insuranceExpiry
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-border/50 pb-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Pollution Cert tracker:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-orange-500 font-bold", children: [
              "Expires: ",
              activeVehicle.pollutionExpiry
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Maintenance reminders:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
              activeVehicle.maintenanceDays,
              " days until next oil check"
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border pb-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-4.5 w-4.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xs uppercase tracking-wider text-foreground", children: "Availability Scheduler" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 max-h-48 overflow-y-auto", children: availabilitySchedule.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-1.5 border-b border-border/50 last:border-b-0 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground block", children: s.day }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-semibold", children: s.hours })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleSchedule(s.id), className: `px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${s.active ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-white/5 text-muted-foreground border border-border"}`, children: s.active ? "Online" : "Off" })
        ] }, s.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border pb-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "h-4.5 w-4.5 text-red-500 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xs uppercase tracking-wider text-foreground", children: "Emergency SOS contacts" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[9px] font-extrabold text-muted-foreground uppercase", children: "Contact Person" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: emergencyName, onChange: (e) => setEmergencyName(e.target.value), className: "w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none mt-1" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[9px] font-extrabold text-muted-foreground uppercase", children: "Mobile Phone Number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: emergencyPhone, onChange: (e) => setEmergencyPhone(e.target.value), className: "w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none mt-1" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border pb-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-4.5 w-4.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xs uppercase tracking-wider text-foreground", children: "Preferences" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3.5 text-xs font-semibold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Receive push trip notifications" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNotifPush(!notifPush), className: `h-5.5 w-10 rounded-full transition relative ${notifPush ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-4.5 w-4.5 rounded-full bg-white absolute top-0.5 transition ${notifPush ? "left-5" : "left-0.5"}` }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Receive peak hour / rain alert sounds" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNotifIncentives(!notifIncentives), className: `h-5.5 w-10 rounded-full transition relative ${notifIncentives ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-4.5 w-4.5 rounded-full bg-white absolute top-0.5 transition ${notifIncentives ? "left-5" : "left-0.5"}` }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Shield, label: "KYC Documents Verification", to: "/kyc" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: Users, label: "Rider Referral - Invite & Earn", to: "/referral" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: CircleQuestionMark, label: "Rider Support Center", to: "/support" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { icon: FileText, label: "Rider Terms of Service" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          logout();
          nav({
            to: "/login"
          });
        }, className: "w-full flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 active:scale-[0.99] transition shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "h-4.5 w-4.5 shrink-0 text-primary animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-xs font-bold text-left text-primary", children: "Log out shift" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
        ] })
      ] })
    ] })
  ] });
}
function Row({
  icon: Icon,
  label,
  to,
  danger
}) {
  const cls = "w-full flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 active:scale-[0.99] transition shadow-sm";
  const inner = /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4.5 w-4.5 shrink-0 ${danger ? "text-primary animate-pulse" : "text-primary"}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex-1 text-xs font-bold text-left ${danger ? "text-primary" : "text-foreground"}`, children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground" })
  ] });
  return to ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to, className: cls, children: inner }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: cls, children: inner });
}
export {
  Profile as component
};
