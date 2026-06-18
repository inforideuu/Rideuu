// Detect if we are running in production
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return "https://rideuu-backend.onrender.com/api";
    }
  }
  return "http://localhost:8000/api";
};

export const BASE_URL = getBaseUrl();

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
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
  updateUser: (id: number | string, data: any) => 
    fetchAPI(`/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  
  getRides: () => fetchAPI("/rides/"),
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
  getSurgeZones: () => fetchAPI("/surge-zones/"),
  getSurgeZone: (id: string | number) => fetchAPI(`/surge-zones/${id}/`),
  createSurgeZone: (data: any) => fetchAPI("/surge-zones/", { method: "POST", body: JSON.stringify(data) }),
  updateSurgeZone: (id: string | number, data: any) => fetchAPI(`/surge-zones/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSurgeZone: (id: string | number) => fetchAPI(`/surge-zones/${id}/`, { method: "DELETE" }),

  getSurgeSchedules: () => fetchAPI("/surge-schedules/"),
  getSurgeSchedule: (id: string | number) => fetchAPI(`/surge-schedules/${id}/`),
  createSurgeSchedule: (data: any) => fetchAPI("/surge-schedules/", { method: "POST", body: JSON.stringify(data) }),
  updateSurgeSchedule: (id: string | number, data: any) => fetchAPI(`/surge-schedules/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSurgeSchedule: (id: string | number) => fetchAPI(`/surge-schedules/${id}/`, { method: "DELETE" }),
  loginEmail: (email: string, password: string) => 
    fetchAPI("/auth/login-email/", { method: "POST", body: JSON.stringify({ email, password }) }),
  sendOtp: (phone: string) => 
    fetchAPI("/auth/send-otp/", { method: "POST", body: JSON.stringify({ phone }) }),
  verifyOtp: (phone: string, otp: string, role = "admin", name = "", sub_role = "") => 
    fetchAPI("/auth/verify-otp/", { method: "POST", body: JSON.stringify({ phone, otp, role, name, sub_role }) }),
  getSOSAlerts: () => fetchAPI("/sos_alerts/"),
  resolveSOSAlert: (id: string | number) =>
    fetchAPI(`/sos_alerts/${id}/resolve/`, { method: "POST" }),
  getCoupons: () => fetchAPI("/coupons/"),
  createCoupon: (data: any) =>
    fetchAPI("/coupons/", { method: "POST", body: JSON.stringify(data) }),
  getCampaigns: () => fetchAPI("/campaigns/"),
  createCampaign: (data: any) =>
    fetchAPI("/campaigns/", { method: "POST", body: JSON.stringify(data) }),
  refundTicket: (id: string | number, amount: number) =>
    fetchAPI(`/tickets/${id}/refund/`, { method: "POST", body: JSON.stringify({ amount }) }),
  searchLocations: (query: string) => 
    fetchAPI(`/location/search/?q=${encodeURIComponent(query)}`),
};

