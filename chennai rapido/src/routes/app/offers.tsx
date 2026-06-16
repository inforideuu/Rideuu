import { createFileRoute } from "@tanstack/react-router";
import {
  Copy, Gift, Sparkles, Users, Award, TicketPercent, Check,
  MapPin, Flame, Loader2, ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAppStore, store, translate } from "@/lib/store";
import { api } from "../../lib/api";

export const Route = createFileRoute("/app/offers")({
  head: () => ({ meta: [{ title: "Offers · Rideuu" }] }),
  component: Offers,
});

const defaultPasses = [
  { id: "p1", name: "Marina Beach Auto Pass", desc: "5 auto rides up to 5km within Mylapore/Adyar", price: 299, valid: "30 days" },
  { id: "p2", name: "Chennai Central Commuter", desc: "Flat 20% off all bike rides from central railway hubs", price: 99, valid: "15 days" },
];

function Offers() {
  const { language, theme, wallet } = useAppStore();

  // local simulation states
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [purchasingPass, setPurchasingPass] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [subPasses, setSubPasses] = useState<any[]>([]);

  useEffect(() => {
    api.getCoupons().then((res) => {
      if (res && Array.isArray(res)) {
        const mapped = res.map((c: any) => ({
          code: c.code,
          title: c.code + " Coupon Code",
          desc: c.discount_type === "percentage" ? `Get ${c.value}% discount on your rides` : `Get flat ₹${c.value} off on your rides`,
          cat: c.active ? "Active" : "Expired"
        }));
        setCoupons(mapped);
      } else {
        setCoupons([
          { code: "CHENNAI50", title: "Pongal Special: 50% Off", desc: "Up to ₹75 off auto & bike rides", cat: "Festival" },
          { code: "RAINY20", title: "Monsoon Emergency flat 20% Off", desc: "Save flat 20% on waterlogged routes", cat: "Weather" },
          { code: "WOMEN10", title: "Women Safe Ride promo", desc: "Extra 10% off when Safety Mode is on", cat: "Security" },
        ]);
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

  const t = (key: string) => translate(key, language);

  const handleCopyCode = (code: string) => {
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
    }, 2000);
  };

  const handleBuyPass = async (id: string, price: number, name: string) => {
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
        await api.updateUser(dbUser.id, { wallet_balance: nextBalance }, token || undefined);
        await api.createTransaction({
          user: dbUser.id,
          title: `Purchased: ${name}`,
          amount: `-₹${price}.00`,
          date: "Today · " + new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
          positive: false,
          status: "paid"
        });
      }
    } catch (err) {
      console.warn("Failed syncing subscription pass purchase to backend database:", err);
    }

    setPurchasingPass(null);
    setPurchaseSuccess(true);

    // Deduct balance and update subscription in store
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

    // Clear success overlay in 2 seconds
    setTimeout(() => {
      setPurchaseSuccess(false);
    }, 2000);
  };

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">

      {/* Header */}
      <header className="bg-secondary px-5 pt-12 pb-6 text-secondary-foreground">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("Save more") || "Save more"}</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight">{t("Offers & coupons") || "Offers & coupons"}</h1>
      </header>
      <div className="checkered-sm h-1.5 w-full" />

      {/* 1. Gamified Ride Streak Rewards Card */}
      <section className="px-4 pt-4">
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3.5 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 pl-0.5">
              <Award className="size-4.5 text-primary" /> Weekly Ride Streak
            </h2>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-black text-primary flex items-center gap-1">
              <Flame className="size-3 animate-pulse" /> STREAK ACTIVE
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground leading-normal">
            Take 5 rides this week to earn an instant ₹50 cashback in Namma Cash. <strong>{wallet.rideStreak || 0}/5 completed</strong>.
          </p>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-muted-foreground font-bold">
              <span>{wallet.rideStreak || 0} { (wallet.rideStreak || 0) === 1 ? "Ride" : "Rides" } taken</span>
              <span>{Math.max(0, 5 - (wallet.rideStreak || 0))} remaining</span>
            </div>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${Math.min(100, ((wallet.rideStreak || 0) / 5) * 100)}%` }} />
            </div>
          </div>

          <div className="text-[9px] text-primary/80 font-bold text-center">
            { (wallet.rideStreak || 0) >= 5 ? (
              "✓ Congratulations! You've completed your weekly ride streak and earned your cashback!"
            ) : (
              `✓ You're just ${Math.max(0, 5 - (wallet.rideStreak || 0))} ${Math.max(0, 5 - (wallet.rideStreak || 0)) === 1 ? "ride" : "rides"} away from Pongal bonus cashback!`
            )}
          </div>
        </div>
      </section>

      {/* 2. Referral Portals */}
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-sm text-left">
          <div className="absolute -right-6 -top-6 size-28 rounded-full bg-secondary/15" />
          <div className="relative flex items-center gap-3">
            <Users className="size-6 shrink-0" />
            <div className="flex-1">
              <h2 className="text-sm font-black tracking-tight">Refer & Earn ₹50 Credits</h2>
              <p className="text-[10px] opacity-90 leading-normal mt-0.5">
                Invite friends. Once they take their first auto/bike ride, both of you credit ₹50 back.
              </p>
            </div>
          </div>

          <div className="relative mt-4 flex items-center gap-2">
            <span className="rounded-lg bg-secondary px-3 py-2 text-xs font-black tracking-widest text-secondary-foreground border border-primary/20">
              ADHI42
            </span>
            <button
              onClick={() => handleCopyCode("ADHI42")}
              className="inline-flex items-center gap-1 rounded-full bg-secondary-foreground/15 px-3 py-2 text-[10px] font-black text-primary-foreground hover:bg-secondary-foreground/25 active:scale-95 transition"
            >
              {copiedCode === "ADHI42" ? (
                <>Copied! <Check className="size-3 text-emerald-400" strokeWidth={3} /></>
              ) : (
                <>Copy Code <Copy className="size-3" /></>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 3. Subscription Commuter Passes Checkout */}
      <section className="px-4 pt-5 text-left space-y-2.5">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Subscription Ride Passes</h2>

        {wallet.hasSubscribedPass && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs font-bold text-emerald-600 animate-scale-in flex items-center gap-2">
            <Check className="size-4 shrink-0 text-emerald-500" strokeWidth={2.5} />
            <span>Active Pass: <strong>{wallet.passType}</strong> enabled! enjoy discounted rides.</span>
          </div>
        )}

        <div className="grid gap-2.5">
          {subPasses.map((pass) => (
            <div key={pass.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="text-xs font-extrabold flex items-center gap-1.5"><TicketPercent className="size-4 text-primary" /> {pass.name}</h3>
                <span className="text-xs font-black text-primary">₹{pass.price}</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">{pass.desc}</p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[9px] text-muted-foreground font-bold">Validity: {pass.valid}</span>

                <button
                  onClick={() => handleBuyPass(pass.id, pass.price, pass.name)}
                  disabled={wallet.hasSubscribedPass && wallet.passType === pass.name}
                  className="rounded-lg bg-secondary px-3 py-1.5 text-[10px] font-black text-secondary-foreground shadow active:scale-95 transition flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {purchasingPass === pass.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : wallet.hasSubscribedPass && wallet.passType === pass.name ? (
                    "Activated"
                  ) : (
                    "Buy Pass →"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Active Coupon Codes list */}
      <section className="px-4 pt-5 text-left space-y-2.5">
        <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">Coupons For You</h2>

        <div className="grid gap-2">
          {coupons.map((c) => (
            <div key={c.code} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Gift className="size-4.5" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-extrabold flex items-center gap-1.5">
                  {c.title}
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[7px] font-black text-muted-foreground uppercase">{c.cat}</span>
                </div>
                <div className="text-[10px] text-muted-foreground leading-normal mt-0.5">{c.desc}</div>
              </div>
              <button
                onClick={() => handleCopyCode(c.code)}
                className="shrink-0 rounded-lg border border-dashed border-primary bg-primary/5 px-2.5 py-1.5 text-[10px] font-black text-primary flex items-center gap-1"
              >
                {copiedCode === c.code ? (
                  <>Copied <Check className="size-3 text-emerald-500 animate-scale-in" strokeWidth={3.5} /></>
                ) : (
                  <>{c.code} <Copy className="size-3" /></>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Subscription Success popup overlay */}
      {purchaseSuccess && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center space-y-4 animate-scale-in font-semibold text-xs">
            <div className="grid size-14 mx-auto place-items-center rounded-full bg-emerald-500 text-white shadow shadow-emerald-500/20 animate-bounce">
              <Check className="size-7" strokeWidth={3.5} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-emerald-600">Subscription Activated!</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Pass successfully purchased. Enjoy special discounted rates immediately.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}