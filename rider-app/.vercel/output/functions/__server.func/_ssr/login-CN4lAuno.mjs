import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell } from "./MobileShell-p1-8Yc6U.mjs";
import { L as Logo } from "./Logo-BWmppa6E.mjs";
import { u as useRider, B as BASE_URL, a as api } from "./router-CTtxc6Rr.mjs";
import { G as Globe, M as Mail, b as ArrowRight, R as RefreshCw, t as FingerprintPattern, Y as Sparkles, D as Download, T as Shield, a5 as UserCheck } from "../_libs/lucide-react.mjs";
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
function LoginPage() {
  const nav = useNavigate();
  const {
    language,
    setLanguage,
    t,
    setPhone,
    setEmail,
    setProfileName,
    setToken,
    addNotification
  } = useRider();
  const [isRegistering, setIsRegistering] = reactExports.useState(false);
  const [inputPhone, setInputPhone] = reactExports.useState("");
  const [inputName, setInputName] = reactExports.useState("");
  const [vehicleType, setVehicleType] = reactExports.useState("auto");
  const [gender, setGender] = reactExports.useState("male");
  const [inputAddress, setInputAddress] = reactExports.useState("");
  const [inputEmail, setInputEmail] = reactExports.useState("");
  const [vehicleModel, setVehicleModel] = reactExports.useState("");
  const [vehiclePlate, setVehiclePlate] = reactExports.useState("");
  const [vehicleColor, setVehicleColor] = reactExports.useState("");
  const [vehicleYear, setVehicleYear] = reactExports.useState("");
  const [biometricScanning, setBiometricScanning] = reactExports.useState(false);
  const [errorMsg, setErrorMsg] = reactExports.useState("");
  const [sending, setSending] = reactExports.useState(false);
  const [deferredPrompt, setDeferredPrompt] = reactExports.useState(null);
  const [showPwaModal, setShowPwaModal] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window !== "undefined") {
      const handleBeforeInstallPrompt = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };
      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);
  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const {
        outcome
      } = await deferredPrompt.userChoice;
      console.log(`PWA install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
    }
  };
  const handleSendOtp = async () => {
    if (!inputEmail || !inputEmail.includes("@")) return;
    setSending(true);
    setErrorMsg("");
    try {
      const action = isRegistering ? "register" : "login";
      const url = `${BASE_URL}/auth/send-otp/`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: inputEmail,
          role: "driver",
          action
        })
      });
      setSending(false);
      const res = await response.json();
      if (response.ok && res && res.success) {
        setEmail(inputEmail);
        if (isRegistering && inputName) {
          setProfileName(inputName);
          localStorage.setItem("namma_name", inputName);
          localStorage.setItem("namma_phone", inputPhone);
          localStorage.setItem("namma_address", inputAddress);
          localStorage.setItem("namma_vehicle_type", vehicleType);
          localStorage.setItem("namma_vehicle_model", vehicleModel);
          localStorage.setItem("namma_vehicle_plate", vehiclePlate);
          localStorage.setItem("namma_vehicle_color", vehicleColor);
          localStorage.setItem("namma_vehicle_year", vehicleYear);
          localStorage.setItem("namma_gender", gender);
        }
        localStorage.setItem("namma_email", inputEmail);
        alert(`[AUTH OTP SENT] Correct Verification Code: ${res.otp}`);
        nav({
          to: "/otp"
        });
      } else {
        if (res && res.code === "RIDER_NOT_FOUND") {
          setErrorMsg("You are not registered as a rider. Please create a rider account.");
        } else if (res && res.error) {
          setErrorMsg(res.error);
        } else {
          setErrorMsg("Failed to send OTP. Please check your network connection.");
        }
      }
    } catch (error) {
      setSending(false);
      setErrorMsg("Failed to send OTP. Please check your network connection.");
    }
  };
  const handleBiometricAuth = async () => {
    const email = localStorage.getItem("namma_last_biometric_email");
    if (!email) {
      alert("No biometrics registered on this device. Please log in using Email OTP first.");
      return;
    }
    try {
      setBiometricScanning(true);
      setErrorMsg("");
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const getOptions = {
        publicKey: {
          challenge,
          timeout: 6e4,
          userVerification: "required"
        }
      };
      const cred = await navigator.credentials.get(getOptions);
      if (cred) {
        const savedToken = localStorage.getItem(`namma_biometric_token_${email}`);
        if (savedToken) {
          setToken(savedToken);
          const activePhone = localStorage.getItem("namma_phone") || "";
          const activeVehType = localStorage.getItem("namma_vehicle_type") || "";
          const name = localStorage.getItem("namma_name") || "";
          const data = await api.getUserByEmail(email, "driver", name, activeVehType, activePhone);
          if (data) {
            setEmail(data.email);
            setPhone(data.phone);
            setProfileName(data.name);
            if (data.kyc_status === "VERIFIED" || data.status === "active") {
              nav({
                to: "/dashboard"
              });
            } else {
              nav({
                to: "/kyc"
              });
            }
          } else {
            setErrorMsg("Failed to retrieve user profile after authentication.");
          }
        } else {
          setErrorMsg("Biometric login session expired. Please log in using OTP.");
        }
      }
    } catch (error) {
      console.error("WebAuthn assertion failed:", error);
      setErrorMsg("Biometrics authentication failed or was cancelled.");
    } finally {
      setBiometricScanning(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    MobileShell,
    {
      showNav: false,
      className: "bg-background/10 backdrop-blur-xs border-x-0 shadow-none",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pt-10 pb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setLanguage(language === "en" ? "ta" : "en"), className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/30 backdrop-blur-md border border-border/40 text-xs font-bold text-foreground active:scale-95 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "h-3.5 w-3.5 text-primary" }),
            language === "en" ? "தமிழ்" : "English"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-extrabold tracking-widest text-primary uppercase mb-1 animate-pulse", children: t("built_for_chennai") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-3xl font-black tracking-tight leading-tight text-foreground", children: [
            t("drive_smarter"),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground block text-2xl font-bold mt-1", children: t("earn_more") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground leading-relaxed", children: t("sign_in_desc") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex bg-background/40 backdrop-blur-md rounded-full p-1 border border-border/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsRegistering(false), className: `flex-1 py-2 text-xs font-bold rounded-full transition-all ${!isRegistering ? "bg-background/30 text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: language === "ta" ? "உள்நுழைவு" : "Driver Login" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsRegistering(true), className: `flex-1 py-2 text-xs font-bold rounded-full transition-all ${isRegistering ? "bg-background/30 text-foreground" : "text-muted-foreground hover:text-foreground"}`, children: t("register_new") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-3xl bg-background/30 backdrop-blur-md border border-border/40 p-6 relative overflow-hidden", children: [
            isRegistering && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: t("full_name") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: inputName, onChange: (e) => setInputName(e.target.value), placeholder: "Raja Kumar", className: "mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: "Address" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: inputAddress, onChange: (e) => setInputAddress(e.target.value), placeholder: "123 Usman Road, T.Nagar, Chennai", className: "mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: "Phone Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", maxLength: 10, value: inputPhone, onChange: (e) => setInputPhone(e.target.value.replace(/\D/g, "")), placeholder: "9876543210", className: "mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: t("vehicle_type") }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: vehicleType, onChange: (e) => setVehicleType(e.target.value), className: "mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "auto", children: [
                    "🛺 ",
                    t("auto")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: "bike", children: [
                    "🏍️ ",
                    t("bike")
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: "Gender" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: gender, onChange: (e) => setGender(e.target.value), className: "mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "male", children: "👨 Male" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "female", children: "👩 Female" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "others", children: "⚧️ Others" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: "Vehicle Brand & Model" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: vehicleModel, onChange: (e) => setVehicleModel(e.target.value), placeholder: "Bajaj RE Auto / Honda Activa", className: "mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: "Registration Number" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: vehiclePlate, onChange: (e) => setVehiclePlate(e.target.value.toUpperCase()), placeholder: "TN 22 BZ 4421", className: "mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: "Vehicle Color" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: vehicleColor, onChange: (e) => setVehicleColor(e.target.value), placeholder: "Yellow / Black", className: "mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: "Manufacturing Year" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: vehicleYear, onChange: (e) => setVehicleYear(e.target.value), placeholder: "2024", className: "mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase", children: "Email ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3 border-b-2 border-border/40 pb-2 focus-within:border-primary transition", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1.5 text-foreground font-bold text-base", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-4 w-4 text-primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { autoFocus: true, type: "email", value: inputEmail, onChange: (e) => setInputEmail(e.target.value), placeholder: "rider@example.com", className: "flex-1 bg-transparent text-lg font-bold outline-none placeholder:text-muted-foreground/40 tracking-wide" })
            ] }),
            errorMsg && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 p-3.5 rounded-2xl bg-destructive/15 border border-destructive/25 text-destructive text-xs space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold", children: errorMsg }),
              errorMsg.includes("not registered") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                  setIsRegistering(true);
                  setErrorMsg("");
                }, className: "flex-1 py-1.5 px-2 bg-destructive text-destructive-foreground font-bold rounded-lg text-[10px]", children: "Register as New Rider" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                  setErrorMsg("");
                  setInputPhone("");
                }, className: "py-1.5 px-2 bg-background border border-border text-foreground font-bold rounded-lg text-[10px]", children: "Back to Login" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: !inputEmail.includes("@") || isRegistering && (!inputName || inputPhone.length !== 10) || sending, onClick: handleSendOtp, className: "mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-bold py-3.5 disabled:opacity-50 active:scale-[0.98] transition hover:bg-primary/95", children: [
              t("send_otp"),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
            ] })
          ] }),
          !isRegistering && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleBiometricAuth, disabled: biometricScanning, className: "w-full py-3.5 rounded-full bg-background/30 backdrop-blur-md border border-border/40 flex items-center justify-center gap-2 font-bold text-xs hover:bg-muted active:scale-[0.98] transition text-foreground", children: biometricScanning ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-4 w-4 text-primary animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Scanning Face / Fingerprint..." })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FingerprintPattern, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("biometric_login") })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-2", children: [
            deferredPrompt ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleInstallPWA, className: "py-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 flex items-center justify-center gap-2 font-extrabold text-[11px] text-slate-950 active:scale-[0.98] transition shadow-md shadow-amber-500/10 cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-slate-950 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Install PWA" })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowPwaModal(true), className: "py-3.5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 font-bold text-[11px] hover:bg-primary/20 active:scale-[0.98] transition text-primary cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Install PWA" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/rider_app.apk", download: true, className: "py-3.5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 font-bold text-[11px] hover:bg-primary/20 active:scale-[0.98] transition text-primary text-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 shrink-0" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Download APK" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-3.5 border-t border-border/40 pt-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2.5 text-[11px] text-muted-foreground leading-relaxed", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "h-4 w-4 text-primary shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("verified_riders_only") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-xl bg-background/30 backdrop-blur-md border border-border/40 px-4 py-2.5 text-[10px] text-muted-foreground font-bold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-3.5 w-3.5 text-success" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Multi-device Session Manager:" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-success uppercase", children: "Active (1 Device)" })
            ] })
          ] })
        ] }),
        showPwaModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border/40 bg-background p-6 text-center space-y-4 animate-scale-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-12 mx-auto text-primary animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold", children: "Install Rideuu Driver App" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-2 leading-relaxed", children: "To install this Progressive Web App:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-left bg-muted/30 p-3.5 rounded-xl border border-border/30 space-y-2 text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary", children: "1." }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: 'On Android/Chrome: Wait for a prompt, or click "Add to Home screen" in browser settings.' })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-start gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-primary", children: "2." }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  "On iOS Safari: Tap the ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Share" }),
                  " button ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-base font-normal", children: "📤" }),
                  ", scroll down and tap ",
                  /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Add to Home Screen" }),
                  "."
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowPwaModal(false), className: "w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:brightness-105 active:scale-95 transition", children: "Okay, Got It!" })
        ] }) })
      ]
    }
  );
}
export {
  LoginPage as component
};
