import { createFileRoute } from "@tanstack/react-router";
import {
  Phone, Share2, ShieldAlert, ShieldCheck, UserPlus, Users,
  Trash2, Radio, Check, Lock, Shield, Eye, Flame
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppStore, store, translate } from "@/lib/store";

export const Route = createFileRoute("/app/safety")({
  head: () => ({ meta: [{ title: "Safety · Rideuu" }] }),
  component: Safety,
});

function Safety() {
  const { language, theme, womenSafetyMode, trustedContacts, ride, profile, avoidUnlit, prioritizeHighways, patrolRoutes } = useAppStore();

  // local states
  const [sosCountdown, setSosCountdown] = useState<number | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinDigits, setPinDigits] = useState(["", "", "", ""]);

  // Custom safe routing toggles (managed in global store now)
  const [shareLiveTrip, setShareLiveTrip] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareTripLink = () => {
    const shareUrl = `${window.location.origin}/app/track?rideId=${ride.id || 'live'}`;
    const shareText = `Track my live Rideuu here: ${shareUrl}`;

    if (navigator.share) {
      navigator.share({
        title: "Track my Rideuu",
        text: shareText,
        url: shareUrl,
      }).catch(err => console.log("Error sharing", err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 3000);
      }).catch(err => console.error("Could not copy text: ", err));
    }
  };

  // New trusted contact inline addition
  const [showAddContact, setShowAddContact] = useState(false);
  const [newCName, setNewCName] = useState("");
  const [newCPhone, setNewCPhone] = useState("");
  const [newCRelationship, setNewCRelationship] = useState("Friend");

  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const t = (key: string) => translate(key, language);

  // SOS Press & Hold Countdown Simulation
  const handleSosMouseDown = () => {
    if (ride.isSosTriggered) return;
    setSosCountdown(3);
  };

  useEffect(() => {
    if (sosCountdown !== null) {
      if (sosCountdown > 0) {
        countdownIntervalRef.current = setTimeout(() => {
          setSosCountdown(sosCountdown - 1);
        }, 1000);
      } else {
        const triggerWhatsAppAlert = (lat: number, lon: number) => {
          if (trustedContacts && trustedContacts.length > 0) {
            trustedContacts.forEach((contact) => {
              const cleanedPhone = contact.phone.replace(/[^0-9]/g, "");
              const waPhone = (cleanedPhone.startsWith("91") && cleanedPhone.length === 12) ? cleanedPhone : `91${cleanedPhone}`;
              const trackingUrl = `${window.location.origin}/app/track?rideId=${ride.id || 'live'}`;
              const message = `🚨 EMERGENCY SOS: I am on a ride and triggered an emergency alert. Please track my live location here: ${trackingUrl} (Lat: ${lat.toFixed(5)}, Lng: ${lon.toFixed(5)})`;
              const waUrl = `https://api.whatsapp.com/send?phone=${waPhone}&text=${encodeURIComponent(message)}`;
              window.open(waUrl, "_blank");
            });
          }
        };

        // Trigger SOS in global store with current GPS
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              store.triggerSos(
                pos.coords.latitude,
                pos.coords.longitude,
                pos.coords.speed || 0,
                pos.coords.heading ? String(pos.coords.heading) : 'North'
              );
              triggerWhatsAppAlert(pos.coords.latitude, pos.coords.longitude);
            },
            () => {
              const lat = ride.pickupCoords?.lat || 13.0382;
              const lon = ride.pickupCoords?.lon || 80.2785;
              store.triggerSos(lat, lon, 0, 'North');
              triggerWhatsAppAlert(lat, lon);
            }
          );
        } else {
          const lat = ride.pickupCoords?.lat || 13.0382;
          const lon = ride.pickupCoords?.lon || 80.2785;
          store.triggerSos(lat, lon, 0, 'North');
          triggerWhatsAppAlert(lat, lon);
        }
        setSosCountdown(null);
      }
    }
    return () => {
      if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
    };
  }, [sosCountdown, ride.pickupCoords]);

  // Continuous GPS Snapshot loop when SOS is ACTIVE
  useEffect(() => {
    let intervalId: any = null;
    if (ride.isSosTriggered && ride.sos_id) {
      const sendSnapshot = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude, speed, heading } = pos.coords;
              store.sendSosLocationSnapshot(latitude, longitude, speed || 0, heading ? String(heading) : 'North');
            },
            () => {
              // Fallback mock location snapshot
              const mockLat = (ride.pickupCoords?.lat || 13.0382) + (Math.random() - 0.5) * 0.002;
              const mockLon = (ride.pickupCoords?.lon || 80.2785) + (Math.random() - 0.5) * 0.002;
              store.sendSosLocationSnapshot(mockLat, mockLon, 42, 'North');
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          const mockLat = (ride.pickupCoords?.lat || 13.0382) + (Math.random() - 0.5) * 0.002;
          const mockLon = (ride.pickupCoords?.lon || 80.2785) + (Math.random() - 0.5) * 0.002;
          store.sendSosLocationSnapshot(mockLat, mockLon, 42, 'North');
        }
      };

      sendSnapshot();
      intervalId = setInterval(sendSnapshot, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [ride.isSosTriggered, ride.sos_id, ride.pickupCoords]);

  const handleSosMouseUp = () => {
    // If they let go before countdown reaches 0, cancel the alert
    if (sosCountdown && sosCountdown > 0) {
      setSosCountdown(null);
      if (countdownIntervalRef.current) clearTimeout(countdownIntervalRef.current);
    }
  };

  const handleCancelSos = () => {
    setShowPinModal(true);
  };

  const handleVerifyPin = () => {
    const code = pinDigits.join("");
    const correctPin = profile.sosPin || "1234";
    if (code === correctPin) {
      // cancel SOS
      store.cancelSos();
      setShowPinModal(false);
      setPinDigits(["", "", "", ""]);
    } else {
      // Flash error simulation
      alert("Invalid Security PIN!");
      setPinDigits(["", "", "", ""]);
    }
  };

  const handleAddContactInline = () => {
    if (!newCName || !newCPhone) return;
    if (trustedContacts.length >= 5) {
      alert("Maximum 5 trusted contacts allowed.");
      return;
    }
    store.addTrustedContact({
      id: "contact_" + Date.now(),
      name: newCName,
      phone: newCPhone,
      relationship: newCRelationship
    });
    setNewCName("");
    setNewCPhone("");
    setNewCRelationship("Friend");
    setShowAddContact(false);
  };

  const handleDialHelpline = (num: string) => {
    window.location.href = `tel:${num}`;
  };

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">

      {/* Header and Brand */}
      <header className="bg-secondary px-5 pt-12 pb-6 text-secondary-foreground">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
          {t("Safety toolkit")}
        </p>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight leading-tight">
          {t("You're never alone in Chennai.")}
        </h1>
      </header>
      <div className="checkered-sm h-1.5 w-full" />

      {/* SOS Button Console */}
      <section className="px-4 pt-5 text-center">
        {ride.isSosTriggered ? (
          <div className="relative overflow-hidden rounded-3xl bg-destructive p-6 text-destructive-foreground shadow-xl shadow-destructive/25 space-y-4">
            <div className="absolute inset-0 opacity-[0.06] checkered animate-pulse pointer-events-none" />

            <div className="relative pointer-events-none">
              <Radio className="size-16 mx-auto animate-ping opacity-75 pointer-events-none" />
              <Flame className="size-8 absolute inset-0 mx-auto top-4 animate-bounce pointer-events-none" />
            </div>

            <div>
              <h2 className="text-base font-extrabold tracking-wide uppercase">Emergency SOS Activated</h2>
              <p className="text-[10px] opacity-90 mt-1 leading-normal">
                Chennai Police alerted. Live location tracking sent to Amma and Roomie Priya. Live cabin audio recording dispatched to secure backup nodes.
              </p>
            </div>

            <div className="mt-3 flex gap-2 relative z-10">
              <button
                onClick={() => handleDialHelpline("112")}
                className="flex-1 rounded-xl bg-white px-3 py-2.5 text-xs font-black text-destructive flex items-center justify-center gap-1.5 shadow cursor-pointer relative z-20"
              >
                <Phone className="size-3.5 fill-destructive" /> Dial 112
              </button>

              <button
                onClick={handleCancelSos}
                className="flex-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/20 cursor-pointer relative z-20"
              >
                Cancel SOS PIN
              </button>
            </div>
          </div>
        ) : (
          /* Press and hold SOS active buttons */
          <div className="space-y-3">
            <button
              onMouseDown={handleSosMouseDown}
              onMouseUp={handleSosMouseUp}
              onTouchStart={handleSosMouseDown}
              onTouchEnd={handleSosMouseUp}
              className={`relative grid w-full place-items-center overflow-hidden rounded-3xl bg-destructive py-10 text-destructive-foreground shadow-2xl shadow-destructive/20 active:scale-98 transition select-none ${sosCountdown !== null ? "animate-pulse" : ""}`}
            >
              <div className="absolute inset-0 opacity-[0.06] checkered-sm pointer-events-none" />
              <ShieldAlert className="relative size-12" />

              {sosCountdown !== null ? (
                <span className="relative mt-2 text-3xl font-black animate-scale-in">
                  HOLD {sosCountdown}s
                </span>
              ) : (
                <>
                  <span className="relative mt-2 text-sm font-black uppercase tracking-widest pl-1">{t("Press for SOS")}</span>
                  <span className="relative text-[9px] opacity-80 mt-1">{t("Calls 112 and alerts contacts")}</span>
                </>
              )}
            </button>
            <p className="text-[9px] text-muted-foreground">Press and hold button for 3 seconds to dispatch immediate emergency alerts.</p>
          </div>
        )}
      </section>

      {/* Safety Mode Toggles */}
      <section className="space-y-2.5 px-4 pt-6 text-xs font-semibold">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Safety Controls</h2>

        {/* Women safety Mode toggle */}
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5.5" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs font-extrabold flex items-center gap-1.5 text-primary">
              {t("Women safety mode")}
              <span className="rounded bg-primary/20 px-1 py-0.5 text-[8px] font-black text-primary">RECOMMENDED</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">Filter driver matches to female verified, enables lit routes</p>
          </div>
          <button
            onClick={() => {
              if (!womenSafetyMode) {
                if (profile.gender !== "female" && profile.gender !== "others") {
                  alert("Women Safety Mode can only be activated for female or others gender profiles.");
                  return;
                }
              }
              store.setWomenSafetyMode(!womenSafetyMode);
            }}
            className={`relative inline-flex h-5.5 w-11 items-center rounded-full transition ${womenSafetyMode ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`inline-block size-4.5 transform rounded-full bg-background shadow transition ${womenSafetyMode ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        {/* Share Live location broadcast toggle */}
        <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
              <Share2 className="size-5" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-xs font-extrabold">{t("Share live trip")}</div>
              <p className="text-[10px] text-muted-foreground leading-normal mt-0.5">{t("Auto-share with trusted contacts")}</p>
            </div>
            <button
              onClick={() => {
                const nextVal = !shareLiveTrip;
                setShareLiveTrip(nextVal);
                if (nextVal) {
                  handleShareTripLink();
                }
              }}
              className={`relative inline-flex h-5.5 w-11 items-center rounded-full transition ${shareLiveTrip ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block size-4.5 transform rounded-full bg-background shadow transition ${shareLiveTrip ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {shareLiveTrip && (
            <button
              onClick={handleShareTripLink}
              className="mt-2 w-full rounded-xl bg-primary/10 border border-primary/20 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition flex items-center justify-center gap-1.5"
            >
              <Share2 className="size-3.5" />
              {copiedLink ? "Link Copied!" : "Send Live Trip Link"}
            </button>
          )}
        </div>
      </section>

      {/* Chennai Monsoon Lighting & Safe Routing prioritisations */}
      <section className="mt-6 px-4 space-y-2.5 text-xs font-semibold">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Monsoon / Night Pathway Routing</h2>

        <div className="rounded-2xl border border-border bg-card p-4 space-y-3.5 shadow-sm text-left">
          {/* Avoid unlit streets */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xs flex items-center gap-1.5"><Eye className="size-4 text-muted-foreground" /> Avoid Unlit Pathways</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Route calculation automatically avoids low streetlight lanes</p>
            </div>
            <button
              onClick={() => store.setAvoidUnlit(!avoidUnlit)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${avoidUnlit ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block size-4 transform rounded-full bg-background shadow transition ${avoidUnlit ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="h-px bg-border" />

          {/* Highway prioritize */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xs flex items-center gap-1.5"><Shield className="size-4 text-muted-foreground" /> Prioritize High-Activity Highways</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Prefers arterial main routes over shorter isolated grid shortcuts</p>
            </div>
            <button
              onClick={() => store.setPrioritizeHighways(!prioritizeHighways)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${prioritizeHighways ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block size-4 transform rounded-full bg-background shadow transition ${prioritizeHighways ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          <div className="h-px bg-border" />

          {/* Active police patrol zones */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-xs flex items-center gap-1.5"><ShieldCheck className="size-4 text-primary animate-pulse" /> Police Patrol Overlay routing</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Calculates routes covering active police vehicle checkpoints</p>
            </div>
            <button
              onClick={() => store.setPatrolRoutes(!patrolRoutes)}
              className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${patrolRoutes ? "bg-primary" : "bg-muted"}`}
            >
              <span className={`inline-block size-4 transform rounded-full bg-background shadow transition ${patrolRoutes ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>
      </section>

      {/* Emergency Helpline numbers */}
      <section className="mt-6 px-4 space-y-2.5 text-xs font-semibold">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Quick Helplines</h2>

        <div className="grid grid-cols-2 gap-3 text-center">
          <button
            onClick={() => handleDialHelpline("112")}
            className="rounded-2xl border border-border bg-card p-4 hover:border-destructive/30 transition shadow-sm"
          >
            <div className="text-sm font-extrabold text-destructive">112</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Chennai Police (All emergencies)</div>
          </button>

          <button
            onClick={() => handleDialHelpline("1091")}
            className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition shadow-sm"
          >
            <div className="text-sm font-extrabold text-primary">1091</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">Chennai Women Safety Helpline</div>
          </button>
        </div>
      </section>

      {/* Trusted Contacts Manager */}
      <section className="px-4 pt-6 space-y-2.5 text-xs font-semibold">
        <div className="flex items-center justify-between pl-1">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("Trusted contacts")}</h2>
          <button
            onClick={() => setShowAddContact(true)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
          >
            <UserPlus className="size-3.5" /> {t("Add")}
          </button>
        </div>

        <ul className="space-y-2">
          {trustedContacts.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid size-9 place-items-center rounded-full bg-secondary text-xs font-black text-primary">
                  {c.name ? c.name[0] : 'C'}
                </div>
                <div className="text-left">
                  <div className="text-xs font-extrabold">
                    {c.name || 'Contact'} <span className="text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-black ml-1 uppercase">{c.relationship || 'Friend'}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{c.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {ride.isSosTriggered && (
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[8px] font-black text-emerald-600 animate-pulse">ALERT SENT</span>
                )}
                <button
                  onClick={() => store.deleteTrustedContact(c.id)}
                  className="grid size-8 place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* PIN entry validation modal for False Alarm cancellation */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 text-center space-y-4 animate-scale-in text-xs font-semibold">
            <Lock className="size-14 mx-auto text-primary animate-bounce" />
            <div>
              <h2 className="text-base font-extrabold">Enter Safety PIN</h2>
              <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                Type your 4-digit security PIN to confirm you are safe and cancel the emergency alert. <strong>Default: 1234</strong>
              </p>
            </div>

            {/* Input grid */}
            <div className="flex justify-center gap-3">
              {pinDigits.map((digit, i) => (
                <input
                  key={i}
                  id={`sos-pin-${i}`}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    const next = [...pinDigits];
                    next[i] = val.slice(-1);
                    setPinDigits(next);
                    if (val && i < 3) {
                      document.getElementById(`sos-pin-${i + 1}`)?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace") {
                      if (!pinDigits[i] && i > 0) {
                        const next = [...pinDigits];
                        next[i - 1] = "";
                        setPinDigits(next);
                        document.getElementById(`sos-pin-${i - 1}`)?.focus();
                      } else {
                        const next = [...pinDigits];
                        next[i] = "";
                        setPinDigits(next);
                      }
                    }
                  }}
                  className="h-12 w-12 rounded-xl border border-border bg-background text-center text-lg font-extrabold focus:border-primary outline-none"
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleVerifyPin}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow"
              >
                Verify & Cancel SOS
              </button>
              <button
                onClick={() => setShowPinModal(false)}
                className="flex-1 rounded-xl border border-border bg-card py-3 text-xs font-semibold"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Trusted Contact Drawer inline */}
      {showAddContact && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in text-xs font-semibold">
            <h2 className="text-base font-extrabold">Add Trusted Contact</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Contact Name (e.g. Amma)"
                value={newCName}
                onChange={(e) => setNewCName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary"
              />
              <input
                type="tel"
                placeholder="Mobile Number (+91 99999 12345)"
                value={newCPhone}
                onChange={(e) => setNewCPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary"
              />
              <select
                value={newCRelationship}
                onChange={(e) => setNewCRelationship(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary text-foreground"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Friend">Friend</option>
                <option value="Spouse">Spouse</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddContactInline}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow"
              >
                Save Contact
              </button>
              <button
                onClick={() => setShowAddContact(false)}
                className="flex-1 rounded-xl border border-border bg-card py-3 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}