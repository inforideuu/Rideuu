import { useState, useEffect } from "react";
import { api } from "./api";

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // return rounded to 1 decimal place
}

export type Language = "en" | "ta";
export type Theme = "light" | "dark";

export interface SavedAddress {
  id: string;
  label: string;
  tamilLabel: string;
  address: string;
  icon: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship?: string; // Father, Mother, Brother, Sister, Friend, Spouse
}

export interface DeviceSession {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface WalletTransaction {
  id: string;
  title: string;
  tamilTitle: string;
  date: string;
  amount: number;
  type: "in" | "out";
}

export interface AppNotification {
  id: string;
  cat: "rides" | "payments" | "alerts" | "offers";
  title: string;
  tamilTitle: string;
  body: string;
  tamilBody: string;
  time: string;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "driver";
  text: string;
  time: string;
}

export interface DriverState {
  name: string;
  tamilName: string;
  vehicle: string;
  tamilVehicle: string;
  plate: string;
  rating: number;
  trips: number;
  phone: string;
  lat: number;
  lng: number;
  trustScore: number;
  avatar: string;
}

export interface RideLifecycle {
  id?: string | null;
  step: "idle" | "pickup" | "drop" | "vehicle" | "bidding" | "searching" | "matching" | "arriving" | "ongoing" | "completed" | "cancelled";
  pickup: string;
  drop: string;
  pickupCoords?: { lat: number; lon: number } | null;
  dropCoords?: { lat: number; lon: number } | null;
  waypoints: string[];
  vehicle: "bike" | "auto" | null;
  basePrice: number;
  negotiatedPrice: number;
  surgeApplied: boolean;
  nightApplied: boolean;
  couponCode: string;
  discount: number;
  scheduledTime: string | null;
  driver: DriverState | null;
  otp: string;
  progress: number; // 0 to 100
  speed: number;
  milestoneIndex: number;
  isAudioRecording: boolean;
  isSosTriggered: boolean;
  sos_id?: string | number | null;
  complaintRaised: boolean;
  complaintText: string;
  refundRequested: boolean;
  completion_step?: number;
  distance?: number | string | null;
}

// Initial state template
const INITIAL_STATE = {
  language: "en" as Language,
  theme: "light" as Theme, // Defaulting to the beautiful white theme
  womenSafetyMode: false,
  avoidUnlit: true,
  prioritizeHighways: true,
  patrolRoutes: false,
  isPwaInstalled: false,
  token: null as string | null,
  
  // Profile info
  profile: {
    name: "",
    phone: "",
    email: "",
    avatar: "",
    gender: "male",
    ridePreference: "silent", // silent, quick, regular
    notificationsEnabled: true,
    privacyLevel: "standard",
    sosPin: "1234",
  },

  savedAddresses: [
    { id: "home", label: "Home", tamilLabel: "வீடு", address: "Marina Beach Road, Mylapore, Chennai", icon: "home" },
    { id: "work", label: "Work", tamilLabel: "அலுவலகம்", address: "Tidel Park, Rajiv Gandhi Salai, Taramani, Chennai", icon: "briefcase" }
  ] as SavedAddress[],

  trustedContacts: [] as TrustedContact[],

  deviceSessions: [] as DeviceSession[],

  wallet: {
    balance: 0.0,
    rewardPoints: 0,
    rideStreak: 0,
    hasSubscribedPass: false,
    passType: ""
  },

  transactions: [] as WalletTransaction[],

  notifications: [] as AppNotification[],

  // Chat conversation during live trip
  chatMessages: [] as ChatMessage[],

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
    distance: null,
  } as RideLifecycle
};

type AppState = typeof INITIAL_STATE;
type Listener = (state: AppState) => void;

let globalState: AppState = (() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("namma_ride_store");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge sub-elements to guard against partial keys in older client caches
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
          ride: parsed.ride ? { ...INITIAL_STATE.ride, ...parsed.ride } : INITIAL_STATE.ride,
        };
      } catch (e) {
        console.error("Failed to parse store state", e);
      }
    }
  }
  return INITIAL_STATE;
})();

const listeners = new Set<Listener>();

function emit() {
  if (typeof window !== "undefined") {
    localStorage.setItem("namma_ride_store", JSON.stringify(globalState));
  }
  listeners.forEach((l) => l(globalState));
}

