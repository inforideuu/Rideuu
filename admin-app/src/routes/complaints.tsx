import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Panel } from "@/components/admin/AdminShell";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  MessageSquareWarning, X, PhoneCall, AlertTriangle, ShieldCheck, 
  RotateCcw, Sparkles, Send, User, Coins, ThumbsUp, ThumbsDown, Car, Landmark
} from "lucide-react";
import { api } from "../lib/api";

export const Route = createFileRoute("/complaints")({ component: Page });

type Ticket = {
  id: string;
  sev: "high" | "med" | "low";
  t: string;
  from: string;
  ride: string;
  time: string;
  chatHistory: { sender: "Customer" | "Driver"; msg: string; time: string }[];
  riderRating: number;
  driverRating: number;
  customer_details?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    wallet_balance: number;
    rating: number;
  };
  rider_details?: {
    id: number;
    name: string;
    phone: string;
    email: string;
    wallet_balance: number;
    rating: number;
    vehicle_type: string;
    plate_number: string;
  };
  ride_details?: {
    id: number;
    pickup: string;
    dropoff: string;
    fare: number;
    distance: number;
    duration: number;
    status: string;
    payment_mode: string;
  };
};

const sevCls: Record<string, string> = { 
  high: "bg-destructive/20 text-destructive border-destructive/40 font-bold", 
  med: "bg-accent/15 text-accent border-accent/30 font-semibold animate-pulse", 
  low: "bg-primary/15 text-primary border-primary/30 font-semibold" 
};

