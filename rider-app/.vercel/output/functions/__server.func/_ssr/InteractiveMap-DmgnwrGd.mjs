import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useRider } from "./router-CTtxc6Rr.mjs";
const CHENNAI_HUBS = [
  { id: "egmore", name: "Egmore", nameTa: "எழும்பூர்", demand: "medium", surge: "1.2x", floodProne: false },
  { id: "mylapore", name: "Mylapore", nameTa: "மயிலாப்பூர்", demand: "high", surge: "1.5x", floodProne: false },
  { id: "tnagar", name: "T. Nagar", nameTa: "தி. நகர்", demand: "high", surge: "1.8x", floodProne: true },
  { id: "annanagar", name: "Anna Nagar", nameTa: "அண்ணா நகர்", demand: "high", surge: "1.6x", floodProne: false },
  { id: "adyar", name: "Adyar", nameTa: "அடையார்", demand: "medium", surge: "1.3x", floodProne: false },
  { id: "velachery", name: "Velachery", nameTa: "வேளச்சேரி", demand: "high", surge: "2.1x", floodProne: true },
  { id: "chrompet", name: "Chrompet", nameTa: "குரோம்பேட்டை", demand: "low", surge: "1.0x", floodProne: false }
];
const HUB_COORDS = {
  egmore: [13.0827, 80.2707],
  mylapore: [13.0382, 80.2785],
  tnagar: [13.0382, 80.2337],
  annanagar: [13.085, 80.21],
  adyar: [13.0063, 80.252],
  velachery: [12.9915, 80.2185],
  chrompet: [12.9438, 80.1408]
};
const getLatLng = (name) => {
  const nameLower = name.toLowerCase();
  if (nameLower.includes("t.nagar") || nameLower.includes("t. nagar") || nameLower.includes("usman")) return HUB_COORDS.tnagar;
  if (nameLower.includes("anna nagar")) return HUB_COORDS.annanagar;
  if (nameLower.includes("velachery")) return HUB_COORDS.velachery;
  if (nameLower.includes("egmore") || nameLower.includes("central")) return HUB_COORDS.egmore;
  if (nameLower.includes("adyar")) return HUB_COORDS.adyar;
  if (nameLower.includes("mylapore") || nameLower.includes("marina")) return HUB_COORDS.mylapore;
  if (nameLower.includes("chrompet")) return HUB_COORDS.chrompet;
  return HUB_COORDS.tnagar;
};
const InteractiveMap = ({
  showHeatmap = true,
  showTraffic = true,
  showSurge = true,
  height = "h-[320px]"
}) => {
  const mapContainerRef = reactExports.useRef(null);
  const leafletMapRef = reactExports.useRef(null);
  const markerRiderRef = reactExports.useRef(null);
  const markerPickupRef = reactExports.useRef(null);
  const markerDropoffRef = reactExports.useRef(null);
  const routeLineRef = reactExports.useRef(null);
  const routeBorderRef = reactExports.useRef(null);
  const heatCirclesRef = reactExports.useRef([]);
  const surgeMarkersRef = reactExports.useRef([]);
  const floodZonesRef = reactExports.useRef([]);
  const [leafletLoaded, setLeafletLoaded] = reactExports.useState(false);
  const [routeCoords, setRouteCoords] = reactExports.useState([]);
  const { activeRide, rainActive, floodAlert, language, vehicles, activeVehicleId, manualLocation } = useRider();
  const currentVehicle = reactExports.useMemo(() => {
    return vehicles.find((v) => v.id === activeVehicleId) || vehicles[0] || { type: "auto" };
  }, [vehicles, activeVehicleId]);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (typeof window.L === "undefined") {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      setLeafletLoaded(true);
    }
  }, []);
  reactExports.useEffect(() => {
    if (!activeRide.request) {
      setRouteCoords([]);
      return;
    }
    const pickupCoords = getLatLng(activeRide.request.pickup);
    const dropoffCoords = getLatLng(activeRide.request.dropoff);
    const riderStartCoords = manualLocation ? [manualLocation.latitude, manualLocation.longitude] : HUB_COORDS.mylapore;
    let startLat = riderStartCoords[0];
    let startLon = riderStartCoords[1];
    let endLat = pickupCoords[0];
    let endLon = pickupCoords[1];
    if (activeRide.stage !== "pickup") {
      startLat = pickupCoords[0];
      startLon = pickupCoords[1];
      endLat = dropoffCoords[0];
      endLon = dropoffCoords[1];
    }
    let active = true;
    async function fetchOSRMRoute() {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("OSRM failed");
        const data = await res.json();
        if (data.routes && data.routes.length > 0 && active) {
          const coords = data.routes[0].geometry.coordinates.map((pt) => [pt[1], pt[0]]);
          setRouteCoords(coords);
        }
      } catch (err) {
        console.warn("Failed fetching active ride OSRM route:", err);
        if (active) {
          setRouteCoords([[startLat, startLon], [endLat, endLon]]);
        }
      }
    }
    fetchOSRMRoute();
    return () => {
      active = false;
    };
  }, [activeRide.request?.id, activeRide.stage, manualLocation]);
  reactExports.useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;
    const baseLat = manualLocation ? manualLocation.latitude : HUB_COORDS.tnagar[0];
    const baseLon = manualLocation ? manualLocation.longitude : HUB_COORDS.tnagar[1];
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([baseLat, baseLon], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(leafletMapRef.current);
    }
    const map = leafletMapRef.current;
    if (markerRiderRef.current) map.removeLayer(markerRiderRef.current);
    if (markerPickupRef.current) map.removeLayer(markerPickupRef.current);
    if (markerDropoffRef.current) map.removeLayer(markerDropoffRef.current);
    if (routeLineRef.current) map.removeLayer(routeLineRef.current);
    if (routeBorderRef.current) map.removeLayer(routeBorderRef.current);
    heatCirclesRef.current.forEach((c) => map.removeLayer(c));
    heatCirclesRef.current = [];
    surgeMarkersRef.current.forEach((m) => map.removeLayer(m));
    surgeMarkersRef.current = [];
    floodZonesRef.current.forEach((z) => map.removeLayer(z));
    floodZonesRef.current = [];
    if (showHeatmap) {
      CHENNAI_HUBS.forEach((h) => {
        const coords = HUB_COORDS[h.id];
        if (!coords || h.demand === "low") return;
        const color = h.demand === "high" ? "#ef4444" : "#f59e0b";
        const circle = L.circle(coords, {
          color,
          fillColor: color,
          fillOpacity: 0.12,
          radius: h.demand === "high" ? 600 : 400,
          weight: 1.5
        }).addTo(map);
        heatCirclesRef.current.push(circle);
        if (showSurge && h.surge !== "1.0x") {
          const labelIcon = L.divIcon({
            className: "surge-label-marker",
            html: `<div style="background-color: rgba(239, 68, 68, 0.9); color: white; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: bold; box-shadow: 0 1px 4px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); text-align: center; white-space: nowrap;">${h.surge} Surge</div>`,
            iconSize: [42, 14],
            iconAnchor: [21, 26]
          });
          const marker = L.marker([coords[0], coords[1]], { icon: labelIcon }).addTo(map);
          surgeMarkersRef.current.push(marker);
        }
      });
    }
    if (floodAlert) {
      CHENNAI_HUBS.filter((h) => h.floodProne).forEach((h) => {
        const coords = HUB_COORDS[h.id];
        if (!coords) return;
        const floodCircle = L.circle(coords, {
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.15,
          radius: 800,
          weight: 2,
          dashArray: "4, 6"
        }).addTo(map);
        floodZonesRef.current.push(floodCircle);
      });
    }
    let startLat = baseLat;
    let startLon = baseLon;
    let endLat = baseLat;
    let endLon = baseLon;
    let progress = 0;
    if (activeRide.request) {
      const pickupCoords = getLatLng(activeRide.request.pickup);
      const dropoffCoords = getLatLng(activeRide.request.dropoff);
      const riderStartCoords = manualLocation ? [manualLocation.latitude, manualLocation.longitude] : HUB_COORDS.mylapore;
      if (activeRide.stage === "pickup") {
        startLat = riderStartCoords[0];
        startLon = riderStartCoords[1];
        endLat = pickupCoords[0];
        endLon = pickupCoords[1];
        progress = 0.4;
      } else if (activeRide.stage === "otp") {
        startLat = pickupCoords[0];
        startLon = pickupCoords[1];
        endLat = dropoffCoords[0];
        endLon = dropoffCoords[1];
        progress = 0;
      } else {
        startLat = pickupCoords[0];
        startLon = pickupCoords[1];
        endLat = dropoffCoords[0];
        endLon = dropoffCoords[1];
        progress = Math.min(0.1 + activeRide.currentStepIndex * 0.3, 1);
      }
    }
    let riderLat = startLat;
    let riderLon = startLon;
    if (routeCoords.length > 0 && progress > 0) {
      const floatIndex = progress * (routeCoords.length - 1);
      const index = Math.floor(floatIndex);
      const remainder = floatIndex - index;
      const p1 = routeCoords[index];
      const p2 = routeCoords[Math.min(index + 1, routeCoords.length - 1)];
      riderLat = p1[0] + (p2[0] - p1[0]) * remainder;
      riderLon = p1[1] + (p2[1] - p1[1]) * remainder;
    } else {
      riderLat = startLat + (endLat - startLat) * progress;
      riderLon = startLon + (endLon - startLon) * progress;
    }
    if (activeRide.request && routeCoords.length > 0) {
      routeBorderRef.current = L.polyline(routeCoords, {
        color: "#1e3a8a",
        weight: 9,
        opacity: 0.35
      }).addTo(map);
      routeLineRef.current = L.polyline(routeCoords, {
        color: "#2563eb",
        weight: 5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);
      const pickupLatLng = getLatLng(activeRide.request.pickup);
      const pickupIcon = L.divIcon({
        className: "custom-pickup-marker",
        html: `<div style="background-color: #10b981; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">🏠</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
      markerPickupRef.current = L.marker(pickupLatLng, { icon: pickupIcon }).addTo(map).bindPopup("Pickup Location");
      if (activeRide.stage !== "pickup") {
        const dropoffLatLng = getLatLng(activeRide.request.dropoff);
        const dropoffIcon = L.divIcon({
          className: "custom-dropoff-marker",
          html: `<div style="background-color: #ef4444; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">📍</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        markerDropoffRef.current = L.marker(dropoffLatLng, { icon: dropoffIcon }).addTo(map).bindPopup("Destination");
      }
    }
    const vehEmoji = currentVehicle.type === "auto" ? "🛺" : "🏍️";
    const riderIcon = L.divIcon({
      className: "custom-driver-vehicle-marker",
      html: `<div style="background-color: #facc15; width: 32px; height: 32px; border-radius: 50%; border: 3.5px solid black; box-shadow: 0 0 15px #facc15; display: flex; align-items: center; justify-content: center; font-size: 16px; animation: pulse 2s infinite;">${vehEmoji}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    markerRiderRef.current = L.marker([riderLat, riderLon], { icon: riderIcon }).addTo(map);
    try {
      if (activeRide.request && routeCoords.length > 0) {
        map.fitBounds(L.latLngBounds(routeCoords), { padding: [40, 40] });
      } else {
        map.setView([baseLat, baseLon], 13);
      }
    } catch (e) {
      map.setView([baseLat, baseLon], 13);
    }
  }, [leafletLoaded, activeRide, routeCoords, manualLocation, showHeatmap, showSurge, floodAlert, currentVehicle]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `relative w-full ${height} bg-slate-100 rounded-3xl overflow-hidden shadow-inner border border-slate-200`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapContainerRef, className: "absolute inset-0 w-full h-full z-10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-white/10 rounded-2xl p-2.5 backdrop-blur flex justify-between items-center text-white z-20 pointer-events-auto shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-2.5 w-2.5 rounded-full ${rainActive ? "bg-blue-400" : "bg-green-500 animate-pulse"}` }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold tracking-wide uppercase", children: rainActive ? language === "ta" ? "மழை நேரடி சவாரி" : "RAIN INCENTIVES ACTIVE" : language === "ta" ? "நேரடி வரைபடம்" : "LIVE STREET MAP" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        floodAlert && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-lg text-[9px] font-bold", children: [
          "💧 ",
          language === "ta" ? "வெள்ளம்" : "FLOOD"
        ] }),
        activeRide.request && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-lg text-[9px] font-bold", children: language === "ta" ? "பயணத்தில்" : "ON SHIFT" })
      ] })
    ] })
  ] });
};
export {
  InteractiveMap as I
};
