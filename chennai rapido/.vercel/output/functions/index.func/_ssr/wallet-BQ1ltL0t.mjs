import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppStore, t as translate, s as store } from "./router-BpidCmwR.mjs";
import { ab as Wallet$1, a0 as Sparkles, R as Plus, a9 as Users, A as ArrowDownLeft, c as ArrowUpRight, _ as ShieldCheck, w as LoaderCircle, j as Check } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
function Wallet() {
  const {
    language,
    theme,
    wallet,
    transactions
  } = useAppStore();
  const [showAddMoney, setShowAddMoney] = reactExports.useState(false);
  const [addAmount, setAddAmount] = reactExports.useState("200");
  const [checkoutStep, setCheckoutStep] = reactExports.useState("amount");
  const [paymentType, setPaymentType] = reactExports.useState("upi");
  const [upiId, setUpiId] = reactExports.useState("adhithya@okaxis");
  const [cardNumber, setCardNumber] = reactExports.useState("4321 5678 9012 3456");
  const [autoDeduct, setAutoDeduct] = reactExports.useState(true);
  const [splitFare, setSplitFare] = reactExports.useState("82");
  const [splitCount, setSplitCount] = reactExports.useState(3);
  const [splitCalculated, setSplitCalculated] = reactExports.useState(null);
  const [showSplitLinkSent, setShowSplitLinkSent] = reactExports.useState(false);
  const t = (key) => translate(key, language);
  const handleLaunchRazorpay = () => {
    setCheckoutStep("gateway");
  };
  const handleSimulatePayment = () => {
    setCheckoutStep("processing");
    setTimeout(() => {
      setCheckoutStep("success");
      store.walletRecharge(Number(addAmount));
      setTimeout(() => {
        setShowAddMoney(false);
        setCheckoutStep("amount");
      }, 2e3);
    }, 2500);
  };
  const handleCalculateSplit = () => {
    const fare = Number(splitFare);
    if (!fare || splitCount <= 1) return;
    setSplitCalculated({
      perPerson: Math.round(fare / splitCount * 100) / 100
    });
  };
  const handleRequestSplitLink = () => {
    setShowSplitLinkSent(true);
    setTimeout(() => {
      setShowSplitLinkSent(false);
      setSplitCalculated(null);
      setSplitFare("82");
    }, 3e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-24 text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "bg-secondary px-5 pt-12 pb-6 text-secondary-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-primary", children: t("Wallet") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-xl font-extrabold tracking-tight", children: t("Namma Cash") })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checkered-sm h-1.5 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-0 h-full w-24 checkered-sm opacity-25" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Wallet$1, { className: "size-4" }),
        " ",
        t("Available balance")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2 text-4xl font-extrabold tracking-tight", children: [
        "₹",
        wallet.balance.toFixed(2)
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2 flex items-center gap-1.5 text-[10px] font-semibold opacity-90", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5 text-secondary animate-pulse" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Loyalty Tier: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "Platinum (480 points)" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setShowAddMoney(true), className: "relative mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-xs font-black text-secondary-foreground shadow hover:brightness-105 active:scale-95 transition", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " ",
        t("Add money")
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-semibold flex items-center justify-between text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-extrabold", children: "Auto-Deduct Ride Fares" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-0.5", children: "Deduct trip prices automatically from Namma Cash on dropoff" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setAutoDeduct(!autoDeduct), className: `relative inline-flex h-5 w-10 items-center rounded-full transition ${autoDeduct ? "bg-primary" : "bg-muted"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block size-4 transform rounded-full bg-background shadow transition ${autoDeduct ? "translate-x-5" : "translate-x-0.5"}` }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "mt-5 px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm text-left space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 pl-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-4 text-primary" }),
        " Split Ride cost"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground leading-normal", children: "Planning a ride with friends? Calculate split proportions and share instant billing requests instantly." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs font-bold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground block mb-1", children: "Total Cost (₹)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: splitFare, onChange: (e) => setSplitFare(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-primary" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground block mb-1", children: "Number of People" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: splitCount, onChange: (e) => setSplitCount(Number(e.target.value)), className: "w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-primary font-bold", children: [2, 3, 4, 5, 6].map((num) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: num, children: [
            num,
            " riders"
          ] }, num)) })
        ] })
      ] }),
      splitCalculated && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-primary/5 border border-primary/10 p-3 text-center text-xs font-semibold animate-scale-in space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          "Split Share: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-sm font-black text-primary", children: [
            "₹",
            splitCalculated.perPerson
          ] }),
          " per rider"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleRequestSplitLink, className: "w-full rounded-lg bg-secondary py-2 text-[10px] font-black text-secondary-foreground flex items-center justify-center gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3" }),
          " Broadcast UPI payment requests"
        ] })
      ] }),
      showSplitLinkSent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-emerald-600 font-extrabold text-center animate-pulse", children: "✓ Broadcast requests dispatched successfully!" }),
      !splitCalculated && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCalculateSplit, className: "w-full rounded-xl bg-secondary py-3 text-xs font-extrabold text-secondary-foreground active:scale-[0.99] transition", children: "Calculate Splits" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-4 pt-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-xs font-black text-muted-foreground uppercase tracking-widest pl-1", children: t("Recent activity") }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: transactions.map((t2, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `grid size-10 shrink-0 place-items-center rounded-xl ${t2.type === "in" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`, children: t2.type === "in" ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownLeft, { className: "size-4.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-4.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold", children: language === "en" ? t2.title : t2.tamilTitle }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground mt-0.5", children: t2.date })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `text-xs font-black shrink-0 ${t2.type === "in" ? "text-emerald-600" : ""}`, children: [
          t2.type === "in" ? "+" : "-",
          "₹",
          Math.abs(t2.amount)
        ] })
      ] }, t2.id || idx)) })
    ] }),
    showAddMoney && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-xs p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-scale-in text-xs font-semibold", children: [
      checkoutStep === "amount" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-border pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-extrabold", children: "Recharge Wallet" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAddMoney(false), className: "font-bold text-muted-foreground hover:text-foreground", children: "Cancel" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] text-muted-foreground uppercase tracking-widest pl-1 block mb-1", children: "Enter Recharge Amount (₹)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-xl border border-border bg-background p-3.5 focus-within:border-primary", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black text-primary", children: "₹" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: addAmount, onChange: (e) => setAddAmount(e.target.value), className: "w-full bg-transparent text-sm font-extrabold outline-none" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2 text-center text-[10px] font-bold", children: ["100", "200", "500"].map((preset) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setAddAmount(preset), className: `rounded-lg border py-2 transition ${addAmount === preset ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`, children: [
          "+₹",
          preset
        ] }, preset)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleLaunchRazorpay, disabled: !addAmount || Number(addAmount) <= 0, className: "w-full rounded-2xl bg-primary py-4 text-xs font-extrabold text-primary-foreground shadow shadow-primary/20 transition disabled:opacity-50", children: [
          "Proceed to Pay ₹",
          addAmount
        ] })
      ] }),
      checkoutStep === "gateway" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center bg-blue-600 -mx-6 -mt-6 p-4 rounded-t-3xl text-white", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-black tracking-tight", children: "Razorpay Checkout" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[8px] opacity-80 tracking-wider", children: "SECURE PAYMENTS GATEWAY" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] opacity-80 uppercase block", children: "Amount" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-xs font-extrabold", children: [
              "₹",
              addAmount,
              ".00"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3.5 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5", children: "Select Payment Option" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2 text-center font-bold text-[10px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPaymentType("upi"), className: `rounded-lg border py-2 transition ${paymentType === "upi" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-border bg-card"}`, children: "UPI (GPay / PhonePe)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPaymentType("card"), className: `rounded-lg border py-2 transition ${paymentType === "card" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-border bg-card"}`, children: "Credit / Debit Card" })
          ] }),
          paymentType === "upi" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] text-muted-foreground uppercase tracking-widest pl-0.5 block mb-1", children: "Enter UPI VPA ID" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: upiId, onChange: (e) => setUpiId(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-blue-600" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] text-muted-foreground uppercase tracking-widest pl-0.5 block mb-1", children: "Card Credentials" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: cardNumber, onChange: (e) => setCardNumber(e.target.value), className: "w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-blue-600" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[8px] text-muted-foreground pl-0.5 font-bold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-3.5 text-blue-600" }),
            " SECURE 256-BIT SSL ENCRYPTION"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSimulatePayment, className: "w-full rounded-2xl bg-blue-600 py-4 text-xs font-extrabold text-white shadow shadow-blue-500/20 hover:bg-blue-700 transition", children: "Pay via Razorpay Secure" })
      ] }),
      checkoutStep === "processing" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-14 mx-auto text-blue-600 animate-spin" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-extrabold", children: "Authorizing Gateway..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "Please do not refresh. Razorpay is securing your UPI transaction." })
        ] })
      ] }),
      checkoutStep === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-8 text-center space-y-4 animate-scale-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-14 mx-auto place-items-center rounded-full bg-emerald-500 text-white shadow shadow-emerald-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-7", strokeWidth: 3.5 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-extrabold text-emerald-600", children: "Recharge Successful!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground mt-1", children: [
            "₹",
            addAmount,
            ".00 successfully credited to Namma Cash balance."
          ] })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  Wallet as component
};
