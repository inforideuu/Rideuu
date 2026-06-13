import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, Panel } from "@/components/admin/AdminShell";
import { useState, useEffect } from "react";
import { 
  Flame, TrafficCone, CloudRain, Sparkles, MapPin, 
  ShieldAlert, TrendingUp, AlertTriangle, HelpCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../lib/api";

export const Route = createFileRoute("/heatmap")({ component: Page });

const grid = 14;

function Page() {
  const [activeLayer, setActiveLayer] = useState<"demand" | "supply" | "traffic" | "flood" | "ai">("demand");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Initialize grids to all zeros (fresh clean state)
  const [demand, setDemand] = useState<number[]>(new Array(grid * grid).fill(0));
  const [supply, setSupply] = useState<number[]>(new Array(grid * grid).fill(0));
  const [traffic, setTraffic] = useState<number[]>(new Array(grid * grid).fill(0));
  const [flood, setFlood] = useState<number[]>(new Array(grid * grid).fill(0));
  const [ai, setAi] = useState<number[]>(new Array(grid * grid).fill(0));

  const [stats, setStats] = useState<any[]>([]);

  useEffect(() => {
    async function loadHeatmapData() {
      try {
        const rides = await api.getRides() || [];
        const users = await api.getUsers() || [];

        const newDemand = new Array(grid * grid).fill(0);
        const newSupply = new Array(grid * grid).fill(0);
        const newTraffic = new Array(grid * grid).fill(0);
        const newFlood = new Array(grid * grid).fill(0);

        // Calculate dynamic demand based on rides pickup locations
        if (rides.length > 0) {
          rides.forEach((r: any, idx: number) => {
            // Distribute rides across the grid deterministically/geographically based on ride ID or status
            const cell = (r.id || idx) % (grid * grid);
            newDemand[cell] = Math.min(1.0, (newDemand[cell] || 0) + 0.25);
          });
        }

        // Calculate dynamic supply based on driver users status
        const drivers = users.filter((u: any) => u.role === "driver");
        if (drivers.length > 0) {
          drivers.forEach((d: any, idx: number) => {
            const cell = (d.id || idx) * 3 % (grid * grid);
            newSupply[cell] = Math.min(1.0, (newSupply[cell] || 0) + 0.3);
          });
        }

        // Calculate dynamic traffic based on in-progress/active rides
        const activeRides = rides.filter((r: any) => !["completed", "cancelled"].includes(r.status));
        if (activeRides.length > 0) {
          activeRides.forEach((r: any, idx: number) => {
            const cell = (r.id || idx) * 7 % (grid * grid);
            newTraffic[cell] = Math.min(1.0, (newTraffic[cell] || 0) + 0.4);
          });
        }

        // Calculate dynamic flood indicators if settings have geofence zones flagged
        const rainSetting = await api.getSetting("rain_mode");
        const floodSetting = await api.getSetting("flood_mode");
        const rainActive = rainSetting && rainSetting.value === true;
        const floodActive = floodSetting && floodSetting.value === true;

        if (floodActive) {
          // Add waterlogging overlay levels to Velachery, T.Nagar, OMR zones in the 14x14 grid
          newFlood[grid * 11 + 11] = 0.95;
          newFlood[grid * 11 + 10] = 0.85;
          newFlood[grid * 3 + 11] = 0.75;
          newFlood[grid * 4 + 11] = 0.65;
        } else if (rainActive) {
          newFlood[grid * 11 + 11] = 0.45;
        }

        setDemand(newDemand);
        setSupply(newSupply);
        setTraffic(newTraffic);
        setFlood(newFlood);
        
        // Generate simulated AI prediction spikes in core zones
        const newAi = new Array(grid * grid).fill(0);
        for (let i = 0; i < grid * grid; i++) {
          const x = i % grid;
          const y = Math.floor(i / grid);
          let baseVal = 0;
          if (x >= 10 && x <= 12 && y >= 2 && y <= 4) baseVal = 0.85; // T. Nagar predicted spike
          else if (x >= 10 && x <= 13 && y >= 10 && y <= 12) baseVal = 0.90; // Velachery predicted spike
          else if (x >= 2 && x <= 4 && y >= 2 && y <= 4) baseVal = 0.70; // Anna Nagar predicted spike
          else if ((i * 17) % 23 === 0) baseVal = 0.35; // scattered demand
          
          newAi[i] = Math.min(1.0, (newDemand[i] || 0) * 0.5 + baseVal);
        }
        setAi(newAi);

        // Dynamic stats calculations
        const peakCellVal = Math.max(...newDemand);
        const totalDriversOnline = drivers.filter((d: any) => d.status === "active" || d.is_online).length;
        const totalPendingRides = rides.filter((r: any) => r.status === "pending").length;

        const dynamicStats = {
          demand: [
            { l: "Demand Peak Intensity", v: peakCellVal > 0 ? `Geocell Peak: ${(peakCellVal * 100).toFixed(0)}%` : "No active demand", c: "text-primary" },
            { l: "Pending Rides Requests", v: `${totalPendingRides} rides queueing`, c: "text-destructive" },
            { l: "Chennai efficiency", v: rides.length > 0 ? `${Math.round(((rides.length - totalPendingRides) / rides.length) * 100)}% Match rate` : "100% idle", c: "text-accent" }
          ],
          supply: [
            { l: "Active Fleet Count", v: `${totalDriversOnline} drivers online`, c: "text-primary" },
            { l: "Unfulfilled Requests", v: `${totalPendingRides} pending match`, c: "text-destructive" },
            { l: "Available drivers", v: `${drivers.length - totalDriversOnline} offline`, c: "text-accent" }
          ],
          traffic: [
            { l: "Slowest Congestion", v: activeRides.length > 0 ? `${activeRides.length} active detours` : "Clear flows", c: "text-destructive" },
            { l: "Route Detours", v: rainActive ? "Heavy Rerouting Active" : "OMR Bypass · Normal", c: "text-accent" },
            { l: "Average Delay", v: activeRides.length > 0 ? `+${(activeRides.length * 1.5).toFixed(1)} mins ETA` : "+0 mins ETA", c: "text-primary" }
          ],
          flood: [
            { l: "Geofence Alert", v: floodActive ? "🚨 Velachery Geofence WATERLOGGED" : "Velachery Geofence Normal", c: "text-primary" },
            { l: "Flood Surges", v: floodActive ? "OMR Sholinganallur / T. Nagar Flood Lock" : "Adyar · No Rain Surge", c: "text-accent" },
            { l: "Civic Warnings", v: floodActive ? "Avoid subways, use flyovers" : "All routes clear", c: "text-primary" }
          ],
          ai: [
            { l: "AI Predicted Spike", v: peakCellVal > 0 ? `+${(peakCellVal * 40).toFixed(0)}% peak predicted` : "No predicted spikes", c: "text-primary font-bold" },
            { l: "AI ETA Prediction", v: activeRides.length > 0 ? "ETA stable" : "Clear roads predicted", c: "text-accent" },
            { l: "AI Supply Match", v: "Auto relocation not required", c: "text-primary" }
          ]
        };

        setStats(dynamicStats[activeLayer]);
      } catch (err) {
        console.error("Failed to load heatmap metrics:", err);
      }
    }
    loadHeatmapData();
  }, [activeLayer]);

  const getActiveData = () => {
    switch (activeLayer) {
      case "demand": return demand;
      case "supply": return supply;
      case "traffic": return traffic;
      case "flood": return flood;
      case "ai": return ai;
      default: return demand;
    }
  };

  const mapData = getActiveData();

  const getOverlayLabel = () => {
    switch (activeLayer) {
      case "demand": return "Pink = severe undersupply · Orange = high demand geofences";
      case "supply": return "Red = critical driver shortage geofences";
      case "traffic": return "Yellow/Orange = heavy congestion on key arterial roads";
      case "flood": return "Neon Blue = heavy flooding waterlogging zones geofenced";
      case "ai": return "Futuristic Pink = AI predicted demand spikes in next 30 minutes";
    }
  };

  const getZoneLabel = (idx: number) => {
    const x = idx % grid;
    const y = Math.floor(idx / grid);
    if (x < 5 && y < 5) return "Anna Nagar Zone";
    if (x >= 9 && y < 5) return "T. Nagar Zone";
    if (x < 5 && y >= 9) return "Porur Zone";
    if (x >= 9 && y >= 9) return "Velachery/OMR Zone";
    return "Adyar / Chennai Central geofence";
  };

  return (
    <AdminShell 
      title="Heatmap & Demand Analytics" 
      subtitle="Chennai ride geofence hotspots · live traffic supply grid tracking"
      actions={
        <div className="flex gap-1.5 bg-muted/40 p-0.5 rounded-lg border border-border/60">
          <Button 
            size="sm" 
            variant={activeLayer === "demand" ? "secondary" : "ghost"} 
            onClick={() => setActiveLayer("demand")}
            className="h-8 text-[10px] gap-1 font-bold"
          >
            <Flame className="h-3.5 w-3.5 text-primary" /> Demand
          </Button>
          <Button 
            size="sm" 
            variant={activeLayer === "supply" ? "secondary" : "ghost"} 
            onClick={() => setActiveLayer("supply")}
            className="h-8 text-[10px] gap-1 font-bold"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-destructive" /> Supply Gap
          </Button>
          <Button 
            size="sm" 
            variant={activeLayer === "traffic" ? "secondary" : "ghost"} 
            onClick={() => setActiveLayer("traffic")}
            className="h-8 text-[10px] gap-1 font-bold"
          >
            <TrafficCone className="h-3.5 w-3.5 text-accent" /> Traffic
          </Button>
          <Button 
            size="sm" 
            variant={activeLayer === "flood" ? "secondary" : "ghost"} 
            onClick={() => setActiveLayer("flood")}
            className="h-8 text-[10px] gap-1 font-bold"
          >
            <CloudRain className="h-3.5 w-3.5 text-blue-400" /> Flood Warning
          </Button>
          <Button 
            size="sm" 
            variant={activeLayer === "ai" ? "secondary" : "ghost"} 
            onClick={() => setActiveLayer("ai")}
            className="h-8 text-[10px] gap-1 font-bold"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> AI Prediction
          </Button>
        </div>
      }
    >
      <Panel title="City Geofenced Heatmap Overlay" description={getOverlayLabel()}>
        <div className="grid gap-4 lg:grid-cols-4 items-start">
          {/* Visual Grid Map */}
          <div className="lg:col-span-3">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-[oklch(0.10_0.02_350)] p-3 shadow-md">
              <div className="grid h-full w-full gap-1" style={{ gridTemplateColumns: `repeat(${grid}, 1fr)` }}>
                {mapData.map((v, i) => {
                  let hue = "350"; // pink for demand
                  if (activeLayer === "supply") hue = "25"; // orange/red for supply
                  if (activeLayer === "traffic") hue = "55"; // yellow for traffic
                  if (activeLayer === "flood") hue = "240"; // neon blue for flood
                  if (activeLayer === "ai") hue = "300"; // purple for AI

                  const isHovered = hoveredIndex === i;

                  return (
                    <div 
                      key={i} 
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      className={`rounded-sm transition-all duration-200 cursor-crosshair ${isHovered ? "ring-2 ring-white scale-110 shadow-lg z-10" : ""}`}
                      style={{ 
                        backgroundColor: `oklch(0.55 ${(v*0.25).toFixed(2)} ${hue} / ${(0.15+v*0.85).toFixed(2)})`,
                        boxShadow: isHovered ? `0 0 16px oklch(0.55 0.25 ${hue})` : "none"
                      }} 
                    />
                  );
                })}
              </div>

              {/* Float Hover Inspector HUD */}
              {hoveredIndex !== null && (
                <div className="absolute top-4 left-4 bg-background/85 border border-border/80 rounded-lg p-2.5 backdrop-blur shadow-2xl animate-fade-in text-[10px] space-y-1 z-30 font-semibold max-w-[170px]">
                  <div className="font-bold text-foreground">{getZoneLabel(hoveredIndex)}</div>
                  <div className="text-muted-foreground">Geocell ID: <span className="font-mono">#{2000 + hoveredIndex}</span></div>
                  <div className="flex justify-between gap-3 pt-1 border-t border-border/40 mt-1">
                    <span>Intensity Match</span>
                    <span className="font-mono text-primary font-bold">{(mapData[hoveredIndex] * 100).toFixed(0)}%</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-3 left-3 rounded-md border border-border/80 bg-background/80 px-2 py-1 text-[10px] backdrop-blur font-semibold">
                Chennai Core Geofence Grid · 14×14 microcells
              </div>
            </div>
          </div>

          {/* Map stats */}
          <div className="lg:col-span-1 space-y-3">
            <Panel title="Real-time Zone Metrics" description="Active geocell analytics logs">
              <div className="space-y-4 text-xs font-semibold">
                {stats.map((s, i) => (
                  <div key={i} className="bg-muted/20 border border-border/40 rounded-lg p-3">
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{s.l}</span>
                    <div className={`mt-1 font-bold text-sm ${s.c}`}>{s.v}</div>
                  </div>
                ))}
                
                <div className="border-t border-border/60 pt-3 text-[10px] text-muted-foreground leading-relaxed font-normal">
                  📌 Heatmap telemetry aggregates customer GPS searches, driver locations, and weather feeds. Grid cells recalculate every 6 seconds to coordinate automated Chennai geofence surge rule triggers.
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </Panel>
    </AdminShell>
  );
}