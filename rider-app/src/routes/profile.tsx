import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import {
  Bike, ChevronRight, FileText, Globe, LogOut, Shield, Star, Camera, Phone, Bell, Key, RefreshCw, Calendar, Eye, Users, HelpCircle
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRider } from "../context/RiderContext";

export const Route = createFileRoute("/profile")({ component: Profile });

function Profile() {
  const nav = useNavigate();
  const {
    language, setLanguage, t,
    profileName, setProfileName,
    profilePhoto, setProfilePhoto,
    phone, setPhone,
    email, setEmail,
    vehicles, activeVehicleId, setActiveVehicleId, addVehicle,
    availabilitySchedule, toggleSchedule, logout,
    rating, completedRides,
    gender, setGender,
    emergencyName, setEmergencyName,
    emergencyPhone, setEmergencyPhone,
    notifPush, setNotifPush,
    notifIncentives, setNotifIncentives
  } = useRider();

  const [activeVehTab, setActiveVehTab] = useState(activeVehicleId);
  const [newVehModel, setNewVehModel] = useState("");
  const [newVehPlate, setNewVehPlate] = useState("");
  const [newVehType, setNewVehType] = useState<"auto" | "bike">("auto");
  const [showAddVeh, setShowAddVeh] = useState(false);

  const activeVehicle = useMemo(() => {
    return vehicles.find(v => v.id === activeVehTab) || vehicles[0] || {
      model: "Unknown",
      type: "auto",
      insuranceExpiry: "N/A",
      pollutionExpiry: "N/A",
      maintenanceDays: 0
    };
  }, [vehicles, activeVehTab]);

  useEffect(() => {
    setActiveVehTab(activeVehicleId);
  }, [activeVehicleId]);

  const handleLangToggle = () => {
    setLanguage(language === "en" ? "ta" : "en");
  };

  const handleAddVeh = () => {
    if (!newVehModel || !newVehPlate) return;
    addVehicle(newVehModel, newVehPlate, newVehType);
    setShowAddVeh(false);
    setNewVehModel("");
    setNewVehPlate("");
  };

  return (
    <MobileShell>
      <PageHeader title={language === "ta" ? "விவரக்குறிப்பு" : "Rider Profile"} />
      
      <div className="px-5 space-y-5 pb-8">
        
        {/* Profile Card */}
        <div className="rounded-3xl bg-card border border-border p-5 flex items-center gap-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
          <div className="relative group">
            <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-black shadow shadow-primary/20">
              {profileName[0]}
            </div>
            <button className="absolute bottom-0 right-0 h-5.5 w-5.5 rounded-full bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow">
              <Camera className="h-3 w-3" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="font-black text-base text-foreground bg-transparent border-b border-transparent focus:border-primary/55 outline-none w-full"
            />
            <div className="text-xs text-muted-foreground mt-0.5 font-bold">
              {phone.startsWith('+91') || phone.startsWith('+') ? phone : `+91 ${phone}`}
            </div>
            <div className="mt-1 flex items-center gap-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Gender:</span>
              <select
                disabled
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="text-[10px] font-extrabold text-foreground bg-secondary/80 border border-border rounded px-1.5 py-0.5 outline-none cursor-not-allowed opacity-70"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="mt-1 inline-flex items-center gap-1.5 text-[10px] font-black text-primary uppercase">
              <Star className="h-3.5 w-3.5 fill-primary text-primary" /> {rating.toFixed(2)} · {completedRides} Chennai Trips
            </div>
          </div>
        </div>

        {/* Dynamic Tamil Switch button */}
        <div className="rounded-3xl bg-card border border-border p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-5 w-5 text-primary" />
            <div>
              <div className="font-bold text-xs text-foreground uppercase tracking-wide">Language preference</div>
              <div className="text-[10px] text-muted-foreground font-semibold">தமிழ் / English Switch</div>
            </div>
          </div>
          <button
            onClick={handleLangToggle}
            className="px-4 py-2 bg-primary text-primary-foreground font-black text-[10px] rounded-full active:scale-95 transition uppercase tracking-wider"
          >
            {language === "en" ? "SWITCH TO தமிழ்" : "SWITCH TO ENGLISH"}
          </button>
        </div>

        {/* Multi Vehicles Details Management */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Bike className="h-4.5 w-4.5 text-primary" />
              <span className="font-black text-xs uppercase tracking-wider text-foreground">Vehicle credentials</span>
            </div>
            <button
              onClick={() => setShowAddVeh(!showAddVeh)}
              className="text-[10px] font-black text-primary underline"
            >
              + Add Vehicle
            </button>
          </div>

          {/* Vehicle additions drawer mockup */}
          {showAddVeh && (
            <div className="bg-secondary rounded-2xl p-4 border border-border mb-4 space-y-3 slide-up">
              <div className="font-bold text-xs uppercase tracking-wide">Register new vehicle</div>
              <input
                type="text"
                placeholder="Vehicle Model (e.g. TVS XL 100)"
                value={newVehModel}
                onChange={(e) => setNewVehModel(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              />
              <input
                type="text"
                placeholder="Plate Number (e.g. TN 22 AB 1234)"
                value={newVehPlate}
                onChange={(e) => setNewVehPlate(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              />
              <select
                value={newVehType}
                onChange={(e) => setNewVehType(e.target.value as any)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none"
              >
                <option value="auto">🛺 Auto rickshaw</option>
                <option value="bike">🏍️ Bike taxi</option>
              </select>
              <button
                onClick={handleAddVeh}
                className="w-full py-2 bg-primary text-white rounded-xl text-xs font-black"
              >
                Submit Registration
              </button>
            </div>
          )}

          {/* Vehicles Tabs selectors */}
          <div className="flex gap-2 mb-4 bg-muted p-1 rounded-xl">
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setActiveVehTab(v.id);
                  setActiveVehicleId(v.id);
                }}
                className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition ${
                  activeVehTab === v.id
                    ? "bg-card text-foreground shadow-sm border border-border"
                    : "text-muted-foreground"
                }`}
              >
                {v.plateNumber}
              </button>
            ))}
          </div>

          {/* Selected Active vehicle exipry/reminders info details */}
          <div className="space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Model & Type:</span>
              <span className="text-foreground uppercase">{activeVehicle.model} ({activeVehicle.type})</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Insurance expiry alert:</span>
              <span className="text-primary font-bold">Expires: {activeVehicle.insuranceExpiry}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-border/50 pb-2">
              <span className="text-muted-foreground">Pollution Cert tracker:</span>
              <span className="text-orange-500 font-bold">Expires: {activeVehicle.pollutionExpiry}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Maintenance reminders:</span>
              <span className="text-foreground">{activeVehicle.maintenanceDays} days until next oil check</span>
            </div>
          </div>
        </div>

        {/* Availability shift scheduler hours */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <Calendar className="h-4.5 w-4.5 text-primary" />
            <span className="font-black text-xs uppercase tracking-wider text-foreground">
              Availability Scheduler
            </span>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {availabilitySchedule.map((s) => (
              <div key={s.id} className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-b-0 text-xs">
                <div>
                  <span className="font-bold text-foreground block">{s.day}</span>
                  <span className="text-[10px] text-muted-foreground font-semibold">{s.hours}</span>
                </div>
                <button
                  onClick={() => toggleSchedule(s.id)}
                  className={`px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${
                    s.active
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-white/5 text-muted-foreground border border-border"
                  }`}
                >
                  {s.active ? "Online" : "Off"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency contact management */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <Phone className="h-4.5 w-4.5 text-red-500 shrink-0" />
            <span className="font-black text-xs uppercase tracking-wider text-foreground">Emergency SOS contacts</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] font-extrabold text-muted-foreground uppercase">Contact Person</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none mt-1"
              />
            </div>
            <div>
              <label className="text-[9px] font-extrabold text-muted-foreground uppercase">Mobile Phone Number</label>
              <input
                type="text"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-xs font-semibold outline-none mt-1"
              />
            </div>
          </div>
        </div>

        {/* Notification settings preferences */}
        <div className="rounded-3xl bg-card border border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
            <Bell className="h-4.5 w-4.5 text-primary" />
            <span className="font-black text-xs uppercase tracking-wider text-foreground">Preferences</span>
          </div>

          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Receive push trip notifications</span>
              <button
                onClick={() => setNotifPush(!notifPush)}
                className={`h-5.5 w-10 rounded-full transition relative ${notifPush ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`h-4.5 w-4.5 rounded-full bg-white absolute top-0.5 transition ${notifPush ? "left-5" : "left-0.5"}`} />
              </button>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Receive peak hour / rain alert sounds</span>
              <button
                onClick={() => setNotifIncentives(!notifIncentives)}
                className={`h-5.5 w-10 rounded-full transition relative ${notifIncentives ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`h-4.5 w-4.5 rounded-full bg-white absolute top-0.5 transition ${notifIncentives ? "left-5" : "left-0.5"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* row items list */}
        <div className="space-y-2">
          <Row icon={Shield} label="KYC Documents Verification" to="/kyc" />
          <Row icon={Users} label="Rider Referral - Invite & Earn" to="/referral" />
          <Row icon={HelpCircle} label="Rider Support Center" to="/support" />
          <Row icon={FileText} label="Rider Terms of Service" />
          <button 
            onClick={() => { logout(); nav({ to: "/login" }); }}
            className="w-full flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 active:scale-[0.99] transition shadow-sm"
          >
            <LogOut className="h-4.5 w-4.5 shrink-0 text-primary animate-pulse" />
            <span className="flex-1 text-xs font-bold text-left text-primary">Log out shift</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function Row({ icon: Icon, label, to, danger }: any) {
  const cls = "w-full flex items-center gap-3.5 rounded-2xl bg-card border border-border p-4 active:scale-[0.99] transition shadow-sm";
  const inner = (
    <>
      <Icon className={`h-4.5 w-4.5 shrink-0 ${danger ? "text-primary animate-pulse" : "text-primary"}`} />
      <span className={`flex-1 text-xs font-bold text-left ${danger ? "text-primary" : "text-foreground"}`}>{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  return to ? (
    <Link to={to} className={cls}>{inner}</Link>
  ) : (
    <button className={cls}>{inner}</button>
  );
}
