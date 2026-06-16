// Detect if we are running in a native mobile environment (Capacitor) or production
const getBaseUrl = () => {
  // If Vite compiles the build for production (e.g. Vercel deployment or production APK)
  const isProd = import.meta.env.PROD;
  if (isProd) {
    return "https://rideuu-backend.onrender.com/api";
  }

  if (typeof window !== "undefined") {
    const isNative = (window as any).Capacitor || window.location.href.includes("android-asset");
    if (isNative) {
      // 10.0.2.2 is the special host loopback address for the Android emulator.
      // Replace with your local machine's LAN IP (e.g. "http://192.168.1.50:8000/api") if testing on a physical phone.
      return "http://10.0.2.2:8000/api";
    }
  }
  return "http://localhost:8000/api";
};

export const BASE_URL = getBaseUrl();

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("namma_token") : null;
  
  const headers: Record<string, string> = {
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

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
  getUserByPhone: (phone: string, role = "customer", name = "", vehicleType = "") => 
    fetchAPI(`/users/by_phone/?phone=${encodeURIComponent(phone)}&role=${role}&name=${encodeURIComponent(name)}&vehicle_type=${encodeURIComponent(vehicleType)}`),
  getUserByEmail: (email: string, role = "customer", name = "", vehicleType = "", phone = "") => 
    fetchAPI(`/users/by_email/?email=${encodeURIComponent(email)}&role=${role}&name=${encodeURIComponent(name)}&vehicle_type=${encodeURIComponent(vehicleType)}&phone=${encodeURIComponent(phone)}`),
  updateUser: (id: number | string, data: any) => 
    fetchAPI(`/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  updateKYCDoc: (id: number | string, data: any) => 
    fetchAPI(`/kyc/${id}/`, { method: "PATCH", body: data instanceof FormData ? data : JSON.stringify(data) }),
  createKYCDoc: (data: any) => 
    fetchAPI("/kyc/", { method: "POST", body: data instanceof FormData ? data : JSON.stringify(data) }),
  createVehicle: (data: any) =>
    fetchAPI("/vehicles/", { method: "POST", body: JSON.stringify(data) }),
  
  getRides: () => fetchAPI("/rides/"),
  getRide: (id: number | string) => fetchAPI(`/rides/${id}/`),
  createRide: (data: any) => 
    fetchAPI("/rides/", { method: "POST", body: JSON.stringify(data) }),
  updateRide: (id: number | string, data: any) => 
    fetchAPI(`/rides/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  getPendingRides: () => fetchAPI("/rides/pending_requests/"),
  rejectRide: (id: number | string) => 
    fetchAPI(`/rides/${id}/reject_ride/`, { method: "POST" }),
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
  sendOtp: (email: string, role = "driver", action = "login") => 
    fetchAPI("/auth/send-otp/", { method: "POST", body: JSON.stringify({ email, role, action }) }),
  verifyOtp: (email: string, otp: string, role = "driver", name = "", sub_role = "", phone = "", address = "", vehicle_type = "auto", vehicle_model = "Bajaj RE Auto", vehicle_plate = "TN 22 BZ 4421", vehicle_color = "Yellow", vehicle_year = "2026", gender = "male") => 
    fetchAPI("/auth/verify-otp/", { method: "POST", body: JSON.stringify({ email, otp, role, name, sub_role, phone, address, vehicle_type, vehicle_model, vehicle_plate, vehicle_color, vehicle_year, gender }) }),
  reverseGeocode: (lat: number, lon: number) => 
    fetchAPI(`/location/reverse/?lat=${lat}&lon=${lon}`),
  createSOSAlert: (data: any) =>
    fetchAPI("/sos_alerts/", { method: "POST", body: JSON.stringify(data) }),
  resolveSOSAlert: (id: string | number) =>
    fetchAPI(`/sos_alerts/${id}/resolve/`, { method: "POST" }),
  withdraw: async (amount: number, fee: number, wallet_type: string = "wallet") => {
    const token = typeof window !== "undefined" ? localStorage.getItem("namma_token") : null;
    const res = await fetch(`${BASE_URL}/users/withdraw/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { "Authorization": `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ amount, fee, wallet_type })
    });
    return await res.json();
  },
  getLeaderboard: () =>
    fetchAPI("/users/leaderboard/"),
  claimReferral: (code: string) =>
    fetchAPI("/users/claim_referral/", { method: "POST", body: JSON.stringify({ code }) }),
  getReferrals: () =>
    fetchAPI("/users/referrals/"),
};
