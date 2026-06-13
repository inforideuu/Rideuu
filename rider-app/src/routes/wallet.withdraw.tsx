import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { useState, useMemo } from "react";
import { useRider } from "../context/RiderContext";
import { Landmark, ArrowLeft, ArrowDownToLine, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/wallet/withdraw")({
  component: Withdraw,
});

function Withdraw() {
  const nav = useNavigate();
  const { walletBalance, incentiveBalance, bonusBalance, withdrawFunds, transactions, t, language } = useRider();
  const [selectedWallet, setSelectedWallet] = useState<"wallet" | "incentive" | "bonus">("wallet");
  const [selectedAmount, setSelectedAmount] = useState<100 | 200 | 500 | null>(null);
  const [success, setSuccess] = useState(false);

  // Compute number of withdrawals today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const withdrawalsTodayCount = useMemo(() => {
    return transactions.filter(tx => 
      tx.titleEn.toLowerCase().includes("withdraw") && 
      (tx.date === todayDateStr || tx.date.toLowerCase().includes("today") || tx.date.toLowerCase().includes("now"))
    ).length;
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
        nav({ to: "/wallet" });
      }, 2000);
    }
  };

  return (
    <MobileShell showNav={false}>
      <PageHeader subtitle={t("withdraw").toUpperCase()} title={t("send_to_bank")} />
      
      <div className="px-5">
        {success ? (
          <div className="my-10 text-center py-8 px-6 bg-success/15 border border-success/20 rounded-3xl text-success slide-up shadow-sm">
            <CheckCircle2 className="h-14 w-14 mx-auto mb-4 animate-bounce fill-success/10" />
            <h4 className="font-black text-lg text-foreground mb-1">Transfer Complete</h4>
            <p className="text-xs text-muted-foreground leading-relaxed font-semibold">
              {t("withdraw_success")}
            </p>
          </div>
        ) : (
          <>
            {/* Beautiful Segmented Tab Selector */}
            <div className="flex bg-secondary border border-border/80 rounded-2xl p-1 mb-4">
              {(["wallet", "incentive", "bonus"] as const).map((w) => {
                const isSelected = selectedWallet === w;
                const label = w === "wallet" ? "Cash" : w === "incentive" ? "Incentive" : "Bonus";
                const bal = w === "wallet" ? walletBalance : w === "incentive" ? incentiveBalance : bonusBalance;
                return (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setSelectedWallet(w);
                      setSelectedAmount(null);
                    }}
                    className={`flex-1 text-center py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected 
                        ? "bg-card text-foreground shadow-sm font-black scale-[1.02]" 
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div>{label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">₹{bal.toLocaleString()}</div>
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl bg-card border border-border p-6 shadow-sm">
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
                {language === "ta" ? "கிடைக்கக்கூடிய இருப்பு" : `Available in ${selectedWallet === 'wallet' ? 'Cash' : selectedWallet === 'incentive' ? 'Incentive' : 'Bonus'} Wallet`}
              </p>
              <p className="text-3xl font-black text-foreground mt-1">₹{currentBalance.toLocaleString()}</p>

              {isBalanceTooLow ? (
                <div className="mt-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs leading-relaxed font-semibold">
                  ⚠️ Withdrawals are only allowed when your selected wallet balance is greater than ₹250.
                </div>
              ) : (
                <>
                  <label className="mt-6 block text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                    Select Withdrawal Amount
                  </label>
                  
                  {/* Select amount grid */}
                  <div className="mt-3 grid grid-cols-3 gap-2.5">
                    {([100, 200, 500] as const).map((v) => {
                      const active = selectedAmount === v;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setSelectedAmount(v)}
                          className={`rounded-2xl py-3 text-sm font-black transition-all ${
                            active
                              ? "bg-primary text-primary-foreground border-2 border-primary shadow-sm scale-102"
                              : "bg-secondary hover:bg-accent border border-border text-foreground"
                          }`}
                        >
                          ₹{v}
                        </button>
                      );
                    })}
                  </div>

                  {/* Transaction fee info block */}
                  <div className="mt-5 bg-secondary/60 border border-border rounded-2xl p-4 text-xs font-semibold space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Withdrawals Today:</span>
                      <span className="text-foreground">{withdrawalsTodayCount} times</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Admin Fee:</span>
                      <span className={fee > 0 ? "text-amber-600 font-bold" : "text-emerald-500 font-bold"}>
                        {fee > 0 ? `₹${fee} (from 2nd time onwards)` : "Free (First of the day)"}
                      </span>
                    </div>
                    {selectedAmount && (
                      <div className="flex justify-between border-t border-border/80 pt-2 font-black text-sm">
                        <span>Total Deduction:</span>
                        <span className="text-primary">₹{totalDeduction}</span>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Linked target HDFC details */}
              <div className="mt-5 rounded-2xl bg-secondary border border-border p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground uppercase tracking-wide">HDFC Bank linked</div>
                  <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">Instant transfer via UPI</div>
                </div>
              </div>
            </div>

            {/* Error notifications */}
            {selectedAmount && totalDeduction > currentBalance && (
              <div className="mt-4 text-[10px] text-primary font-black uppercase text-center animate-pulse">
                ✕ Total deduction (₹{totalDeduction}) exceeds available balance in the selected wallet.
              </div>
            )}

            {/* Confirm CTA */}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => nav({ to: "/wallet" })}
                className="px-5 py-4 rounded-full bg-secondary border border-border text-foreground font-bold text-xs active:scale-95 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isInvalid}
                className="flex-1 rounded-full bg-primary text-primary-foreground font-black py-4 disabled:opacity-50 active:scale-95 transition hover:bg-primary/95 text-xs shadow-md tracking-wider uppercase"
              >
                {t("confirm_withdrawal")}
              </button>
            </div>
          </>
        )}
      </div>
    </MobileShell>
  );
}
