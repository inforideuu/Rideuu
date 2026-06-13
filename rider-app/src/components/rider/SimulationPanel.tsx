import React, { useState } from "react";
import { useRider, RideRequest } from "../../context/RiderContext";
import { Sliders, CloudRain, Shield, AlertCircle, Sparkles, Check, X, Bell, UserPlus, HelpCircle } from "lucide-react";

export const SimulationPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    rainActive, setRainActive,
    floodAlert, setFloodAlert,
    lowNetwork, setLowNetwork,
    adminSetKYCStatus,
    setIncomingRequest,
    addReferral,
    addNotification,
    setPayoutStatus,
    activeRide,
    language
  } = useRider();

  const [rejReason, setRejReason] = useState("License details unclear. Upload high-res photo.");

  const triggerRequest = (type: "standard" | "surge" | "female" | "rain" | "fake") => {
    if (type === "fake") {
      // Create request, then trigger cancellation 2 seconds later
      const req: RideRequest = {
        id: `req-${Date.now()}`,
        fare: 80,
        distance: 1.8,
        duration: 8,
        pickup: "Usman Road Subway",
        pickupSub: "T. Nagar Depot",
        dropoff: "Panagal Park",
        dropoffSub: "Landmark: Chennai Silks",
        customerName: "Sanjay (Fake Profile)",
        customerRating: 2.1,
        isFemaleOnly: false,
        surgeMultiplier: 1.0,
        rainBonus: 0,
      };
      setIncomingRequest(req);
      addNotification("app_name", "new_ride", "Incoming request detected", "Analyzing booking integrity...", "info", "Shield");

      setTimeout(() => {
        setIncomingRequest(null);
        addNotification("SOS", "fake_booking_detected", "FRAUD ALERT: Fake Booking Blocked", "System automatically cancelled ride request from suspicious user ID.", "safety", "ShieldAlert");
      }, 3500);

      setIsOpen(false);
      return;
    }

    let req: RideRequest = {
      id: `req-${Date.now()}`,
      fare: 120,
      distance: 4.2,
      duration: 18,
      pickup: "T.Nagar Bus Depot",
      pickupSub: "Usman Road · 2.1 km away",
      dropoff: "Anna Nagar W Block",
      dropoffSub: "Drop-off · landmark: behind Saravana Stores",
      customerName: "Priya",
      customerRating: 4.8,
      isFemaleOnly: false,
      surgeMultiplier: 1.0,
      rainBonus: 0,
    };

    if (type === "surge") {
      req.fare = 150;
      req.surgeMultiplier = 1.8;
      req.customerName = "Arjun";
      req.customerRating = 4.9;
    } else if (type === "female") {
      req.fare = 130;
      req.customerName = "Meena (Female Rider Match)";
      req.customerRating = 4.7;
      req.isFemaleOnly = true;
      req.surgeMultiplier = 1.2;
    } else if (type === "rain") {
      req.fare = 140;
      req.customerName = "Senthil";
      req.customerRating = 4.5;
      req.rainBonus = 40;
      req.pickup = "Velachery Lake View Road";
      req.pickupSub = "Flood zone · 3 km away";
      setRainActive(true);
      setFloodAlert(true);
    }

    setIncomingRequest(req);
    setIsOpen(false);

    // Audio alarm simulation
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(580, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.log("Audio simulation blocked by user interaction");
    }
  };

  const notifyTester = (type: "kyc" | "incentive" | "danger") => {
    if (type === "kyc") {
      addNotification(
        "kyc_header",
        "verified",
        "KYC VERIFICATION COMPLETE",
        "Congratulations! Your riding credentials have been approved by the Admin.",
        "kyc",
        "CheckCircle2"
      );
      // set all KYC documents verified
      adminSetKYCStatus("aadhaar", "done");
      adminSetKYCStatus("license", "done");
      adminSetKYCStatus("vehicle", "done");
      adminSetKYCStatus("insurance", "done");
      adminSetKYCStatus("selfie", "done");
    } else if (type === "incentive") {
      addNotification(
        "incentives_bonuses",
        "bonus_wallet",
        "CONSECUTIVE TRIP BONUS CREDITED",
        "Completed 3 peak hour rides! ₹300 incentive credited to wallet.",
        "earnings",
        "Zap"
      );
    } else if (type === "danger") {
      addNotification(
        "sos",
        "unsafe_zone_warnings",
        "SAFETY ALERT: Red Zone Active",
        "Heavy water logging in Velachery Usman subway. Avoid speed routes.",
        "safety",
        "ShieldAlert"
      );
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-12 w-12 rounded-full bg-slate-900 border border-white/20 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition"
        style={{
          boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)",
        }}
      >
        <Sliders className="h-5 w-5 animate-pulse text-primary" />
      </button>

      {/* Expanded Dashboard Panel */}
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-80 max-h-[80vh] overflow-y-auto rounded-3xl bg-slate-950/95 border border-white/10 p-5 shadow-2xl backdrop-blur-xl text-white slide-up">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span className="font-bold text-sm tracking-wide">Rideuu SIMULATOR</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-3">
            1. Trigger Ride Scenarios
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              onClick={() => triggerRequest("standard")}
              className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-left hover:bg-white/10 transition"
            >
              Standard Ride
            </button>
            <button
              onClick={() => triggerRequest("surge")}
              className="py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-left hover:bg-white/10 text-primary transition"
            >
              Peak Surge (1.8x)
            </button>
            <button
              onClick={() => triggerRequest("female")}
              className="py-2 px-3 rounded-xl bg-pink-950/40 border border-pink-500/20 text-xs font-semibold text-left text-pink-300 hover:bg-pink-900/40 transition"
            >
              Women Match
            </button>
            <button
              onClick={() => triggerRequest("rain")}
              className="py-2 px-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs font-semibold text-left text-blue-300 hover:bg-blue-900/40 transition"
            >
              Velachery Rain
            </button>
            <button
              onClick={() => triggerRequest("fake")}
              className="col-span-2 py-2 px-3 rounded-xl bg-yellow-950/40 border border-yellow-500/20 text-xs font-semibold text-center text-yellow-300 hover:bg-yellow-900/40 transition flex items-center justify-center gap-1.5"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Fake Booking Attack
            </button>
          </div>

          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-3">
            2. Weather & Environment
          </p>
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between bg-white/5 rounded-xl p-2.5">
              <span className="text-xs flex items-center gap-1.5">
                <CloudRain className="h-4 w-4 text-blue-400" /> Rain Emergency Bonus
              </span>
              <button
                onClick={() => setRainActive(!rainActive)}
                className={`h-5 w-9 rounded-full transition relative ${rainActive ? "bg-blue-500" : "bg-white/10"}`}
              >
                <span className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition ${rainActive ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/5 rounded-xl p-2.5">
              <span className="text-xs flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-yellow-500" /> Chennai Flood Overlays
              </span>
              <button
                onClick={() => setFloodAlert(!floodAlert)}
                className={`h-5 w-9 rounded-full transition relative ${floodAlert ? "bg-yellow-500" : "bg-white/10"}`}
              >
                <span className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition ${floodAlert ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>

            <div className="flex items-center justify-between bg-white/5 rounded-xl p-2.5">
              <span className="text-xs flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-orange-500" /> Low Network / Offline Mode
              </span>
              <button
                onClick={() => setLowNetwork(!lowNetwork)}
                className={`h-5 w-9 rounded-full transition relative ${lowNetwork ? "bg-orange-500" : "bg-white/10"}`}
              >
                <span className={`h-4 w-4 rounded-full bg-white absolute top-0.5 transition ${lowNetwork ? "left-4.5" : "left-0.5"}`} />
              </button>
            </div>
          </div>

          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-2">
            3. Adjust Driver KYC Approval
          </p>
          <div className="space-y-1.5 mb-4">
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => adminSetKYCStatus("license", "done")}
                className="py-1 bg-green-500/20 text-green-300 border border-green-500/30 rounded text-[10px] font-bold"
              >
                Verify DL
              </button>
              <button
                onClick={() => adminSetKYCStatus("license", "progress")}
                className="py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded text-[10px] font-bold"
              >
                Review DL
              </button>
              <button
                onClick={() => adminSetKYCStatus("license", "rejected", rejReason)}
                className="py-1 bg-red-500/20 text-red-300 border border-red-500/30 rounded text-[10px] font-bold"
              >
                Reject DL
              </button>
            </div>
            <input
              type="text"
              value={rejReason}
              onChange={(e) => setRejReason(e.target.value)}
              placeholder="Custom Rejection Reason"
              className="w-full text-[10px] bg-slate-900 border border-white/10 p-1.5 rounded outline-none"
            />
          </div>

          <p className="text-[10px] text-white/50 uppercase tracking-widest font-semibold mb-3">
            4. Simulation Events
          </p>
          <div className="space-y-2">
            <button
              onClick={() => notifyTester("kyc")}
              className="w-full py-2 bg-emerald-900/40 border border-emerald-500/20 text-xs font-semibold text-emerald-200 rounded-xl hover:bg-emerald-850/40 transition flex items-center justify-center gap-2"
            >
              <Check className="h-3.5 w-3.5" /> Approve Full KYC Status
            </button>

            <button
              onClick={() => notifyTester("incentive")}
              className="w-full py-2 bg-indigo-900/40 border border-indigo-500/20 text-xs font-semibold text-indigo-200 rounded-xl hover:bg-indigo-850/40 transition flex items-center justify-center gap-2"
            >
              <Bell className="h-3.5 w-3.5 text-indigo-400" /> Send Target Bonus Alert
            </button>

            <button
              onClick={() => notifyTester("danger")}
              className="w-full py-2 bg-red-950/40 border border-red-500/20 text-xs font-semibold text-red-200 rounded-xl hover:bg-red-900/40 transition flex items-center justify-center gap-2"
            >
              <AlertCircle className="h-3.5 w-3.5 text-red-500" /> Send Subway Flood Alert
            </button>

            <button
              onClick={() => addReferral("+91 95000 12345")}
              className="w-full py-2 bg-cyan-900/40 border border-cyan-500/20 text-xs font-semibold text-cyan-200 rounded-xl hover:bg-cyan-850/40 transition flex items-center justify-center gap-2"
            >
              <UserPlus className="h-3.5 w-3.5 text-cyan-400" /> Simulate Referral Signup (+₹300)
            </button>

            <button
              onClick={() => setPayoutStatus("failed")}
              className="w-full py-2 bg-rose-950/60 border border-rose-500/30 text-xs font-semibold text-rose-200 rounded-xl hover:bg-rose-900/60 transition flex items-center justify-center gap-2"
            >
              <X className="h-3.5 w-3.5 text-red-400" /> Trigger Settlement Failure
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
