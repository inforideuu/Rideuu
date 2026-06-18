import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { M as MobileShell, P as PageHeader } from "./MobileShell-p1-8Yc6U.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
import { S as Send, E as MessageSquare, j as ChevronRight, F as FileText, l as CircleCheck } from "../_libs/lucide-react.mjs";
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
function SupportPage() {
  useNavigate();
  const {
    tickets,
    addSupportTicket,
    addChatMessage,
    t,
    language
  } = useRider();
  const [activeTicketId, setActiveTicketId] = reactExports.useState(null);
  const [chatInput, setChatInput] = reactExports.useState("");
  const [subjInput, setSubjInput] = reactExports.useState("");
  const [descInput, setDescInput] = reactExports.useState("");
  const [submitted, setSubmitted] = reactExports.useState(false);
  const activeTicket = tickets.find((t2) => t2.id === activeTicketId);
  const handleCreateTicket = () => {
    if (!subjInput || !descInput) return;
    addSupportTicket(subjInput, `${subjInput} · ${descInput}`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubjInput("");
      setDescInput("");
    }, 2e3);
  };
  const handleSendReply = () => {
    if (!chatInput || !activeTicketId) return;
    addChatMessage(activeTicketId, chatInput, "rider");
    setChatInput("");
    setTimeout(() => {
      const answers = ["We are looking into this payout delay. Your bank network is currently undergoing HDFC maintenance.", "Your Chennai rain bonus query has been submitted. Adjusting ₹40 credit into your Wallet shortly.", "This ride fare issue is under verification against our GPS logs. Resolved within 1 hour."];
      const randomAns = answers[Math.floor(Math.random() * answers.length)];
      addChatMessage(activeTicketId, randomAns, "support");
    }, 1500);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(MobileShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { subtitle: t("support_center").toUpperCase(), title: language === "ta" ? "உதவி மையம்" : "Rider Support" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-5 space-y-5 pb-8", children: [
      activeTicket ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-slate-900 border border-white/10 p-5 text-white shadow-lg relative slide-up", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center border-b border-white/5 pb-3 mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black block truncate max-w-[160px]", children: activeTicket.subject }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] text-slate-400 font-extrabold uppercase", children: [
              "Ticket #",
              activeTicket.id,
              " · ",
              activeTicket.status
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveTicketId(null), className: "text-[10px] bg-white/10 border border-white/10 px-3 py-1 rounded-full font-bold", children: "Close Chat" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-44 overflow-y-auto space-y-3.5 pr-1 my-3 scrollbar-none", children: activeTicket.chat.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `flex ${c.sender === "rider" ? "justify-end" : "justify-start"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm font-semibold ${c.sender === "rider" ? "bg-primary text-white rounded-tr-none" : "bg-white/5 border border-white/5 text-slate-100 rounded-tl-none"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: c.message }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block text-[8px] opacity-40 text-right mt-1 font-bold", children: c.time })
        ] }) }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center mt-3 pt-3 border-t border-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: chatInput, onChange: (e) => setChatInput(e.target.value), placeholder: "Type reply to agent...", className: "flex-1 bg-white/5 border border-white/10 rounded-full px-4.5 py-2.5 text-xs outline-none text-white focus:border-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleSendReply, className: "h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }) })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-primary text-primary-foreground p-5 relative overflow-hidden shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase font-extrabold tracking-widest opacity-80", children: "Support Help Desk" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "mt-1 text-lg font-black tracking-tight", children: t("support_welcome") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] opacity-80 mt-1 font-semibold leading-relaxed", children: "Our Chennai headquarters support team is active 24/7 during rain alerts." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 font-black text-sm uppercase tracking-wider text-muted-foreground", children: language === "ta" ? "உங்களின் ஆதரவு புகார்கள்" : "Your support tickets" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2.5", children: tickets.map((tkt) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveTicketId(tkt.id), className: "w-full flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 hover:border-primary/20 transition text-left shadow-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "h-4.5 w-4.5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold text-xs text-foreground truncate", children: tkt.subject }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[9px] text-muted-foreground font-semibold mt-0.5 uppercase", children: [
              "TICKET #",
              tkt.id,
              " · ",
              tkt.status,
              " · ",
              tkt.date
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground shrink-0" })
        ] }, tkt.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl bg-card border border-border p-5 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-b border-border pb-3 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-4.5 w-4.5 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-black text-xs uppercase tracking-wider text-foreground", children: t("complaint_title") })
        ] }),
        submitted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 text-center text-success bg-success/10 rounded-2xl border border-success/20 font-black text-xs flex items-center justify-center gap-2 animate-bounce", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }),
          "Ticket Filed Successfully"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[9px] font-extrabold text-muted-foreground uppercase", children: "Problem Subject" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: subjInput, onChange: (e) => setSubjInput(e.target.value), className: "w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-xs font-semibold outline-none mt-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "-- Choose Category --" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "HDFC Payout Delay Dispute", children: "HDFC Payout Delay Dispute" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Chennai Rain Bonus Missing", children: "Chennai Rain Bonus Missing" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "Customer Cancellation Dispute", children: "Customer Cancellation Dispute" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "text-[9px] font-extrabold text-muted-foreground uppercase", children: "Description Details" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: descInput, onChange: (e) => setDescInput(e.target.value), placeholder: t("complaint_placeholder"), rows: 3, className: "w-full bg-secondary border border-border rounded-xl p-3 text-xs font-semibold outline-none mt-1 focus:border-primary" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleCreateTicket, disabled: !subjInput || !descInput, className: "w-full py-3 bg-primary text-primary-foreground font-black text-xs rounded-full shadow active:scale-95 transition disabled:opacity-50", children: "Submit Dispute Ticket" })
        ] })
      ] })
    ] })
  ] });
}
export {
  SupportPage as component
};
