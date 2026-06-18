import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useAppStore } from "./router-BpidCmwR.mjs";
function RealTimeMap({ pickupCoords, dropCoords, progress = 0, isArrived = false, nearbyDrivers = [] }) {
  const mapContainerRef = reactExports.useRef(null);
  const leafletMapRef = reactExports.useRef(null);
  const markerStartRef = reactExports.useRef(null);
  const markerEndRef = reactExports.useRef(null);
  const markerVehicleRef = reactExports.useRef(null);
  const routeLineRef = reactExports.useRef(null);
  const routeBorderRef = reactExports.useRef(null);
  const nearbyMarkersRef = reactExports.useRef([]);
  const safetyLayersRef = reactExports.useRef([]);
  const [leafletLoaded, setLeafletLoaded] = reactExports.useState(false);
  const [routeCoords, setRouteCoords] = reactExports.useState([]);
  const { avoidUnlit, prioritizeHighways, patrolRoutes } = useAppStore();
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
    if (!pickupCoords || !dropCoords) return;
    const startLat = pickupCoords.lat;
    const startLon = pickupCoords.lon;
    const endLat = dropCoords.lat;
    const endLon = dropCoords.lon;
    if (startLat === endLat && startLon === endLon) return;
    let active = true;
    async function fetchRoute() {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("OSRM routing failed");
        const data = await res.json();
        if (data.routes && data.routes.length > 0 && active) {
          const coords = data.routes[0].geometry.coordinates.map((pt) => [pt[1], pt[0]]);
          setRouteCoords(coords);
        }
      } catch (err) {
        console.warn("Failed to fetch OSRM route, falling back to straight line.", err);
        if (active) {
          setRouteCoords([[startLat, startLon], [endLat, endLon]]);
        }
      }
    }
    fetchRoute();
    return () => {
      active = false;
    };
  }, [pickupCoords?.lat, pickupCoords?.lon, dropCoords?.lat, dropCoords?.lon]);
  reactExports.useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;
    const startLat = pickupCoords?.lat || 13.0382;
    const startLon = pickupCoords?.lon || 80.2785;
    const endLat = dropCoords?.lat || 13.0402;
    const endLon = dropCoords?.lon || 80.2337;
    if (!leafletMapRef.current) {
      leafletMapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([startLat, startLon], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(leafletMapRef.current);
    }
    const map = leafletMapRef.current;
    if (markerStartRef.current) map.removeLayer(markerStartRef.current);
    if (markerEndRef.current) map.removeLayer(markerEndRef.current);
    if (markerVehicleRef.current) map.removeLayer(markerVehicleRef.current);
    if (routeLineRef.current) map.removeLayer(routeLineRef.current);
    if (routeBorderRef.current) map.removeLayer(routeBorderRef.current);
    nearbyMarkersRef.current.forEach((m) => map.removeLayer(m));
    nearbyMarkersRef.current = [];
    safetyLayersRef.current.forEach((l) => map.removeLayer(l));
    safetyLayersRef.current = [];
    const startIcon = L.divIcon({
      className: "custom-start-marker",
      html: `<div style="background-color: #10b981; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">🏠</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    markerStartRef.current = L.marker([startLat, startLon], { icon: startIcon }).addTo(map).bindPopup("Pickup Location");
    const endIcon = L.divIcon({
      className: "custom-end-marker",
      html: `<div style="background-color: #ef4444; width: 26px; height: 26px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(239, 68, 68, 0.6); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">📍</div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13]
    });
    markerEndRef.current = L.marker([endLat, endLon], { icon: endIcon }).addTo(map).bindPopup("Drop Destination");
    if (nearbyDrivers && nearbyDrivers.length > 0) {
      nearbyDrivers.forEach((d) => {
        const lat = d.current_latitude || d.lat;
        const lon = d.current_longitude || d.lng;
        if (lat && lon) {
          const vehicleType = d.vehicles?.[0]?.vehicle_type || d.vehicle_type || "bike";
          const vehicleEmoji = vehicleType === "auto" ? "🛺" : "🏍️";
          const riderIcon = L.divIcon({
            className: "custom-nearby-marker",
            html: `<div style="background-color: #3b82f6; width: 28px; height: 28px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.6); display: flex; align-items: center; justify-content: center; font-size: 14px;">${vehicleEmoji}</div>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14]
          });
          const marker = L.marker([lat, lon], { icon: riderIcon }).addTo(map).bindPopup(`<b>${d.name}</b><br/>${d.distanceStr || "Nearby"} away`);
          nearbyMarkersRef.current.push(marker);
        }
      });
    }
    if (patrolRoutes) {
      const patrolCheckpoints = [
        { lat: 13.0415, lon: 80.275, name: "👮 Marina Beach Patrol Point" },
        { lat: 13.042, lon: 80.245, name: "👮 T. Nagar Police Checkpoint" },
        { lat: 13.03, lon: 80.258, name: "👮 Alwarpet Circle Patrol Unit" }
      ];
      patrolCheckpoints.forEach((cp) => {
        const patrolIcon = L.divIcon({
          className: "custom-patrol-marker",
          html: `<div style="background-color: #3b82f6; width: 26px; height: 26px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px rgba(59, 130, 246, 0.9); display: flex; align-items: center; justify-content: center; font-size: 14px; animation: pulse 1.5s infinite;">🚓</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13]
        });
        const marker = L.marker([cp.lat, cp.lon], { icon: patrolIcon }).addTo(map).bindPopup(`<b>${cp.name}</b><br/>Active police presence zone.`);
        safetyLayersRef.current.push(marker);
        const circle = L.circle([cp.lat, cp.lon], {
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
          radius: 350,
          weight: 1
        }).addTo(map);
        safetyLayersRef.current.push(circle);
      });
    }
    if (avoidUnlit) {
      const unlitPoints = [
        { lat: 13.035, lon: 80.262, name: "⚠️ Mylapore Back Alley (Unlit)" },
        { lat: 13.045, lon: 80.25, name: "⚠️ Giri Lane (Low streetlights)" }
      ];
      unlitPoints.forEach((up) => {
        const warningIcon = L.divIcon({
          className: "custom-warning-marker",
          html: `<div style="background-color: #ef4444; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(239, 68, 68, 0.7); display: flex; align-items: center; justify-content: center; font-size: 11px;">🚫</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        });
        const marker = L.marker([up.lat, up.lon], { icon: warningIcon }).addTo(map).bindPopup(`<b>${up.name}</b><br/>Unlit street avoided by safe route.`);
        safetyLayersRef.current.push(marker);
      });
    }
    if (prioritizeHighways) {
      const highwayPoints = [
        { lat: 13.0385, lon: 80.25, name: "🛣️ Anna Salai High-Activity Highway" }
      ];
      highwayPoints.forEach((hp) => {
        const highwayIcon = L.divIcon({
          className: "custom-highway-marker",
          html: `<div style="background-color: #f97316; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px rgba(249, 115, 22, 0.7); display: flex; align-items: center; justify-content: center; font-size: 12px;">🛣️</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        const marker = L.marker([hp.lat, hp.lon], { icon: highwayIcon }).addTo(map).bindPopup(`<b>${hp.name}</b><br/>High-activity arterial route prioritized.`);
        safetyLayersRef.current.push(marker);
      });
    }
    let currentLat = startLat;
    let currentLon = startLon;
    if (routeCoords.length > 0 && progress > 0) {
      const floatIndex = progress / 100 * (routeCoords.length - 1);
      const index = Math.floor(floatIndex);
      const remainder = floatIndex - index;
      const p1 = routeCoords[index];
      const p2 = routeCoords[Math.min(index + 1, routeCoords.length - 1)];
      currentLat = p1[0] + (p2[0] - p1[0]) * remainder;
      currentLon = p1[1] + (p2[1] - p1[1]) * remainder;
    } else {
      currentLat = startLat + (endLat - startLat) * (progress / 100);
      currentLon = startLon + (endLon - startLon) * (progress / 100);
    }
    if (progress > 0) {
      const activeVehEmoji = (nearbyDrivers?.[0]?.vehicles?.[0]?.vehicle_type || "bike") === "auto" ? "🛺" : "🏍️";
      const vehicleIcon = L.divIcon({
        className: "custom-vehicle-marker",
        html: `<div style="background-color: #facc15; width: 32px; height: 32px; border-radius: 50%; border: 3px solid #000; box-shadow: 0 0 15px #facc15; display: flex; align-items: center; justify-content: center; font-size: 16px; animation: pulse 2s infinite;">${activeVehEmoji}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      markerVehicleRef.current = L.marker([currentLat, currentLon], { icon: vehicleIcon }).addTo(map);
    }
    const hasValidDrop = dropCoords && (dropCoords.lat !== startLat || dropCoords.lon !== startLon);
    if (hasValidDrop && routeCoords.length > 0) {
      let mainPathColor = "#2563eb";
      let borderPathColor = "#1e3a8a";
      if (avoidUnlit && prioritizeHighways) {
        mainPathColor = "#10b981";
        borderPathColor = "#064e3b";
      } else if (avoidUnlit) {
        mainPathColor = "#059669";
        borderPathColor = "#064e3b";
      } else if (prioritizeHighways) {
        mainPathColor = "#f97316";
        borderPathColor = "#7c2d12";
      }
      routeBorderRef.current = L.polyline(routeCoords, {
        color: borderPathColor,
        weight: 9,
        opacity: 0.4
      }).addTo(map);
      routeLineRef.current = L.polyline(routeCoords, {
        color: mainPathColor,
        weight: 5,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round"
      }).addTo(map);
    }
    try {
      if (hasValidDrop && routeCoords.length > 0) {
        const bounds = L.latLngBounds(routeCoords);
        map.fitBounds(bounds, { padding: [40, 40] });
      } else {
        map.setView([startLat, startLon], 14);
      }
    } catch (e) {
      map.setView([startLat, startLon], 14);
    }
  }, [leafletLoaded, pickupCoords, dropCoords, progress, nearbyDrivers, routeCoords, avoidUnlit, prioritizeHighways, patrolRoutes]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full relative", style: { minHeight: "250px" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: mapContainerRef, className: "absolute inset-0 w-full h-full z-10" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-4 right-4 z-20 flex flex-col gap-1 text-[9px] font-black uppercase text-white pointer-events-none", children: [
      avoidUnlit && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-emerald-600/90 backdrop-blur-xs px-2 py-1 flex items-center gap-1 shadow", children: "💡 Well-Lit Route Active" }),
      prioritizeHighways && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-orange-600/90 backdrop-blur-xs px-2 py-1 flex items-center gap-1 shadow", children: "🛣️ Highway Priority Active" }),
      patrolRoutes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md bg-blue-600/90 backdrop-blur-xs px-2 py-1 flex items-center gap-1 shadow animate-pulse", children: "👮 Police Patrol Overlay" })
    ] })
  ] });
}
export {
  RealTimeMap as R
};