// Exportable store API
export const store = {
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
          s.transactions = txs.map((t: any) => ({
            id: String(t.id),
            title: t.title,
            tamilTitle: t.title,
            date: t.date || "Today",
            amount: typeof t.amount === "number" ? t.amount : (parseFloat(String(t.amount).replace(/[^\d.]/g, "")) || 0),
            type: t.positive ? "in" : "out"
          }));
        });
      }
      const sessions = await api.getSessions(token);
      if (sessions) {
        store.update((s) => {
          s.deviceSessions = sessions.map((sess: any) => ({
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
        sosPin: "1234",
      };
      s.savedAddresses = [];
      s.trustedContacts = [];
      s.deviceSessions = [];
      s.wallet = {
        balance: 0.0,
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
        refundRequested: false,
      };
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("namma_ride_store");
    }
  },

  update(updater: (state: AppState) => void) {
    updater(globalState);
    emit();
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // State actions helper
  setLanguage(lang: Language) {
    store.update((s) => {
      s.language = lang;
    });
  },

  setTheme(theme: Theme) {
    store.update((s) => {
      s.theme = theme;
      if (typeof document !== "undefined") {
        const root = document.documentElement;
        if (theme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
      }
    });
  },

  setWomenSafetyMode(active: boolean) {
    if (active) {
      const state = store.getState();
      const userGender = state.profile.gender || "male";
      if (userGender !== "female" && userGender !== "others") {
        alert("Women Safety Mode can only be activated for female or others gender profiles.");
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

    // Sync safety preference to Django backend database
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

  setPwaInstalled(val: boolean) {
    store.update((s) => {
      s.isPwaInstalled = val;
    });
  },

  setAvoidUnlit(val: boolean) {
    store.update((s) => {
      s.avoidUnlit = val;
    });
  },

  setPrioritizeHighways(val: boolean) {
    store.update((s) => {
      s.prioritizeHighways = val;
    });
  },

  setPatrolRoutes(val: boolean) {
    store.update((s) => {
      s.patrolRoutes = val;
    });
  },

  updateProfile(fields: Partial<AppState["profile"]>) {
    store.update((s) => {
      s.profile = { ...s.profile, ...fields };
    });
  },

  addAddress(address: SavedAddress) {
    store.update((s) => {
      s.savedAddresses.push(address);
    });
  },

  deleteAddress(id: string) {
    store.update((s) => {
      s.savedAddresses = s.savedAddresses.filter((a) => a.id !== id);
    });
  },

  addTrustedContact(contact: TrustedContact) {
    store.update((s) => {
      if (s.trustedContacts.length >= 5) {
        alert("Maximum 5 trusted contacts allowed.");
        return;
      }
      s.trustedContacts.push(contact);
    });
  },

  deleteTrustedContact(id: string) {
    store.update((s) => {
      s.trustedContacts = s.trustedContacts.filter((c) => c.id !== id);
    });
  },

  walletRecharge(amount: number) {
    store.update((s) => {
      s.wallet.balance += amount;
      s.transactions.unshift({
        id: "txn_" + Date.now(),
        title: "Recharged via Razorpay UPI",
        tamilTitle: "ரேசர்பே யுபிஐ மூலம் ரீசார்ஜ் செய்யப்பட்டது",
        date: "Today · " + new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }),
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

  deductWallet(amount: number, rideLabel: string, tamilLabel: string) {
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

  addNotification(n: Omit<AppNotification, "id" | "time" | "unread">) {
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

  deleteNotification(id: string) {
    store.update((s) => {
      s.notifications = s.notifications.filter((n) => n.id !== id);
    });
  },

  sendChatMessage(text: string) {
    store.update((s) => {
      s.chatMessages.push({
        id: "cmsg_" + Date.now(),
        sender: "user",
        text,
        time: new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })
      });
      
      // Simulate driver response after 1.5s
      setTimeout(() => {
        store.update((state) => {
          state.chatMessages.push({
            id: "cmsg_" + Date.now() + "_d",
            sender: "driver",
            text: text.toLowerCase().includes("where") || text.toLowerCase().includes("எங்கே")
              ? "I am just crossing Besant Nagar depot. Arriving in 2 mins." 
              : "சரிங்க, வர்றேன். (Noted, arriving.)",
            time: new Date().toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" })
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
  initiateBooking(pickup: string, drop: string, vehicle: "bike" | "auto") {
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
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
      };
    });
  },

  updateBookingPrice(price: number) {
    store.update((s) => {
      s.ride.negotiatedPrice = price;
    });
  },

  applyCoupon(code: string, discount: number) {
    store.update((s) => {
      s.ride.couponCode = code;
      s.ride.discount = discount;
      s.ride.negotiatedPrice = Math.max(10, s.ride.basePrice - discount);
    });
  },

  async startDriverSearch(womenSafetyMatch: boolean = false) {
    const dynamicOtp = Math.floor(1000 + Math.random() * 9000).toString();
    store.update((s) => {
      s.ride.step = "searching";
      s.ride.otp = dynamicOtp;
    });

    const userProfile = globalState.profile;
    const currentRide = globalState.ride;

    // 1. Get or create Customer in Django
    const customer = await api.getUserByEmail(userProfile.email, "customer", userProfile.name, userProfile.phone);
    if (!customer) {
      // Fallback if backend offline
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
            lat: 12.9830,
            lng: 80.2520,
            trustScore: 98,
            avatar: ""
          };
        });
        setTimeout(() => {
          store.update((state) => {
            state.ride.step = "arriving";
          });
        }, 2000);
      }, 3000);
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

    // 2. Create Ride in Django
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
      surge_multiplier: currentRide.surgeApplied ? 1.2 : 1.0,
      rain_bonus: 0,
      vehicle_type: currentRide.vehicle || "bike",
      women_safety_match: womenSafetyMatch
    });

    if (dbRide) {
      store.update((s) => {
        s.ride.id = String(dbRide.id);
      });

      let failedAttempts = 0;
      // 3. Start polling loop for status updates
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
                tamilVehicle: vehicleObj ? (vehicleObj.vehicle_type === "bike" ? "நம்ம பைக்" : "நம்ம ஆட்டோ") : "நம்ம வாகனம்",
                plate: vehicleObj ? vehicleObj.plate_number : "TN 01 BK 9921",
                rating: driverInfo.rating || 4.9,
                trips: driverInfo.completed_rides || 450,
                phone: driverInfo.phone || "+91 98765 43210",
                lat: driverInfo.current_latitude || 12.9830,
                lng: driverInfo.current_longitude || 80.2520,
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
                lat: 12.9830,
                lng: 80.2520,
                trustScore: 98,
                avatar: ""
              };
            }
          } else if (updated.status === "trip") {
            if (updated.completion_step !== undefined && updated.completion_step >= 0) {
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
          s.ride.completion_step = (updated.completion_step !== undefined && updated.completion_step !== null) ? updated.completion_step : -1;
          s.ride.distance = updated.distance;

          // Check if driver rated customer, then notify customer in real-time
          if (updated.rating_customer !== undefined && updated.rating_customer !== null) {
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
      }, 2000);
    }
  },

  startTrip() {
    store.update((s) => {
      s.ride.step = "ongoing";
      s.ride.progress = 5;
      s.ride.milestoneIndex = 1;
      s.ride.speed = 38;
    });

    // Auto animate trip progress every 4 seconds for simulation
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
          
          // Deduct payment
          const finalCost = state.ride.negotiatedPrice;
          state.wallet.balance = Math.max(0, state.wallet.balance - finalCost);
          state.wallet.rideStreak = (state.wallet.rideStreak + 1) % 6; // Streak logic
          
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
          state.ride.speed = 30 + Math.floor(Math.random() * 20); // fluctuate speed
        }
      });
      if (isDone) clearInterval(interval);
    }, 6000);
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

  async triggerSos(lat?: number, lon?: number, speed?: number, direction?: string) {
    const state = store.getState();
    const rideId = state.ride.id;
    let dbSosId: number | null = null;
    
    const actualLat = lat ?? state.ride.pickupCoords?.lat ?? 13.0382;
    const actualLon = lon ?? state.ride.pickupCoords?.lon ?? 80.2785;
    const currentSpeed = speed ?? state.ride.speed ?? 0;
    
    try {
      const res = await api.createSOSAlert({
        ride: rideId ? parseInt(rideId) : null,
        latitude: actualLat,
        longitude: actualLon,
        device_info: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
        speed: currentSpeed,
        direction: direction ?? 'North'
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

  async sendSosLocationSnapshot(lat: number, lon: number, speed?: number, direction?: string) {
    const state = store.getState();
    const sosId = state.ride.sos_id;
    if (sosId) {
      try {
        await api.addSOSSnapshot(sosId, {
          latitude: lat,
          longitude: lon,
          speed: speed ?? state.ride.speed ?? 0,
          direction: direction ?? 'North'
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

  raiseComplaint(text: string) {
    store.update((s) => {
      s.ride.complaintRaised = true;
      s.ride.complaintText = text;
      s.notifications.unshift({
        id: "notif_" + Date.now(),
        cat: "alerts",
        title: "Complaint Registered",
        tamilTitle: "புகார் பதிவு செய்யப்பட்டது",
        body: `Your dispute has been logged (ID: NM-${Math.floor(100000 + Math.random() * 900000)}). Support will call within 2 hours.`,
        tamilBody: "உங்கள் புகார் பதிவு செய்யப்பட்டது. 2 மணிநேரத்தில் உங்களை தொடர்புகொள்வோம்.",
        time: "now",
        unread: true
      });
    });
  },

  requestRefund() {
    store.update((s) => {
      s.ride.refundRequested = true;
      s.wallet.balance += s.ride.negotiatedPrice; // instant credit refund back
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

// Global subscription hook for React components
export function useAppStore() {
  const [state, setState] = useState<AppState>(globalState);

  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setState({ ...newState });
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}

// String translation helper
const DICTIONARY: Record<string, { en: string; ta: string }> = {
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

export function translate(key: string, lang: Language): string {
  if (DICTIONARY[key]) {
    return DICTIONARY[key][lang];
  }
  // Try dynamic prefix matching
  const keys = Object.keys(DICTIONARY);
  const foundKey = keys.find(k => k.toLowerCase() === key.toLowerCase());
  if (foundKey) return DICTIONARY[foundKey][lang];
  
  return key;
}
