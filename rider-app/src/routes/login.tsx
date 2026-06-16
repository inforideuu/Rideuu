import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/rider/MobileShell";
import { Logo } from "@/components/rider/Logo";
import { ArrowRight, Phone, Mail, Shield, Sparkles, Globe, Fingerprint, RefreshCw, UserCheck, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useRider } from "../context/RiderContext";
import { api } from "../lib/api";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Rider Login — Rideuu" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { language, setLanguage, t, setPhone, setEmail, setProfileName, setToken, addNotification } = useRider();

  const [isRegistering, setIsRegistering] = useState(false);
  const [inputPhone, setInputPhone] = useState("");
  const [inputName, setInputName] = useState("");
  const [vehicleType, setVehicleType] = useState<"auto" | "bike">("auto");
  const [gender, setGender] = useState<"male" | "female" | "others">("male");
  const [inputAddress, setInputAddress] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [biometricScanning, setBiometricScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaModal, setShowPwaModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleBeforeInstallPrompt = (e: Event) => {
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
      const { outcome } = await deferredPrompt.userChoice;
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
      // We need to fetch directly to handle raw error response body since api.ts fetchAPI catches errors and returns null
      const url = `http://localhost:8000/api/auth/send-otp/`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail, role: "driver", action })
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
        nav({ to: "/otp" });
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
          challenge: challenge,
          timeout: 60000,
          userVerification: "required"
        }
      };
      const cred = await navigator.credentials.get(getOptions as any);
      if (cred) {
        const savedToken = localStorage.getItem(`namma_biometric_token_${email}`);
        if (savedToken) {
          setToken(savedToken);
          // Fetch user profile details by email to log them in fully
          const activePhone = localStorage.getItem("namma_phone") || "";
          const activeVehType = localStorage.getItem("namma_vehicle_type") || "";
          const name = localStorage.getItem("namma_name") || "";
          const data = await api.getUserByEmail(email, "driver", name, activeVehType, activePhone);
          if (data) {
            setEmail(data.email);
            setPhone(data.phone);
            setProfileName(data.name);
            if (data.kyc_status === "VERIFIED" || data.status === "active") {
              nav({ to: "/dashboard" });
            } else {
              nav({ to: "/kyc" });
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

  return (
    <MobileShell
      showNav={false}
      className="bg-background/10 backdrop-blur-xs border-x-0 shadow-none"
    // style={{ backgroundImage: "url('/login_bg.png')", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
    >
      {/* Top Header & Translation Selector */}
      <div className="px-6 pt-10 pb-4 flex items-center justify-between">
        <Logo />
        <button
          onClick={() => setLanguage(language === "en" ? "ta" : "en")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/30 backdrop-blur-md border border-border/40 text-xs font-bold text-foreground active:scale-95 transition"
        >
          <Globe className="h-3.5 w-3.5 text-primary" />
          {language === "en" ? "தமிழ்" : "English"}
        </button>
      </div>

      <div className="px-6">
        <p className="text-[10px] font-extrabold tracking-widest text-primary uppercase mb-1 animate-pulse">
          {t("built_for_chennai")}
        </p>
        <h1 className="text-3xl font-black tracking-tight leading-tight text-foreground">
          {t("drive_smarter")}{" "}
          <span className="text-muted-foreground block text-2xl font-bold mt-1">
            {t("earn_more")}
          </span>
        </h1>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          {t("sign_in_desc")}
        </p>

        {/* Dynamic Reg/Login Tabs */}
        <div className="mt-6 flex bg-background/40 backdrop-blur-md rounded-full p-1 border border-border/30">
          <button
            onClick={() => setIsRegistering(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${!isRegistering
              ? "bg-background/30 text-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {language === "ta" ? "உள்நுழைவு" : "Driver Login"}
          </button>
          <button
            onClick={() => setIsRegistering(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${isRegistering
              ? "bg-background/30 text-foreground"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            {t("register_new")}
          </button>
        </div>

        {/* Premium Authentication Card */}
        <div className="mt-5 rounded-3xl bg-background/30 backdrop-blur-md border border-border/40 p-6 relative overflow-hidden">

          {isRegistering && (
            <div className="mb-4 space-y-3">
              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
                  {t("full_name")}
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Raja Kumar"
                  className="mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
                  Address
                </label>
                <input
                  type="text"
                  value={inputAddress}
                  onChange={(e) => setInputAddress(e.target.value)}
                  placeholder="123 Usman Road, T.Nagar, Chennai"
                  className="mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
                  Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={inputPhone}
                  onChange={(e) => setInputPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="9876543210"
                  className="mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
                  {t("vehicle_type")}
                </label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition"
                >
                  <option value="auto">🛺 {t("auto")}</option>
                  <option value="bike">🏍️ {t("bike")}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition"
                >
                  <option value="male">👨 Male</option>
                  <option value="female">👩 Female</option>
                  <option value="others">⚧️ Others</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
                  Vehicle Brand & Model
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  placeholder="Bajaj RE Auto / Honda Activa"
                  className="mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
                  Registration Number
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  placeholder="TN 22 BZ 4421"
                  className="mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
                    Vehicle Color
                  </label>
                  <input
                    type="text"
                    value={vehicleColor}
                    onChange={(e) => setVehicleColor(e.target.value)}
                    placeholder="Yellow / Black"
                    className="mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
                    Manufacturing Year
                  </label>
                  <input
                    type="number"
                    value={vehicleYear}
                    onChange={(e) => setVehicleYear(e.target.value)}
                    placeholder="2024"
                    className="mt-1.5 w-full bg-background/25 border border-border/40 rounded-xl px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary transition"
                  />
                </div>
              </div>
            </div>
          )}

          <label className="text-[10px] font-extrabold text-muted-foreground tracking-wider uppercase">
            Email ID
          </label>
          <div className="mt-2 flex items-center gap-3 border-b-2 border-border/40 pb-2 focus-within:border-primary transition">
            <div className="flex items-center gap-1.5 text-foreground font-bold text-base">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <input
              autoFocus
              type="email"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              placeholder="rider@example.com"
              className="flex-1 bg-transparent text-lg font-bold outline-none placeholder:text-muted-foreground/40 tracking-wide"
            />
          </div>

          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-2xl bg-destructive/15 border border-destructive/25 text-destructive text-xs space-y-2">
              <p className="font-bold">{errorMsg}</p>
              {errorMsg.includes("not registered") && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsRegistering(true);
                      setErrorMsg("");
                    }}
                    className="flex-1 py-1.5 px-2 bg-destructive text-destructive-foreground font-bold rounded-lg text-[10px]"
                  >
                    Register as New Rider
                  </button>
                  <button
                    onClick={() => {
                      setErrorMsg("");
                      setInputPhone("");
                    }}
                    className="py-1.5 px-2 bg-background border border-border text-foreground font-bold rounded-lg text-[10px]"
                  >
                    Back to Login
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            disabled={!inputEmail.includes("@") || (isRegistering && (!inputName || inputPhone.length !== 10)) || sending}
            onClick={handleSendOtp}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-bold py-3.5 disabled:opacity-50 active:scale-[0.98] transition hover:bg-primary/95"
          >
            {t("send_otp")} <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Biometric login simulation */}
        {!isRegistering && (
          <div className="mt-4">
            <button
              onClick={handleBiometricAuth}
              disabled={biometricScanning}
              className="w-full py-3.5 rounded-full bg-background/30 backdrop-blur-md border border-border/40 flex items-center justify-center gap-2 font-bold text-xs hover:bg-muted active:scale-[0.98] transition text-foreground"
            >
              {biometricScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 text-primary animate-spin" />
                  <span>Scanning Face / Fingerprint...</span>
                </>
              ) : (
                <>
                  <Fingerprint className="h-4 w-4 text-primary" />
                  <span>{t("biometric_login")}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Download options: PWA & Mobile APK */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {deferredPrompt ? (
            <button
              onClick={handleInstallPWA}
              className="py-3.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 flex items-center justify-center gap-2 font-extrabold text-[11px] text-slate-950 active:scale-[0.98] transition shadow-md shadow-amber-500/10 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-slate-950 shrink-0" />
              <span>Install PWA</span>
            </button>
          ) : (
            <button
              onClick={() => setShowPwaModal(true)}
              className="py-3.5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 font-bold text-[11px] hover:bg-primary/20 active:scale-[0.98] transition text-primary cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              <span>Install PWA</span>
            </button>
          )}
          <a
            href="/rider_app.apk"
            download
            className="py-3.5 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center gap-2 font-bold text-[11px] hover:bg-primary/20 active:scale-[0.98] transition text-primary text-center"
          >
            <Download className="h-4 w-4 shrink-0" />
            <span>Download APK</span>
          </a>
        </div>

        {/* Disclaimer & Session management */}
        <div className="mt-8 space-y-3.5 border-t border-border/40 pt-6">
          <div className="flex items-start gap-2.5 text-[11px] text-muted-foreground leading-relaxed">
            <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{t("verified_riders_only")}</span>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-background/30 backdrop-blur-md border border-border/40 px-4 py-2.5 text-[10px] text-muted-foreground font-bold">
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-success" />
              <span>Multi-device Session Manager:</span>
            </div>
            <span className="text-success uppercase">Active (1 Device)</span>
          </div>
        </div>
      </div>

      {/* PWA Instructions Modal */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border/40 bg-background p-6 text-center space-y-4 animate-scale-in">
            <Sparkles className="size-12 mx-auto text-primary animate-pulse" />
            <div>
              <h2 className="text-base font-bold">Install Rideuu Driver App</h2>
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
    </MobileShell>
  );
}
