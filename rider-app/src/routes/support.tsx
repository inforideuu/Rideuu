import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { HelpCircle, ChevronRight, MessageSquare, FileText, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useRider } from "../context/RiderContext";

export const Route = createFileRoute("/support")({
  component: SupportPage,
});

function SupportPage() {
  const nav = useNavigate();
  const { tickets, addSupportTicket, addChatMessage, t, language } = useRider();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  
  const [subjInput, setSubjInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const activeTicket = tickets.find(t => t.id === activeTicketId);

  const handleCreateTicket = () => {
    if (!subjInput || !descInput) return;
    addSupportTicket(subjInput, `${subjInput} · ${descInput}`);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubjInput("");
      setDescInput("");
    }, 2000);
  };

  const handleSendReply = () => {
    if (!chatInput || !activeTicketId) return;
    addChatMessage(activeTicketId, chatInput, "rider");
    setChatInput("");
    
    // Simulate auto-support agent reply in Tamil/English
    setTimeout(() => {
      const answers = [
        "We are looking into this payout delay. Your bank network is currently undergoing HDFC maintenance.",
        "Your Chennai rain bonus query has been submitted. Adjusting ₹40 credit into your Wallet shortly.",
        "This ride fare issue is under verification against our GPS logs. Resolved within 1 hour."
      ];
      const randomAns = answers[Math.floor(Math.random() * answers.length)];
      addChatMessage(activeTicketId, randomAns, "support");
    }, 1500);
  };

  return (
    <MobileShell>
      <PageHeader subtitle={t("support_center").toUpperCase()} title={language === "ta" ? "உதவி மையம்" : "Rider Support"} />

      <div className="px-5 space-y-5 pb-8">
        
        {/* Support Chat Overlay Mockup */}
        {activeTicket ? (
          <div className="rounded-3xl bg-slate-900 border border-white/10 p-5 text-white shadow-lg relative slide-up">
            <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-3">
              <div>
                <span className="text-xs font-black block truncate max-w-[160px]">{activeTicket.subject}</span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase">Ticket #{activeTicket.id} · {activeTicket.status}</span>
              </div>
              <button
                onClick={() => setActiveTicketId(null)}
                className="text-[10px] bg-white/10 border border-white/10 px-3 py-1 rounded-full font-bold"
              >
                Close Chat
              </button>
            </div>

            {/* Chat Box logs */}
            <div className="h-44 overflow-y-auto space-y-3.5 pr-1 my-3 scrollbar-none">
              {activeTicket.chat.map((c, i) => (
                <div key={i} className={`flex ${c.sender === "rider" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed shadow-sm font-semibold ${
                    c.sender === "rider"
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-white/5 border border-white/5 text-slate-100 rounded-tl-none"
                  }`}>
                    <p>{c.message}</p>
                    <span className="block text-[8px] opacity-40 text-right mt-1 font-bold">{c.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Reply bar */}
            <div className="flex gap-2 items-center mt-3 pt-3 border-t border-white/5">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type reply to agent..."
                className="flex-1 bg-white/5 border border-white/10 rounded-full px-4.5 py-2.5 text-xs outline-none text-white focus:border-primary"
              />
              <button
                onClick={handleSendReply}
                className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-primary text-primary-foreground p-5 relative overflow-hidden shadow-sm">
            <p className="text-[10px] uppercase font-extrabold tracking-widest opacity-80">Support Help Desk</p>
            <h4 className="mt-1 text-lg font-black tracking-tight">{t("support_welcome")}</h4>
            <p className="text-[10px] opacity-80 mt-1 font-semibold leading-relaxed">Our Chennai headquarters support team is active 24/7 during rain alerts.</p>
          </div>
        )}

        {/* Existing tickets list */}
        <div>
          <h3 className="mb-3 font-black text-sm uppercase tracking-wider text-muted-foreground">
            {language === "ta" ? "உங்களின் ஆதரவு புகார்கள்" : "Your support tickets"}
          </h3>

          <div className="space-y-2.5">
            {tickets.map((tkt) => (
              <button
                key={tkt.id}
                onClick={() => setActiveTicketId(tkt.id)}
                className="w-full flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 hover:border-primary/20 transition text-left shadow-sm"
              >
                <div className="h-10 w-10 rounded-full bg-accent text-primary flex items-center justify-center shrink-0">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground truncate">{tkt.subject}</div>
                  <div className="text-[9px] text-muted-foreground font-semibold mt-0.5 uppercase">
                    TICKET #{tkt.id} · {tkt.status} · {tkt.date}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Submit Complaint Box Form */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <FileText className="h-4.5 w-4.5 text-primary" />
            <span className="font-black text-xs uppercase tracking-wider text-foreground">
              {t("complaint_title")}
            </span>
          </div>

          {submitted ? (
            <div className="py-6 text-center text-success bg-success/10 rounded-2xl border border-success/20 font-black text-xs flex items-center justify-center gap-2 animate-bounce">
              <CheckCircle2 className="h-5 w-5" />
              Ticket Filed Successfully
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-[9px] font-extrabold text-muted-foreground uppercase">Problem Subject</label>
                <select
                  value={subjInput}
                  onChange={(e) => setSubjInput(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-xs font-semibold outline-none mt-1"
                >
                  <option value="">-- Choose Category --</option>
                  <option value="HDFC Payout Delay Dispute">HDFC Payout Delay Dispute</option>
                  <option value="Chennai Rain Bonus Missing">Chennai Rain Bonus Missing</option>
                  <option value="Customer Cancellation Dispute">Customer Cancellation Dispute</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-extrabold text-muted-foreground uppercase">Description Details</label>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder={t("complaint_placeholder")}
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-xl p-3 text-xs font-semibold outline-none mt-1 focus:border-primary"
                />
              </div>

              <button
                onClick={handleCreateTicket}
                disabled={!subjInput || !descInput}
                className="w-full py-3 bg-primary text-primary-foreground font-black text-xs rounded-full shadow active:scale-95 transition disabled:opacity-50"
              >
                Submit Dispute Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
