import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { useState } from "react";
import { useRider } from "../context/RiderContext";
import { Landmark, ArrowLeft, ArrowDownToLine, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/wallet/withdraw")({
  component: Withdraw,
});

function Withdraw() {
  const nav = useNavigate();
  const { walletBalance, withdrawFunds, t, language } = useRider();
  const [amt, setAmt] = useState("");
  const [success, setSuccess] = useState(false);

  const parsedAmount = parseInt(amt) || 0;
  const isInvalid = parsedAmount <= 0 || parsedAmount > walletBalance;

  const handleConfirm = () => {
    if (isInvalid) return;
    const ok = withdrawFunds(parsedAmount);
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
            <div className="rounded-3xl bg-card border border-border p-6 shadow-sm">
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
                {language === "ta" ? "கிடைக்கக்கூடிய இருப்பு" : "Available to Transfer"}
              </p>
              <p className="text-3xl font-black text-foreground mt-1">₹{walletBalance.toLocaleString()}</p>

              <label className="mt-6 block text-[10px] font-extrabold text-muted-foreground tracking-widest uppercase">
                {t("amount")}
              </label>
              
              <div className="mt-2.5 flex items-baseline gap-2 border-b-2 border-primary pb-2 focus-within:border-primary">
                <span className="text-2xl font-black text-foreground">₹</span>
                <input
                  autoFocus
                  inputMode="numeric"
                  value={amt}
                  onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))}
                  placeholder="0"
                  className="flex-1 bg-transparent text-3xl font-black outline-none tracking-tight text-foreground"
                />
              </div>

              {/* Quick Select amounts grid */}
              <div className="mt-4 flex gap-2">
                {[500, 1000, 2000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmt(String(v))}
                    className="flex-1 rounded-full bg-secondary hover:bg-accent py-2 text-xs font-black tracking-tight border border-border transition active:scale-95 text-foreground"
                  >
                    ₹{v}
                  </button>
                ))}
              </div>

              {/* Linked target HDFC details */}
              <div className="mt-6 rounded-2xl bg-secondary border border-border p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Landmark className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground uppercase tracking-wide">HDFC Bank linked</div>
                  <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">Instant transfer via UPI · Free</div>
                </div>
              </div>
            </div>

            {/* Error notifications */}
            {parsedAmount > walletBalance && (
              <div className="mt-4 text-[10px] text-primary font-black uppercase text-center animate-pulse">
                ✕ Transfer amount exceeds available wallet balance.
              </div>
            )}

            {/* Confirm CTA */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => nav({ to: "/wallet" })}
                className="px-5 py-4 rounded-full bg-secondary border border-border text-foreground font-bold text-xs"
              >
                Cancel
              </button>
              <button
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
