// Detect if we are running in a native mobile environment (Capacitor) or production
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    // If running on Vercel deployment
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.startsWith("10.0.2.")) {
      return "https://rideuu-backend.onrender.com/api";
    }

    const isNative = (window as any).Capacitor || window.location.href.includes("android-asset");
    if (isNative) {
      // 10.0.2.2 is the special host loopback address for the Android emulator.
      // Replace with your local machine's LAN IP (e.g. "http://192.168.1.50:8000/api") if testing on a physical phone.
      return "http://10.0.2.2:8000/api";
    }
  }

  // Fallback for SSR server-side on Vercel
  if (typeof process !== "undefined" && process.env.NODE_ENV === "production") {
    return "https://rideuu-backend.onrender.com/api";
  }

  return "http://localhost:8000/api";
};

export const BASE_URL = getBaseUrl();

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  let token = null;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("namma_ride_store");
      if (saved) {
        const parsed = JSON.parse(saved);
        token = parsed.token || null;
      }
    } catch (e) {
      console.warn("Failed to parse token from store", e);
    }
  }
  if (!token) {
    token = "jwt_mock_token_phone_2_1718000000";
  }
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };
  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 204) return null;
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API Error ${res.status}: ${errText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`Failed fetching ${url}, using local fallback.`, error);
    return null;
  }
}

export const api = {
  getUsers: () => fetchAPI("/users/"),
  getUserByPhone: (phone: string, role = "customer", name = "") => 
    fetchAPI(`/users/by_phone/?phone=${encodeURIComponent(phone)}&role=${role}&name=${encodeURIComponent(name)}`),
  getUserByEmail: (email: string, role = "customer", name = "", phone = "") => 
    fetchAPI(`/users/by_email/?email=${encodeURIComponent(email)}&role=${role}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`),
  updateUser: (id: number | string, data: any, token?: string) => 
    fetchAPI(`/users/${id}/`, { 
      method: "PATCH", 
      body: JSON.stringify(data), 
      headers: token ? { Authorization: `Bearer ${token}` } : undefined 
    }),
  
  getRides: (token: string) => 
    fetchAPI("/rides/", { headers: { Authorization: `Bearer ${token}` } }),
  getRide: (id: number | string) => fetchAPI(`/rides/${id}/`),
  createRide: (data: any) => 
    fetchAPI("/rides/", { method: "POST", body: JSON.stringify(data) }),
  updateRide: (id: number | string, data: any) => 
    fetchAPI(`/rides/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  getPendingRides: () => fetchAPI("/rides/pending_requests/"),
  getActiveRide: (phone: string, role: string) => 
    fetchAPI(`/rides/active_ride/?phone=${encodeURIComponent(phone)}&role=${role}`),
 
  getTransactions: () => fetchAPI("/transactions/"),
  getUserTransactions: (phone: string) => 
    fetchAPI(`/transactions/user_transactions/?phone=${encodeURIComponent(phone)}`),
  createTransaction: (data: any) => 
    fetchAPI("/transactions/", { method: "POST", body: JSON.stringify(data) }),
 
  getTickets: () => fetchAPI("/tickets/"),
  getUserTickets: (phone: string) => 
    fetchAPI(`/tickets/user_tickets/?phone=${encodeURIComponent(phone)}`),
  createTicket: (data: any) => 
    fetchAPI("/tickets/", { method: "POST", body: JSON.stringify(data) }),
  updateTicket: (id: number | string, data: any) => 
    fetchAPI(`/tickets/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
 
  getSetting: (key: string) => fetchAPI(`/settings/${key}/`),
  setSetting: (key: string, value: any) => 
    fetchAPI("/settings/set_val/", { method: "POST", body: JSON.stringify({ key, value }) }),
  
  searchLocations: (query: string) => 
    fetchAPI(`/location/search/?q=${encodeURIComponent(query)}`),
  getFareEstimate: (pickup: string, drop: string, pickupLat?: number, pickupLon?: number, dropLat?: number, dropLon?: number, couponCode?: string) => 
    fetchAPI("/rides/estimate/", { method: "POST", body: JSON.stringify({ 
      pickup, 
      drop, 
      pickup_lat: pickupLat, 
      pickup_lon: pickupLon, 
      drop_lat: dropLat, 
      drop_lon: dropLon, 
      coupon_code: couponCode 
    }) }),
  validateCoupon: (code: string) => 
    fetchAPI("/coupons/validate/", { method: "POST", body: JSON.stringify({ code }) }),
  getCoupons: () => 
    fetchAPI("/coupons/"),
  reverseGeocode: (lat: number, lon: number) => 
    fetchAPI(`/location/reverse/?lat=${lat}&lon=${lon}`),
  getPlaceDetails: (placeId: string) => 
    fetchAPI(`/location/details/?place_id=${encodeURIComponent(placeId)}`),
  sendOtp: (email: string) => 
    fetchAPI("/auth/send-otp/", { method: "POST", body: JSON.stringify({ email }) }),
  verifyOtp: (email: string, otp: string, role = "customer", name = "", phone?: string) => 
    fetchAPI("/auth/verify-otp/", { method: "POST", body: JSON.stringify({ email, otp, role, name, phone }) }),
  loginEmail: (email: string, password: string) => 
    fetchAPI("/auth/login-email/", { method: "POST", body: JSON.stringify({ email, password }) }),
  loginPassword: (phone: string, email: string, password: string) => 
    fetchAPI("/auth/login-password/", { method: "POST", body: JSON.stringify({ phone, email, password }) }),
  googleAuth: (email: string, name: string, googleId: string) => 
    fetchAPI("/auth/google/", { method: "POST", body: JSON.stringify({ email, name, google_id: googleId }) }),
  appleAuth: (email: string, name: string, appleId: string) => 
    fetchAPI("/auth/apple/", { method: "POST", body: JSON.stringify({ email, name, apple_id: appleId }) }),
  getSessions: (token: string) => 
    fetchAPI("/auth/sessions/", { headers: { Authorization: `Bearer ${token}` } }),
  revokeSession: (id: string | number, token: string) => 
    fetchAPI(`/auth/sessions/${id}/revoke/`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
  getMe: (token: string) => 
    fetchAPI("/users/me/", { headers: { Authorization: `Bearer ${token}` } }),
  getIsolatedTransactions: (token: string) => 
    fetchAPI("/transactions/", { headers: { Authorization: `Bearer ${token}` } }),
  createSOSAlert: (data: any) =>
    fetchAPI("/sos_alerts/", { method: "POST", body: JSON.stringify(data) }),
  addSOSSnapshot: (id: string | number, data: any) =>
    fetchAPI(`/sos_alerts/${id}/add_snapshot/`, { method: "POST", body: JSON.stringify(data) }),
  resolveSOSAlert: (id: string | number) =>
    fetchAPI(`/sos_alerts/${id}/resolve/`, { method: "POST" }),
  claimReferral: (code: string) =>
    fetchAPI("/users/claim_referral/", { method: "POST", body: JSON.stringify({ code }) }),
  getReferrals: () =>
    fetchAPI("/users/referrals/"),
};
