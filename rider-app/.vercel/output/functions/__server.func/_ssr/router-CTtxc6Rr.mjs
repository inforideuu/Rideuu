import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { b as createRouter, a as createRootRouteWithContext, d as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, c as createFileRoute, l as lazyRouteComponent, u as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { I as redirect } from "../_libs/tanstack__router-core.mjs";
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
const appCss = "/assets/styles-xErbFAkE.css";
const translations = {
  en: {
    // Auth & General
    app_name: "Rideuu",
    rider: "Rider",
    built_for_chennai: "BUILT FOR CHENNAI",
    drive_smarter: "Drive smarter.",
    earn_more: "Earn more.",
    sign_in_desc: "Sign in with your registered mobile number to start your shift.",
    mobile_label: "MOBILE NUMBER",
    send_otp: "Send OTP",
    verified_riders_only: "Verified riders only. KYC mandatory under Tamil Nadu transport rules.",
    enter_otp: "Enter the 4-digit OTP",
    otp_sent_to: "Sent to +91",
    change: "Change",
    resend_in: "Didn't get it? Resend in",
    resend_now: "Resend OTP",
    verify_continue: "Verify & Continue",
    biometric_login: "Use Face ID / Touch ID",
    register_new: "Register as a New Rider",
    already_registered: "Already registered? Login",
    full_name: "Full Name",
    email_addr: "Email Address (Optional)",
    vehicle_type: "Vehicle Type",
    auto: "Auto Rickshaw",
    bike: "Bike Taxi",
    // KYC
    kyc_header: "Get verified",
    step_2_of_3: "STEP 2 OF 3",
    kyc_progress: "Verification progress",
    under_review: "Under review",
    verified: "Verified",
    tap_to_upload: "Tap to upload",
    kyc_continue: "Continue to dashboard",
    skip_for_now: "Skip for now",
    aadhaar_pan: "Aadhaar / PAN Card",
    driving_license: "Driving License",
    vehicle_rc: "Vehicle RC & Photo",
    insurance_cert: "Insurance Certificate",
    selfie_face: "Selfie & Face Scan",
    profile_photo: "Profile Photo",
    rejection_alert: "KYC REJECTED BY ADMIN",
    rejection_reason_lbl: "Reason:",
    camera_placeholder: "Camera scan simulated. Smile for face verification!",
    click_selfie: "Take Photo",
    upload_success: "File uploaded successfully!",
    // Dashboard
    you_are_live_in: "You're live in",
    you_are_offline: "You're offline",
    catching_rides: "Catching nearby rides…",
    go_online_start: "Go online to start earning",
    today: "Today",
    trips: "Trips",
    online_time: "Online",
    boost_shift: "Boost your shift",
    rain_bonus_active: "Rain bonus active",
    peak_surge: "Peak surge",
    heatmap: "Heatmap",
    daily_goal: "Daily goal",
    incentives_bonuses: "Incentives & bonuses",
    ratings_reviews: "Ratings & reviews",
    ride_history: "Ride history",
    notifications: "Notifications",
    customer_rating_title: "Customer Rating Received",
    simulate_request: "Simulate incoming ride request",
    sos: "SOS",
    emergency_title: "EMERGENCY SENT",
    emergency_desc: "Sharing GPS coordinates to Chennai Police control room and your emergency contacts.",
    women_only_rides: "Women-only ride priority matching",
    shift_scheduling: "Shift Scheduler",
    current_shift: "Shift: 8 AM - 4 PM",
    availability_toggle: "Available for auto-matching",
    // Ride request
    new_ride: "NEW RIDE REQUEST",
    accept_ride: "Accept ride",
    reject: "Reject",
    customer_waiting: "Customer waiting",
    pickup_distance: "away",
    dropoff: "Drop-off",
    earnings_est: "Earnings",
    women_priority: "Women Safe Ride Priority Matching",
    // Active ride
    head_to_pickup: "HEAD TO PICKUP",
    customer: "Customer",
    arrived_pickup: "Arrived at pickup",
    ride_otp: "RIDE OTP",
    ask_customer_otp: "Ask customer for 4-digit OTP",
    start_trip: "Start trip",
    trip_in_progress: "TRIP IN PROGRESS",
    end_trip: "End trip",
    distance: "Distance",
    eta: "ETA",
    speed: "Speed",
    flood_warning_title: "FLOOD AHEAD DETOUR",
    flood_warning_desc: "Velachery/Usman subway waterlogged. Rerouting via Chennai Flyover (+4 mins)",
    traffic_congested: "Heavy traffic! Shortcut suggested via local street.",
    pause_trip: "Pause ride",
    resume_trip: "Resume ride",
    report_issue: "Report issue",
    voice_navigation: "Turn left towards Usman Road. Google Maps live guidance active.",
    // Ride summary
    trip_complete: "Trip complete",
    trip_fare: "Trip fare",
    surge_mult: "Surge multiplier",
    you_earned: "You earned",
    rate_customer: "Rate customer",
    back_to_dashboard: "Back to dashboard",
    issue_reported_ok: "Dispute ticket created successfully. Support team will review.",
    // Wallet
    available_balance: "Available balance",
    withdraw: "Withdraw",
    statement: "Statement",
    transactions: "Transactions",
    send_to_bank: "Send to bank",
    amount: "AMOUNT",
    confirm_withdrawal: "Confirm withdrawal",
    bank_linked: "HDFC Bank linked",
    upi_linked: "UPI ID linked",
    withdraw_success: "Instant withdrawal request submitted! Transferred to bank.",
    incentive_wallet: "Incentive Wallet",
    bonus_wallet: "Bonus Wallet",
    failed_payout: "Failed payout detected. Tap to retry verification.",
    // Support
    support_center: "Support Center",
    complaint_title: "Submit a Complaint",
    complaint_placeholder: "Describe the dispute or ride problem...",
    chat_support: "Live Support Chat",
    support_welcome: "Hi Rider! How can we help you in Chennai today?",
    payout_dispute: "Payout Delay Dispute",
    ride_fare_dispute: "Ride Fare Dispute",
    // Referral
    refer_title: "Rider Referral System",
    invite_earn: "Invite and Earn",
    referral_code: "Your code:",
    referral_leaderboard: "Leaderboard",
    referral_status: "Referrals signed up",
    // PWA & Networking
    install_pwa: "Install Rider App on Home Screen",
    offline_mode_active: "Offline Mode Active (Low network caching)",
    syncing_background: "Connection restored! Syncing background earnings database..."
  },
  ta: {
    // Auth & General
    app_name: "நம்மரைடு",
    rider: "ஓட்டுனர்",
    built_for_chennai: "சென்னையின் பிரத்யேக சேவை",
    drive_smarter: "புத்திசாலித்தனமாக ஓட்டுங்கள்.",
    earn_more: "அதிகம் சம்பாதியுங்கள்.",
    sign_in_desc: "பயணங்களை தொடங்க உங்களின் பதிவு செய்யப்பட்ட மொபைல் எண்ணுடன் உள்நுழையவும்.",
    mobile_label: "மொபைல் எண்",
    send_otp: "OTP அஞ்சல் செய்க",
    verified_riders_only: "சரிபார்க்கப்பட்ட ஓட்டுநர்கள் மட்டுமே. தமிழக போக்குவரத்து விதிகளின்படி KYC கட்டாயம்.",
    enter_otp: "4-இலக்க OTP எண்ணை உள்ளிடவும்",
    otp_sent_to: "அனுப்பப்பட்ட எண் +91",
    change: "மாற்றுக",
    resend_in: "OTP வரவில்லையா? மீண்டும் பெற",
    resend_now: "OTP மீண்டும் அனுப்பு",
    verify_continue: "சரிபார்த்து தொடர்க",
    biometric_login: "முக அடையாளம் / கைரேகை பயன்படுத்தவும்",
    register_new: "புதிய ஓட்டுநராக பதிவு செய்யவும்",
    already_registered: "ஏற்கனவே பதிவு செய்துள்ளீர்களா? உள்நுழையவும்",
    full_name: "முழு பெயர்",
    email_addr: "மின்னஞ்சல் முகவரி (விரும்பினால்)",
    vehicle_type: "வாகன வகை",
    auto: "ஆட்டோ ரிக்ஷா",
    bike: "பைக் டாக்சி",
    // KYC
    kyc_header: "சரிபார்க்கவும்",
    step_2_of_3: "படி 2 / 3",
    kyc_progress: "சரிபார்ப்பு முன்னேற்றம்",
    under_review: "மதிப்பாய்வில் உள்ளது",
    verified: "சரிபார்க்கப்பட்டது",
    tap_to_upload: "பதிவேற்ற தட்டவும்",
    kyc_continue: "முகப்புப் பக்கத்திற்குச் செல்க",
    skip_for_now: "இப்போதைக்குத் தவிர்",
    aadhaar_pan: "ஆதார் / பான் கார்டு",
    driving_license: "ஓட்டுநர் உரிமம்",
    vehicle_rc: "வாகன RC & புகைப்படம்",
    insurance_cert: "காப்பீட்டு சான்றிதழ்",
    selfie_face: "செல்ஃபி & முக சரிபார்ப்பு",
    profile_photo: "விவரக்குறிப்பு புகைப்படம்",
    rejection_alert: "KYC நிராகரிக்கப்பட்டது",
    rejection_reason_lbl: "காரணம்:",
    camera_placeholder: "கேமரா ஸ்கேன் உருவகப்படுத்தப்பட்டது. முக சரிபார்ப்பிற்கு புன்னகைக்கவும்!",
    click_selfie: "படம் பிடிக்கவும்",
    upload_success: "கோப்பு வெற்றிகரமாக பதிவேற்றப்பட்டது!",
    // Dashboard
    you_are_live_in: "நீங்கள் இங்கே ஆன்லைனில் உள்ளீர்கள்",
    you_are_offline: "நீங்கள் ஆஃப்லைனில் உள்ளீர்கள்",
    catching_rides: "அருகிலுள்ள சவாரிகளைத் தேடுகிறது…",
    go_online_start: "சம்பாதிக்கத் தொடங்க ஆன்லைனில் செல்லவும்",
    today: "இன்று",
    trips: "சவாரிகள்",
    online_time: "ஆன்லைன் நேரம்",
    boost_shift: "உங்களின் வருமானத்தை அதிகரிக்கவும்",
    rain_bonus_active: "மழைக்கால போனஸ் செயலில் உள்ளது",
    peak_surge: "அதிக தேவை நேரம்",
    heatmap: "தேவை வரைபடம்",
    daily_goal: "தினசரி இலக்கு",
    incentives_bonuses: "ஊக்கத்தொகை & போனஸ்",
    ratings_reviews: "மதிப்பீடுகள் & விமர்சனங்கள்",
    ride_history: "சவாரி வரலாறு",
    notifications: "அறிவிப்புகள்",
    customer_rating_title: "வாடிக்கையாளர் மதிப்பீடு பெறப்பட்டது",
    simulate_request: "சவாரி கோரிக்கையை உருவகப்படுத்தவும்",
    sos: "SOS அவசர உதவி",
    emergency_title: "அவசர உதவி அனுப்பப்பட்டது",
    emergency_desc: "ஜிபிஎஸ் இருப்பிடம் சென்னை மாநகர காவல் கட்டுப்பாட்டு அறைக்கும் உங்களின் அவசர தொடர்புகளுக்கும் பகிரப்படுகிறது.",
    women_only_rides: "பெண் பயணிகளின் சவாரி முன்னுரிமை",
    shift_scheduling: "பணி நேர திட்டமிடல்",
    current_shift: "பணி நேரம்: காலை 8 - மாலை 4",
    availability_toggle: "சவாரி ஒதுக்கீட்டிற்கு தயார்",
    // Ride request
    new_ride: "புதிய சவாரி கோரிக்கை",
    accept_ride: "சவாரி ஏற்றுக்கொள்",
    reject: "நிராகரி",
    customer_waiting: "வாடிக்கையாளர் காத்திருக்கிறார்",
    pickup_distance: "தொலைவில்",
    dropoff: "இறங்கும் இடம்",
    earnings_est: "வருமானம்",
    women_priority: "பெண்கள் பாதுகாப்பு சவாரி முன்னுரிமை",
    // Active ride
    head_to_pickup: "பயணியை நோக்கிச் செல்லவும்",
    customer: "பயணி",
    arrived_pickup: "பயணிகளைச் சென்றடைந்தார்",
    ride_otp: "சவாரி OTP",
    ask_customer_otp: "பயணியிடம் 4-இலக்க OTP ஐக் கேட்கவும்",
    start_trip: "பயணத்தை தொடங்கு",
    trip_in_progress: "பயணம் நடைபெறுகிறது",
    end_trip: "பயணத்தை முடி",
    distance: "தூரம்",
    eta: "வருகை நேரம்",
    speed: "வேகம்",
    flood_warning_title: "வெள்ள நீர் எச்சரிக்கை பாதை மாற்றம்",
    flood_warning_desc: "வேளச்சேரி/உஸ்மான் சுரங்கப்பாதையில் தண்ணீர் தேங்கியுள்ளது. மேம்பாலம் வழியாக மாற்றுப்பாதை (+4 நிமிடம்)",
    traffic_congested: "அதிக போக்குவரத்து நெரிசல்! குறுக்கு பாதை பரிந்துரைக்கப்படுகிறது.",
    pause_trip: "பயணத்தை நிறுத்து",
    resume_trip: "பயணத்தை தொடர்",
    report_issue: "சிக்கலை புகாரளி",
    voice_navigation: "உஸ்மான் சாலையை நோக்கி இடதுபுறம் திரும்பவும். கூகிள் மேப்ஸ் நேரடி வழிகாட்டுதல் செயலில் உள்ளது.",
    // Ride summary
    trip_complete: "பயணம் முடிந்தது",
    trip_fare: "சவாரி கட்டணம்",
    surge_mult: "அதிக தேவை கட்டணம்",
    you_earned: "உங்களின் சம்பாத்தியம்",
    rate_customer: "வாடிக்கையாளரை மதிப்பிடுங்கள்",
    back_to_dashboard: "முகப்புப் பக்கத்திற்குத் திரும்பு",
    issue_reported_ok: "சிக்கல் புகார் பதிவு செய்யப்பட்டது. எங்கள் குழு விரைவில் சரிபார்க்கும்.",
    // Wallet
    available_balance: "கிடைக்கக்கூடிய இருப்பு",
    withdraw: "பணம் எடு",
    statement: "அறிக்கை",
    transactions: "பரிவர்த்தனைகள்",
    send_to_bank: "வங்கிக்கு அனுப்பவும்",
    amount: "தொகை",
    confirm_withdrawal: "பணம் எடுப்பதை உறுதிசெய்",
    bank_linked: "HDFC வங்கி இணைக்கப்பட்டுள்ளது",
    upi_linked: "UPI ஐடி இணைக்கப்பட்டுள்ளது",
    withdraw_success: "பணம் எடுப்பதற்கான கோரிக்கை அனுப்பப்பட்டது! உடனடியாக வங்கி கணக்கிற்கு மாற்றப்பட்டது.",
    incentive_wallet: "ஊக்கத்தொகை இருப்பு",
    bonus_wallet: "போனஸ் இருப்பு",
    failed_payout: "பணம் செலுத்துவதில் தோல்வி. சரிபார்க்க தட்டவும்.",
    // Support
    support_center: "ஆதரவு மையம்",
    complaint_title: "புகார் சமர்ப்பிக்கவும்",
    complaint_placeholder: "சவாரி சிக்கலை விவரிக்கவும்...",
    chat_support: "நேரடி அரட்டை உதவி",
    support_welcome: "வணக்கம் ஓட்டுனரே! சென்னை நம்மரைடு உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    payout_dispute: "பணம் பெறுவதில் தாமதம்",
    ride_fare_dispute: "சவாரி கட்டணப் பிரச்சனை",
    // Referral
    refer_title: "ஓட்டுனர் பரிந்துரை முறை",
    invite_earn: "பரிந்துரைத்து சம்பாதிக்கவும்",
    referral_code: "உங்களின் குறியீடு:",
    referral_leaderboard: "மதிப்பீட்டுப் பட்டியல்",
    referral_status: "பதிவு செய்த பரிந்துரைகள்",
    // PWA & Networking
    install_pwa: "முகப்புத் திரையில் ஆப்பை நிறுவவும்",
    offline_mode_active: "ஆஃப்லைன் பயன்முறை செயலில் உள்ளது (குறைந்த நெட்வொர்க் சேமிப்பு)",
    syncing_background: "இணைய தொடர்பு மீட்கப்பட்டது! ஆஃப்லைன் சம்பாத்தியங்களை ஒத்திசைக்கிறது..."
  }
};
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
  const token = typeof window !== "undefined" ? localStorage.getItem("namma_token") : null;
  const headers = {
    ...token ? { "Authorization": `Bearer ${token}` } : {},
    ...options.headers || {}
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
const api = {
  getUsers: () => fetchAPI("/users/"),
  getUserByPhone: (phone, role = "customer", name = "", vehicleType = "") => fetchAPI(`/users/by_phone/?phone=${encodeURIComponent(phone)}&role=${role}&name=${encodeURIComponent(name)}&vehicle_type=${encodeURIComponent(vehicleType)}`),
  getUserByEmail: (email, role = "customer", name = "", vehicleType = "", phone = "") => fetchAPI(`/users/by_email/?email=${encodeURIComponent(email)}&role=${role}&name=${encodeURIComponent(name)}&vehicle_type=${encodeURIComponent(vehicleType)}&phone=${encodeURIComponent(phone)}`),
  updateUser: (id, data) => fetchAPI(`/users/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  updateKYCDoc: (id, data) => fetchAPI(`/kyc/${id}/`, { method: "PATCH", body: data instanceof FormData ? data : JSON.stringify(data) }),
  createKYCDoc: (data) => fetchAPI("/kyc/", { method: "POST", body: data instanceof FormData ? data : JSON.stringify(data) }),
  createVehicle: (data) => fetchAPI("/vehicles/", { method: "POST", body: JSON.stringify(data) }),
  getRides: () => fetchAPI("/rides/"),
  getRide: (id) => fetchAPI(`/rides/${id}/`),
  createRide: (data) => fetchAPI("/rides/", { method: "POST", body: JSON.stringify(data) }),
  updateRide: (id, data) => fetchAPI(`/rides/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  getPendingRides: () => fetchAPI("/rides/pending_requests/"),
  rejectRide: (id) => fetchAPI(`/rides/${id}/reject_ride/`, { method: "POST" }),
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
  sendOtp: (email, role = "driver", action = "login") => fetchAPI("/auth/send-otp/", { method: "POST", body: JSON.stringify({ email, role, action }) }),
  verifyOtp: (email, otp, role = "driver", name = "", sub_role = "", phone = "", address = "", vehicle_type = "auto", vehicle_model = "Bajaj RE Auto", vehicle_plate = "TN 22 BZ 4421", vehicle_color = "Yellow", vehicle_year = "2026", gender = "male") => fetchAPI("/auth/verify-otp/", { method: "POST", body: JSON.stringify({ email, otp, role, name, sub_role, phone, address, vehicle_type, vehicle_model, vehicle_plate, vehicle_color, vehicle_year, gender }) }),
  reverseGeocode: (lat, lon) => fetchAPI(`/location/reverse/?lat=${lat}&lon=${lon}`),
  createSOSAlert: (data) => fetchAPI("/sos_alerts/", { method: "POST", body: JSON.stringify(data) }),
  resolveSOSAlert: (id) => fetchAPI(`/sos_alerts/${id}/resolve/`, { method: "POST" }),
  withdraw: async (amount, fee, wallet_type = "wallet") => {
    const token = typeof window !== "undefined" ? localStorage.getItem("namma_token") : null;
    const res = await fetch(`${BASE_URL}/users/withdraw/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...token ? { "Authorization": `Bearer ${token}` } : {}
      },
      body: JSON.stringify({ amount, fee, wallet_type })
    });
    return await res.json();
  },
  getLeaderboard: () => fetchAPI("/users/leaderboard/"),
  claimReferral: (code) => fetchAPI("/users/claim_referral/", { method: "POST", body: JSON.stringify({ code }) }),
  getReferrals: () => fetchAPI("/users/referrals/")
};
const RiderContext = reactExports.createContext(void 0);
const RiderProvider = ({ children }) => {
  const [language, setLanguageState] = reactExports.useState("en");
  const [theme, setThemeState] = reactExports.useState("light");
  const [driverId, setDriverId] = reactExports.useState(null);
  const [profileName, setProfileName] = reactExports.useState("");
  const [profilePhoto, setProfilePhoto] = reactExports.useState("");
  const [phone, setPhone] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [gender, setGenderState] = reactExports.useState("male");
  const [womenPriorityMatch, setWomenPriorityMatch] = reactExports.useState(false);
  const [womenSafetyVerified, setWomenSafetyVerified] = reactExports.useState(false);
  const [rating, setRating] = reactExports.useState(5);
  const [completedRides, setCompletedRides] = reactExports.useState(0);
  const [emergencyName, setEmergencyName] = reactExports.useState("");
  const [emergencyPhone, setEmergencyPhone] = reactExports.useState("");
  const [notifPush, setNotifPush] = reactExports.useState(true);
  const [notifIncentives, setNotifIncentives] = reactExports.useState(true);
  const [token, setTokenState] = reactExports.useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("namma_token");
    }
    return null;
  });
  const setToken = (newToken) => {
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
  const [online, setOnlineState] = reactExports.useState(false);
  const [currentAddress, setCurrentAddress] = reactExports.useState("T. Nagar Shopping Zone");
  const [manualLocation, setManualLocationState] = reactExports.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("namma_manual_location");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const setManualLocation = async (address, lat, lon) => {
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
          last_location_update: Math.floor(Date.now() / 1e3),
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
  const setOnline = async (val) => {
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
  const [sosTriggered, setSosTriggered] = reactExports.useState(false);
  const [rainActive, setRainActive] = reactExports.useState(false);
  const [floodAlert, setFloodAlert] = reactExports.useState(false);
  const [lowNetwork, setLowNetwork] = reactExports.useState(false);
  const [kycList, setKycList] = reactExports.useState([
    { id: "aadhaar", labelKey: "aadhaar_pan", status: "todo" },
    { id: "license", labelKey: "driving_license", status: "todo" },
    { id: "vehicle", labelKey: "vehicle_rc", status: "todo" },
    { id: "insurance", labelKey: "insurance_cert", status: "todo" },
    { id: "profile_photo", labelKey: "profile_photo", status: "todo" },
    { id: "selfie", labelKey: "selfie_face", status: "todo" }
  ]);
  const [vehicles, setVehicles] = reactExports.useState([]);
  const [activeVehicleId, setActiveVehicleId] = reactExports.useState("");
  const [availabilitySchedule, setAvailabilitySchedule] = reactExports.useState([
    { id: "s1", day: "Monday", hours: "08:00 - 16:00", active: true },
    { id: "s2", day: "Tuesday", hours: "08:00 - 16:00", active: true },
    { id: "s3", day: "Wednesday", hours: "08:00 - 16:00", active: true },
    { id: "s4", day: "Thursday", hours: "18:00 - 02:00 (Night Preference)", active: false },
    { id: "s5", day: "Friday", hours: "08:00 - 16:00", active: true },
    { id: "s6", day: "Saturday", hours: "10:00 - 20:00", active: false },
    { id: "s7", day: "Sunday", hours: "Weekend Off", active: false }
  ]);
  const [walletBalance, setWalletBalance] = reactExports.useState(0);
  const [incentiveBalance, setIncentiveBalance] = reactExports.useState(0);
  const [bonusBalance, setBonusBalance] = reactExports.useState(0);
  const [upiId, setUpiId] = reactExports.useState("");
  const [bankAccount, setBankAccount] = reactExports.useState("");
  const [payoutStatus, setPayoutStatus] = reactExports.useState("success");
  const [transactions, setTransactions] = reactExports.useState([]);
  const [tickets, setTickets] = reactExports.useState([]);
  const [referralCode, setReferralCode] = reactExports.useState("NAMMA4421");
  const [referralsList, setReferralsList] = reactExports.useState([]);
  const [referralEarnings, setReferralEarnings] = reactExports.useState(0);
  const [notificationsList, setNotificationsList] = reactExports.useState([]);
  const [noCommissionExpiry, setNoCommissionExpiry] = reactExports.useState(0);
  const [ridesList, setRidesList] = reactExports.useState([]);
  const [incomingRequest, setIncomingRequest] = reactExports.useState(null);
  const [activeRide, setActiveRide] = reactExports.useState({
    request: null,
    stage: "pickup",
    otpInput: "",
    currentStepIndex: 0,
    isPaused: false,
    voiceNavEnabled: true,
    reRouted: false,
    completionStep: -1
  });
  const [voicePromptTriggered, setVoicePromptTriggered] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const savedLang = localStorage.getItem("namma_lang");
    if (savedLang) setLanguageState(savedLang);
    const savedTheme = localStorage.getItem("namma_theme");
    if (savedTheme) {
      setThemeState(savedTheme);
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
  reactExports.useEffect(() => {
    if (incomingRequest) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
      audio.play().catch((e) => console.warn("Failed to play notification audio:", e));
    }
  }, [incomingRequest]);
  reactExports.useEffect(() => {
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
          audio.play().catch((e) => console.warn("Failed to play kyc audio:", e));
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
          audio.play().catch((e) => console.warn("Failed to play kyc audio:", e));
        }
        localStorage.setItem("last_kyc_status", driver.kyc_status);
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
            audio.play().catch((e) => console.warn("Failed to play warning audio:", e));
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
            driver.status === "suspended" ? driver.wallet_balance < 0 ? `Your account has been suspended due to a negative wallet balance (₹${driver.wallet_balance.toFixed(2)}) persisting for over 2 days. Please clear it immediately.` : "Your account has been suspended by the admin." : "Your account has been blocked due to policy violations.",
            "alert",
            "Ban"
          );
          setOnlineState(false);
          const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav");
          audio.play().catch((e) => console.warn("Failed to play status audio:", e));
        }
        localStorage.setItem("last_driver_status", driver.status);
      }
    }, 6e3);
    return () => clearInterval(interval);
  }, [email, phone, profileName]);
  reactExports.useEffect(() => {
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
        setRating(data.rating !== void 0 && data.rating !== null ? data.rating : 5);
        setCompletedRides(data.completed_rides !== void 0 && data.completed_rides !== null ? data.completed_rides : 0);
        setEmergencyName(data.emergency_contact_name || "");
        setEmergencyPhone(data.emergency_contact_phone || "");
        setNotifPush(data.notif_push !== void 0 ? data.notif_push : true);
        setNotifIncentives(data.notif_incentives !== void 0 ? data.notif_incentives : true);
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
        const txsData = await api.getUserTransactions(activePhone);
        if (txsData) {
          const mappedTxs = txsData.map((tx) => ({
            id: String(tx.id),
            titleKey: tx.title.toLowerCase().includes("withdraw") ? "withdraw" : "ride_fare",
            titleEn: tx.title,
            amount: tx.amount,
            date: tx.date || "Just now",
            positive: tx.positive
          }));
          setTransactions(mappedTxs);
        }
        const ticketsData = await api.getUserTickets(activePhone);
        if (ticketsData) {
          const mappedTickets = ticketsData.map((t2) => ({
            id: String(t2.id),
            subject: t2.subject,
            status: t2.status,
            date: t2.date || "Today",
            chat: t2.chat || []
          }));
          setTickets(mappedTickets);
        }
        if (data.kyc_documents) {
          const defaultKycList = [
            { id: "aadhaar", labelKey: "aadhaar_pan", status: "todo" },
            { id: "license", labelKey: "driving_license", status: "todo" },
            { id: "vehicle", labelKey: "vehicle_rc", status: "todo" },
            { id: "insurance", labelKey: "insurance_cert", status: "todo" },
            { id: "profile_photo", labelKey: "profile_photo", status: "todo" },
            { id: "selfie", labelKey: "selfie_face", status: "todo" }
          ];
          const formattedKyc = defaultKycList.map((defaultItem) => {
            const dbItem = data.kyc_documents.find((d) => d.document_type === defaultItem.id);
            if (dbItem) {
              const statusVal = dbItem.status === "pending" ? "progress" : dbItem.status;
              return {
                ...defaultItem,
                dbId: dbItem.id,
                status: statusVal,
                file: dbItem.file_data || void 0,
                rejectionReason: dbItem.rejection_reason || void 0
              };
            }
            return defaultItem;
          });
          setKycList(formattedKyc);
        }
        if (data.vehicles && data.vehicles.length > 0) {
          const formattedVehicles = data.vehicles.map((v) => ({
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
  reactExports.useEffect(() => {
    if (!email || !token) return;
    api.getUserByEmail(email, "driver", profileName, "", phone).then(async (driver) => {
      if (driver && driver.online !== online) {
        if (online) {
          const url = `${BASE_URL}/users/${driver.id}/`;
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
    let locationInterval = null;
    if (online) {
      const updateLocation = async () => {
        const driver = await api.getUserByEmail(email, "driver", profileName, "", phone);
        if (!driver) return;
        if (manualLocation) {
          api.updateUser(driver.id, {
            current_latitude: manualLocation.latitude,
            current_longitude: manualLocation.longitude,
            last_location_update: Math.floor(Date.now() / 1e3),
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
                last_location_update: Math.floor(Date.now() / 1e3),
                is_available: true,
                online: true
              });
              try {
                const res = await api.reverseGeocode(latitude, longitude);
                if (res && res.address) {
                  const parts = res.address.split(",");
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
                last_location_update: Math.floor(Date.now() / 1e3),
                is_available: true,
                online: true
              });
              try {
                const res = await api.reverseGeocode(mockLat, mockLon);
                if (res && res.address) {
                  const parts = res.address.split(",");
                  const shortAddress = parts[0] + (parts[1] ? `, ${parts[1].trim()}` : "");
                  setCurrentAddress(shortAddress);
                }
              } catch (e) {
                console.warn("Reverse geocode error:", e);
              }
            },
            { enableHighAccuracy: true, timeout: 3e3 }
          );
        } else {
          const mockLat = 13.0827 + (Math.random() - 0.5) * 0.01;
          const mockLon = 80.2707 + (Math.random() - 0.5) * 0.01;
          api.updateUser(driver.id, {
            current_latitude: mockLat,
            current_longitude: mockLon,
            last_location_update: Math.floor(Date.now() / 1e3),
            is_available: true,
            online: true
          });
          try {
            const res = await api.reverseGeocode(mockLat, mockLon);
            if (res && res.address) {
              const parts = res.address.split(",");
              const shortAddress = parts[0] + (parts[1] ? `, ${parts[1].trim()}` : "");
              setCurrentAddress(shortAddress);
            }
          } catch (e) {
            console.warn("Reverse geocode error:", e);
          }
        }
      };
      updateLocation();
      locationInterval = setInterval(updateLocation, 8e3);
    }
    const interval = setInterval(async () => {
      const currentActive = await api.getActiveRide(phone, "driver");
      if (currentActive) {
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
        setActiveRide((prev) => {
          if (prev.request?.id === reqMapped.id) {
            let nextStage = prev.stage;
            if (prev.stage !== "completion") {
              if (["accepted", "RIDER_ASSIGNED", "DRIVER_EN_ROUTE"].includes(currentActive.status)) nextStage = "pickup";
              else if (["otp", "DRIVER_ARRIVED"].includes(currentActive.status)) nextStage = "otp";
              else if (["trip", "RIDE_STARTED"].includes(currentActive.status)) nextStage = "trip";
            }
            const serverCompletionStep = currentActive.completion_step !== void 0 && currentActive.completion_step !== null ? currentActive.completion_step : prev.completionStep;
            return {
              ...prev,
              request: reqMapped,
              stage: nextStage,
              completionStep: serverCompletionStep
            };
          }
          let initialStage = "pickup";
          if (["trip", "RIDE_STARTED"].includes(currentActive.status)) initialStage = "trip";
          else if (["otp", "DRIVER_ARRIVED"].includes(currentActive.status)) initialStage = "otp";
          return {
            request: reqMapped,
            stage: initialStage,
            otpInput: currentActive.otp,
            currentStepIndex: 0,
            isPaused: false,
            voiceNavEnabled: true,
            reRouted: false,
            completionStep: currentActive.completion_step !== void 0 ? currentActive.completion_step : -1
          };
        });
        setIncomingRequest(null);
      } else {
        if (phone) {
          api.getRides().then((rides) => {
            if (rides && rides.length > 0) {
              const latestCompleted = rides.find((r) => r.status === "completed" && r.rating_driver !== null && r.rating_driver !== void 0);
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
          }).catch((err) => console.warn("Failed to check completed ride ratings:", err));
        }
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
    }, 3e3);
    return () => {
      clearInterval(interval);
      if (locationInterval) clearInterval(locationInterval);
    };
  }, [online, phone, profileName, manualLocation]);
  const setLanguage = (lang) => {
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
  const t = (key) => {
    return translations[language][key] || key;
  };
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
          device_info: typeof navigator !== "undefined" ? navigator.userAgent : "Rider App Client",
          speed: 0,
          direction: "North"
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
  const toggleSchedule = (id) => {
    setAvailabilitySchedule((prev) => {
      const next = prev.map((s) => s.id === id ? { ...s, active: !s.active } : s);
      if (driverId) {
        api.updateUser(driverId, { availability_schedule: JSON.stringify(next) });
      }
      return next;
    });
  };
  const kycProgress = reactExports.useMemo(() => {
    let progress = 0;
    const docs = kycList.reduce((acc, doc) => {
      acc[doc.id] = doc.status;
      return acc;
    }, {});
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
  const uploadKYCDoc = async (id, fileData) => {
    setKycList(
      (prev) => prev.map((k) => k.id === id ? { ...k, status: "progress", file: fileData } : k)
    );
    addNotification("kyc_header", "upload_success", "KYC Document Uploaded", `${id.toUpperCase()} file submitted for review.`, "kyc", "Upload");
    let currentDriverId = driverId;
    if (!currentDriverId && phone) {
      const driverObj = await api.getUserByPhone(phone, "driver", profileName);
      if (driverObj) {
        currentDriverId = driverObj.id;
        setDriverId(driverObj.id);
      }
    }
    if (currentDriverId) {
      const userObj = await api.getUserByPhone(phone, "driver", profileName);
      const existingDoc = userObj?.kyc_documents?.find((d) => d.document_type === id);
      if (existingDoc) {
        const res = await api.updateKYCDoc(existingDoc.id, {
          status: "progress",
          file_data: fileData
        });
        if (res && res.id) {
          setKycList(
            (prev) => prev.map((k) => k.id === id ? { ...k, dbId: res.id, status: "progress", file: fileData } : k)
          );
        }
      } else {
        const newDoc = await api.createKYCDoc({
          driver: currentDriverId,
          document_type: id,
          status: "progress",
          file_data: fileData
        });
        if (newDoc && newDoc.id) {
          setKycList(
            (prev) => prev.map((k) => k.id === id ? { ...k, dbId: newDoc.id, status: "progress", file: fileData } : k)
          );
        }
      }
    }
  };
  const adminSetKYCStatus = async (id, status, reason) => {
    setKycList(
      (prev) => prev.map((k) => k.id === id ? { ...k, status, rejectionReason: reason } : k)
    );
    if (status === "done") {
      addNotification("kyc_header", "verified", "KYC Document Approved", `${id.toUpperCase()} approved successfully!`, "kyc", "CheckCircle2");
    } else if (status === "rejected") {
      addNotification("rejection_alert", "rejection_alert", "KYC Rejected", `${id.toUpperCase()} rejected. Reason: ${reason}`, "alert", "ShieldAlert");
    }
    if (driverId) {
      const target = kycList.find((k) => k.id === id);
      let docDbId = target?.dbId;
      const apiStatus = status === "progress" ? "pending" : status === "todo" ? "todo" : status;
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
            setKycList((prev) => prev.map((k) => k.id === id ? { ...k, dbId: newDoc.id } : k));
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
  const addVehicle = async (model, plate, type) => {
    if (!driverId) return;
    const res = await api.createVehicle({
      driver: driverId,
      model,
      plate_number: plate,
      vehicle_type: type,
      insurance_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      pollution_expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      maintenance_days: 30,
      approved: false
    });
    if (res && res.id) {
      const newVeh = {
        id: `veh-${res.id}`,
        model: res.model,
        plateNumber: res.plate_number,
        type: res.vehicle_type,
        insuranceExpiry: res.insurance_expiry,
        pollutionExpiry: res.pollution_expiry,
        maintenanceDays: res.maintenance_days,
        approved: res.approved
      };
      setVehicles((prev) => [...prev, newVeh]);
      setActiveVehicleId(newVeh.id);
    }
  };
  const acceptRideRequest = async () => {
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
      reRouted: false
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
  const setRideStage = async (stage) => {
    setActiveRide((prev) => ({ ...prev, stage }));
    if (activeRide.request && stage !== "completion") {
      const statusMap = { pickup: "DRIVER_EN_ROUTE", otp: "DRIVER_ARRIVED", trip: "RIDE_STARTED" };
      await api.updateRide(activeRide.request.id, { status: statusMap[stage] });
    }
    if (stage === "trip") {
      setVoicePromptTriggered("Heading towards Chennai Anna Nagar West Block. Traffic is light.");
    }
  };
  const setOtpInput = (otp) => {
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
  const reportRideIssue = (issue) => {
    addSupportTicket(`Ride Issue · ${activeRide.request?.customerName || "Priya"}`, issue);
  };
  const endActiveRide = async (rating2) => {
    if (!activeRide.request) return;
    await api.updateRide(activeRide.request.id, { status: "completed", rating_customer: rating2 });
    const driverObj = await api.getUserByPhone(phone, "driver", profileName);
    if (driverObj) {
      setWalletBalance(driverObj.wallet_balance);
      setOnlineState(driverObj.online);
      setCompletedRides(driverObj.completed_rides !== void 0 && driverObj.completed_rides !== null ? driverObj.completed_rides : 0);
      try {
        const txsData = await api.getUserTransactions(phone);
        if (txsData) {
          const mappedTxs = txsData.map((tx) => ({
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
      try {
        const ticketsData = await api.getUserTickets(phone);
        if (ticketsData) {
          const mappedTickets = ticketsData.map((t2) => ({
            id: String(t2.id),
            subject: t2.subject,
            status: t2.status,
            date: t2.date || "Today",
            chat: t2.chat || []
          }));
          setTickets(mappedTickets);
        }
      } catch (e) {
        console.warn("Failed to get tickets:", e);
      }
    }
    const fareBase = activeRide.request.fare;
    const vType = activeRide.request.vehicle_type || "bike";
    const isAuto = vType.toLowerCase().includes("auto");
    const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1e3);
    const commPercent = hasNoComm ? 0 : isAuto ? 0.08 : 0.05;
    const commAmt = hasNoComm ? 3 : Math.round(fareBase * commPercent * 100) / 100;
    const earnings = Math.round((fareBase - commAmt) * 100) / 100;
    const payMode = activeRide.request.payment_mode || "cash";
    const commLabel = hasNoComm ? "No Commission (Flat ₹3)" : isAuto ? "8%" : "5%";
    let notificationText = "";
    if (payMode === "cash") {
      notificationText = `Collected ₹${fareBase} in cash. Platform commission of ${commLabel} (₹${commAmt}) was deducted from your wallet. Rated customer ${rating2} stars.`;
    } else {
      notificationText = `Added ₹${earnings} to your wallet. (Fare: ₹${fareBase} minus platform commission of ${commLabel} of ₹${commAmt}). Rated customer ${rating2} stars.`;
    }
    addNotification("trip_complete", "you_earned", "Trip Completed Successfully", notificationText, "earnings", "CheckCircle2");
    try {
      const ridesData = await api.getRides();
      if (Array.isArray(ridesData)) {
        setRidesList(ridesData);
      }
    } catch (e) {
      console.warn("Failed fetching rides inside endActiveRide:", e);
    }
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
  const withdrawFunds = async (amount, fee = 0, walletType = "wallet") => {
    try {
      const res = await api.withdraw(amount, fee, walletType);
      if (res && res.success) {
        setWalletBalance(res.wallet_balance);
        setIncentiveBalance(res.incentive_balance);
        setBonusBalance(res.bonus_balance);
        if (phone) {
          const txsData = await api.getUserTransactions(phone);
          if (txsData) {
            const mappedTxs = txsData.map((tx) => ({
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
    } catch (err) {
      alert(err.message || "Withdrawal failed due to server error");
      return false;
    }
  };
  const purchaseNoCommission = async (planPrice, durationDays, method) => {
    if (!driverId) return false;
    let newBalance = walletBalance;
    if (method === "wallet") {
      if (walletBalance < planPrice) {
        alert("Insufficient wallet balance.");
        return false;
      }
      newBalance = walletBalance - planPrice;
    }
    const now = Math.floor(Date.now() / 1e3);
    const start = noCommissionExpiry > now ? noCommissionExpiry : now;
    const newExpiry = start + durationDays * 24 * 3600;
    const updatedUser = await api.updateUser(driverId, {
      no_commission_expiry: newExpiry,
      wallet_balance: newBalance
    });
    if (updatedUser) {
      setWalletBalance(newBalance);
      setNoCommissionExpiry(newExpiry);
      const txTitle = method === "wallet" ? `No Commission Plan (${durationDays} Days) - Wallet` : `No Commission Plan (${durationDays} Days) - Razorpay`;
      const amtStr = method === "wallet" ? `-₹${planPrice.toFixed(2)}` : `₹0.00`;
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
          const mappedTxs = txsData.map((tx) => ({
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
  const addSupportTicket = (subject, message) => {
    const newTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      subject,
      status: "open",
      date: "Today",
      chat: [{ sender: "rider", message, time: "Just now" }]
    };
    setTickets((prev) => [newTicket, ...prev]);
    addNotification("support_center", "complaint_title", "New Dispute Filed", `Ticket created for "${subject}".`, "info", "FileText");
  };
  const addChatMessage = (ticketId, message, sender) => {
    setTickets(
      (prev) => prev.map((t2) => {
        if (t2.id === ticketId) {
          return {
            ...t2,
            chat: [...t2.chat, { sender, message, time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]
          };
        }
        return t2;
      })
    );
  };
  const addReferral = (phoneNo) => {
    setReferralsList((prev) => [...prev, phoneNo]);
    setReferralEarnings((prev) => prev + 300);
    setBonusBalance((prev) => prev + 300);
    addNotification("refer_title", "invite_earn", "Referral Signup Alert", `Driver ${phoneNo} joined! ₹300 bonus added.`, "earnings", "UserPlus");
  };
  const addNotification = (titleKey, subKey, titleEn, subEn, type, iconName) => {
    const newNt = {
      id: `nt-${Date.now()}`,
      titleKey,
      subKey,
      titleEn,
      subEn,
      time: "Now",
      type,
      iconName
    };
    setNotificationsList((prev) => [newNt, ...prev]);
  };
  const clearNotifications = () => {
    setNotificationsList([]);
  };
  const handleSetProfileName = (name) => {
    setProfileName(name);
    localStorage.setItem("namma_name", name);
    if (driverId) {
      api.updateUser(driverId, { name });
    }
  };
  const handleSetEmail = (emailVal) => {
    setEmail(emailVal);
    if (driverId) {
      api.updateUser(driverId, { email: emailVal });
    }
  };
  const handleSetGender = (val) => {
    setGenderState(val);
    localStorage.setItem("namma_gender", val);
    if (driverId) {
      api.updateUser(driverId, { gender: val });
    }
  };
  const handleSetWomenPriorityMatch = (val) => {
    setWomenPriorityMatch(val);
    if (driverId) {
      api.updateUser(driverId, { women_priority_match: val });
    }
  };
  const handleSetEmergencyName = (val) => {
    setEmergencyName(val);
    if (driverId) {
      api.updateUser(driverId, { emergency_contact_name: val });
    }
  };
  const handleSetEmergencyPhone = (val) => {
    setEmergencyPhone(val);
    if (driverId) {
      api.updateUser(driverId, { emergency_contact_phone: val });
    }
  };
  const handleSetNotifPush = (val) => {
    setNotifPush(val);
    if (driverId) {
      api.updateUser(driverId, { notif_push: val });
    }
  };
  const handleSetNotifIncentives = (val) => {
    setNotifIncentives(val);
    if (driverId) {
      api.updateUser(driverId, { notif_incentives: val });
    }
  };
  const handleSetOnline = async (val) => {
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
      const activeVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0];
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
    } catch (err) {
      setOnline(false);
      alert(`Cannot go online: ${err.message || "Verification requirements not met"}`);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    RiderContext.Provider,
    {
      value: {
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
        ridesList
      },
      children
    }
  );
};
const useRider = () => {
  const context = reactExports.useContext(RiderContext);
  if (!context) throw new Error("useRider must be used within a RiderProvider");
  return context;
};
function RouteProtection() {
  const navigate = useNavigate();
  const { token, incomingRequest, activeRide } = useRider();
  reactExports.useEffect(() => {
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
const Route$j = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#facc15" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Rideuu Driver" },
      { title: "Rideuu Driver — Chennai" },
      { name: "description", content: "Chennai's professional on-demand driver and rider booking app." },
      { name: "author", content: "Rideuu" },
      { property: "og:title", content: "Rideuu Driver — Chennai" },
      { property: "og:description", content: "Join Chennai's professional driver network on demand." },
      { property: "og:type", content: "website" }
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
  const { queryClient } = Route$j.useRouteContext();
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(RiderProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(RouteProtection, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
  ] });
}
const $$splitComponentImporter$i = () => import("./wallet-BFsOu0JM.mjs");
const Route$i = createFileRoute("/wallet")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./support-DThvY3vN.mjs");
const Route$h = createFileRoute("/support")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./referral-B7ZndMtb.mjs");
const Route$g = createFileRoute("/referral")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./ratings-Dt9uDMSm.mjs");
const Route$f = createFileRoute("/ratings")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./profile-BP17LRRK.mjs");
const Route$e = createFileRoute("/profile")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./otp-bKvU4ct9.mjs");
const Route$d = createFileRoute("/otp")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./notifications-DQeEbSTM.mjs");
const Route$c = createFileRoute("/notifications")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./login-CN4lAuno.mjs");
const Route$b = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Rider Login — Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./kyc-DOCooaLp.mjs");
const Route$a = createFileRoute("/kyc")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./incentives-CyodXewK.mjs");
const Route$9 = createFileRoute("/incentives")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./history-Cu_WKD-J.mjs");
const Route$8 = createFileRoute("/history")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./earnings-WmzGZ7Pg.mjs");
const Route$7 = createFileRoute("/earnings")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./dashboard-BB-7E2xb.mjs");
const Route$6 = createFileRoute("/dashboard")({
  head: () => ({
    meta: [{
      title: "Rider Dashboard — Rideuu"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./index-BTU5dmpx.mjs");
const Route$5 = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/login"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./wallet.index-Bl6Asfh_.mjs");
const Route$4 = createFileRoute("/wallet/")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./wallet.withdraw-DjaoOUQJ.mjs");
const Route$3 = createFileRoute("/wallet/withdraw")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./ride.summary-3jUHb-pL.mjs");
const Route$2 = createFileRoute("/ride/summary")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./ride.request-Dfif6xsU.mjs");
const Route$1 = createFileRoute("/ride/request")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./ride.active-BsBV5qnJ.mjs");
const Route = createFileRoute("/ride/active")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const WalletRoute = Route$i.update({
  id: "/wallet",
  path: "/wallet",
  getParentRoute: () => Route$j
});
const SupportRoute = Route$h.update({
  id: "/support",
  path: "/support",
  getParentRoute: () => Route$j
});
const ReferralRoute = Route$g.update({
  id: "/referral",
  path: "/referral",
  getParentRoute: () => Route$j
});
const RatingsRoute = Route$f.update({
  id: "/ratings",
  path: "/ratings",
  getParentRoute: () => Route$j
});
const ProfileRoute = Route$e.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => Route$j
});
const OtpRoute = Route$d.update({
  id: "/otp",
  path: "/otp",
  getParentRoute: () => Route$j
});
const NotificationsRoute = Route$c.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => Route$j
});
const LoginRoute = Route$b.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$j
});
const KycRoute = Route$a.update({
  id: "/kyc",
  path: "/kyc",
  getParentRoute: () => Route$j
});
const IncentivesRoute = Route$9.update({
  id: "/incentives",
  path: "/incentives",
  getParentRoute: () => Route$j
});
const HistoryRoute = Route$8.update({
  id: "/history",
  path: "/history",
  getParentRoute: () => Route$j
});
const EarningsRoute = Route$7.update({
  id: "/earnings",
  path: "/earnings",
  getParentRoute: () => Route$j
});
const DashboardRoute = Route$6.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$j
});
const IndexRoute = Route$5.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$j
});
const WalletIndexRoute = Route$4.update({
  id: "/",
  path: "/",
  getParentRoute: () => WalletRoute
});
const WalletWithdrawRoute = Route$3.update({
  id: "/withdraw",
  path: "/withdraw",
  getParentRoute: () => WalletRoute
});
const RideSummaryRoute = Route$2.update({
  id: "/ride/summary",
  path: "/ride/summary",
  getParentRoute: () => Route$j
});
const RideRequestRoute = Route$1.update({
  id: "/ride/request",
  path: "/ride/request",
  getParentRoute: () => Route$j
});
const RideActiveRoute = Route.update({
  id: "/ride/active",
  path: "/ride/active",
  getParentRoute: () => Route$j
});
const WalletRouteChildren = {
  WalletWithdrawRoute,
  WalletIndexRoute
};
const WalletRouteWithChildren = WalletRoute._addFileChildren(WalletRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  DashboardRoute,
  EarningsRoute,
  HistoryRoute,
  IncentivesRoute,
  KycRoute,
  LoginRoute,
  NotificationsRoute,
  OtpRoute,
  ProfileRoute,
  RatingsRoute,
  ReferralRoute,
  SupportRoute,
  WalletRoute: WalletRouteWithChildren,
  RideActiveRoute,
  RideRequestRoute,
  RideSummaryRoute
};
const routeTree = Route$j._addFileChildren(rootRouteChildren)._addFileTypes();
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
  BASE_URL as B,
  api as a,
  router as r,
  useRider as u
};
