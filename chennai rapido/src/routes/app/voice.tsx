import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Mic, Sparkles, Loader2, Volume2, Check } from "lucide-react";
import { useAppStore, store, translate } from "@/lib/store";

export const Route = createFileRoute("/app/voice")({
  head: () => ({ meta: [{ title: "Voice Booking · Rideuu" }] }),
  component: VoicePage,
});

type State = "idle" | "listening" | "processing" | "searching" | "success";

const prompts = [
  { en: "Take me to Marina Beach", ta: "என்னை மெரினா கடற்கரைக்கு அழைத்துச் செல்லுங்கள்" },
  { en: "Book auto to T. Nagar", ta: "டி. நகருக்கு ஆட்டோ பதிவு செய்யுங்கள்" },
  { en: "Ride to Tidel Park", ta: "டைடல் பார்க் செல்ல வேண்டும்" },
];

function VoicePage() {
  const { language, theme } = useAppStore();
  const navigate = useNavigate();

  // local simulation states
  const [state, setState] = useState<State>("idle");
  const [heardEn, setHeardEn] = useState("");
  const [heardTa, setHeardTa] = useState("");
  const [typewriter, setTypewriter] = useState("");

  const t = (key: string) => translate(key, language);

  const startVoiceCapture = () => {
    setState("listening");
    setHeardEn("");
    setHeardTa("");
    setTypewriter("");

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "ta" ? "ta-IN" : "en-IN";

      recognition.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        console.log("Speech recognized: ", resultText);

        // Process transcript
        let vehicle: "bike" | "auto" = "bike";
        const lowerText = resultText.toLowerCase();
        if (lowerText.includes("auto") || lowerText.includes("ஆட்டோ")) {
          vehicle = "auto";
        } else if (lowerText.includes("bike") || lowerText.includes("பைக்") || lowerText.includes("இருசக்கர")) {
          vehicle = "bike";
        }

        // Clean drop text
        let cleanDrop = resultText;
        if (language === "ta") {
          // Remove Tamil filler suffixes
          cleanDrop = cleanDrop
            .replace(/ஆட்டோ பதிவு செய்யுங்(கள்)?/g, "")
            .replace(/பைக் பதிவு செய்யுங்(கள்)?/g, "")
            .replace(/செல்ல வேண்டும்/g, "")
            .replace(/போக வேண்டும்/g, "")
            .replace(/போகணும்/g, "")
            .replace(/அழைத்துச் செல்லுங்கள்/g, "")
            .replace(/அழைத்துச் செல்/g, "")
            .replace(/செல்லவும்/g, "")
            .trim();
        } else {
          // Remove English filler prefixes/suffixes
          cleanDrop = cleanDrop
            .replace(/take me to/gi, "")
            .replace(/book auto to/gi, "")
            .replace(/book bike to/gi, "")
            .replace(/book ride to/gi, "")
            .replace(/ride to/gi, "")
            .replace(/go to/gi, "")
            .trim();
        }
        if (!cleanDrop) {
          cleanDrop = language === "ta" ? "மயிலாப்பூர்" : "Marina Beach";
        }

        setHeardTa(resultText);
        setHeardEn(cleanDrop);
        setState("processing");
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event);
        fallbackSimulation();
      };

      recognition.onend = () => {
        // If it ended without transitioning to processing, fallback
        setTimeout(() => {
          setState((curr) => {
            if (curr === "listening") {
              fallbackSimulation();
            }
            return curr;
          });
        }, 1000);
      };

      recognition.start();
    } else {
      fallbackSimulation();
    }
  };

  const fallbackSimulation = () => {
    // Pick a random prompt to simulate what was heard
    const selected = prompts[Math.floor(Math.random() * prompts.length)];
    setHeardTa(selected.ta);
    setHeardEn(selected.en);
    setState("processing");
  };

  const handleSelectPrompt = (prompt: typeof prompts[number]) => {
    setState("listening");
    setHeardTa(prompt.ta);
    setHeardEn(prompt.en);

    // Sim listening delay
    setTimeout(() => {
      setState("processing");
    }, 1500);
  };

  // Process and translate text simulation
  useEffect(() => {
    if (state === "processing") {
      let idx = 0;
      const textToType = heardTa;
      const timer = setInterval(() => {
        if (idx < textToType.length) {
          setTypewriter((prev) => prev + textToType.charAt(idx));
          idx++;
        } else {
          clearInterval(timer);

          // Advance to routing matching after typewriter completes
          setTimeout(() => {
            setState("searching");
          }, 1200);
        }
      }, 80);
      return () => clearInterval(timer);
    }
  }, [state, heardTa]);

  // Route matches simulation once searching starts
  useEffect(() => {
    if (state === "searching") {
      const timer = setTimeout(() => {
        setState("success");

        // Save values in store and match
        store.update((s) => {
          s.ride.pickup = "Marina Lighthouse Gate 2";
          s.ride.drop = heardEn;
          s.ride.vehicle = heardEn.toLowerCase().includes("auto") ? "auto" : "bike";
        });

        // redirect to matching/tracking desk
        setTimeout(() => {
          store.startDriverSearch();
          navigate({ to: "/app/track" });
        }, 1500);

      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state, heardEn, navigate]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-950 text-white transition-colors duration-300">

      {/* Decorative grids */}
      <div className="checkered absolute inset-0 opacity-[0.03]" />
      <div className="map-grid-dark absolute inset-0 opacity-15" />
      <div className="absolute -right-20 top-20 size-72 rounded-full bg-primary/10 blur-3xl" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 p-4">
        <Link
          to="/app/home"
          onClick={() => store.resetBooking()}
          className="grid size-9 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition shadow"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-base font-extrabold tracking-tight">
            <Sparkles className="size-4 text-primary animate-pulse" /> {t("Voice Booking")}
          </h1>
          <p className="text-[10px] text-white/60 tracking-wider font-semibold">
            குரல் வழியாக சவாரி பதிவு
          </p>
        </div>
      </header>

      {/* Main visual assistant box */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-8 px-6 pb-28 pt-8">

        {/* Typewriter Speech outputs */}
        <div className="min-h-[90px] text-center max-w-xs space-y-2 animate-fade-in" key={state}>
          {state === "idle" && (
            <>
              <p className="text-xl font-extrabold">{t("Tap to speak")}</p>
              <p className="text-[11px] text-white/50 tracking-wider">பேச மைக் பொத்தானை தட்டவும்</p>
            </>
          )}

          {state === "listening" && (
            <>
              <p className="text-xl font-extrabold text-primary animate-pulse">{t("Listening...")}</p>
              <p className="text-[11px] text-white/60 tracking-wider">நம்ம குரல் உதவியாளர் கேட்கிறது...</p>
            </>
          )}

          {state === "processing" && (
            <>
              <div className="text-sm font-extrabold text-primary flex items-center justify-center gap-1">
                <Volume2 className="size-4 animate-bounce" /> "{typewriter}"
              </div>
              <p className="text-[10px] text-white/50 animate-pulse">{t("Understanding your request…")}</p>
            </>
          )}

          {state === "searching" && (
            <div className="space-y-1">
              <div className="text-xs font-bold text-emerald-400">✓ Translation Successful!</div>
              <div className="text-sm font-extrabold">"{heardEn}"</div>
              <p className="text-[10px] text-white/50 animate-pulse">{t("Searching driver...")}</p>
            </div>
          )}

          {state === "success" && (
            <div className="py-2 space-y-2 animate-scale-in">
              <div className="grid size-10 mx-auto place-items-center rounded-full bg-emerald-500 text-white shadow shadow-emerald-500/25">
                <Check className="size-5.5" strokeWidth={3.5} />
              </div>
              <div className="text-xs font-extrabold text-emerald-400">Driver Matching Dispatched!</div>
            </div>
          )}
        </div>

        {/* Pulsing Mic Visual Core */}
        <div className="relative grid place-items-center my-4">
          {(state === "listening" || state === "searching") && (
            <>
              <span className="pulse-ring absolute size-52 rounded-full bg-primary/10" />
              <span className="pulse-ring absolute size-40 rounded-full bg-primary/20" style={{ animationDelay: "0.4s" }} />
              <span className="pulse-ring absolute size-28 rounded-full bg-primary/35" style={{ animationDelay: "0.8s" }} />
            </>
          )}

          <button
            onClick={() => (state === "idle" ? startVoiceCapture() : setState("idle"))}
            disabled={state === "processing" || state === "searching" || state === "success"}
            className={`relative grid size-24 place-items-center rounded-full text-slate-950 shadow-2xl transition-all duration-300 ${state === "idle" ? "bg-primary hover:scale-105" : state === "listening" ? "bg-primary scale-110" : "bg-white/20 backdrop-blur-md"}`}
          >
            {state === "processing" ? (
              <Loader2 className="size-8.5 animate-spin text-primary" />
            ) : state === "searching" ? (
              <Sparkles className="size-8.5 animate-pulse text-primary" />
            ) : (
              <Mic className="size-8.5" strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* Dynamic Visual Waveform */}
        {state === "listening" && (
          <div className="flex h-10 items-end gap-1.5 py-2">
            {Array.from({ length: 20 }).map((_, i) => {
              const delay = i * 0.04;
              const scale = 15 + Math.sin(i * 0.8) * 15 + 10;
              return (
                <span
                  key={i}
                  className="w-1 rounded-full bg-primary wave-bar"
                  style={{
                    height: `${scale}px`,
                    animationDelay: `${delay}s`
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Prompt Onboarding Cards */}
        {state === "idle" && (
          <div className="w-full max-w-sm space-y-2.5 text-left">
            <p className="text-center text-[10px] uppercase tracking-widest text-white/40 pl-1 font-bold">{t("Try saying")}</p>

            {prompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectPrompt(p)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3.5 hover:bg-white/10 active:scale-[0.99] transition text-left space-y-1 block"
              >
                <div className="text-xs font-bold text-white/95">"{p.en}"</div>
                <div className="text-[10px] text-white/60 leading-normal font-semibold">"{p.ta}"</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}