import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider, a as api } from "./router-CTtxc6Rr.mjs";
import { Y as Sparkles, b as ArrowRight, Q as Share2, i as Check, q as Copy, a7 as Users, a5 as UserCheck, a2 as Trophy } from "../_libs/lucide-react.mjs";
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
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
function ReferralPage() {
  const {
    referralCode,
    referralsList,
    referralEarnings,
    t,
    language
  } = useRider();
  const [copied, setCopied] = reactExports.useState(false);
  const [referralInput, setReferralInput] = reactExports.useState("");
  const [claimStatus, setClaimStatus] = reactExports.useState({
    type: "",
    message: ""
  });
  const [loading, setLoading] = reactExports.useState(false);
  const handleCopy = () => {
    setCopied(true);
    try {
      navigator.clipboard.writeText(`Join me as a driver on Rideuu! Use referral code: ${referralCode}`);
    } catch (e) {
    }
    setTimeout(() => setCopied(false), 2e3);
  };
  const handleClaimReferral = async (e) => {
    e.preventDefault();
    if (!referralInput.trim()) return;
    setLoading(true);
    setClaimStatus({
      type: "",
      message: ""
    });
    try {
      const res = await api.claimReferral(referralInput.trim());
      if (res && res.success) {
        setClaimStatus({
          type: "success",
          message: res.message || "Referral code claimed successfully!"
        });
        setReferralInput("");
      } else {
        setClaimStatus({
          type: "error",
          message: res?.error || "Invalid referral code or code already claimed."
        });
      }
    } catch (err) {
      setClaimStatus({
        type: "error",
        message: err.message || "Something went wrong. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { subtitle: t("refer_title").toUpperCase(), title: t("invite_earn") }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 space-y-5 pb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-primary text-primary-foreground p-6 relative overflow-hidden shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase font-extrabold tracking-widest opacity-80", children: "Referral Wallet Balance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 text-4xl font-black tracking-tight", children: [
          "₹",
          referralEarnings.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] opacity-80 mt-1.5 font-semibold", children: "Earn ₹300 for every active auto/bike driver you sign up in Chennai." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checker-stripe absolute -bottom-2 inset-x-0 h-3.5 opacity-30" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border pb-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "h-4.5 w-4.5 text-amber-500 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xs uppercase tracking-wider text-foreground", children: "Claim Referral Code" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-semibold leading-relaxed mb-4", children: "Were you referred by another driver? Enter their referral code here to claim your sign-up bonus!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleClaimReferral, className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", placeholder: "e.g. NAMMA4421", value: referralInput, onChange: (e) => setReferralInput(e.target.value.toUpperCase()), className: "flex-1 bg-secondary border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary uppercase" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", disabled: loading || !referralInput.trim(), className: "px-4 py-2 bg-primary text-white hover:bg-primary/95 disabled:opacity-50 rounded-xl text-xs font-black transition active:scale-95 flex items-center gap-1 shrink-0", children: loading ? "Claiming..." : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              "Claim ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-3" })
            ] }) })
          ] }),
          claimStatus.type && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `text-[10px] font-bold p-2.5 rounded-xl border ${claimStatus.type === "success" ? "bg-success/10 border-success/20 text-success" : "bg-destructive/10 border-destructive/20 text-destructive"}`, children: claimStatus.message })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border pb-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-4.5 w-4.5 text-primary animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xs uppercase tracking-wider text-foreground", children: "Share Invite Link" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground font-semibold leading-relaxed mb-4", children: "Share this link via WhatsApp, SMS, or Telegram. Once they finish 5 rides, you both get ₹300!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-2xl p-3 border border-border flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black text-foreground truncate select-all", children: referralCode }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCopy, className: `h-9 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${copied ? "bg-success text-white border border-success" : "bg-primary text-white hover:bg-primary/95"}`, children: copied ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-3.5 w-3.5" }),
            " Copied"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "h-3.5 w-3.5" }),
            " Copy Code"
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "mb-3 font-black text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-4.5 w-4.5 text-primary" }),
          t("referral_status"),
          " (",
          referralsList.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: referralsList.map((refPhone, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-2xl bg-card border border-border p-4 shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-9 w-9 rounded-full bg-accent text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "h-4.5 w-4.5" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-xs text-foreground block", children: refPhone }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-success font-bold uppercase mt-0.5", children: "5 Rides completed" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-sm text-foreground", children: "+₹300.00" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-muted-foreground font-bold uppercase mt-0.5", children: "Credited" })
          ] })
        ] }, i)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-900 border border-white/10 p-5 text-white shadow-xl relative overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-5 w-5 text-yellow-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-sm uppercase tracking-wider text-white", children: language === "ta" ? "பரிந்துரை லீடர்போர்டு" : "Referral Leaderboard" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 text-xs font-semibold mt-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-1 border-b border-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "1. Selvam K (Tambaram)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-black", children: "42 Signups" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-1 border-b border-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "2. Murugan A (Adyar)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary font-black", children: "38 Signups" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "3. Raja Kumar (You)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary font-black", children: [
              referralsList.length,
              " Signups"
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ReferralPage as component
};
