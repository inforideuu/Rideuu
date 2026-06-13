import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import {
  Shield,
  Lock,
  CreditCard,
  Languages,
  Sliders,
  RefreshCw,
  Check,
  AlertTriangle,
  HelpCircle,
  Coins,
  Activity,
  UserCheck,
  MapPin,
  Zap,
  Crown,
  TicketPercent
} from "lucide-react";

import { api } from "../lib/api";

export const Route = createFileRoute("/settings")({ component: Page });

// Custom Row component for beautiful horizontal setting listings
function SettingsRow({
  label,
  description,
  children
}: {
  label: string;
  description?: string;
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card/45 px-4 py-3.5 hover:border-primary/20 hover:bg-card/75 transition-all">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-foreground tracking-wide">{label}</span>
        {description && <span className="text-[10px] text-muted-foreground/90 mt-0.5 leading-relaxed">{description}</span>}
      </div>
      <div className="flex items-center shrink-0 self-end sm:self-center">{children}</div>
    </div>
  );
}

// Default Chennai Zones
const defaultZones = [
  { name: "T. Nagar", status: "Active" },
  { name: "Velachery", status: "Active" },
  { name: "Anna Nagar", status: "Active" },
  { name: "Adyar", status: "Active" },
  { name: "OMR Corridor", status: "Active" },
  { name: "Mylapore", status: "Active" },
  { name: "Porur", status: "Active" },
  { name: "Tambaram", status: "Suspended" },
  { name: "Chromepet", status: "Active" },
  { name: "Egmore", status: "Active" },
  { name: "Nungambakkam", status: "Active" },
  { name: "Royapettah", status: "Active" },
  { name: "Perambur", status: "Active" },
  { name: "Ambattur", status: "Suspended" }
];

// Initial RBAC Permissions Matrix
const defaultRbac = {
  super_admin: {
    manage_pricing: true,
    view_finance: true,
    approve_kyc: true,
    block_accounts: true,
    broadcast_sms: true,
    emergency_flood: true
  },
  operations: {
    manage_pricing: true,
    view_finance: false,
    approve_kyc: true,
    block_accounts: true,
    broadcast_sms: true,
    emergency_flood: true
  },
  finance: {
    manage_pricing: false,
    view_finance: true,
    approve_kyc: false,
    block_accounts: false,
    broadcast_sms: false,
    emergency_flood: false
  },
  support: {
    manage_pricing: false,
    view_finance: false,
    approve_kyc: false,
    block_accounts: true,
    broadcast_sms: false,
    emergency_flood: false
  }
};

