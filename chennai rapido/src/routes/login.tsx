import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Phone, Mail, ShieldCheck, Fingerprint, Smartphone, Laptop, Sparkles, Check, RefreshCw, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useAppStore, store, translate } from "@/lib/store";
import { api } from "../lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Rideuu" }] }),
  component: Login,
});

function Login() {
  const { language, theme, deviceSessions } = useAppStore();
  const navigate = useNavigate();

  const [authMethod, setAuthMethod] = useState<"phone" | "email">("email");
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
  const [biometricSupported, setBiometricSupported] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [showResetSuccess, setShowResetSuccess] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState<"Google" | "Apple" | null>(null);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // Timer for OTP
  useEffect(() => {
    let t: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      t = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(t);
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
      alert("Invalid OTP code. Access denied.");
    }
  };;

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
    setLoggingIn(true);
    setLoggingIn(false);
    if (res) {
      store.update((s) => {
        s.profile.name = res.name;
        s.profile.email = res.email || "";
        s.profile.gender = res.gender || "male";
      });
      navigate({ to: "/app/home" });
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
    const res = await api.loginPassword(
      authMethod === "phone" ? phoneNum : "",
      authMethod === "email" ? emailAddress : "",
      password
    );
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

  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      const email = emailAddress || localStorage.getItem("namma_last_biometric_email");
      if (email && localStorage.getItem(`namma_biometric_enabled_${email}`)) {
        try {
          const challenge = new Uint8Array(32);
          window.crypto.getRandomValues(challenge);
          const getOptions = {
            publicKey: {
              challenge: challenge,
              timeout: 60000,
              userVerification: "required"
            }
          };
          const cred = await navigator.credentials.get(getOptions as any);
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
              navigate({ to: "/app/home" });
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
          challenge: challenge,
          rp: { name: "Rideuu" },
          user: {
            id: new TextEncoder().encode(email),
            name: email,
            displayName: email
          },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000
        }
      };
      const cred = await navigator.credentials.create(createOptions as any);
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
              authMethod === "phone" ? "Enter phone number to receive a secure code." : "Sign in with your email address."
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
              disabled={!emailAddress || !emailAddress.includes("@")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-sm font-extrabold text-primary-foreground hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50 disabled:pointer-events-none"
            >
              Send OTP <ArrowRight className="size-4" />
            </button>
 
            <button
              onClick={() => setStep("password_login")}
              disabled={!emailAddress}
              className="w-full text-center text-xs font-bold text-primary hover:underline transition disabled:opacity-50"
            >
              Log in with Password instead
            </button>
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

        {/* Social login portals */}
        {step === "phone" && emailStep === "login" && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 py-2">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Or continue with</span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConsentModal("Google")}
                className="flex items-center justify-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md py-3.5 text-xs font-bold hover:bg-muted active:scale-[0.99] transition"
              >
                <span className="text-red-500 font-extrabold">G</span> Google
              </button>
              <button
                onClick={() => setShowConsentModal("Apple")}
                className="flex items-center justify-center gap-2.5 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md py-3.5 text-xs font-bold hover:bg-muted active:scale-[0.99] transition"
              >
                <span className="font-extrabold"></span> Apple
              </button>
            </div>
          </div>
        )}

        {/* Smart Biometric Configuration Panel */}
        <div className="mt-8 rounded-2xl border border-border/40 bg-background/20 backdrop-blur-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Fingerprint className="size-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-extrabold">Biometric Login</h3>
                <p className="text-[10px] text-muted-foreground">Authenticate using FaceID / Fingerprint</p>
              </div>
            </div>
            <button
              onClick={toggleBiometric}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${biometricEnabled ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block size-4 transform rounded-full bg-background transition ${biometricEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

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

        {/* Download Mobile APK option */}
        <div className="mt-4">
          <a
            href="/chennai_rapido.apk"
            download
            className="w-full py-3.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 font-bold text-xs hover:bg-primary/20 active:scale-[0.98] transition text-primary"
          >
            <Download className="h-4 w-4" />
            <span>Download Chennai Rapido APK</span>
          </a>
        </div>

        <p className="mt-auto pb-4 pt-8 text-center text-[10px] text-muted-foreground">
          By continuing you agree to Rideuu's <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> & <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>

      {/* Biometric setup popup overlay */}
      {showBiometricModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border/40 bg-background/40 backdrop-blur-xl p-6 text-center space-y-4 animate-scale-in">
            <Fingerprint className="size-16 mx-auto text-primary animate-pulse" />
            <div>
              <h2 className="text-lg font-bold">Register Biometrics</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Link your device's fingerprint or FaceID credentials with Rideuu for quick 1-tap sign in.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmBiometric}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground"
              >
                Authenticate & Save
              </button>
              <button
                onClick={() => setShowBiometricModal(false)}
                className="flex-1 rounded-xl border border-border/40 bg-background/20 backdrop-blur-md py-3 text-xs font-semibold"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}