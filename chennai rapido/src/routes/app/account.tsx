import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell, ChevronRight, Globe, HelpCircle, LogOut, Mic, Moon, Settings, Wallet,
  MapPin, Plus, Trash2, ShieldCheck, Heart, User, Check, Edit2, Camera, UserPlus
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAppStore, store, translate } from "@/lib/store";
import { api } from "../../lib/api";

export const Route = createFileRoute("/app/account")({
  head: () => ({ meta: [{ title: "Account · Rideuu" }] }),
  component: Account,
});

function Account() {
  const { language, theme, womenSafetyMode, profile, savedAddresses, trustedContacts, token } = useAppStore();

  // Drawer & Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editPhone, setEditPhone] = useState(profile.phone);
  const [editSosPin, setEditSosPin] = useState(profile.sosPin || "1234");

  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [avgRating, setAvgRating] = useState<string>("N/A");

  useEffect(() => {
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone);
    setEditSosPin(profile.sosPin || "1234");
  }, [profile]);

  useEffect(() => {
    if (token) {
      store.loadUserData();
      api.getRides(token).then((res) => {
        if (res && Array.isArray(res)) {
          const completed = res.filter((r: any) => r.status === "completed");
          setCompletedCount(completed.length);

          const ratedRides = completed.filter((r: any) => r.rating_customer);
          if (ratedRides.length > 0) {
            const sum = ratedRides.reduce((acc: number, curr: any) => acc + curr.rating_customer, 0);
            setAvgRating((sum / ratedRides.length).toFixed(1));
          } else {
            setAvgRating("N/A");
          }
        } else {
          setCompletedCount(0);
          setAvgRating("N/A");
        }
      });
    } else {
      setCompletedCount(0);
      setAvgRating("N/A");
    }
  }, [token]);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState("");
  const [newAddrVal, setNewAddrVal] = useState("");

  const [showContactModal, setShowContactModal] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: string) => translate(key, language);

  const handleSaveProfile = async () => {
    store.updateProfile({
      name: editName,
      email: editEmail,
      phone: editPhone,
      sosPin: editSosPin,
    });

    if (token) {
      try {
        const userMe = await api.getMe(token);
        if (userMe && userMe.id) {
          await api.updateUser(userMe.id, {
            name: editName,
            email: editEmail,
            phone: editPhone,
            sos_pin: editSosPin
          }, token);
        }
      } catch (err) {
        console.warn("Failed to sync profile changes to backend:", err);
      }
    }
    setIsEditingProfile(false);
  };

  const handleAddAddress = () => {
    if (!newAddrLabel || !newAddrVal) return;
    store.addAddress({
      id: "addr_" + Date.now(),
      label: newAddrLabel,
      tamilLabel: newAddrLabel,
      address: newAddrVal,
      icon: "star"
    });
    setNewAddrLabel("");
    setNewAddrVal("");
    setShowAddressModal(false);
  };

  const handleAddContact = () => {
    if (!newContactName || !newContactPhone) return;
    store.addTrustedContact({
      id: "contact_" + Date.now(),
      name: newContactName,
      phone: newContactPhone
    });
    setNewContactName("");
    setNewContactPhone("");
    setShowContactModal(false);
  };

  // Mock Avatar Upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        store.updateProfile({
          avatar: reader.result as string
        });
        store.addNotification({
          cat: "alerts",
          title: "Profile Image Uploaded",
          tamilTitle: "சுயவிவரப் படம் பதிவேற்றப்பட்டது",
          body: "Your profile picture was successfully updated.",
          tamilBody: "உங்கள் சுயவிவரப் படம் வெற்றிகரமாக புதுப்பிக்கப்பட்டது."
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">
      {/* Header Profile Summary */}
      <header className="relative overflow-hidden bg-secondary text-secondary-foreground">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/25 blur-2xl" />
        <div className="relative px-5 pt-12 pb-6">
          <div className="flex items-center gap-4">
            {/* Avatar Drop Zone */}
            <div
              onClick={handleAvatarClick}
              className="group relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-secondary-foreground/20 bg-background shadow-md"
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center bg-primary text-xl font-extrabold text-primary-foreground">
                  {profile.name[0]}
                </div>
              )}
              <div className="absolute inset-0 grid place-items-center bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200">
                <Camera className="size-5 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
                {profile.name}
                <button onClick={() => setIsEditingProfile(true)} className="text-secondary-foreground/60 hover:text-secondary-foreground transition">
                  <Edit2 className="size-3.5" />
                </button>
              </h1>
              <p className="text-xs opacity-85 mt-0.5">{profile.phone} · {profile.email}</p>
            </div>
            <Link to="/login" onClick={() => store.logout()} className="rounded-full border border-secondary-foreground/20 bg-secondary-foreground/5 px-3 py-1.5 text-[11px] font-bold shadow-sm transition hover:bg-secondary-foreground/10">
              {language === "en" ? "Switch Account" : "மாற்று"}
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center font-semibold">
            {[
              { v: completedCount !== null ? String(completedCount) : "0", l: "Trips", tl: "பயணங்கள்" },
              { v: avgRating, l: "Rating", tl: "மதிப்பீடு" },
              { v: `₹${store.getState().wallet.balance.toFixed(0)}`, l: "Wallet", tl: "நம்ம கேஷ்" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl bg-secondary-foreground/10 p-2.5 backdrop-blur-sm border border-secondary-foreground/5">
                <div className="text-base font-extrabold text-primary">{s.v}</div>
                <div className="text-[9px] uppercase tracking-wider opacity-85 mt-0.5">
                  {language === "en" ? s.l : s.tl}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="checkered-sm h-1.5 w-full" />
      </header>

      {/* Main Account Settings panels */}
      <div className="px-4 pt-4 space-y-6">

        {/* Core Quick Links */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Quick Links</h2>

          <Link to="/app/wallet" className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm hover:border-primary/30 transition">
            <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="size-4.5" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-extrabold">{t("Wallet & payments")}</div>
              <div className="text-[10px] text-muted-foreground">Manage cards, UPI and recharge Namma Cash</div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>

          {/* Language Switch */}
          <button
            onClick={() => store.setLanguage(language === "en" ? "ta" : "en")}
            className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm hover:border-primary/30 transition text-left"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-violet-500/10 text-violet-500">
              <Globe className="size-4.5" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-extrabold">{t("Language & Region")}</div>
              <div className="text-[10px] text-muted-foreground">English / தமிழ் - Switch languages instantly</div>
            </div>
            <span className="rounded bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-600 uppercase">
              {language === "en" ? "EN" : "தமிழ்"}
            </span>
          </button>

          {/* Theme switch */}
          <button
            onClick={() => store.setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm hover:border-primary/30 transition text-left"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <Moon className="size-4.5" />
            </span>
            <div className="flex-1">
              <div className="text-sm font-extrabold">{theme === "dark" ? "Dark Premium Map Mode" : "Light Premium Map Mode"}</div>
              <div className="text-[10px] text-muted-foreground">Toggle browser layout and maps brightness</div>
            </div>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 uppercase">
              {theme.toUpperCase()}
            </span>
          </button>
        </section>

        {/* Saved Places (Address Shortcuts) */}
        <section className="space-y-2">
          <div className="flex items-center justify-between pl-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("Saved addresses")}</h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              <Plus className="size-3.5" /> {language === "en" ? "Add Place" : "சேர்"}
            </button>
          </div>

          <div className="grid gap-2">
            {savedAddresses.map((addr) => (
              <div key={addr.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                    <MapPin className="size-4.5" />
                  </div>
                  <div>
                    <div className="text-sm font-extrabold flex items-center gap-1.5">
                      {language === "en" ? addr.label : addr.tamilLabel}
                    </div>
                    <div className="text-[11px] text-muted-foreground pr-2 line-clamp-1">{addr.address}</div>
                  </div>
                </div>
                <button
                  onClick={() => store.deleteAddress(addr.id)}
                  className="grid size-8 place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Trusted Emergency Contacts */}
        <section className="space-y-2">
          <div className="flex items-center justify-between pl-1">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t("Trusted contacts")}</h2>
            <button
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
            >
              <UserPlus className="size-3.5" /> {t("Add")}
            </button>
          </div>

          <div className="grid gap-2">
            {trustedContacts.map((contact) => (
              <div key={contact.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary text-xs font-extrabold">
                    {contact.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-extrabold">{contact.name}</div>
                    <div className="text-[11px] text-muted-foreground">{contact.phone}</div>
                  </div>
                </div>
                <button
                  onClick={() => store.deleteTrustedContact(contact.id)}
                  className="grid size-8 place-items-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Ride Customization & Privacy Settings */}
        <section className="space-y-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">{t("Ride preferences")}</h2>
          <div className="rounded-2xl border border-border bg-card p-3 space-y-4 shadow-sm">

            {/* Women safety Mode */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold flex items-center gap-1 text-primary">
                  <ShieldCheck className="size-3.5" /> {t("Women safety mode")}
                </div>
                <p className="text-[10px] text-muted-foreground">Prioritizes high safety routing and female rider matching</p>
              </div>
              <button
                onClick={() => {
                  if (!womenSafetyMode) {
                    if (profile.gender?.toLowerCase() !== "female") {
                      alert("Women Safety Mode can only be activated for female gender profiles.");
                      return;
                    }
                  }
                  store.setWomenSafetyMode(!womenSafetyMode);
                }}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${womenSafetyMode ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`inline-block size-4 transform rounded-full bg-background shadow transition ${womenSafetyMode ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Silence mode */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold flex items-center gap-1">
                  <Mic className="size-3.5 text-muted-foreground" /> Quiet Mode Preferred
                </div>
                <p className="text-[10px] text-muted-foreground">Driver notified to keep chat to a minimum during transit</p>
              </div>
              <button
                onClick={() => store.updateProfile({ ridePreference: profile.ridePreference === "silent" ? "regular" : "silent" })}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${profile.ridePreference === "silent" ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`inline-block size-4 transform rounded-full bg-background shadow transition ${profile.ridePreference === "silent" ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>

            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-extrabold flex items-center gap-1">
                  <Bell className="size-3.5 text-muted-foreground" /> {t("Notifications")}
                </div>
                <p className="text-[10px] text-muted-foreground">Receive push updates for arrival, wallet recharge and offers</p>
              </div>
              <button
                onClick={() => store.updateProfile({ notificationsEnabled: !profile.notificationsEnabled })}
                className={`relative inline-flex h-5 w-10 items-center rounded-full transition ${profile.notificationsEnabled ? "bg-primary" : "bg-muted"}`}
              >
                <span className={`inline-block size-4 transform rounded-full bg-background shadow transition ${profile.notificationsEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
        </section>

        {/* Sign Out Button */}
        <section className="pt-2">
          <Link to="/login" onClick={() => store.logout()} className="flex items-center justify-center gap-2 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm font-extrabold text-destructive shadow-sm active:scale-[0.99] transition">
            <LogOut className="size-4" /> {t("Sign out")}
          </Link>
          <p className="mt-4 text-center text-[10px] text-muted-foreground">Rideuu · v1.2 · Designed and engineered in Chennai</p>
        </section>
      </div>

      {/* 1. Edit Profile Drawer overlay */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="text-base font-extrabold flex items-center gap-2"><User className="size-4" /> Edit Profile</h2>
              <button onClick={() => setIsEditingProfile(false)} className="text-xs font-bold text-muted-foreground">Cancel</button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block">
                <span className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">Full Name</span>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">Email Address</span>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">Phone Number</span>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary"
                />
              </label>
              <label className="block">
                <span className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">Emergency SOS PIN</span>
                <input
                  type="text"
                  maxLength={4}
                  value={editSosPin}
                  onChange={(e) => setEditSosPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="e.g. 1234"
                  className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary"
                />
              </label>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full rounded-2xl bg-primary py-4 text-xs font-extrabold text-primary-foreground shadow"
            >
              Save Profile
            </button>
          </div>
        </div>
      )}

      {/* 2. Add Address Shortcut Dialog */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in">
            <h2 className="text-base font-extrabold">Add Saved Place</h2>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Label (e.g. Gym, Library, Amma's House)"
                value={newAddrLabel}
                onChange={(e) => setNewAddrLabel(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary"
              />
              <textarea
                placeholder="Full Chennai Address Details..."
                value={newAddrVal}
                onChange={(e) => setNewAddrVal(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 h-20 font-semibold outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddAddress}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow"
              >
                Save Address
              </button>
              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 rounded-xl border border-border bg-card py-3 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add Trusted Contact Dialog */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 space-y-4 animate-scale-in">
            <h2 className="text-base font-extrabold">Add Trusted Contact</h2>
            <p className="text-[11px] text-muted-foreground">This person will automatically receive live SMS tracking URLs for emergency SOS dispatches.</p>
            <div className="space-y-3 text-xs">
              <input
                type="text"
                placeholder="Contact Name (e.g. Appa, Sister)"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary"
              />
              <input
                type="tel"
                placeholder="Mobile Number (+91 99999 12345)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="w-full rounded-xl border border-border bg-background p-3 font-semibold outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddContact}
                className="flex-1 rounded-xl bg-primary py-3 text-xs font-bold text-primary-foreground shadow"
              >
                Add Contact
              </button>
              <button
                onClick={() => setShowContactModal(false)}
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