import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Phone, Mail, ShieldCheck, Smartphone, Laptop, Sparkles, Check, RefreshCw, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppStore, store, translate } from "@/lib/store";
import { api } from "../lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Rideuu" }] }),
  component: Login,
});

function Login() {
  const { language, theme, deviceSessions, isPwaInstalled } = useAppStore();
  const navigate = useNavigate();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        store.setPwaInstalled(true);
      }
    };
    checkStandalone();
  }, []);

  const [authMethod, setAuthMethod] = useState<"phone" | "email" | null>(null);
  const [step, setStep] = useState<"phone" | "otp" | "password_login" | "create_profile" | "dashboard">("phone");
  const [emailStep, setEmailStep] = useState<"login" | "verify" | "reset">("login");

  // Input states
  const [phoneNum, setPhoneNum] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  // Profile creation states
  const [userToRegister, setUserToRegister] = useState<any>(null);
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regGender, setRegGender] = useState("male");

  // Simulation states
  const [countdown, setCountdown] = useState(30);

  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState<"Google" | "Apple" | null>(null);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaModal, setShowPwaModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
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
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
    }
  };

  // Timer for OTP
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      t = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(t);
  }, [step, countdown]);

  const handleSendOtp = async () => {
    const target = authMethod === "phone" ? `${phoneNum}@rideuu.in` : emailAddress;
    if (!target) return;
    setSendingOtp(true);
    const res = await api.sendOtp(target);
    setSendingOtp(false);
    if (res && res.success) {
      setStep("otp");
      setCountdown(30);
      setOtp(["", "", "", ""]);
      if (authMethod === "phone") {
        alert(`[AUTH MOBILE OTP SENT] Correct Verification Code: ${res.otp}`);
      } else {
        alert(`[AUTH EMAIL OTP SENT] Correct Verification Code: ${res.otp}`);
      }
    } else {
      alert("Failed to send OTP. Please check your network connection.");
    }
  };
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 4) return;
    setVerifyingOtp(true);
    const target = authMethod === "phone" ? `${phoneNum}@rideuu.in` : emailAddress;
    const res = await api.verifyOtp(target, enteredOtp, "customer", "Chennai Commuter", phoneNum);
    setVerifyingOtp(false);
    if (res && res.token) {
      store.update((s) => {
        s.token = res.token;
        s.profile.phone = res.user.phone;
        s.profile.name = res.user.name;
        s.profile.email = res.user.email || "";
        s.profile.gender = res.user.gender || "male";
        s.wallet.balance = res.user.wallet_balance;
      });
      await store.loadUserData();
 
      // Check if user has no password set or is a default profile
      if (!res.user.password_hash || res.user.name === "Chennai Commuter" || !res.user.email) {
        setUserToRegister(res.user);
        setRegName(res.user.name === "Chennai Commuter" ? "" : res.user.name);
        setRegEmail(res.user.email || "");
        setStep("create_profile");
      } else {
        navigate({ to: "/app/home" });
      }
    } else {
      const errorMsg = res?.error || "Invalid OTP code. Access denied.";
      alert(errorMsg);
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
      phone: phoneNum ? "+91 " + phoneNum : undefined
    }, store.getState().token || undefined);
    setLoggingIn(false);
    if (res && !res.error) {
      store.update((s) => {
        s.profile.name = res.name;
        s.profile.email = res.email || "";
        s.profile.gender = res.gender || "male";
      });
      navigate({ to: "/app/home" });
    } else {
      const errorMsg = res?.error || "Failed to save profile. Please try again.";
      alert(errorMsg);
    }
  };

  const handlePasswordLogin = async () => {
    if (!password) {
      alert("Please enter your password.");
      return;
    }
    setLoggingIn(true);
    const res = await api.loginPassword(
      authMethod === "phone" ? phoneNum : "",
      authMethod === "email" ? emailAddress : "",
      password
    );
    setLoggingIn(false);
    if (res && res.token) {
      store.update((s) => {
        s.token = res.token;
        s.profile.phone = res.user.phone;
        s.profile.name = res.user.name;
        s.profile.email = res.user.email || "";
        s.profile.gender = res.user.gender || "male";
        s.wallet.balance = res.user.wallet_balance;
      });
      await store.loadUserData();
      navigate({ to: "/app/home" });
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  const handleResetPassword = () => {
    setShowResetSuccess(true);
    setTimeout(() => {
      setShowResetSuccess(false);
      setEmailStep("login");
    }, 3000);
  };

  const handleGoogleAuthConfirm = async (email: string, name: string) => {
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
      navigate({ to: "/app/home" });
    } else {
      alert("Google login failed.");
    }
  };

  const handleAppleAuthConfirm = async (email: string, name: string) => {
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
      navigate({ to: "/app/home" });
    } else {
      alert("Apple login failed.");
    }
  };



  const handleRevokeDevice = async (id: string) => {
    const token = store.getState().token;
    if (!token) return;
    const res = await api.revokeSession(id, token);
    if (res && res.success) {
      await store.loadUserData();
    } else {
      alert("Failed to revoke session.");
    }
  };

  // Translations
  const t = (key: string) => translate(key, language);

  return (
    <div className="relative min-h-dvh text-foreground transition-colors duration-300 bg-cover bg-center bg-no-repeat" >
      {/* Decorative premium header checkerboard */}
      <div className="absolute inset-x-0 top-0 checkered h-3" />

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-12 pb-8">
        {/* Back and logo */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="./ridu_logo.png" alt="Rideuu" height={150} width={150} />
            {/* <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground font-extrabold">N</span>
            <span className="text-lg font-extrabold tracking-tight">
              Namma<span className="text-primary">Ride</span>
            </span> */}
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={() => store.setLanguage(language === "en" ? "ta" : "en")}
              className="rounded-full border border-border/40 bg-background/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold transition hover:bg-muted"
            >
              {language === "en" ? "தமிழ்" : "English"}
            </button>
            <button
              onClick={() => store.setTheme(theme === "dark" ? "light" : "dark")}
              className="grid size-8 place-items-center rounded-full border border-border/40 bg-background/20 backdrop-blur-md text-xs font-semibold transition hover:bg-muted"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </div>

        {/* Heading */}
        <div className="mt-8">
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary">வணக்கம் Chennai</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
            {step === "phone" ? (t("Sign in to ride") || "Sign in to ride") :
              step === "otp" ? t("OTP Verification") :
                step === "password_login" ? "Password Login" :
                  "Create Your Profile"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {step === "phone" ? (
              authMethod === "phone" ? "Enter phone number to receive a secure code." :
              authMethod === "email" ? "Sign in with your email address." :
              "Choose your preferred sign-in method to continue."
            ) : step === "otp" ? (
              `Enter the 4-digit code sent to ${authMethod === "phone" ? `+91 ${phoneNum}` : emailAddress}`
            ) : step === "password_login" ? (
              `Enter your password for ${authMethod === "phone" ? `+91 ${phoneNum}` : emailAddress}`
            ) : (
              "Set your profile details and password to secure your account."
            )}
          </p>
        </div>

        {/* Dynamic Auth Forms */}
        {step === "phone" ? (
          <div className="mt-6 space-y-4">
            {authMethod === null ? (
              <div className="space-y-4">
                <button
                  onClick={() => setAuthMethod("phone")}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-4 font-bold text-sm hover:border-primary hover:bg-background/35 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="size-5 text-primary" />
                    <span>Login with Phone Number</span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </button>

                <button
                  onClick={() => setAuthMethod("email")}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-4 font-bold text-sm hover:border-primary hover:bg-background/35 transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="size-5 text-primary" />
                    <span>Login with Email ID</span>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </button>
              </div>
            ) : authMethod === "phone" ? (
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70">Phone Number</span>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="text-sm font-extrabold text-foreground">+91</span>
                    <input
                      type="tel"
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="98401 23456"
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                    />
                  </div>
                </label>

                <button
                  onClick={handleSendOtp}
                  disabled={phoneNum.length !== 10 || sendingOtp}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none"
                >
                  Send OTP <ArrowRight className="size-4" />
                </button>

                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => setAuthMethod(null)}
                    className="text-xs font-bold text-muted-foreground hover:text-primary transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep("password_login")}
                    disabled={!phoneNum}
                    className="text-xs font-bold text-primary hover:underline transition disabled:opacity-50"
                  >
                    Log in with Password instead
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70">Email Address</span>
                  <div className="flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition">
                    <Mail className="size-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="commuter@Rideuu.in"
                      className="w-full bg-transparent text-sm font-semibold outline-none"
                    />
                  </div>
                </label>

                <button
                  onClick={handleSendOtp}
                  disabled={!emailAddress || !emailAddress.includes("@") || sendingOtp}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none"
                >
                  Send OTP <ArrowRight className="size-4" />
                </button>

                <div className="flex items-center justify-between mt-2">
                  <button
                    onClick={() => setAuthMethod(null)}
                    className="text-xs font-bold text-muted-foreground hover:text-primary transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep("password_login")}
                    disabled={!emailAddress}
                    className="text-xs font-bold text-primary hover:underline transition disabled:opacity-50"
                  >
                    Log in with Password instead
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : step === "otp" ? (
          <div className="mt-6 space-y-5">
            <div className="flex justify-between gap-3">
              {otp.map((v, i) => (
                <input
                  key={i}
                  id={`otp-input-${i}`}
                  value={v}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const next = [...otp];
                    next[i] = val.slice(-1);
                    setOtp(next);
                    if (val && i < 3) {
                      document.getElementById(`otp-input-${i + 1}`)?.focus();
                    }
                  }}
                  inputMode="numeric"
                  maxLength={1}
                  className="h-14 w-14 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md text-center text-xl font-extrabold outline-none focus:border-primary transition"
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 transition"
            >
              Verify & Continue <ArrowRight className="size-4" />
            </button>

            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <button
                onClick={() => setStep("phone")}
                className="text-primary/70 hover:text-primary"
              >
                ← Go Back
              </button>
              {countdown > 0 ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <button
                  onClick={() => { setCountdown(30); handleSendOtp(); }}
                  className="text-primary font-bold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        ) : step === "password_login" ? (
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70">Password</span>
              <div className="flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
            </label>

            <button
              onClick={handlePasswordLogin}
              disabled={loggingIn || !password}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50"
            >
              {loggingIn ? "Logging in..." : "Log in"} <ArrowRight className="size-4" />
            </button>

            <button
              onClick={() => setStep("phone")}
              className="w-full text-center text-xs font-bold text-primary hover:underline transition"
            >
              Log in with OTP instead
            </button>
          </div>
        ) : (
          /* Profile / Password Creation Wizard */
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70">Full Name</span>
              <div className="flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition">
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Adhithya Raj"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70">Phone Number (Optional)</span>
              <div className="flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition">
                <Phone className="size-4 text-muted-foreground" />
                <span className="text-sm font-extrabold text-foreground">+91</span>
                <input
                  type="tel"
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="98401 23456"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70">Create Login Password</span>
              <div className="flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition">
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider opacity-70">Gender</span>
              <div className="flex items-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-3.5 focus-within:border-primary transition">
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value)}
                  className="w-full bg-transparent text-sm font-semibold outline-none text-foreground cursor-pointer"
                >
                  <option value="male" className="text-slate-900 bg-white">Male</option>
                  <option value="female" className="text-slate-900 bg-white">Female</option>
                  <option value="others" className="text-slate-900 bg-white">Others</option>
                </select>
              </div>
            </label>

            <button
              onClick={handleRegisterProfile}
              disabled={loggingIn || !regName || !regPassword}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50"
            >
              {loggingIn ? "Saving profile..." : "Save Profile & Continue"} <ArrowRight className="size-4" />
            </button>
          </div>
        )}





        {/* Multi-device sessions simulator */}
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Active Sessions</h3>
          <ul className="space-y-2">
            {deviceSessions.map((session) => (
              <li key={session.id} className="flex items-center justify-between rounded-xl border border-border/40 bg-background/20 backdrop-blur-md p-3 text-xs">
                <div className="flex items-center gap-2">
                  {session.device.toLowerCase().includes("mac") || session.device.toLowerCase().includes("chrome") ? (
                    <Laptop className="size-4 text-muted-foreground" />
                  ) : (
                    <Smartphone className="size-4 text-primary" />
                  )}
                  <div>
                    <div className="font-semibold flex items-center gap-1.5">
                      {session.device}
                      {session.isCurrent && (
                        <span className="rounded bg-emerald-500/10 px-1 py-0.5 text-[8px] font-extrabold text-emerald-600">Current</span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{session.location} · {session.lastActive}</div>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button
                    onClick={() => handleRevokeDevice(session.id)}
                    className="rounded bg-destructive/10 px-2 py-1 text-[10px] font-semibold text-destructive hover:bg-destructive/20 transition"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Download options: PWA */}
        {!isStandalone && !isPwaInstalled && (
          <div className="mt-4">
            {deferredPrompt ? (
              <button
                onClick={handleInstallPWA}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 flex items-center justify-center gap-2 font-extrabold text-[11px] text-slate-950 active:scale-[0.98] transition shadow-md shadow-amber-500/10 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-slate-950 shrink-0" />
                <span>Install PWA App</span>
              </button>
            ) : (
              <button
                onClick={() => setShowPwaModal(true)}
                className="w-full py-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 font-bold text-[11px] hover:bg-primary/20 active:scale-[0.98] transition text-primary cursor-pointer"
              >
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span>Install PWA App</span>
              </button>
            )}
          </div>
        )}

        <p className="mt-auto pb-4 pt-8 text-center text-[10px] text-muted-foreground">
          By continuing you agree to Rideuu's <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> & <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>



      {/* Social Login Consent Modal Selection Popup */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border/40 bg-background/90 backdrop-blur-xl p-6 space-y-4 animate-scale-in text-xs font-semibold text-left">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
                <span>{showConsentModal === "Google" ? "G" : ""}</span> Continue with {showConsentModal}
              </h2>
              <button onClick={() => setShowConsentModal(null)} className="text-xs text-muted-foreground font-bold">Cancel</button>
            </div>

            <p className="text-muted-foreground leading-normal">
              Select an account to authorize and sign in to Rideuu using {showConsentModal} secure credentials:
            </p>

            <div className="space-y-2">
              {[
                { name: "Adhithya R", email: "adhithya.r@chennai.in" },
                { name: "Chennai Traveler", email: "chennai.commuter@gmail.com" },
                { name: "Guest User", email: "guest.user@outlook.com" }
              ].map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => showConsentModal === "Google" ? handleGoogleAuthConfirm(acc.email, acc.name) : handleAppleAuthConfirm(acc.email, acc.name)}
                  className="w-full rounded-2xl border border-border/40 bg-card p-3 text-left hover:border-primary transition"
                >
                  <div className="font-extrabold text-foreground">{acc.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{acc.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PWA Instructions Modal */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border/40 bg-background p-6 text-center space-y-4 animate-scale-in">
            <Sparkles className="size-12 mx-auto text-primary animate-pulse" />
            <div>
              <h2 className="text-base font-bold">Install Rideuu Customer</h2>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                To install this Progressive Web App:
              </p>
              <div className="mt-3 text-left bg-muted/30 p-3.5 rounded-xl border border-border/30 space-y-2 text-xs">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  <span>On Android/Chrome: Wait for a prompt, or click "Add to Home screen" in browser settings.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  <span>On iOS Safari: Tap the <strong>Share</strong> button <span className="text-base font-normal">📤</span>, scroll down and tap <strong>Add to Home Screen</strong>.</span>
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPwaModal(false)}
              className="w-full rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground hover:brightness-105 active:scale-95 transition"
            >
              Okay, Got It!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}