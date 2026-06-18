import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useAppStore, s as store, t as translate } from "./router-BpidCmwR.mjs";
import { a as ArrowLeft, a0 as Sparkles, aa as Volume2, j as Check, w as LoaderCircle, K as Mic } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
const prompts = [{
  en: "Take me to Marina Beach",
  ta: "என்னை மெரினா கடற்கரைக்கு அழைத்துச் செல்லுங்கள்"
}, {
  en: "Book auto to T. Nagar",
  ta: "டி. நகருக்கு ஆட்டோ பதிவு செய்யுங்கள்"
}, {
  en: "Ride to Tidel Park",
  ta: "டைடல் பார்க் செல்ல வேண்டும்"
}];
function VoicePage() {
  const {
    language,
    theme
  } = useAppStore();
  const navigate = useNavigate();
  const [state, setState] = reactExports.useState("idle");
  const [heardEn, setHeardEn] = reactExports.useState("");
  const [heardTa, setHeardTa] = reactExports.useState("");
  const [typewriter, setTypewriter] = reactExports.useState("");
  const t = (key) => translate(key, language);
  const startVoiceCapture = () => {
    setState("listening");
    setHeardEn("");
    setHeardTa("");
    setTypewriter("");
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "ta" ? "ta-IN" : "en-IN";
      recognition.onresult = (event) => {
        const resultText = event.results[0][0].transcript;
        console.log("Speech recognized: ", resultText);
        const lowerText = resultText.toLowerCase();
        if (lowerText.includes("auto") || lowerText.includes("ஆட்டோ")) ;
        else if (lowerText.includes("bike") || lowerText.includes("பைக்") || lowerText.includes("இருசக்கர")) ;
        let cleanDrop = resultText;
        if (language === "ta") {
          cleanDrop = cleanDrop.replace(/ஆட்டோ பதிவு செய்யுங்(கள்)?/g, "").replace(/பைக் பதிவு செய்யுங்(கள்)?/g, "").replace(/செல்ல வேண்டும்/g, "").replace(/போக வேண்டும்/g, "").replace(/போகணும்/g, "").replace(/அழைத்துச் செல்லுங்கள்/g, "").replace(/அழைத்துச் செல்/g, "").replace(/செல்லவும்/g, "").trim();
        } else {
          cleanDrop = cleanDrop.replace(/take me to/gi, "").replace(/book auto to/gi, "").replace(/book bike to/gi, "").replace(/book ride to/gi, "").replace(/ride to/gi, "").replace(/go to/gi, "").trim();
        }
        if (!cleanDrop) {
          cleanDrop = language === "ta" ? "மயிலாப்பூர்" : "Marina Beach";
        }
        setHeardTa(resultText);
        setHeardEn(cleanDrop);
        setState("processing");
      };
      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event);
        fallbackSimulation();
      };
      recognition.onend = () => {
        setTimeout(() => {
          setState((curr) => {
            if (curr === "listening") {
              fallbackSimulation();
            }
            return curr;
          });
        }, 1e3);
      };
      recognition.start();
    } else {
      fallbackSimulation();
    }
  };
  const fallbackSimulation = () => {
    const selected = prompts[Math.floor(Math.random() * prompts.length)];
    setHeardTa(selected.ta);
    setHeardEn(selected.en);
    setState("processing");
  };
  const handleSelectPrompt = (prompt) => {
    setState("listening");
    setHeardTa(prompt.ta);
    setHeardEn(prompt.en);
    setTimeout(() => {
      setState("processing");
    }, 1500);
  };
  reactExports.useEffect(() => {
    if (state === "processing") {
      let idx = 0;
      const textToType = heardTa;
      const timer = setInterval(() => {
        if (idx < textToType.length) {
          setTypewriter((prev) => prev + textToType.charAt(idx));
          idx++;
        } else {
          clearInterval(timer);
          setTimeout(() => {
            setState("searching");
          }, 1200);
        }
      }, 80);
      return () => clearInterval(timer);
    }
  }, [state, heardTa]);
  reactExports.useEffect(() => {
    if (state === "searching") {
      const timer = setTimeout(() => {
        setState("success");
        store.update((s) => {
          s.ride.pickup = "Marina Lighthouse Gate 2";
          s.ride.drop = heardEn;
          s.ride.vehicle = heardEn.toLowerCase().includes("auto") ? "auto" : "bike";
        });
        setTimeout(() => {
          store.startDriverSearch();
          navigate({
            to: "/app/track"
          });
        }, 1500);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [state, heardEn, navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-dvh overflow-hidden bg-slate-950 text-white transition-colors duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "checkered absolute inset-0 opacity-[0.03]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "map-grid-dark absolute inset-0 opacity-15" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-20 top-20 size-72 rounded-full bg-primary/10 blur-3xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "relative z-10 flex items-center gap-3 p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/home", onClick: () => store.resetBooking(), className: "grid size-9 place-items-center rounded-xl bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition shadow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-base font-extrabold tracking-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-primary animate-pulse" }),
          " ",
          t("Voice Booking")
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/60 tracking-wider font-semibold", children: "குரல் வழியாக சவாரி பதிவு" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex flex-col items-center justify-center gap-8 px-6 pb-28 pt-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-[90px] text-center max-w-xs space-y-2 animate-fade-in", children: [
        state === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-extrabold", children: t("Tap to speak") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-white/50 tracking-wider", children: "பேச மைக் பொத்தானை தட்டவும்" })
        ] }),
        state === "listening" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xl font-extrabold text-primary animate-pulse", children: t("Listening...") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-white/60 tracking-wider", children: "நம்ம குரல் உதவியாளர் கேட்கிறது..." })
        ] }),
        state === "processing" && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-extrabold text-primary flex items-center justify-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Volume2, { className: "size-4 animate-bounce" }),
            ' "',
            typewriter,
            '"'
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/50 animate-pulse", children: t("Understanding your request…") })
        ] }),
        state === "searching" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold text-emerald-400", children: "✓ Translation Successful!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-extrabold", children: [
            '"',
            heardEn,
            '"'
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-white/50 animate-pulse", children: t("Searching driver...") })
        ] }),
        state === "success" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-2 space-y-2 animate-scale-in", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-10 mx-auto place-items-center rounded-full bg-emerald-500 text-white shadow shadow-emerald-500/25", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-5.5", strokeWidth: 3.5 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-extrabold text-emerald-400", children: "Driver Matching Dispatched!" })
        ] })
      ] }, state),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid place-items-center my-4", children: [
        (state === "listening" || state === "searching") && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-ring absolute size-52 rounded-full bg-primary/10" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-ring absolute size-40 rounded-full bg-primary/20", style: {
            animationDelay: "0.4s"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "pulse-ring absolute size-28 rounded-full bg-primary/35", style: {
            animationDelay: "0.8s"
          } })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => state === "idle" ? startVoiceCapture() : setState("idle"), disabled: state === "processing" || state === "searching" || state === "success", className: `relative grid size-24 place-items-center rounded-full text-slate-950 shadow-2xl transition-all duration-300 ${state === "idle" ? "bg-primary hover:scale-105" : state === "listening" ? "bg-primary scale-110" : "bg-white/20 backdrop-blur-md"}`, children: state === "processing" ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-8.5 animate-spin text-primary" }) : state === "searching" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-8.5 animate-pulse text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { className: "size-8.5", strokeWidth: 2.5 }) })
      ] }),
      state === "listening" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 items-end gap-1.5 py-2", children: Array.from({
        length: 20
      }).map((_, i) => {
        const delay = i * 0.04;
        const scale = 15 + Math.sin(i * 0.8) * 15 + 10;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-1 rounded-full bg-primary wave-bar", style: {
          height: `${scale}px`,
          animationDelay: `${delay}s`
        } }, i);
      }) }),
      state === "idle" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-sm space-y-2.5 text-left", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-[10px] uppercase tracking-widest text-white/40 pl-1 font-bold", children: t("Try saying") }),
        prompts.map((p, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => handleSelectPrompt(p), className: "w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-3.5 hover:bg-white/10 active:scale-[0.99] transition text-left space-y-1 block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-bold text-white/95", children: [
            '"',
            p.en,
            '"'
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] text-white/60 leading-normal font-semibold", children: [
            '"',
            p.ta,
            '"'
          ] })
        ] }, idx))
      ] })
    ] })
  ] });
}
export {
  VoicePage as component
};
