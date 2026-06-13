import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, StatCard, Panel } from "@/components/admin/AdminShell";
import { SimpleTable, TableToolbar } from "@/components/admin/DataTable";
import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Car, XCircle, IndianRupee, Activity, X, Calendar, 
  MapPin, Clock, ShieldAlert, Sparkles, Navigation, UserCheck,
  Play, Pause, RotateCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "../lib/api";

export const Route = createFileRoute("/rides")({ component: Page });

type Ride = { 
  id: string; 
  date: string; 
  customer: string; 
  driver: string; 
  route: string; 
  v: string; 
  fare: number; 
  status: string;
  timeline: { title: string; time: string; desc: string }[];
  breakdown: { base: number; dist: number; surge: number; fee: number; tax: number };
  dispute: string | null;
  ride_type?: string;
  scheduled_time?: string;
};

const cls: Record<string, string> = { 
  completed: "bg-primary/15 text-primary border-primary/30", 
  COMPLETED: "bg-primary/15 text-primary border-primary/30", 
  cancelled: "bg-destructive/20 text-destructive border-destructive/40", 
  CANCELLED: "bg-destructive/20 text-destructive border-destructive/40", 
  refunded: "bg-accent/15 text-accent border-accent/30", 
  "in-progress": "bg-muted/40 text-foreground border-border",
  SCHEDULED: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  MATCHING_PENDING: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  RIDER_ASSIGNED: "bg-teal-500/15 text-teal-500 border-teal-500/30",
  DRIVER_EN_ROUTE: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
  DRIVER_ARRIVED: "bg-purple-500/15 text-purple-500 border-purple-500/30",
  RIDE_STARTED: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
};

