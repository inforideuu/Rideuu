import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { translations } from "../lib/translations";
import { api } from "../lib/api";

export type Language = "en" | "ta";
export type Theme = "light" | "dark";

export interface KYCItem {
  id: string;
  dbId?: number;
  labelKey: string;
  status: "todo" | "progress" | "done" | "rejected";
  rejectionReason?: string;
  file?: string;
}

export interface Vehicle {
  id: string;
  model: string;
  plateNumber: string;
  type: "auto" | "bike";
  insuranceExpiry: string;
  pollutionExpiry: string;
  maintenanceDays: number;
  approved: boolean;
}

export interface Transaction {
  id: string;
  titleKey: string;
  titleEn: string;
  amount: string;
  date: string;
  positive: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: "open" | "resolved";
  date: string;
  chat: { sender: "rider" | "support"; message: string; time: string }[];
}

export interface NotificationItem {
  id: string;
  titleKey: string;
  subKey: string;
  titleEn: string;
  subEn: string;
  time: string;
  type: "info" | "earnings" | "kyc" | "safety" | "alert";
  iconName: string;
}

export interface ShiftSchedule {
  id: string;
  day: string;
  hours: string;
  active: boolean;
}

export interface RideRequest {
  id: string;
  fare: number;
  distance: number;
  duration: number;
  pickup: string;
  pickupSub: string;
  dropoff: string;
  dropoffSub: string;
  customerName: string;
  customerRating: number;
  isFemaleOnly: boolean;
  surgeMultiplier: number;
  rainBonus: number;
  otp?: string;
  vehicle_type?: string;
  payment_mode?: string;
  rating_customer?: number | null;
  rating_driver?: number | null;
}

export interface ActiveRideState {
  request: RideRequest | null;
  stage: "pickup" | "otp" | "trip" | "completion";
  otpInput: string;
  currentStepIndex: number;
  isPaused: boolean;
  voiceNavEnabled: boolean;
  reRouted: boolean;
  completionStep?: number;
}

export interface RiderContextType {
  // Config & Info
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  t: (key: string) => string;

  // Driver details
  profileName: string;
  setProfileName: (name: string) => void;
  profilePhoto: string;
  setProfilePhoto: (photo: string) => void;
  phone: string;
  setPhone: (phone: string) => void;
  email: string;
  setEmail: (email: string) => void;
  gender: string;
  setGender: (val: string) => void;
  womenPriorityMatch: boolean;
  setWomenPriorityMatch: (val: boolean) => void;
  womenSafetyVerified: boolean;
  rating: number;
  completedRides: number;
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  emergencyName: string;
  setEmergencyName: (val: string) => void;
  emergencyPhone: string;
  setEmergencyPhone: (val: string) => void;
  notifPush: boolean;
  setNotifPush: (val: boolean) => void;
  notifIncentives: boolean;
  setNotifIncentives: (val: boolean) => void;

  // Shift & Status
  online: boolean;
  setOnline: (val: boolean) => void;
  sosTriggered: boolean;
  triggerSOS: () => void;
  cancelSOS: () => void;
  availabilitySchedule: ShiftSchedule[];
  toggleSchedule: (id: string) => void;

  // KYC Verification
  driverId: number | null;
  kycProgress: number;
  kycList: KYCItem[];
  uploadKYCDoc: (id: string, fileData: string) => void;
  adminSetKYCStatus: (id: string, status: "todo" | "progress" | "done" | "rejected", reason?: string) => void;
  manualLocation: { address: string; latitude: number; longitude: number; } | null;
  setManualLocation: (address: string, lat: number, lon: number) => Promise<void>;
  clearManualLocation: () => void;

  // Vehicle Management
  vehicles: Vehicle[];
  activeVehicleId: string;
  setActiveVehicleId: (id: string) => void;
  addVehicle: (model: string, plate: string, type: "auto" | "bike") => void;

  // Active Ride Simulator
  activeRide: ActiveRideState;
  incomingRequest: RideRequest | null;
  setIncomingRequest: (req: RideRequest | null) => void;
  acceptRideRequest: () => Promise<boolean>;
  rejectRideRequest: () => void;
  setRideStage: (stage: "pickup" | "otp" | "trip" | "completion") => void;
  setOtpInput: (otp: string) => void;
  advanceActiveRideStep: () => void;
  togglePauseRide: () => void;
  voicePromptTriggered: string | null;
  setVoicePromptTriggered: (msg: string | null) => void;
  reportRideIssue: (issue: string) => void;
  endActiveRide: (rating: number) => void;

  // Simulation controls
  rainActive: boolean;
  setRainActive: (val: boolean) => void;
  floodAlert: boolean;
  setFloodAlert: (val: boolean) => void;
  lowNetwork: boolean;
  setLowNetwork: (val: boolean) => void;

  // Earnings & Wallet
  walletBalance: number;
  incentiveBalance: number;
  bonusBalance: number;
  upiId: string;
  setUpiId: (val: string) => void;
  bankAccount: string;
  setBankAccount: (val: string) => void;
  payoutStatus: "success" | "pending" | "failed";
  setPayoutStatus: (status: "success" | "pending" | "failed") => void;
  transactions: Transaction[];
  withdrawFunds: (amount: number, fee?: number, walletType?: "wallet" | "incentive" | "bonus") => Promise<boolean>;

  // Support
  tickets: SupportTicket[];
  addSupportTicket: (subject: string, message: string) => void;
  addChatMessage: (ticketId: string, message: string, sender: "rider" | "support") => void;

  // Referrals
  referralCode: string;
  referralsList: string[];
  referralEarnings: number;
  addReferral: (phone: string) => void;

  // Notifications
  notificationsList: NotificationItem[];
  addNotification: (titleKey: string, subKey: string, titleEn: string, subEn: string, type: NotificationItem["type"], iconName: string) => void;
  clearNotifications: () => void;
  currentAddress: string;
  noCommissionExpiry: number;
  purchaseNoCommission: (planPrice: number, durationDays: number, method: 'wallet' | 'razorpay') => Promise<boolean>;
  ridesList: any[];
}

const RiderContext = createContext<RiderContextType | undefined>(undefined);

