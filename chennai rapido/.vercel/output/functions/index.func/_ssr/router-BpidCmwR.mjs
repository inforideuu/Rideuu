import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { b as createRouter, a as createRootRouteWithContext, e as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, c as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { G as redirect } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1" && !hostname.startsWith("10.0.2.")) {
      return "https://rideuu-backend.onrender.com/api";
    }
    const isNative = window.Capacitor || window.location.href.includes("android-asset");
    if (isNative) {
      return "http://10.0.2.2:8000/api";
    }
  }
  if (typeof process !== "undefined" && true) {
    return "https://rideuu-backend.onrender.com/api";
  }
  return "http://localhost:8000/api";
};
const BASE_URL = getBaseUrl();
async function fetchAPI(endpoint, options = {}) {
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
    ...token ? { "Authorization": `Bearer ${token}` } : {},
    ...options.headers || {}
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
const api = {
  getUsers: () => fetchAPI("/users/"),
  getUserByPhone: (phone, role = "customer", name = "") => fetchAPI(`/users/by_phone/?phone=${encodeURIComponent(phone)}&role=${role}&name=${encodeURIComponent(name)}`),
  getUserByEmail: (email, role = "customer", name = "", phone = "") => fetchAPI(`/users/by_email/?email=${encodeURIComponent(email)}&role=${role}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`),
  updateUser: (id, data, token) => fetchAPI(`/users/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: token ? { Authorization: `Bearer ${token}` } : void 0
  }),
  getRides: (token) => fetchAPI("/rides/", { headers: { Authorization: `Bearer ${token}` } }),
  getRide: (id) => fetchAPI(`/rides/${id}/`),
  createRide: (data) => fetchAPI("/rides/", { method: "POST", body: JSON.stringify(data) }),
  updateRide: (id, data) => fetchAPI(`/rides/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  getPendingRides: () => fetchAPI("/rides/pending_requests/"),
  getActiveRide: (phone, role) => fetchAPI(`/rides/active_ride/?phone=${encodeURIComponent(phone)}&role=${role}`),
  getTransactions: () => fetchAPI("/transactions/"),
  getUserTransactions: (phone) => fetchAPI(`/transactions/user_transactions/?phone=${encodeURIComponent(phone)}`),
  createTransaction: (data) => fetchAPI("/transactions/", { method: "POST", body: JSON.stringify(data) }),
  getTickets: () => fetchAPI("/tickets/"),
  getUserTickets: (phone) => fetchAPI(`/tickets/user_tickets/?phone=${encodeURIComponent(phone)}`),
  createTicket: (data) => fetchAPI("/tickets/", { method: "POST", body: JSON.stringify(data) }),
  updateTicket: (id, data) => fetchAPI(`/tickets/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  getSetting: (key) => fetchAPI(`/settings/${key}/`),
  setSetting: (key, value) => fetchAPI("/settings/set_val/", { method: "POST", body: JSON.stringify({ key, value }) }),
  searchLocations: (query) => fetchAPI(`/location/search/?q=${encodeURIComponent(query)}`),
  getFareEstimate: (pickup, drop, pickupLat, pickupLon, dropLat, dropLon, couponCode) => fetchAPI("/rides/estimate/", { method: "POST", body: JSON.stringify({
    pickup,
    drop,
    pickup_lat: pickupLat,
    pickup_lon: pickupLon,
    drop_lat: dropLat,
    drop_lon: dropLon,
    coupon_code: couponCode
  }) }),
  validateCoupon: (code) => fetchAPI("/coupons/validate/", { method: "POST", body: JSON.stringify({ code }) }),
  getCoupons: () => fetchAPI("/coupons/"),
  reverseGeocode: (lat, lon) => fetchAPI(`/location/reverse/?lat=${lat}&lon=${lon}`),
  getPlaceDetails: (placeId) => fetchAPI(`/location/details/?place_id=${encodeURIComponent(placeId)}`),
  sendOtp: (email) => fetchAPI("/auth/send-otp/", { method: "POST", body: JSON.stringify({ email }) }),
  verifyOtp: (email, otp, role = "customer", name = "", phone) => fetchAPI("/auth/verify-otp/", { method: "POST", body: JSON.stringify({ email, otp, role, name, phone }) }),
  loginEmail: (email, password) => fetchAPI("/auth/login-email/", { method: "POST", body: JSON.stringify({ email, password }) }),
  loginPassword: (phone, email, password) => fetchAPI("/auth/login-password/", { method: "POST", body: JSON.stringify({ phone, email, password }) }),
  googleAuth: (email, name, googleId) => fetchAPI("/auth/google/", { method: "POST", body: JSON.stringify({ email, name, google_id: googleId }) }),
  appleAuth: (email, name, appleId) => fetchAPI("/auth/apple/", { method: "POST", body: JSON.stringify({ email, name, apple_id: appleId }) }),
  getSessions: (token) => fetchAPI("/auth/sessions/", { headers: { Authorization: `Bearer ${token}` } }),
  revokeSession: (id, token) => fetchAPI(`/auth/sessions/${id}/revoke/`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }),
  getMe: (token) => fetchAPI("/users/me/", { headers: { Authorization: `Bearer ${token}` } }),
  getIsolatedTransactions: (token) => fetchAPI("/transactions/", { headers: { Authorization: `Bearer ${token}` } }),
  createSOSAlert: (data) => fetchAPI("/sos_alerts/", { method: "POST", body: JSON.stringify(data) }),
  addSOSSnapshot: (id, data) => fetchAPI(`/sos_alerts/${id}/add_snapshot/`, { method: "POST", body: JSON.stringify(data) }),
  resolveSOSAlert: (id) => fetchAPI(`/sos_alerts/${id}/resolve/`, { method: "POST" }),
  claimReferral: (code) => fetchAPI("/users/claim_referral/", { method: "POST", body: JSON.stringify({ code }) }),
  getReferrals: () => fetchAPI("/users/referrals/")
};
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}
const INITIAL_STATE = {
  language: "en",
  theme: "light",
  // Defaulting to the beautiful white theme
  womenSafetyMode: false,
  avoidUnlit: true,
  prioritizeHighways: true,
  patrolRoutes: false,
  isPwaInstalled: false,
  token: null,
  // Profile info
  profile: {
    name: "",
    phone: "",
    email: "",
    avatar: "",
    gender: "male",
    ridePreference: "silent",
    // silent, quick, regular
    notificationsEnabled: true,
    privacyLevel: "standard",
    sosPin: "1234"
  },
  savedAddresses: [
    { id: "home", label: "Home", tamilLabel: "வீடு", address: "Marina Beach Road, Mylapore, Chennai", icon: "home" },
    { id: "work", label: "Work", tamilLabel: "அலுவலகம்", address: "Tidel Park, Rajiv Gandhi Salai, Taramani, Chennai", icon: "briefcase" }
  ],
  trustedContacts: [],
  deviceSessions: [],
  wallet: {
    balance: 0,
    rewardPoints: 0,
    rideStreak: 0,
    hasSubscribedPass: false,
    passType: ""
  },
  transactions: [],
  notifications: [],
  // Chat conversation during live trip
  chatMessages: [],
  // Active ride state machine
  ride: {
    id: null,
    step: "idle",
    pickup: "Marina Lighthouse",
    drop: "T. Nagar · Pondy Bazaar",
    pickupCoords: { lat: 13.0382, lon: 80.2785 },
    dropCoords: { lat: 13.0402, lon: 80.2337 },
    waypoints: [],
    vehicle: null,
    basePrice: 82,
    negotiatedPrice: 82,
    surgeApplied: false,
    nightApplied: false,
    couponCode: "",
    discount: 0,
    scheduledTime: null,
    driver: null,
    otp: "4821",
    progress: 0,
    speed: 0,
    milestoneIndex: 0,
    isAudioRecording: false,
    isSosTriggered: false,
    sos_id: null,
    complaintRaised: false,
    complaintText: "",
    refundRequested: false,
    completion_step: -1,
    distance: null
  }
};
let globalState = (() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("namma_ride_store");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_STATE,
          ...parsed,
          profile: parsed.profile ? { ...INITIAL_STATE.profile, ...parsed.profile } : INITIAL_STATE.profile,
          wallet: parsed.wallet ? { ...INITIAL_STATE.wallet, ...parsed.wallet } : INITIAL_STATE.wallet,
          savedAddresses: parsed.savedAddresses || INITIAL_STATE.savedAddresses,
          trustedContacts: parsed.trustedContacts || INITIAL_STATE.trustedContacts,
          deviceSessions: parsed.deviceSessions || INITIAL_STATE.deviceSessions,
          transactions: parsed.transactions || INITIAL_STATE.transactions,
          notifications: parsed.notifications || INITIAL_STATE.notifications,
          chatMessages: parsed.chatMessages || INITIAL_STATE.chatMessages,
          ride: parsed.ride ? { ...INITIAL_STATE.ride, ...parsed.ride } : INITIAL_STATE.ride
        };
      } catch (e) {
        console.error("Failed to parse store state", e);
      }
    }
  }
  return INITIAL_STATE;
})();
const listeners = /* @__PURE__ */ new Set();
function emit() {
  if (typeof window !== "undefined") {
    localStorage.setItem("namma_ride_store", JSON.stringify(globalState));
  }
  listeners.forEach((l) => l(globalState));
}
const store = {
  getState() {
    return globalState;
  },
  async loadUserData() {
    const token = globalState.token;
    if (!token) return;
    try {
      const me = await api.getMe(token);
      if (me) {
        store.update((s) => {
          s.profile.name = me.name;
          s.profile.phone = me.phone;
          s.profile.email = me.email || "";
          s.profile.gender = me.gender || "male";
          s.wallet.balance = me.wallet_balance;
        });
      }
      const txs = await api.getIsolatedTransactions(token);
      if (txs) {
        store.update((s) => {
          s.transactions = txs.map((t) => ({
            id: String(t.id),
            title: t.title,
            tamilTitle: t.title,
            date: t.date || "Today",
            amount: typeof t.amount === "number" ? t.amount : parseFloat(String(t.amount).replace(/[^\d.]/g, "")) || 0,
            type: t.positive ? "in" : "out"
          }));
        });
      }
      const sessions = await api.getSessions(token);
      if (sessions) {
        store.update((s) => {
          s.deviceSessions = sessions.map((sess) => ({
            id: String(sess.id),
            device: sess.device,
            location: sess.location,
            lastActive: sess.is_current ? "Active now" : "Offline",
            isCurrent: sess.is_current
          }));
        });
      }
    } catch (err) {
      console.warn("Failed loading user data", err);
    }
  },
  logout() {
    store.update((s) => {
      s.token = null;
      s.profile = {
        name: "",
        phone: "",
        email: "",
        avatar: "",
        gender: "male",
        ridePreference: "silent",
        notificationsEnabled: true,
        privacyLevel: "standard",
        sosPin: "1234"
      };
      s.savedAddresses = [];
      s.trustedContacts = [];
      s.deviceSessions = [];
      s.wallet = {
        balance: 0,
        rewardPoints: 0,
        rideStreak: 0,
        hasSubscribedPass: false,
        passType: ""
      };
      s.transactions = [];
      s.notifications = [];
      s.chatMessages = [];
      s.ride = {
        id: null,
        step: "idle",
        pickup: "",
        drop: "",
        pickupCoords: null,
        dropCoords: null,
        waypoints: [],
        vehicle: null,
        basePrice: 0,
        negotiatedPrice: 0,
        surgeApplied: false,
        nightApplied: false,
        couponCode: "",
        discount: 0,
        scheduledTime: null,
        driver: null,
        otp: "",
        progress: 0,
        speed: 0,
        milestoneIndex: 0,
        isAudioRecording: false,
        isSosTriggered: false,
        complaintRaised: false,
        complaintText: "",
        refundRequested: false
      };
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("namma_ride_store");
    }
  },
  update(updater) {
    updater(globalState);
    emit();
  },
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  // State actions helper
  setLanguage(lang) {
    store.update((s) => {
      s.language = lang;
    });
  },
  setTheme(theme) {
    store.update((s) => {
      s.theme = theme;
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
      }
    });
  },
  setWomenSafetyMode(active) {
    if (active) {
      const state2 = store.getState();
      const userGender = state2.profile.gender || "male";
      if (userGender.toLowerCase() !== "female") {
        alert("Women Safety Mode can only be activated for female gender profiles.");
        return;
      }
    }
    store.update((s) => {
      s.womenSafetyMode = active;
      if (active) {
        s.profile.ridePreference = "female-only";
      } else {
        s.profile.ridePreference = "silent";
      }
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        if (active) root.classList.add("safety-mode");
        else root.classList.remove("safety-mode");
      }
    });
    const state = store.getState();
    const token = state.token;
    if (token && state.profile.email) {
      api.getUserByEmail(state.profile.email, "customer", state.profile.name, state.profile.phone).then((user) => {
        if (user) {
          api.updateUser(user.id, { women_priority_match: active }, token);
        }
      });
    }
  },
  setPwaInstalled(val) {
    store.update((s) => {
      s.isPwaInstalled = val;
    });
  },
  setAvoidUnlit(val) {
    store.update((s) => {
      s.avoidUnlit = val;
    });
  },
  setPrioritizeHighways(val) {
    store.update((s) => {
      s.prioritizeHighways = val;
    });
  },
  setPatrolRoutes(val) {
    store.update((s) => {
      s.patrolRoutes = val;
    });
  },
  updateProfile(fields) {
    store.update((s) => {
      s.profile = { ...s.profile, ...fields };
    });
  },
  addAddress(address) {
    store.update((s) => {
      s.savedAddresses.push(address);
    });
  },
  deleteAddress(id) {
    store.update((s) => {
      s.savedAddresses = s.savedAddresses.filter((a) => a.id !== id);
    });
  },
  addTrustedContact(contact) {
    store.update((s) => {
      if (s.trustedContacts.length >= 5) {
        alert("Maximum 5 trusted contacts allowed.");
        return;
      }
      s.trustedContacts.push(contact);
    });
  },
  deleteTrustedContact(id) {
    store.update((s) => {
      s.trustedContacts = s.trustedContacts.filter((c) => c.id !== id);
    });
  },
  walletRecharge(amount) {
    store.update((s) => {
      s.wallet.balance += amount;
      s.transactions.unshift({
        id: "txn_" + Date.now(),
        title: "Recharged via Razorpay UPI",
        tamilTitle: "ரேசர்பே யுபிஐ மூலம் ரீசார்ஜ் செய்யப்பட்டது",
        date: "Today · " + (/* @__PURE__ */ new Date()).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
        amount,
        type: "in"
      });
      s.notifications.unshift({
        id: "notif_" + Date.now(),
        cat: "payments",
        title: "Wallet Recharged Successful",
        tamilTitle: "வாலட் ரீசார்ஜ் வெற்றி",
        body: `₹${amount} added successfully. Updated balance: ₹${s.wallet.balance.toFixed(2)}`,
        tamilBody: `₹${amount} வெற்றிகரமாக சேர்க்கப்பட்டது. புதுப்பிக்கப்பட்ட இருப்பு: ₹${s.wallet.balance.toFixed(2)}`,
        time: "now",
        unread: true
      });
    });
  },
  deductWallet(amount, rideLabel, tamilLabel) {
    store.update((s) => {
      s.wallet.balance = Math.max(0, s.wallet.balance - amount);
      s.transactions.unshift({
        id: "txn_" + Date.now(),
        title: rideLabel,
        tamilTitle: tamilLabel,
        date: "Just now",
        amount,
        type: "out"
      });
    });
  },
  addNotification(n) {
    store.update((s) => {
      s.notifications.unshift({
        ...n,
        id: "notif_" + Date.now(),
        time: "now",
        unread: true
      });
    });
  },
  clearNotifications() {
    store.update((s) => {
      s.notifications = [];
    });
  },
  markAllNotificationsRead() {
    store.update((s) => {
      s.notifications = s.notifications.map((n) => ({ ...n, unread: false }));
    });
  },
  deleteNotification(id) {
    store.update((s) => {
      s.notifications = s.notifications.filter((n) => n.id !== id);
    });
  },
  sendChatMessage(text) {
    store.update((s) => {
      s.chatMessages.push({
        id: "cmsg_" + Date.now(),
        sender: "user",
        text,
        time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })
      });
      setTimeout(() => {
        store.update((state) => {
          state.chatMessages.push({
            id: "cmsg_" + Date.now() + "_d",
            sender: "driver",
            text: text.toLowerCase().includes("where") || text.toLowerCase().includes("எங்கே") ? "I am just crossing Besant Nagar depot. Arriving in 2 mins." : "சரிங்க, வர்றேன். (Noted, arriving.)",
            time: (/* @__PURE__ */ new Date()).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })
          });
          state.notifications.unshift({
            id: "notif_" + Date.now(),
            cat: "rides",
            title: "New Message from Driver",
            tamilTitle: "ஓட்டுநரிடமிருந்து புதிய செய்தி",
            body: state.chatMessages[state.chatMessages.length - 1].text,
            tamilBody: "ஓட்டுநரிடமிருந்து செய்தி வந்துள்ளது.",
            time: "now",
            unread: true
          });
        });
      }, 1500);
    });
  },
  // Booking actions
  initiateBooking(pickup, drop, vehicle) {
    store.update((s) => {
      const base = vehicle === "bike" ? 45 : 82;
      s.ride = {
        ...INITIAL_STATE.ride,
        step: "vehicle",
        pickup,
        drop,
        vehicle,
        basePrice: base,
        negotiatedPrice: base,
        otp: Math.floor(1e3 + Math.random() * 9e3).toString()
      };
    });
  },
  updateBookingPrice(price) {
    store.update((s) => {
      s.ride.negotiatedPrice = price;
    });
  },
  applyCoupon(code, discount) {
    store.update((s) => {
      s.ride.couponCode = code;
      s.ride.discount = discount;
      s.ride.negotiatedPrice = Math.max(10, s.ride.basePrice - discount);
    });
  },
  async startDriverSearch(womenSafetyMatch = false) {
    const dynamicOtp = Math.floor(1e3 + Math.random() * 9e3).toString();
    store.update((s) => {
      s.ride.step = "searching";
      s.ride.otp = dynamicOtp;
    });
    const userProfile = globalState.profile;
    const currentRide = globalState.ride;
    const customer = await api.getUserByEmail(userProfile.email, "customer", userProfile.name, userProfile.phone);
    if (!customer) {
      setTimeout(() => {
        store.update((state) => {
          state.ride.step = "matching";
          state.ride.driver = {
            name: "Karthik Raja",
            tamilName: "கார்த்திக் ராஜா",
            vehicle: "Bajaj RE Auto",
            tamilVehicle: "பஜாஜ் ஆர்.இ ஆட்டோ",
            plate: "TN 01 BK 9921",
            rating: 4.9,
            trips: 1284,
            phone: "+91 94440 98765",
            lat: 12.983,
            lng: 80.252,
            trustScore: 98,
            avatar: ""
          };
        });
        setTimeout(() => {
          store.update((state) => {
            state.ride.step = "arriving";
          });
        }, 2e3);
      }, 3e3);
      return;
    }
    let computedDistance = 6.2;
    if (currentRide.pickupCoords && currentRide.dropCoords) {
      computedDistance = calculateDistance(
        currentRide.pickupCoords.lat,
        currentRide.pickupCoords.lon,
        currentRide.dropCoords.lat,
        currentRide.dropCoords.lon
      );
    }
    const dbRide = await api.createRide({
      customer: customer.id,
      pickup: currentRide.pickup,
      pickup_sub: "Chennai",
      dropoff: currentRide.drop,
      dropoff_sub: "Chennai",
      fare: currentRide.negotiatedPrice,
      distance: computedDistance,
      duration: 15,
      status: "pending",
      otp: currentRide.otp,
      surge_multiplier: currentRide.surgeApplied ? 1.2 : 1,
      rain_bonus: 0,
      vehicle_type: currentRide.vehicle || "bike",
      women_safety_match: womenSafetyMatch
    });
    if (dbRide) {
      store.update((s) => {
        s.ride.id = String(dbRide.id);
      });
      let failedAttempts = 0;
      const interval = setInterval(async () => {
        const updated = await api.getRide(dbRide.id);
        if (!updated) {
          failedAttempts++;
          if (failedAttempts >= 5) {
            clearInterval(interval);
          }
          return;
        }
        failedAttempts = 0;
        store.update((s) => {
          if (updated.status === "accepted" || updated.status === "otp") {
            s.ride.step = "arriving";
            if (updated.driver_detail) {
              const driverInfo = updated.driver_detail;
              const vehicleObj = driverInfo.vehicles && driverInfo.vehicles.length > 0 ? driverInfo.vehicles[0] : null;
              s.ride.driver = {
                name: driverInfo.name || "Namma Captain",
                tamilName: driverInfo.name || "நம்ம கேப்டன்",
                vehicle: vehicleObj ? `${vehicleObj.model}` : "Namma Auto/Bike",
                tamilVehicle: vehicleObj ? vehicleObj.vehicle_type === "bike" ? "நம்ம பைக்" : "நம்ம ஆட்டோ" : "நம்ம வாகனம்",
                plate: vehicleObj ? vehicleObj.plate_number : "TN 01 BK 9921",
                rating: driverInfo.rating || 4.9,
                trips: driverInfo.completed_rides || 450,
                phone: driverInfo.phone || "+91 98765 43210",
                lat: driverInfo.current_latitude || 12.983,
                lng: driverInfo.current_longitude || 80.252,
                trustScore: driverInfo.verification_progress || 98,
                avatar: driverInfo.avatar || ""
              };
            } else if (updated.driver_name) {
              s.ride.driver = {
                name: updated.driver_name,
                tamilName: updated.driver_name,
                vehicle: "Namma Auto/Bike",
                tamilVehicle: "நம்ம வாகனம்",
                plate: "TN 01 BK 9921",
                rating: 4.9,
                trips: 450,
                phone: "+91 98765 43210",
                lat: 12.983,
                lng: 80.252,
                trustScore: 98,
                avatar: ""
              };
            }
          } else if (updated.status === "trip") {
            if (updated.completion_step !== void 0 && updated.completion_step >= 0) {
              s.ride.step = "completed";
              s.ride.progress = 100;
              s.ride.speed = 0;
            } else {
              s.ride.step = "ongoing";
              s.ride.progress = 40;
              s.ride.speed = 42;
            }
          } else if (updated.status === "completed") {
            s.ride.step = "completed";
            s.ride.progress = 100;
            s.ride.speed = 0;
            clearInterval(interval);
          } else if (updated.status === "cancelled") {
            s.ride.step = "cancelled";
            clearInterval(interval);
          }
          s.ride.completion_step = updated.completion_step !== void 0 && updated.completion_step !== null ? updated.completion_step : -1;
          s.ride.distance = updated.distance;
          if (updated.rating_customer !== void 0 && updated.rating_customer !== null) {
            const key = `customer_notified_rating_ride_${updated.id}`;
            const alreadyNotified = localStorage.getItem(key);
            if (!alreadyNotified) {
              s.notifications.unshift({
                id: "notif_rate_" + Date.now(),
                cat: "rides",
                title: "Rider Rating Received",
                tamilTitle: "ஓட்டுநர் மதிப்பீடு பெறப்பட்டது",
                body: `Captain rated your ride: ${updated.rating_customer} stars. Thank you for riding with us!`,
                tamilBody: `கேப்டன் உங்கள் சவாரிக்கு ${updated.rating_customer} நட்சத்திர மதிப்பீடு அளித்துள்ளார். எங்களோடு பயணித்தமைக்கு நன்றி!`,
                time: "now",
                unread: true
              });
              localStorage.setItem(key, "true");
            }
          }
        });
      }, 2e3);
    }
  },
  startTrip() {
    store.update((s) => {
      s.ride.step = "ongoing";
      s.ride.progress = 5;
      s.ride.milestoneIndex = 1;
      s.ride.speed = 38;
    });
    const interval = setInterval(() => {
      let isDone = false;
      store.update((state) => {
        if (state.ride.step !== "ongoing") {
          clearInterval(interval);
          isDone = true;
          return;
        }
        const nextProgress = state.ride.progress + 25;
        if (nextProgress >= 100) {
          state.ride.progress = 100;
          state.ride.speed = 0;
          state.ride.step = "completed";
          state.ride.milestoneIndex = 4;
          const finalCost = state.ride.negotiatedPrice;
          state.wallet.balance = Math.max(0, state.wallet.balance - finalCost);
          state.wallet.rideStreak = (state.wallet.rideStreak + 1) % 6;
          state.transactions.unshift({
            id: "txn_" + Date.now(),
            title: `${state.ride.vehicle === "bike" ? "Bike" : "Auto"} Ride to ${state.ride.drop.split("·")[0]}`,
            tamilTitle: `${state.ride.vehicle === "bike" ? "பைக்" : "ஆட்டோ"} பயணம், இறங்குமிடம்: ${state.ride.drop.split("·")[0]}`,
            date: "Today",
            amount: finalCost,
            type: "out"
          });
          state.notifications.unshift({
            id: "notif_" + Date.now(),
            cat: "rides",
            title: "Ride Completed Successfully",
            tamilTitle: "பயணம் வெற்றிகரமாக முடிந்தது",
            body: `₹${finalCost} auto-deducted from Namma Cash wallet. Download invoice now.`,
            tamilBody: `உங்கள் வாலட்டிலிருந்து ₹${finalCost} கழிக்கப்பட்டது. ரசீதை பதிவிறக்கவும்.`,
            time: "now",
            unread: true
          });
          clearInterval(interval);
          isDone = true;
        } else {
          state.ride.progress = nextProgress;
          state.ride.milestoneIndex = Math.min(3, state.ride.milestoneIndex + 1);
          state.ride.speed = 30 + Math.floor(Math.random() * 20);
        }
      });
      if (isDone) clearInterval(interval);
    }, 6e3);
  },
  cancelRide() {
    store.update((s) => {
      s.ride.step = "cancelled";
      s.ride.driver = null;
      s.ride.speed = 0;
      s.notifications.unshift({
        id: "notif_" + Date.now(),
        cat: "rides",
        title: "Ride Cancelled",
        tamilTitle: "பயணம் ரத்து செய்யப்பட்டது",
        body: "Your ride was successfully cancelled. No fee was charged.",
        tamilBody: "உங்கள் பயணம் வெற்றிகரமாக ரத்து செய்யப்பட்டது. கட்டணம் ஏதும் வசூலிக்கப்படவில்லை.",
        time: "now",
        unread: true
      });
    });
  },
  resetBooking() {
    store.update((s) => {
      s.ride.step = "idle";
      s.ride.driver = null;
      s.ride.progress = 0;
      s.ride.speed = 0;
      s.ride.isSosTriggered = false;
      s.ride.isAudioRecording = false;
      s.ride.complaintRaised = false;
      s.ride.refundRequested = false;
    });
  },
  async triggerSos(lat, lon, speed, direction) {
    const state = store.getState();
    const rideId = state.ride.id;
    let dbSosId = null;
    const actualLat = lat ?? state.ride.pickupCoords?.lat ?? 13.0382;
    const actualLon = lon ?? state.ride.pickupCoords?.lon ?? 80.2785;
    const currentSpeed = speed ?? state.ride.speed ?? 0;
    try {
      const res = await api.createSOSAlert({
        ride: rideId ? parseInt(rideId) : null,
        latitude: actualLat,
        longitude: actualLon,
        device_info: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown Device",
        speed: currentSpeed,
        direction: direction ?? "North"
      });
      if (res && res.id) {
        dbSosId = res.id;
      }
    } catch (e) {
      console.warn("Failed creating SOS Alert in backend", e);
    }
    store.update((s) => {
      s.ride.isSosTriggered = true;
      s.ride.sos_id = dbSosId;
      s.notifications.unshift({
        id: "notif_" + Date.now(),
        cat: "alerts",
        title: "SOS Alert Dispatched!",
        tamilTitle: "அவசரகால எச்சரிக்கை அனுப்பப்பட்டது!",
        body: "SMS with live tracking link dispatched to your trusted contacts. Local emergency team alerted.",
        tamilBody: "உங்கள் நேரடி இருப்பிட இணைப்பு அவசரகால தொடர்புகளுக்கு அனுப்பப்பட்டது.",
        time: "now",
        unread: true
      });
    });
  },
  async cancelSos() {
    const state = store.getState();
    const sosId = state.ride.sos_id;
    if (sosId) {
      try {
        await api.resolveSOSAlert(sosId);
      } catch (e) {
        console.warn("Failed to resolve SOS Alert on backend", e);
      }
    }
    store.update((s) => {
      s.ride.isSosTriggered = false;
      s.ride.sos_id = null;
      s.notifications.unshift({
        id: "notif_" + Date.now(),
        cat: "alerts",
        title: "SOS Cancelled",
        tamilTitle: "அவசரகால எச்சரிக்கை ரத்து செய்யப்பட்டது",
        body: "Emergency alert has been cancelled successfully.",
        tamilBody: "அவசரகால எச்சரிக்கை வெற்றிகரமாக ரத்து செய்யப்பட்டது.",
        time: "now",
        unread: true
      });
    });
  },
  async sendSosLocationSnapshot(lat, lon, speed, direction) {
    const state = store.getState();
    const sosId = state.ride.sos_id;
    if (sosId) {
      try {
        await api.addSOSSnapshot(sosId, {
          latitude: lat,
          longitude: lon,
          speed: speed ?? state.ride.speed ?? 0,
          direction: direction ?? "North"
        });
      } catch (e) {
        console.warn("Failed sending SOS location snapshot to backend", e);
      }
    }
  },
  toggleAudioRecording() {
    store.update((s) => {
      s.ride.isAudioRecording = !s.ride.isAudioRecording;
    });
  },
  raiseComplaint(text) {
    store.update((s) => {
      s.ride.complaintRaised = true;
      s.ride.complaintText = text;
      s.notifications.unshift({
        id: "notif_" + Date.now(),
        cat: "alerts",
        title: "Complaint Registered",
        tamilTitle: "புகார் பதிவு செய்யப்பட்டது",
        body: `Your dispute has been logged (ID: NM-${Math.floor(1e5 + Math.random() * 9e5)}). Support will call within 2 hours.`,
        tamilBody: "உங்கள் புகார் பதிவு செய்யப்பட்டது. 2 மணிநேரத்தில் உங்களை தொடர்புகொள்வோம்.",
        time: "now",
        unread: true
      });
    });
  },
  requestRefund() {
    store.update((s) => {
      s.ride.refundRequested = true;
      s.wallet.balance += s.ride.negotiatedPrice;
      s.transactions.unshift({
        id: "txn_" + Date.now(),
        title: "Instant Wallet Refund Credited",
        tamilTitle: "வாலட் திரும்பப்பெறுதல் வரவு வைக்கப்பட்டது",
        date: "Just now",
        amount: s.ride.negotiatedPrice,
        type: "in"
      });
      s.notifications.unshift({
        id: "notif_" + Date.now(),
        cat: "payments",
        title: "Refund Approved Instantly",
        tamilTitle: "திரும்பப்பெறுதல் உடனடியாக அங்கீகரிக்கப்பட்டது",
        body: `₹${s.ride.negotiatedPrice} credited back to Namma Cash due to ride cancellation dispute.`,
        tamilBody: `சவாரி ரத்து தகராறு காரணமாக ₹${s.ride.negotiatedPrice} மீண்டும் உங்கள் கணக்கில் சேர்க்கப்பட்டது.`,
        time: "now",
        unread: true
      });
    });
  }
};
function useAppStore() {
  const [state, setState] = reactExports.useState(globalState);
  reactExports.useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setState({ ...newState });
    });
    return () => {
      unsubscribe();
    };
  }, []);
  return state;
}
const DICTIONARY = {
  // Navigation & Core headers
  "Home": { en: "Home", ta: "முகப்பு" },
  "Trips": { en: "Trips", ta: "பயணங்கள்" },
  "Offers": { en: "Offers", ta: "சலுகைகள்" },
  "Safety": { en: "Safety", ta: "பாதுகாப்பு" },
  "Account": { en: "Account", ta: "சுயவிவரம்" },
  "Where to today?": { en: "Where to today?", ta: "இன்று எங்கு செல்ல வேண்டும்?" },
  "Search destination": { en: "Search destination", ta: "இலக்கைத் தேடவும்" },
  "Quick ride": { en: "Quick ride", ta: "விரைவு சவாரி" },
  "Chennai essentials": { en: "Chennai essentials", ta: "சென்னை அத்தியாவசியங்கள்" },
  "SOS": { en: "SOS", ta: "அவசர உதவி" },
  "Schedule": { en: "Schedule", ta: "நேர அட்டவணை" },
  "Fare": { en: "Fare Details", ta: "கட்டண விவரம்" },
  "Language": { en: "Language", ta: "மொழி" },
  "Recent destinations": { en: "Recent destinations", ta: "சமீபத்திய இடங்கள்" },
  "First ride offer": { en: "First ride offer", ta: "முதல் சவாரி சலுகை" },
  "Save 50% up to ₹75": { en: "Save 50% up to ₹75", ta: "50% சேமிக்கவும் ₹75 வரை" },
  "Use code": { en: "Use code", ta: "குறியீட்டைப் பயன்படுத்துக:" },
  "Confirm ride": { en: "Confirm ride", ta: "சவாரியை உறுதிசெய்" },
  "Confirm Bike": { en: "Confirm Bike", ta: "பைக்கை உறுதிசெய்" },
  "Confirm Auto": { en: "Confirm Auto", ta: "ஆட்டோவை உறுதிசெய்" },
  // Wallet
  "Namma Cash": { en: "Namma Cash", ta: "நம்ம கேஷ்" },
  "Available balance": { en: "Available balance", ta: "கிடைக்கக்கூடிய இருப்பு" },
  "Add money": { en: "Add money", ta: "பணம் சேர்க்கவும்" },
  "Recent activity": { en: "Recent activity", ta: "சமீபத்திய நடவடிக்கை" },
  // Booking & Map
  "Pickup": { en: "Pickup Location", ta: "ஏறுமிடம்" },
  "Drop": { en: "Drop Destination", ta: "இறங்குமிடம்" },
  "Change": { en: "Change", ta: "மாற்று" },
  "Now": { en: "Now", ta: "இப்போது" },
  "Landmark pickup": { en: "Landmark pickup", ta: "அடையாள சின்ன ஏறுமிடம்" },
  "Multi-stop": { en: "Multi-stop", ta: "பல நிறுத்தங்கள்" },
  "Bike": { en: "Bike", ta: "பைக்" },
  "Auto": { en: "Auto", ta: "ஆட்டோ" },
  "arrives in": { en: "arrives in", ta: "வந்து சேரும் நேரம்" },
  "Pay via UPI": { en: "Pay via UPI", ta: "யுபிஐ மூலம் செலுத்து" },
  "Add favourite rider on next trip": { en: "Add favourite rider on next trip", ta: "அடுத்த சவாரியில் பிடித்த ஓட்டுநரை சேர்க்கவும்" },
  // Tracking
  "Live ride": { en: "Live ride", ta: "நேரடி சவாரி" },
  "Arriving in": { en: "Arriving in", ta: "வந்து சேரும் நேரம்" },
  "Share trip": { en: "Share trip", ta: "பயணத்தைப் பகிர்" },
  "Safety toolkit": { en: "Safety toolkit", ta: "பாதுகாப்பு கருவித்தொகுப்பு" },
  "OTP Verification": { en: "OTP Verification", ta: "ஒரு முறை கடவுச்சொல் சரிபார்ப்பு" },
  "Give this OTP to driver on arrival": { en: "Give this OTP to driver on arrival", ta: "ஓட்டுநர் வந்ததும் இந்த சரிபார்ப்பு எண்ணைக் கூறவும்" },
  // Safety page
  "You're never alone in Chennai.": { en: "You're never alone in Chennai.", ta: "சென்னையில் நீங்கள் எப்போதும் தனியாக இல்லை." },
  "Press for SOS": { en: "Press for SOS", ta: "SOS அவசர பொத்தான்" },
  "Calls 112 and alerts contacts": { en: "Calls 112 and alerts contacts", ta: "112 ஐ அழைத்து தொடர்புகளுக்கு எச்சரிக்கை அனுப்பும்" },
  "Women safety mode": { en: "Women safety mode", ta: "பெண்கள் பாதுகாப்பு பயன்முறை" },
  "Female-only verified drivers": { en: "Female-only verified drivers", ta: "பெண் ஓட்டுநர்கள் மட்டுமே" },
  "Share live trip": { en: "Share live trip", ta: "இருப்பிடத்தைப் நேரலையில் பகிரவும்" },
  "Auto-share with trusted contacts": { en: "Auto-share with trusted contacts", ta: "நம்பகமான தொடர்புகளுடன் தானாகப் பகிரவும்" },
  "Emergency dial": { en: "Emergency dial", ta: "அவசர அழைப்பு" },
  "One-tap 112 from any screen": { en: "One-tap 112 from any screen", ta: "எந்த திரையிலிருந்தும் 112 ஐ அழைக்கவும்" },
  "Trusted contacts": { en: "Trusted contacts", ta: "நம்பகமான தொடர்புகள்" },
  "Add": { en: "Add", ta: "சேர்" },
  // Account settings
  "Wallet & payments": { en: "Wallet & payments", ta: "வாலட் மற்றும் கட்டணங்கள்" },
  "Language & Region": { en: "Language & Region", ta: "மொழி மற்றும் பகுதி" },
  "Tamil voice booking": { en: "Tamil voice booking", ta: "தமிழ் குரல் சவாரி பதிவு" },
  "Notifications": { en: "Notifications", ta: "அறிவிப்புகள்" },
  "Dark mode": { en: "Dark mode", ta: "இருண்ட பயன்முறை" },
  "Settings": { en: "Settings", ta: "அமைப்புகள்" },
  "Help & support": { en: "Help & support", ta: "உதவி & ஆதரவு" },
  "Sign out": { en: "Sign out", ta: "வெளியேறு" },
  "Saved addresses": { en: "Saved addresses", ta: "சேமிக்கப்பட்ட முகவரிகள்" },
  "Home/Work shortcuts": { en: "Home/Work shortcuts", ta: "வீடு/அலுவலக குறுக்குவழிகள்" },
  "Emergency contacts": { en: "Emergency contacts", ta: "அவசரகால தொடர்புகள்" },
  "Ride preferences": { en: "Ride preferences", ta: "பயண விருப்பங்கள்" },
  "Privacy settings": { en: "Privacy settings", ta: "தனியுரிமை அமைப்புகள்" },
  // Voice page
  "Voice Booking": { en: "Voice Booking", ta: "குரல் வழி பதிவு" },
  "Tamil voice assistant planning": { en: "Tamil voice assistant planning", ta: "தமிழ் குரல் உதவியாளர் திட்டமிடல்" },
  "Tap to speak": { en: "Tap to speak", ta: "பேச தட்டவும்" },
  "Listening...": { en: "Listening...", ta: "கேட்கிறேன்..." },
  "Understanding your request…": { en: "Understanding your request…", ta: "உங்கள் கோரிக்கையைப் புரிந்துகொள்கிறேன்..." },
  "Searching driver...": { en: "Searching driver...", ta: "ஓட்டுநரைத் தேடுகிறது..." },
  "Try saying": { en: "Try saying", ta: "இவ்வாறு கூற முயற்சிக்கவும்" }
};
function translate(key, lang) {
  if (DICTIONARY[key]) {
    return DICTIONARY[key][lang];
  }
  const keys = Object.keys(DICTIONARY);
  const foundKey = keys.find((k) => k.toLowerCase() === key.toLowerCase());
  if (foundKey) return DICTIONARY[foundKey][lang];
  return key;
}
const appCss = "/assets/styles-mM50awAp.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$g = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#facc15" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Rideuu" },
      { title: "Rideuu — Chennai bike & auto on demand" },
      { name: "description", content: "Chennai's premium bike & auto ride-booking app. Tamil-friendly, women-safe, rain-ready." },
      { property: "og:title", content: "Rideuu — Chennai's ride app" },
      { property: "og:description", content: "Bikes & autos across Chennai. Tamil voice booking, SOS, flood alerts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "manifest",
        href: "/manifest.json"
      },
      {
        rel: "apple-touch-icon",
        href: "/icons/icon.svg"
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Mukta+Malar:wght@400;500;700&display=swap"
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$g.useRouteContext();
  const { theme, womenSafetyMode } = useAppStore();
  reactExports.useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register("/sw.js").then((reg) => console.log("[PWA] Service Worker registered successfully in scope:", reg.scope)).catch((err) => console.error("[PWA] Service Worker registration failed:", err));
      };
      if (document.readyState === "complete" || document.readyState === "interactive") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);
  reactExports.useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      if (womenSafetyMode) {
        root.classList.add("safety-mode");
      } else {
        root.classList.remove("safety-mode");
      }
    }
  }, [theme, womenSafetyMode]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) });
}
const $$splitComponentImporter$f = () => import("./login-BYdlMfCS.mjs");
const Route$f = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Sign in · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./app-bVPXEbxt.mjs");
const Route$e = createFileRoute("/app")({
  beforeLoad: ({
    location
  }) => {
    const state = store.getState();
    if (!state.token) {
      throw redirect({
        to: "/login"
      });
    }
    if (location.pathname === "/app" || location.pathname === "/app/") {
      throw redirect({
        to: "/app/home"
      });
    }
  },
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./index-CYcNyfHS.mjs");
const Route$d = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "Rideuu — Chennai bike & auto on demand"
    }, {
      name: "description",
      content: "Book bikes and autos across Chennai in seconds. Tamil voice booking, women safety mode, flood alerts and live tracking."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./wallet-BQ1ltL0t.mjs");
const Route$c = createFileRoute("/app/wallet")({
  head: () => ({
    meta: [{
      title: "Wallet · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./voice-CvBh8q99.mjs");
const Route$b = createFileRoute("/app/voice")({
  head: () => ({
    meta: [{
      title: "Voice Booking · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./trips-C5snjWIK.mjs");
const Route$a = createFileRoute("/app/trips")({
  head: () => ({
    meta: [{
      title: "Ride history · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./track-BaVBEHMu.mjs");
const Route$9 = createFileRoute("/app/track")({
  head: () => ({
    meta: [{
      title: "Live ride · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./schedule-D7xpXbgA.mjs");
const Route$8 = createFileRoute("/app/schedule")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./safety-C5zowqpP.mjs");
const Route$7 = createFileRoute("/app/safety")({
  head: () => ({
    meta: [{
      title: "Safety · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./offers-DCm8ZI7v.mjs");
const Route$6 = createFileRoute("/app/offers")({
  head: () => ({
    meta: [{
      title: "Offers · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./notifications-D9mjF2C5.mjs");
const Route$5 = createFileRoute("/app/notifications")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./language-DWUd8vRg.mjs");
const Route$4 = createFileRoute("/app/language")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./home-98MhUvKx.mjs");
const Route$3 = createFileRoute("/app/home")({
  head: () => ({
    meta: [{
      title: "Home · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./fare-CRfgl8HN.mjs");
const Route$2 = createFileRoute("/app/fare")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./book-D986VYG2.mjs");
const Route$1 = createFileRoute("/app/book")({
  head: () => ({
    meta: [{
      title: "Book a ride · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./account-BOtSTpY1.mjs");
const Route = createFileRoute("/app/account")({
  head: () => ({
    meta: [{
      title: "Account · Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const LoginRoute = Route$f.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$g
});
const AppRoute = Route$e.update({
  id: "/app",
  path: "/app",
  getParentRoute: () => Route$g
});
const IndexRoute = Route$d.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$g
});
const AppWalletRoute = Route$c.update({
  id: "/wallet",
  path: "/wallet",
  getParentRoute: () => AppRoute
});
const AppVoiceRoute = Route$b.update({
  id: "/voice",
  path: "/voice",
  getParentRoute: () => AppRoute
});
const AppTripsRoute = Route$a.update({
  id: "/trips",
  path: "/trips",
  getParentRoute: () => AppRoute
});
const AppTrackRoute = Route$9.update({
  id: "/track",
  path: "/track",
  getParentRoute: () => AppRoute
});
const AppScheduleRoute = Route$8.update({
  id: "/schedule",
  path: "/schedule",
  getParentRoute: () => AppRoute
});
const AppSafetyRoute = Route$7.update({
  id: "/safety",
  path: "/safety",
  getParentRoute: () => AppRoute
});
const AppOffersRoute = Route$6.update({
  id: "/offers",
  path: "/offers",
  getParentRoute: () => AppRoute
});
const AppNotificationsRoute = Route$5.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => AppRoute
});
const AppLanguageRoute = Route$4.update({
  id: "/language",
  path: "/language",
  getParentRoute: () => AppRoute
});
const AppHomeRoute = Route$3.update({
  id: "/home",
  path: "/home",
  getParentRoute: () => AppRoute
});
const AppFareRoute = Route$2.update({
  id: "/fare",
  path: "/fare",
  getParentRoute: () => AppRoute
});
const AppBookRoute = Route$1.update({
  id: "/book",
  path: "/book",
  getParentRoute: () => AppRoute
});
const AppAccountRoute = Route.update({
  id: "/account",
  path: "/account",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppAccountRoute,
  AppBookRoute,
  AppFareRoute,
  AppHomeRoute,
  AppLanguageRoute,
  AppNotificationsRoute,
  AppOffersRoute,
  AppSafetyRoute,
  AppScheduleRoute,
  AppTrackRoute,
  AppTripsRoute,
  AppVoiceRoute,
  AppWalletRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  LoginRoute
};
const routeTree = Route$g._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  api as a,
  router as r,
  store as s,
  translate as t,
  useAppStore as u
};
