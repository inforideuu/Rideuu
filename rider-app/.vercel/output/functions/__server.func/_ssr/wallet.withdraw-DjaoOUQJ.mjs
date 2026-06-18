import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { l as CircleCheck, L as Landmark } from "../_libs/lucide-react.mjs";
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
function Withdraw() {
  const nav = useNavigate();
  const {
    walletBalance,
    incentiveBalance,
    bonusBalance,
    withdrawFunds,
    transactions,
    t,
    language
  } = useRider();
  const [selectedWallet, setSelectedWallet] = reactExports.useState("wallet");
  const [selectedAmount, setSelectedAmount] = reactExports.useState(null);
  const [success, setSuccess] = reactExports.useState(false);
  const todayDateStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const withdrawalsTodayCount = reactExports.useMemo(() => {
    return transactions.filter((tx) => tx.titleEn.toLowerCase().includes("withdraw") && (tx.date === todayDateStr || tx.date.toLowerCase().includes("today") || tx.date.toLowerCase().includes("now"))).length;
  }, [transactions, todayDateStr]);
  const fee = withdrawalsTodayCount >= 1 ? 15 : 0;
  const currentBalance = selectedWallet === "wallet" ? walletBalance : selectedWallet === "incentive" ? incentiveBalance : bonusBalance;
  const isBalanceTooLow = currentBalance <= 250;
  const totalDeduction = (selectedAmount || 0) + fee;
  const isInvalid = !selectedAmount || isBalanceTooLow || totalDeduction > currentBalance;
  const handleConfirm = async () => {
    if (isInvalid || !selectedAmount) return;
    const ok = await withdrawFunds(selectedAmount, fee, selectedWallet);
    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        nav({
          to: "/wallet"
        });
      }, 2e3);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { showNav: false, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { subtitle: t("withdraw").toUpperCase(), title: t("send_to_bank") }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5", children: success ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-10 text-center py-8 px-6 bg-success/15 border border-success/20 rounded-3xl text-success slide-up shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-14 w-14 mx-auto mb-4 animate-bounce fill-success/10" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-black text-lg text-foreground mb-1", children: "Transfer Complete" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground leading-relaxed font-semibold", children: t("withdraw_success") })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex bg-secondary border border-border/80 rounded-2xl p-1 mb-4", children: ["wallet", "incentive", "bonus"].map((w) => {
        const isSelected = selectedWallet === w;
        const label = w === "wallet" ? "Cash" : w === "incentive" ? "Incentive" : "Bonus";
        const bal = w === "wallet" ? walletBalance : w === "incentive" ? incentiveBalance : bonusBalance;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => {
          setSelectedWallet(w);
          setSelectedAmount(null);
        }, className: `flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${isSelected ? "bg-card text-foreground shadow-sm font-black scale-[1.02]" : "text-muted-foreground hover:text-foreground"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] opacity-80 mt-0.5", children: [
            "₹",
            bal.toLocaleString()
          ] })
        ] }, w);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-6 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground", children: language === "ta" ? "கிடைக்கக்கூடிய இருப்பு" : `Available in ${selectedWallet === "wallet" ? "Cash" : selectedWallet === "incentive" ? "Incentive" : "Bonus"} Wallet` }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-3xl font-black text-foreground mt-1", children: [
          "₹",
          currentBalance.toLocaleString()
        ] }),
        isBalanceTooLow ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs leading-relaxed font-semibold", children: "⚠️ Withdrawals are only allowed when your selected wallet balance is greater than ₹250." }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mt-6 block text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase", children: "Select Withdrawal Amount" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 grid grid-cols-3 gap-2.5", children: [100, 200, 500].map((v) => {
            const active = selectedAmount === v;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setSelectedAmount(v), className: `rounded-2xl py-3 text-sm font-black transition-all ${active ? "bg-primary text-primary-foreground border-2 border-primary shadow-sm scale-102" : "bg-secondary hover:bg-accent border border-border text-foreground"}`, children: [
              "₹",
              v
            ] }, v);
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 bg-secondary/60 border border-border rounded-2xl p-4 text-xs font-semibold space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Withdrawals Today:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground", children: [
                withdrawalsTodayCount,
                " times"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Admin Fee:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: fee > 0 ? "text-amber-600 font-bold" : "text-emerald-500 font-bold", children: fee > 0 ? `₹${fee} (from 2nd time onwards)` : "Free (First of the day)" })
            ] }),
            selectedAmount && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between border-t border-border/80 pt-2 font-black text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Total Deduction:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
                "₹",
                totalDeduction
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 rounded-2xl bg-secondary border border-border p-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-foreground uppercase tracking-wide", children: "HDFC Bank linked" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold mt-0.5", children: "Instant transfer via UPI" })
          ] })
        ] })
      ] }),
      selectedAmount && totalDeduction > currentBalance && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 text-[10px] text-primary font-black uppercase text-center animate-pulse", children: [
        "✕ Total deduction (₹",
        totalDeduction,
        ") exceeds available balance in the selected wallet."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => nav({
          to: "/wallet"
        }), className: "px-5 py-4 rounded-full bg-secondary border border-border text-foreground font-bold text-xs active:scale-95 transition", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleConfirm, disabled: isInvalid, className: "flex-1 rounded-full bg-primary text-primary-foreground font-black py-4 disabled:opacity-50 active:scale-95 transition hover:bg-primary/95 text-xs shadow-md tracking-wider uppercase", children: t("confirm_withdrawal") })
      ] })
    ] }) })
  ] });
}
export {
  Withdraw as component
};
