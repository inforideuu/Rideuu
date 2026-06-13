import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft, ArrowUpRight, Plus, Wallet as WalletIcon,
  CreditCard, ShieldCheck, Zap, Sparkles, Check, Loader2, Users, ArrowRight, Trash2
} from "lucide-react";
import { useState } from "react";
import { useAppStore, store, translate } from "@/lib/store";

export const Route = createFileRoute("/app/wallet")({
  head: () => ({ meta: [{ title: "Wallet · Rideuu" }] }),
  component: Wallet,
});

function Wallet() {
  const { language, theme, wallet, transactions } = useAppStore();

  // local simulation states
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addAmount, setAddAmount] = useState("200");
  const [checkoutStep, setCheckoutStep] = useState<"amount" | "gateway" | "processing" | "success">("amount");

  // payment choices
  const [paymentType, setPaymentType] = useState<"upi" | "card">("upi");
  const [upiId, setUpiId] = useState("adhithya@okaxis");
  const [cardNumber, setCardNumber] = useState("4321 5678 9012 3456");
  const [autoDeduct, setAutoDeduct] = useState(true);

  // Split payment calculator
  const [splitFare, setSplitFare] = useState("82");
  const [splitCount, setSplitCount] = useState(3);
  const [splitCalculated, setSplitCalculated] = useState<{ perPerson: number } | null>(null);
  const [showSplitLinkSent, setShowSplitLinkSent] = useState(false);

  const t = (key: string) => translate(key, language);

  const handleLaunchRazorpay = () => {
    setCheckoutStep("gateway");
  };

  const handleSimulatePayment = () => {
    setCheckoutStep("processing");

    // Simulate Razorpay secure payment gateway gateway gateway verification (3 seconds)
    setTimeout(() => {
      setCheckoutStep("success");

      // Update global store wallet credits directly
      store.walletRecharge(Number(addAmount));

      // close gateway after 2 seconds
      setTimeout(() => {
        setShowAddMoney(false);
        setCheckoutStep("amount");
      }, 2000);
    }, 2500);
  };

  const handleCalculateSplit = () => {
    const fare = Number(splitFare);
    if (!fare || splitCount <= 1) return;
    setSplitCalculated({
      perPerson: Math.round((fare / splitCount) * 100) / 100
    });
  };

  const handleRequestSplitLink = () => {
    setShowSplitLinkSent(true);
    setTimeout(() => {
      setShowSplitLinkSent(false);
      setSplitCalculated(null);
      setSplitFare("82");
    }, 3000);
  };

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">

      {/* Header */}
      <header className="bg-secondary px-5 pt-12 pb-6 text-secondary-foreground">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("Wallet")}</p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight">{t("Namma Cash")}</h1>
      </header>
      <div className="checkered-sm h-1.5 w-full" />

      {/* Main Wallet balance Card */}
      <section className="px-4 pt-4">
        <div className="relative overflow-hidden rounded-3xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/20">
          <div className="absolute right-0 top-0 h-full w-24 checkered-sm opacity-25" />

          <div className="relative flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
            <WalletIcon className="size-4" /> {t("Available balance")}
          </div>

          <div className="relative mt-2 text-4xl font-extrabold tracking-tight">
            ₹{wallet.balance.toFixed(2)}
          </div>

          {/* Rewards metric overlay */}
          <div className="relative mt-2 flex items-center gap-1.5 text-[10px] font-semibold opacity-90">
            <Sparkles className="size-3.5 text-secondary animate-pulse" />
            <span>Loyalty Tier: <strong>Platinum (480 points)</strong></span>
          </div>

          <button
            onClick={() => setShowAddMoney(true)}
            className="relative mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-5 py-3 text-xs font-black text-secondary-foreground shadow hover:brightness-105 active:scale-95 transition"
          >
            <Plus className="size-4" /> {t("Add money")}
          </button>
        </div>
      </section>

      {/* Auto deduction settings */}
      <section className="mt-5 px-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-semibold flex items-center justify-between text-left">
          <div>
            <h3 className="font-extrabold">Auto-Deduct Ride Fares</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Deduct trip prices automatically from Namma Cash on dropoff</p>
          </div>
          <button
            onClick={() => setAutoDeduct(!autoDeduct)}
            className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${autoDeduct ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`inline-block size-4 transform rounded-full bg-background shadow transition ${autoDeduct ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>
      </section>

      {/* Split Payment Calculator Tool */}
      <section className="mt-5 px-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-left space-y-3">
          <h2 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 pl-1">
            <Users className="size-4 text-primary" /> Split Ride cost
          </h2>
          <p className="text-[10px] text-muted-foreground leading-normal">
            Planning a ride with friends? Calculate split proportions and share instant billing requests instantly.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs font-bold">
            <label className="block">
              <span className="text-[9px] text-muted-foreground block mb-1">Total Cost (₹)</span>
              <input
                type="number"
                value={splitFare}
                onChange={(e) => setSplitFare(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-primary"
              />
            </label>
            <label className="block">
              <span className="text-[9px] text-muted-foreground block mb-1">Number of People</span>
              <select
                value={splitCount}
                onChange={(e) => setSplitCount(Number(e.target.value))}
                className="w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-primary font-bold"
              >
                {[2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} riders</option>
                ))}
              </select>
            </label>
          </div>

          {splitCalculated && (
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center text-xs font-semibold animate-scale-in space-y-2">
              <div>Split Share: <strong className="text-sm font-black text-primary">₹{splitCalculated.perPerson}</strong> per rider</div>
              <button
                onClick={handleRequestSplitLink}
                className="w-full rounded-lg bg-secondary py-2 text-[10px] font-black text-secondary-foreground flex items-center justify-center gap-1.5"
              >
                <Plus className="size-3" /> Broadcast UPI payment requests
              </button>
            </div>
          )}

          {showSplitLinkSent && (
            <div className="text-[10px] text-emerald-600 font-extrabold text-center animate-pulse">
              ✓ Broadcast requests dispatched successfully!
            </div>
          )}

          {!splitCalculated && (
            <button
              onClick={handleCalculateSplit}
              className="w-full rounded-xl bg-secondary py-3 text-xs font-extrabold text-secondary-foreground active:scale-[0.99] transition"
            >
              Calculate Splits
            </button>
          )}
        </div>
      </section>

      {/* Transaction log audits */}
      <section className="px-4 pt-6">
        <h2 className="mb-3 text-xs font-black text-muted-foreground uppercase tracking-widest pl-1">
          {t("Recent activity")}
        </h2>

        <ul className="space-y-2">
          {transactions.map((t, idx) => (
            <li key={t.id || idx} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${t.type === "in" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                {t.type === "in" ? <ArrowDownLeft className="size-4.5" /> : <ArrowUpRight className="size-4.5" />}
              </div>
              <div className="flex-1 text-left">
                <div className="text-xs font-extrabold">{language === "en" ? t.title : t.tamilTitle}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{t.date}</div>
              </div>
              <div className={`text-xs font-black shrink-0 ${t.type === "in" ? "text-emerald-600" : ""}`}>
                {t.type === "in" ? "+" : "-"}₹{Math.abs(t.amount)}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Razorpay Add Money overlay modal */}
      {showAddMoney && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl animate-scale-in text-xs font-semibold">

            {/* Step 1: Select Amount */}
            {checkoutStep === "amount" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-3">
                  <h2 className="text-sm font-extrabold">Recharge Wallet</h2>
                  <button onClick={() => setShowAddMoney(false)} className="font-bold text-muted-foreground hover:text-foreground">Cancel</button>
                </div>

                <label className="block text-left">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest pl-1 block mb-1">Enter Recharge Amount (₹)</span>
                  <div className="flex items-center gap-1.5 rounded-xl border border-border bg-background p-3.5 focus-within:border-primary">
                    <span className="text-sm font-black text-primary">₹</span>
                    <input
                      type="number"
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className="w-full bg-transparent text-sm font-extrabold outline-none"
                    />
                  </div>
                </label>

                {/* Preset quick buttons */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  {["100", "200", "500"].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAddAmount(preset)}
                      className={`rounded-lg border py-2 transition ${addAmount === preset ? "border-primary bg-primary/10 text-primary" : "border-border bg-card"}`}
                    >
                      +₹{preset}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleLaunchRazorpay}
                  disabled={!addAmount || Number(addAmount) <= 0}
                  className="w-full rounded-2xl bg-primary py-4 text-xs font-extrabold text-primary-foreground shadow shadow-primary/20 transition disabled:opacity-50"
                >
                  Proceed to Pay ₹{addAmount}
                </button>
              </div>
            )}

            {/* Step 2: Authentic looking Razorpay checkout portal overlay */}
            {checkoutStep === "gateway" && (
              <div className="space-y-4 text-left">
                {/* Razorpay Brand Header */}
                <div className="flex justify-between items-center bg-blue-600 -mx-6 -mt-6 p-4 rounded-t-3xl text-white">
                  <div>
                    <h3 className="text-sm font-black tracking-tight">Razorpay Checkout</h3>
                    <p className="text-[8px] opacity-80 tracking-wider">SECURE PAYMENTS GATEWAY</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] opacity-80 uppercase block">Amount</span>
                    <strong className="text-xs font-extrabold">₹{addAmount}.00</strong>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest pl-0.5">Select Payment Option</div>

                  {/* Selectors */}
                  <div className="grid grid-cols-2 gap-2 text-center font-bold text-[10px]">
                    <button
                      onClick={() => setPaymentType("upi")}
                      className={`rounded-lg border py-2 transition ${paymentType === "upi" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-border bg-card"}`}
                    >
                      UPI (GPay / PhonePe)
                    </button>
                    <button
                      onClick={() => setPaymentType("card")}
                      className={`rounded-lg border py-2 transition ${paymentType === "card" ? "border-blue-600 bg-blue-50 text-blue-600" : "border-border bg-card"}`}
                    >
                      Credit / Debit Card
                    </button>
                  </div>

                  {paymentType === "upi" ? (
                    <label className="block">
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest pl-0.5 block mb-1">Enter UPI VPA ID</span>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-blue-600"
                      />
                    </label>
                  ) : (
                    <label className="block">
                      <span className="text-[8px] text-muted-foreground uppercase tracking-widest pl-0.5 block mb-1">Card Credentials</span>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background p-3 outline-none focus:border-blue-600"
                      />
                    </label>
                  )}

                  <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground pl-0.5 font-bold">
                    <ShieldCheck className="size-3.5 text-blue-600" /> SECURE 256-BIT SSL ENCRYPTION
                  </div>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  className="w-full rounded-2xl bg-blue-600 py-4 text-xs font-extrabold text-white shadow shadow-blue-500/20 hover:bg-blue-700 transition"
                >
                  Pay via Razorpay Secure
                </button>
              </div>
            )}

            {/* Step 3: Gateway loader */}
            {checkoutStep === "processing" && (
              <div className="py-8 text-center space-y-4">
                <Loader2 className="size-14 mx-auto text-blue-600 animate-spin" />
                <div>
                  <h3 className="text-sm font-extrabold">Authorizing Gateway...</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">Please do not refresh. Razorpay is securing your UPI transaction.</p>
                </div>
              </div>
            )}

            {/* Step 4: Success confirmation */}
            {checkoutStep === "success" && (
              <div className="py-8 text-center space-y-4 animate-scale-in">
                <div className="grid size-14 mx-auto place-items-center rounded-full bg-emerald-500 text-white shadow shadow-emerald-500/20">
                  <Check className="size-7" strokeWidth={3.5} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-emerald-600">Recharge Successful!</h3>
                  <p className="text-[10px] text-muted-foreground mt-1">₹{addAmount}.00 successfully credited to Namma Cash balance.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}