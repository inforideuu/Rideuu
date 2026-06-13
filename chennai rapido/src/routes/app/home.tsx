import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell, Bike, CalendarClock, Globe, MapPin, Mic, Receipt, ShieldAlert,
  Sparkles, Star, CloudRain, AlertTriangle, ArrowRight, Compass, ChevronRight
} from "lucide-react";
import { useAppStore, store, translate } from "@/lib/store";

export const Route = createFileRoute("/app/home")({
  head: () => ({ meta: [{ title: "Home · Rideuu" }] }),
  component: Home,
});

function Home() {
  const { language, theme, profile, savedAddresses, notifications, wallet } = useAppStore();
  const navigate = useNavigate();

  const t = (key: string) => translate(key, language);
  const unreadNotifications = notifications.filter(n => n.unread).length;

  const handleQuickBook = (destLabel: string, destAddr: string) => {
    // Save destination to store
    store.update((s) => {
      s.ride.drop = destLabel + " · " + destAddr;
      s.ride.step = "vehicle";
    });
    navigate({ to: "/app/book" });
  };

  const handleMicClick = () => {
    navigate({ to: "/app/voice" });
  };

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">

      {/* Header Profile Panel */}
      <header className="relative overflow-hidden bg-secondary text-secondary-foreground">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary/20 blur-2xl animate-pulse" />
        <div className="relative flex items-center justify-between px-5 pt-12 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {language === "en" ? `வணக்கம், ${profile.name.split(" ")[0]}` : `வணக்கம், ${profile.name.split(" ")[0]}`}
            </p>
            <h1 className="mt-1 text-xl font-extrabold tracking-tight">
              {t("Where to today?")}
            </h1>
          </div>
          <Link
            to="/app/notifications"
            className="relative grid size-10 place-items-center rounded-2xl bg-secondary-foreground/10 border border-secondary-foreground/5 shadow-sm active:scale-95 transition"
          >
            <Bell className="size-4.5" />
            {unreadNotifications > 0 && (
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[8px] font-black text-primary-foreground animate-bounce">
                {unreadNotifications}
              </span>
            )}
          </Link>
        </div>
        <div className="checkered-sm h-1.5 w-full" />
      </header>

      {/* Chennai Dynamic Monsoon/Surge Alert Block */}
      <section className="px-4 mt-4">
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 animate-bounce">
            <AlertTriangle className="size-4.5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
              Chennai Rain Advisory <CloudRain className="size-3.5 text-amber-500" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
              {language === "en"
                ? "Waterlogging reported near Velachery & OMR hubs. Auto-flood routing enabled. Safe pathways prioritized."
                : "வேளச்சேரி மற்றும் ஓஎம்ஆர் பகுதிகளில் வெள்ளப்பெருக்கு. மாற்றுப்பாதை பாதுகாப்புடன் இயக்கப்படுகிறது."}
            </p>
          </div>
        </div>
      </section>

      {/* Search Input panel */}
      <section className="mt-4 px-4">
        <div
          onClick={() => navigate({ to: "/app/book" })}
          className="relative block rounded-2xl border border-border bg-card p-4 shadow-md shadow-black/5 hover:border-primary/30 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
              <MapPin className="size-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{t("Search destination")}</div>
              <div className="text-xs font-extrabold text-foreground/80 mt-0.5">
                {language === "en" ? "Where would you like to ride?" : "எங்கு செல்ல விரும்புகிறீர்கள்?"}
              </div>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleMicClick(); }}
              className="relative grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground shadow active:scale-95 transition"
            >
              <Mic className="size-4.5 text-primary" />
              <span className="absolute -inset-1.5 rounded-full border border-primary/20 animate-ping opacity-60" />
            </button>
          </div>
        </div>
      </section>

      {/* Quick Bike/Auto options comparison */}
      <section className="mt-6 px-4">
        <div className="mb-3 flex items-end justify-between px-1">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground">{t("Quick ride")}</h2>
          <Link to="/app/book" className="text-xs font-bold text-primary hover:underline">
            {language === "en" ? "All Options →" : "அனைத்து வழிகள் →"}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuickBook("Marina Beach", "Besant Nagar, Beach Road")}
            className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:border-primary/30 active:scale-[0.99] transition"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bike className="size-5" />
            </div>
            <div className="mt-4 text-sm font-extrabold">{t("Bike")}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">From ₹35 · arrives 2 min</div>
          </button>

          <button
            onClick={() => handleQuickBook("Central Station", "Park Town, Chennai Central")}
            className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm hover:border-primary/30 active:scale-[0.99] transition"
          >
            <div className="grid size-9 place-items-center rounded-xl bg-secondary text-primary font-black text-sm">
              A
            </div>
            <div className="mt-4 text-sm font-extrabold">{t("Auto")}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">From ₹65 · arrives 4 min</div>
          </button>
        </div>
      </section>

      {/* Chennai Essentials Hub Shortcuts */}
      <section className="mt-6 px-4">
        <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground px-1">{t("Chennai essentials")}</h2>
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { icon: ShieldAlert, label: t("SOS"), to: "/app/safety", tint: "bg-destructive/10 text-destructive border-destructive/20" },
            { icon: CalendarClock, label: t("Schedule"), to: "/app/schedule", tint: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
            { icon: Receipt, label: t("Fare"), to: "/app/fare", tint: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
            { icon: Globe, label: t("Language"), to: "/app/language", tint: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
          ].map(({ icon: Icon, label, to, tint }) => (
            <Link
              key={label}
              to={to}
              className={`flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm hover:border-primary/30 active:scale-95 transition`}
            >
              <span className={`grid size-9 place-items-center rounded-xl border ${tint}`}>
                <Icon className="size-4" />
              </span>
              <span className="text-[10px] font-extrabold tracking-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* One-Tap Saved Addresses shortcuts */}
      <section className="mt-6 px-4">
        <h2 className="mb-3 text-sm font-black uppercase tracking-widest text-muted-foreground px-1">{t("Saved addresses")}</h2>
        <ul className="space-y-2">
          {savedAddresses.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => handleQuickBook(p.label, p.address)}
                className="w-full flex items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left shadow-sm hover:border-primary/30 transition"
              >
                <div className="grid size-9 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <MapPin className="size-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-extrabold">{language === "en" ? p.label : p.tamilLabel}</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1">{p.address}</div>
                </div>
                <ChevronRight className="size-3.5 text-muted-foreground shrink-0" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Chennai Local Referral & Streak Banner */}
      <section className="mt-6 px-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 p-5 text-card-foreground">
          <div className="absolute right-0 top-0 h-full w-24 checkered-sm opacity-20" />
          <div className="relative space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-primary">
              <Sparkles className="size-3" /> CHENNAI FESTIVALS SPECIAL
            </span>
            <h3 className="text-sm font-black tracking-tight">{t("First ride offer") || "First Ride Offer"}</h3>
            <p className="text-xs font-bold text-primary">{t("Save 50% up to ₹75") || "Save 50% up to ₹75"}</p>
            <p className="text-[10px] text-muted-foreground">
              {t("Use code")} <strong className="text-secondary font-black">CHENNAI50</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}