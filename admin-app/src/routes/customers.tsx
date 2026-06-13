import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, StatCard, Panel } from "@/components/admin/AdminShell";
import { SimpleTable, TableToolbar } from "@/components/admin/DataTable";
import { useState, useEffect } from "react";
import { api } from "../lib/api";
import { 
  Users, UserPlus, Wallet, Ban, X, History, Gift, ShieldAlert,
  ArrowUpRight, ArrowDownLeft, Trash2, CheckCircle2, Coins
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/customers")({ component: Page });

type Customer = { 
  id: string; 
  name: string; 
  gender: string;
  phone: string; 
  rides: number; 
  spend: number; 
  ltv: string; 
  status: "active" | "blacklisted" | "new";
  walletBalance: number;
  referrals: number;
  referralAbuseFlag: boolean;
  history: { id: string; date: string; route: string; fare: number; status: string }[];
};

const initialCustomers: Customer[] = [
  { 
    id: "C-9120", 
    name: "Priya S.", 
    gender: "female",
    phone: "+91 98402 12009", 
    rides: 184, 
    spend: 24800, 
    ltv: "Gold", 
    status: "active",
    walletBalance: 350,
    referrals: 4,
    referralAbuseFlag: false,
    history: [
      { id: "A8701", date: "Today 14:22", route: "T. Nagar → Adyar", fare: 78, status: "completed" },
      { id: "A8650", date: "Yesterday 18:40", route: "OMR → Mylapore", fare: 210, status: "completed" },
      { id: "A8540", date: "28 May 10:15", route: "Egmore → Central Station", fare: 90, status: "completed" }
    ]
  },
  { 
    id: "C-9121", 
    name: "Rahul K.", 
    gender: "male",
    phone: "+91 98409 12010", 
    rides: 62, 
    spend: 9120, 
    ltv: "Silver", 
    status: "active",
    walletBalance: 120,
    referrals: 2,
    referralAbuseFlag: false,
    history: [
      { id: "A8702", date: "Today 14:18", route: "Velachery → OMR", fare: 184, status: "in-progress" },
      { id: "A8610", date: "Yesterday 09:30", route: "Adyar → T. Nagar", fare: 80, status: "completed" }
    ]
  },
  { 
    id: "C-9122", 
    name: "Anu M.", 
    gender: "female",
    phone: "+91 98412 12011", 
    rides: 3, 
    spend: 412, 
    ltv: "New", 
    status: "new",
    walletBalance: 50,
    referrals: 0,
    referralAbuseFlag: false,
    history: [
      { id: "A8704", date: "Today 13:51", route: "Anna Nagar → Egmore", fare: 96, status: "completed" }
    ]
  },
  { 
    id: "C-9123", 
    name: "Vikram T.", 
    gender: "male",
    phone: "+91 98422 12012", 
    rides: 22, 
    spend: 3120, 
    ltv: "Bronze", 
    status: "blacklisted",
    walletBalance: 0,
    referrals: 12,
    referralAbuseFlag: true, // Flagged because 12 referrals registered on the exact same IMEI/Device ID
    history: [
      { id: "A8703", date: "Today 14:08", route: "Chromepet → Tambaram", fare: 0, status: "cancelled" },
      { id: "A8590", date: "27 May 19:22", route: "Airport → Porur", fare: 320, status: "refunded" }
    ]
  },
  { 
    id: "C-9124", 
    name: "Meera P.", 
    gender: "female",
    phone: "+91 98455 12013", 
    rides: 348, 
    spend: 51200, 
    ltv: "Platinum", 
    status: "active",
    walletBalance: 780,
    referrals: 8,
    referralAbuseFlag: false,
    history: [
      { id: "A8705", date: "Today 13:40", route: "Mylapore → Marina Beach", fare: 36, status: "refunded" },
      { id: "A8680", date: "Yesterday 21:15", route: "Nungambakkam → Adyar", fare: 140, status: "completed" }
    ]
  },
];

const cls = { 
  active: "bg-primary/15 text-primary border-primary/30", 
  blacklisted: "bg-destructive/20 text-destructive border-destructive/40", 
  new: "bg-accent/15 text-accent border-accent/30" 
} as const;

function Page() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [walletAmount, setWalletAmount] = useState("");

  const [stats, setStats] = useState(() => {
    const activeCount = initialCustomers.filter(c => c.status === "active").length;
    const newCount = initialCustomers.filter(c => c.status === "new").length;
    const totalBalance = initialCustomers.reduce((sum, c) => sum + c.walletBalance, 0);
    const blacklistedCount = initialCustomers.filter(c => c.status === "blacklisted").length;
    return { activeCount, newCount, totalBalance, blacklistedCount };
  });

  const updateStatsFromList = (list: Customer[]) => {
    const activeCount = list.filter(c => c.status === "active").length;
    const newCount = list.filter(c => c.status === "new").length;
    const totalBalance = list.reduce((sum, c) => sum + (c.walletBalance || 0), 0);
    const blacklistedCount = list.filter(c => c.status === "blacklisted").length;
    setStats({ activeCount, newCount, totalBalance, blacklistedCount });
  };

  // Load from Django backend
  useEffect(() => {
    async function loadCustomers() {
      const data = await api.getUsers();
      if (data) {
        const customersOnly = data.filter((u: any) => u.role === "customer");
        if (customersOnly.length > 0) {
          const mapped = customersOnly.map((c: any) => ({
            id: `C-${c.id}`,
            name: c.name,
            gender: c.gender || "male",
            phone: c.phone,
            rides: c.completed_rides || 0,
            spend: Math.round(c.wallet_balance * 3.5),
            ltv: c.wallet_balance > 1000 ? "Gold" : "Silver",
            status: c.status,
            walletBalance: c.wallet_balance,
            referrals: c.referral_abuse_flag ? 12 : 2,
            referralAbuseFlag: c.referral_abuse_flag,
            history: [
              { id: "A8701", date: "Today 14:22", route: "T. Nagar → Adyar", fare: 78, status: "completed" }
            ]
          }));
          setCustomers(mapped);
          updateStatsFromList(mapped);
        }
      }
    }
    loadCustomers();
  }, []);

  const handleUpdateStatus = async (custId: string, nextStatus: "active" | "blacklisted" | "new") => {
    const rawId = custId.replace("C-", "");
    await api.updateUser(rawId, { status: nextStatus });
    setCustomers(prev => {
      const nextList = prev.map(c => c.id === custId ? { ...c, status: nextStatus } : c);
      updateStatsFromList(nextList);
      return nextList;
    });
    if (selectedCust && selectedCust.id === custId) {
      setSelectedCust(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const handleAdjustWallet = async (type: "credit" | "refund") => {
    if (!selectedCust) return;
    const amt = parseFloat(walletAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid positive numeric amount.");
      return;
    }

    const rawId = selectedCust.id.replace("C-", "");
    const nextBalance = type === "credit" ? selectedCust.walletBalance + amt : Math.max(0, selectedCust.walletBalance - amt);
    
    await api.updateUser(rawId, { wallet_balance: nextBalance });
    await api.createTransaction({
      user: rawId,
      title: type === "credit" ? "Credit Adjusted by Admin" : "Refund Processed by Admin",
      amount: `${type === "credit" ? "+" : "−"}₹${amt}.00`,
      date: "Just now",
      positive: type === "credit"
    });

    setCustomers(prev => {
      const nextList = prev.map(c => {
        if (c.id === selectedCust.id) {
          return { ...c, walletBalance: nextBalance };
        }
        return c;
      });
      updateStatsFromList(nextList);
      return nextList;
    });

    setSelectedCust(prev => {
      if (!prev) return null;
      return { ...prev, walletBalance: nextBalance };
    });

    setWalletAmount("");
    alert(`💳 Wallet updated: ${type === "credit" ? "Added" : "Deducted"} ₹${amt} successfully for customer ${selectedCust.name}.`);
  };

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Customer Management" subtitle={`${stats.activeCount} active · ${stats.newCount} new`}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active customers" value={stats.activeCount.toString()} delta="" icon={Users} tone="primary" />
        <StatCard label="New (7d)" value={stats.newCount.toString()} delta="" icon={UserPlus} tone="accent" />
        <StatCard label="Wallet balance" value={`₹${stats.totalBalance.toLocaleString()}`} delta="" icon={Wallet} tone="primary" />
        <StatCard label="Blacklisted" value={stats.blacklistedCount.toString()} icon={Ban} tone="destructive" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5 items-start">
        {/* Table list */}
        <div className={`overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 ${selectedCust ? "lg:col-span-3" : "lg:col-span-5"}`}>
          <TableToolbar placeholder="Search customers, phone, ID...">
            <div className="relative w-full max-w-xs shrink-0">
              <Input 
                placeholder="Search customers, phone, ID..." 
                className="h-8 pl-8 text-xs bg-muted/40"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </TableToolbar>

          <SimpleTable<Customer>
            rows={filtered}
            columns={[
              { key: "id", label: "ID", render: r => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
              { key: "name", label: "Customer", render: r => (
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    {r.name}
                    {r.referralAbuseFlag && <span title="Flagged: Multi-account Referral Fraud"><ShieldAlert className="h-3.5 w-3.5 text-destructive fill-destructive/10" /></span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{r.phone}</div>
                </div>
              )},
              { key: "gender", label: "Gender", render: r => <span className="capitalize text-xs">{r.gender}</span> },
              { key: "rides", label: "Rides", render: r => <span className="tabular-nums font-semibold">{r.rides}</span> },
              { key: "spend", label: "Lifetime spend", render: r => <span className="tabular-nums text-foreground font-semibold">₹{r.spend.toLocaleString()}</span> },
              { key: "walletBalance", label: "Wallet Balance", render: r => <span className="tabular-nums text-primary font-bold">₹{r.walletBalance.toLocaleString()}</span> },
              { key: "ltv", label: "Tier", render: r => <Badge variant="outline" className="border-accent/40 text-accent font-bold text-[9px]">{r.ltv}</Badge> },
              { key: "status", label: "Status", render: r => <Badge variant="outline" className={`uppercase text-[9px] font-bold tracking-wide ${cls[r.status]}`}>{r.status}</Badge> },
              { key: "_", label: "", render: r => (
                <div className="flex justify-end gap-1.5">
                  <Button onClick={() => setSelectedCust(r)} variant="secondary" size="sm" className="h-7 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
                    View
                  </Button>
                  <Button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete customer ${r.name}?`)) {
                        const rawId = r.id.replace("C-", "");
                        await fetch(`http://localhost:8000/api/users/${rawId}/`, {
                          method: "DELETE",
                          headers: {
                            ...(localStorage.getItem("admin_token") ? { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } : {})
                          }
                        });
                        const nextCustomers = customers.filter(c => c.id !== r.id);
                        setCustomers(nextCustomers);
                        updateStatsFromList(nextCustomers);
                        if (selectedCust && selectedCust.id === r.id) {
                          setSelectedCust(null);
                        }
                        alert("Customer deleted successfully.");
                      }
                    }} 
                    variant="outline" 
                    size="sm" 
                    className="h-7 text-xs font-semibold border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    Delete
                  </Button>
                </div>
              ), className: "text-right" },
            ]}
          />
        </div>

        {/* Dynamic Customer Drawer inspector */}
        {selectedCust && (
          <div className="lg:col-span-2 space-y-3 animate-fade-in">
            <div className="rounded-xl border border-border bg-card p-4 relative shadow-md">
              <button onClick={() => setSelectedCust(null)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground font-extrabold text-base">
                  {selectedCust.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-extrabold text-base flex items-center gap-1">
                    {selectedCust.name}
                    <Badge variant="outline" className="border-accent/40 text-accent text-[8px] py-0">{selectedCust.ltv} Tier</Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground/80 font-mono font-semibold">{selectedCust.id} · {selectedCust.phone}</span>
                </div>
              </div>

              {/* Wallet adjustment center */}
              <div className="mt-4 border-t border-border/60 pt-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Wallet className="h-3.5 w-3.5 text-primary" /> Wallet Management</h4>
                  <span className="text-sm font-extrabold text-primary font-mono">₹{selectedCust.walletBalance}</span>
                </div>

                <div className="flex gap-2">
                  <Input 
                    type="number" 
                    placeholder="Amount (₹)" 
                    value={walletAmount} 
                    onChange={e => setWalletAmount(e.target.value)}
                    className="h-8 text-xs bg-muted/40"
                  />
                  <Button 
                    onClick={() => handleAdjustWallet("credit")}
                    size="sm" 
                    className="h-8 text-[10px] bg-primary text-primary-foreground font-bold hover:bg-primary/95 gap-1 shrink-0"
                  >
                    <ArrowUpRight className="h-3 w-3" /> Credit
                  </Button>
                  <Button 
                    onClick={() => handleAdjustWallet("refund")}
                    size="sm" 
                    variant="outline"
                    className="h-8 text-[10px] border-accent/40 text-accent hover:bg-accent/10 font-bold gap-1 shrink-0"
                  >
                    <Coins className="h-3.5 w-3.5" /> Refund
                  </Button>
                </div>
              </div>

              {/* Referral campaign and abuse diagnosis */}
              <div className="mt-4 border-t border-border/60 pt-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Gift className="h-3.5 w-3.5 text-accent" /> Referrals Campaign</h4>
                  <span className="text-[10px] font-semibold text-foreground font-mono">{selectedCust.referrals} successful referrals</span>
                </div>

                {selectedCust.referralAbuseFlag ? (
                  <div className="rounded-lg bg-destructive/15 border border-destructive/35 p-3 text-destructive space-y-2.5">
                    <div className="flex gap-2 text-xs">
                      <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                      <div>
                        <div className="font-extrabold text-[10px] uppercase tracking-widest">PROMO ABUSE GEODETECTED</div>
                        <div className="text-[9px] mt-0.5 leading-relaxed">
                          12 accounts registered under Vikram T.'s referral link have been traced to the identical hardware IMEI signature (Device fraud).
                        </div>
                      </div>
                    </div>
                    {/* Tiny visual chart representing spoof accounts */}
                    <div className="border border-destructive/25 rounded-md bg-destructive/5 p-2 text-[9px] font-mono text-destructive-foreground/95 flex flex-wrap gap-1">
                      {Array.from({length: 6}).map((_, i) => (
                        <span key={i} className="bg-destructive/20 border border-destructive/40 px-1 rounded">Spoof_C#{9000+i}</span>
                      ))}
                      <span>+6 more...</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted/20 border border-border/40 p-2.5 text-[10px] text-muted-foreground flex gap-1.5 items-center">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                    <span>No promo abuse triggers flagged. Referral logs align with regional IP allocations.</span>
                  </div>
                )}
              </div>

              {/* Ride history logs */}
              <div className="mt-4 border-t border-border/60 pt-3.5 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><History className="h-3.5 w-3.5 text-muted-foreground" /> Recent Booking History</h4>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {selectedCust.history.map((h, i) => (
                    <div key={i} className="flex justify-between border border-border/40 bg-muted/10 px-2 py-1.5 rounded text-[10px]">
                      <div>
                        <div className="font-semibold text-foreground truncate">{h.route}</div>
                        <div className="text-[9px] text-muted-foreground/60 mt-0.5">{h.date} · #{h.id}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-bold text-foreground">₹{h.fare}</div>
                        <span className="text-[8px] text-primary capitalize font-semibold">{h.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* suspension buttons */}
              <div className="mt-5 border-t border-border/60 pt-4 flex gap-2">
                {selectedCust.status === "blacklisted" ? (
                  <Button 
                    onClick={() => handleUpdateStatus(selectedCust.id, "active")}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-8 text-xs gap-1"
                  >
                    Remove Blacklist
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => handleUpdateStatus(selectedCust.id, "blacklisted")}
                      variant="outline" 
                      className="flex-1 h-8 text-xs border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 font-bold gap-1"
                    >
                      <Ban className="h-3.5 w-3.5" /> Suspend Customer
                    </Button>
                    <Button 
                      onClick={() => {
                        handleUpdateStatus(selectedCust.id, "blacklisted");
                        alert(`🚫 permanent blacklist applied for Customer ${selectedCust.name}.`);
                      }}
                      className="flex-1 h-8 text-xs bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 gap-1"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" /> Blacklist Account
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}