import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { useAppStore, store } from "@/lib/store";
import { useState, useEffect } from "react";
import { Smartphone, Download, WifiOff, RefreshCw, X, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/app")({
  beforeLoad: ({ location }) => {
    const state = store.getState();
    if (!state.token) {
      throw redirect({ to: "/login" });
    }
    if (location.pathname === "/app" || location.pathname === "/app/") {
      throw redirect({ to: "/app/home" });
    }
  },
  component: AppShell,
});

function AppShell() {
  const { isPwaInstalled, token } = useAppStore();

  // local PWA simulation states
  const [showBanner, setShowBanner] = useState(!isPwaInstalled);
  const [isOffline, setIsOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  // Check if running in standalone mode (already installed)
  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        console.log("[PWA] App is running in standalone mode (already installed).");
        store.setPwaInstalled(true);
      }
    };
    checkStandalone();
  }, []);

  // Listen to browser PWA install prompt event
  useEffect(() => {
    console.log("[PWA] Registering beforeinstallprompt listener");
    const handler = (e: Event) => {
      console.log("[PWA] beforeinstallprompt event fired:", e);
      // Prevent the default mini-infobar prompt
      e.preventDefault();
      // Store the event so we can trigger it later
      setDeferredPrompt(e);
      // Ensure the banner shows up
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => {
      console.log("[PWA] Cleaning up beforeinstallprompt listener");
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  useEffect(() => {
    if (token) {
      store.loadUserData();
    }
  }, [token]);

  // Splash screen simulation on first load (1.5 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleInstallPwa = async () => {
    console.log("[PWA] Install button clicked. deferredPrompt exists:", !!deferredPrompt);
    if (deferredPrompt) {
      try {
        console.log("[PWA] Executing prompt() call");
        await deferredPrompt.prompt();
        console.log("[PWA] Prompt shown, awaiting userChoice result");
        const { outcome } = await deferredPrompt.userChoice;
        console.log("[PWA] userChoice result outcome:", outcome);
        if (outcome === "accepted") {
          store.setPwaInstalled(true);
          setShowBanner(false);
        }
      } catch (err) {
        console.error("[PWA] Error executing prompt():", err);
      }
      setDeferredPrompt(null);
    } else {
      console.log("[PWA] No deferredPrompt available. Hiding install option since native installation is not available.");
      // Fallback/simulation behavior
      store.setPwaInstalled(true);
      setShowBanner(false);
      store.addNotification({
        cat: "alerts",
        title: "App Shortcut Added!",
        tamilTitle: "செயலி குறுக்குவழி சேர்க்கப்பட்டது!",
        body: "Rideuu is successfully added to your home screen.",
        tamilBody: "ரைடு உங்கள் முகப்புத் திரையில் சேர்க்கப்பட்டது."
      });
    }
  };

  const handleSimulateSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 2000);

      store.addNotification({
        cat: "alerts",
        title: "Background Sync Complete",
        tamilTitle: "பின்னணி ஒத்திசைவு முடிந்தது",
        body: "All offline trip requests synced to Chennai servers.",
        tamilBody: "ஆஃப்லைன் பயண கோரிக்கைகள் ஒத்திசைக்கப்பட்டன."
      });
    }, 2000);
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white animate-fade-in">
        {/* Pulsing Splash Logo */}
        <div className="relative my-4">
          <div className="pulse-ring absolute inset-0 rounded-full bg-primary/20 scale-125" />
          <div className="relative grid size-20 place-items-center rounded-3xl bg-primary text-slate-950 font-black text-3xl shadow-2xl animate-scale-in">
            R
          </div>
        </div>
        <div className="mt-4 space-y-1 text-center">
          <h2 className="text-xl font-extrabold tracking-tight">Rideuu</h2>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest pl-0.5">சென்னை · v1.2</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background text-foreground transition-colors duration-300 relative">

      {/* Offline Mode Advisory Banner */}
      {isOffline && (
        <div className="sticky top-0 z-50 bg-amber-500 text-slate-950 text-[10px] font-bold px-4 py-2 flex items-center justify-between shadow-md">
          <span className="flex items-center gap-1.5"><WifiOff className="size-3.5 animate-bounce" /> Offline Mode Active · Using Sync Cache</span>
          <button
            onClick={handleSimulateSync}
            disabled={syncing}
            className="rounded bg-slate-950 px-2 py-0.5 text-[8px] font-black text-amber-500 uppercase flex items-center gap-1"
          >
            {syncing ? <RefreshCw className="size-2 animate-spin" /> : "Sync Now"}
          </button>
        </div>
      )}

      {/* Sync success toast */}
      {showSyncSuccess && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 rounded-full bg-emerald-500 px-4 py-1.5 text-[10px] font-black text-white shadow shadow-emerald-500/25 animate-scale-in">
          ✓ Sync completed!
        </div>
      )}

      {/* Floating Offline Toggler */}
      <div className="fixed right-4 bottom-24 z-40">
        <button
          onClick={() => setIsOffline(!isOffline)}
          className={`grid size-9 place-items-center rounded-full border shadow backdrop-blur-md active:scale-90 transition ${isOffline ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-border bg-card text-muted-foreground"}`}
          title="Toggle PWA Offline Mode simulation"
        >
          <WifiOff className="size-4" />
        </button>
      </div>

      <div className="mx-auto min-h-dvh max-w-md pb-24 relative">
        {/* PWA Install Banner */}
        {showBanner && !isStandalone && !isPwaInstalled && (
          <div className="mx-4 mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm text-xs font-semibold flex items-center justify-between text-left animate-fade-in relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow shadow-primary/20">
                <Smartphone className="size-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground">Install Rideuu App</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">Add to home screen for 1-tap offline ride booking</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallPwa}
                className="rounded-xl bg-primary px-3.5 py-2 text-[10px] font-black text-primary-foreground shadow flex items-center gap-1 hover:brightness-105 active:scale-95 transition"
              >
                <Download className="size-3" /> Install
              </button>
              <button onClick={() => setShowBanner(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}

        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}