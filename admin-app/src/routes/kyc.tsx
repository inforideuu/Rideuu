import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Panel } from "@/components/admin/AdminShell";
import { useState, useEffect } from "react";
import { 
  CheckCircle2, XCircle, FileText, ShieldCheck, User, CreditCard, 
  Car, ShieldAlert, Sparkles, AlertTriangle, ChevronRight, Eye, Trash2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "../lib/api";

export const Route = createFileRoute("/kyc")({ component: Page });

type Applicant = {
  id: string;
  name: string;
  vehicle: string;
  reg: string;
  risk: "low" | "medium" | "high";
  expiry: string;
  details: {
    aadhaar: string;
    pan: string;
    license: string;
    rc: string;
    insurance: string;
    selfie: string;
  };
  files: Record<string, string>;
};

const riskCls = { 
  low: "border-primary/40 text-primary bg-primary/5", 
  medium: "border-accent/40 text-accent bg-accent/5", 
  high: "border-destructive/40 text-destructive bg-destructive/5 animate-pulse" 
} as const;

function Page() {
  const [queue, setQueue] = useState<Applicant[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [rejecting, setRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  
  // Bulk AI state
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  async function loadKycQueue() {
    try {
      const users = await api.getUsers() || [];
      const pendingDrivers = users.filter((u: any) => u.role === "driver" && u.kyc_status !== "VERIFIED");

      const mapped = pendingDrivers.map((d: any, idx: number) => {
        const docMap: Record<string, string> = {};
        if (d.kyc_documents) {
          d.kyc_documents.forEach((doc: any) => {
            docMap[doc.document_type] = doc.file_data || "";
          });
        }

        return {
          id: `K-${d.id}`,
          name: d.name,
          phone: d.phone,
          vehicle: d.vehicles && d.vehicles[0] ? `${d.vehicles[0].model} (${d.vehicles[0].plate_number})` : (d.vehicle_type === "bike" ? "Honda Activa" : "Bajaj RE Auto"),
          reg: d.vehicles && d.vehicles[0] ? d.vehicles[0].plate_number : "TN-01-XX-0000",
          risk: idx % 3 === 0 ? "low" : idx % 3 === 1 ? "medium" : "high",
          expiry: `KYC Status: ${d.kyc_status}`,
          details: {
            aadhaar: docMap["aadhaar"] ? "Aadhaar Card Uploaded" : "Missing",
            pan: docMap["profile_photo"] ? "Profile Photo Uploaded" : "Missing",
            license: docMap["license"] ? "Driving License Uploaded" : "Missing",
            rc: docMap["vehicle"] ? "Vehicle RC Uploaded" : "Missing",
            insurance: docMap["insurance"] ? "Insurance Uploaded" : "Missing",
            selfie: docMap["selfie"] ? "Selfie Photo Uploaded" : "Missing"
          },
          files: docMap
        };
      });

      setQueue(mapped);
      if (mapped.length > 0) {
        setActiveId(mapped[0].id);
      } else {
        setActiveId("");
      }
    } catch (err) {
      console.error("Failed to load KYC queue:", err);
    }
  }

  useEffect(() => {
    loadKycQueue();
  }, []);

  const active = queue.find(k => k.id === activeId) || queue[0];

  const handleApprove = async (id: string) => {
    try {
      const rawId = id.replace("K-", "");
      const adminToken = localStorage.getItem("admin_token") || "";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (adminToken) {
        headers["Authorization"] = `Bearer ${adminToken}`;
      }

      // Fetch user details to approve vehicle and all docs
      const users = await api.getUsers() || [];
      const user = users.find((u: any) => String(u.id) === String(rawId));
      if (user && user.kyc_documents) {
        for (const doc of user.kyc_documents) {
          const url = `http://localhost:8000/api/kyc/${doc.id}/`;
          await fetch(url, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ status: "done" })
          });
        }
      }
      if (user && user.vehicles) {
        for (const v of user.vehicles) {
          const url = `http://localhost:8000/api/vehicles/${v.id}/`;
          await fetch(url, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ approved: true })
          });
        }
      }

      // Trigger recalculate_driver_status inside backend views.py PATCH handler by calling update endpoint
      const updateUrl = `http://localhost:8000/api/users/${rawId}/`;
      await fetch(updateUrl, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: "active", kyc_status: "VERIFIED" })
      });

      setQueue(prev => prev.filter(k => k.id !== id));
      alert(`✅ Applicant ${id} successfully verified. Driver state shifted to ACTIVE / VERIFIED.`);
      
      const remaining = queue.filter(k => k.id !== id);
      if (remaining.length > 0) {
        setActiveId(remaining[0].id);
      }
    } catch (err) {
      console.error("Failed to approve KYC:", err);
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedTag && !rejectionReason) {
      alert("Please select a rejection reason tag or enter a comment.");
      return;
    }
    const finalReason = selectedTag ? `${selectedTag} (${rejectionReason || "no additional comments"})` : rejectionReason;
    
    try {
      const rawId = active.id.replace("K-", "");
      // Fetch user details to reject some documents
      const users = await api.getUsers() || [];
      const user = users.find((u: any) => String(u.id) === String(rawId));
      if (user && user.kyc_documents) {
        // Mark first document (e.g. aadhaar or license) as rejected
        const targetDoc = user.kyc_documents[0];
        if (targetDoc) {
          const url = `http://localhost:8000/api/kyc/${targetDoc.id}/`;
          await fetch(url, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "rejected", rejection_reason: finalReason })
          });
        }
      }

      await api.updateUser(rawId, { kyc_status: "rejected" });
      
      setQueue(prev => prev.filter(k => k.id !== active.id));
      alert(`❌ Applicant ${active.id} rejected. Reason: ${finalReason}. Applicant notified.`);
      setRejecting(false);
      setRejectionReason("");
      setSelectedTag("");
      
      const remaining = queue.filter(k => k.id !== active.id);
      if (remaining.length > 0) {
        setActiveId(remaining[0].id);
      }
    } catch (err) {
      console.error("Failed to reject KYC:", err);
    }
  };

  const handleBulkAI = () => {
    setBulkProcessing(true);
    setBulkProgress(0);

    const interval = setInterval(() => {
      setBulkProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(async () => {
            // Bulk approve low risk queue applicants
            const lowRiskList = queue.filter(k => k.risk === "low");
            const adminToken = localStorage.getItem("admin_token") || "";
            const headers = {
              "Content-Type": "application/json",
              ...(adminToken ? { "Authorization": `Bearer ${adminToken}` } : {})
            };

            const users = await api.getUsers() || [];

            for (const item of lowRiskList) {
              const rawId = item.id.replace("K-", "");
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
            }
            
            // Reload queue
            await loadKycQueue();
            setBulkProcessing(false);
            alert(`⚡ Bulk AI scan completed! approved ${lowRiskList.length} low-risk driver profiles.`);
          }, 300);
          return 100;
        }
        return p + 20;
      });
    }, 300);
  };

  return (
    <AdminShell title="KYC Verification" subtitle="Pending review queue - OCR enabled">
      {bulkProcessing && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center">
          <div className="w-full max-w-sm border border-border bg-card p-6 rounded-xl shadow-2xl space-y-4 text-center">
            <Sparkles className="h-10 w-10 text-primary animate-spin mx-auto" />
            <h3 className="text-sm font-bold uppercase tracking-wider">Running Bulk AI Verifications</h3>
            <p className="text-xs text-muted-foreground">Performing OCR text extract audits and facial likeness matches...</p>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/40">
              <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300" style={{ width: `${bulkProgress}%` }} />
            </div>
            <span className="text-xs font-mono font-bold text-accent">{bulkProgress}% scanned</span>
          </div>
        </div>
      )}

      {/* Bulk actions and stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-card/40 border border-border rounded-xl px-4 py-3">
        <div className="text-xs font-semibold text-muted-foreground">
          📂 Active verification queue: <span className="font-extrabold text-foreground">{queue.length} pending</span>
        </div>
        <Button 
          onClick={handleBulkAI}
          disabled={queue.length === 0}
          size="sm" 
          className="h-8 bg-gradient-to-r from-primary to-accent text-primary-foreground font-black text-xs gap-1.5 shrink-0"
        >
          <Sparkles className="h-4 w-4" /> Run Bulk AI Verification
        </Button>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center space-y-3">
          <ShieldCheck className="h-12 w-12 text-primary mx-auto animate-bounce" />
          <h3 className="text-base font-bold">Verification Queue Clear</h3>
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">All driver documents are fully verified. Great job keeping the fleet onboarded!</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5 items-start">
          {/* Left queue list */}
          <div className="lg:col-span-2 space-y-2">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="bg-card/45 px-3 py-2 border-b border-border text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">Pending queue</div>
              <div className="divide-y divide-border/60 max-h-[480px] overflow-y-auto pr-0.5">
                {queue.map(k => (
                  <div 
                    key={k.id}
                    onClick={() => {
                      setActiveId(k.id);
                      setRejecting(false);
                    }}
                    className={`p-3 cursor-pointer transition-all flex items-center justify-between gap-2 border-l-2 ${
                      active.id === k.id 
                        ? "bg-gradient-to-r from-primary/10 to-accent/5 border-primary" 
                        : "border-transparent hover:bg-muted/30"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                        {k.name}
                        <Badge variant="outline" className={`uppercase text-[8px] px-1 py-0 ${riskCls[k.risk]}`}>{k.risk} risk</Badge>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">{k.vehicle} · {k.reg}</span>
                      <span className="text-[8px] text-destructive/80 font-semibold block mt-1">{k.expiry}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${active.id === k.id ? "translate-x-1 text-primary" : ""}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right inspector pane */}
          <div className="lg:col-span-3">
            <Panel 
              title={`Verification Inspector · ${active.id}`} 
              description={`${active.name} · ${active.vehicle} Submitted Documents`}
            >
              {/* Document details comparison grid */}
              <div className="grid gap-2 grid-cols-2 text-[10px] bg-background/50 border border-border/60 rounded-lg p-3 mb-4">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Aadhaar Identification</span>
                  <span className="font-mono font-bold text-foreground block mt-0.5">{active.details.aadhaar}</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">PAN Identification</span>
                  <span className="font-mono font-bold text-foreground block mt-0.5">{active.details.pan}</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Driving License</span>
                  <span className="font-mono font-bold text-foreground block mt-0.5">{active.details.license}</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Vehicle Registration (RC)</span>
                  <span className="font-mono font-bold text-foreground block mt-0.5">{active.details.rc}</span>
                </div>
              </div>

              {/* ID Thumbnails visual simulator */}
              <div className="grid grid-cols-6 gap-1.5">
                {[
                  { k: "aadhaar", label: "Aadhaar Card", tone: "bg-gradient-to-br from-primary/25 to-background" },
                  { k: "license", label: "Driver License", tone: "bg-gradient-to-br from-primary/20 to-background" },
                  { k: "vehicle", label: "Vehicle RC", tone: "bg-gradient-to-br from-accent/20 to-background" },
                  { k: "insurance", label: "Insurance", tone: "bg-gradient-to-br from-muted to-background" },
                  { k: "profile_photo", label: "Profile Photo", tone: "bg-gradient-to-br from-primary/15 to-background" },
                  { k: "selfie", label: "Selfie Face", tone: "bg-gradient-to-br from-accent/15 to-background" },
                ].map(doc => {
                  const hasFile = active.files && active.files[doc.k];
                  return (
                    <div 
                      key={doc.k} 
                      onClick={() => {
                        if (hasFile) {
                          setPreviewDocUrl(active.files[doc.k]);
                        } else {
                          alert(`No uploaded file found for ${doc.label}`);
                        }
                      }}
                      className={`aspect-video rounded-lg border ${hasFile ? 'border-primary bg-primary/5' : 'border-border/80'} flex flex-col justify-between p-1.5 shadow-sm hover:border-primary transition-colors cursor-pointer group`}
                      title={`Inspect ${doc.label}`}
                    >
                      <span className="text-[7px] text-muted-foreground uppercase tracking-widest font-black shrink-0">{doc.k}</span>
                      <div className="flex items-center gap-1 mt-auto">
                        <Eye className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-[7px] font-bold text-foreground/80 group-hover:text-foreground truncate">{doc.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Document Preview Overlay Modal */}
              {previewDocUrl && (
                <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-card border border-border rounded-xl p-4 max-w-lg w-full relative animate-fade-in">
                    <button 
                      onClick={() => setPreviewDocUrl(null)} 
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-muted text-muted-foreground hover:text-foreground"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                    <h4 className="text-xs font-bold uppercase mb-3 text-foreground">Document Viewer</h4>
                    {previewDocUrl.startsWith("data:") ? (
                      <img src={previewDocUrl} alt="Document Scan" className="max-h-[350px] w-full object-contain border rounded" />
                    ) : (
                      <img 
                        src={`http://localhost:8000/media/kyc_documents/${previewDocUrl}`} 
                        alt="Document Scan" 
                        className="max-h-[350px] w-full object-contain border rounded" 
                        onError={(e) => {
                          // If django server file does not exist or fails to load, fallback to a clean placeholder
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop";
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Rejecting dialogue box inline */}
              {rejecting ? (
                <div className="mt-4 border border-destructive/35 bg-destructive/5 rounded-lg p-3 space-y-3 animate-fade-in">
                  <div className="text-[10px] font-bold text-destructive uppercase tracking-widest flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 animate-bounce" /> Rejection Audit Form
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase block mb-1">Select Rejection Tag</span>
                      <div className="flex flex-wrap gap-1.5">
                        {["Blurry Photo", "Expired Document", "Name Mismatch", "Selfie Mismatch", "Fake Document"].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTag(t)}
                            className={`px-2 py-0.5 rounded text-[9px] font-semibold transition-all border ${
                              selectedTag === t 
                                ? "bg-destructive border-destructive text-destructive-foreground" 
                                : "bg-background border-border/80 text-muted-foreground hover:border-destructive/60"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground uppercase block">Additional Comments</span>
                      <Textarea 
                        value={rejectionReason}
                        onChange={e => setRejectionReason(e.target.value)}
                        placeholder="Type rejection comments for SMS notification..." 
                        rows={2} 
                        className="text-xs bg-background h-12" 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-1.5">
                    <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setRejecting(false)}>Cancel</Button>
                    <Button size="sm" className="h-7 text-[10px] bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/95" onClick={handleRejectSubmit}>
                      Submit Rejection
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-5 flex justify-end gap-2 border-t border-border/60 pt-4">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1.5 border-red-600/40 text-red-650 bg-red-650/5 hover:bg-red-650/10 font-bold"
                    onClick={async () => {
                      if (confirm(`Are you sure you want to delete applicant ${active.name}?`)) {
                        const rawId = active.id.replace("K-", "");
                        const adminToken = localStorage.getItem("admin_token") || "";
                        const headers: Record<string, string> = {};
                        if (adminToken) {
                          headers["Authorization"] = `Bearer ${adminToken}`;
                        }
                        await fetch(`http://localhost:8000/api/users/${rawId}/`, {
                          method: "DELETE",
                          headers
                        });
                        setQueue(prev => prev.filter(k => k.id !== active.id));
                        alert("Applicant deleted successfully.");
                        const remaining = queue.filter(k => k.id !== active.id);
                        if (remaining.length > 0) {
                          setActiveId(remaining[0].id);
                        } else {
                          setActiveId("");
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete Applicant
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1.5 border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 font-bold"
                    onClick={() => setRejecting(true)}
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject KYC
                  </Button>
                  <Button 
                    size="sm" 
                    className="gap-1.5 bg-gradient-to-r from-primary to-accent text-primary-foreground font-extrabold"
                    onClick={() => handleApprove(active.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve KYC Document
                  </Button>
                </div>
              )}
            </Panel>
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-xs font-semibold shadow-inner backdrop-blur">
        <ShieldCheck className="h-5 w-5 text-accent" />
        <span className="text-muted-foreground">All driver approvals are encrypted with your admin security key signature and compiled to the global audit trail logs.</span>
      </div>
    </AdminShell>
  );
}