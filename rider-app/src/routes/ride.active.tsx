import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/rider/MobileShell";
import { InteractiveMap } from "@/components/rider/InteractiveMap";
import {
  Phone, MessageCircle, ShieldAlert, Navigation, ChevronUp, Clock, IndianRupee,
  ShieldCheck, AlertTriangle, Play, Pause, AlertCircle, Compass, HelpCircle, Check, Send, X, Volume2, Info, Star
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useRider } from "../context/RiderContext";
import { api } from "../lib/api";

export const Route = createFileRoute("/ride/active")({
  component: ActiveRide,
});

function ActiveRide() {
  const nav = useNavigate();
  const {
    activeRide, setRideStage, setOtpInput,
    advanceActiveRideStep, togglePauseRide,
    reportRideIssue, endActiveRide,
    floodAlert, triggerSOS, sosTriggered, cancelSOS,
    t, language, phone, noCommissionExpiry
  } = useRider();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatLog, setChatLog] = useState<{ sender: "rider" | "customer"; text: string; time: string }[]>([
    { sender: "customer", text: "Please wait near the main depot entrance", time: "4:01 pm" }
  ]);

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [issueSubmitted, setIssueSubmitted] = useState(false);

  const [detourAccepted, setDetourAccepted] = useState(false);

  const [completionStep, setCompletionStep] = useState(0);
  const [riderRatingInput, setRiderRatingInput] = useState(5);

  useEffect(() => {
    if (activeRide.stage === "completion") {
      if (activeRide.completionStep !== undefined && activeRide.completionStep >= 0) {
        setCompletionStep(activeRide.completionStep);
      } else {
        setCompletionStep(0);
      }
    }
  }, [activeRide.stage, activeRide.completionStep]);

  const handleNextCompletionStep = async () => {
    const nextStep = completionStep + 1;
    if (completionStep === 3) {
      // Step 4 (Payment Success): Confirms payment received. Update backend ride status to completed.
      if (activeRide.request) {
        await api.updateRide(activeRide.request.id, { status: "completed", completion_step: nextStep });
      }
    } else if (completionStep === 4) {
      // Step 5 (Rating & Reviews): Submit rider's rating for the customer to backend.
      if (activeRide.request) {
        await api.updateRide(activeRide.request.id, { rating_customer: riderRatingInput, completion_step: nextStep });
      }
    } else {
      if (activeRide.request) {
        await api.updateRide(activeRide.request.id, { completion_step: nextStep });
      }
    }
    if (completionStep >= 6) {
      await endActiveRide(riderRatingInput);
      nav({ to: "/dashboard" });
      return;
    }
    setCompletionStep(nextStep);
  };

  const getCompletionButtonLabel = () => {
    switch (completionStep) {
      case 0: return `Verify GPS Distance (${finalDistance} km)`;
      case 1: return `Calculate Final Fare (₹${totalEarnings})`;
      case 2: return "Collect Payment from Customer";
      case 3: return "Confirm Payment Received (Cash/Wallet)";
      case 4: return `Submit Customer Rating (${riderRatingInput} Stars)`;
      case 5: return "Archive Trip History";
      case 6: return "Finish & Go Available";
      default: return "Next Step";
    }
  };

  const activeReq = useMemo(() => {
    if (activeRide.request) return activeRide.request;
    return {
      id: "req-active-fallback",
      fare: 142,
      distance: 4.2,
      duration: 18,
      pickup: "T.Nagar Bus Depot",
      pickupSub: "Usman Road · 2.1 km away",
      dropoff: "Anna Nagar W Block",
      dropoffSub: "Drop-off · landmark: behind Saravana Stores",
      customerName: "Priya",
      customerRating: 4.8,
      isFemaleOnly: true,
      surgeMultiplier: 1.2,
      rainBonus: 20,
      otp: "4821",
    };
  }, [activeRide.request]);

  const finalDistance = useMemo(() => {
    const dist = typeof activeReq.distance === "string" ? parseFloat(activeReq.distance) : activeReq.distance;
    return detourAccepted ? Math.round((dist + 1.3) * 10) / 10 : dist;
  }, [detourAccepted, activeReq.distance]);

  const totalEarnings = activeReq.id.includes("fallback") 
    ? Math.round((activeReq.fare + activeReq.rainBonus) * activeReq.surgeMultiplier)
    : activeReq.fare;

  // Turn navigation guidance instructions
  const navInstructions = [
    { en: "Head North-East on Usman Road toward T.Nagar Terminal", ta: "தி.நகர் முனையத்தை நோக்கி உஸ்மான் சாலையில் வடகிழக்கே செல்லவும்" },
    { en: "Turn left at Usman Road Subway intersection", ta: "உஸ்மான் சாலை சுரங்கப்பாதை சந்திப்பில் இடதுபுறம் திரும்பவும்" },
    { en: "Merge onto Chennai Bypass Flyover to avoid water logging", ta: "வெள்ள நீர் தேங்குவதைத் தவிர்க்க சென்னை மாற்று மேம்பாலத்தில் இணையவும்" },
    { en: "Take the second exit toward Anna Nagar West Block", ta: "அண்ணா நகர் மேற்குப் பகுதியை நோக்கி இரண்டாவது வழியில் வெளியேறவும்" },
    { en: "Destination on the left, behind Saravana Stores", ta: "இடதுபுறம் இலக்கு உள்ளது, சரவணா ஸ்டோர்ஸ் பின்புறம்" }
  ];

  const currentGuidance = useMemo(() => {
    const idx = Math.min(activeRide.currentStepIndex, navInstructions.length - 1);
    return language === "ta" ? navInstructions[idx].ta : navInstructions[idx].en;
  }, [activeRide.currentStepIndex, language]);

  const handleSendChat = () => {
    if (!chatInput) return;
    setChatLog([...chatLog, { sender: "rider", text: chatInput, time: "Just now" }]);
    setChatInput("");
    // Simulate auto customer reply
    setTimeout(() => {
      setChatLog(prev => [...prev, { sender: "customer", text: "Got it! I am standing right there.", time: "Just now" }]);
    }, 1500);
  };

  const handleIssueSubmit = () => {
    if (!issueText) return;
    reportRideIssue(issueText);
    setIssueSubmitted(true);
    setTimeout(() => {
      setIssueSubmitted(false);
      setIssueOpen(false);
      setIssueText("");
    }, 2000);
  };

  const handleCancelRide = async () => {
    await endActiveRide(5);
    nav({ to: "/dashboard" });
  };

  return (
    <MobileShell showNav={false}>
      <div className="min-h-screen relative flex flex-col bg-background">
        
        {/* Interactive map representing Chennai routing */}
        <div className="flex-1 relative">
          <InteractiveMap height="h-[360px]" />
          
          {/* Top Floating action bar */}
          <div className="absolute top-4 inset-x-4 flex justify-between items-center pointer-events-none z-10">
            <button className="h-10 px-3 rounded-full bg-slate-900/90 border border-white/10 flex items-center gap-1.5 text-[10px] font-bold text-white pointer-events-auto shadow-md">
              <Compass className="h-4 w-4 text-primary animate-spin" style={{ animationDuration: "12s" }} />
              GPS Navigation Active
            </button>

            <button
              onClick={triggerSOS}
              className="h-10 px-4 rounded-full bg-red-600 border border-red-500 flex items-center gap-1.5 text-xs font-black text-white pointer-events-auto shadow-lg hover:scale-105 active:scale-95 transition"
            >
              <ShieldAlert className="h-4.5 w-4.5 text-white animate-pulse" />
              {t("sos")}
            </button>
          </div>
        </div>

        {/* Action card bottom block */}
        <div className="rounded-t-3xl bg-card border-t border-border p-5 relative shadow-2xl z-20">
          <div className="mx-auto h-1 w-12 rounded-full bg-muted mb-4" />

          {/* Active SOS screen */}
          {sosTriggered && (
            <div className="bg-red-650 text-white rounded-2xl p-4 mb-4 slide-up shadow-md">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-8 w-8 text-white shrink-0 mt-0.5 animate-bounce" />
                <div className="flex-1">
                  <div className="font-black text-sm">{t("emergency_title")}</div>
                  <p className="text-[10px] leading-relaxed text-red-100 mt-0.5">{t("emergency_desc")}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={cancelSOS} className="px-3 py-1.5 bg-white text-red-600 rounded-full text-[10px] font-bold">
                      Dismiss Alert
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chennai specific Flood detour notification overlay */}
          {floodAlert && activeRide.stage === "trip" && !detourAccepted && (
            <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4 mb-4 text-blue-500 slide-up">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-blue-500 mt-0.5 animate-bounce" />
                <div>
                  <div className="font-black text-xs uppercase tracking-wide">{t("flood_warning_title")}</div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    {t("flood_warning_desc")}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        setDetourAccepted(true);
                        advanceActiveRideStep(); // Go to bypass step
                      }}
                      className="px-4 py-1.5 bg-blue-500 text-white rounded-full text-[10px] font-black hover:bg-blue-600 active:scale-95 transition"
                    >
                      Accept Detour (Flood Bypass)
                    </button>
                    <button
                      onClick={() => setDetourAccepted(true)}
                      className="px-3 py-1.5 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 rounded-full text-[10px] font-bold"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 1: Heading to pickup */}
          {activeRide.stage === "pickup" && (
            <>
              <p className="text-[10px] font-extrabold tracking-widest text-primary uppercase">{t("head_to_pickup")}</p>
              <h2 className="mt-1 text-xl font-black text-foreground tracking-tight">{activeReq.pickup}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 font-semibold">2.1 km · 6 min via Usman Road Subway</p>

              {/* Chat & Call Quick Buttons */}
              <div className="mt-4 flex items-center gap-3 rounded-2xl bg-secondary p-3.5 border border-border">
                <div className="h-10 w-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-sm">
                  {activeReq.customerName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-foreground truncate">{activeReq.customerName} · ⭐ {activeReq.customerRating}</div>
                  <div className="text-[10px] text-muted-foreground font-bold">{t("customer")}</div>
                </div>
                
                <button
                  onClick={() => setChatOpen(true)}
                  className="h-10 w-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition"
                >
                  <MessageCircle className="h-4.5 w-4.5" />
                </button>
                <a
                  href={`tel:${phone}`}
                  className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/95 active:scale-95 transition shadow-sm"
                >
                  <Phone className="h-4.5 w-4.5" />
                </a>
              </div>

              {/* Action Button */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setRideStage("otp")}
                  className="flex-1 rounded-full bg-primary text-primary-foreground font-black py-4 shadow-md active:scale-95 transition text-sm uppercase tracking-wide"
                >
                  {t("arrived_pickup")}
                </button>
                <button
                  onClick={handleCancelRide}
                  className="px-5 rounded-full bg-secondary border border-border text-foreground font-bold text-xs hover:bg-muted active:scale-95 transition"
                >
                  Cancel Ride
                </button>
              </div>
            </>
          )}

          {/* STAGE 2: Ask for OTP */}
          {activeRide.stage === "otp" && (
            <>
              <p className="text-[10px] font-extrabold tracking-widest text-primary uppercase">{t("ride_otp")}</p>
              <h2 className="mt-1 text-xl font-black text-foreground tracking-tight">{t("ask_customer_otp")}</h2>
              
              <input
                value={activeRide.otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                placeholder="0 0 0 0"
                className="mt-4 w-full text-center text-3xl font-black tracking-[0.8em] py-4 rounded-2xl bg-secondary border-2 border-border focus:border-primary outline-none"
              />
              
              <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-muted-foreground font-bold">
                <Info className="h-3.5 w-3.5" />
                <span>Simulation: Enter code <strong className="text-foreground">{(activeReq as any).otp || "4821"}</strong> to start ride.</span>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  disabled={activeRide.otpInput !== (activeReq as any).otp}
                  onClick={() => setRideStage("trip")}
                  className="flex-1 rounded-full bg-primary text-primary-foreground font-black py-4 disabled:opacity-50 active:scale-95 transition text-sm uppercase tracking-wide"
                >
                  {t("start_trip")}
                </button>
                <button
                  onClick={handleCancelRide}
                  className="px-5 rounded-full bg-secondary border border-border text-foreground font-bold text-xs hover:bg-muted active:scale-95 transition"
                >
                  Cancel Ride
                </button>
              </div>
            </>
          )}

          {/* STAGE 3: Trip in Progress */}
          {activeRide.stage === "trip" && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-extrabold tracking-widest text-success uppercase">{t("trip_in_progress")}</p>
                  <h2 className="mt-1 text-lg font-black text-foreground tracking-tight">{activeReq.dropoff}</h2>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-foreground">₹{totalEarnings}</div>
                  <div className="text-[9px] text-muted-foreground font-extrabold uppercase">{t("earnings_est")}</div>
                </div>
              </div>

              {/* Turn indicator box */}
              <div className="mt-4 rounded-2xl bg-secondary border border-border p-4 flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0">
                  <Navigation className="h-4.5 w-4.5 -rotate-45" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground uppercase tracking-wider">NAVIGATION</div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 font-bold">
                    {currentGuidance}
                  </p>
                  {/* Voice assistant simulation */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[10px] text-primary font-bold">
                    <Volume2 className="h-4 w-4" />
                    <span>{t("voice_navigation")}</span>
                  </div>
                </div>
                <button
                  onClick={advanceActiveRideStep}
                  className="py-1 px-2 bg-primary/15 text-primary text-[9px] font-black rounded border border-primary/20 hover:bg-primary/20"
                >
                  NEXT TURN
                </button>
              </div>

              {/* Metric grids */}
              <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
                <Tile label={t("distance")} value={`${finalDistance} km`} />
                <Tile label={t("eta")} value={`${activeReq.duration} min`} />
                <Tile label={t("speed")} value="32 km/h" />
              </div>

              {/* Pause, Reroute and dispute actions */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={togglePauseRide}
                  className="py-3.5 rounded-full bg-secondary border border-border font-bold text-xs text-foreground active:scale-95 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {activeRide.isPaused ? (
                    <>
                      <Play className="h-4 w-4 text-primary" /> {t("resume_trip")}
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 text-primary" /> {t("pause_trip")}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIssueOpen(true)}
                  className="py-3.5 rounded-full bg-secondary border border-border font-bold text-xs text-foreground active:scale-95 transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <AlertCircle className="h-4 w-4 text-primary" /> {t("report_issue")}
                </button>
              </div>

              <button
                onClick={async () => {
                  setRideStage("completion");
                  if (activeRide.request) {
                    await api.updateRide(activeRide.request.id, { completion_step: 0 });
                  }
                }}
                className="mt-4 w-full rounded-full bg-primary text-primary-foreground font-black py-4 shadow-md hover:bg-primary/95 transition text-sm uppercase tracking-wide"
              >
                {t("end_trip")}
              </button>
            </>
          )}

          {/* STAGE 4: Completion checklist simulation */}
          {activeRide.stage === "completion" && (() => {
            const vType = activeReq.vehicle_type || "bike";
            const isAuto = vType.toLowerCase().includes("auto");
            const hasNoComm = noCommissionExpiry > Math.floor(Date.now() / 1000);
            const commissionPercent = hasNoComm ? 0.0 : (isAuto ? 0.08 : 0.05);
            const commissionLabel = hasNoComm ? "No Commission (Flat ₹3)" : (isAuto ? "8%" : "5%");
            const commissionVal = hasNoComm ? 3.0 : Math.round(totalEarnings * commissionPercent * 100) / 100;
            const remainingEarnings = Math.round((totalEarnings - commissionVal) * 100) / 100;
            const pMode = activeReq.payment_mode || "cash";

            const commissionDesc = `Platform commission of ${commissionLabel} (₹${commissionVal.toFixed(2)}) processed`;
            const walletDesc = pMode === "cash" 
              ? `Commission deducted: -₹${commissionVal.toFixed(2)} (You kept ₹${totalEarnings} in cash)`
              : `Earnings added to wallet: +₹${remainingEarnings.toFixed(2)} (Fare: ₹${totalEarnings} minus commission of ₹${commissionVal.toFixed(2)})`;

            const completionSteps = [
              { label: "Calculating Final Distance...", desc: `GPS verified: ${finalDistance} km` },
              { label: "Calculating Final Fare...", desc: `Total Fare calculated: ₹${totalEarnings}` },
              { label: "Initiating Payment Collection...", desc: `Requesting payment via ${pMode === 'cash' ? 'Pay by Cash' : 'Online Payment'}` },
              { label: "Payment Success!", desc: "Ride completed successfully" },
              { 
                label: "Rating & Reviews...", 
                desc: (
                  <div className="space-y-2 mt-1">
                    <div className="text-[10px] text-muted-foreground font-semibold leading-normal">
                      {activeReq.rating_driver 
                        ? `Customer rated you: ${activeReq.rating_driver} stars` 
                        : "Default customer rating processed (5 stars)"}
                    </div>
                    <div className="flex flex-col gap-1 mt-1 bg-background/40 p-2 rounded-xl border border-border/40">
                      <span className="text-[9px] font-black uppercase tracking-wider text-primary">Rate Chennai Rapido:</span>
                      <div className="flex gap-1.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRiderRatingInput(star);
                            }}
                            className="focus:outline-none transition active:scale-125 hover:scale-110"
                          >
                            <Star className={`size-5 ${riderRatingInput >= star ? "fill-amber-400 text-amber-400" : "text-border"}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              },
              { label: "Updating Ride History...", desc: "Saved trip in database archives" },
              { label: "Rider Available for Next Ride", desc: "Setting driver status to online & available" }
            ];
            return (
              <div className="space-y-4">
                <div className="text-center pb-2">
                  <div className="text-xs font-black uppercase tracking-widest text-primary animate-pulse">
                    Ride Completion Lifecycle
                  </div>
                  <h2 className="text-lg font-black text-foreground mt-1">Processing Ride Settlement</h2>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {completionSteps.map((step, idx) => {
                    const isDone = completionStep > idx;
                    const isCurrent = completionStep === idx;
                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 p-3 rounded-2xl border transition-all duration-300 ${
                          isDone
                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-500"
                            : isCurrent
                            ? "bg-primary/5 border-primary/25 text-primary scale-[1.01] shadow-sm"
                            : "bg-secondary/40 border-border/50 text-muted-foreground opacity-60"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {isDone ? (
                            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                          ) : isCurrent ? (
                            <span className="relative flex h-4.5 w-4.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4.5 w-4.5 bg-primary/25 border border-primary text-[10px] font-black items-center justify-center text-primary">
                                {idx + 1}
                              </span>
                            </span>
                          ) : (
                            <div className="h-4.5 w-4.5 rounded-full border-2 border-muted flex items-center justify-center text-[9px] font-bold">
                              {idx + 1}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <div className="text-xs font-extrabold leading-none">{step.label}</div>
                          {(isCurrent || isDone) && (
                            <div className="text-[10px] text-muted-foreground mt-1 leading-normal font-semibold">
                              {step.desc}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextCompletionStep}
                  className="mt-4 w-full rounded-full bg-primary text-primary-foreground font-black py-4 shadow-md hover:bg-primary/95 transition text-sm uppercase tracking-wide"
                >
                  {getCompletionButtonLabel()}
                </button>
              </div>
            );
          })()}
        </div>
      </div>

      {/* SMS Calling chat simulation screen modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col justify-between">
          <div className="px-5 pt-12 pb-4 bg-slate-950 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                {activeReq.customerName[0]}
              </div>
              <div>
                <span className="font-bold text-sm block">{activeReq.customerName}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">{t("customer")}</span>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {chatLog.map((c, i) => (
              <div key={i} className={`flex ${c.sender === "rider" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-2xl p-3.5 text-xs font-semibold leading-relaxed shadow ${
                  c.sender === "rider"
                    ? "bg-primary text-white rounded-tr-none"
                    : "bg-slate-800 text-slate-100 rounded-tl-none"
                }`}>
                  <p>{c.text}</p>
                  <span className="block text-[8px] text-white/40 text-right mt-1 font-bold">{c.time}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-950 border-t border-white/5 flex gap-2 items-center">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type message to passenger..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-full px-4 py-3 text-xs outline-none text-white focus:border-primary"
            />
            <button
              onClick={handleSendChat}
              className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0 hover:scale-105 active:scale-95 transition"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Ride Issue Dispute submission Form overlay modal */}
      {issueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-card border border-border p-6 shadow-2xl relative slide-up text-foreground">
            <button
              onClick={() => setIssueOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-black tracking-tight mb-2 flex items-center gap-1.5">
              <AlertCircle className="h-5 w-5 text-primary" />
              {t("complaint_title")}
            </h3>
            
            {issueSubmitted ? (
              <div className="my-6 text-center py-4 bg-success/10 rounded-2xl text-success font-bold text-xs flex items-center justify-center gap-2 animate-bounce">
                <Check className="h-5 w-5" />
                <span>{t("issue_reported_ok")}</span>
              </div>
            ) : (
              <>
                <textarea
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder={t("complaint_placeholder")}
                  rows={4}
                  className="w-full bg-secondary border border-border rounded-2xl p-4 text-xs font-semibold outline-none focus:border-primary transition"
                />
                
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleIssueSubmit}
                    className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-black text-xs shadow hover:bg-primary/95 transition active:scale-95"
                  >
                    Submit Ticket
                  </button>
                  <button
                    onClick={() => setIssueOpen(false)}
                    className="px-4 py-3 rounded-full bg-secondary border border-border text-foreground font-bold text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-secondary border border-border p-3">
      <div className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-black text-sm text-foreground mt-0.5">{value}</div>
    </div>
  );
}