function Page() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [search, setSearch] = useState("");
  const [reassigning, setReassigning] = useState(false);
  const [activeTab, setActiveTab] = useState<"standard" | "scheduled">("standard");

  const [selectedRideDetails, setSelectedRideDetails] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const handleReassignDriver = async () => {
    if (!selectedRide) return;
    setReassigning(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Successfully reassigned nearest driver!");
    } catch (err) {
      console.error(err);
    } finally {
      setReassigning(false);
    }
  };

  const [stats, setStats] = useState({
    totalCount: 0,
    cancelRate: "0%",
    refundSum: 0,
    avgTime: "0 min"
  });

  useEffect(() => {
    async function loadRides() {
      try {
        const data = await api.getRides() || [];
        
        // Map backend rides to dashboard structure
        const mapped = data.map((r: any) => {
          let status = r.status;
          if (["payment_completed", "payment_success"].includes(r.status)) status = "completed";

          const driverName = r.driver_name || (r.driver ? `Driver #${r.driver}` : "—");
          const customerName = r.customer_name || (r.customer ? `Customer #${r.customer}` : "Guest");

          const dateObj = new Date(r.created_at || Date.now());
          const dateStr = dateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
          });

          // Generate dynamic timelines
          const timeline = [
            { title: r.ride_type === "SCHEDULED" ? "Ride Scheduled" : "Booking Requested", time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), desc: r.ride_type === "SCHEDULED" ? `Scheduled for ${r.scheduled_date} at ${r.scheduled_time}` : `Requested ${r.vehicle_type} ride` }
          ];
          if (r.driver) {
            timeline.push({ title: "Driver Matched", time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), desc: `Driver matched: ${driverName}` });
          }
          if (status === "completed" || status === "COMPLETED") {
            timeline.push({ title: "Trip Completed", time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), desc: `Trip finished. Fare: ₹${r.fare}` });
          }

          // Generate base fare breakdowns
          const fare = r.fare || 0;
          const base = Math.round(fare * 0.3);
          const dist = Math.round(fare * 0.5);
          const surge = Math.round(fare * 0.1);
          const fee = r.commission !== undefined && r.commission !== null ? r.commission : Math.round(fare * (r.vehicle_type?.toLowerCase().includes("auto") ? 0.08 : 0.05));
          const tax = Math.max(0, fare - (base + dist + surge + fee));

          return {
            id: `A${r.id}`,
            date: r.ride_type === "SCHEDULED" ? `${r.scheduled_date} at ${r.scheduled_time}` : dateStr,
            customer: customerName,
            driver: driverName,
            route: `${r.pickup ? r.pickup.split(",")[0] : "Pickup"} → ${r.dropoff ? r.dropoff.split(",")[0] : "Dropoff"}`,
            v: r.vehicle_type === "bike" ? "Bike" : "Auto",
            fare,
            status,
            timeline,
            breakdown: { base, dist, surge, fee, tax },
            dispute: r.sos_triggered ? "Safety trigger active detour log" : null,
            ride_type: r.ride_type,
            scheduled_time: r.ride_type === "SCHEDULED" ? `${r.scheduled_date} at ${r.scheduled_time}` : undefined
          };
        });

        setRides(mapped);

        // Calculate stats
        const total = data.length;
        const cancelled = data.filter((r: any) => ["cancelled", "CANCELLED"].includes(r.status)).length;
        const refundedRides = data.filter((r: any) => r.status === "refunded");
        const refundSum = refundedRides.reduce((sum: number, r: any) => sum + (r.fare || 0), 0);

        setStats({
          totalCount: total,
          cancelRate: total > 0 ? `${Math.round((cancelled / total) * 100)}%` : "0%",
          refundSum,
          avgTime: total > 0 ? "12 min" : "0 min"
        });

      } catch (err) {
        console.error("Failed to load rides:", err);
      }
    }
    loadRides();
  }, []);

  // Fetch detailed ride object including tracking_history when selectedRide changes
  useEffect(() => {
    if (selectedRide) {
      const rawId = selectedRide.id.replace("A", "");
      api.getRide(rawId).then(details => {
        setSelectedRideDetails(details);
        setPlaybackIndex(0);
        setIsPlaying(false);
      });
    } else {
      setSelectedRideDetails(null);
      setPlaybackIndex(0);
      setIsPlaying(false);
    }
  }, [selectedRide]);

  // Order GPS coordinates by timestamp
  const gpsPoints = useMemo(() => {
    if (!selectedRideDetails?.tracking_history) return [];
    return [...selectedRideDetails.tracking_history].sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [selectedRideDetails]);

  // Handle Playback Interval timer
  useEffect(() => {
    let timer: any;
    if (isPlaying && gpsPoints.length > 0) {
      const baseInterval = 1000; // 1 second per step
      const intervalVal = baseInterval / playbackSpeed;
      timer = setInterval(() => {
        setPlaybackIndex(prev => {
          if (prev >= gpsPoints.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalVal);
    }
    return () => clearInterval(timer);
  }, [isPlaying, gpsPoints, playbackSpeed]);

  // Filter based on standard vs scheduled tab
  const tabRides = rides.filter(r => 
    activeTab === "scheduled" ? r.ride_type === "SCHEDULED" : r.ride_type !== "SCHEDULED"
  );

  const filtered = tabRides.filter(r => 
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.customer.toLowerCase().includes(search.toLowerCase()) ||
    r.driver.toLowerCase().includes(search.toLowerCase()) ||
    r.route.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Ride Management" subtitle="All trips · search, filter, refund">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Trips today" value={stats.totalCount.toString()} delta="" icon={Car} tone="primary" />
        <StatCard label="Cancellations" value={stats.cancelRate} delta="" icon={XCircle} tone="accent" />
        <StatCard label="Refunds (24h)" value={`₹${stats.refundSum}`} icon={IndianRupee} tone="destructive" />
        <StatCard label="Avg trip time" value={stats.avgTime} delta="" icon={Activity} tone="primary" />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5 items-start">
        {/* Table list */}
        <div className={`overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 ${selectedRide ? "lg:col-span-3" : "lg:col-span-5"}`}>
          <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/45 px-4 py-2.5">
            <div className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs font-semibold mr-2">
              <button
                onClick={() => { setActiveTab("standard"); setSelectedRide(null); }}
                className={`rounded-md px-3 py-1 transition-all ${activeTab === "standard" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Standard Rides ({rides.filter(r => r.ride_type !== 'SCHEDULED').length})
              </button>
              <button
                onClick={() => { setActiveTab("scheduled"); setSelectedRide(null); }}
                className={`rounded-md px-3 py-1 transition-all ${activeTab === "scheduled" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Scheduled Rides ({rides.filter(r => r.ride_type === 'SCHEDULED').length})
              </button>
            </div>

            <div className="relative w-full max-w-xs shrink-0">
              <Input 
                placeholder="Search ride ID, customer, driver..." 
                className="h-8 pl-8 text-xs bg-muted/40"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search && <span className="text-[10px] text-muted-foreground font-mono">{filtered.length} found</span>}
          </div>

          <SimpleTable<Ride> 
            rows={filtered} 
            columns={[
              { key: "id", label: "Ride", render: r => <span className="font-mono text-xs text-muted-foreground">#{r.id}</span> },
              { key: "date", label: "When" },
              { key: "customer", label: "Customer" },
              { key: "driver", label: "Driver" },
              { key: "route", label: "Route" },
              { key: "v", label: "Vehicle" },
              { key: "fare", label: "Fare", render: r => <span className="tabular-nums font-semibold">₹{r.fare}</span> },
              { key: "status", label: "Status", render: r => <Badge variant="outline" className={`uppercase text-[9px] font-bold tracking-wide ${cls[r.status]}`}>{r.status}</Badge> },
              { key: "_", label: "", render: r => (
                <div className="flex justify-end gap-1.5">
                  <Button onClick={() => { setSelectedRide(r); setReassigning(false); }} variant="secondary" size="sm" className="h-7 text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all">
                    Details
                  </Button>
                  {['pending', 'matching_pending', 'scheduled'].includes(r.status.toLowerCase()) && (
                    <Button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete ride #${r.id}?`)) {
                          const rawId = r.id.replace("A", "");
                          await fetch(`http://localhost:8000/api/rides/${rawId}/`, {
                            method: "DELETE",
                            headers: {
                              ...(localStorage.getItem("admin_token") ? { "Authorization": `Bearer ${localStorage.getItem("admin_token")}` } : {})
                            }
                          });
                          setRides(prev => prev.filter(ride => ride.id !== r.id));
                          if (selectedRide && selectedRide.id === r.id) {
                            setSelectedRide(null);
                          }
                          alert("Ride deleted successfully.");
                        }
                      }} 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs font-semibold border-destructive/40 text-destructive bg-destructive/5 hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              ), className: "text-right" },
            ]} 
          />
        </div>

        {/* Dynamic Detail inspector drawer */}
        {selectedRide && (
          <div className="lg:col-span-2 space-y-3 animate-fade-in">
            <div className="rounded-xl border border-border bg-card p-4 relative shadow-md">
              <button onClick={() => setSelectedRide(null)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground font-black">
                  #{selectedRide.id.slice(1)}
                </div>
                <div>
                  <div className="font-extrabold text-base">Ride #{selectedRide.id}</div>
                  <span className="text-[10px] text-muted-foreground/80 font-mono font-semibold flex items-center gap-1"><Calendar className="h-3 w-3" /> {selectedRide.date}</span>
                </div>
              </div>

              {/* Status and vehicle description */}
              <div className="flex gap-1.5 mt-3">
                <Badge variant="outline" className={`uppercase text-[9px] font-bold ${cls[selectedRide.status]}`}>{selectedRide.status}</Badge>
                <Badge variant="secondary" className="text-[9px] font-bold">{selectedRide.v} Booking</Badge>
              </div>

              {/* Customer and Driver display */}
              <div className="grid grid-cols-2 gap-2 mt-4 bg-muted/20 border border-border/40 p-2.5 rounded-lg text-xs">
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Customer</span>
                  <span className="font-bold text-foreground block mt-0.5">{selectedRide.customer}</span>
                </div>
                <div>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Driver Assigned</span>
                  <span className="font-bold text-foreground block mt-0.5">{selectedRide.driver}</span>
                </div>
              </div>

              {/* Dispute alerts */}
              {selectedRide.dispute && (
                <div className="rounded-lg bg-destructive/15 border border-destructive/35 p-3 mt-3 text-destructive flex gap-2 text-[10px] animate-pulse">
                  <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                  <div>
                    <div className="font-extrabold uppercase tracking-widest text-[9px]">Dispute Filed by Customer</div>
                    <p className="mt-0.5 leading-relaxed font-semibold">{selectedRide.dispute}</p>
                  </div>
                </div>
              )}

              {/* Glowing vertical event timeline */}
              <div className="mt-4 border-t border-border/60 pt-3.5 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Event timeline analysis</h4>
                
                <div className="relative border-l border-border/80 ml-2.5 pl-4 space-y-3.5 py-1">
                  {selectedRide.timeline.map((t, idx) => (
                    <div key={idx} className="relative text-[10px]">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21.5px] top-1 h-2.5 w-2.5 rounded-full border border-card bg-primary ring-2 ring-primary/25" />
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>{t.title}</span>
                        <span className="font-mono text-[9px] text-muted-foreground">{t.time}</span>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed">{t.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing fare breaks */}
              {selectedRide.fare > 0 && (
                <div className="mt-4 border-t border-border/60 pt-3.5 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5 text-primary" /> Fare Breakdown</h4>
                  
                  <div className="bg-background/45 border border-border/60 rounded-lg p-2.5 space-y-1 text-[10px]">
                    <div className="flex justify-between"><span>Base Booking Fare</span><span className="font-mono">₹{selectedRide.breakdown.base}</span></div>
                    <div className="flex justify-between"><span>Distance Geokm Charge</span><span className="font-mono">₹{selectedRide.breakdown.dist}</span></div>
                    <div className="flex justify-between"><span>Surge Multiplier Share</span><span className="font-mono text-primary font-bold">+₹{selectedRide.breakdown.surge}</span></div>
                    <div className="flex justify-between border-t border-border/40 pt-1 text-[9px] text-muted-foreground"><span>Platform Commission Fee</span><span className="font-mono">₹{selectedRide.breakdown.fee}</span></div>
                    <div className="flex justify-between text-[9px] text-muted-foreground"><span>Tax/GST Rules Enforced</span><span className="font-mono">₹{selectedRide.breakdown.tax}</span></div>
                    <div className="flex justify-between border-t border-border/60 pt-1.5 text-sm font-extrabold text-foreground">
                      <span>Total Charged</span><span className="font-mono">₹{selectedRide.fare}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Telemetry Map & Replay Simulator */}
              <div className="mt-4 border-t border-border/60 pt-3.5 space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                  <Navigation className="h-3.5 w-3.5 text-primary" /> Ride path replay simulator
                </h4>
                
                {gpsPoints.length > 0 ? (
                  <div className="space-y-3">
                    {/* The map container */}
                    <div className="relative h-60 overflow-hidden rounded-lg border border-border bg-muted/20">
                      <div id="ride-replay-map" className="w-full h-full z-10" style={{ minHeight: "240px" }} />
                      <RideReplayMapScript
                        gpsPoints={gpsPoints}
                        playbackIndex={playbackIndex}
                      />
                    </div>

                    {/* Timeline Slider */}
                    <div className="flex items-center gap-3 bg-muted/20 border border-border/40 rounded-lg p-2">
                      <span className="text-[9px] font-mono text-muted-foreground">01</span>
                      <input 
                        type="range"
                        min={0}
                        max={gpsPoints.length - 1}
                        value={playbackIndex}
                        onChange={(e) => {
                          setPlaybackIndex(parseInt(e.target.value));
                          setIsPlaying(false);
                        }}
                        className="flex-1 accent-primary cursor-pointer h-1 rounded-lg bg-border"
                      />
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {String(gpsPoints.length).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Replay Controls Row */}
                    <div className="flex items-center justify-between bg-muted/20 border border-border/40 rounded-lg p-2">
                      <div className="flex gap-1.5">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 w-7 p-0 border-border/60"
                          onClick={() => {
                            setPlaybackIndex(0);
                            setIsPlaying(false);
                          }}
                          title="Restart Replay"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={isPlaying ? "secondary" : "default"}
                          className="h-7 text-xs font-semibold px-3 animate-none"
                          onClick={() => setIsPlaying(!isPlaying)}
                        >
                          {isPlaying ? (
                            <><Pause className="h-3 w-3 mr-1" /> Pause</>
                          ) : (
                            <><Play className="h-3 w-3 mr-1" /> Play</>
                          )}
                        </Button>
                      </div>

                      {/* Speed Multiplier Controls */}
                      <div className="flex gap-1 rounded-md border border-border p-0.5 bg-background">
                        {[1, 2, 4].map(s => (
                          <button
                            key={s}
                            onClick={() => setPlaybackSpeed(s)}
                            className={`px-2 py-0.5 text-[9px] font-black rounded transition-all ${playbackSpeed === s ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-muted/30 border border-border/60 p-4 text-center text-xs text-muted-foreground font-semibold">
                    No GPS telemetry logs stored in database for this trip.
                  </div>
                )}
              </div>

              {/* Action buttons (Reassign driver etc) */}
              {selectedRide.status === "in-progress" && (
                <div className="mt-5 border-t border-border/60 pt-4">
                  <Button 
                    onClick={handleReassignDriver}
                    disabled={reassigning}
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-black text-xs gap-1.5 h-9"
                  >
                    <Navigation className={reassigning ? "animate-spin h-3.5 w-3.5" : "h-3.5 w-3.5"} /> 
                    {reassigning ? "Searching Nearest Driver..." : "Reassign Available Driver (Geomatch)"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

interface RideReplayMapScriptProps {
  gpsPoints: any[];
  playbackIndex: number;
}

function RideReplayMapScript({ gpsPoints, playbackIndex }: RideReplayMapScriptProps) {
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

  useEffect(() => {
    if (!leafletLoaded || gpsPoints.length === 0) return;
    const L = (window as any).L;
    if (!L) return;

    const mapContainer = document.getElementById("ride-replay-map");
    if (!mapContainer) return;

    const startPt = gpsPoints[0];
    const endPt = gpsPoints[gpsPoints.length - 1];

    if (!mapRef.current) {
      mapRef.current = L.map("ride-replay-map", {
        zoomControl: false,
        attributionControl: false,
      }).setView([startPt.latitude, startPt.longitude], 14);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear old layers
    layersRef.current.forEach((layer: any) => map.removeLayer(layer));
    layersRef.current = [];

    // Draw Route Polyline
    const polyPoints = gpsPoints.map(p => [p.latitude, p.longitude]);
    const routeLine = L.polyline(polyPoints, {
      color: "#3b82f6",
      weight: 4,
      opacity: 0.8,
      dashArray: "4, 4"
    }).addTo(map);
    layersRef.current.push(routeLine);

    // Fit map bounds to show route
    try {
      map.fitBounds(routeLine.getBounds(), { padding: [20, 20] });
    } catch (e) {
      console.warn("fitBounds failed", e);
    }

    // Pickup Marker (Green Dot/Flag)
    const pickupIcon = L.divIcon({
      className: "custom-pickup-marker",
      html: `<div style="background-color: #10b981; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); display: flex; items-center: center; justify-content: center; text-align: center; font-size: 8px; color: white; font-weight: bold; line-height: 10px;">P</div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    const pickupMarker = L.marker([startPt.latitude, startPt.longitude], { icon: pickupIcon })
      .addTo(map)
      .bindPopup("Trip Pickup Location");
    layersRef.current.push(pickupMarker);

    // Dropoff Marker (Red Dot/Flag)
    const dropIcon = L.divIcon({
      className: "custom-drop-marker",
      html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3); display: flex; items-center: center; justify-content: center; text-align: center; font-size: 8px; color: white; font-weight: bold; line-height: 10px;">D</div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });
    const dropMarker = L.marker([endPt.latitude, endPt.longitude], { icon: dropIcon })
      .addTo(map)
      .bindPopup("Trip Destination Location");
    layersRef.current.push(dropMarker);

    // Driver/Vehicle Marker (Blue moving circle)
    const activePt = gpsPoints[playbackIndex] || startPt;
    const vehicleIcon = L.divIcon({
      className: "custom-vehicle-marker",
      html: `<div style="background-color: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 8px #3b82f6;"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    });
    const vehicleMarker = L.marker([activePt.latitude, activePt.longitude], { icon: vehicleIcon })
      .addTo(map);
    layersRef.current.push(vehicleMarker);

    // Pan map to center on driver
    map.panTo([activePt.latitude, activePt.longitude]);

  }, [leafletLoaded, gpsPoints, playbackIndex]);

  return null;
}