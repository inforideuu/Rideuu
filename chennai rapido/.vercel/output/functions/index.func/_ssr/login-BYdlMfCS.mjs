import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, s as store, t as translate, a as api } from "./router-BpidCmwR.mjs";
import { M as Mail, b as ArrowRight, Q as Phone, F as FingerprintPattern, L as Laptop, $ as Smartphone, a0 as Sparkles, D as Download } from "../_libs/lucide-react.mjs";
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
function Login() {
  const {
    language,
    theme,
    deviceSessions
  } = useAppStore();
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = reactExports.useState("email");
  const [step, setStep] = reactExports.useState("phone");
  const [emailStep, setEmailStep] = reactExports.useState("login");
  const [phoneNum, setPhoneNum] = reactExports.useState("");
  const [emailAddress, setEmailAddress] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [otp, setOtp] = reactExports.useState(["", "", "", ""]);
  const [userToRegister, setUserToRegister] = reactExports.useState(null);
  const [regName, setRegName] = reactExports.useState("");
  const [regEmail, setRegEmail] = reactExports.useState("");
  const [regPassword, setRegPassword] = reactExports.useState("");
  const [regGender, setRegGender] = reactExports.useState("male");
  const [countdown, setCountdown] = reactExports.useState(30);
  const [biometricSupported, setBiometricSupported] = reactExports.useState(true);
  const [biometricEnabled, setBiometricEnabled] = reactExports.useState(false);
  const [showBiometricModal, setShowBiometricModal] = reactExports.useState(false);
  const [showResetSuccess, setShowResetSuccess] = reactExports.useState(false);
  const [emailVerified, setEmailVerified] = reactExports.useState(false);
  const [showConsentModal, setShowConsentModal] = reactExports.useState(null);
  const [sendingOtp, setSendingOtp] = reactExports.useState(false);
  const [verifyingOtp, setVerifyingOtp] = reactExports.useState(false);
  const [loggingIn, setLoggingIn] = reactExports.useState(false);
  const [deferredPrompt, setDeferredPrompt] = reactExports.useState(null);
  const [showPwaModal, setShowPwaModal] = reactExports.useState(false);
  reactExports.useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
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
  reactExports.useEffect(() => {
    let t2;
    if (step === "otp" && countdown > 0) {
      t2 = setTimeout(() => setCountdown(countdown - 1), 1e3);
    }
    return () => clearTimeout(t2);
  }, [step, countdown]);
  const handleSendOtp = async () => {
    if (!emailAddress) return;
    setSendingOtp(true);
    const res = await api.sendOtp(emailAddress);
    setSendingOtp(false);
    if (res && res.success) {
      setStep("otp");
      setCountdown(30);
      setOtp(["", "", "", ""]);
      alert(`[AUTH EMAIL OTP SENT] Correct Verification Code: ${res.otp}`);
    } else {
      alert("Failed to send OTP. Please check your network connection.");
    }
  };
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) return;
    setVerifyingOtp(true);
    const res = await api.verifyOtp(emailAddress, enteredOtp, "customer", "Chennai Commuter", phoneNum);
    setVerifyingOtp(false);
    if (res && res.token) {
      localStorage.setItem(`namma_biometric_token_${res.user.email}`, res.token);
      store.update((s) => {
        s.token = res.token;
        s.profile.phone = res.user.phone;
        s.profile.name = res.user.name;
        s.profile.email = res.user.email || "";
        s.profile.gender = res.user.gender || "male";
        s.wallet.balance = res.user.wallet_balance;
      });
      await store.loadUserData();
      if (!res.user.password_hash || res.user.name === "Chennai Commuter" || !res.user.email) {
        setUserToRegister(res.user);
        setRegName(res.user.name === "Chennai Commuter" ? "" : res.user.name);
        setRegEmail(res.user.email || "");
        setStep("create_profile");
      } else {
        navigate({
          to: "/app/home"
        });
      }
    } else {
      alert("Invalid OTP code. Access denied.");
    }
  };
  const handleRegisterProfile = async () => {
    if (!regName || !regPassword) {
      alert("Name and Password are required.");
      return;
    }
    setLoggingIn(true);
    const res = await api.updateUser(userToRegister.id, {
      name: regName,
      email: regEmail,
      password: regPassword,
      gender: regGender,
      phone: phoneNum ? "+91 " + phoneNum : void 0
    }, store.getState().token || void 0);
    setLoggingIn(true);
    setLoggingIn(false);
    if (res) {
      store.update((s) => {
        s.profile.name = res.name;
        s.profile.email = res.email || "";
        s.profile.gender = res.gender || "male";
      });
      navigate({
        to: "/app/home"
      });
    } else {
      alert("Failed to save profile. Please try again.");
    }
  };
  const handlePasswordLogin = async () => {
    if (!password) {
      alert("Please enter your password.");
      return;
    }
    setLoggingIn(true);
    const res = await api.loginPassword(authMethod === "phone" ? phoneNum : "", authMethod === "email" ? emailAddress : "", password);
    setLoggingIn(false);
    if (res && res.token) {
      localStorage.setItem(`namma_biometric_token_${res.user.email}`, res.token);
      store.update((s) => {
        s.token = res.token;
        s.profile.phone = res.user.phone;
        s.profile.name = res.user.name;
        s.profile.email = res.user.email || "";
        s.profile.gender = res.user.gender || "male";
        s.wallet.balance = res.user.wallet_balance;
      });
      await store.loadUserData();
      navigate({
        to: "/app/home"
      });
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };
  const handleGoogleAuthConfirm = async (email, name) => {
    const googleId = "google_id_" + email.split("@")[0];
    const res = await api.googleAuth(email, name, googleId);
    if (res && res.token) {
      store.update((s) => {
        s.token = res.token;
        s.profile.name = res.user.name;
        s.profile.email = res.user.email;
        s.profile.phone = res.user.phone;
        s.profile.gender = res.user.gender || "male";
      });
      await store.loadUserData();
      setShowConsentModal(null);
      navigate({
        to: "/app/home"
      });
    } else {
      alert("Google login failed.");
    }
  };
  const handleAppleAuthConfirm = async (email, name) => {
    const appleId = "apple_id_" + email.split("@")[0];
    const res = await api.appleAuth(email, name, appleId);
    if (res && res.token) {
      store.update((s) => {
        s.token = res.token;
        s.profile.name = res.user.name;
        s.profile.email = res.user.email;
        s.profile.phone = res.user.phone;
        s.profile.gender = res.user.gender || "male";
      });
      await store.loadUserData();
      setShowConsentModal(null);
      navigate({
        to: "/app/home"
      });
    } else {
      alert("Apple login failed.");
    }
  };
  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      const email = emailAddress || localStorage.getItem("namma_last_biometric_email");
      if (email && localStorage.getItem(`namma_biometric_enabled_${email}`)) {
        try {
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
              setLoggingIn(true);
              store.update((s) => {
                s.token = savedToken;
              });
              await store.loadUserData();
              setLoggingIn(false);
              setBiometricEnabled(true);
              navigate({
                to: "/app/home"
              });
              return;
            }
          }
        } catch (err) {
          console.error("Biometric verification failed:", err);
        }
      }
      setShowBiometricModal(true);
    } else {
      setBiometricEnabled(false);
    }
  };
  const handleConfirmBiometric = async () => {
    const email = emailAddress || store.getState().profile.email || localStorage.getItem("namma_last_biometric_email");
    if (!email) {
      alert("Please enter your email address first to link biometrics.");
      return;
    }
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const createOptions = {
        publicKey: {
          challenge,
          rp: {
            name: "Rideuu"
          },
          user: {
            id: new TextEncoder().encode(email),
            name: email,
            displayName: email
          },
          pubKeyCredParams: [{
            type: "public-key",
            alg: -7
          }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 6e4
        }
      };
      const cred = await navigator.credentials.create(createOptions);
      if (cred) {
        setBiometricEnabled(true);
        setShowBiometricModal(false);
        localStorage.setItem(`namma_biometric_enabled_${email}`, "true");
        localStorage.setItem("namma_last_biometric_email", email);
        const token = store.getState().token;
        if (token) {
          localStorage.setItem(`namma_biometric_token_${email}`, token);
        }
        alert("Biometrics registered successfully!");
      }
    } catch (err) {
      console.error("Biometrics registration failed:", err);
      alert("Biometrics registration cancelled or not supported.");
    }
  };
  const handleRevokeDevice = async (id) => {
    const token = store.getState().token;
    if (!token) return;
    const res = await api.revokeSession(id, token);
    if (res && res.success) {
      await store.loadUserData();
    } else {
      alert("Failed to revoke session.");
    }
  };
  const t = (key) => translate(key, language);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-dvh text-foreground transition-colors duration-300 bg-cover bg-center bg-no-repeat", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 top-0 checkered h-3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-12 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: "./ridu_logo.png", alt: "Rideuu", height: 150, width: 150 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.setLanguage(language === "en" ? "ta" : "en"), className: "rounded-full border border-border/40 bg-background/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold transition hover:bg-muted", children: language === "en" ? "தமிழ்" : "English" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => store.setTheme(theme === "dark" ? "light" : "dark"), className: "grid size-8 place-items-center rounded-full border border-border/40 bg-background/20 backdrop-blur-md text-xs font-semibold transition hover:bg-muted", children: theme === "dark" ? "☀️" : "🌙" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold uppercase tracking-wider text-primary", children: "வணக்கம் Chennai" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-2xl font-extrabold tracking-tight", children: step === "phone" ? t("Sign in to ride") || "Sign in to ride" : step === "otp" ? t("OTP Verification") : step === "password_login" ? "Password Login" : "Create Your Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: step === "phone" ? authMethod === "phone" ? "Enter phone number to receive a secure code." : "Sign in with your email address." : step === "otp" ? `Enter the 4-digit code sent to ${authMethod === "phone" ? `+91 ${phoneNum}` : emailAddress}` : step === "password_login" ? `Enter your password for ${authMethod === "phone" ? `+91 ${phoneNum}` : emailAddress}` : "Set your profile details and password to secure your account." })
      ] }),
      step === "phone" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70", children: "Email Address" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", value: emailAddress, onChange: (e) => setEmailAddress(e.target.value), placeholder: "commuter@Rideuu.in", className: "w-full bg-transparent text-sm font-semibold outline-none" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSendOtp, disabled: !emailAddress || !emailAddress.includes("@"), className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none", children: [
          "Send OTP ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStep("password_login"), disabled: !emailAddress, className: "w-full text-center text-xs font-bold text-primary hover:underline transition disabled:opacity-50", children: "Log in with Password instead" })
      ] }) : step === "otp" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-between gap-3", children: otp.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { id: `otp-input-${i}`, value: v, onChange: (e) => {
          const val = e.target.value.replace(/\D/g, "");
          const next = [...otp];
          next[i] = val.slice(-1);
          setOtp(next);
          if (val && i < 3) {
            document.getElementById(`otp-input-${i + 1}`)?.focus();
          }
        }, inputMode: "numeric", maxLength: 1, className: "h-14 w-14 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md text-center text-xl font-extrabold outline-none focus:border-primary transition" }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleVerifyOtp, className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 transition", children: [
          "Verify & Continue ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-xs font-semibold text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStep("phone"), className: "text-primary/70 hover:text-primary", children: "← Go Back" }),
          countdown > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Resend in ",
            countdown,
            "s"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setCountdown(30);
            handleSendOtp();
          }, className: "text-primary font-bold hover:underline", children: "Resend OTP" })
        ] })
      ] }) : step === "password_login" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70", children: "Password" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "••••••••", className: "w-full bg-transparent text-sm font-semibold outline-none" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handlePasswordLogin, disabled: loggingIn || !password, className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50", children: [
          loggingIn ? "Logging in..." : "Log in",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setStep("phone"), className: "w-full text-center text-xs font-bold text-primary hover:underline transition", children: "Log in with OTP instead" })
      ] }) : (
        /* Profile / Password Creation Wizard */
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70", children: "Full Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: regName, onChange: (e) => setRegName(e.target.value), placeholder: "e.g. Adhithya Raj", className: "w-full bg-transparent text-sm font-semibold outline-none" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70", children: "Phone Number (Optional)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-extrabold text-foreground", children: "+91" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "tel", value: phoneNum, onChange: (e) => setPhoneNum(e.target.value.replace(/\D/g, "").slice(0, 10)), placeholder: "98401 23456", className: "w-full bg-transparent text-sm font-semibold outline-none" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70", children: "Create Login Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "password", value: regPassword, onChange: (e) => setRegPassword(e.target.value), placeholder: "Create a strong password", className: "w-full bg-transparent text-sm font-semibold outline-none" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70", children: "Gender" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: regGender, onChange: (e) => setRegGender(e.target.value), className: "w-full bg-transparent text-sm font-semibold outline-none text-foreground cursor-pointer", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "male", className: "text-slate-900 bg-white", children: "Male" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "female", className: "text-slate-900 bg-white", children: "Female" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "others", className: "text-slate-900 bg-white", children: "Others" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleRegisterProfile, disabled: loggingIn || !regName || !regPassword, className: "flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50", children: [
            loggingIn ? "Saving profile..." : "Save Profile & Continue",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
          ] })
        ] })
      ),
      step === "phone" && emailStep === "login" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border/40" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] uppercase tracking-widest text-muted-foreground font-semibold", children: "Or continue with" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-border/40" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowConsentModal("Google"), className: "flex items-center justify-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md py-3.5 text-xs font-bold hover:bg-muted active:scale-[0.99] transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-500 font-extrabold", children: "G" }),
            " Google"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowConsentModal("Apple"), className: "flex items-center justify-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md py-3.5 text-xs font-bold hover:bg-muted active:scale-[0.99] transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-extrabold", children: "" }),
            " Apple"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-9 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FingerprintPattern, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-left", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-extrabold", children: "Biometric Login" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground", children: "Authenticate using FaceID / Fingerprint" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleBiometric, className: `relative inline-flex h-5 w-10 items-center rounded-full transition ${biometricEnabled ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4 transform rounded-full bg-background transition ${biometricEnabled ? "translate-x-5" : "translate-x-0.5"}` }) })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1", children: "Active Sessions" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: deviceSessions.map((session) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between rounded-xl border border-border/40 bg-background/20 backdrop-blur-md p-3 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            session.device.toLowerCase().includes("mac") || session.device.toLowerCase().includes("chrome") ? /* @__PURE__ */ jsxRuntimeExports.jsx(Laptop, { className: "size-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Smartphone, { className: "size-4 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold flex items-center gap-1.5", children: [
                session.device,
                session.isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-emerald-500/10 px-1 py-0.5 text-[8px] font-extrabold text-emerald-600", children: "Current" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-muted-foreground", children: [
                session.location,
                " · ",
                session.lastActive
              ] })
            ] })
          ] }),
          !session.isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleRevokeDevice(session.id), className: "rounded bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive hover:bg-destructive/20 transition", children: "Revoke" })
        ] }, session.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-2", children: [
        deferredPrompt ? /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleInstallPWA, className: "py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 flex items-center justify-center gap-2 font-extrabold text-[11px] text-slate-950 active:scale-[0.98] transition shadow-md shadow-amber-500/10 cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-slate-950 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Install PWA App" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowPwaModal(true), className: "py-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 font-bold text-[11px] hover:bg-primary/20 active:scale-[0.98] transition text-primary cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4 w-4 text-primary shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Install PWA App" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/chennai_rapido.apk", download: true, className: "py-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 font-bold text-[11px] hover:bg-primary/20 active:scale-[0.98] transition text-primary text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "h-4 w-4 shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Download APK" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-auto pb-4 pt-8 text-center text-[10px] text-muted-foreground", children: [
        "By continuing you agree to Rideuu's ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary hover:underline cursor-pointer", children: "Terms of Service" }),
        " & ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary hover:underline cursor-pointer", children: "Privacy Policy" }),
        "."
      ] })
    ] }),
    showBiometricModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border/40 bg-background/40 backdrop-blur-xl p-6 text-center space-y-4 animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(FingerprintPattern, { className: "size-16 mx-auto text-primary animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Register Biometrics" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Link your device's fingerprint or FaceID credentials with Rideuu for quick 1-tap sign in." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleConfirmBiometric, className: "flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground", children: "Authenticate & Save" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowBiometricModal(false), className: "flex-1 rounded-xl border border-border/40 bg-background/20 backdrop-blur-md py-3 text-xs font-semibold", children: "Skip" })
      ] })
    ] }) }),
    showConsentModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border/40 bg-background/90 backdrop-blur-xl p-6 space-y-4 animate-scale-in text-xs font-semibold text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border/40 pb-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-sm font-extrabold text-foreground flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: showConsentModal === "Google" ? "G" : "" }),
          " Continue with ",
          showConsentModal
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowConsentModal(null), className: "text-xs text-muted-foreground font-bold", children: "Cancel" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground leading-normal", children: [
        "Select an account to authorize and sign in to Rideuu using ",
        showConsentModal,
        " secure credentials:"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: [{
        name: "Adhithya R",
        email: "adhithya.r@chennai.in"
      }, {
        name: "Chennai Traveler",
        email: "chennai.commuter@gmail.com"
      }, {
        name: "Guest User",
        email: "guest.user@outlook.com"
      }].map((acc) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => showConsentModal === "Google" ? handleGoogleAuthConfirm(acc.email, acc.name) : handleAppleAuthConfirm(acc.email, acc.name), className: "w-full rounded-2xl border border-border/40 bg-card p-3 text-left hover:border-primary transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-extrabold text-foreground", children: acc.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: acc.email })
      ] }, acc.email)) })
    ] }) }),
    showPwaModal && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border/40 bg-background p-6 text-center space-y-4 animate-scale-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-12 mx-auto text-primary animate-pulse" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold", children: "Install Rideuu Customer" }),
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
  ] });
}
export {
  Login as component
};
