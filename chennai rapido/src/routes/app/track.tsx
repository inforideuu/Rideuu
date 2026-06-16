import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft, MessageCircle, Phone, Share2, ShieldAlert, Star,
  MapPin, Check, ShieldCheck, Send, Compass, Zap, HelpCircle, Navigation
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppStore, store, translate } from "@/lib/store";
import { RealTimeMap } from "../../components/RealTimeMap";
import { api } from "@/lib/api";

export const Route = createFileRoute("/app/track")({
  head: () => ({ meta: [{ title: "Live ride · Rideuu" }] }),
  component: Track,
});

function Track() {
  const { language, theme, ride, chatMessages, trustedContacts, avoidUnlit, prioritizeHighways, patrolRoutes } = useAppStore();
  const navigate = useNavigate();

  // local UI states
  const [showChat, setShowChat] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);

  const [completedFlowStep, setCompletedFlowStep] = useState<
    "trip_completed" | "final_fare" | "payment" | "payment_success" | "rate_driver" | "trip_summary" | null
  >(null);
  const [driverRating, setDriverRating] = useState(5);
  const [ratingHover, setRatingHover] = useState<number | null>(null);
  const [paymentMode, setPaymentMode] = useState<"wallet" | "upi" | "cash">("wallet");
  const { wallet } = useAppStore();

  const calculateTrackDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const displayDistance = ride.distance 
    ? `${ride.distance} km`
    : (ride.pickupCoords && ride.dropCoords
      ? `${calculateTrackDistance(ride.pickupCoords.lat, ride.pickupCoords.lon, ride.dropCoords.lat, ride.dropCoords.lon)} km`
      : "4.2 km");

  const platformFee = ride.vehicle === "bike" ? 3 : 5;
  const isSurge = ride.surgeApplied;
  const totalFare = ride.negotiatedPrice;
  const discount = ride.discount || 0;
  const undiscountedTotal = totalFare + discount;
  const baseRidePrice = isSurge ? Math.round((undiscountedTotal - platformFee) / 1.2) : undiscountedTotal - platformFee;
  const surgeAmt = isSurge ? undiscountedTotal - baseRidePrice - platformFee : 0;

  useEffect(() => {
    let active = true;
    async function fetchNearby() {
      try {
        const users = await api.getUsers() || [];
        if (!active) return;
        const eligible = users.filter((u: any) => {
          if (u.role !== "driver") return false;
          if (u.status !== "active" && u.status !== "new") return false; // Allow newly registered drivers who are online/available
          if (u.kyc_status !== "VERIFIED") return false;
          if (!u.online && !u.is_online) return false;
          const activeMatch = u.active_vehicle_type ? (u.active_vehicle_type === ride.vehicle) : true;
          if (!activeMatch) return false;
          const hasMatchingVehicle = u.vehicles && u.vehicles.some((v: any) => v.vehicle_type === ride.vehicle);
          if (!hasMatchingVehicle) return false;
          return true;
        });
        const rideIdInt = parseInt(ride.id || "") || 1;
        const mapped = eligible.map((d: any, idx: number) => {
          const distInMeters = 300 + ((d.id * 17 + rideIdInt * 31) % 2000);
          const distanceStr = distInMeters >= 1000 ? `${(distInMeters / 1000).toFixed(1)}km` : `${distInMeters}m`;
          return {
            ...d,
            distanceVal: distInMeters,
            distanceStr
          };
        }).sort((a: any, b: any) => a.distanceVal - b.distanceVal);
        setNearbyDrivers(mapped);
      } catch (err) {
        console.error("Failed to load nearby drivers:", err);
      }
    }

    if (ride.step === "searching" || ride.step === "matching") {
      fetchNearby();
      const interval = setInterval(fetchNearby, 3000);
      return () => {
        active = false;
        clearInterval(interval);
      };
    }
  }, [ride.step, ride.vehicle]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const t = (key: string) => translate(key, language);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (showChat) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showChat]);

  // Handle simulations
  const handleVerifyOtp = () => {
    // Manually trigger trip start in store
    store.startTrip();
  };

  const handleSendChat = () => {
    if (!msgText.trim()) return;
    store.sendChatMessage(msgText);
    setMsgText("");
  };

  const handleShareTrip = () => {
    const shareUrl = `${window.location.origin}/app/track?rideId=${ride.id || 'live'}`;
    const shareText = `I'm on a Rideuu! Track my live trip here: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: "Track my Rideuu",
        text: shareText,
        url: shareUrl,
      }).catch(err => console.log("Error sharing", err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedLink(true);
        setShowShareToast(true);
        setTimeout(() => {
          setCopiedLink(false);
          setShowShareToast(false);
        }, 3000);
      }).catch(err => console.error("Could not copy text: ", err));
    }
  };

  const handleTriggerSos = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          store.triggerSos(
            pos.coords.latitude,
            pos.coords.longitude,
            pos.coords.speed || 0,
            pos.coords.heading ? String(pos.coords.heading) : 'North'
          );
        },
        () => {
          store.triggerSos(ride.pickupCoords?.lat || 13.0382, ride.pickupCoords?.lon || 80.2785, 0, 'North');
        }
      );
    } else {
      store.triggerSos(ride.pickupCoords?.lat || 13.0382, ride.pickupCoords?.lon || 80.2785, 0, 'North');
    }
    navigate({ to: "/app/safety" });
  };

  // SVG coordinate interpolation along the path for animated marker
  useEffect(() => {
    // Dummy effect to force redraw on progress change
  }, [ride.progress]);

  // Visual coordinates for SVG path representing the Chennai transit
  const getCoordinates = (pct: number) => {
    // Start at Besant Nagar, move to Mylapore, drop at T Nagar
    // Path points: P1(50, 240) -> P2(160, 180) -> P3(260, 110) -> P4(320, 60)
    const p1 = { x: 50, y: 240 };
    const p2 = { x: 160, y: 180 };
    const p3 = { x: 260, y: 110 };
    const p4 = { x: 320, y: 60 };

    if (pct < 33) {
      const factor = pct / 33;
      return {
        x: p1.x + (p2.x - p1.x) * factor,
        y: p1.y + (p2.y - p1.y) * factor,
      };
    } else if (pct < 66) {
      const factor = (pct - 33) / 33;
      return {
        x: p2.x + (p3.x - p2.x) * factor,
        y: p2.y + (p3.y - p2.y) * factor,
      };
    } else {
      const factor = (pct - 66) / 34;
      return {
        x: p3.x + (p4.x - p3.x) * factor,
        y: p3.y + (p4.y - p3.y) * factor,
      };
    }
  };

  const currentPos = getCoordinates(ride.progress);

  // Map backend completion_step (0-6) to the corresponding customer-facing flow step
  useEffect(() => {
    if (ride.completion_step !== undefined && ride.completion_step >= 0) {
      const step = ride.completion_step;
      if (step === 0) {
        setCompletedFlowStep("trip_completed");
      } else if (step === 1) {
        setCompletedFlowStep("final_fare");
      } else if (step === 2) {
        setCompletedFlowStep("payment");
      } else if (step === 3) {
        setCompletedFlowStep("payment_success");
      } else if (step === 4) {
        setCompletedFlowStep("rate_driver");
      } else if (step >= 5) {
        setCompletedFlowStep("trip_summary");
      }
    } else if (ride.step === "completed" && !completedFlowStep) {
      setCompletedFlowStep("trip_completed");
    }
  }, [ride.completion_step, ride.step]);

  return (
    <div className="relative min-h-dvh text-foreground transition-colors duration-300">

      {/* 1. Interactive Animated Route Map */}
      <div className="relative h-[48dvh] overflow-hidden bg-slate-950">

        {/* Top Floating Controls */}
        <div className="absolute inset-x-0 top-10 z-30 flex items-center justify-between px-4">
          <button
            onClick={() => store.resetBooking()}
            className="grid size-10 place-items-center rounded-xl border border-white/10 bg-black/60 text-white backdrop-blur-md shadow hover:bg-black/80 transition"
          >
            <ArrowLeft className="size-4" />
          </button>

          <button
            onClick={handleTriggerSos}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black text-white shadow-lg transition active:scale-95 ${ride.isSosTriggered ? "bg-emerald-600 shadow-emerald-600/30" : "bg-destructive animate-pulse shadow-destructive/30"}`}
          >
            <ShieldAlert className="size-4" /> {ride.isSosTriggered ? "SOS ACTIVE" : "PRESS SOS"}
          </button>
        </div>

        {/* Interactive Leaflet Map */}
        <RealTimeMap
          pickupCoords={ride.step === "arriving" && ride.driver?.lat && ride.driver?.lng
            ? { lat: ride.driver.lat, lon: ride.driver.lng }
            : ride.pickupCoords}
          dropCoords={ride.step === "arriving" ? ride.pickupCoords : ride.dropCoords}
          progress={ride.progress}
          nearbyDrivers={nearbyDrivers}
        />

        {/* Dynamic ETA Pill overlay */}
        <div className="absolute left-1/2 top-24 -translate-x-1/2 rounded-full border border-white/10 bg-black/75 px-4.5 py-2 text-xs font-extrabold text-white backdrop-blur-md shadow-xl flex items-center gap-2">
          {ride.step === "arriving" && (
            <>
              <span className="size-2 rounded-full bg-primary animate-ping" />
              <span>Arriving in <strong className="text-primary">3 min</strong></span>
            </>
          )}
          {ride.step === "ongoing" && (
            <>
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>In Transit · Speed <strong className="text-emerald-400">{ride.speed} km/h</strong></span>
            </>
          )}
          {ride.step === "completed" && (
            <>
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-400 font-black">Ride Finished Successfully!</span>
            </>
          )}
          {ride.step === "cancelled" && (
            <span className="text-destructive font-black">Ride Cancelled</span>
          )}
        </div>
      </div>

      {/* 2. Interactive Driver and Trip status Bottom Panel */}
      <div className="-mt-6 relative z-30 rounded-t-3xl border border-border bg-background p-5 shadow-2xl transition-colors duration-300">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-muted" />

        {ride.driver ? (
          completedFlowStep ? (
            <div className="space-y-5 text-center py-2 animate-scale-in">
              {completedFlowStep === "trip_completed" && (
                <div className="space-y-5 py-4">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/15 animate-bounce">
                    <ShieldCheck className="size-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">Trip Completed! 🎉</h2>
                    <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                      You have arrived safely at your destination. Thank you for choosing Rideuu!
                    </p>
                  </div>
                  <button
                    onClick={() => setCompletedFlowStep("final_fare")}
                    className="w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition"
                  >
                    View Final Fare
                  </button>
                </div>
              )}

              {completedFlowStep === "final_fare" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-black text-foreground">Fare Summary 💰</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">Official fare breakdown</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-bold space-y-2.5 text-left">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Base Ride Price</span>
                      <span>₹{baseRidePrice}.00</span>
                    </div>
                    {isSurge && (
                      <div className="flex justify-between items-center text-primary">
                        <span>Surge Adjustment</span>
                        <span>₹{surgeAmt}.00</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Platform Convenience Fee</span>
                      <span>₹{platformFee}.00</span>
                    </div>
                    {ride.discount > 0 && (
                      <div className="flex justify-between items-center text-emerald-600">
                        <span>Coupon Discount</span>
                        <span>−₹{ride.discount}.00</span>
                      </div>
                    )}
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between items-center text-sm font-black text-foreground">
                      <span>Total Payable Fare</span>
                      <span className="text-primary font-black text-base">₹{ride.negotiatedPrice}.00</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCompletedFlowStep("payment")}
                    className="w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition"
                  >
                    Proceed to Payment
                  </button>
                </div>
              )}

              {completedFlowStep === "payment" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-black text-foreground">Payment Collection 💳</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">Choose your payment method</p>
                  </div>

                  <div className="space-y-2.5">
                    <button
                      onClick={() => setPaymentMode("wallet")}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${paymentMode === "wallet"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card hover:bg-muted/30"
                        }`}
                    >
                      <div>
                        <div className="text-xs font-extrabold text-foreground">Namma Cash Wallet</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">
                          Balance: ₹{wallet.balance.toFixed(2)}
                        </div>
                      </div>
                      <span className={`size-4 rounded-full border-2 flex items-center justify-center ${paymentMode === "wallet" ? "border-primary bg-primary" : "border-muted"}`}>
                        {paymentMode === "wallet" && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                      </span>
                    </button>

                    <button
                      onClick={() => setPaymentMode("upi")}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${paymentMode === "upi"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card hover:bg-muted/30"
                        }`}
                    >
                      <div>
                        <div className="text-xs font-extrabold text-foreground">Razorpay UPI</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">Pay via Google Pay, PhonePe, Paytm</div>
                      </div>
                      <span className={`size-4 rounded-full border-2 flex items-center justify-center ${paymentMode === "upi" ? "border-primary bg-primary" : "border-muted"}`}>
                        {paymentMode === "upi" && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                      </span>
                    </button>

                    <button
                      onClick={() => setPaymentMode("cash")}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition ${paymentMode === "cash"
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-card hover:bg-muted/30"
                        }`}
                    >
                      <div>
                        <div className="text-xs font-extrabold text-foreground">Pay by Cash</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-bold">Hand over physical cash to the Captain</div>
                      </div>
                      <span className={`size-4 rounded-full border-2 flex items-center justify-center ${paymentMode === "cash" ? "border-primary bg-primary" : "border-muted"}`}>
                        {paymentMode === "cash" && <span className="size-1.5 rounded-full bg-primary-foreground" />}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={async () => {
                      if (paymentMode === "wallet") {
                        store.update((s) => {
                          s.wallet.balance = Math.max(0, s.wallet.balance - ride.negotiatedPrice);
                        });
                        // Deduct wallet balance in database
                        const token = store.getState().token;
                        if (token) {
                          const me = await api.getMe(token);
                          if (me) {
                            await api.updateUser(me.id, { wallet_balance: Math.max(0, me.wallet_balance - ride.negotiatedPrice) });
                          }
                        }
                      }
                      // Tell the driver that payment is completed (sets completion_step = 3)
                      if (ride.id) {
                        await api.updateRide(ride.id, { completion_step: 3, payment_mode: paymentMode });
                      }
                      setCompletedFlowStep("payment_success");
                    }}
                    className="w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition"
                  >
                    Pay ₹{ride.negotiatedPrice}.00
                  </button>
                </div>
              )}

              {completedFlowStep === "payment_success" && (
                <div className="space-y-5 py-4 animate-scale-in">
                  <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/15">
                    <ShieldCheck className="size-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground">
                      {paymentMode === "cash" ? "Hand Over Cash! 💵" : "Payment Successful! 🎉"}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-2 max-w-xs mx-auto leading-relaxed">
                      {paymentMode === "cash"
                        ? `Please hand over ₹${ride.negotiatedPrice}.00 in cash directly to your Captain.`
                        : `₹${ride.negotiatedPrice}.00 successfully paid via ${paymentMode === "wallet" ? "Namma Cash Wallet" : "Razorpay UPI"}.`}
                    </p>
                  </div>
                  <button
                    onClick={() => setCompletedFlowStep("rate_driver")}
                    className="w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition"
                  >
                    Rate Captain
                  </button>
                </div>
              )}

              {completedFlowStep === "rate_driver" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-black text-foreground">Rate your Captain ⭐</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">How was your ride with {ride.driver.name}?</p>
                  </div>

                  <div className="flex justify-center gap-2 py-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isActive = (ratingHover !== null ? ratingHover : driverRating) >= star;
                      return (
                        <button
                          key={star}
                          onMouseEnter={() => setRatingHover(star)}
                          onMouseLeave={() => setRatingHover(null)}
                          onClick={() => setDriverRating(star)}
                          className="text-amber-400 focus:outline-none transition active:scale-125 hover:scale-110"
                        >
                          <Star className={`size-9 ${isActive ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      if (ride.id) {
                        api.updateRide(ride.id, { rating_driver: driverRating });
                      }
                      setCompletedFlowStep("trip_summary");
                    }}
                    className="w-full rounded-full bg-primary text-primary-foreground py-4 text-xs font-black uppercase tracking-wider shadow shadow-primary/25 hover:brightness-105 active:scale-95 transition"
                  >
                    Submit Review
                  </button>
                </div>
              )}

              {completedFlowStep === "trip_summary" && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-lg font-black text-foreground">Trip Summary 📄</h2>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-bold">Settlement receipt & feedback saved</p>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-xs font-bold space-y-3 text-left">
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground">
                        {ride.driver.name[0]}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-foreground">{ride.driver.name}</div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">{ride.driver.vehicle} · {ride.driver.plate}</div>
                      </div>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="grid grid-cols-2 gap-y-2 text-[10px] font-bold">
                      <div className="text-muted-foreground">Rating Given</div>
                      <div className="text-right flex items-center justify-end gap-1 text-amber-500 font-extrabold">
                        <Star className="size-3 fill-amber-500 text-amber-500" /> {driverRating} Stars
                      </div>
                      <div className="text-muted-foreground">Distance Traveled</div>
                      <div className="text-right text-foreground">{displayDistance}</div>
                      <div className="text-muted-foreground">Payment Mode</div>
                      <div className="text-right text-foreground uppercase">
                        {paymentMode === "wallet" ? "Wallet" : paymentMode === "upi" ? "UPI" : "Cash"}
                      </div>
                      <div className="text-muted-foreground">Total Fare Paid</div>
                      <div className="text-right text-primary font-black">₹{ride.negotiatedPrice}.00</div>
                    </div>
                  </div>

                  <div className="flex gap-2.5">
                    <button
                      onClick={() => {
                        store.resetBooking();
                        navigate({ to: "/app/trips" });
                      }}
                      className="flex-1 rounded-full border border-border bg-card py-3.5 text-xs font-bold text-foreground hover:bg-muted transition"
                    >
                      View History
                    </button>
                    <button
                      onClick={() => {
                        store.resetBooking();
                        navigate({ to: "/app/home" });
                      }}
                      className="flex-1 rounded-full bg-primary text-primary-foreground py-3.5 text-xs font-black shadow shadow-primary/20 hover:brightness-105 transition"
                    >
                      Back to Home
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">

              {/* Driver Profile & Vehicle plate details */}
              <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm relative overflow-hidden">
                {/* Premium trust score neon watermark */}
                <div className="absolute right-0 top-0 h-full w-1.5 bg-primary" />

                <div className="grid size-12 place-items-center rounded-xl bg-primary text-xl font-extrabold text-primary-foreground shadow-sm">
                  {ride.driver.name[0]}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-extrabold flex items-center gap-1.5">
                    {language === "en" ? ride.driver.name : ride.driver.tamilName}
                    <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.5 text-[8px] font-black text-primary">
                      <Star className="size-2 fill-primary text-primary" /> {ride.driver.rating}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {language === "en" ? ride.driver.vehicle : ride.driver.tamilVehicle}
                  </div>

                  {/* Plate & trust score */}
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-[9px] font-black tracking-wider text-primary border border-primary/20">
                      {ride.driver.plate}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      <ShieldCheck className="size-3" /> {ride.driver.trustScore}% Trust Score
                    </span>
                  </div>
                </div>

                {/* Chat and Call Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowChat(true)}
                    className="relative grid size-10 place-items-center rounded-xl border border-border bg-card hover:border-primary/20 active:scale-95 transition shadow-sm"
                  >
                    <MessageCircle className="size-4.5" />
                    <span className="absolute -right-1 -top-1 size-2 rounded-full bg-primary animate-pulse" />
                  </button>
                  <a
                    href={`tel:${ride.driver.phone}`}
                    className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground shadow active:scale-95 transition"
                  >
                    <Phone className="size-4.5 text-primary" />
                  </a>
                </div>
              </div>

              {/* Active Safety Route Badges */}
              {(avoidUnlit || prioritizeHighways || patrolRoutes) && (
                <div className="rounded-2xl border border-border bg-card px-3 py-2.5 shadow-sm text-xs font-semibold text-left flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-black uppercase text-muted-foreground mr-1">Active Safety Features:</span>
                  {avoidUnlit && (
                    <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black text-emerald-600">
                      💡 Lit Lanes
                    </span>
                  )}
                  {prioritizeHighways && (
                    <span className="rounded-md bg-orange-500/10 px-2 py-0.5 text-[9px] font-black text-orange-600">
                      🛣️ Highway Priority
                    </span>
                  )}
                  {patrolRoutes && (
                    <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[9px] font-black text-blue-600 animate-pulse">
                      🚓 Police Overlay
                    </span>
                  )}
                </div>
              )}

              {/* OTP verification system */}
              {ride.step === "arriving" && (
                <div className="rounded-2xl border border-dashed border-primary bg-primary/5 p-4 text-center space-y-2 shadow-sm">
                  <div className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">{t("OTP Verification")}</div>
                  <div className="text-2xl font-black tracking-widest text-primary font-mono">{ride.otp}</div>
                  <p className="text-[10px] text-muted-foreground leading-normal">{t("Give this OTP to driver on arrival")}</p>

                  <button
                    onClick={handleVerifyOtp}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[10px] font-black text-primary-foreground shadow shadow-primary/20 hover:brightness-105 active:scale-95 transition"
                  >
                    <Check className="size-3.5" /> Start Trip (Simulate OTP Share)
                  </button>
                </div>
              )}

              {/* Live progress milestone timeline */}
              <div className="rounded-2xl border border-border bg-card p-3 shadow-sm text-xs font-semibold">
                <h3 className="mb-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground pl-1">Live timeline</h3>

                <div className="space-y-4 relative pl-5">
                  {/* Vertical line timeline */}
                  <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-border" />
                  <div className="absolute left-1.5 top-1 w-0.5 bg-primary transition-all duration-300" style={{ height: `${ride.progress}%` }} />

                  {[
                    { label: "Ride Confirmed", desc: "Driver matching successful", active: true },
                    { label: "Driver Arrived at Pickup", desc: "Besant Nagar lighthouse entrance", active: ride.progress >= 25 || ride.step === "ongoing" },
                    { label: "Trip In Transit", desc: `Speed: ${ride.speed} km/h · passing Santhome`, active: ride.step === "ongoing" && ride.progress > 25 },
                    { label: "Arrived at Destination", desc: `T. Nagar Pondy Bazaar`, active: ride.step === "completed" },
                  ].map((step, idx) => {
                    return (
                      <div key={idx} className="relative text-left">
                        {/* circle checkpoint */}
                        <span className={`absolute -left-5 top-0.5 size-2.5 rounded-full border-2 bg-card ${step.active ? "border-primary bg-primary animate-pulse" : "border-border"}`} />
                        <div className={`font-extrabold ${step.active ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{step.desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions (Share & Cancel) */}
              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <button
                  onClick={handleShareTrip}
                  className="flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card py-3.5 shadow-sm hover:border-primary/20 transition"
                >
                  <Share2 className="size-4" /> {copiedLink ? "Link Copied!" : "Share Live Trip"}
                </button>

                {ride.step !== "ongoing" && ride.step !== "completed" ? (
                  <button
                    onClick={() => store.cancelRide()}
                    className="rounded-2xl border border-destructive/20 bg-destructive/5 py-3.5 text-destructive hover:bg-destructive/10 transition"
                  >
                    Cancel Ride
                  </button>
                ) : (
                  <button
                    onClick={() => store.toggleAudioRecording()}
                    className={`flex items-center justify-center gap-1.5 rounded-2xl border py-3.5 transition ${ride.isAudioRecording ? "border-red-500 bg-red-500/10 text-red-600 animate-pulse" : "border-border bg-card"}`}
                  >
                    <span className={`size-2 rounded-full bg-red-500 ${ride.isAudioRecording ? "animate-ping" : ""}`} />
                    {ride.isAudioRecording ? "Audio Recording Active" : "Record Audio Log"}
                  </button>
                )}
              </div>
            </div>
          )
        ) : ride.step === "searching" || ride.step === "matching" ? (
          /* Premium Searching/Matching Panel */
          <div className="py-6 text-center space-y-5">
            <div className="relative mx-auto size-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-4 border-primary/40 animate-pulse" />
              <div className="absolute inset-4 rounded-full bg-primary/10 grid place-items-center">
                <Compass className="size-8 text-primary animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-foreground animate-pulse">
                {language === "ta" ? "சாரதியைத் தேடுகிறது..." : "Finding your Captain..."}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1.5 max-w-xs mx-auto leading-normal">
                {language === "ta" ? "உங்களுக்கு அருகில் உள்ள ஆட்டோ/பைக் தேடப்படுகிறது. தயவுசெய்து காத்திருக்கவும்." : "Connecting with nearest drivers in Chennai. Please wait..."}
              </p>
            </div>

            {/* Show search details */}
            <div className="rounded-2xl border border-border bg-card p-3.5 shadow-sm text-left text-xs font-semibold space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="truncate"><strong>From:</strong> {ride.pickup}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                <span className="truncate"><strong>To:</strong> {ride.drop}</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-center">
                <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground">Fare negotiated</span>
                <span className="text-sm font-black text-primary">₹{ride.negotiatedPrice}</span>
              </div>
            </div>

            {/* Available Captains Nearby */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm text-left text-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-extrabold text-[11px] uppercase tracking-wider text-muted-foreground">Available Captains Nearby</span>
                <span className="text-[10px] text-primary font-bold">{nearbyDrivers.length} online</span>
              </div>
              {nearbyDrivers.length > 0 ? (
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {nearbyDrivers.map((d: any) => (
                    <div key={d.id} className="flex justify-between items-center bg-muted/20 border border-border/40 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded bg-primary/10 text-primary font-extrabold flex items-center justify-center text-[10px]">
                          {d.name[0]}
                        </div>
                        <div>
                          <span className="font-extrabold text-foreground block">{d.name}</span>
                          <span className="text-[9px] text-muted-foreground block">
                            {d.vehicles?.[0]?.model || (ride.vehicle === "bike" ? "Honda Activa" : "Bajaj RE Auto")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-foreground block">{d.distanceStr}</span>
                        <span className="text-[8px] text-emerald-500 font-extrabold block">KYC Verified</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 text-[10px] text-muted-foreground">
                  No online {ride.vehicle} Captains currently match matching requirements.
                </div>
              )}
            </div>

            <button
              onClick={() => store.cancelRide()}
              className="w-full rounded-2xl border border-destructive/20 bg-destructive/5 py-3.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition"
            >
              {language === "ta" ? "பயணத்தை ரத்து செய்" : "Cancel Search"}
            </button>
          </div>
        ) : (
          /* Empty/Cancelled state */
          <div className="py-8 text-center space-y-4">
            <div className="grid size-14 mx-auto place-items-center rounded-full bg-destructive/10 text-destructive animate-pulse">
              <ShieldAlert className="size-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">
                {ride.step === "cancelled" ? "Ride Cancelled" : "No Active Bookings"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto leading-normal">
                {ride.step === "cancelled"
                  ? "Your booking was successfully terminated. You can rebook a bike or auto at any time."
                  : "Book a ride from the dashboard or schedule page to begin tracking."}
              </p>
            </div>
            <Link
              to="/app/home"
              onClick={() => store.resetBooking()}
              className="inline-block rounded-2xl bg-secondary px-6 py-3.5 text-xs font-extrabold text-secondary-foreground shadow"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>

      {/* 3. Sliding Live Chat Messenger Drawer overlay */}
      {showChat && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card flex flex-col h-[75dvh] shadow-2xl animate-scale-in">
            {/* Header */}
            <div className="flex justify-between items-center px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-full bg-primary text-xs font-black text-primary-foreground">
                  {ride.driver?.name[0]}
                </div>
                <div className="text-left">
                  <h3 className="text-xs font-extrabold">{ride.driver?.name}</h3>
                  <p className="text-[9px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active Driver Chat
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            {/* Message list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar bg-muted/20">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[75%] ${msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                >
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-xs font-semibold ${msg.sender === "user" ? "bg-primary text-primary-foreground shadow" : "bg-card border border-border text-foreground shadow-sm"}`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-muted-foreground mt-1 px-1.5">{msg.time}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input field */}
            <div className="p-3 border-t border-border bg-card flex items-center gap-2">
              <input
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                placeholder="Type message in தமிழ் or English..."
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-semibold outline-none focus:border-primary"
              />
              <button
                onClick={handleSendChat}
                className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground hover:brightness-105 transition shadow shadow-primary/25"
              >
                <Send className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Toast Banner Notification */}
      {showShareToast && (
        <div className="fixed bottom-24 inset-x-4 z-40 mx-auto max-w-xs rounded-xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md p-3.5 text-center text-xs font-extrabold text-emerald-600 shadow shadow-emerald-500/10 animate-fade-in flex items-center justify-center gap-1.5">
          <ShieldCheck className="size-4.5" strokeWidth={2.5} /> Live Track URL copied to Clipboard!
        </div>
      )}
    </div>
  );
}