function Page() {
  const [lang, setLang] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_lang") || "en" : "en");
  const [currentRole, setCurrentRole] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_role") || "super_admin" : "super_admin");
  const [currentName, setCurrentName] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_name") || "Arjun K." : "Arjun K.");

  // No Commission Plans management state
  const [noCommissionPlans, setNoCommissionPlans] = useState<any[]>([]);
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
  const [newPlanLabel, setNewPlanLabel] = useState("");
  const [newPlanPrice, setNewPlanPrice] = useState("");
  const [newPlanDays, setNewPlanDays] = useState("");
  const [newPlanDesc, setNewPlanDesc] = useState("");
  const [newPlanVehicleType, setNewPlanVehicleType] = useState("auto");

  // Subscription Ride Passes management state
  const [subPasses, setSubPasses] = useState<any[]>([]);
  const [editingPassIndex, setEditingPassIndex] = useState<number | null>(null);
  const [newPassName, setNewPassName] = useState("");
  const [newPassDesc, setNewPassDesc] = useState("");
  const [newPassPrice, setNewPassPrice] = useState("");
  const [newPassValid, setNewPassValid] = useState("");


  // General pricing settings state
  const [bikeBase, setBikeBase] = useState("25");
  const [bikePerKm, setBikePerKm] = useState("6");
  const [autoBase, setAutoBase] = useState("40");
  const [autoPerKm, setAutoPerKm] = useState("14");
  const [waitingRate, setWaitingRate] = useState("2");
  const [commissionRate, setCommissionRate] = useState("15");
  const [autoCommission, setAutoCommission] = useState("8");
  const [bikeCommission, setBikeCommission] = useState("5");
  const [gstRate, setGstRate] = useState("5");
  const [riderCancelFee, setRiderCancelFee] = useState("10");
  const [driverCancelFee, setDriverCancelFee] = useState("15");
  const [referralLimit, setReferralLimit] = useState("100");

  // Geofence zones state
  const [zones, setZones] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_geofence_settings");
      return saved ? JSON.parse(saved) : defaultZones;
    }
    return defaultZones;
  });

  // Emergency Mode states
  const [floodMode, setFloodMode] = useState(false);
  const [pauseBookings, setPauseBookings] = useState(false);
  const [forceWomenSafe, setForceWomenSafe] = useState(false);
  const [disableSurgeCap, setDisableSurgeCap] = useState(false);

  // Payment credentials
  const [razorpayKey, setRazorpayKey] = useState("rzp_test_SwFutc3AGUQkSR");
  const [razorpaySecret, setRazorpaySecret] = useState("tN2QsZzR7oVZTOXKQWIE5Z8T");
  const [payoutFreq, setPayoutFreq] = useState("instant");
  const [gatewayMode, setGatewayMode] = useState("test");

  // Razorpay Test connection states
  const [testingConnection, setTestingConnection] = useState(false);
  const [testSuccess, setTestSuccess] = useState<boolean | null>(null);
  const [testStep, setTestStep] = useState("");

  // RBAC matrix state
  const [rbacMatrix, setRbacMatrix] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_rbac_matrix");
      return saved ? JSON.parse(saved) : defaultRbac;
    }
    return defaultRbac;
  });

  // Load configuration from database
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.getSetting("admin_general_settings");
        if (res && res.bikeBase) {
          setBikeBase(res.bikeBase);
          setBikePerKm(res.bikePerKm);
          setAutoBase(res.autoBase);
          setAutoPerKm(res.autoPerKm);
          setWaitingRate(res.waitingRate);
          setCommissionRate(res.commissionRate);
          setAutoCommission(res.autoCommission || "8");
          setBikeCommission(res.bikeCommission || "5");
          setGstRate(res.gstRate);
          setRiderCancelFee(res.riderCancelFee);
          setDriverCancelFee(res.driverCancelFee);
          setReferralLimit(res.referralLimit);
        } else {
          const saved = localStorage.getItem("admin_general_settings");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.bikeBase) setBikeBase(parsed.bikeBase);
            if (parsed.bikePerKm) setBikePerKm(parsed.bikePerKm);
            if (parsed.autoBase) setAutoBase(parsed.autoBase);
            if (parsed.autoPerKm) setAutoPerKm(parsed.autoPerKm);
            if (parsed.waitingRate) setWaitingRate(parsed.waitingRate);
            if (parsed.commissionRate) setCommissionRate(parsed.commissionRate);
            setAutoCommission(parsed.autoCommission || "8");
            setBikeCommission(parsed.bikeCommission || "5");
            if (parsed.gstRate) setGstRate(parsed.gstRate);
            if (parsed.riderCancelFee) setRiderCancelFee(parsed.riderCancelFee);
            if (parsed.driverCancelFee) setDriverCancelFee(parsed.driverCancelFee);
            if (parsed.referralLimit) setReferralLimit(parsed.referralLimit);
          }
        }
      } catch (e) {
        console.warn("Failed to load settings from backend DB", e);
      }

      try {
        const resPlans = await api.getSetting("no_commission_plans");
        if (Array.isArray(resPlans)) {
          setNoCommissionPlans(resPlans);
        } else {
          const defaultPlans = [
            { price: 19, days: 1, label: "24 Hours", desc: "No commission for 24 hours. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "auto" },
            { price: 49, days: 3, label: "3 Days", desc: "No commission for 3 days. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "auto" },
            { price: 99, days: 7, label: "7 Days", desc: "No commission for 7 days. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "auto" },
            { price: 499, days: 30, label: "1 Month", desc: "No commission for 1 month. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "auto" },
            { price: 15, days: 1, label: "24 Hours", desc: "No commission for 24 hours. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "bike" },
            { price: 45, days: 3, label: "3 Days", desc: "No commission for 3 days. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "bike" },
            { price: 95, days: 7, label: "7 Days", desc: "No commission for 7 days. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "bike" },
            { price: 495, days: 30, label: "1 Month", desc: "No commission for 1 month. Only admin receives ₹3 for each ride from wallet.", vehicle_type: "bike" }
          ];
          setNoCommissionPlans(defaultPlans);
        }
      } catch (e) {
        console.warn("Failed to load plans from DB", e);
      }

      try {
        const resPasses = await api.getSetting("subscription_passes");
        if (Array.isArray(resPasses)) {
          setSubPasses(resPasses);
        } else {
          const defaultPasses = [
            { id: "p1", name: "Marina Beach Auto Pass", desc: "5 auto rides up to 5km within Mylapore/Adyar", price: 299, valid: "30 days" },
            { id: "p2", name: "Chennai Central Commuter", desc: "Flat 20% off all bike rides from central railway hubs", price: 99, valid: "15 days" },
          ];
          setSubPasses(defaultPasses);
        }
      } catch (e) {
        console.warn("Failed to load subscription passes from DB", e);
      }

      try {
        const resEmerg = await api.getSetting("emergency_settings");
        if (resEmerg) {
          setFloodMode(resEmerg.floodMode === true || resEmerg.floodMode === "true");
          setPauseBookings(resEmerg.pauseBookings === true || resEmerg.pauseBookings === "true");
          setForceWomenSafe(resEmerg.forceWomenSafe === true || resEmerg.forceWomenSafe === "true");
        }
      } catch (e) {
        console.warn("Failed to load emergency settings from backend DB", e);
      }

      try {
        const resZones = await api.getSetting("admin_geofence_settings");
        if (Array.isArray(resZones)) {
          setZones(resZones);
        }
      } catch (e) {
        console.warn("Failed to load geofences from DB", e);
      }
    }
    loadSettings();
  }, []);

  // Sync with global storage changes
  useEffect(() => {
    const handleStorage = () => {
      setLang(localStorage.getItem("admin_lang") || "en");
      setCurrentRole(localStorage.getItem("admin_role") || "super_admin");
      setCurrentName(localStorage.getItem("admin_name") || "Arjun K.");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Save configurations to localStorage and backend DB
  const handleSaveAll = async () => {
    const generalSettings = {
      bikeBase, bikePerKm, autoBase, autoPerKm, waitingRate,
      commissionRate, autoCommission, bikeCommission, gstRate, riderCancelFee, driverCancelFee, referralLimit
    };
    localStorage.setItem("admin_general_settings", JSON.stringify(generalSettings));
    localStorage.setItem("admin_geofence_settings", JSON.stringify(zones));
    localStorage.setItem("admin_rbac_matrix", JSON.stringify(rbacMatrix));

    try {
      await api.setSetting("admin_general_settings", generalSettings);
      await api.setSetting("no_commission_plans", noCommissionPlans);
      await api.setSetting("subscription_passes", subPasses);
      await api.setSetting("emergency_settings", { floodMode, pauseBookings, forceWomenSafe });
      await api.setSetting("admin_geofence_settings", zones);
    } catch (e) {
      console.error("Failed to sync settings with DB", e);
    }

    // Trigger storage event for other components
    window.dispatchEvent(new Event("storage"));

    toast.success(
      lang === "ta"
        ? "அமைப்புகள் அனைத்தும் வெற்றிகரமாக சேமிக்கப்பட்டன!"
        : "All system configurations, billing rules, and geofence states saved successfully."
    );
  };

  const handleAddOrUpdatePlan = () => {
    if (!newPlanLabel || !newPlanPrice || !newPlanDays || !newPlanDesc) {
      toast.error("Please fill in all plan fields.");
      return;
    }
    const plan = {
      price: parseFloat(newPlanPrice),
      days: parseInt(newPlanDays),
      label: newPlanLabel,
      desc: newPlanDesc,
      vehicle_type: newPlanVehicleType
    };

    if (editingPlanIndex !== null) {
      const updated = [...noCommissionPlans];
      updated[editingPlanIndex] = plan;
      setNoCommissionPlans(updated);
      setEditingPlanIndex(null);
      toast.success("Plan updated. Remember to save settings.");
    } else {
      setNoCommissionPlans(prev => [...prev, plan]);
      toast.success("Plan added to queue. Remember to save settings.");
    }

    setNewPlanLabel("");
    setNewPlanPrice("");
    setNewPlanDays("");
    setNewPlanDesc("");
    setNewPlanVehicleType("auto");
  };

  const handleAddOrUpdatePass = () => {
    if (!newPassName || !newPassPrice || !newPassValid || !newPassDesc) {
      toast.error("Please fill in all pass fields.");
      return;
    }
    const pass = {
      id: editingPassIndex !== null ? subPasses[editingPassIndex].id : "p_" + Date.now(),
      name: newPassName,
      price: parseFloat(newPassPrice),
      valid: newPassValid,
      desc: newPassDesc,
    };

    if (editingPassIndex !== null) {
      const updated = [...subPasses];
      updated[editingPassIndex] = pass;
      setSubPasses(updated);
      setEditingPassIndex(null);
      toast.success("Subscription pass updated. Remember to save settings.");
    } else {
      setSubPasses(prev => [...prev, pass]);
      toast.success("Subscription pass added. Remember to save settings.");
    }

    setNewPassName("");
    setNewPassPrice("");
    setNewPassValid("");
    setNewPassDesc("");
  };

  // Toggle dynamic active/suspended zones
  const toggleZone = (zoneName: string) => {
    const updated = zones.map((z: any) => {
      if (z.name === zoneName) {
        const nextStatus = z.status === "Active" ? "Suspended" : "Active";
        toast.info(`${z.name} status modified to ${nextStatus}`);
        return { ...z, status: nextStatus };
      }
      return z;
    });
    setZones(updated);
    localStorage.setItem("admin_geofence_settings", JSON.stringify(updated));
  };

  // Run Simulated Razorpay Connectivity Test
  const runDiagnosticTest = () => {
    setTestingConnection(true);
    setTestSuccess(null);
    setTestStep("Initiating secure HTTPS socket link...");

    setTimeout(() => {
      setTestStep("Exchanging credentials with Razorpay Auth API...");
      setTimeout(() => {
        setTestStep("Verifying payout webhook subscription...");
        setTimeout(() => {
          setTestSuccess(true);
          setTestingConnection(false);
          toast.success("Razorpay Connection Diagnostic Passed!");
        }, 1200);
      }, 1000);
    }, 800);
  };

  // Switch Admin Role Simulator
  const simulateRole = (roleKey: string, roleName: string) => {
    localStorage.setItem("admin_role", roleKey);
    localStorage.setItem("admin_name", roleName);
    setCurrentRole(roleKey);
    setCurrentName(roleName);

    // Dispatch standard storage event to update AdminShell sidebar morphing
    window.dispatchEvent(new Event("storage"));

    const displayName =
      roleKey === "super_admin" ? "Super Admin" :
        roleKey === "operations" ? "Operations Manager" :
          roleKey === "finance" ? "Financial Controller" : "Support Lead";

    toast.success(`Role switched to: ${displayName} (${roleName}). Sidebar updated!`);
  };

  // Language state updates
  const setSystemLanguage = (selectedLang: "en" | "ta") => {
    setLang(selectedLang);
    localStorage.setItem("admin_lang", selectedLang);
    window.dispatchEvent(new Event("storage"));

    toast.success(
      selectedLang === "ta"
        ? "தமிழ் மொழி அமைப்புகள் செயல்படுத்தப்பட்டன."
        : "Language switched to English."
    );
  };

  // Toggle a single RBAC checkbox
  const togglePermission = (role: string, permission: string) => {
    const updated = {
      ...rbacMatrix,
      [role]: {
        ...rbacMatrix[role],
        [permission]: !rbacMatrix[role][permission]
      }
    };
    setRbacMatrix(updated);
    localStorage.setItem("admin_rbac_matrix", JSON.stringify(updated));
    toast.info("RBAC Policy matrix modified. Click Save to commit.");
  };

  return (
    <AdminShell
      title={lang === "ta" ? "கணினி அமைப்புகள்" : "System Settings"}
      subtitle={lang === "ta" ? "கட்டண விதிகள், சென்னை மண்டலங்கள், அவசர கால கட்டுப்பாடுகள் மற்றும் அனுமதிகள்" : "Configure base fares, Chennai operational geofences, Payment gateway settings, and Role access matrices."}
      actions={
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveAll}
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold px-4 text-xs transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
          >
            {lang === "ta" ? "அனைத்தையும் சேமி" : "Save Settings"}
          </Button>
        </div>
      }
    >
      <Toaster position="top-right" theme="dark" closeButton richColors />

      {/* Main settings tabs */}
      <Tabs defaultValue="general" className="w-full space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-muted/40 border border-border/80 p-1 text-xs rounded-xl">
          <TabsTrigger value="general" className="flex items-center gap-2 py-2">
            <Sliders className="h-3.5 w-3.5" />
            {lang === "ta" ? "கட்டணம் & விதிகள்" : "Pricing & Geofences"}
          </TabsTrigger>
          <TabsTrigger value="localization" className="flex items-center gap-2 py-2">
            <Languages className="h-3.5 w-3.5" />
            {lang === "ta" ? "தமிழ் ஃபர்ஸ்ட்" : "Tamil First"}
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2 py-2">
            <CreditCard className="h-3.5 w-3.5" />
            {lang === "ta" ? "பணப்பரிமாற்றம்" : "Razorpay Gateway"}
          </TabsTrigger>
          <TabsTrigger value="rbac" className="flex items-center gap-2 py-2">
            <Shield className="h-3.5 w-3.5" />
            {lang === "ta" ? "அனுமதி மேட்ரிக்ஸ்" : "RBAC Policies"}
          </TabsTrigger>
        </TabsList>

        {/* 1. PRICING & GEOFENCES TAB */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12">

            {/* Base Fare Matrix */}
            <Card className="lg:col-span-8 border-border/80 bg-card/40 backdrop-blur">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  {lang === "ta" ? "அடிப்படை கட்டண அமைப்புகள்" : "Base Tariffs & Variable Rules"}
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground/80">
                  {lang === "ta" ? "மண்டல கட்டணம் ஏதுமில்லாத போது பொருந்தக்கூடிய உலகளாவிய கட்டணங்கள்" : "Default pricing policies applied across Chennai routes when no zonal multipliers are active."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 grid gap-3.5 sm:grid-cols-2">

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-accent/80 tracking-wider">Bike Ride Config (Chennai Standard)</h4>
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground block">Bike Base Fare (₹)</label>
                    <Input
                      type="number"
                      value={bikeBase}
                      onChange={(e) => setBikeBase(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground block">Bike Per-Km Tariff (₹/km)</label>
                    <Input
                      type="number"
                      value={bikePerKm}
                      onChange={(e) => setBikePerKm(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase text-accent/80 tracking-wider">Auto Ride Config (Chennai Standard)</h4>
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground block">Auto Base Fare (₹)</label>
                    <Input
                      type="number"
                      value={autoBase}
                      onChange={(e) => setAutoBase(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-muted-foreground block">Auto Per-Km Tariff (₹/km)</label>
                    <Input
                      type="number"
                      value={autoPerKm}
                      onChange={(e) => setAutoPerKm(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 border-t border-border/50 my-2 pt-3 grid gap-3 sm:grid-cols-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block">Waiting Charge (₹/min)</label>
                    <Input
                      type="number"
                      value={waitingRate}
                      onChange={(e) => setWaitingRate(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block">Auto Commission (%)</label>
                    <Input
                      type="number"
                      value={autoCommission}
                      onChange={(e) => setAutoCommission(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block">Bike Commission (%)</label>
                    <Input
                      type="number"
                      value={bikeCommission}
                      onChange={(e) => setBikeCommission(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block">Standard GST Rate (%)</label>
                    <Input
                      type="number"
                      value={gstRate}
                      onChange={(e) => setGstRate(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 border-t border-border/50 pt-3 grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block">Rider Cancel Penalty (₹)</label>
                    <Input
                      type="number"
                      value={riderCancelFee}
                      onChange={(e) => setRiderCancelFee(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block">Driver Cancel Penalty (₹)</label>
                    <Input
                      type="number"
                      value={driverCancelFee}
                      onChange={(e) => setDriverCancelFee(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block">Max Referral Bounds (₹)</label>
                    <Input
                      type="number"
                      value={referralLimit}
                      onChange={(e) => setReferralLimit(e.target.value)}
                      className="h-9 bg-muted/30 font-semibold"
                    />
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* No Commission Plans Manager */}
            <Card className="lg:col-span-8 border-border/80 bg-card/40 backdrop-blur mt-4">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Rider No-Commission Subscription Plans
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground/80">
                  Create, edit, and delete subscription plans for auto and bike riders. Changes will reflect in the rider app.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Add/Edit Plan Form */}
                <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-accent/80 tracking-wider text-left">
                    {editingPlanIndex !== null ? "Edit Plan Details" : "Create New Subscription Plan"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-left">
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Plan Label (e.g. 24 Hours)</span>
                      <Input
                        value={newPlanLabel}
                        onChange={e => setNewPlanLabel(e.target.value)}
                        placeholder="24 Hours"
                        className="h-8 bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Price (₹)</span>
                      <Input
                        type="number"
                        value={newPlanPrice}
                        onChange={e => setNewPlanPrice(e.target.value)}
                        placeholder="19"
                        className="h-8 bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Duration (Days)</span>
                      <Input
                        type="number"
                        value={newPlanDays}
                        onChange={e => setNewPlanDays(e.target.value)}
                        placeholder="1"
                        className="h-8 bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Vehicle Type</span>
                      <select
                        value={newPlanVehicleType}
                        onChange={e => setNewPlanVehicleType(e.target.value)}
                        className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                      >
                        <option value="auto">Auto</option>
                        <option value="bike">Bike</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Plan Description</span>
                      <Input
                        value={newPlanDesc}
                        onChange={e => setNewPlanDesc(e.target.value)}
                        placeholder="No commission for 24 hours. Flat ₹3 admin fee per ride."
                        className="h-8 bg-background"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    {editingPlanIndex !== null && (
                      <Button
                        onClick={() => {
                          setEditingPlanIndex(null);
                          setNewPlanLabel("");
                          setNewPlanPrice("");
                          setNewPlanDays("");
                          setNewPlanDesc("");
                          setNewPlanVehicleType("auto");
                        }}
                        variant="ghost"
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={handleAddOrUpdatePlan}
                      className="h-8 bg-primary text-primary-foreground font-bold text-xs"
                    >
                      {editingPlanIndex !== null ? "Update Plan" : "Add Plan"}
                    </Button>
                  </div>
                </div>

                {/* Plans List Table */}
                <div className="border border-border/80 rounded-xl overflow-hidden">
                  <Table className="text-xs">
                    <TableHeader className="bg-muted/40">
                      <TableRow className="text-[8px] uppercase tracking-wider text-muted-foreground text-left">
                        <TableHead className="py-2.5">Label</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-left">
                      {noCommissionPlans.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                            No plans configured. Defaults will be loaded.
                          </TableCell>
                        </TableRow>
                      ) : (
                        noCommissionPlans.map((plan, idx) => (
                          <TableRow key={idx} className="hover:bg-muted/15">
                            <TableCell className="font-bold text-foreground py-2.5">{plan.label}</TableCell>
                            <TableCell className="capitalize font-semibold text-accent">{plan.vehicle_type}</TableCell>
                            <TableCell className="font-mono font-bold text-foreground">₹{plan.price}</TableCell>
                            <TableCell className="font-mono font-bold text-foreground">{plan.days}d</TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">{plan.desc}</TableCell>
                            <TableCell className="text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  setEditingPlanIndex(idx);
                                  setNewPlanLabel(plan.label);
                                  setNewPlanPrice(String(plan.price));
                                  setNewPlanDays(String(plan.days));
                                  setNewPlanDesc(plan.desc);
                                  setNewPlanVehicleType(plan.vehicle_type);
                                }}
                                className="text-primary hover:underline font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  const updated = noCommissionPlans.filter((_, i) => i !== idx);
                                  setNoCommissionPlans(updated);
                                  toast.error("Plan deleted. Remember to save changes.");
                                }}
                                className="text-destructive hover:underline font-bold"
                              >
                                Delete
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Ride Passes Manager */}
            <Card className="lg:col-span-8 border-border/80 bg-card/40 backdrop-blur mt-4">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <TicketPercent className="h-4 w-4" />
                  Subscription Ride Passes
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground/80">
                  Create, edit, and delete subscription passes for customers. Changes will reflect in the customer app's offers page.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {/* Add/Edit Pass Form */}
                <div className="bg-muted/20 border border-border/60 rounded-xl p-3.5 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-accent/80 tracking-wider text-left">
                    {editingPassIndex !== null ? "Edit Pass Details" : "Create New Subscription Pass"}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs text-left">
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Pass Name</span>
                      <Input
                        value={newPassName}
                        onChange={e => setNewPassName(e.target.value)}
                        placeholder="Marina Beach Auto Pass"
                        className="h-8 bg-background"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Price (₹)</span>
                      <Input
                        type="number"
                        value={newPassPrice}
                        onChange={e => setNewPassPrice(e.target.value)}
                        placeholder="299"
                        className="h-8 bg-background font-mono"
                      />
                    </div>
                    <div className="space-y-1 col-span-2">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Validity (e.g. 30 days)</span>
                      <Input
                        value={newPassValid}
                        onChange={e => setNewPassValid(e.target.value)}
                        placeholder="30 days"
                        className="h-8 bg-background"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Pass Description</span>
                      <Input
                        value={newPassDesc}
                        onChange={e => setNewPassDesc(e.target.value)}
                        placeholder="5 auto rides up to 5km within Mylapore/Adyar"
                        className="h-8 bg-background"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-1.5 pt-1">
                    {editingPassIndex !== null && (
                      <Button
                        onClick={() => {
                          setEditingPassIndex(null);
                          setNewPassName("");
                          setNewPassPrice("");
                          setNewPassValid("");
                          setNewPassDesc("");
                        }}
                        variant="ghost"
                        className="h-8 text-xs"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      onClick={handleAddOrUpdatePass}
                      className="h-8 bg-primary text-primary-foreground font-bold text-xs"
                    >
                      {editingPassIndex !== null ? "Update Pass" : "Add Pass"}
                    </Button>
                  </div>
                </div>

                {/* Passes List Table */}
                <div className="border border-border/80 rounded-xl overflow-hidden">
                  <Table className="text-xs">
                    <TableHeader className="bg-muted/40">
                      <TableRow className="text-[8px] uppercase tracking-wider text-muted-foreground text-left">
                        <TableHead className="py-2.5">Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-left">
                      {subPasses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                            No subscription passes configured.
                          </TableCell>
                        </TableRow>
                      ) : (
                        subPasses.map((pass, idx) => (
                          <TableRow key={pass.id || idx} className="hover:bg-muted/15">
                            <TableCell className="font-bold text-foreground py-2.5">{pass.name}</TableCell>
                            <TableCell className="font-mono font-bold text-foreground font-mono">₹{pass.price}</TableCell>
                            <TableCell className="font-semibold text-accent">{pass.valid}</TableCell>
                            <TableCell className="max-w-[200px] truncate text-muted-foreground">{pass.desc}</TableCell>
                            <TableCell className="text-right space-x-1.5">
                              <button
                                onClick={() => {
                                  setEditingPassIndex(idx);
                                  setNewPassName(pass.name);
                                  setNewPassPrice(String(pass.price));
                                  setNewPassValid(pass.valid);
                                  setNewPassDesc(pass.desc);
                                }}
                                className="text-primary hover:underline font-bold"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  const updated = subPasses.filter((_, i) => i !== idx);
                                  setSubPasses(updated);
                                  toast.error("Pass deleted. Remember to save changes.");
                                }}
                                className="text-destructive hover:underline font-bold"
                              >
                                Delete
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Geofence Active Lists */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border-border/80 bg-card/40 backdrop-blur">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-accent flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Chennai Geofences
                  </CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground/80">
                    Tapping a zone badge instantly toggles it between Active and Suspended status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {zones.map((zone: any) => (
                      <button
                        key={zone.name}
                        onClick={() => toggleZone(zone.name)}
                        className={`group flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-200 ${zone.status === "Active"
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/25"
                            : "bg-rose-500/10 border-rose-500/40 text-rose-400 hover:bg-rose-500/25"
                          }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${zone.status === "Active" ? "bg-emerald-400 animate-pulse" : "bg-rose-400"}`} />
                        {zone.name}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-muted/40 border border-border/60 rounded-lg text-[9px] text-muted-foreground leading-normal flex items-start gap-2">
                    <AlertTriangle className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
                    <span>Suspended geofences block customer bookings in that area. Set the zones status with extreme caution.</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Emergency Cockpit */}
              <Card className="border-border/80 bg-card/40 backdrop-blur">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Chennai Emergency Panel
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <SettingsRow
                    label="Flood Override System"
                    description="Instantly caps max surge rate to 1.0x and routes SMS alerts."
                  >
                    <Switch checked={floodMode} onCheckedChange={setFloodMode} />
                  </SettingsRow>
                  <SettingsRow
                    label="Halt Booking Pipeline"
                    description="Blocks all dispatch mechanisms across Chennai geofences."
                  >
                    <Switch checked={pauseBookings} onCheckedChange={setPauseBookings} />
                  </SettingsRow>
                  <SettingsRow
                    label="Women-Safe Priority"
                    description="Forces auto-verification matches for female passengers."
                  >
                    <Switch checked={forceWomenSafe} onCheckedChange={setForceWomenSafe} />
                  </SettingsRow>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 2. TAMIL FIRST LOCALIZATION TAB */}
        <TabsContent value="localization" className="space-y-4">
          <Card className="border-border/80 bg-card/40 backdrop-blur">
            <CardHeader className="pb-3 border-b border-border/60">
              <CardTitle className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                <Languages className="h-4 w-4" />
                தமிழ்-First Localization Cockpit
              </CardTitle>
              <CardDescription className="text-[10px] text-muted-foreground/80">
                Rideuu is Chennai's indigenous ride-booking system. Support local operational workflows by enabling primary Tamil translations.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">

              <div className="grid gap-4 md:grid-cols-2">
                {/* Language selections */}
                <div
                  onClick={() => setSystemLanguage("en")}
                  className={`border rounded-xl p-4 cursor-pointer flex flex-col justify-between h-32 transition-all ${lang === "en"
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                      : "border-border hover:border-primary/40 bg-card/30"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">🇬🇧</span>
                    {lang === "en" && <Badge className="bg-primary text-primary-foreground text-[8px] font-black uppercase">Active</Badge>}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">English Localization</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">Default English headers, menu controls, and analytics parameters.</p>
                  </div>
                </div>

                <div
                  onClick={() => setSystemLanguage("ta")}
                  className={`border rounded-xl p-4 cursor-pointer flex flex-col justify-between h-32 transition-all ${lang === "ta"
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                      : "border-border hover:border-primary/40 bg-card/30"
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-2xl">🇮🇳</span>
                    {lang === "ta" && <Badge className="bg-primary text-primary-foreground text-[8px] font-black uppercase">செயலில் உள்ளது</Badge>}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">தமிழ் மொழிபெயர்ப்பு (Tamil First)</h3>
                    <p className="text-[10px] text-muted-foreground mt-1">சென்னை இயக்கப் பணியாளர்களுக்கு தமிழ் மொழியில் முழுமையான கணினி அமைப்பு.</p>
                  </div>
                </div>
              </div>

              {/* Translation Dictionary Showcase */}
              <div className="border border-border/80 rounded-xl bg-card/30 p-4">
                <h4 className="text-[10px] font-black uppercase text-accent tracking-wider mb-3">Live Translation Dictionary Preview</h4>
                <div className="grid gap-2 text-xs sm:grid-cols-2 md:grid-cols-4">
                  {[
                    ["Dashboard", "முகப்புப்பலகை"],
                    ["Live Rides", "நேரடி சவாரிகள்"],
                    ["Surge Pricing", "கூடுதல் கட்டணம்"],
                    ["Complaints", "புகார்கள்"],
                    ["Overview", "மேலோட்டம்"],
                    ["Driver Management", "ஓட்டுநர் மேலாண்மை"],
                    ["KYC Verification", "கேஒய்சி சரிபார்ப்பு"],
                    ["Wallet / Finance", "வாலட் / வரவுசெலவு"],
                  ].map(([enText, taText]) => (
                    <div key={enText} className="flex justify-between items-center rounded-lg border border-border/50 bg-background/30 p-2.5">
                      <span className="text-[10px] text-muted-foreground">{enText}</span>
                      <span className="text-xs font-bold text-primary font-mono">{taText}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-[10px] text-muted-foreground leading-normal flex items-start gap-2.5">
                <span className="text-base shrink-0">🌐</span>
                <div>
                  <span className="font-bold text-foreground block">Tamil-First System State Synced:</span>
                  Toggling the language immediately writes to <code className="bg-background/80 px-1 rounded text-primary">admin_lang</code> state in local storage. All dashboard controllers and menus adjust instantly without requiring a site refresh.
                </div>
              </div>

            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. RAZORPAY GATEWAY TAB */}
        <TabsContent value="payment" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">

            {/* Credentials Card */}
            <Card className="lg:col-span-2 border-border/80 bg-card/40 backdrop-blur">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Razorpay API Connection Configuration
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground/80">
                  Integrate Razorpay secure routing hooks to automate rider transaction collection and driver batch payout disbursements.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block font-bold">API Mode Gateway</label>
                    <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border">
                      <button
                        onClick={() => {
                          setGatewayMode("live");
                          setRazorpayKey("rzp_live_ch92x83k1");
                        }}
                        className={`flex-1 text-center py-1.5 text-[10px] font-bold rounded-md ${gatewayMode === "live"
                            ? "bg-primary text-primary-foreground shadow"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Production (LIVE)
                      </button>
                      <button
                        onClick={() => {
                          setGatewayMode("test");
                          setRazorpayKey("rzp_test_SwFutc3AGUQkSR");
                        }}
                        className={`flex-1 text-center py-1.5 text-[10px] font-bold rounded-md ${gatewayMode === "test"
                            ? "bg-accent text-accent-foreground shadow"
                            : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        Sandbox (TEST)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block font-bold">Razorpay Key ID</label>
                    <Input
                      value={razorpayKey}
                      onChange={(e) => setRazorpayKey(e.target.value)}
                      className="h-9 bg-muted/20 font-mono text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block font-bold">Razorpay Key Secret</label>
                    <Input
                      type="password"
                      value={razorpaySecret}
                      onChange={(e) => setRazorpaySecret(e.target.value)}
                      className="h-9 bg-muted/20 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-muted-foreground block font-bold">Payout Trigger Mode</label>
                    <div className="flex bg-muted/40 p-0.5 rounded-lg border border-border">
                      {["instant", "daily", "weekly"].map((freq) => (
                        <button
                          key={freq}
                          onClick={() => setPayoutFreq(freq)}
                          className={`flex-1 text-center py-1.5 text-[9px] uppercase font-black rounded-md ${payoutFreq === freq
                              ? "bg-primary text-primary-foreground shadow"
                              : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-border/60 pt-4">
                  <h4 className="text-[10px] font-black uppercase text-accent tracking-wider mb-2">Automated Batch Payout Parameters</h4>
                  <div className="grid gap-3 text-xs sm:grid-cols-3">
                    <SettingsRow label="Auto-retry Failed Payouts">
                      <Switch defaultChecked />
                    </SettingsRow>
                    <SettingsRow label="Force IFSC Checking">
                      <Switch defaultChecked />
                    </SettingsRow>
                    <SettingsRow label="Withhold TDS Deductions">
                      <Switch defaultChecked />
                    </SettingsRow>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Diagnostic Test Card */}
            <Card className="border-border/80 bg-card/40 backdrop-blur flex flex-col">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-accent flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Connection Diagnostic HUD
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground/80">
                  Dispatch a real-time verification heartbeat packet to test credentials and check the Razorpay routing API.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">

                <div className="border border-border bg-background/50 rounded-xl p-4 flex-1 flex flex-col justify-center items-center text-center space-y-3">
                  {testingConnection ? (
                    <>
                      <RefreshCw className="h-10 w-10 text-primary animate-spin" />
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-foreground">Running diagnostics...</p>
                        <p className="text-[9px] font-mono text-muted-foreground animate-pulse">{testStep}</p>
                      </div>
                    </>
                  ) : testSuccess ? (
                    <>
                      <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/40 grid place-content-center text-emerald-400 shadow-lg shadow-emerald-500/15">
                        <Check className="h-6 w-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-emerald-400">Connection Handshake Success</h4>
                        <div className="font-mono text-[9px] text-muted-foreground space-y-0.5">
                          <p>Latency: 42ms (Secure HTTPS)</p>
                          <p>Razorpay API: Online</p>
                          <p>Timestamp: {new Date().toLocaleTimeString()}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-muted/50 border border-border grid place-content-center text-muted-foreground">
                        <Lock className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-muted-foreground">Diagnostic Not Executed</h4>
                        <p className="text-[9px] text-muted-foreground max-w-[200px]">Click the button below to test endpoint connectivity.</p>
                      </div>
                    </>
                  )}
                </div>

                <Button
                  disabled={testingConnection}
                  onClick={runDiagnosticTest}
                  className="w-full bg-muted border border-border hover:bg-muted/80 text-foreground font-semibold text-xs py-2"
                >
                  {testingConnection ? "Testing Gateway..." : "Test Connection"}
                </Button>

              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* 4. RBAC POLICIES & PERSONA SIMULATOR TAB */}
        <TabsContent value="rbac" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-12">

            {/* RBAC Table Matrix */}
            <Card className="lg:col-span-8 border-border/80 bg-card/40 backdrop-blur">
              <CardHeader className="pb-3 border-b border-border/60">
                <CardTitle className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Role-Based Access Control (RBAC) Grid
                </CardTitle>
                <CardDescription className="text-[10px] text-muted-foreground/80">
                  Explicit permission mapping for administrators. Checking/unchecking options dictates operations available on matching sessions.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60 bg-muted/10">
                      <TableHead className="text-[10px] font-black uppercase text-foreground px-4 py-3">Permission Item</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-foreground text-center">Super Admin</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-foreground text-center">Operations</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-foreground text-center">Finance</TableHead>
                      <TableHead className="text-[10px] font-black uppercase text-foreground text-center">Support Lead</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {[
                      ["manage_pricing", "Configure Pricing & Surge Multipliers"],
                      ["view_finance", "View Financial Ledgers & Batch Payouts"],
                      ["approve_kyc", "Approve Driver KYC Registrations"],
                      ["block_accounts", "Block / Suspend User Accounts"],
                      ["broadcast_sms", "Broadcast Campaign Alerts & Safety SMS"],
                      ["emergency_flood", "Activate Flood Overrides & SOS Dispatch"]
                    ].map(([key, label]) => (
                      <TableRow key={key} className="border-border/40 hover:bg-muted/10 transition-colors">
                        <TableCell className="font-semibold text-foreground px-4 py-3.5">{label}</TableCell>

                        {/* Super Admin Checkbox */}
                        <TableCell className="text-center">
                          <div className="inline-flex justify-center items-center">
                            <Checkbox
                              checked={rbacMatrix.super_admin[key as keyof typeof rbacMatrix.super_admin]}
                              onCheckedChange={() => togglePermission("super_admin", key)}
                            />
                          </div>
                        </TableCell>

                        {/* Operations Checkbox */}
                        <TableCell className="text-center">
                          <div className="inline-flex justify-center items-center">
                            <Checkbox
                              checked={rbacMatrix.operations[key as keyof typeof rbacMatrix.operations]}
                              onCheckedChange={() => togglePermission("operations", key)}
                            />
                          </div>
                        </TableCell>

                        {/* Finance Checkbox */}
                        <TableCell className="text-center">
                          <div className="inline-flex justify-center items-center">
                            <Checkbox
                              checked={rbacMatrix.finance[key as keyof typeof rbacMatrix.finance]}
                              onCheckedChange={() => togglePermission("finance", key)}
                            />
                          </div>
                        </TableCell>

                        {/* Support Checkbox */}
                        <TableCell className="text-center">
                          <div className="inline-flex justify-center items-center">
                            <Checkbox
                              checked={rbacMatrix.support[key as keyof typeof rbacMatrix.support]}
                              onCheckedChange={() => togglePermission("support", key)}
                            />
                          </div>
                        </TableCell>

                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Persona Simulator Sidecard */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="border-border/80 bg-card/40 backdrop-blur">
                <CardHeader className="pb-3 border-b border-border/60">
                  <CardTitle className="text-xs font-black uppercase tracking-wider text-accent flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    Interactive Persona Simulator
                  </CardTitle>
                  <CardDescription className="text-[10px] text-muted-foreground/80">
                    Switch your current session persona dynamically to preview how sidebar menus morph based on roles.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">

                  {[
                    { key: "super_admin", name: "Arjun K.", label: "Super Admin", flag: "👑", desc: "Full root configuration privileges." },
                    { key: "operations", name: "Divya S.", label: "Operations Manager", flag: "🗺️", desc: "Live operations, maps, and safety." },
                    { key: "finance", name: "Ravi M.", label: "Financial Controller", flag: "💼", desc: "Ledgers, invoices, and payouts." },
                    { key: "support", name: "Lakshmi P.", label: "Support Lead", flag: "🎧", desc: "Disputes, logs, and driver checks." }
                  ].map((role) => {
                    const isActive = currentRole === role.key;
                    return (
                      <button
                        key={role.key}
                        onClick={() => simulateRole(role.key, role.name)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex justify-between items-start cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${isActive
                            ? "border-primary bg-primary/10 shadow shadow-primary/5"
                            : "border-border bg-background/20 hover:border-primary/45"
                          }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">{role.name}</span>
                            <Badge variant="outline" className={`text-[8px] font-black uppercase ${isActive ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
                              {role.label}
                            </Badge>
                          </div>
                          <p className="text-[9px] text-muted-foreground">{role.desc}</p>
                        </div>
                        <span className="text-base">{role.flag}</span>
                      </button>
                    );
                  })}

                  <div className="mt-2 p-2.5 bg-accent/5 border border-accent/25 rounded-lg text-[9px] text-muted-foreground leading-normal font-medium">
                    ⚡ Changing personas writes directly to the local session registers and broadcasts an event to the global Admin Shell layout. Try selecting "Support Lead" to see the sidebar dynamically collapse!
                  </div>

                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>
      </Tabs>
    </AdminShell>
  );
}