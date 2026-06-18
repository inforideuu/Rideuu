import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { U as ShieldAlert, A as ArrowDownToLine, B as Banknote, L as Landmark, d as ArrowUpRight, c as ArrowUpLeft } from "../_libs/lucide-react.mjs";
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
function Wallet() {
  const {
    walletBalance,
    incentiveBalance,
    bonusBalance,
    transactions,
    payoutStatus,
    setPayoutStatus,
    t,
    language
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
    const renderCanvas = (useLogo) => {
      const itemHeight = 70;
      const headerHeight = 180;
      const footerHeight = 80;
      const txToShow = transactions.slice(0, 20);
      const canvasWidth = 500;
      const canvasHeight = headerHeight + txToShow.length * itemHeight + footerHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(0, 0, canvasWidth, headerHeight - 10);
      if (useLogo) {
        const logoWidth = 90;
        const logoHeight = 90 * (logoImg.naturalHeight / logoImg.naturalWidth || 1);
        ctx.drawImage(logoImg, 24, 24, logoWidth, logoHeight);
      } else {
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 24px Inter, sans-serif";
        ctx.fillText("Ridu", 24, 60);
      }
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 18px Inter, sans-serif";
      ctx.fillText("Wallet Statement", 240, 50);
      ctx.fillStyle = "#64748b";
      ctx.font = "medium 11px Inter, sans-serif";
      ctx.fillText(`Generated: ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, 240, 70);
      ctx.fillStyle = "#334155";
      ctx.font = "bold 13px Inter, sans-serif";
      ctx.fillText("Available Balance", 240, 100);
      ctx.fillStyle = "#0f172a";
      ctx.font = "900 20px Inter, sans-serif";
      ctx.fillText(`₹${walletBalance.toLocaleString()}`, 240, 125);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(24, headerHeight - 10);
      ctx.lineTo(canvasWidth - 24, headerHeight - 10);
      ctx.stroke();
      let currentY = headerHeight + 15;
      ctx.fillStyle = "#0f172a";
      ctx.font = "bold 14px Inter, sans-serif";
      ctx.fillText("TRANSACTION HISTORY", 24, currentY);
      currentY += 25;
      txToShow.forEach((tx) => {
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 12px Inter, sans-serif";
        const titleText = language === "ta" ? t(tx.titleKey) : tx.titleEn;
        ctx.fillText(titleText, 24, currentY);
        ctx.fillStyle = "#64748b";
        ctx.font = "medium 10px Inter, sans-serif";
        ctx.fillText(tx.date, 24, currentY + 18);
        ctx.fillStyle = tx.positive ? "#10b981" : "#0f172a";
        ctx.font = "bold 13px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.fillText(tx.amount, canvasWidth - 24, currentY + 12);
        ctx.textAlign = "left";
        ctx.strokeStyle = "#f1f5f9";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(24, currentY + 30);
        ctx.lineTo(canvasWidth - 24, currentY + 30);
        ctx.stroke();
        currentY += itemHeight;
      });
      ctx.fillStyle = "#94a3b8";
      ctx.font = "medium 10px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Thank you for riding with us!", canvasWidth / 2, canvasHeight - 35);
      ctx.fillText("This is an electronically generated statement.", canvasWidth / 2, canvasHeight - 20);
      try {
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.setAttribute("download", `statement_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.png`);
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { subtitle: t("app_name").toUpperCase(), title: language === "ta" ? "வருவாய் வாலட்" : "Rider Wallet" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 space-y-4", children: [
      payoutStatus === "failed" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl bg-destructive/15 border border-destructive/25 p-4 text-destructive slide-up", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5 shrink-0 mt-0.5 animate-bounce" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-black text-xs uppercase tracking-wide", children: t("failed_payout") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-slate-500 mt-1 leading-relaxed", children: "Settlement on HDFC Bank declined by admin due to name mismatch on DL." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleRetryPayout, className: "mt-3 py-1.5 px-4 bg-primary text-primary-foreground font-black text-[10px] rounded-full active:scale-95 transition shadow", children: "Retry Instant UPI Payout" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-primary text-primary-foreground p-6 relative overflow-hidden shadow-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase font-extrabold tracking-widest opacity-80", children: t("available_balance") }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1.5 text-4xl font-black tracking-tight", children: [
          "₹",
          walletBalance.toLocaleString()
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] opacity-80 mt-1.5 font-semibold", children: "Next auto-payout settlement: Monday 9:00 am" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-3 z-10 relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/wallet/withdraw", className: "rounded-full bg-white text-primary font-black py-3 text-center text-xs inline-flex items-center justify-center gap-1.5 active:scale-95 transition shadow hover:bg-slate-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDownToLine, { className: "h-4 w-4" }),
            " ",
            t("withdraw")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleDownloadStatement, className: "rounded-full bg-white/15 backdrop-blur border border-white/10 text-white font-black py-3 text-xs inline-flex items-center justify-center gap-1.5 active:scale-95 transition hover:bg-white/20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Banknote, { className: "h-4 w-4" }),
            " ",
            t("statement")
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checker-stripe absolute -bottom-2 inset-x-0 h-3.5 opacity-30" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4 shadow-sm flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-black uppercase tracking-wider", children: t("incentive_wallet") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-black text-foreground mt-1", children: [
            "₹",
            incentiveBalance
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-card border border-border p-4 shadow-sm flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground font-black uppercase tracking-wider", children: t("bonus_wallet") }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-lg font-black text-foreground mt-1", children: [
            "₹",
            bonusBalance
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3 border-b border-border pb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Landmark, { className: "h-4.5 w-4.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xs uppercase tracking-wider text-foreground", children: "Linked Accounts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black uppercase text-success bg-success/10 px-2 py-0.5 rounded", children: "Verified" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("bank_linked") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "HDFC Bank ****4521" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center text-xs font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: t("upi_linked") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: "raja.kumar@hdfc" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border pt-4 pb-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 font-black text-sm uppercase tracking-wider text-muted-foreground", children: t("transactions") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: transactions.map((x, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 shadow-sm hover:border-primary/20 transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${x.positive ? "bg-success/10 text-success" : "bg-accent text-primary"}`, children: x.positive ? /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-5 w-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpLeft, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-foreground tracking-tight truncate", children: language === "ta" ? t(x.titleKey) : x.titleEn }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground font-semibold mt-0.5", children: x.date })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `font-black text-sm text-right shrink-0 ${x.positive ? "text-success" : "text-foreground"}`, children: x.amount })
        ] }, i)) })
      ] })
    ] })
  ] });
}
export {
  Wallet as component
};
