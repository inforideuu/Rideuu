import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppStore, a as api, t as translate, s as store } from "./router-BpidCmwR.mjs";
import { d as Award, t as Flame, a9 as Users, j as Check, r as Copy, a4 as TicketPercent, w as LoaderCircle, G as Gift } from "../_libs/lucide-react.mjs";
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
const defaultPasses = [{
  id: "p1",
  name: "Marina Beach Auto Pass",
  desc: "5 auto rides up to 5km within Mylapore/Adyar",
  price: 299,
  valid: "30 days"
}, {
  id: "p2",
  name: "Chennai Central Commuter",
  desc: "Flat 20% off all bike rides from central railway hubs",
  price: 99,
  valid: "15 days"
}];
function Offers() {
  const {
    language,
    theme,
    wallet
  } = useAppStore();
  const [copiedCode, setCopiedCode] = reactExports.useState(null);
  const [purchasingPass, setPurchasingPass] = reactExports.useState(null);
  const [purchaseSuccess, setPurchaseSuccess] = reactExports.useState(false);
  const [coupons, setCoupons] = reactExports.useState([]);
  const [subPasses, setSubPasses] = reactExports.useState([]);
  reactExports.useEffect(() => {
    api.getCoupons().then((res) => {
      if (res && Array.isArray(res)) {
        const mapped = res.map((c) => ({
          code: c.code,
          title: c.code + " Coupon Code",
          desc: c.discount_type === "percentage" ? `Get ${c.value}% discount on your rides` : `Get flat ₹${c.value} off on your rides`,
          cat: c.active ? "Active" : "Expired"
        }));
        setCoupons(mapped);
      } else {
        setCoupons([{
          code: "CHENNAI50",
          title: "Pongal Special: 50% Off",
          desc: "Up to ₹75 off auto & bike rides",
          cat: "Festival"
        }, {
          code: "RAINY20",
          title: "Monsoon Emergency flat 20% Off",
          desc: "Save flat 20% on waterlogged routes",
          cat: "Weather"
        }, {
          code: "WOMEN10",
          title: "Women Safe Ride promo",
          desc: "Extra 10% off when Safety Mode is on",
          cat: "Security"
        }]);
      }
    });
    api.getSetting("subscription_passes").then((res) => {
      if (res && Array.isArray(res)) {
        setSubPasses(res);
      } else {
        setSubPasses(defaultPasses);
      }
    });
  }, []);
  const t = (key) => translate(key, language);
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    store.addNotification({
      cat: "offers",
      title: "Promo Code Copied",
      tamilTitle: "சலுகைக் குறியீடு நகலெடுக்கப்பட்டது",
      body: `Use code ${code} during ride checkout for discount.`,
      tamilBody: `தள்ளுபடி பெற சவாரியின் போது ${code} குறியீட்டைப் பயன்படுத்தவும்.`
    });
    setTimeout(() => {
      setCopiedCode(null);
    }, 2e3);
  };
  const handleBuyPass = async (id, price, name) => {
    if (wallet.balance < price) {
      alert("Insufficient Namma Cash balance! Please recharge your wallet first.");
      return;
    }
    setPurchasingPass(id);
    try {
      const token = store.getState().token;
      const email = store.getState().profile.email;
      const phone = store.getState().profile.phone;
      const userName = store.getState().profile.name;
      let dbUser = null;
      if (email) {
        dbUser = await api.getUserByEmail(email, "customer", userName, phone);
      }
      if (dbUser) {
        const nextBalance = Math.max(0, dbUser.wallet_balance - price);
        await api.updateUser(dbUser.id, {
          wallet_balance: nextBalance
        }, token || void 0);
        await api.createTransaction({
          user: dbUser.id,
          title: `Purchased: ${name}`,
          amount: `-₹${price}.00`,
          date: "Today · " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en", {
            hour: "numeric",
            minute: "2-digit"
          }),
          positive: false,
          status: "paid"
        });
      }
    } catch (err) {
      console.warn("Failed syncing subscription pass purchase to backend database:", err);
    }
    setPurchasingPass(null);
    setPurchaseSuccess(true);
    store.update((s) => {
      s.wallet.balance = Math.max(0, s.wallet.balance - price);
      s.wallet.hasSubscribedPass = true;
      s.wallet.passType = name;
      s.transactions.unshift({
        id: "txn_" + Date.now(),
        title: `Purchased: ${name}`,
        tamilTitle: `சந்தா வாங்கப்பட்டது: ${name}`,
        date: "Just now",
        amount: price,
        type: "out"
      });
    });
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 2e3);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-24 text-foreground transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "bg-secondary px-5 pt-12 pb-6 text-secondary-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-bold uppercase tracking-widest text-primary", children: t("Save more") || "Save more" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-1 text-xl font-extrabold tracking-tight", children: t("Offers & coupons") || "Offers & coupons" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checkered-sm h-1.5 w-full" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3.5 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 pl-0.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "size-4.5 text-primary" }),
          " Weekly Ride Streak"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black text-primary flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "size-3 animate-pulse" }),
          " STREAK ACTIVE"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-muted-foreground leading-normal", children: [
        "Take 5 rides this week to earn an instant ₹50 cashback in Namma Cash. ",
        /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { children: [
          wallet.rideStreak || 0,
          "/5 completed"
        ] }),
        "."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-[9px] text-muted-foreground font-bold", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            wallet.rideStreak || 0,
            " ",
            (wallet.rideStreak || 0) === 1 ? "Ride" : "Rides",
            " taken"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            Math.max(0, 5 - (wallet.rideStreak || 0)),
            " remaining"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full rounded-full bg-muted overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-primary rounded-full transition-all duration-300", style: {
          width: `${Math.min(100, (wallet.rideStreak || 0) / 5 * 100)}%`
        } }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] text-primary/80 font-bold text-center", children: (wallet.rideStreak || 0) >= 5 ? "✓ Congratulations! You've completed your weekly ride streak and earned your cashback!" : `✓ You're just ${Math.max(0, 5 - (wallet.rideStreak || 0))} ${Math.max(0, 5 - (wallet.rideStreak || 0)) === 1 ? "ride" : "rides"} away from Pongal bonus cashback!` })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-4 pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-6 -top-6 size-28 rounded-full bg-secondary/15" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "size-6 shrink-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-black tracking-tight", children: "Refer & Earn ₹50 Credits" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] opacity-90 leading-normal mt-0.5", children: "Invite friends. Once they take their first auto/bike ride, both of you credit ₹50 back." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-4 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-lg bg-secondary px-3 py-2 text-xs font-black tracking-widest text-secondary-foreground border border-primary/20", children: "ADHI42" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleCopyCode("ADHI42"), className: "inline-flex items-center gap-1 rounded-full bg-secondary-foreground/15 px-3 py-2 text-[10px] font-black text-primary-foreground hover:bg-secondary-foreground/25 active:scale-95 transition", children: copiedCode === "ADHI42" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Copied! ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3 text-emerald-400", strokeWidth: 3 })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Copy Code ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-3" })
        ] }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-4 pt-5 text-left space-y-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-black text-muted-foreground uppercase tracking-widest pl-1", children: "Subscription Ride Passes" }),
      wallet.hasSubscribedPass && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs font-bold text-emerald-600 animate-scale-in flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4 shrink-0 text-emerald-500", strokeWidth: 2.5 }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Active Pass: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: wallet.passType }),
          " enabled! enjoy discounted rides."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2.5", children: subPasses.map((pass) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xs font-extrabold flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TicketPercent, { className: "size-4 text-primary" }),
            " ",
            pass.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black text-primary", children: [
            "₹",
            pass.price
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground leading-normal", children: pass.desc }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pt-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] text-muted-foreground font-bold", children: [
            "Validity: ",
            pass.valid
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleBuyPass(pass.id, pass.price, pass.name), disabled: wallet.hasSubscribedPass && wallet.passType === pass.name, className: "rounded-lg bg-secondary px-3 py-1.5 text-[10px] font-black text-secondary-foreground shadow active:scale-95 transition flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none", children: purchasingPass === pass.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-3.5 animate-spin" }) : wallet.hasSubscribedPass && wallet.passType === pass.name ? "Activated" : "Buy Pass →" })
        ] })
      ] }, pass.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "px-4 pt-5 text-left space-y-2.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xs font-black text-muted-foreground uppercase tracking-widest pl-1", children: "Coupons For You" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-2", children: coupons.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Gift, { className: "size-4.5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-extrabold flex items-center gap-1.5", children: [
            c.title,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-muted px-1.5 py-0.5 text-[7px] font-black text-muted-foreground uppercase", children: c.cat })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground leading-normal mt-0.5", children: c.desc })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleCopyCode(c.code), className: "shrink-0 rounded-lg border border-dashed border-primary bg-primary/5 px-2.5 py-1.5 text-[10px] font-black text-primary flex items-center gap-1", children: copiedCode === c.code ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Copied ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3 text-emerald-500 animate-scale-in", strokeWidth: 3.5 })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          c.code,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-3" })
        ] }) })
      ] }, c.code)) })
    ] }),
    purchaseSuccess && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center space-y-4 animate-scale-in font-semibold text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-14 mx-auto place-items-center rounded-full bg-emerald-500 text-white shadow shadow-emerald-500/20 animate-bounce", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-7", strokeWidth: 3.5 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-extrabold text-emerald-600", children: "Subscription Activated!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-muted-foreground mt-1", children: "Pass successfully purchased. Enjoy special discounted rates immediately." })
      ] })
    ] }) })
  ] });
}
export {
  Offers as component
};
