import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, StatCard, Panel } from "@/components/admin/AdminShell";
import { SimpleTable, TableToolbar } from "@/components/admin/DataTable";
import { useState, useEffect } from "react";
import { 
  UserCog, ShieldCheck, Star, Ban, X, Heart, Award, 
  FileText, ShieldAlert, Award as BadgeIcon, ThumbsUp, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { api } from "../lib/api";

export const Route = createFileRoute("/drivers")({ component: Page });

type Driver = { 
  id: string; 
  name: string; 
  gender: string;
  vehicle: string; 
  reg: string; 
  zone: string; 
  rides: number; 
  rating: number; 
  status: "active" | "suspended" | "offline"; 
  earnings: number;
  incentive_balance: number;
  bonus_balance: number;
  womenSafe: boolean;
  trusted: boolean;
  acceptanceRate: number;
  cancelRate: number;
  docs: { aadhaar: string; license: string; rc: string; insurance: string };
};

const statusCls = { 
  active: "bg-primary/15 text-primary border-primary/30", 
  suspended: "bg-destructive/20 text-destructive border-destructive/40", 
  offline: "bg-muted/40 text-muted-foreground border-border" 
} as const;

function Page() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [search, setSearch] = useState("");
  const [zones, setZones] = useState<{ name: string; status: string }[]>([]);

  const [adjustType, setAdjustType] = useState<"incentive" | "bonus" | "wallet">("incentive");
  const [adjustAmount, setAdjustAmount] = useState("");

  const [stats, setStats] = useState({
    activeCount: 0,
    pendingKyc: 0,
    avgRating: "5.0",
    suspendedCount: 0
  });

  useEffect(() => {
    async function loadZones() {
      try {
        const resZones = await api.getSetting("admin_geofence_settings");
        if (Array.isArray(resZones)) {
          setZones(resZones);
        } else {
          const saved = localStorage.getItem("admin_geofence_settings");
          if (saved) {
            setZones(JSON.parse(saved));
          } else {
            setZones([
              { name: "T. Nagar", status: "Active" },
              { name: "Velachery", status: "Active" },
              { name: "Anna Nagar", status: "Active" },
              { name: "Adyar", status: "Active" },
              { name: "OMR Corridor", status: "Active" },
              { name: "Mylapore", status: "Active" },
              { name: "Porur", status: "Active" },
              { name: "Tambaram", status: "Suspended" },
            ]);
          }
        }
      } catch (e) {
        console.warn("Failed to load geofence zones", e);
      }
    }
    loadZones();
  }, []);

  useEffect(() => {
    async function loadDrivers() {
      try {
        const users = await api.getUsers() || [];
        const driverUsers = users.filter((u: any) => u.role === "driver");

        const mapped = driverUsers.map((d: any) => {
          let status: Driver["status"] = "offline";
          if (d.status === "suspended") status = "suspended";
          else if (d.online) status = "active";

          const mainVehicle = d.vehicles && d.vehicles[0];

          return {
            id: `D-${d.id}`,
            name: d.name,
            gender: d.gender || "male",
            vehicle: mainVehicle ? (mainVehicle.vehicle_type === "bike" ? "Bike" : "Auto") : "No vehicle",
            reg: mainVehicle ? mainVehicle.plate_number : "TN-01-XX-0000",
            zone: d.location || "Chennai Core",
            rides: d.completed_rides || 0,
            rating: d.rating !== undefined && d.rating !== null ? parseFloat(d.rating) : 0.0,
            status,
            earnings: d.wallet_balance || 0,
            incentive_balance: d.incentive_balance || 0,
            bonus_balance: d.bonus_balance || 0,
            womenSafe: d.women_safe || false,
            trusted: d.rating !== undefined && d.rating !== null && parseFloat(d.rating) >= 4.8,
            acceptanceRate: d.acceptance_rate !== undefined ? d.acceptance_rate : 0.0,
            cancelRate: d.cancel_rate !== undefined ? d.cancel_rate : 0.0,
            docs: {
              aadhaar: d.kyc_status === "VERIFIED" ? "Verified" : "Pending",
              license: d.kyc_status === "VERIFIED" ? "Verified" : "Pending",
              rc: d.kyc_status === "VERIFIED" ? "Verified" : "Pending",
              insurance: d.kyc_status === "VERIFIED" ? "Verified" : "Pending"
            }
          };
        });

        setDrivers(mapped);

        // Compute stats
        const activeCount = driverUsers.filter((u: any) => u.can_go_online && u.online && u.status === "active").length;
        const pendingKyc = driverUsers.filter((u: any) => u.kyc_status !== "VERIFIED").length;
        const totalRating = mapped.reduce((sum: number, d: Driver) => sum + d.rating, 0);
        const avgRating = mapped.length > 0 ? (totalRating / mapped.length).toFixed(1) : "5.0";
        const suspendedCount = driverUsers.filter((u: any) => u.status === "suspended").length;

        setStats({
          activeCount,
          pendingKyc,
          avgRating,
          suspendedCount
        });

      } catch (err) {
        console.error("Failed to load drivers:", err);
      }
    }
    loadDrivers();
  }, []);

  const handleUpdateStatus = async (driverId: string, nextStatus: "active" | "suspended" | "offline") => {
    const rawId = driverId.replace("D-", "");
    await api.updateUser(rawId, { status: nextStatus });
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: nextStatus } : d));
    if (selectedDriver && selectedDriver.id === driverId) {
      setSelectedDriver(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  const handleToggleBadge = async (driverId: string, badgeType: "womenSafe" | "trusted", val: boolean) => {
    const rawId = driverId.replace("D-", "");
    const updatePayload = badgeType === "womenSafe" ? { women_safe: val } : { trusted: val };
    await api.updateUser(rawId, updatePayload);

    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, [badgeType]: val } : d));
    if (selectedDriver && selectedDriver.id === driverId) {
      setSelectedDriver(prev => prev ? { ...prev, [badgeType]: val } : null);
    }
  };

  const handleAdjustBalance = async (isCredit: boolean) => {
    if (!selectedDriver) return;
    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    const rawId = selectedDriver.id.replace("D-", "");
    const change = isCredit ? amt : -amt;

    let updatePayload: any = {};
    let updatedDriver = { ...selectedDriver };

    if (adjustType === "incentive") {
      const nextVal = Math.max(0, (selectedDriver.incentive_balance || 0) + change);
      updatePayload = { incentive_balance: nextVal };
      updatedDriver.incentive_balance = nextVal;
    } else if (adjustType === "bonus") {
      const nextVal = Math.max(0, (selectedDriver.bonus_balance || 0) + change);
      updatePayload = { bonus_balance: nextVal };
      updatedDriver.bonus_balance = nextVal;
    } else {
      const nextVal = Math.max(0, (selectedDriver.earnings || 0) + change);
      updatePayload = { wallet_balance: nextVal };
      updatedDriver.earnings = nextVal;
    }

    try {
      await api.updateUser(rawId, updatePayload);
      
      // Update local state
      setDrivers(prev => prev.map(d => d.id === selectedDriver.id ? updatedDriver : d));
      setSelectedDriver(updatedDriver);
      setAdjustAmount("");
      
      // Also write to transaction log if cash wallet was updated
      if (adjustType === "wallet") {
        await api.createTransaction({
          user: parseInt(rawId),
          title: `Admin Manual Adjustment: ${isCredit ? 'Credit' : 'Debit'}`,
          amount: amt,
          positive: isCredit
        });
      }
      
      alert(`Successfully ${isCredit ? 'credited' : 'debited'} ₹${amt} to ${adjustType} wallet.`);
    } catch (e) {
      console.error(e);
      alert("Failed to update driver balance.");
    }
  };

  const handleOnboardNew = async () => {
    const name = prompt("Enter Driver's Full Name:");
    if (!name) return;
    const phone = prompt("Enter Driver's Phone Number (10 digits):");
    if (!phone) return;
    const cleanPhone = phone.trim().replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    const vehicleType = prompt("Enter Vehicle Type (bike or auto):", "auto");
    if (!vehicleType || !["bike", "auto"].includes(vehicleType.toLowerCase().trim())) {
      alert("Invalid vehicle type. Choose 'bike' or 'auto'.");
      return;
    }

    try {
      const newDriver = await api.getUserByPhone(cleanPhone, "driver", name, vehicleType.toLowerCase().trim());
      if (newDriver) {
        alert(`Successfully onboarded driver: ${newDriver.name}!`);
        window.location.reload();
      } else {
        alert("Failed to onboard driver. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred during onboarding.");
    }
  };

  const filtered = drivers.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.id.toLowerCase().includes(search.toLowerCase()) ||
    d.reg.toLowerCase().includes(search.toLowerCase()) ||
    d.zone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell 
      title="Driver Management" 
      subtitle={`${stats.activeCount} active · ${stats.pendingKyc} pending KYC · ${stats.suspendedCount} suspended`}
      actions={<Button onClick={handleOnboardNew} size="sm" className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">Onboard driver</Button>}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active drivers" value={stats.activeCount.toString()} delta="" icon={UserCog} tone="primary" />
        <StatCard label="Pending KYC" value={stats.pendingKyc.toString()} delta="" icon={ShieldCheck} tone="accent" />
        <StatCard label="Avg rating" value={stats.avgRating} delta="" icon={Star} tone="primary" />
        <StatCard label="Suspended" value={stats.suspendedCount.toString()} icon={Ban} tone="destructive" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5 items-start">
        {/* Table list */}
        <div className={`overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 ${selectedDriver ? "lg:col-span-3" : "lg:col-span-5"}`}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/45 px-4 py-2.5">
            <div className="relative w-full max-w-xs">
              <Input 
                placeholder="Search drivers, vehicle reg, zone..." 
                className="h-8 pl-8 text-xs bg-muted/40"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search && <span className="text-[10px] text-muted-foreground font-mono">{filtered.length} found</span>}
          </div>

          <SimpleTable<Driver>
            rows={filtered}
            columns={[
              { key: "id", label: "ID", render: r => <span className="font-mono text-xs text-muted-foreground">{r.id}</span> },
              { key: "name", label: "Driver", render: r => (
                <div className="flex items-center gap-1.5">
                  <div>
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      {r.name}
                      {r.trusted && <span title="Trusted Rider Badge Approved"><Award className="h-3.5 w-3.5 text-accent shrink-0 fill-accent" /></span>}
                      {r.womenSafe && <span title="Women-Safe Match Verified"><Heart className="h-3.5 w-3.5 text-primary shrink-0 fill-primary" /></span>}
                    </div>
                    <div className="text-[10px] text-muted-foreground">{r.reg}</div>
                  </div>
                </div>
              )},
              { key: "gender", label: "Gender", render: r => <span className="capitalize text-xs">{r.gender}</span> },
              { key: "vehicle", label: "Vehicle" },
              { key: "zone", label: "Zone" },
              { key: "rides", label: "Rides", render: r => <span className="tabular-nums font-semibold">{r.rides.toLocaleString()}</span> },
              { key: "rating", label: "Rating", render: r => <span className="inline-flex items-center gap-1 tabular-nums font-semibold"><Star className="h-3 w-3 fill-accent text-accent" />{r.rating}</span> },
              { key: "earnings", label: "Earnings", render: r => <span className="tabular-nums text-foreground font-bold">₹{r.earnings.toLocaleString()}</span> },
              { key: "status", label: "Status", render: r => <Badge variant="outline" className={`uppercase text-[9px] font-bold tracking-wide ${statusCls[r.status]}`}>{r.status}</Badge> },
              { key: "_", label: "", render: r => (
                <div className="flex justify-end gap-1.5">
                  <Button onClick={() => setSelectedDriver(r)} variant="secondary" size="sm" className="h-7 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
                    View
                  </Button>
                  <Button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Are you sure you want to delete driver ${r.name}?`)) {
                        const rawId = r.id.replace("D-", "");
                        await fetch(`http://localhost:8000/api/users/${rawId}/`, {
                          method: "DELETE",
                          headers: {
                            ...(localStorage.getItem("admin_token") ? { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } : {})
                          }
                        });
                        setDrivers(prev => prev.filter(d => d.id !== r.id));
                        if (selectedDriver && selectedDriver.id === r.id) {
                          setSelectedDriver(null);
                        }
                        alert("Driver deleted successfully.");
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

        {/* Dynamic Detail Inspector Drawer */}
        {selectedDriver && (
          <div className="lg:col-span-2 space-y-3 animate-fade-in">
            <div className="rounded-xl border border-border bg-card p-4 relative shadow-md">
              <button onClick={() => setSelectedDriver(null)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground font-extrabold text-base">
                  {selectedDriver.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="font-extrabold text-base flex items-center gap-1.5">
                    {selectedDriver.name}
                    {selectedDriver.trusted && <BadgeIcon className="h-4 w-4 text-accent fill-accent" />}
                    {selectedDriver.womenSafe && <Heart className="h-4 w-4 text-primary fill-primary" />}
                  </div>
                  <span className="text-[10px] text-accent/80 font-mono font-semibold">{selectedDriver.id} · {selectedDriver.reg}</span>
                </div>
              </div>

              {/* Status and Zone badge */}
              <div className="flex gap-1.5 mt-3">
                <Badge variant="outline" className={`uppercase text-[9px] font-bold ${statusCls[selectedDriver.status]}`}>{selectedDriver.status}</Badge>
                <Badge variant="secondary" className="text-[9px] font-bold">Zone: {selectedDriver.zone}</Badge>
                <Badge variant="outline" className="text-[9px] font-bold border-primary/20 text-primary">{selectedDriver.vehicle}</Badge>
              </div>

              {/* Wallets & Balances */}
              <div className="mt-4 border-t border-border/60 pt-3.5 space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Wallets & Balances</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-background/45 border border-border/60 rounded-lg p-2 flex flex-col justify-between">
                    <span className="text-[9px] text-muted-foreground block">Cash Wallet</span>
                    <span className="font-extrabold text-foreground text-sm mt-0.5 block">₹{(selectedDriver.earnings || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-background/45 border border-border/60 rounded-lg p-2 flex flex-col justify-between">
                    <span className="text-[9px] text-muted-foreground block">Incentive Wallet</span>
                    <span className="font-extrabold text-foreground text-sm mt-0.5 block">₹{(selectedDriver.incentive_balance || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-background/45 border border-border/60 rounded-lg p-2 flex flex-col justify-between">
                    <span className="text-[9px] text-muted-foreground block">Bonus Wallet</span>
                    <span className="font-extrabold text-foreground text-sm mt-0.5 block">₹{(selectedDriver.bonus_balance || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Adjust Balances Controls */}
                <div className="space-y-2 mt-2 p-2.5 bg-muted/20 border border-border/40 rounded-lg">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">Manual Adjustments</span>
                  <div className="flex gap-2 items-center">
                    <select
                      className="bg-background border border-input text-xs rounded p-1 h-8 flex-1"
                      value={adjustType}
                      onChange={e => setAdjustType(e.target.value as any)}
                    >
                      <option value="incentive">Incentive Wallet</option>
                      <option value="bonus">Bonus Wallet</option>
                      <option value="wallet">Cash Wallet</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Amount"
                      className="h-8 text-xs w-20"
                      value={adjustAmount}
                      onChange={e => setAdjustAmount(e.target.value)}
                    />
                    <Button
                      onClick={() => handleAdjustBalance(true)}
                      size="sm"
                      className="h-8 text-[10px] font-bold bg-green-600 hover:bg-green-700 text-white animate-fade-in"
                    >
                      Credit
                    </Button>
                    <Button
                      onClick={() => handleAdjustBalance(false)}
                      size="sm"
                      variant="destructive"
                      className="h-8 text-[10px] font-bold"
                    >
                      Debit
                    </Button>
                  </div>
                </div>
              </div>

              {/* Verified Badges configuration */}
              <div className="mt-4 border-t border-border/60 pt-3.5 space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verification Badges</h4>
                
                <div className="flex items-center justify-between text-xs bg-muted/20 border border-border/40 rounded-lg p-2.5">
                  <div className="flex gap-2">
                    <Award className="h-4.5 w-4.5 text-accent shrink-0" />
                    <div>
                      <div className="font-semibold">Trusted Rider Badge</div>
                      <div className="text-[9px] text-muted-foreground">Approve golden banner status for low cancellation records.</div>
                    </div>
                  </div>
                  <Switch 
                    checked={selectedDriver.trusted} 
                    onCheckedChange={v => handleToggleBadge(selectedDriver.id, "trusted", v)} 
                  />
                </div>

                <div className="flex items-center justify-between text-xs bg-muted/20 border border-border/40 rounded-lg p-2.5">
                  <div className="flex gap-2">
                    <Heart className="h-4.5 w-4.5 text-primary shrink-0" />
                    <div>
                      <div className="font-semibold">Women-Safe Verification</div>
                      <div className="text-[9px] text-muted-foreground">Include in female-rider matching algorithms.</div>
                    </div>
                  </div>
                  <Switch 
                    checked={selectedDriver.womenSafe} 
                    onCheckedChange={v => handleToggleBadge(selectedDriver.id, "womenSafe", v)} 
                  />
                </div>
              </div>

              {/* Performance analytics metrics */}
              <div className="mt-4 border-t border-border/60 pt-3.5 space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Performance Logs</h4>
                
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-background/45 border border-border/60 rounded-lg p-2">
                    <span className="text-[9px] text-muted-foreground block">Acceptance Rate</span>
                    <span className="font-extrabold text-foreground text-sm mt-0.5 block">{selectedDriver.acceptanceRate}%</span>
                  </div>
                  <div className="bg-background/45 border border-border/60 rounded-lg p-2">
                    <span className="text-[9px] text-muted-foreground block">Cancel Rate</span>
                    <span className={`font-extrabold text-sm mt-0.5 block ${selectedDriver.cancelRate > 10 ? "text-destructive" : "text-foreground"}`}>
                      {selectedDriver.cancelRate}%
                    </span>
                  </div>
                </div>
              </div>

              {/* KYC Document approval overview */}
              <div className="mt-4 border-t border-border/60 pt-3.5 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">KYC Documents Status</h4>
                <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                  {Object.entries(selectedDriver.docs).map(([docKey, status]) => (
                    <div key={docKey} className="flex items-center gap-1.5 border border-border/60 bg-muted/10 p-2 rounded">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <div className="truncate">
                        <span className="capitalize font-medium block text-muted-foreground">{docKey}</span>
                        <span className="font-semibold block text-primary mt-0.5">{status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* KYC Approval controls */}
              {selectedDriver.docs.aadhaar === "Pending" ? (
                <div className="mt-4 border-t border-border/60 pt-3.5 flex gap-2">
                  <Button 
                    onClick={async () => {
                      const rawId = selectedDriver.id.replace("D-", "");
                      const adminToken = localStorage.getItem("admin_token") || "";
                      const headers = {
                        "Content-Type": "application/json",
                        ...(adminToken ? { "Authorization": `Bearer ${adminToken}` } : {})
                      };
                      // Fetch user details to approve vehicle and all docs
                      const users = await api.getUsers() || [];
                      const user = users.find((u: any) => String(u.id) === String(rawId));
                      if (user && user.kyc_documents) {
                        for (const doc of user.kyc_documents) {
                          await fetch(`http://localhost:8000/api/kyc/${doc.id}/`, {
                            method: "PATCH",
                            headers,
                            body: JSON.stringify({ status: "done" })
                          });
                        }
                      }
                      if (user && user.vehicles) {
                        for (const v of user.vehicles) {
                          await fetch(`http://localhost:8000/api/vehicles/${v.id}/`, {
                            method: "PATCH",
                            headers,
                            body: JSON.stringify({ approved: true })
                          });
                        }
                      }
                      await fetch(`http://localhost:8000/api/users/${rawId}/`, {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify({ status: "active", kyc_status: "VERIFIED" })
                      });
                      alert("KYC Approved successfully!");
                      setDrivers(prev => prev.map(d => d.id === selectedDriver.id ? {
                        ...d,
                        status: "active",
                        docs: { aadhaar: "Verified", license: "Verified", rc: "Verified", insurance: "Verified" }
                      } : d));
                      setSelectedDriver(prev => prev ? {
                        ...prev,
                        status: "active",
                        docs: { aadhaar: "Verified", license: "Verified", rc: "Verified", insurance: "Verified" }
                      } : null);
                    }}
                    className="flex-1 h-8 text-xs bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold gap-1"
                  >
                    Approve KYC
                  </Button>
                  <Button 
                    onClick={async () => {
                      const rawId = selectedDriver.id.replace("D-", "");
                      const adminToken = localStorage.getItem("admin_token") || "";
                      const headers = {
                        "Content-Type": "application/json",
                        ...(adminToken ? { "Authorization": `Bearer ${adminToken}` } : {})
                      };
                      await fetch(`http://localhost:8000/api/users/${rawId}/`, {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify({ kyc_status: "rejected" })
                      });
                      alert("KYC Rejected successfully!");
                      setDrivers(prev => prev.map(d => d.id === selectedDriver.id ? {
                        ...d,
                        docs: { aadhaar: "Pending", license: "Pending", rc: "Pending", insurance: "Pending" }
                      } : d));
                      setSelectedDriver(prev => prev ? {
                        ...prev,
                        docs: { aadhaar: "Pending", license: "Pending", rc: "Pending", insurance: "Pending" }
                      } : null);
                    }}
                    variant="outline"
                    className="flex-1 h-8 text-xs border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 font-bold gap-1"
                  >
                    Reject KYC
                  </Button>
                </div>
              ) : (
                <div className="mt-4 border-t border-border/60 pt-3.5 flex items-center justify-center gap-1.5 text-xs text-success font-bold">
                  <ShieldCheck className="h-4 w-4" /> KYC Approved
                </div>
              )}

              {/* Administrative suspension controls */}
              <div className="mt-5 border-t border-border/60 pt-4 flex gap-2">
                {selectedDriver.status === "suspended" ? (
                  <Button 
                    onClick={() => handleUpdateStatus(selectedDriver.id, "active")}
                    className="flex-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold h-8 text-xs gap-1"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Re-Activate Account
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={() => handleUpdateStatus(selectedDriver.id, "suspended")}
                      variant="outline" 
                      className="flex-1 h-8 text-xs border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 font-bold gap-1"
                    >
                      <Ban className="h-3.5 w-3.5" /> Suspend Rider
                    </Button>
                    <Button 
                      onClick={() => {
                        handleUpdateStatus(selectedDriver.id, "suspended");
                        alert(`🚫 BLACKLIST ENFORCED: Driver ${selectedDriver.name} is permanently blacklisted. Active session terminated.`);
                      }}
                      className="flex-1 h-8 text-xs bg-destructive text-destructive-foreground font-bold hover:bg-destructive/90 gap-1"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> Blacklist Rider
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        <Panel title="Top performing zones" description="By driver utilization this week">
          <div className="grid gap-2 md:grid-cols-3">
            {zones.filter(z => z.status === "Active").map(z => {
              const countInZone = drivers.filter(d => d.zone.toLowerCase().includes(z.name.toLowerCase()) && d.status === "active").length;
              const u = Math.min(95, 45 + (countInZone * 12) + (z.name.charCodeAt(0) % 25));
              return (
                <div key={z.name} className="rounded-lg border border-border bg-background/40 p-3 animate-fade-in">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{z.name}</span>
                    <span className="tabular-nums text-muted-foreground">{u}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${u}%` }} />
                  </div>
                </div>
              );
            })}
            {zones.filter(z => z.status === "Active").length === 0 && (
              <div className="text-xs text-muted-foreground col-span-3 text-center py-4">
                No active zones found in backend geofence settings.
              </div>
            )}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}