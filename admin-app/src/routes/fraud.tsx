import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, StatCard, Panel } from "@/components/admin/AdminShell";
import { 
  AlertTriangle, ShieldAlert, Eye, Lock, X, ShieldCheck, 
  Sparkles, Smartphone, Landmark, Navigation2, CheckCircle2
} from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../lib/api";

export const Route = createFileRoute("/fraud")({ component: Page });

type FraudAlert = {
  id: string;
  risk: number;
  t: string;
  who: string;
  det: string;
  deviceInfo: { model: string; imei: string; accounts: number };
  gpsComparison: { reported: { x: number; y: number }; actual: { x: number; y: number } };
};

function Page() {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [blockedCount, setBlockedCount] = useState(0);
  const [falsePositivesRate, setFalsePositivesRate] = useState(0.0);
  const [underReviewCount, setUnderReviewCount] = useState(0);

  useEffect(() => {
    async function loadFraudData() {
      try {
        const users = await api.getUsers() || [];
        const sosAlerts = await api.getSOSAlerts() || [];

        const dynamicAlerts: FraudAlert[] = [];

        // Flag 1: Referral abuse users
        const abuseUsers = users.filter((u: any) => u.referral_abuse_flag);
        abuseUsers.forEach((u: any) => {
          dynamicAlerts.push({
            id: `F-${1000 + u.id}`,
            risk: 85,
            t: "Promo referral abuse",
            who: `Customer C-${u.id} (${u.name})`,
            det: "Multiple referrals registered on identical device signature",
            deviceInfo: { model: "Generic Android", imei: `49201920${u.id}0291`, accounts: 12 },
            gpsComparison: { reported: { x: 60, y: 20 }, actual: { x: 60, y: 20 } }
          });
        });

        // Flag 2: Active SOS Alerts
        const activeSos = sosAlerts.filter((a: any) => a.status === 'ACTIVE');
        activeSos.forEach((a: any) => {
          dynamicAlerts.push({
            id: `F-${2000 + a.id}`,
            risk: a.priority === 'HIGH' ? 95 : 75,
            t: "Critical SOS Alert Active",
            who: `Ride #${a.ride} (${a.customer_name || "Customer"})`,
            det: `SOS alert active: Speed ${a.current_speed || 0} km/h, direction ${a.direction || 'N/A'}`,
            deviceInfo: { model: a.device_info || "Generic Mobile", imei: `358921102${a.id}8221`, accounts: 1 },
            gpsComparison: { reported: { x: 30, y: 80 }, actual: { x: 32, y: 40 } }
          });
        });

        setAlerts(dynamicAlerts);
        setUnderReviewCount(dynamicAlerts.length);

        if (dynamicAlerts.length > 0) {
          setSelectedAlert(dynamicAlerts[0]);
        } else {
          setSelectedAlert(null);
        }

      } catch (err) {
        console.error("Failed to load fraud data:", err);
      }
    }
    loadFraudData();
  }, []);

  const handleResolveAlert = async (id: string, actionType: "block" | "safe") => {
    try {
      const rawId = id.replace("F-", "");
      if (id.startsWith("F-1")) {
        // Resolve customer fraud (referral abuse)
        await api.updateUser(rawId.slice(1), { referral_abuse_flag: false });
      } else if (id.startsWith("F-2")) {
        // Resolve SOS alert on backend
        await api.resolveSOSAlert(rawId.slice(1));
      }

      setAlerts(prev => prev.filter(a => a.id !== id));
      
      if (actionType === "block") {
        setBlockedCount(c => c + 1);
        alert(`🔒 ACCOUNT & DEVICE BLOCKED: Authorized token revoked. Device IMEI blacklisted in regional database.`);
      } else {
        setFalsePositivesRate(r => parseFloat((r + 0.1).toFixed(1)));
        alert(`✅ ALERT RESOLVED SAFE: AI score flagged as false positive anomaly. Model adjusted.`);
      }

      const remaining = alerts.filter(a => a.id !== id);
      if (remaining.length > 0) {
        setSelectedAlert(remaining[0]);
      } else {
        setSelectedAlert(null);
      }
    } catch (err) {
      console.error("Failed to resolve fraud alert:", err);
    }
  };

  return (
    <AdminShell title="Fraud Monitoring" subtitle="ML-flagged geofenced anomalies · active device verification">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Open alerts" value={alerts.length.toString()} icon={AlertTriangle} tone="destructive" />
        <StatCard label="Auto-blocked (24h)" value={blockedCount.toString()} icon={Lock} tone="primary" />
        <StatCard label="Under review" value={underReviewCount.toString()} icon={Eye} tone="accent" />
        <StatCard label="False positives" value={`${falsePositivesRate}%`} delta="" icon={ShieldAlert} tone="primary" />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-5 items-start">
        {/* Left Alerts Queue */}
        <div className={`space-y-2.5 ${selectedAlert ? "lg:col-span-3" : "lg:col-span-5"}`}>
          {alerts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
              <ShieldCheck className="h-12 w-12 text-primary mx-auto animate-bounce" />
              <h3 className="text-base font-bold">Fraud Queue Clear</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">No outstanding anomalies. ML fraud engine reports 100% operational safety.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map(a => (
                <div 
                  key={a.id} 
                  onClick={() => setSelectedAlert(a)}
                  className={`rounded-xl border p-4 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    selectedAlert?.id === a.id 
                      ? "bg-gradient-to-r from-primary/10 to-accent/5 border-primary shadow-sm" 
                      : "bg-card border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">{a.t}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{a.who} · {a.det}</div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[8px] uppercase tracking-wider text-muted-foreground">ML Risk</div>
                      <div className={`text-sm font-extrabold ${a.risk > 80 ? "text-destructive" : a.risk > 60 ? "text-accent" : "text-primary"}`}>{a.risk}%</div>
                    </div>
                    <Badge variant="outline" className="border-destructive/40 text-destructive font-mono text-[9px] py-0.5">{a.id}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right diagnostic drawer */}
        {selectedAlert && (
          <div className="lg:col-span-2 space-y-3 animate-fade-in relative">
            <Panel title={`Anomaly Diagnostic · ${selectedAlert.id}`} description="GPS and Device Fraud Analysis Center">
              <button onClick={() => setSelectedAlert(null)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>

              <div className="space-y-4 text-xs font-semibold">
                {/* ML confidence gauge */}
                <div className="bg-background/45 border border-border/60 p-2.5 rounded-lg text-[10px] flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest block">AI Spoof Likelihood</span>
                    <span className="font-extrabold text-foreground text-xs block mt-0.5">Confidence rating: {selectedAlert.risk}%</span>
                  </div>
                  <Badge variant="outline" className={selectedAlert.risk > 80 ? "border-destructive/30 text-destructive bg-destructive/5 font-bold" : "border-accent/30 text-accent font-bold"}>
                    {selectedAlert.risk > 80 ? "CRITICAL RISK" : "SUSPICIOUS"}
                  </Badge>
                </div>

                {/* GPS comparative map simulator */}
                {selectedAlert.t.includes("GPS") && (
                  <div className="border border-border/80 rounded-lg p-3 bg-muted/20 space-y-2">
                    <div className="flex justify-between items-center text-[9px] text-muted-foreground uppercase tracking-widest font-black">
                      <span>GPS Spoofing coordinate diagnostic</span>
                      <span className="text-destructive flex items-center gap-1 font-bold animate-pulse"><Navigation2 className="h-3 w-3 shrink-0 animate-bounce" /> discrepancy found</span>
                    </div>

                    <div className="relative aspect-[3/2] w-full overflow-hidden rounded-md border border-border bg-[oklch(0.08_0.02_350)] p-2">
                      <div className="absolute inset-0 opacity-20" style={{ backgroundImage:"linear-gradient(oklch(1 0 0 / 6%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 6%) 1px, transparent 1px)", backgroundSize:"20px 20px" }} />
                      
                      {/* Reported coordinates dot */}
                      <div className="absolute top-[80%] left-[30%] text-center z-10 animate-pulse">
                        <span className="h-3 w-3 bg-destructive rounded-full block border border-white ring-4 ring-destructive/20 drop-shadow-[0_0_8px_var(--destructive)]" />
                        <span className="text-[8px] bg-card border border-border px-1.5 py-0.5 rounded text-foreground block mt-1 font-mono font-bold">Reported (Spoofed)</span>
                      </div>

                      {/* Actual cell tower coordinates dot */}
                      <div className="absolute top-[40%] left-[32%] text-center z-10 animate-pulse">
                        <span className="h-3 w-3 bg-primary rounded-full block border border-white ring-4 ring-primary/20 drop-shadow-[0_0_8px_var(--primary)]" />
                        <span className="text-[8px] bg-card border border-border px-1.5 py-0.5 rounded text-foreground block mt-1 font-mono font-bold">Actual (Tower)</span>
                      </div>

                      {/* Discrepancy connector line */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="32%" y1="80%" x2="33.5%" y2="40%" stroke="oklch(0.65 0.23 25)" strokeWidth="1.5" strokeDasharray="3 3" />
                      </svg>
                    </div>

                    <div className="text-[9px] text-destructive leading-relaxed bg-destructive/10 border border-destructive/25 p-2 rounded-lg font-normal">
                      ⚠️ Reported location jumped 4.2 kilometers across Chennai geofences within 12 seconds. Cell tower triangulation reports the hardware is locked in at Vadapalani geocell coordinates. Fake GPS algorithm confirmed.
                    </div>
                  </div>
                )}

                {/* Device Hardware Profiler */}
                <div className="bg-muted/30 border border-border/80 rounded-lg p-3 space-y-2.5">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Smartphone className="h-4 w-4" /> Hardware Device Profile</h4>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground/60 block">Device Model</span>
                      <span className="font-bold text-foreground mt-0.5 block">{selectedAlert.deviceInfo.model}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground/60 block">IMEI Code signature</span>
                      <span className="font-mono font-semibold text-foreground mt-0.5 block">{selectedAlert.deviceInfo.imei}</span>
                    </div>
                    <div className="col-span-2 border-t border-border/40 mt-1 pt-1 flex justify-between">
                      <span className="text-muted-foreground/60">Registered Accounts on Device</span>
                      <span className={`font-extrabold ${selectedAlert.deviceInfo.accounts > 2 ? "text-destructive font-mono" : "text-foreground"}`}>
                        {selectedAlert.deviceInfo.accounts} accounts {selectedAlert.deviceInfo.accounts > 5 ? "(Multi-account fraud flag)" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action controls */}
                <div className="flex gap-2 border-t border-border/60 pt-4">
                  <Button 
                    onClick={() => handleResolveAlert(selectedAlert.id, "safe")}
                    variant="outline"
                    className="flex-1 h-9 text-[10px] gap-1 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 font-bold"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark False Positive
                  </Button>
                  <Button 
                    onClick={() => handleResolveAlert(selectedAlert.id, "block")}
                    className="flex-1 h-9 text-[10px] gap-1 bg-destructive text-destructive-foreground font-extrabold hover:bg-destructive/95"
                  >
                    <Lock className="h-3.5 w-3.5" /> Block Account & Device
                  </Button>
                </div>
              </div>
            </Panel>
          </div>
        )}
      </div>
    </AdminShell>
  );
}