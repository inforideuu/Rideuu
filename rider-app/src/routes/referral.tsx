import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { Share2, Users, Trophy, Wallet, UserCheck, ArrowRight, Sparkles, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useRider } from "../context/RiderContext";
import { api } from "../lib/api";

export const Route = createFileRoute("/referral")({
  component: ReferralPage,
});

function ReferralPage() {
  const { referralCode, referralsList, referralEarnings, t, language } = useRider();
  const [copied, setCopied] = useState(false);
  const [referralInput, setReferralInput] = useState("");
  const [claimStatus, setClaimStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    try {
      navigator.clipboard.writeText(`Join me as a driver on Rideuu! Use referral code: ${referralCode}`);
    } catch (e) { }
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClaimReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!referralInput.trim()) return;
    setLoading(true);
    setClaimStatus({ type: "", message: "" });
    try {
      const res = await api.claimReferral(referralInput.trim());
      if (res && res.success) {
        setClaimStatus({ type: "success", message: res.message || "Referral code claimed successfully!" });
        setReferralInput("");
      } else {
        setClaimStatus({ type: "error", message: res?.error || "Invalid referral code or code already claimed." });
      }
    } catch (err: any) {
      setClaimStatus({ type: "error", message: err.message || "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileShell>
      <PageHeader subtitle={t("refer_title").toUpperCase()} title={t("invite_earn")} />

      <div className="px-5 space-y-5 pb-8">

        {/* Earnings Card */}
        <div className="rounded-3xl bg-primary text-primary-foreground p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none" />

          <p className="text-[10px] uppercase font-extrabold tracking-widest opacity-80">Referral Wallet Balance</p>
          <div className="mt-1.5 text-4xl font-black tracking-tight">₹{referralEarnings.toLocaleString()}</div>
          <p className="text-[10px] opacity-80 mt-1.5 font-semibold">Earn ₹300 for every active auto/bike driver you sign up in Chennai.</p>
          <div className="checker-stripe absolute -bottom-2 inset-x-0 h-3.5 opacity-30" />
        </div>

        {/* Claim Referral Code Block */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <Sparkles className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
            <span className="font-black text-xs uppercase tracking-wider text-foreground">Claim Referral Code</span>
          </div>

          <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mb-4">
            Were you referred by another driver? Enter their referral code here to claim your sign-up bonus!
          </p>

          <form onSubmit={handleClaimReferral} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. NAMMA4421"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                className="flex-1 bg-secondary border border-border rounded-xl px-4 py-2 text-xs font-bold outline-none focus:border-primary uppercase"
              />
              <button
                type="submit"
                disabled={loading || !referralInput.trim()}
                className="px-4 py-2 bg-primary text-white hover:bg-primary/95 disabled:opacity-50 rounded-xl text-xs font-black transition active:scale-95 flex items-center gap-1 shrink-0"
              >
                {loading ? "Claiming..." : <>Claim <ArrowRight className="size-3" /></>}
              </button>
            </div>
            {claimStatus.type && (
              <div className={`text-[10px] font-bold p-2.5 rounded-xl border ${
                claimStatus.type === "success" 
                  ? "bg-success/10 border-success/20 text-success" 
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              }`}>
                {claimStatus.message}
              </div>
            )}
          </form>
        </div>

        {/* Custom Invite Code Share Block */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <Share2 className="h-4.5 w-4.5 text-primary animate-pulse" />
            <span className="font-black text-xs uppercase tracking-wider text-foreground">Share Invite Link</span>
          </div>

          <p className="text-[10px] text-muted-foreground font-semibold leading-relaxed mb-4">
            Share this link via WhatsApp, SMS, or Telegram. Once they finish 5 rides, you both get ₹300!
          </p>

          <div className="bg-secondary rounded-2xl p-3 border border-border flex items-center justify-between gap-3">
            <span className="text-xs font-black text-foreground truncate select-all">{referralCode}</span>
            <button
              onClick={handleCopy}
              className={`h-9 px-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${copied
                  ? "bg-success text-white border border-success"
                  : "bg-primary text-white hover:bg-primary/95"
                }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>
        </div>

        {/* Signed Up referrals tracker list */}
        <div>
          <h3 className="mb-3 font-black text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-primary" />
            {t("referral_status")} ({referralsList.length})
          </h3>

          <div className="space-y-2.5">
            {referralsList.map((refPhone, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-2xl bg-card border border-border p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                    <UserCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-foreground block">{refPhone}</span>
                    <span className="text-[9px] text-success font-bold uppercase mt-0.5">5 Rides completed</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-black text-sm text-foreground">+₹300.00</div>
                  <div className="text-[9px] text-muted-foreground font-bold uppercase mt-0.5">Credited</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Referral Leaderboard Planning mockup */}
        <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-5 w-5 text-yellow-400" />
            <h3 className="font-black text-sm uppercase tracking-wider text-white">
              {language === "ta" ? "பரிந்துரை லீடர்போர்டு" : "Referral Leaderboard"}
            </h3>
          </div>

          <div className="space-y-2 text-xs font-semibold mt-4">
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span>1. Selvam K (Tambaram)</span>
              <span className="text-primary font-black">42 Signups</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span>2. Murugan A (Adyar)</span>
              <span className="text-primary font-black">38 Signups</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span>3. Raja Kumar (You)</span>
              <span className="text-primary font-black">{referralsList.length} Signups</span>
            </div>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
