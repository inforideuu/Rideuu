import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/rider/MobileShell";
import { ArrowLeft, RefreshCw, KeyRound } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useRider } from "../context/RiderContext";
import { api } from "../lib/api";

export const Route = createFileRoute("/otp")({
  component: OtpPage,
});

function OtpPage() {
  const nav = useNavigate();
  const { email, phone, t, language, setToken } = useRider();
  
  const [vals, setVals] = useState(["", "", "", ""]);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const [seconds, setSeconds] = useState(30);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const complete = vals.every((v) => v.length === 1);

  const handleVerify = async () => {
    if (!complete) return;
    setVerifying(true);
    const enteredOtp = vals.join("");
    const vehicleType = localStorage.getItem("namma_vehicle_type") || "auto";
    const defaultModel = vehicleType === "bike" ? "Honda Activa" : "Bajaj RE Auto";
    const res = await api.verifyOtp(
      email, 
      enteredOtp, 
      "driver", 
      localStorage.getItem("namma_name") || "",
      "", // sub_role
      localStorage.getItem("namma_phone") || "",
      localStorage.getItem("namma_address") || "",
      vehicleType,
      localStorage.getItem("namma_vehicle_model") || defaultModel,
      localStorage.getItem("namma_vehicle_plate") || "TN 22 BZ 4421",
      localStorage.getItem("namma_vehicle_color") || "Yellow",
      localStorage.getItem("namma_vehicle_year") || "2026",
      localStorage.getItem("namma_gender") || "male"
    );
    setVerifying(false);
    if (res && res.token) {
      setToken(res.token);
      localStorage.setItem("namma_email", res.user.email);
      localStorage.setItem("namma_phone", res.user.phone);
      localStorage.setItem("namma_name", res.user.name);



      if (res.user.kyc_status === "VERIFIED" || res.user.status === "active") {
        nav({ to: "/dashboard" });
      } else {
        nav({ to: "/kyc" });
      }
    } else {
      const errorMsg = res?.error || "Invalid verification code. Access denied.";
      alert(errorMsg);
    }
  };

  const handleResend = async () => {
    setSeconds(30);
    setVals(["", "", "", ""]);
    refs.current[0]?.focus();
    try {
      const res = await api.sendOtp(email, "driver", "login");
      if (res && res.success) {
        alert(`[AUTH OTP SENT] Correct Verification Code: ${res.otp}`);
      } else {
        alert("Failed to resend OTP. Please try again.");
      }
    } catch (err) {
      alert("Failed to resend OTP. Please try again.");
    }
  };

  return (
    <MobileShell showNav={false}>
      <div className="px-6 pt-10">
        <button
          onClick={() => nav({ to: "/login" })}
          className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground active:scale-95 transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <KeyRound className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
            {t("step_2_of_3")}
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground">
          {t("enter_otp")}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          OTP sent to <strong className="text-foreground font-bold">{email && email.includes("@rideuu.in") ? `+91 ${email.split("@")[0]}` : (email || "rider@example.com")}</strong>.{" "}
          <button onClick={() => nav({ to: "/login" })} className="text-primary font-extrabold underline text-[11px] ml-1">
            {t("change")}
          </button>
        </p>

        {/* OTP Input Boxes */}
        <div className="mt-10 flex gap-4 justify-center">
          {vals.map((v, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={v}
              inputMode="numeric"
              maxLength={1}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                const next = [...vals];
                next[i] = val;
                setVals(next);
                // Auto focus next or prev
                if (val && i < 3) {
                  refs.current[i + 1]?.focus();
                } else if (!val && i > 0) {
                  refs.current[i - 1]?.focus();
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !vals[i] && i > 0) {
                  refs.current[i - 1]?.focus();
                }
              }}
              className="w-14 h-15 rounded-2xl bg-card border-2 border-border focus:border-primary text-center text-2xl font-black outline-none shadow-sm transition-all focus:scale-105"
            />
          ))}
        </div>

        {/* Resend Timer */}
        <div className="mt-8 text-center text-xs text-muted-foreground font-semibold">
          {seconds > 0 ? (
            <span className="flex items-center justify-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-primary" />
              {t("resend_in")} <strong className="text-foreground font-bold">0:{seconds < 10 ? `0${seconds}` : seconds}</strong>
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="text-primary font-black underline hover:text-primary/95"
            >
              {t("resend_now")}
            </button>
          )}
        </div>

        {/* CTA Verify Button */}
        <button
          disabled={!complete}
          onClick={handleVerify}
          className="mt-10 w-full rounded-full bg-primary text-primary-foreground font-black py-4 disabled:opacity-50 active:scale-[0.98] transition hover:bg-primary/95 shadow-md text-sm tracking-wide"
        >
          {t("verify_continue")}
        </button>
      </div>
    </MobileShell>
  );
}
