import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Globe, Mic, MapPin } from "lucide-react";
import { useAppStore, store, translate } from "@/lib/store";

export const Route = createFileRoute("/app/language")({
  component: LanguagePage,
});

const langs = [
  { id: "en" as const, label: "English", native: "English", sample: "Where would you like to go?" },
  { id: "ta" as const, label: "Tamil", native: "தமிழ்", sample: "எங்கு செல்ல விரும்புகிறீர்கள்?" },
];

const regions = [
  { id: "chn", label: "Chennai Central & North", tamil: "சென்னை மத்திய & வடக்கு" },
  { id: "sou", label: "South Chennai (Adyar & OMR)", tamil: "தென் சென்னை" },
  { id: "wes", label: "West Chennai (Anna Nagar)", tamil: "மேற்கு சென்னை" },
];

function LanguagePage() {
  const { language, profile } = useAppStore();
  const [app, setApp] = useState(language);
  const [voice, setVoice] = useState(language === "en" ? "en" : "ta");
  const [region, setRegion] = useState("chn");

  const handleSelectLanguage = (lang: "en" | "ta") => {
    setApp(lang);
    store.setLanguage(lang);
    
    store.addNotification({
      cat: "alerts",
      title: "Language preference updated",
      tamilTitle: "மொழி விருப்பம் புதுப்பிக்கப்பட்டது",
      body: `App language successfully set to ${lang === "en" ? "English" : "Tamil"}.`,
      tamilBody: `செயலி மொழி வெற்றிகரமாக தமிழ் என அமைக்கப்பட்டது.`
    });
  };

  const handleSelectVoiceLang = (lang: string) => {
    setVoice(lang);
    store.update((s) => {
      s.profile.ridePreference = lang === "ta" ? "tamil-voice" : "silent";
    });
  };

  const handleSelectRegion = (id: string) => {
    setRegion(id);
    store.addNotification({
      cat: "alerts",
      title: "Region Preference Locked",
      tamilTitle: "பிராந்திய விருப்பம் பூட்டப்பட்டது",
      body: `Your location tracking optimized for ${regions.find(r => r.id === id)?.label}.`,
      tamilBody: `இருப்பிடக் கண்காணிப்பு சென்னை பகுதிக்கு உகந்ததாக மாற்றப்பட்டது.`
    });
  };

  return (
    <div className="pb-24 text-foreground transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
        <Link to="/app/account" className="grid size-9 place-items-center rounded-xl bg-muted">
          <ArrowLeft className="size-4" />
        </Link>
        <div className="text-left">
          <h1 className="text-base font-extrabold tracking-tight">Language & Region</h1>
          <p className="text-[10px] text-muted-foreground font-semibold">
            மொழி மற்றும் பகுதி
          </p>
        </div>
      </header>

      <div className="space-y-6 p-4">
        
        {/* App language selector */}
        <section className="text-left">
          <h2 className="mb-2.5 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
            <Globe className="size-4 text-primary" /> App language
          </h2>
          <div className="grid grid-cols-2 gap-3 font-semibold">
            {langs.map((l) => {
              const active = app === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => handleSelectLanguage(l.id)}
                  className={`relative overflow-hidden rounded-2xl border-2 p-4 text-left transition duration-200 ${active ? "border-primary bg-primary/10 shadow-md scale-[1.01]" : "border-border bg-card hover:border-primary/40"}`}
                >
                  {active && (
                    <div className="absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" strokeWidth={3.5} />
                    </div>
                  )}
                  <div className="text-xl font-extrabold">{l.native}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{l.label}</div>
                  <p className="mt-3.5 text-xs text-foreground/80 leading-normal">{l.sample}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Voice language selector */}
        <section className="text-left">
          <h2 className="mb-2.5 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
            <Mic className="size-4 text-primary animate-pulse" /> Voice booking language
          </h2>
          <div className="space-y-2.5 font-semibold text-xs">
            {langs.map((l) => {
              const active = voice === l.id;
              return (
                <button
                  key={l.id}
                  onClick={() => handleSelectVoiceLang(l.id)}
                  className={`flex w-full items-center justify-between rounded-2xl border p-3.5 transition ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`grid size-10 place-items-center rounded-xl transition ${active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "bg-muted text-muted-foreground"}`}>
                      <Mic className="size-4.5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold">{l.native}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{l.label} Voice Assist</div>
                    </div>
                  </div>
                  <div className={`grid size-5 place-items-center rounded-full border-2 transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                    {active && <Check className="size-3.5" strokeWidth={3.5} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Regional preferences */}
        <section className="text-left">
          <h2 className="mb-2.5 flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest pl-0.5">
            <MapPin className="size-4 text-primary" /> Regional preference (Chennai)
          </h2>
          <div className="grid grid-cols-1 gap-2.5 font-semibold text-xs">
            {regions.map((r) => {
              const active = region === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => handleSelectRegion(r.id)}
                  className={`flex items-center justify-between rounded-2xl border p-4 transition ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border bg-card"}`}
                >
                  <div>
                    <div className="text-sm font-extrabold">{r.label}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{r.tamil}</div>
                  </div>
                  {active && <Check className="size-4.5 text-primary" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}