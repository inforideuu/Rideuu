import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider, a as api } from "./router-CTtxc6Rr.mjs";
import { a as ArrowLeft, K as KeyRound, R as RefreshCw } from "../_libs/lucide-react.mjs";
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
function OtpPage() {
  const nav = useNavigate();
  const {
    email,
    phone,
    t,
    language,
    setToken
  } = useRider();
  const [vals, setVals] = reactExports.useState(["", "", "", ""]);
  const refs = reactExports.useRef([]);
  const [seconds, setSeconds] = reactExports.useState(30);
  const [verifying, setVerifying] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds(seconds - 1), 1e3);
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
      "",
      // sub_role
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
      const registerBio = window.confirm("Would you like to enable Face ID / Fingerprint login on this device for next time?");
      if (registerBio) {
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
                id: new TextEncoder().encode(res.user.email),
                name: res.user.email,
                displayName: res.user.email
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
            localStorage.setItem(`namma_biometric_enabled_${res.user.email}`, "true");
            localStorage.setItem(`namma_biometric_token_${res.user.email}`, res.token);
            localStorage.setItem("namma_last_biometric_email", res.user.email);
            alert("Biometrics registered successfully!");
          }
        } catch (err) {
          console.error("WebAuthn creation failed:", err);
          alert("Biometrics registration cancelled or device not supported.");
        }
      }
      if (res.user.kyc_status === "VERIFIED" || res.user.status === "active") {
        nav({
          to: "/dashboard"
        });
      } else {
        nav({
          to: "/kyc"
        });
      }
    } else {
      alert("Invalid verification code. Access denied.");
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(MobileShell, { showNav: false, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-6 pt-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => nav({
      to: "/login"
    }), className: "h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground active:scale-95 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-primary", children: t("step_2_of_3") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-3xl font-black tracking-tight text-foreground", children: t("enter_otp") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-xs text-muted-foreground leading-relaxed", children: [
      "OTP sent to ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground font-bold", children: email || "rider@example.com" }),
      ".",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => nav({
        to: "/login"
      }), className: "text-primary font-extrabold underline text-[11px] ml-1", children: t("change") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 flex gap-4 justify-center", children: vals.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: (el) => {
      refs.current[i] = el;
    }, value: v, inputMode: "numeric", maxLength: 1, onChange: (e) => {
      const val = e.target.value.replace(/\D/g, "");
      const next = [...vals];
      next[i] = val;
      setVals(next);
      if (val && i < 3) {
        refs.current[i + 1]?.focus();
      } else if (!val && i > 0) {
        refs.current[i - 1]?.focus();
      }
    }, onKeyDown: (e) => {
      if (e.key === "Backspace" && !vals[i] && i > 0) {
        refs.current[i - 1]?.focus();
      }
    }, className: "w-14 h-15 rounded-2xl bg-card border-2 border-border focus:border-primary text-center text-2xl font-black outline-none shadow-sm transition-all focus:scale-105" }, i)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-8 text-center text-xs text-muted-foreground font-semibold", children: seconds > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center justify-center gap-1.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3.5 w-3.5 animate-spin text-primary" }),
      t("resend_in"),
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-foreground font-bold", children: [
        "0:",
        seconds < 10 ? `0${seconds}` : seconds
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleResend, className: "text-primary font-black underline hover:text-primary/95", children: t("resend_now") }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !complete, onClick: handleVerify, className: "mt-10 w-full rounded-full bg-primary text-primary-foreground font-black py-4 disabled:opacity-50 active:scale-[0.98] transition hover:bg-primary/95 shadow-md text-sm tracking-wide", children: t("verify_continue") })
  ] }) });
}
export {
  OtpPage as component
};
