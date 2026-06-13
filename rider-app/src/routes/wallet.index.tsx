import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { ArrowDownToLine, ArrowUpRight, Banknote, ShieldAlert, CheckCircle2, ChevronRight, Landmark, ArrowUpLeft } from "lucide-react";
import { useRider } from "../context/RiderContext";

export const Route = createFileRoute("/wallet/")({
  component: Wallet,
});

function Wallet() {
  const {
    walletBalance, incentiveBalance, bonusBalance,
    transactions, payoutStatus, setPayoutStatus,
    t, language
  } = useRider();

  const handleRetryPayout = () => {
    setPayoutStatus("success");
  };

  const handleDownloadStatement = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "/ridu_logo.png";

    const renderCanvas = (useLogo: boolean) => {
      // Calculate layout
      const itemHeight = 70;
      const headerHeight = 180;
      const footerHeight = 80;
      const txToShow = transactions.slice(0, 20); // Limit to 20 transactions for layout sanity
      const canvasWidth = 500;
      const canvasHeight = headerHeight + (txToShow.length * itemHeight) + footerHeight;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Draw background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw header bg accent
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvasWidth, headerHeight - 10);

      if (useLogo) {
        // Draw Logo
        const logoWidth = 90;
        const logoHeight = 90 * (logoImg.naturalHeight / logoImg.naturalWidth || 1);
        ctx.drawImage(logoImg, 24, 24, logoWidth, logoHeight);
      } else {
        // Draw fallback title
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillText("Ridu", 24, 60);
      }

      // Draw title block
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px Inter, sans-serif";
      ctx.fillText("Wallet Statement", 240, 50);

      ctx.fillStyle = "#64748b";
      ctx.font = "medium 11px Inter, sans-serif";
      ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 240, 70);

      // Draw current balance
      ctx.fillStyle = "#334155";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.fillText("Available Balance", 240, 100);

      ctx.fillStyle = "#0f172a";
      ctx.font = "900 20px Inter, sans-serif";
      ctx.fillText(`₹${walletBalance.toLocaleString()}`, 240, 125);

      // Draw horizontal line separator
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, headerHeight - 10);
      ctx.lineTo(canvasWidth - 24, headerHeight - 10);
      ctx.stroke();

      // Draw Transaction List
      let currentY = headerHeight + 15;
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.fillText("TRANSACTION HISTORY", 24, currentY);

      currentY += 25;

      txToShow.forEach((tx) => {
        // Draw item title
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 12px Inter, sans-serif";
        const titleText = language === "ta" ? t(tx.titleKey) : tx.titleEn;
        ctx.fillText(titleText, 24, currentY);

        // Draw item date
        ctx.fillStyle = "#64748b";
        ctx.font = "medium 10px Inter, sans-serif";
        ctx.fillText(tx.date, 24, currentY + 18);

        // Draw amount
        ctx.fillStyle = tx.positive ? "#10b981" : "#0f172a";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(tx.amount, canvasWidth - 24, currentY + 12);
        ctx.textAlign = "left"; // reset alignment

        // Draw separator
        ctx.strokeStyle = "#f1f5f9";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(24, currentY + 30);
        ctx.lineTo(canvasWidth - 24, currentY + 30);
        ctx.stroke();

        currentY += itemHeight;
      });

      // Draw Footer
      ctx.fillStyle = "#94a3b8";
      ctx.font = "medium 10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Thank you for riding with us!", canvasWidth / 2, canvasHeight - 35);
      ctx.fillText("This is an electronically generated statement.", canvasWidth / 2, canvasHeight - 20);

      // Trigger download
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.setAttribute("download", `statement_${new Date().toISOString().split('T')[0]}.png`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Failed downloading canvas as image", err);
      }
    };

    logoImg.onload = () => {
      renderCanvas(true);
    };

    logoImg.onerror = () => {
      renderCanvas(false);
    };
  };

  return (
    <MobileShell>
      <PageHeader subtitle={t("app_name").toUpperCase()} title={language === "ta" ? "வருவாய் வாலட்" : "Rider Wallet"} />

      <div className="px-5 space-y-4">
        {/* Failed Payout Alerts Section */}
        {payoutStatus === "failed" && (
          <div className="rounded-2xl bg-destructive/15 border border-destructive/25 p-4 text-destructive slide-up">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5 animate-bounce" />
              <div className="flex-1">
                <div className="font-black text-xs uppercase tracking-wide">
                  {t("failed_payout")}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Settlement on HDFC Bank declined by admin due to name mismatch on DL.
                </p>
                <button
                  onClick={handleRetryPayout}
                  className="mt-3 py-1.5 px-4 bg-primary text-primary-foreground font-black text-[10px] rounded-full active:scale-95 transition shadow"
                >
                  Retry Instant UPI Payout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Available Balance Premium Hero Card */}
        <div className="rounded-3xl bg-primary text-primary-foreground p-6 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <p className="text-[10px] uppercase font-extrabold tracking-widest opacity-80">{t("available_balance")}</p>
          <div className="mt-1.5 text-4xl font-black tracking-tight">₹{walletBalance.toLocaleString()}</div>
          <p className="text-[10px] opacity-80 mt-1.5 font-semibold">Next auto-payout settlement: Monday 9:00 am</p>

          <div className="mt-5 grid grid-cols-2 gap-3 z-10 relative">
            <Link
              to="/wallet/withdraw"
              className="rounded-full bg-white text-primary font-black py-3 text-center text-xs inline-flex items-center justify-center gap-1.5 active:scale-95 transition shadow hover:bg-slate-50"
            >
              <ArrowDownToLine className="h-4 w-4" /> {t("withdraw")}
            </Link>
            <button
              onClick={handleDownloadStatement}
              className="rounded-full bg-white/15 backdrop-blur border border-white/10 text-white font-black py-3 text-xs inline-flex items-center justify-center gap-1.5 active:scale-95 transition hover:bg-white/20"
            >
              <Banknote className="h-4 w-4" /> {t("statement")}
            </button>
          </div>
          <div className="checker-stripe absolute -bottom-2 inset-x-0 h-3.5 opacity-30" />
        </div>

        {/* Sub Wallets Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card border border-border p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
              {t("incentive_wallet")}
            </span>
            <div className="text-lg font-black text-foreground mt-1">₹{incentiveBalance}</div>
          </div>
          <div className="rounded-2xl bg-card border border-border p-4 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider">
              {t("bonus_wallet")}
            </span>
            <div className="text-lg font-black text-foreground mt-1">₹{bonusBalance}</div>
          </div>
        </div>

        {/* Bank UPI Linking Settings */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
            <Landmark className="h-4.5 w-4.5 text-primary" />
            <span className="font-black text-xs uppercase tracking-wider text-foreground">Linked Accounts</span>
            <span className="text-[9px] font-black uppercase text-success bg-success/10 px-2 py-0.5 rounded">Verified</span>
          </div>

          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">{t("bank_linked")}</span>
              <span className="text-foreground">HDFC Bank ****4521</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">{t("upi_linked")}</span>
              <span className="text-foreground">raja.kumar@hdfc</span>
            </div>
          </div>
        </div>

        {/* Transactions list */}
        <div className="border-t border-border pt-4 pb-8">
          <h3 className="mb-3 font-black text-sm uppercase tracking-wider text-muted-foreground">
            {t("transactions")}
          </h3>
          <div className="space-y-2.5">
            {transactions.map((x, i) => (
              <div key={i} className="flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 shadow-sm hover:border-primary/20 transition">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  x.positive
                    ? "bg-success/10 text-success"
                    : "bg-accent text-primary"
                }`}>
                  {x.positive ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowUpLeft className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground tracking-tight truncate">
                    {language === "ta" ? t(x.titleKey) : x.titleEn}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">{x.date}</div>
                </div>
                <div className={`font-black text-sm text-right shrink-0 ${
                  x.positive ? "text-success" : "text-foreground"
                }`}>
                  {x.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
