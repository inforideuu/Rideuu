import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, StatCard, Panel } from "@/components/admin/AdminShell";
import { useState, useEffect, useRef } from "react";
import { 
  Activity, Car, AlertTriangle, MapPin, Play, Pause, RotateCcw, 
  ShieldAlert, PhoneCall, Send, CloudRain, ShieldCheck, Flame, TrafficCone,
  Volume2
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "../lib/api";

export const Route = createFileRoute("/live-rides")({ component: Page });

const statusCls: Record<string, string> = {
  "in-trip": "bg-primary/15 text-primary border-primary/30",
  "pickup": "bg-accent/15 text-accent border-accent/30",
  "sos": "bg-destructive/20 text-destructive border-destructive/40 animate-pulse font-bold",
};

// Flood, traffic and surge geofences in Chennai
const floodZones = [{x: 70, y: 58, r: 42, name: "Velachery Waterlogging"}, {x: 42, y: 25, r: 30, name: "T. Nagar Flooding"}];
const surgeZones = [{x: 75, y: 68, m: "1.6x", name: "OMR Sholinganallur"}, {x: 28, y: 22, m: "1.4x", name: "T. Nagar"}];

function Page() {
  const [rides, setRides] = useState<any[]>([]);
  const [selectedRide, setSelectedRide] = useState<any | null>(null);
  const [showTraffic, setShowTraffic] = useState(true);
  const [showFlood, setShowFlood] = useState(true);
  const [showSurge, setShowSurge] = useState(true);

  const [driversCount, setDriversCount] = useState(0);
  const [avgEta, setAvgEta] = useState("0 min");
  const [sosCount, setSosCount] = useState(0);
  
  // Replay Animation States
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayProgress, setReplayProgress] = useState(0); // 0 to 100
  const [dispatched, setDispatched] = useState(false);
  const [contactsNotified, setContactsNotified] = useState(false);

  const loadLiveRidesRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    async function loadLiveRides() {
      try {
        const users = await api.getUsers() || [];
        const allRides = await api.getRides() || [];
        const sosAlerts = await api.getSOSAlerts() || [];

        // Drivers count
        const activeDrivers = users.filter((u: any) => u.role === "driver" && u.is_online);
        setDriversCount(activeDrivers.length);

        // Filter active rides
        const activeRides = allRides.filter((r: any) => 
          !["completed", "cancelled", "payment_completed", "payment_success"].includes(r.status)
        );

        const activeSosAlerts = sosAlerts.filter((a: any) => a.status === 'ACTIVE');

        const mappedRides = activeRides.map((r: any, idx: number) => {
          // Determine status mapping
          const activeSos = activeSosAlerts.find((a: any) => Number(a.ride) === Number(r.id));
          let status = "pickup";
          if (r.status === "accepted" || r.status === "arrived") status = "pickup";
          if (r.status === "in_progress" || r.status === "trip") status = "in-trip";
          if (activeSos) status = "sos";

          // Parse driver & customer names from objects or IDs if not joined
          const driverName = r.driver_name || (r.driver ? `Driver #${r.driver}` : "Unassigned");
          const customerName = r.customer_name || (r.customer ? `Customer #${r.customer}` : "Guest");

          // Parse driver & customer coordinates if available
          const custLat = activeSos ? activeSos.latitude : (r.customer_detail?.current_latitude || 13.0382);
          const custLng = activeSos ? activeSos.longitude : (r.customer_detail?.current_longitude || 80.2785);
          const drivLat = r.driver_detail?.current_latitude || custLat + 0.005;
          const drivLng = r.driver_detail?.current_longitude || custLng + 0.005;

          const path = [
            { x: drivLng, y: drivLat },
            { x: drivLng + (custLng - drivLng) * 0.5, y: drivLat + (custLat - drivLat) * 0.5 },
            { x: custLng, y: custLat }
          ];

          return {
            id: `A${r.id}`,
            dbId: r.id,
            sosAlertId: activeSos ? activeSos.id : null,
            sosAlertDetails: activeSos || null,
            driver: driverName,
            customer: customerName,
            from: r.pickup ? r.pickup.split(",")[0] : "Chennai Pickup",
            to: r.dropoff ? r.dropoff.split(",")[0] : "Chennai Destination",
            v: `${r.vehicle_type === "bike" ? "Bike" : "Auto"} (${r.vehicle_number || "TN-01-XX-0000"})`,
            eta: r.eta ? `${r.eta} min` : "5 min",
            status,
            fare: r.fare || 0,
            speed: activeSos && activeSos.current_speed !== null ? `${activeSos.current_speed} km/h` : ((r.status === "in_progress" || r.status === "trip") ? "38 km/h" : "0 km/h"),
            path,
            warning: activeSos ? "SOS PANIC TRIGGERED" : null
          };
        });

        setRides(mappedRides);
        setSosCount(activeSosAlerts.length);

        if (mappedRides.length > 0) {
          // Calculate average ETA
          const totalEta = activeRides.reduce((sum: number, r: any) => sum + (parseInt(r.eta) || 4), 0);
          setAvgEta(`${(totalEta / activeRides.length).toFixed(1)} min`);

          // Select first SOS or first active ride if not already selected
          if (!selectedRide) {
            const sosRide = mappedRides.find((r: any) => r.status === "sos");
            setSelectedRide(sosRide || mappedRides[0]);
          } else {
            // Update selected ride with fresh data
            const updated = mappedRides.find((r: any) => r.id === selectedRide.id);
            if (updated) setSelectedRide(updated);
          }
        } else {
          setAvgEta("0 min");
          setSelectedRide(null);
        }

      } catch (err) {
        console.error("Failed to load live rides:", err);
      }
    }
    loadLiveRidesRef.current = loadLiveRides;
    loadLiveRides();
    const interval = setInterval(loadLiveRides, 5000);
    return () => clearInterval(interval);
  }, []);

  // Focus active SOS ride if sos=true query parameter is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("sos") === "true" && rides.length > 0) {
        const sosRide = rides.find((r: any) => r.status === "sos");
        if (sosRide && selectedRide?.id !== sosRide.id) {
          setSelectedRide(sosRide);
        }
      }
    }
  }, [rides]);

  // Animate the path replay if active
  useEffect(() => {
    let timer: any;
    if (isReplaying) {
      timer = setInterval(() => {
        setReplayProgress(p => {
          if (p >= 100) {
            setIsReplaying(false);
            return 100;
          }
          return p + 10;
        });
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isReplaying]);

  const handleStartReplay = () => {
    setReplayProgress(0);
    setIsReplaying(true);
  };

  const handleDispatchEmergency = () => {
    setDispatched(true);
    // Simulate a successful emergency dispatch notification
    const alertMsg = `🚨 EMERGENCY DISPATCH: Chennai Quick Response Team dispatched to ${selectedRide?.from || 'Mylapore'} for Ride #${selectedRide?.id}. ETA 4 minutes.`;
    alert(alertMsg);
  };

  const handleNotifyContacts = () => {
    setContactsNotified(true);
    alert(`💬 SMS broadcasted to ${selectedRide?.customer || "Meera P."}'s trusted emergency contacts with active live tracking location.`);
  };

  const handleResolveSos = async () => {
    if (selectedRide?.sosAlertId) {
      try {
        await api.resolveSOSAlert(selectedRide.sosAlertId);
        alert(`SOS Alert resolved and closed successfully.`);
        if (loadLiveRidesRef.current) {
          loadLiveRidesRef.current();
        }
      } catch (err) {
        console.error("Failed resolving SOS Alert", err);
      }
    }
  };

  // Calculate current animation position
  const getAnimatedCoords = () => {
    if (!selectedRide) return null;
    const p = selectedRide.path;
    const index = Math.min(
      p.length - 1,
      Math.floor((replayProgress / 100) * p.length)
    );
    return p[index];
  };

  const animCoords = getAnimatedCoords();

  return (
    <AdminShell 
      title="Live Ride Monitoring" 
      subtitle={`${rides.length} trips in progress - Chennai Telemetry Center`}
      actions={
        <>
          <Badge variant="outline" className="gap-1.5 border-destructive/40 text-destructive bg-destructive/5 font-semibold py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-destructive" />LIVE DISPATCH
          </Badge>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Active trips" value={rides.length.toString()} delta="" icon={Car} tone="primary" />
        <StatCard label="Drivers online" value={driversCount.toString()} delta="" icon={Activity} tone="accent" />
        <StatCard label="Avg ETA" value={avgEta} delta="" icon={MapPin} tone="primary" />
        <StatCard label="Open SOS" value={sosCount.toString()} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-5">
        {/* Interactive Map */}
        <div className="lg:col-span-3">
          <Panel 
            title="Chennai Telemetry Map" 
            description="Live driver coordinates and active geofences"
            action={
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={showTraffic ? "secondary" : "outline"} 
                  onClick={() => setShowTraffic(t => !t)}
                  className="h-7 text-[10px] gap-1 px-2 border-border/60"
                >
                  <TrafficCone className="h-3 w-3" /> Traffic
                </Button>
                <Button 
                  size="sm" 
                  variant={showFlood ? "secondary" : "outline"} 
                  onClick={() => setShowFlood(f => !f)}
                  className="h-7 text-[10px] gap-1 px-2 border-border/60"
                >
                  <CloudRain className="h-3 w-3" /> Flood
                </Button>
                <Button 
                  size="sm" 
                  variant={showSurge ? "secondary" : "outline"} 
                  onClick={() => setShowSurge(s => !s)}
                  className="h-7 text-[10px] gap-1 px-2 border-border/60"
                >
                  <Flame className="h-3 w-3" /> Surge
                </Button>
              </div>
            }
          >
                  <div className="relative h-[490px] overflow-hidden rounded-lg border border-border">
              {/* Leaflet map implementation */}
              <div id="admin-telemetry-map" className="w-full h-full z-10" style={{ minHeight: "490px" }} />
              
              {/* Dynamic Leaflet Injector script */}
              <AdminTelemetryMapScript 
                rides={rides}
                selectedRide={selectedRide}
                showTraffic={showTraffic}
                showFlood={showFlood}
                showSurge={showSurge}
                replayProgress={replayProgress}
              />
            </div> 
          </Panel>
        </div>

        {/* Sidebar Dispatch Drawer */}
        <div className="lg:col-span-2 space-y-3">
          {/* Active list */}
          <Panel title="Active rides queue" description="Chennai Geofence Status Tracker">
            <ul className="-mx-2 max-h-[175px] space-y-1 overflow-y-auto pr-1">
              {rides.map(r => (
                <li 
                  key={r.id} 
                  onClick={() => {
                    setSelectedRide(r);
                    setIsReplaying(false);
                    setReplayProgress(0);
                    setDispatched(false);
                    setContactsNotified(false);
                  }}
                  className={`cursor-pointer rounded-lg px-3 py-2.5 transition-all flex items-center justify-between border ${
                    selectedRide?.id === r.id 
                      ? "bg-gradient-to-r from-primary/10 to-accent/5 border-primary shadow-sm" 
                      : "bg-transparent border-transparent hover:bg-muted/30"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-mono text-xs font-semibold text-foreground">#{r.id}</div>
                      <span className={`rounded-full border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider ${statusCls[r.status]}`}>{r.status}</span>
                      {r.warning && <Badge variant="outline" className="border-destructive/30 text-destructive text-[8px] bg-destructive/5 font-semibold py-0 shrink-0">Alert</Badge>}
                    </div>
                    <div className="mt-1 text-xs font-semibold truncate text-foreground/90">{r.from} → {r.to}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 truncate">{r.driver} · {r.v}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-foreground">₹{r.fare}</div>
                    <div className="text-[9px] text-muted-foreground/80 font-mono font-semibold mt-0.5">ETA {r.eta}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          {/* Selected Ride / Emergency Safety Drawer */}
          {selectedRide && (
            <Panel 
              title={selectedRide.status === "sos" ? "⚠️ SOS EMERGENCY CONSOLE" : `Ride details · #${selectedRide.id}`}
              description={selectedRide.status === "sos" ? "Active High-Risk Panic Alert Triggered" : "Active dispatch tracking metrics"}
            >
              {selectedRide.status === "sos" ? (
                // Emergency Panel
                <div className="space-y-4 text-xs">
                  <div className="rounded-lg bg-destructive/15 border border-destructive/35 p-3 text-destructive animate-pulse flex items-start gap-2.5">
                    <ShieldAlert className="h-5 w-5 shrink-0" />
                    <div>
                      <div className="font-extrabold text-[11px] uppercase tracking-wider">PANIC ALERT TRIGGERED</div>
                      <div className="text-[10px] mt-0.5 leading-relaxed">
                        Customer {selectedRide.customer} activated panic button. Live telemetry streaming captured from device.
                      </div>
                    </div>
                  </div>

                  {/* Simulated Voice waveform */}
                  <div className="bg-muted/30 border border-border/80 rounded-lg p-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      <span className="flex items-center gap-1"><Volume2 className="h-3.5 w-3.5 text-destructive animate-bounce" /> Live Cabin Voice Feed</span>
                      <span className="text-destructive font-mono animate-pulse">recording active</span>
                    </div>
                    {/* Visual Wave lines */}
                    <div className="h-10 flex items-center justify-center gap-1.5 px-6">
                      {[2, 8, 4, 10, 6, 12, 3, 9, 2, 7, 10, 4, 8, 1, 9, 3, 11, 5, 8, 2].map((h, i) => (
                        <div 
                          key={i} 
                          className="w-1.5 rounded-full bg-destructive/60 animate-pulse" 
                          style={{ 
                            height: `${h * 8}%`, 
                            animationDelay: `${i * 120}ms`,
                            animationDuration: "800ms"
                          }} 
                        />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-background/50 border border-border/60 rounded-lg p-2.5 text-left">
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-bold">Customer</span>
                      <span className="font-bold text-foreground block mt-0.5">{selectedRide.customer}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-bold">Driver</span>
                      <span className="font-bold text-foreground block mt-0.5">{selectedRide.driver}</span>
                    </div>
                    <div className="col-span-2 border-t border-border/40 mt-1.5 pt-1.5">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-bold">Device Information</span>
                      <span className="font-semibold text-foreground truncate block mt-0.5">
                        {selectedRide.sosAlertDetails?.device_info || "Mobile Browser Client"}
                      </span>
                    </div>
                    <div className="col-span-2 border-t border-border/40 mt-1.5 pt-1.5">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-bold">Coordinates</span>
                      <span className="font-mono text-foreground block mt-0.5">
                        Lat: {selectedRide.sosAlertDetails?.latitude?.toFixed(5) || "N/A"}, Lng: {selectedRide.sosAlertDetails?.longitude?.toFixed(5) || "N/A"}
                      </span>
                    </div>
                  </div>

                  {selectedRide.sosAlertDetails?.snapshots && selectedRide.sosAlertDetails.snapshots.length > 0 && (
                    <div className="bg-muted/30 border border-border/80 rounded-lg p-2.5 space-y-1 text-left">
                      <span className="text-[9px] text-muted-foreground uppercase tracking-wider block font-bold">Continuous Location Snapshots</span>
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1 font-mono text-[9px] text-foreground/80">
                        {selectedRide.sosAlertDetails.snapshots.map((s: any, i: number) => (
                          <div key={i} className="flex justify-between border-b border-border/30 pb-0.5 last:border-0">
                            <span>#{i+1} Lat: {s.latitude.toFixed(5)}, Lng: {s.longitude.toFixed(5)}</span>
                            <span className="text-muted-foreground">{new Date(s.timestamp).toLocaleTimeString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleNotifyContacts}
                        disabled={contactsNotified}
                        variant="outline" 
                        className={`flex-1 h-9 text-[10px] font-bold gap-1 border-border/80 ${contactsNotified ? "text-emerald-500 border-emerald-500/30" : ""}`}
                      >
                        <Send className="h-3.5 w-3.5" /> {contactsNotified ? "SMS Contacts Alerted" : "Notify Emergency Contacts"}
                      </Button>
                      <Button 
                        onClick={handleDispatchEmergency}
                        disabled={dispatched}
                        className={`flex-1 h-9 text-[10px] font-black gap-1 text-white ${dispatched ? "bg-emerald-600 hover:bg-emerald-600" : "bg-destructive hover:bg-destructive/90"}`}
                      >
                        <PhoneCall className="h-3.5 w-3.5" /> {dispatched ? "Safety Team Dispatched" : "Dispatch Chennai Safety Team"}
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handleResolveSos}
                      className="w-full h-9 text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
                    >
                      <ShieldCheck className="h-4 w-4" /> Close & Resolve SOS (Generate Audit Logs)
                    </Button>
                  </div>
                </div>
              ) : (
                // Normal Active Ride info
                <div className="space-y-4 text-xs">
                  {selectedRide.warning && (
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-amber-500 flex gap-2 text-[10px]">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>{selectedRide.warning}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-background/50 border border-border/60 rounded-lg p-2.5">
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase">Passenger</span>
                      <span className="font-semibold block text-foreground mt-0.5">{selectedRide.customer}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase">Vehicle Type</span>
                      <span className="font-semibold block text-foreground mt-0.5">{selectedRide.v}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase">Current Telemetry Speed</span>
                      <span className="font-mono font-bold block text-accent mt-0.5">{selectedRide.speed}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-muted-foreground uppercase">Ride Fare Est.</span>
                      <span className="font-mono font-bold block text-foreground mt-0.5">₹{selectedRide.fare}</span>
                    </div>
                  </div>

                  {/* Replay Visual Controls */}
                  <div className="border border-border/80 bg-muted/20 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-[9px] text-muted-foreground uppercase tracking-widest font-black">
                      <span>Ride Path Replay Simulator</span>
                      {isReplaying && <span className="text-accent animate-pulse">playing ({replayProgress}%)</span>}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/30">
                      <div className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300" style={{ width: `${replayProgress}%` }} />
                    </div>

                    <div className="flex justify-end gap-1.5 pt-1">
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-[10px] gap-1 border-border/60" onClick={() => setReplayProgress(0)}>
                        <RotateCcw className="h-3 w-3" /> Reset
                      </Button>
                      <Button size="sm" className="h-7 px-2.5 text-[10px] gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold" onClick={handleStartReplay}>
                        <Play className="h-3 w-3" /> Run Replay Simulation
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Panel>
          )}
        </div>
      </div>
    </AdminShell>
  );
}

// Interactive Map Script to render real telemetry details
interface AdminTelemetryMapScriptProps {
  rides: any[];
  selectedRide: any | null;
  showTraffic: boolean;
  showFlood: boolean;
  showSurge: boolean;
  replayProgress: number;
}

function AdminTelemetryMapScript({
  rides,
  selectedRide,
  showTraffic,
  showFlood,
  showSurge,
  replayProgress
}: AdminTelemetryMapScriptProps) {
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<any>(null);
  const layersRef = useRef<any[]>([]);

  // Dynamically load Leaflet CDN assets to prevent server-side compilation issues
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if (typeof (window as any).L === "undefined") {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);

  // Initialize and update the map
  useEffect(() => {
    if (!leafletLoaded) return;
    const L = (window as any).L;
    if (!L) return;

    const mapContainer = document.getElementById("admin-telemetry-map");
    if (!mapContainer) return;

    // Center of Chennai (Anna Nagar Area)
    const centerLat = 13.0850;
    const centerLng = 80.2100;

    if (!mapRef.current) {
      mapRef.current = L.map("admin-telemetry-map", {
        zoomControl: false,
        attributionControl: false,
      }).setView([centerLat, centerLng], 12);

      // Standard light tiles matching Google Maps layout in the uploaded reference image
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear old layers
    layersRef.current.forEach((layer: any) => map.removeLayer(layer));
    layersRef.current = [];

    // 0. Render Traffic Layers
    if (showTraffic) {
      // Anna Salai
      const traffic1 = L.polyline([[13.0600, 80.2500], [13.0400, 80.2400], [13.0200, 80.2200]], {
        color: "#ef4444", // Red - Heavy traffic
        weight: 6,
        opacity: 0.65
      }).addTo(map).bindPopup("Anna Salai: Heavy Traffic (Red)");
      layersRef.current.push(traffic1);

      // OMR
      const traffic2 = L.polyline([[12.9895, 80.2483], [12.9750, 80.2460], [12.9600, 80.2450]], {
        color: "#f97316", // Orange - Moderate traffic
        weight: 6,
        opacity: 0.65
      }).addTo(map).bindPopup("OMR: Moderate Traffic (Orange)");
      layersRef.current.push(traffic2);

      // Poonamallee High Road
      const traffic3 = L.polyline([[13.0827, 80.2707], [13.0780, 80.2400], [13.0750, 80.2100]], {
        color: "#ef4444", // Red - Heavy traffic
        weight: 6,
        opacity: 0.65
      }).addTo(map).bindPopup("Poonamallee High Road: Congested");
      layersRef.current.push(traffic3);

      // Inner Ring Road
      const traffic4 = L.polyline([[13.0084, 80.2131], [13.0000, 80.2150], [12.9915, 80.2185]], {
        color: "#22c55e", // Green - Clear traffic
        weight: 6,
        opacity: 0.65
      }).addTo(map).bindPopup("Inner Ring Road: Clear");
      layersRef.current.push(traffic4);
    }

    // 1. Render Surge Zones
    if (showSurge) {
      // Sholinganallur
      const surge1 = L.circle([12.9815, 80.2185], {
        color: "#f59e0b",
        fillColor: "#f59e0b",
        fillOpacity: 0.2,
        radius: 1200
      }).addTo(map).bindPopup("Surge Area: OMR Sholinganallur (1.6x)");
      layersRef.current.push(surge1);

      // T. Nagar
      const surge2 = L.circle([13.0402, 80.2337], {
        color: "#f59e0b",
        fillColor: "#f59e0b",
        fillOpacity: 0.2,
        radius: 1000
      }).addTo(map).bindPopup("Surge Area: T. Nagar (1.4x)");
      layersRef.current.push(surge2);

      // Anna Nagar
      const surge3 = L.circle([13.0850, 80.2100], {
        color: "#f59e0b",
        fillColor: "#f59e0b",
        fillOpacity: 0.2,
        radius: 1100
      }).addTo(map).bindPopup("Surge Area: Anna Nagar (1.5x)");
      layersRef.current.push(surge3);
    }

    // 2. Render Flood Zones
    if (showFlood) {
      // Velachery waterlogging
      const flood1 = L.circle([12.9915, 80.2185], {
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.25,
        radius: 1500
      }).addTo(map).bindPopup("Flood Geofence: Velachery Waterlogging (Severe)");
      layersRef.current.push(flood1);

      // T. Nagar Flooding
      const flood2 = L.circle([13.0420, 80.2350], {
        color: "#3b82f6",
        fillColor: "#3b82f6",
        fillOpacity: 0.25,
        radius: 800
      }).addTo(map).bindPopup("Flood Geofence: T. Nagar Waterlogging");
      layersRef.current.push(flood2);
    }

    // 3. Render Active Rides Paths & Markers
    rides.forEach(ride => {
      // Map path coordinates based on dynamic coordinates list
      if (!ride.path || ride.path.length < 2) return;
      const startPoint = ride.path[0];
      const endPoint = ride.path[ride.path.length - 1];
      const pLat = startPoint.y;
      const pLng = startPoint.x;
      const dLat = endPoint.y;
      const dLng = endPoint.x;

      // Calculate path coordinates
      if (ride.id === selectedRide?.id) {
        // Render detailed path line
        const pathLine = L.polyline(
          ride.path.map((pt: any) => [pt.y, pt.x]), 
          {
            color: ride.status === "sos" ? "#ef4444" : "#10b981",
            weight: 4,
            opacity: 0.8,
            dashArray: "6, 6"
          }
        ).addTo(map);
        layersRef.current.push(pathLine);

        // Vehicle marker
        const pct = replayProgress / 100;
        const curLat = pLat + (dLat - pLat) * pct;
        const curLng = pLng + (dLng - pLng) * pct;

        if (ride.status === "sos") {
          map.setView([curLat, curLng], 14);
          const radarRing = L.circle([curLat, curLng], {
            color: "#ef4444",
            fillColor: "#ef4444",
            fillOpacity: 0.2,
            radius: 400
          }).addTo(map);
          layersRef.current.push(radarRing);
        }

        const vehicleIcon = L.divIcon({
          className: "custom-admin-marker",
          html: `<div style="background-color: ${ride.status === "sos" ? "#ef4444" : "#10b981"}; width: 16px; height: 16px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 10px ${ride.status === "sos" ? "#ef4444" : "#10b981"};"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        const marker = L.marker([curLat, curLng], { icon: vehicleIcon })
          .addTo(map)
          .bindPopup(`Ride ${ride.id}: ${ride.driver} (${ride.status})`);
        layersRef.current.push(marker);
      } else {
        // Static dot marker
        const dotIcon = L.divIcon({
          className: "custom-admin-dot",
          html: `<div style="background-color: ${ride.status === "sos" ? "#ef4444" : "#3b82f6"}; width: 10px; height: 10px; border-radius: 50%; border: 1.5px solid white; opacity: 0.85;"></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5]
        });
        const marker = L.marker([pLat, pLng], { icon: dotIcon })
          .addTo(map)
          .bindPopup(`Ride ${ride.id}`);
        layersRef.current.push(marker);
      }
    });

  }, [leafletLoaded, rides, selectedRide, showTraffic, showFlood, showSurge, replayProgress]);

  return null;
}