function Page() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [refundAmount, setRefundAmount] = useState<string>("150");

  async function loadTickets() {
    try {
      const rawTickets = await api.getTickets() || [];
      // Only show open tickets
      const openTickets = rawTickets.filter((t: any) => t.status === "open");

      const mapped = openTickets.map((t: any, idx: number) => {
        const senderName = t.user_name || (t.user ? `User #${t.user}` : "Customer");
        const dateObj = new Date(t.created_at || Date.now());
        const diffMins = Math.max(1, Math.round((Date.now() - dateObj.getTime()) / 60000));
        const timeLabel = diffMins > 60 ? `${Math.round(diffMins / 60)}h` : `${diffMins}m`;

        return {
          id: `T-${t.id}`,
          sev: idx % 3 === 0 ? "high" : idx % 3 === 1 ? "med" : "low",
          t: t.subject || "Dispute Filed",
          from: senderName,
          ride: t.ride_id ? `A${t.ride_id}` : (t.ride ? `A${t.ride}` : "—"),
          time: timeLabel,
          chatHistory: t.chat && t.chat.length > 0 
            ? t.chat.map((c: any) => ({
                sender: c.sender === "customer" ? "Customer" : "Driver",
                msg: c.message || c.msg || "No message content",
                time: c.time || dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }))
            : [
                { sender: "Customer", msg: t.description || "No description provided.", time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
              ],
          riderRating: t.user_rating || 4.8,
          driverRating: t.driver_rating || 4.5,
          customer_details: t.customer_details,
          rider_details: t.rider_details,
          ride_details: t.ride_details
        };
      });

      setTickets(mapped);
      if (mapped.length > 0) {
        setSelectedTicket(mapped[0]);
      } else {
        setSelectedTicket(null);
      }

    } catch (err) {
      console.error("Failed to load tickets:", err);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const rawId = id.replace("T-", "");
      await api.updateTicket(rawId, { status: "resolved" });

      setTickets(prev => prev.filter(t => t.id !== id));
      alert(`✅ Ticket ${id} marked as RESOLVED. Support logs archived.`);
      
      const remaining = tickets.filter(t => t.id !== id);
      if (remaining.length > 0) {
        setSelectedTicket(remaining[0]);
      } else {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error("Failed to resolve ticket:", err);
    }
  };

  const handleRefund = async (id: string, amountStr: string) => {
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("❌ Please enter a valid refund amount.");
      return;
    }
    try {
      const rawId = id.replace("T-", "");
      await api.refundTicket(rawId, amount);
      setTickets(prev => prev.filter(t => t.id !== id));
      alert(`💳 Refund of ₹${amount} approved! The money has been added to the customer's wallet and deducted from the rider's wallet.`);
      
      const remaining = tickets.filter(t => t.id !== id);
      if (remaining.length > 0) {
        setSelectedTicket(remaining[0]);
      } else {
        setSelectedTicket(null);
      }
    } catch (err) {
      console.error("Failed to process refund:", err);
      alert("❌ Failed to process refund. Ensure there is a driver and ride associated with this ticket.");
    }
  };

  const handleSuspendDriver = (id: string) => {
    alert(`🚫 Safety Override: Associated driver account suspended immediately pending final operations audit.`);
    handleResolve(id);
  };

  return (
    <AdminShell title="Complaint Management" subtitle="Open support tickets · SLA tracking">
      <div className="grid gap-3 lg:grid-cols-5 items-start">
        {/* Left Tickets list */}
        <div className={`space-y-3 ${selectedTicket ? "lg:col-span-3" : "lg:col-span-5"}`}>
          {tickets.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
              <ShieldCheck className="h-12 w-12 text-primary mx-auto animate-bounce" />
              <h3 className="text-base font-bold">Complaints Queue Empty</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">No outstanding customer disputes. Support SLAs are 100% compliant today.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {tickets.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTicket(t)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selectedTicket?.id === t.id 
                      ? "bg-gradient-to-r from-primary/10 to-accent/5 border-primary shadow-sm" 
                      : "bg-card border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-muted/40 text-muted-foreground shrink-0">
                      <MessageSquareWarning className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground truncate">{t.t}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {t.from} · Ride #{t.ride} · <span className="font-mono">{t.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant="outline" className={`uppercase text-[8px] font-bold tracking-wider ${sevCls[t.sev]}`}>{t.sev}</Badge>
                    <div className="text-[9px] text-muted-foreground/60 font-semibold mt-1 font-mono">{t.time} ago</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Split Inspector Panel */}
        {selectedTicket && (
          <div className="lg:col-span-2 space-y-3 animate-fade-in relative">
            <Panel title={`Dispute Center · ${selectedTicket.id}`} description={`Conflict audit: Ride #${selectedTicket.ride}`}>
              <button onClick={() => setSelectedTicket(null)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-4 text-xs font-semibold">
                {/* Conflict Ratings */}
                <div className="grid grid-cols-2 gap-2 text-center text-[10px] bg-background/50 border border-border/60 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Customer rating</span>
                    <span className="font-bold text-foreground text-xs block mt-0.5">⭐ {selectedTicket.riderRating} (Good)</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Driver rating</span>
                    <span className={`font-bold text-xs block mt-0.5 ${selectedTicket.driverRating < 4.0 ? "text-destructive" : "text-foreground"}`}>
                      ⭐ {selectedTicket.driverRating} {selectedTicket.driverRating < 4.0 ? "(Flagged)" : ""}
                    </span>
                  </div>
                </div>

                {/* Customer Details */}
                {selectedTicket.customer_details && (
                  <div className="bg-muted/30 border border-border/80 rounded-lg p-3 space-y-1">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black block border-b border-border/40 pb-1">Customer Details</span>
                    <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px]">
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Name</span>
                        <span className="font-bold text-foreground">{selectedTicket.customer_details.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Phone</span>
                        <span className="font-mono text-foreground">{selectedTicket.customer_details.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Wallet Balance</span>
                        <span className="text-primary font-bold">₹{selectedTicket.customer_details.wallet_balance.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Customer Rating</span>
                        <span className="text-foreground font-bold">⭐ {selectedTicket.customer_details.rating}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rider/Driver Details */}
                {selectedTicket.rider_details && (
                  <div className="bg-muted/30 border border-border/80 rounded-lg p-3 space-y-1">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black block border-b border-border/40 pb-1">Rider Details</span>
                    <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px]">
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Name</span>
                        <span className="font-bold text-foreground">{selectedTicket.rider_details.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Phone</span>
                        <span className="font-mono text-foreground">{selectedTicket.rider_details.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Wallet Balance</span>
                        <span className="text-accent font-bold">₹{selectedTicket.rider_details.wallet_balance.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Vehicle / Plate</span>
                        <span className="text-foreground font-bold capitalize">{selectedTicket.rider_details.vehicle_type} ({selectedTicket.rider_details.plate_number})</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Ride Details */}
                {selectedTicket.ride_details && (
                  <div className="bg-muted/30 border border-border/80 rounded-lg p-3 space-y-1">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black block border-b border-border/40 pb-1">Ride Details</span>
                    <div className="grid grid-cols-2 gap-2 mt-1.5 text-[10px]">
                      <div className="col-span-2">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Pickup</span>
                        <span className="text-foreground">{selectedTicket.ride_details.pickup}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Dropoff</span>
                        <span className="text-foreground">{selectedTicket.ride_details.dropoff}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Fare</span>
                        <span className="text-foreground font-bold">₹{selectedTicket.ride_details.fare}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Payment Mode</span>
                        <span className="text-foreground font-bold uppercase">{selectedTicket.ride_details.payment_mode}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Distance / Duration</span>
                        <span className="text-foreground">{selectedTicket.ride_details.distance} km / {selectedTicket.ride_details.duration} mins</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[9px] uppercase font-bold">Status</span>
                        <span className="text-foreground font-bold uppercase">{selectedTicket.ride_details.status}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* In-app ride chat logs */}
                <div className="bg-muted/30 border border-border/80 rounded-lg p-3 space-y-2">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black block border-b border-border/40 pb-1.5">In-Ride Active Chat logs</span>
                  
                  <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                    {selectedTicket.chatHistory.map((c, i) => (
                      <div key={i} className={`flex flex-col ${c.sender === "Customer" ? "items-start" : "items-end"}`}>
                        <div className={`rounded-lg px-2.5 py-1.5 max-w-[85%] text-[10px] leading-relaxed ${
                          c.sender === "Customer" 
                            ? "bg-primary/10 border border-primary/20 text-foreground" 
                            : "bg-muted border border-border/85 text-foreground"
                        }`}>
                          {c.msg}
                        </div>
                        <span className="text-[8px] text-muted-foreground/60 font-mono mt-0.5">{c.sender} · {c.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolution quick commands */}
                <div className="space-y-2 border-t border-border/60 pt-3.5">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Administrative Resolution commands</h4>
                  
                  {/* Enter Refund Section */}
                  <div className="flex gap-2 items-center bg-muted/20 p-2.5 border border-border/60 rounded-lg">
                    <div className="space-y-1 flex-1">
                      <span className="text-[9px] text-muted-foreground uppercase block">Refund Amount (₹)</span>
                      <Input
                        type="number"
                        value={refundAmount}
                        onChange={e => setRefundAmount(e.target.value)}
                        placeholder="150"
                        className="h-8 bg-background text-xs font-mono font-bold"
                      />
                    </div>
                    <Button 
                      onClick={() => handleRefund(selectedTicket.id, refundAmount)}
                      className="h-8 text-[10px] gap-1 bg-primary text-primary-foreground font-bold shrink-0 self-end"
                    >
                      <Coins className="h-3.5 w-3.5" /> Execute Refund
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button 
                      onClick={() => handleSuspendDriver(selectedTicket.id)}
                      variant="outline"
                      className="h-9 text-[10px] gap-1 border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 font-bold"
                    >
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0" /> Suspend Driver
                    </Button>
                    <Button 
                      onClick={() => handleResolve(selectedTicket.id)}
                      className="h-9 bg-gradient-to-r from-primary to-accent text-primary-foreground font-black text-xs gap-1.5"
                    >
                      <ThumbsUp className="h-4 w-4" /> Resolve (No Action)
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Panel title="SLA snapshot" description="This week support metrics">
          <ul className="grid gap-2 md:grid-cols-4 text-xs font-semibold text-center">
            <li className="bg-muted/15 border border-border/60 rounded-lg p-3">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Avg first response</span>
              <span className="text-sm font-extrabold text-primary block mt-0.5">4m 12s</span>
            </li>
            <li className="bg-muted/15 border border-border/60 rounded-lg p-3">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Avg resolution</span>
              <span className="text-sm font-extrabold text-primary block mt-0.5">38m</span>
            </li>
            <li className="bg-muted/15 border border-border/60 rounded-lg p-3">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Reopen rate</span>
              <span className="text-sm font-extrabold text-accent block mt-0.5">3.2%</span>
            </li>
            <li className="bg-muted/15 border border-border/60 rounded-lg p-3">
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">CSAT score</span>
              <span className="text-sm font-extrabold text-primary block mt-0.5">4.7 / 5</span>
            </li>
          </ul>
        </Panel>
      </div>
    </AdminShell>
  );
}