export const RiderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // English/Tamil language setting
  const [language, setLanguageState] = useState<Language>("en");
  const [theme, setThemeState] = useState<Theme>("light");

  // Profile
  const [driverId, setDriverId] = useState<number | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGenderState] = useState("male");
  const [womenPriorityMatch, setWomenPriorityMatch] = useState(false);
  const [womenSafetyVerified, setWomenSafetyVerified] = useState(false);
  const [rating, setRating] = useState(5.0);
  const [completedRides, setCompletedRides] = useState(0);
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [notifPush, setNotifPush] = useState(true);
  const [notifIncentives, setNotifIncentives] = useState(true);
  const [token, setTokenState] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("namma_token");
    }
    return null;
  });

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (typeof window !== "undefined") {
      if (newToken) {
        localStorage.setItem("namma_token", newToken);
      } else {
        localStorage.removeItem("namma_token");
      }
    }
  };

  const logout = () => {
    setTokenState(null);
    setPhone("");
    setProfileName("");
    setEmail("");
    setDriverId(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("namma_token");
      localStorage.removeItem("namma_phone");
      localStorage.removeItem("namma_email");
      localStorage.removeItem("namma_name");
      localStorage.removeItem("namma_photo");
    }
  };

  // Status & Safety
  const [online, setOnlineState] = useState(false);
  const [currentAddress, setCurrentAddress] = useState("T. Nagar Shopping Zone");
  const [manualLocation, setManualLocationState] = useState<{
    address: string;
    latitude: number;
    longitude: number;
  } | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("namma_manual_location");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const setManualLocation = async (address: string, lat: number, lon: number) => {
    const loc = { address, latitude: lat, longitude: lon };
    setManualLocationState(loc);
    localStorage.setItem("namma_manual_location", JSON.stringify(loc));
    setCurrentAddress(address);
    if (email) {
      const driver = await api.getUserByEmail(email, "driver", profileName, "", phone);
      if (driver) {
        await api.updateUser(driver.id, {
          current_latitude: lat,
          current_longitude: lon,
          last_location_update: Math.floor(Date.now() / 1000),
          is_available: true,
          online: true
        });
      }
    }
  };

  const clearManualLocation = () => {
    setManualLocationState(null);
    localStorage.removeItem("namma_manual_location");
  };

  const setOnline = async (val: boolean) => {
    if (val) {
      const activeVehType = localStorage.getItem("namma_vehicle_type") || "";
      const driver = await api.getUserByEmail(email, "driver", profileName, activeVehType, phone);
      if (driver) {
        if (driver.status === "suspended" || driver.status === "blacklisted") {
          alert("Cannot Go Online: Your account has been suspended or blocked by the admin.");
          setOnlineState(false);
          return;
        }
        if (driver.kyc_status === "REJECTED") {
          alert("Cannot Go Online: Your KYC has been rejected. Please re-upload documents.");
          setOnlineState(false);
          return;
        }
        if (driver.kyc_status !== "VERIFIED") {
          alert("Cannot Go Online: Your KYC is not verified yet.");
          setOnlineState(false);
          return;
        }
      }
    }
    setOnlineState(val);
  };

  const [sosTriggered, setSosTriggered] = useState(false);

  // Simulation helpers
  const [rainActive, setRainActive] = useState(false);
  const [floodAlert, setFloodAlert] = useState(false);
  const [lowNetwork, setLowNetwork] = useState(false);

  // KYC
  const [kycList, setKycList] = useState<KYCItem[]>([
    { id: "aadhaar", labelKey: "aadhaar_pan", status: "todo" },
    { id: "license", labelKey: "driving_license", status: "todo" },
    { id: "vehicle", labelKey: "vehicle_rc", status: "todo" },
    { id: "insurance", labelKey: "insurance_cert", status: "todo" },
    { id: "profile_photo", labelKey: "profile_photo", status: "todo" },
    { id: "selfie", labelKey: "selfie_face", status: "todo" },
  ]);

  // Vehicle
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeVehicleId, setActiveVehicleId] = useState("");
 
  // Shift & Schedules
  const [availabilitySchedule, setAvailabilitySchedule] = useState<ShiftSchedule[]>([
    { id: "s1", day: "Monday", hours: "08:00 - 16:00", active: true },
    { id: "s2", day: "Tuesday", hours: "08:00 - 16:00", active: true },
    { id: "s3", day: "Wednesday", hours: "08:00 - 16:00", active: true },
    { id: "s4", day: "Thursday", hours: "18:00 - 02:00 (Night Preference)", active: false },
    { id: "s5", day: "Friday", hours: "08:00 - 16:00", active: true },
    { id: "s6", day: "Saturday", hours: "10:00 - 20:00", active: false },
    { id: "s7", day: "Sunday", hours: "Weekend Off", active: false },
  ]);
 
  // Wallet
  const [walletBalance, setWalletBalance] = useState(0);
  const [incentiveBalance, setIncentiveBalance] = useState(0);
  const [bonusBalance, setBonusBalance] = useState(0);
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [payoutStatus, setPayoutStatus] = useState<"success" | "pending" | "failed">("success");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
 
  // Support
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
 
  // Referrals
  const [referralCode, setReferralCode] = useState("NAMMA4421");
  const [referralsList, setReferralsList] = useState<string[]>([]);
  const [referralEarnings, setReferralEarnings] = useState(0);
 
  // Notifications
  const [notificationsList, setNotificationsList] = useState<NotificationItem[]>([]);
  const [noCommissionExpiry, setNoCommissionExpiry] = useState(0);
  const [ridesList, setRidesList] = useState<any[]>([]);

  // Active Ride Simulator State
  const [incomingRequest, setIncomingRequest] = useState<RideRequest | null>(null);
  const [activeRide, setActiveRide] = useState<ActiveRideState>({
    request: null,
    stage: "pickup",
    otpInput: "",
    currentStepIndex: 0,
    isPaused: false,
    voiceNavEnabled: true,
    reRouted: false,
    completionStep: -1,
  });

  const [voicePromptTriggered, setVoicePromptTriggered] = useState<string | null>(null);

  // Sync state from LocalStorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("namma_lang");
    if (savedLang) setLanguageState(savedLang as Language);

    const savedTheme = localStorage.getItem("namma_theme");
    if (savedTheme) {
      setThemeState(savedTheme as Theme);
      if (savedTheme === "dark") document.documentElement.classList.add("dark");
    }

    const savedName = localStorage.getItem("namma_name") || "";
    const savedPhone = localStorage.getItem("namma_phone") || "";
    const savedEmail = localStorage.getItem("namma_email") || "";
    if (savedName) setProfileName(savedName);
    if (savedPhone) setPhone(savedPhone);
    if (savedEmail) setEmail(savedEmail);
 
    const savedPhoto = localStorage.getItem("namma_photo");
    if (savedPhoto) setProfilePhoto(savedPhoto);
  }, []);

  // Play sound when a new ride request comes in
  useEffect(() => {
    if (incomingRequest) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
      audio.play().catch(e => console.warn("Failed to play notification audio:", e));
    }
  }, [incomingRequest]);

  // Poll driver profile status for KYC approval notification
  useEffect(() => {
    if (!email || !token) return;
    const interval = setInterval(async () => {
      const activeVehType = localStorage.getItem("namma_vehicle_type") || "";
      const driver = await api.getUserByEmail(email, "driver", profileName, activeVehType, phone);
      if (driver) {
        const prevKycStatus = localStorage.getItem("last_kyc_status");
        if (driver.kyc_status === "VERIFIED" && prevKycStatus !== "VERIFIED") {
          addNotification(
            "kyc_approved_title",
            "kyc_approved_desc",
            "KYC Approved Successfully",
            "Your KYC has been approved! You can now go online.",
            "kyc",
            "ShieldCheck"
          );
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
          audio.play().catch(e => console.warn("Failed to play kyc audio:", e));
        }
        if (driver.kyc_status === "REJECTED" && prevKycStatus !== "REJECTED") {
          addNotification(
            "kyc_rejected_title",
            "kyc_rejected_desc",
            "KYC Rejected by Admin",
            "Your KYC has been rejected. Please review and re-upload valid documents.",
            "alert",
            "ShieldAlert"
          );
          setOnlineState(false);
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
          audio.play().catch(e => console.warn("Failed to play kyc audio:", e));
        }
        localStorage.setItem("last_kyc_status", driver.kyc_status);

        // Check warning notification for negative wallet balance
        const wasNegative = localStorage.getItem("last_wallet_was_negative");
        if (driver.wallet_balance < 0) {
          if (wasNegative !== "true" && driver.status === "active") {
            addNotification(
              "wallet_negative_warning_title",
              "wallet_negative_warning_desc",
              "Warning: Negative Balance",
              `Your wallet balance is negative (₹${driver.wallet_balance.toFixed(2)}). Please recharge within 2 days to avoid automatic suspension.`,
              "alert",
              "ShieldAlert"
            );
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
            audio.play().catch(e => console.warn("Failed to play warning audio:", e));
          }
          localStorage.setItem("last_wallet_was_negative", "true");
        } else {
          localStorage.setItem("last_wallet_was_negative", "false");
        }

        const prevStatus = localStorage.getItem("last_driver_status");
        if ((driver.status === "suspended" || driver.status === "blacklisted") && prevStatus !== driver.status) {
          addNotification(
            "account_blocked_title",
            "account_blocked_desc",
            driver.status === "suspended" ? "Account Suspended" : "Account Blocked",
            driver.status === "suspended"
              ? (driver.wallet_balance < 0 
                  ? `Your account has been suspended due to a negative wallet balance (₹${driver.wallet_balance.toFixed(2)}) persisting for over 2 days. Please clear it immediately.` 
                  : "Your account has been suspended by the admin.")
              : "Your account has been blocked due to policy violations.",
            "alert",
            "Ban"
          );
          setOnlineState(false);
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
          audio.play().catch(e => console.warn("Failed to play status audio:", e));
        }
        localStorage.setItem("last_driver_status", driver.status);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [email, phone, profileName]);

  // Fetch user details from Django whenever token or phone changes
  useEffect(() => {
    async function loadDriver() {
      const activeEmail = email || localStorage.getItem("namma_email");
      const activeToken = token || localStorage.getItem("namma_token");
      const activeName = profileName || localStorage.getItem("namma_name") || "";
      const activeVehType = localStorage.getItem("namma_vehicle_type") || "";
      const activePhone = phone || localStorage.getItem("namma_phone") || "";
      if (!activeEmail || !activeToken) return;
      const data = await api.getUserByEmail(activeEmail, "driver", activeName, activeVehType, activePhone);
      if (data) {
        localStorage.setItem("last_kyc_status", data.kyc_status);
        setDriverId(data.id);
        setProfileName(data.name);
        setPhone(data.phone);
        setGenderState(data.gender || "male");
        if (data.email) setEmail(data.email);
        setWalletBalance(data.wallet_balance);
        setIncentiveBalance(data.incentive_balance);
        setBonusBalance(data.bonus_balance);
        setOnline(data.online);
        setNoCommissionExpiry(data.no_commission_expiry || 0);
        if (data.upi_id) setUpiId(data.upi_id);
        if (data.bank_account) setBankAccount(data.bank_account);
        setWomenPriorityMatch(data.women_priority_match);
        setWomenSafetyVerified(data.women_safety_verified || false);
        setRating(data.rating !== undefined && data.rating !== null ? data.rating : 5.0);
        setCompletedRides(data.completed_rides !== undefined && data.completed_rides !== null ? data.completed_rides : 0);
        setEmergencyName(data.emergency_contact_name || "");
        setEmergencyPhone(data.emergency_contact_phone || "");
        setNotifPush(data.notif_push !== undefined ? data.notif_push : true);
        setNotifIncentives(data.notif_incentives !== undefined ? data.notif_incentives : true);
        if (data.availability_schedule) {
          try {
            const parsed = JSON.parse(data.availability_schedule);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAvailabilitySchedule(parsed);
            }
          } catch (e) {
            console.warn("Failed parsing availability schedule", e);
          }
        }

        // Fetch transactions from backend
        const txsData = await api.getUserTransactions(activePhone);
        if (txsData) {
          const mappedTxs: Transaction[] = txsData.map((tx: any) => ({
            id: String(tx.id),
            titleKey: tx.title.toLowerCase().includes("withdraw") ? "withdraw" : "ride_fare",
            titleEn: tx.title,
            amount: tx.amount,
            date: tx.date || "Just now",
            positive: tx.positive
          }));
          setTransactions(mappedTxs);
        }

        // Fetch tickets from backend
        const ticketsData = await api.getUserTickets(activePhone);
        if (ticketsData) {
          const mappedTickets: SupportTicket[] = ticketsData.map((t: any) => ({
            id: String(t.id),
            subject: t.subject,
            status: t.status,
            date: t.date || "Today",
            chat: t.chat || []
          }));
          setTickets(mappedTickets);
        }
        if (data.kyc_documents) {
          const defaultKycList: KYCItem[] = [
            { id: "aadhaar", labelKey: "aadhaar_pan", status: "todo" },
            { id: "license", labelKey: "driving_license", status: "todo" },
            { id: "vehicle", labelKey: "vehicle_rc", status: "todo" },
            { id: "insurance", labelKey: "insurance_cert", status: "todo" },
            { id: "profile_photo", labelKey: "profile_photo", status: "todo" },
            { id: "selfie", labelKey: "selfie_face", status: "todo" },
          ];
          const formattedKyc: KYCItem[] = defaultKycList.map(defaultItem => {
            const dbItem = data.kyc_documents.find((d: any) => d.document_type === defaultItem.id);
            if (dbItem) {
              const statusVal = dbItem.status === "pending" ? "progress" : dbItem.status;
              return {
                ...defaultItem,
                dbId: dbItem.id,
                status: statusVal as KYCItem["status"],
                file: dbItem.file_data || undefined,
                rejectionReason: dbItem.rejection_reason || undefined
              };
            }
            return defaultItem;
          });
          setKycList(formattedKyc);
        }
        if (data.vehicles && data.vehicles.length > 0) {
          const formattedVehicles = data.vehicles.map((v: any) => ({
            id: `veh-${v.id}`,
            model: v.model,
            plateNumber: v.plate_number,
            type: v.vehicle_type,
            insuranceExpiry: v.insurance_expiry,
            pollutionExpiry: v.pollution_expiry,
            maintenanceDays: v.maintenance_days,
            approved: v.approved
          }));
          setVehicles(formattedVehicles);
          setActiveVehicleId(formattedVehicles[0].id);
        }

        // Fetch completed rides list
        try {
          const ridesData = await api.getRides();
          if (Array.isArray(ridesData)) {
            setRidesList(ridesData);
          }
        } catch (e) {
          console.warn("Failed fetching rides inside loadDriver:", e);
        }
      }
    }
    loadDriver();
  }, [token, email, phone]);

  // Sync online status and poll pending/active rides from backend
  useEffect(() => {
    if (!email || !token) return;

    // Sync online status to DB when changed
    api.getUserByEmail(email, "driver", profileName, "", phone).then(async (driver) => {
      if (driver && driver.online !== online) {
        if (online) {
          // Verify with Django perform_update validation
          const url = `http://localhost:8000/api/users/${driver.id}/`;
          const response = await fetch(url, {
            method: "PATCH",
            headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token || localStorage.getItem("namma_token")}`
            },
            body: JSON.stringify({ online: true })
          });
          if (!response.ok) {
            const errRes = await response.json();
            const reason = errRes.reason || "Documents under review or not approved.";
            alert(`Cannot Go Online: ${reason}`);
            setOnline(false);
          }
        } else {
          api.updateUser(driver.id, { online: false });
        }
      }
    });

    let locationInterval: any = null;
    if (online) {
      const updateLocation = async () => {
        const driver = await api.getUserByEmail(email, "driver", profileName, "", phone);
        if (!driver) return;
        if (manualLocation) {
          api.updateUser(driver.id, {
            current_latitude: manualLocation.latitude,
            current_longitude: manualLocation.longitude,
            last_location_update: Math.floor(Date.now() / 1000),
            is_available: true,
            online: true
          });
          setCurrentAddress(manualLocation.address);
          return;
        }
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              api.updateUser(driver.id, {
                current_latitude: latitude,
                current_longitude: longitude,
                last_location_update: Math.floor(Date.now() / 1000),
                is_available: true,
                online: true
              });
              try {
                const res = await api.reverseGeocode(latitude, longitude);
                if (res && res.address) {
                  const parts = res.address.split(',');
                  const shortAddress = parts[0] + (parts[1] ? `, ${parts[1].trim()}` : "");
                  setCurrentAddress(shortAddress);
                }
              } catch (e) {
                console.warn("Reverse geocode error:", e);
              }
            },
            async (error) => {
              console.warn("Geolocation error:", error);
              const mockLat = 13.0827 + (Math.random() - 0.5) * 0.01;
              const mockLon = 80.2707 + (Math.random() - 0.5) * 0.01;
              api.updateUser(driver.id, {
                current_latitude: mockLat,
                current_longitude: mockLon,
                last_location_update: Math.floor(Date.now() / 1000),
                is_available: true,
                online: true
              });
              try {
                const res = await api.reverseGeocode(mockLat, mockLon);
                if (res && res.address) {
                  const parts = res.address.split(',');
                  const shortAddress = parts[0] + (parts[1] ? `, ${parts[1].trim()}` : "");
                  setCurrentAddress(shortAddress);
                }
              } catch (e) {
                console.warn("Reverse geocode error:", e);
              }
            },
            { enableHighAccuracy: true, timeout: 3000 }
          );
        } else {
          const mockLat = 13.0827 + (Math.random() - 0.5) * 0.01;
          const mockLon = 80.2707 + (Math.random() - 0.5) * 0.01;
          api.updateUser(driver.id, {
            current_latitude: mockLat,
            current_longitude: mockLon,
            last_location_update: Math.floor(Date.now() / 1000),
            is_available: true,
            online: true
          });
          try {
            const res = await api.reverseGeocode(mockLat, mockLon);
            if (res && res.address) {
              const parts = res.address.split(',');
              const shortAddress = parts[0] + (parts[1] ? `, ${parts[1].trim()}` : "");
              setCurrentAddress(shortAddress);
            }
          } catch (e) {
            console.warn("Reverse geocode error:", e);
          }
        }
      };
      updateLocation();
      locationInterval = setInterval(updateLocation, 8000);
    }

    const interval = setInterval(async () => {
      // 1. Check if there is an active ride in progress in Django DB
      const currentActive = await api.getActiveRide(phone, "driver");
      if (currentActive) {
        // Map Django active ride back to local state
        const reqMapped = {
          id: String(currentActive.id),
          fare: currentActive.fare,
          distance: currentActive.distance,
          duration: currentActive.duration,
          pickup: currentActive.pickup,
          pickupSub: currentActive.pickup_sub,
          dropoff: currentActive.dropoff,
          dropoffSub: currentActive.dropoff_sub,
          customerName: currentActive.customer_name,
          customerRating: 4.8,
          isFemaleOnly: false,
          surgeMultiplier: currentActive.surge_multiplier,
          rainBonus: currentActive.rain_bonus,
          otp: currentActive.otp,
          vehicle_type: currentActive.vehicle_type,
          payment_mode: currentActive.payment_mode,
          rating_customer: currentActive.rating_customer,
          rating_driver: currentActive.rating_driver
        };

        setActiveRide(prev => {
          if (prev.request?.id === reqMapped.id) {
            // If already active, sync stage if needed, but do not override client simulation unless different
            let nextStage = prev.stage;
            if (prev.stage !== 'completion') {
              if (['accepted', 'RIDER_ASSIGNED', 'DRIVER_EN_ROUTE'].includes(currentActive.status)) nextStage = 'pickup';
              else if (['otp', 'DRIVER_ARRIVED'].includes(currentActive.status)) nextStage = 'otp';
              else if (['trip', 'RIDE_STARTED'].includes(currentActive.status)) nextStage = 'trip';
            }
            const serverCompletionStep = (currentActive.completion_step !== undefined && currentActive.completion_step !== null) ? currentActive.completion_step : prev.completionStep;
            return { 
              ...prev, 
              request: reqMapped, 
              stage: nextStage,
              completionStep: serverCompletionStep
            };
          }
          // Set new active ride
          let initialStage: 'pickup' | 'otp' | 'trip' = 'pickup';
          if (['trip', 'RIDE_STARTED'].includes(currentActive.status)) initialStage = 'trip';
          else if (['otp', 'DRIVER_ARRIVED'].includes(currentActive.status)) initialStage = 'otp';
          return {
            request: reqMapped,
            stage: initialStage,
            otpInput: currentActive.otp,
            currentStepIndex: 0,
            isPaused: false,
            voiceNavEnabled: true,
            reRouted: false,
            completionStep: currentActive.completion_step !== undefined ? currentActive.completion_step : -1
          };
        });
        setIncomingRequest(null);
      } else {
        // Check completed ride ratings to notify the driver in real-time
        if (phone) {
          api.getRides().then((rides) => {
            if (rides && rides.length > 0) {
              const latestCompleted = rides.find((r: any) => r.status === "completed" && r.rating_driver !== null && r.rating_driver !== undefined);
              if (latestCompleted) {
                const key = `notified_rating_ride_${latestCompleted.id}`;
                const alreadyNotified = localStorage.getItem(key);
                if (!alreadyNotified || alreadyNotified !== String(latestCompleted.rating_driver)) {
                  const msgEn = `Customer ${latestCompleted.customer_name || "Passenger"} rated you ${latestCompleted.rating_driver} stars for Ride #${latestCompleted.id}.`;
                  const msgTa = `பயணி ${latestCompleted.customer_name || "பயணிகள்"} உங்களுக்கு ${latestCompleted.rating_driver} நட்சத்திர மதிப்பீடு அளித்துள்ளார் (சவாரி #${latestCompleted.id}).`;
                  addNotification(
                    "customer_rating_title",
                    language === "ta" ? msgTa : msgEn,
                    "Customer Rating Received",
                    msgEn,
                    "info",
                    "Info"
                  );
                  localStorage.setItem(key, String(latestCompleted.rating_driver));
                }
              }
            }
          }).catch(err => console.warn("Failed to check completed ride ratings:", err));
        }

        // 2. Otherwise, check for pending requests
        const pendings = await api.getPendingRides();
        if (pendings && pendings.length > 0) {
          const latest = pendings[0];
          setIncomingRequest({
            id: String(latest.id),
            fare: latest.fare,
            distance: latest.distance,
            duration: latest.duration,
            pickup: latest.pickup,
            pickupSub: latest.pickup_sub,
            dropoff: latest.dropoff,
            dropoffSub: latest.dropoff_sub,
            customerName: latest.customer_name,
            customerRating: 4.9,
            isFemaleOnly: false,
            surgeMultiplier: latest.surge_multiplier,
            rainBonus: latest.rain_bonus,
            otp: latest.otp,
            vehicle_type: latest.vehicle_type,
            payment_mode: latest.payment_mode,
            rating_customer: latest.rating_customer,
            rating_driver: latest.rating_driver
          });
        } else {
          setIncomingRequest(null);
        }
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [online, phone, profileName, manualLocation]);


  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("namma_lang", lang);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setThemeState(nextTheme);
    localStorage.setItem("namma_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations["en"]] || key;
  };

  // SOS dispatch
  const triggerSOS = async () => {
    setSosTriggered(true);
    addNotification("emergency_title", "emergency_desc", "EMERGENCY SENT", "Sharing GPS details with Chennai Police.", "safety", "ShieldAlert");
    
    if (activeRide.request) {
      try {
        const baseLat = manualLocation ? manualLocation.latitude : 13.0382;
        const baseLon = manualLocation ? manualLocation.longitude : 80.2785;
        const res = await api.createSOSAlert({
          ride: parseInt(activeRide.request.id),
          latitude: baseLat,
          longitude: baseLon,
          device_info: typeof navigator !== 'undefined' ? navigator.userAgent : 'Rider App Client',
          speed: 0,
          direction: 'North'
        });
        if (res && res.id) {
          localStorage.setItem("rider_active_sos_id", String(res.id));
        }
      } catch (e) {
        console.warn("Failed creating Rider SOS Alert in backend", e);
      }
    }
  };

  const cancelSOS = async () => {
    setSosTriggered(false);
    const savedSosId = localStorage.getItem("rider_active_sos_id");
    if (savedSosId) {
      try {
        await api.resolveSOSAlert(savedSosId);
        localStorage.removeItem("rider_active_sos_id");
      } catch (e) {
        console.warn("Failed resolving Rider SOS Alert in backend", e);
      }
    }
  };

  // Schedule Toggler
  const toggleSchedule = (id: string) => {
    setAvailabilitySchedule((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
      if (driverId) {
        api.updateUser(driverId, { availability_schedule: JSON.stringify(next) });
      }
      return next;
    });
  };

  // KYC Management
  const kycProgress = useMemo(() => {
    let progress = 0;
    const docs = kycList.reduce((acc, doc) => {
      acc[doc.id] = doc.status;
      return acc;
    }, {} as Record<string, string>);

    const profileCompleted = !!(profileName && phone && docs["profile_photo"] && ["progress", "done"].includes(docs["profile_photo"]));
    if (profileCompleted) progress += 10;
    if (docs["aadhaar"] && ["progress", "done"].includes(docs["aadhaar"])) progress += 15;
    if (docs["license"] && ["progress", "done"].includes(docs["license"])) progress += 15;
    
    const vehicleAdded = vehicles.length > 0;
    if (vehicleAdded) progress += 15;
    
    if (docs["vehicle"] && ["progress", "done"].includes(docs["vehicle"])) progress += 15;
    if (docs["insurance"] && ["progress", "done"].includes(docs["insurance"])) progress += 15;
    if (docs["selfie"] && ["progress", "done"].includes(docs["selfie"])) progress += 15;
    
    return Math.min(100, progress);
  }, [kycList, profileName, phone, vehicles]);

  const uploadKYCDoc = async (id: string, fileData: string) => {
    // 1. Instantly update UI state
    setKycList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status: "progress", file: fileData } : k))
    );
    addNotification("kyc_header", "upload_success", "KYC Document Uploaded", `${id.toUpperCase()} file submitted for review.`, "kyc", "Upload");
    
    // 2. Fetch driver's details/documents from the database to find if the doc already exists
    let currentDriverId = driverId;
    if (!currentDriverId && phone) {
      const driverObj = await api.getUserByPhone(phone, "driver", profileName);
      if (driverObj) {
        currentDriverId = driverObj.id;
        setDriverId(driverObj.id);
      }
    }
    
    if (currentDriverId) {
      // Fetch current documents for this driver from API to check if it exists
      const userObj = await api.getUserByPhone(phone, "driver", profileName);
      const existingDoc = userObj?.kyc_documents?.find((d: any) => d.document_type === id);
      
      if (existingDoc) {
        // Update document
        const res = await api.updateKYCDoc(existingDoc.id, {
          status: "progress",
          file_data: fileData
        });
        if (res && res.id) {
          setKycList((prev) =>
            prev.map((k) => (k.id === id ? { ...k, dbId: res.id, status: "progress", file: fileData } : k))
          );
        }
      } else {
        // Create document
        const newDoc = await api.createKYCDoc({
          driver: currentDriverId,
          document_type: id,
          status: "progress",
          file_data: fileData
        });
        if (newDoc && newDoc.id) {
          setKycList((prev) =>
            prev.map((k) => (k.id === id ? { ...k, dbId: newDoc.id, status: "progress", file: fileData } : k))
          );
        }
      }
    }
  };

  const adminSetKYCStatus = async (
    id: string,
    status: "todo" | "progress" | "done" | "rejected",
    reason?: string
  ) => {
    // 1. Update local UI state first
    setKycList((prev) =>
      prev.map((k) => (k.id === id ? { ...k, status, rejectionReason: reason } : k))
    );
    if (status === "done") {
      addNotification("kyc_header", "verified", "KYC Document Approved", `${id.toUpperCase()} approved successfully!`, "kyc", "CheckCircle2");
    } else if (status === "rejected") {
      addNotification("rejection_alert", "rejection_alert", "KYC Rejected", `${id.toUpperCase()} rejected. Reason: ${reason}`, "alert", "ShieldAlert");
    }

    // 2. Sync with backend database
    if (driverId) {
      const target = kycList.find(k => k.id === id);
      let docDbId = target?.dbId;
      const apiStatus = status === "progress" ? "pending" : (status === "todo" ? "todo" : status);
      
      if (!docDbId) {
        try {
          const newDoc = await api.createKYCDoc({
            driver: driverId,
            document_type: id,
            status: apiStatus,
            file_data: `mock_file_${id}.jpg`
          });
          if (newDoc && newDoc.id) {
            docDbId = newDoc.id;
            setKycList(prev => prev.map(k => k.id === id ? { ...k, dbId: newDoc.id } : k));
          }
        } catch (e) {
          console.warn(`Failed creating ${id} document on backend:`, e);
        }
      } else {
        try {
          await api.updateKYCDoc(docDbId, { status: apiStatus, rejection_reason: reason || "" });
        } catch (e) {
          console.warn(`Failed updating ${id} document status on backend:`, e);
        }
      }

      // If completing selfie (last step of full KYC verification trigger), finalize full verification
      if (id === "selfie" && status === "done") {
        try {
          const userObj = await api.getUserByPhone(phone, "driver", profileName);
          if (userObj) {
            if (userObj.vehicles) {
              for (const v of userObj.vehicles) {
                await fetch(`http://localhost:8000/api/vehicles/${v.id}/`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token || localStorage.getItem("namma_token")}`
                  },
                  body: JSON.stringify({ approved: true })
                });
              }
            }
            await api.updateUser(driverId, { status: "active", kyc_status: "VERIFIED" });
          }
        } catch (e) {
          console.warn("Failed finalizing full driver verification on backend:", e);
        }
      }
    }
  };

  // Vehicle management
  const addVehicle = async (model: string, plate: string, type: "auto" | "bike") => {
    if (!driverId) return;
    const res = await api.createVehicle({
      driver: driverId,
      model,
      plate_number: plate,
      vehicle_type: type,
      insurance_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      pollution_expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      maintenance_days: 30,
      approved: false,
    });
    if (res && res.id) {
      const newVeh: Vehicle = {
        id: `veh-${res.id}`,
        model: res.model,
        plateNumber: res.plate_number,
        type: res.vehicle_type,
        insuranceExpiry: res.insurance_expiry,
        pollutionExpiry: res.pollution_expiry,
        maintenanceDays: res.maintenance_days,
        approved: res.approved,
      };
      setVehicles((prev) => [...prev, newVeh]);
      setActiveVehicleId(newVeh.id);
    }
  };

  const acceptRideRequest = async (): Promise<boolean> => {
    if (!incomingRequest) return false;
    const driverObj = await api.getUserByPhone(phone, "driver", profileName);
    if (driverObj) {
      const res = await api.updateRide(incomingRequest.id, { status: "accepted", driver: driverObj.id });
      if (!res) {
        alert("Ride has already been accepted by another driver!");
        setIncomingRequest(null);
        return false;
      }
    }
    setActiveRide({
      request: incomingRequest,
      stage: "pickup",
      otpInput: "",
      currentStepIndex: 0,
      isPaused: false,
      voiceNavEnabled: true,
      reRouted: false,
    });
    setIncomingRequest(null);
    return true;
  };

  const rejectRideRequest = async () => {
    if (incomingRequest) {
      await api.rejectRide(incomingRequest.id);
    }
    setIncomingRequest(null);
  };

  const setRideStage = async (stage: "pickup" | "otp" | "trip" | "completion") => {
    setActiveRide((prev) => ({ ...prev, stage }));
    if (activeRide.request && stage !== "completion") {
      const statusMap = { pickup: "DRIVER_EN_ROUTE", otp: "DRIVER_ARRIVED", trip: "RIDE_STARTED" };
      await api.updateRide(activeRide.request.id, { status: statusMap[stage] });
    }
    if (stage === "trip") {
      setVoicePromptTriggered("Heading towards Chennai Anna Nagar West Block. Traffic is light.");
    }
  };

  const setOtpInput = (otp: string) => {
    setActiveRide((prev) => ({ ...prev, otpInput: otp }));
  };

  const advanceActiveRideStep = () => {
    setActiveRide((prev) => {
      const currentStep = prev.currentStepIndex;
      const nextStep = currentStep + 1;
      return { ...prev, currentStepIndex: nextStep };
    });
  };

  const togglePauseRide = () => {
    setActiveRide((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const reportRideIssue = (issue: string) => {
    addSupportTicket(`Ride Issue · ${activeRide.request?.customerName || "Priya"}`, issue);
  };

  const endActiveRide = async (rating: number) => {
    if (!activeRide.request) return;

    // 1. Update backend ride to completed (this triggers commission settlement and transactions on backend)
    await api.updateRide(activeRide.request.id, { status: "completed", rating_customer: rating });

    // 2. Fetch updated driver details to get the exact calculated wallet balance
    const driverObj = await api.getUserByPhone(phone, "driver", profileName);
    if (driverObj) {
      setWalletBalance(driverObj.wallet_balance);
      setOnlineState(driverObj.online);
      setCompletedRides(driverObj.completed_rides !== undefined && driverObj.completed_rides !== null ? driverObj.completed_rides : 0);
      
      // 3. Fetch latest transactions from backend to keep ledger synchronized
      try {
        const txsData = await api.getUserTransactions(phone);
        if (txsData) {
          const mappedTxs: Transaction[] = txsData.map((tx: any) => ({
            id: String(tx.id),
            titleKey: tx.title.toLowerCase().includes("withdraw") ? "withdraw" : "ride_fare",
            titleEn: tx.title,
            amount: tx.amount,
            date: tx.date || "Just now",
            positive: tx.positive
          }));
          setTransactions(mappedTxs);
        }
      } catch (e) {
        console.warn("Failed to get transactions:", e);
      }

      // 4. Fetch latest support tickets
      try {
        const ticketsData = await api.getUserTickets(phone);
        if (ticketsData) {
          const mappedTickets: SupportTicket[] = ticketsData.map((t: any) => ({
            id: String(t.id),
            subject: t.subject,
            status: t.status,
            date: t.date || "Today",
            chat: t.chat || []
          }));
          setTickets(mappedTickets);
        }
      } catch (e) {
        console.warn("Failed to get tickets:", e);
      }
    }

    // Add notification (showing correct earning)
    const fareBase = activeRide.request.fare;
    const vType = activeRide.request.vehicle_type || "bike";
    const isAuto = vType.toLowerCase().includes("auto");
    const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1000);
    const commPercent = hasNoComm ? 0.0 : (isAuto ? 0.08 : 0.05);
    const commAmt = hasNoComm ? 3.0 : (Math.round(fareBase * commPercent * 100) / 100);
    const earnings = Math.round((fareBase - commAmt) * 100) / 100;
    const payMode = activeRide.request.payment_mode || "cash";
    const commLabel = hasNoComm ? "No Commission (Flat ₹3)" : (isAuto ? "8%" : "5%");

    let notificationText = "";
    if (payMode === "cash") {
      notificationText = `Collected ₹${fareBase} in cash. Platform commission of ${commLabel} (₹${commAmt}) was deducted from your wallet. Rated customer ${rating} stars.`;
    } else {
      notificationText = `Added ₹${earnings} to your wallet. (Fare: ₹${fareBase} minus platform commission of ${commLabel} of ₹${commAmt}). Rated customer ${rating} stars.`;
    }

    addNotification("trip_complete", "you_earned", "Trip Completed Successfully", notificationText, "earnings", "CheckCircle2");

    // Fetch updated rides list
    try {
      const ridesData = await api.getRides();
      if (Array.isArray(ridesData)) {
        setRidesList(ridesData);
      }
    } catch (e) {
      console.warn("Failed fetching rides inside endActiveRide:", e);
    }

    // Reset ride state
    setActiveRide({
      request: null,
      stage: "pickup",
      otpInput: "",
      currentStepIndex: 0,
      isPaused: false,
      voiceNavEnabled: true,
      reRouted: false,
      completionStep: -1
    });
  };

  const withdrawFunds = async (amount: number, fee: number = 0, walletType: "wallet" | "incentive" | "bonus" = "wallet"): Promise<boolean> => {
    try {
      const res = await api.withdraw(amount, fee, walletType);
      if (res && res.success) {
        setWalletBalance(res.wallet_balance);
        setIncentiveBalance(res.incentive_balance);
        setBonusBalance(res.bonus_balance);
        
        // Fetch latest transactions from backend
        if (phone) {
          const txsData = await api.getUserTransactions(phone);
          if (txsData) {
            const mappedTxs: Transaction[] = txsData.map((tx: any) => ({
              id: String(tx.id),
              titleKey: tx.title.toLowerCase().includes("withdraw") ? "withdraw" : "ride_fare",
              titleEn: tx.title,
              amount: tx.amount,
              date: tx.date || "Just now",
              positive: tx.positive
            }));
            setTransactions(mappedTxs);
          }
        }

        addNotification("withdraw", "withdraw_success", "Withdrawal Successful", `Instant transfer of ₹${amount} initiated.`, "earnings", "ArrowDownToLine");
        return true;
      } else {
        alert(res?.error || "Withdrawal failed");
        return false;
      }
    } catch (err: any) {
      alert(err.message || "Withdrawal failed due to server error");
      return false;
    }
  };

  const purchaseNoCommission = async (planPrice: number, durationDays: number, method: 'wallet' | 'razorpay'): Promise<boolean> => {
    if (!driverId) return false;
    let newBalance = walletBalance;
    if (method === 'wallet') {
      if (walletBalance < planPrice) {
        alert("Insufficient wallet balance.");
        return false;
      }
      newBalance = walletBalance - planPrice;
    }

    const now = Math.floor(Date.now() / 1000);
    const start = noCommissionExpiry > now ? noCommissionExpiry : now;
    const newExpiry = start + (durationDays * 24 * 3600);

    const updatedUser = await api.updateUser(driverId, {
      no_commission_expiry: newExpiry,
      wallet_balance: newBalance
    });

    if (updatedUser) {
      setWalletBalance(newBalance);
      setNoCommissionExpiry(newExpiry);

      const txTitle = method === 'wallet' 
        ? `No Commission Plan (${durationDays} Days) - Wallet`
        : `No Commission Plan (${durationDays} Days) - Razorpay`;
      
      const amtStr = method === 'wallet' ? `-₹${planPrice.toFixed(2)}` : `₹0.00`;

      await api.createTransaction({
        user: driverId,
        title: txTitle,
        amount: amtStr,
        positive: false,
        date: "Today"
      });

      if (phone) {
        const txsData = await api.getUserTransactions(phone);
        if (txsData) {
          const mappedTxs: Transaction[] = txsData.map((tx: any) => ({
            id: String(tx.id),
            titleKey: tx.title.toLowerCase().includes("withdraw") ? "withdraw" : "ride_fare",
            titleEn: tx.title,
            amount: tx.amount,
            date: tx.date || "Just now",
            positive: tx.positive
          }));
          setTransactions(mappedTxs);
        }
      }

      addNotification(
        "subscription",
        "sub_success",
        "No Commission Active",
        `${durationDays} days of no commission plan activated successfully!`,
        "earnings",
        "Trophy"
      );

      return true;
    }
    return false;
  };

  // Support
  const addSupportTicket = (subject: string, message: string) => {
    const newTicket: SupportTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      subject,
      status: "open",
      date: "Today",
      chat: [{ sender: "rider", message, time: "Just now" }],
    };
    setTickets((prev) => [newTicket, ...prev]);
    addNotification("support_center", "complaint_title", "New Dispute Filed", `Ticket created for "${subject}".`, "info", "FileText");
  };

  const addChatMessage = (ticketId: string, message: string, sender: "rider" | "support") => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          return {
            ...t,
            chat: [...t.chat, { sender, message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }],
          };
        }
        return t;
      })
    );
  };

  // Referrals
  const addReferral = (phoneNo: string) => {
    setReferralsList((prev) => [...prev, phoneNo]);
    setReferralEarnings((prev) => prev + 300);
    setBonusBalance((prev) => prev + 300);
    addNotification("refer_title", "invite_earn", "Referral Signup Alert", `Driver ${phoneNo} joined! ₹300 bonus added.`, "earnings", "UserPlus");
  };

  // Notification engine
  const addNotification = (
    titleKey: string,
    subKey: string,
    titleEn: string,
    subEn: string,
    type: NotificationItem["type"],
    iconName: string
  ) => {
    const newNt: NotificationItem = {
      id: `nt-${Date.now()}`,
      titleKey,
      subKey,
      titleEn,
      subEn,
      time: "Now",
      type,
      iconName,
    };
    setNotificationsList((prev) => [newNt, ...prev]);
  };

  const clearNotifications = () => {
    setNotificationsList([]);
  };

  const handleSetProfileName = (name: string) => {
    setProfileName(name);
    localStorage.setItem("namma_name", name);
    if (driverId) {
      api.updateUser(driverId, { name });
    }
  };

  const handleSetEmail = (emailVal: string) => {
    setEmail(emailVal);
    if (driverId) {
      api.updateUser(driverId, { email: emailVal });
    }
  };

  const handleSetGender = (val: string) => {
    setGenderState(val);
    localStorage.setItem("namma_gender", val);
    if (driverId) {
      api.updateUser(driverId, { gender: val });
    }
  };

  const handleSetWomenPriorityMatch = (val: boolean) => {
    setWomenPriorityMatch(val);
    if (driverId) {
      api.updateUser(driverId, { women_priority_match: val });
    }
  };

  const handleSetEmergencyName = (val: string) => {
    setEmergencyName(val);
    if (driverId) {
      api.updateUser(driverId, { emergency_contact_name: val });
    }
  };

  const handleSetEmergencyPhone = (val: string) => {
    setEmergencyPhone(val);
    if (driverId) {
      api.updateUser(driverId, { emergency_contact_phone: val });
    }
  };

  const handleSetNotifPush = (val: boolean) => {
    setNotifPush(val);
    if (driverId) {
      api.updateUser(driverId, { notif_push: val });
    }
  };

  const handleSetNotifIncentives = (val: boolean) => {
    setNotifIncentives(val);
    if (driverId) {
      api.updateUser(driverId, { notif_incentives: val });
    }
  };

  const handleSetOnline = async (val: boolean) => {
    if (val) {
      if (phone) {
        const driver = await api.getUserByPhone(phone, "driver", profileName);
        if (driver) {
          if (driver.kyc_status !== "VERIFIED") {
            alert(`Cannot go online: KYC verification status is ${driver.kyc_status}.`);
            setOnline(false);
            return;
          }
          if (driver.status === "suspended") {
            alert("Cannot go online: Your account is suspended.");
            setOnline(false);
            return;
          }
        }
      }

      const activeVehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0];
      const vehicleApproved = activeVehicle ? activeVehicle.approved : false;
      
      if (kycProgress < 100) {
        alert("Cannot go online: KYC verification is not 100% complete.");
        setOnline(false);
        return;
      }
      if (!vehicleApproved) {
        alert("Cannot go online: Vehicle not approved.");
        setOnline(false);
        return;
      }
    }

    try {
      setOnline(val);
      if (phone) {
        const activeVehType = localStorage.getItem("namma_vehicle_type") || "";
        const driver = await api.getUserByPhone(phone, "driver", profileName, activeVehType);
        if (driver) {
          const res = await api.updateUser(driver.id, { online: val });
          if (!res && val) {
            setOnline(false);
            alert("Failed to change online status. Please check your document approvals.");
          }
        }
      }
    } catch (err: any) {
      setOnline(false);
      alert(`Cannot go online: ${err.message || "Verification requirements not met"}`);
    }
  };

  return (
    <RiderContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        toggleTheme,
        t,
        profileName,
        setProfileName: handleSetProfileName,
        profilePhoto,
        setProfilePhoto,
        phone,
        setPhone,
        email,
        setEmail: handleSetEmail,
        womenPriorityMatch,
        setWomenPriorityMatch: handleSetWomenPriorityMatch,
        womenSafetyVerified,
        rating,
        completedRides,
        online,
        setOnline: handleSetOnline,
        currentAddress,
        sosTriggered,
        triggerSOS,
        cancelSOS,
        availabilitySchedule,
        toggleSchedule,
        driverId,
        kycProgress,
        kycList,
        uploadKYCDoc,
        adminSetKYCStatus,
        vehicles,
        activeVehicleId,
        setActiveVehicleId,
        addVehicle,
        activeRide,
        incomingRequest,
        setIncomingRequest,
        acceptRideRequest,
        rejectRideRequest,
        setRideStage,
        setOtpInput,
        advanceActiveRideStep,
        togglePauseRide,
        voicePromptTriggered,
        setVoicePromptTriggered,
        reportRideIssue,
        endActiveRide,
        rainActive,
        setRainActive,
        floodAlert,
        setFloodAlert,
        lowNetwork,
        setLowNetwork,
        walletBalance,
        incentiveBalance,
        bonusBalance,
        upiId,
        setUpiId,
        bankAccount,
        setBankAccount,
        payoutStatus,
        setPayoutStatus,
        transactions,
        withdrawFunds,
        tickets,
        addSupportTicket,
        addChatMessage,
        referralCode,
        referralsList,
        referralEarnings,
        addReferral,
        notificationsList,
        addNotification,
        clearNotifications,
        token,
        setToken,
        logout,
        manualLocation,
        setManualLocation,
        clearManualLocation,
        noCommissionExpiry,
        purchaseNoCommission,
        gender,
        setGender: handleSetGender,
        emergencyName,
        setEmergencyName: handleSetEmergencyName,
        emergencyPhone,
        setEmergencyPhone: handleSetEmergencyPhone,
        notifPush,
        setNotifPush: handleSetNotifPush,
        notifIncentives,
        setNotifIncentives: handleSetNotifIncentives,
        ridesList,
      }}
    >
      {children}
    </RiderContext.Provider>
  );
};

export const useRider = () => {
  const context = useContext(RiderContext);
  if (!context) throw new Error("useRider must be used within a RiderProvider");
  return context;
};

// Route Protection Check Helper Effect
export function RouteProtection() {
  const navigate = useNavigate();
  const { token, incomingRequest, activeRide } = useRider();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!token && path !== "/login" && path !== "/otp" && path !== "/") {
        navigate({ to: "/login" });
        return;
      }

      if (token) {
        if (incomingRequest && path !== "/ride/request") {
          navigate({ to: "/ride/request" });
        } else if (activeRide.request && path !== "/ride/active") {
          navigate({ to: "/ride/active" });
        }
      }
    }
  }, [token, incomingRequest, activeRide, navigate]);
  return null;
}
