import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, StatCard, Panel } from "@/components/admin/AdminShell";
import { Zap, CloudRain, TrendingUp, MapPin, AlertTriangle, Calendar, Star, Sparkles, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { api } from "../lib/api";

export const Route = createFileRoute("/surge")({ component: Page });

type Zone = {
  id: number;
  zone_id: string;
  bike_multiplier: number;
  auto_multiplier: number;
  rain_enabled: boolean;
  festival_enabled: boolean;
  hotspot_enabled: boolean;
  flood_lockdown_enabled: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

type Schedule = {
  id: number;
  zone_id: string;
  multiplier: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  recurrence_type: string;
  weekdays: string; // JSON string or comma-separated list
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function Page() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  // Global triggers (we keep these key settings in SystemSetting as well)
  const [rainMode, setRainMode] = useState(false);
  const [festivalMode, setFestivalMode] = useState(false);
  const [hotspotMode, setHotspotMode] = useState(false);
  const [floodLock, setFloodLock] = useState(false);
  const [surgeCap, setSurgeCap] = useState(true);

  // Statistics
  const [avgMultiplier, setAvgMultiplier] = useState("1.0x");
  const [surgeRevenue, setSurgeRevenue] = useState(0);

  // Zone Form States
  const [showZoneForm, setShowZoneForm] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [zoneNameInput, setZoneNameInput] = useState("");
  const [zoneBikeMultInput, setZoneBikeMultInput] = useState("1.0");
  const [zoneAutoMultInput, setZoneAutoMultInput] = useState("1.0");
  const [zoneRainEnabled, setZoneRainEnabled] = useState(false);
  const [zoneFestivalEnabled, setZoneFestivalEnabled] = useState(false);
  const [zoneHotspotEnabled, setZoneHotspotEnabled] = useState(false);
  const [zoneFloodLockdown, setZoneFloodLockdown] = useState(false);
  const [zoneActive, setZoneActive] = useState(true);

  // Scheduling Form States
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [schedZone, setSchedZone] = useState("");
  const [schedMultiplier, setSchedMultiplier] = useState("1.5");
  const [schedStartDate, setSchedStartDate] = useState("");
  const [schedEndDate, setSchedEndDate] = useState("");
  const [schedStartTime, setSchedStartTime] = useState("09:00");
  const [schedEndTime, setSchedEndTime] = useState("18:00");
  const [schedRecurrence, setSchedRecurrence] = useState("One Time");
  const [schedWeekdays, setSchedWeekdays] = useState<string[]>([]);
  const [schedActive, setSchedActive] = useState(true);

  const loadData = async () => {
    try {
      // 1. Fetch Zones
      const zonesData = await api.getSurgeZones();
      if (Array.isArray(zonesData) && zonesData.length > 0) {
        setZones(zonesData);
        setSelectedZone(zonesData[0]);
        setSchedZone(zonesData[0].zone_id);
      } else {
        // Fallback default seed logic if no zones in DB
        const defaultSeeds = [
          { zone_id: "T. Nagar", bike_multiplier: 1.2, auto_multiplier: 1.1, rain_enabled: false, festival_enabled: false, hotspot_enabled: false, flood_lockdown_enabled: false, active: true },
          { zone_id: "Velachery", bike_multiplier: 1.5, auto_multiplier: 1.4, rain_enabled: true, festival_enabled: false, hotspot_enabled: false, flood_lockdown_enabled: false, active: true },
          { zone_id: "OMR Sholinganallur", bike_multiplier: 1.3, auto_multiplier: 1.2, rain_enabled: false, festival_enabled: true, hotspot_enabled: true, flood_lockdown_enabled: false, active: true }
        ];
        const created: Zone[] = [];
        for (const seed of defaultSeeds) {
          const res = await api.createSurgeZone(seed);
          if (res) created.push(res);
        }
        setZones(created);
        if (created.length > 0) {
          setSelectedZone(created[0]);
          setSchedZone(created[0].zone_id);
        }
      }

      // 2. Fetch Schedules
      const schedsData = await api.getSurgeSchedules();
      if (Array.isArray(schedsData)) {
        setSchedules(schedsData);
      }

      // 3. Fetch global rules
      const rainSetting = await api.getSetting("rain_mode");
      if (rainSetting !== null && rainSetting.value !== undefined) setRainMode(!!rainSetting.value);
      const festivalSetting = await api.getSetting("festival_mode");
      if (festivalSetting !== null && festivalSetting.value !== undefined) setFestivalMode(!!festivalSetting.value);
      const hotspotSetting = await api.getSetting("hotspot_mode");
      if (hotspotSetting !== null && hotspotSetting.value !== undefined) setHotspotMode(!!hotspotSetting.value);
      const floodSetting = await api.getSetting("flood_mode");
      if (floodSetting !== null && floodSetting.value !== undefined) setFloodLock(!!floodSetting.value);
      const capSetting = await api.getSetting("surge_cap");
      if (capSetting !== null && capSetting.value !== undefined) setSurgeCap(!!capSetting.value);

      // 4. Fetch rides to compute surge revenue
      const rides = await api.getRides() || [];
      const completed = rides.filter((r: any) => 
        ["completed", "payment_completed", "payment_success"].includes(r.status)
      );
      const totalSurgeRev = completed.reduce((sum: number, r: any) => {
        const fare = r.fare || 0;
        const mult = r.surge_multiplier || 1.0;
        if (mult > 1.0) {
          return sum + Math.round(fare - (fare / mult));
        }
        return sum;
      }, 0);
      setSurgeRevenue(totalSurgeRev);
    } catch (err) {
      console.error("Error loading pricing dashboard data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (zones.length > 0) {
      const activeList = getAdjustedZones();
      const sum = activeList.reduce((acc, curr) => acc + curr.bike_multiplier, 0);
      setAvgMultiplier(`${(sum / activeList.length).toFixed(2)}x`);
    } else {
      setAvgMultiplier("1.0x");
    }
  }, [zones, rainMode, festivalMode, hotspotMode, floodLock, surgeCap]);

  const handleToggleRule = async (key: string, val: boolean, setter: (v: boolean) => void) => {
    setter(val);
    try {
      await api.setSetting(key, val);
    } catch (err) {
      console.error(`Failed to save setting ${key}:`, err);
    }
  };

  const getAdjustedZones = () => {
    if (floodLock) {
      return zones.map(z => ({
        ...z,
        bike_multiplier: 1.0,
        auto_multiplier: 1.0,
        label: "🚨 Flood emergency override"
      }));
    }

    return zones.map(z => {
      let finalM = z.bike_multiplier;
      let finalAutoM = z.auto_multiplier;

      if (rainMode || z.rain_enabled) {
        finalM += 0.3;
        finalAutoM += 0.4;
      }
      if (festivalMode || z.festival_enabled) {
        finalM += 0.2;
        finalAutoM += 0.3;
      }
      if (hotspotMode && z.hotspot_enabled) {
        finalM += 0.2;
        finalAutoM += 0.2;
      }

      if (surgeCap) {
        finalM = Math.min(2.0, finalM);
        finalAutoM = Math.min(2.0, finalAutoM);
      }

      finalM = Math.round(finalM * 10) / 10;
      finalAutoM = Math.round(finalAutoM * 10) / 10;

      return {
        ...z,
        bike_multiplier: finalM,
        auto_multiplier: finalAutoM,
        label: rainMode || z.rain_enabled ? "🌦️ Rain surge applied" : festivalMode || z.festival_enabled ? "🎉 Festival rule active" : "Normal Mode"
      };
    });
  };

  const handleSliderChange = async (zoneId: number, type: "bike" | "auto", val: number) => {
    const nextZones = zones.map(z => {
      if (z.id === zoneId) {
        return type === "bike" ? { ...z, bike_multiplier: val } : { ...z, auto_multiplier: val };
      }
      return z;
    });
    setZones(nextZones);

    const target = nextZones.find(z => z.id === zoneId);
    if (target) {
      setSelectedZone(target);
      try {
        await api.updateSurgeZone(zoneId, {
          bike_multiplier: target.bike_multiplier,
          auto_multiplier: target.auto_multiplier
        });
      } catch (e) {
        console.error("Failed to update multiplier:", e);
      }
    }
  };

  // Zone CRUD operations
  const handleAddOrEditZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneNameInput) {
      alert("Zone Name/ID is required.");
      return;
    }
    const payload = {
      zone_id: zoneNameInput,
      bike_multiplier: parseFloat(zoneBikeMultInput),
      auto_multiplier: parseFloat(zoneAutoMultInput),
      rain_enabled: zoneRainEnabled,
      festival_enabled: zoneFestivalEnabled,
      hotspot_enabled: zoneHotspotEnabled,
      flood_lockdown_enabled: zoneFloodLockdown,
      active: zoneActive
    };

    try {
      if (editingZone) {
        const updated = await api.updateSurgeZone(editingZone.id, payload);
        if (updated) {
          alert(`✨ Zone ${zoneNameInput} updated successfully!`);
        }
      } else {
        const created = await api.createSurgeZone(payload);
        if (created) {
          alert(`✨ Zone ${zoneNameInput} created successfully!`);
        }
      }
      resetZoneForm();
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save zone.");
    }
  };

  const resetZoneForm = () => {
    setEditingZone(null);
    setZoneNameInput("");
    setZoneBikeMultInput("1.0");
    setZoneAutoMultInput("1.0");
    setZoneRainEnabled(false);
    setZoneFestivalEnabled(false);
    setZoneHotspotEnabled(false);
    setZoneFloodLockdown(false);
    setZoneActive(true);
    setShowZoneForm(false);
  };

  const handleDeleteZone = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete surge zone: ${name}?`)) return;
    try {
      await api.deleteSurgeZone(id);
      alert(`🗑️ Zone ${name} deleted successfully.`);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete zone.");
    }
  };

  // Schedule CRUD operations
  const handleAddOrEditSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedZone || !schedMultiplier || !schedStartDate || !schedEndDate || !schedStartTime || !schedEndTime) {
      alert("Please fill in all schedule fields.");
      return;
    }

    const payload = {
      zone_id: schedZone,
      multiplier: parseFloat(schedMultiplier),
      start_date: schedStartDate,
      end_date: schedEndDate,
      start_time: schedStartTime + ":00",
      end_time: schedEndTime + ":00",
      recurrence_type: schedRecurrence,
      weekdays: JSON.stringify(schedWeekdays),
      active: schedActive
    };

    try {
      if (editingSchedule) {
        await api.updateSurgeSchedule(editingSchedule.id, payload);
        alert("📅 Schedule updated successfully!");
      } else {
        await api.createSurgeSchedule(payload);
        alert("📅 Schedule created successfully!");
      }
      resetScheduleForm();
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save schedule.");
    }
  };

  const resetScheduleForm = () => {
    setEditingSchedule(null);
    setSchedMultiplier("1.5");
    setSchedStartDate("");
    setSchedEndDate("");
    setSchedStartTime("09:00");
    setSchedEndTime("18:00");
    setSchedRecurrence("One Time");
    setSchedWeekdays([]);
    setSchedActive(true);
    setShowScheduleForm(false);
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await api.deleteSurgeSchedule(id);
      alert("🗑️ Schedule deleted successfully.");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to delete schedule.");
    }
  };

  const handleWeekdayToggle = (day: string) => {
    if (schedWeekdays.includes(day)) {
      setSchedWeekdays(prev => prev.filter(d => d !== day));
    } else {
      setSchedWeekdays(prev => [...prev, day]);
    }
  };

  const activeZonesList = getAdjustedZones();
  const activeSelectedZone = activeZonesList.find(z => z.id === selectedZone?.id) || activeZonesList[0];

  return (
    <AdminShell 
      title="Surge Pricing Dashboard" 
      subtitle="Complete database-driven Chennai geofenced pricing variables"
      actions={
        <div className="flex gap-2">
          <Button 
            size="sm" 
            className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/40 font-semibold"
            onClick={() => {
              resetZoneForm();
              setShowZoneForm(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Zone
          </Button>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold" 
            onClick={loadData}
          >
            Refresh Data
          </Button>
        </div>
      }
    >
      {floodLock && (
        <div className="mb-4 rounded-xl bg-destructive/15 border-2 border-destructive/40 p-4 text-destructive animate-pulse flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 shrink-0 text-destructive animate-bounce" />
          <div>
            <div className="font-extrabold uppercase tracking-widest text-xs">FLOOD EMERGENCY MODE ACTIVE</div>
            <p className="text-xs leading-relaxed mt-0.5 font-semibold">
              Emergency lockdown has capped all active surge rates to 1.0x. SMS dispatch alerts routed to fleets.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Avg multiplier" value={avgMultiplier} delta="" icon={Zap} tone="primary" />
        <StatCard label="Rain overlay" value={rainMode ? "ON" : "OFF"} icon={CloudRain} tone="accent" />
        <StatCard label="Surge revenue" value={`₹${surgeRevenue.toLocaleString()}`} delta="" icon={TrendingUp} tone="primary" />
        <StatCard label="Total zones" value={zones.length.toString()} icon={MapPin} tone="accent" />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-5 items-start">
        
        {/* Left Rules & Scheduler Column */}
        <div className="lg:col-span-2 space-y-3">
          
          {/* Global Switches Panel */}
          <Panel title="Global controls" description="Override automated surge algorithms">
            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div>
                  <span>🌦️ Rain surge (+0.5x)</span>
                  <span className="text-[9px] text-muted-foreground block font-normal font-sans">Apply overlay adjustments during rains</span>
                </div>
                <Switch checked={rainMode} onCheckedChange={(val) => handleToggleRule("rain_mode", val, setRainMode)} />
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div>
                  <span>🎉 Festival mode (+0.4x)</span>
                  <span className="text-[9px] text-muted-foreground block font-normal">State-wide holiday overlays</span>
                </div>
                <Switch checked={festivalMode} onCheckedChange={(val) => handleToggleRule("festival_mode", val, setFestivalMode)} />
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <div>
                  <span>🚉 Hotspot overlay (+0.4x)</span>
                  <span className="text-[9px] text-muted-foreground block font-normal">Transit & terminal premium pricing</span>
                </div>
                <Switch checked={hotspotMode} onCheckedChange={(val) => handleToggleRule("hotspot_mode", val, setHotspotMode)} />
              </div>
              <div className="flex items-center justify-between border-b border-border/40 pb-2 text-destructive">
                <div>
                  <span className="font-bold">🚨 Flood Lockdown mode</span>
                  <span className="text-[9px] text-destructive/80 block font-normal">Caps surges to 1.0x for emergency logistics</span>
                </div>
                <Switch checked={floodLock} onCheckedChange={(val) => handleToggleRule("flood_mode", val, setFloodLock)} className="data-[state=checked]:bg-destructive" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span>Cap Multiplier at 2.0x</span>
                  <span className="text-[9px] text-muted-foreground block font-normal">Cap pricing ceiling limits</span>
                </div>
                <Switch checked={surgeCap} onCheckedChange={(val) => handleToggleRule("surge_cap", val, setSurgeCap)} />
              </div>
            </div>
          </Panel>

          {/* Surge Scheduling Form & List */}
          <Panel title="Surge Scheduling" description="Schedule surge rules for peak windows">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">Active Schedules</span>
              <Button 
                onClick={() => {
                  resetScheduleForm();
                  setShowScheduleForm(true);
                }} 
                size="sm" 
                variant="outline" 
                className="h-6 text-[10px]"
              >
                <Plus className="h-3 w-3 mr-1" /> New Schedule
              </Button>
            </div>

            {/* Schedule Create/Edit Form */}
            {showScheduleForm && (
              <form onSubmit={handleAddOrEditSchedule} className="space-y-3 text-xs bg-muted/20 border border-border/50 rounded-lg p-3 my-2 text-left">
                <div className="flex justify-between items-center border-b border-border/40 pb-1.5 mb-2">
                  <span className="font-extrabold text-[10px] uppercase text-primary">
                    {editingSchedule ? "Edit Schedule" : "New Surge Schedule"}
                  </span>
                  <button type="button" onClick={resetScheduleForm} className="text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block mb-1">Zone</span>
                    <select 
                      value={schedZone}
                      onChange={e => setSchedZone(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                    >
                      {zones.filter(z => z.active).map(z => (
                        <option key={z.zone_id} value={z.zone_id}>{z.zone_id}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block mb-1">Surge Multiplier</span>
                    <Input 
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="3.0"
                      value={schedMultiplier}
                      onChange={e => setSchedMultiplier(e.target.value)}
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block mb-1">Start Date</span>
                    <input 
                      type="date"
                      value={schedStartDate}
                      onChange={e => setSchedStartDate(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block mb-1">End Date</span>
                    <input 
                      type="date"
                      value={schedEndDate}
                      onChange={e => setSchedEndDate(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block mb-1">Start Time</span>
                    <input 
                      type="time"
                      value={schedStartTime}
                      onChange={e => setSchedStartTime(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block mb-1">End Time</span>
                    <input 
                      type="time"
                      value={schedEndTime}
                      onChange={e => setSchedEndTime(e.target.value)}
                      className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                    />
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-muted-foreground uppercase block mb-1">Recurrence</span>
                  <select 
                    value={schedRecurrence}
                    onChange={e => setSchedRecurrence(e.target.value)}
                    className="w-full h-8 px-2 rounded-md border border-border bg-background text-xs"
                  >
                    <option value="One Time">One Time</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>

                {schedRecurrence === "Weekly" && (
                  <div>
                    <span className="text-[9px] text-muted-foreground uppercase block mb-1">Active Weekdays</span>
                    <div className="flex flex-wrap gap-1">
                      {WEEKDAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleWeekdayToggle(day)}
                          className={`px-2 py-1 text-[9px] font-bold rounded-md border transition-all ${
                            schedWeekdays.includes(day)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:bg-muted"
                          }`}
                        >
                          {day.substring(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-muted-foreground uppercase">Status:</span>
                    <select
                      value={schedActive ? "active" : "inactive"}
                      onChange={e => setSchedActive(e.target.value === "active")}
                      className="h-6 px-1 rounded border border-border bg-background text-[10px]"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <Button type="submit" size="sm" className="h-8 bg-primary text-primary-foreground font-bold">
                    {editingSchedule ? "Update" : "Save Schedule"}
                  </Button>
                </div>
              </form>
            )}

            {/* Schedules List */}
            <div className="mt-3 divide-y divide-border/60 text-[10px] space-y-1.5 pt-2 border-t border-border/40 text-left">
              {schedules.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground text-xs">No surge schedules configured in DB.</div>
              ) : (
                schedules.map((s) => (
                  <div key={s.id} className="flex justify-between py-2 items-center group">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-foreground text-xs">{s.zone_id}</span>
                        {!s.active && <Badge variant="outline" className="text-[8px] py-0 border-destructive text-destructive font-mono scale-90">INACTIVE</Badge>}
                      </div>
                      <span className="text-muted-foreground text-[9px] block mt-0.5">
                        📆 {s.start_date} to {s.end_date} | ⏰ {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                      </span>
                      {s.recurrence_type === "Weekly" && s.weekdays && (
                        <span className="text-[8px] text-accent block font-semibold mt-0.5">
                          Repeat: {JSON.parse(s.weekdays).map((d: string) => d.substring(0, 3)).join(", ")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className="border-primary/40 text-primary font-bold text-xs bg-primary/5">
                        {s.multiplier}x
                      </Badge>
                      <button 
                        onClick={() => {
                          setEditingSchedule(s);
                          setSchedZone(s.zone_id);
                          setSchedMultiplier(String(s.multiplier));
                          setSchedStartDate(s.start_date);
                          setSchedEndDate(s.end_date);
                          setSchedStartTime(s.start_time.substring(0, 5));
                          setSchedEndTime(s.end_time.substring(0, 5));
                          setSchedRecurrence(s.recurrence_type);
                          try {
                            setSchedWeekdays(JSON.parse(s.weekdays));
                          } catch {
                            setSchedWeekdays([]);
                          }
                          setSchedActive(s.active);
                          setShowScheduleForm(true);
                        }} 
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Edit Schedule"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete Schedule"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Panel>
        </div>

        {/* Right zones grid */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* Zone CRUD Drawer/Overlay Form */}
          {showZoneForm && (
            <Panel title={editingZone ? "Edit Surge Zone details" : "Add new Surge Zone"} description="Save changes directly to DB config table.">
              <form onSubmit={handleAddOrEditZone} className="space-y-4 text-xs font-semibold text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Zone Name/ID</label>
                    <Input 
                      placeholder="e.g. Adyar" 
                      value={zoneNameInput}
                      onChange={e => setZoneNameInput(e.target.value)}
                      disabled={!!editingZone}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Bike Multiplier</label>
                    <Input 
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="2.5"
                      value={zoneBikeMultInput}
                      onChange={e => setZoneBikeMultInput(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase block mb-1">Auto Multiplier</label>
                    <Input 
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="2.5"
                      value={zoneAutoMultInput}
                      onChange={e => setZoneAutoMultInput(e.target.value)}
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="border border-border/60 rounded-xl p-3 bg-muted/10 grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center justify-between p-1.5 border-b border-border/40 col-span-2">
                    <span>🌦️ Rain Overlay Sync</span>
                    <Switch checked={zoneRainEnabled} onCheckedChange={setZoneRainEnabled} />
                  </div>
                  <div className="flex items-center justify-between p-1.5 border-b border-border/40 col-span-2">
                    <span>🎉 Festival Mode Sync</span>
                    <Switch checked={zoneFestivalEnabled} onCheckedChange={setZoneFestivalEnabled} />
                  </div>
                  <div className="flex items-center justify-between p-1.5 border-b border-border/40 col-span-2">
                    <span>🚉 Hotspot Premium Overlay</span>
                    <Switch checked={zoneHotspotEnabled} onCheckedChange={setZoneHotspotEnabled} />
                  </div>
                  <div className="flex items-center justify-between p-1.5 col-span-2">
                    <span>🚨 Flood emergency override lockout</span>
                    <Switch checked={zoneFloodLockdown} onCheckedChange={setZoneFloodLockdown} />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">Active Status:</span>
                    <Switch checked={zoneActive} onCheckedChange={setZoneActive} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" onClick={resetZoneForm} variant="ghost" size="sm" className="h-8">Cancel</Button>
                    <Button type="submit" size="sm" className="h-8 bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold">
                      {editingZone ? "Save Updates" : "Create Zone"}
                    </Button>
                  </div>
                </div>
              </form>
            </Panel>
          )}

          {/* Zones Grid */}
          <Panel title="Zone multipliers" description="Live geofence status · click on a zone to adjust manually or edit/delete">
            <div className="grid gap-2 md:grid-cols-2">
              {activeZonesList.map(z => (
                <div 
                  key={z.id} 
                  onClick={() => setSelectedZone(z)}
                  className={`rounded-xl border p-3.5 cursor-pointer relative group transition-all ${
                    selectedZone?.id === z.id 
                      ? "bg-gradient-to-r from-primary/10 to-accent/5 border-primary shadow-sm" 
                      : "bg-background border-border/80 hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-xs text-foreground flex items-center gap-1 text-left">
                        {z.zone_id}
                        {z.hotspot_enabled && <span title="Hotspot Geofence Alert"><Sparkles className="h-3 w-3 text-accent fill-accent" /></span>}
                        {!z.active && <Badge variant="outline" className="border-destructive text-destructive text-[8px] py-0 scale-95 uppercase font-mono">Inactive</Badge>}
                      </div>
                      <div className="text-[10px] text-muted-foreground/80 mt-0.5 text-left">{z.label}</div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-base font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        🚴 {z.bike_multiplier.toFixed(1)}x
                      </div>
                      <div className="text-[10px] font-bold text-muted-foreground/85 mt-0.5">
                        🛺 {z.auto_multiplier.toFixed(1)}x
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted/60">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300" style={{ width: `${Math.min(100, (z.bike_multiplier / 2) * 100)}%` }} />
                  </div>

                  {/* Edit/Delete overlay icons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 p-0.5 rounded shadow-sm">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingZone(z);
                        setZoneNameInput(z.zone_id);
                        setZoneBikeMultInput(String(z.bike_multiplier));
                        setZoneAutoMultInput(String(z.auto_multiplier));
                        setZoneRainEnabled(z.rain_enabled);
                        setZoneFestivalEnabled(z.festival_enabled);
                        setZoneHotspotEnabled(z.hotspot_enabled);
                        setZoneFloodLockdown(z.flood_lockdown_enabled);
                        setZoneActive(z.active);
                        setShowZoneForm(true);
                      }} 
                      className="p-1 text-muted-foreground hover:text-foreground rounded"
                      title="Edit Zone details"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteZone(z.id, z.zone_id);
                      }} 
                      className="p-1 text-muted-foreground hover:text-destructive rounded"
                      title="Delete Zone"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* Selected Zone Manual Sliders */}
          {activeSelectedZone && (
            <Panel 
              title={`Manual surge variables · ${activeSelectedZone.zone_id}`} 
              description="Adjust specific pricing multiplier variables"
            >
              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">🚴 Bike Fleet Surge Multiplier</span>
                    <span className="font-mono text-primary font-bold text-sm bg-primary/5 px-2 py-0.5 border border-primary/25 rounded">
                      {activeSelectedZone.bike_multiplier.toFixed(1)}x
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1.0" 
                    max="2.5" 
                    step="0.1"
                    disabled={floodLock}
                    value={activeSelectedZone.bike_multiplier}
                    onChange={e => handleSliderChange(activeSelectedZone.id, "bike", parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary border border-border/20"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">🛺 Auto Fleet Surge Multiplier</span>
                    <span className="font-mono text-accent font-bold text-sm bg-accent/5 px-2 py-0.5 border border-accent/25 rounded">
                      {activeSelectedZone.auto_multiplier.toFixed(1)}x
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="1.0" 
                    max="2.5" 
                    step="0.1"
                    disabled={floodLock}
                    value={activeSelectedZone.auto_multiplier}
                    onChange={e => handleSliderChange(activeSelectedZone.id, "auto", parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-accent border border-border/20"
                  />
                </div>

                <div className="rounded-lg bg-muted/15 border border-border/40 p-3 text-[10px] text-muted-foreground leading-relaxed font-normal text-left">
                  💡 Sliders are real-time overrides saved directly to the database. Rain, festival, and transit station overlays stack on top of these base values.
                </div>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </AdminShell>
  );
}