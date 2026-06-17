import { useState, useEffect, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { SimulationPanel } from "./SimulationPanel";
import { useRider } from "../../context/RiderContext";
import { WifiOff, AlertCircle, Smartphone, Download, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileShell({
  children,
  showNav = true,
  className,
  style,
}: {
  children: ReactNode;
  showNav?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const { lowNetwork, language, t, addNotification } = useRider();
  const [isPwaInstalled, setIsPwaInstalled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("namma_rider_pwa_installed") === "true";
    }
    return false;
  });
  const [showBanner, setShowBanner] = useState(!isPwaInstalled);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as any).standalone ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      if (isStandaloneMode) {
        setIsPwaInstalled(true);
        localStorage.setItem("namma_rider_pwa_installed", "true");
      }
    };
    checkStandalone();
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setIsPwaInstalled(true);
          localStorage.setItem("namma_rider_pwa_installed", "true");
          setShowBanner(false);
        }
      } catch (err) {
        console.error("[PWA] Error executing prompt():", err);
      }
      setDeferredPrompt(null);
    } else {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      if (isIOS) {
        alert(
          language === "ta"
            ? "iOS இல் ரைடு நிறுவுவதற்கு:\n1. சஃபாரியில் ஷேர் (Share) பொத்தானைத் தட்டவும் (கீழே).\n2. கீழே உருட்டி 'முகப்புத் திரையில் சேர்' (Add to Home Screen) என்பதைத் தட்டவும்."
            : "To install Rideuu on iOS:\n1. Tap the Share button in Safari (at the bottom).\n2. Scroll down and tap 'Add to Home Screen'."
        );
      } else {
        alert(
          language === "ta"
            ? "உங்கள் சாதனத்தில் ரைடு நிறுவுவதற்கு:\n1. மேல் வலது மூலையில் உள்ள 3 புள்ளிகளைத் தட்டவும்.\n2. 'ஆப்பை நிறுவு' அல்லது 'முகப்புத் திரையில் சேர்' என்பதைத் தேர்ந்தெடுக்கவும்."
            : "To install Rideuu on your browser:\n1. Tap the 3 dots in the top-right corner.\n2. Tap 'Install App' or 'Add to Home Screen'."
        );
      }
      setIsPwaInstalled(true);
      localStorage.setItem("namma_rider_pwa_installed", "true");
      setShowBanner(false);
      addNotification(
        "install_pwa",
        "pwa_installed_success",
        "App Shortcut Guide Shown!",
        "Follow the prompt details to add Rideuu to your home screen.",
        "info",
        "Smartphone"
      );
    }
  };

  return (
    <div className="min-h-screen bg-background relative" style={style}>
      {/* PWA offline/low network simulation banner */}
      {lowNetwork && (
        <div className="mx-auto max-w-md bg-orange-600 text-white px-4 py-2 flex items-center justify-between text-xs font-semibold gap-2 sticky top-0 z-50 animate-bounce">
          <span className="flex items-center gap-1.5">
            <WifiOff className="h-4 w-4" />
            {t("offline_mode_active")}
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase">
            PWA
          </span>
        </div>
      )}

      <div className={cn("mx-auto max-w-md min-h-screen bg-background relative border-x border-border shadow-2xl", className)}>
        {/* PWA Install Banner */}
        {showBanner && !isStandalone && !isPwaInstalled && (
          <div className="mx-4 mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-sm text-xs font-semibold flex items-center justify-between text-left animate-fade-in relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow shadow-primary/20">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-foreground">
                  {language === "ta" ? "முகப்புத் திரையில் ஆப்பை நிறுவவும்" : "Install Rider App"}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
                  {language === "ta"
                    ? "ஆஃப்லைன் சவாரி முன்பதிவுக்கு முகப்புத் திரையில் சேர்க்கவும்"
                    : "Add to home screen for 1-tap offline passenger booking"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={handleInstallPwa}
                className="rounded-xl bg-primary px-3.5 py-2 text-[10px] font-black text-primary-foreground shadow flex items-center gap-1 hover:brightness-105 active:scale-95 transition cursor-pointer"
              >
                <Download className="h-3 w-3" /> {language === "ta" ? "நிறுவ" : "Install"}
              </button>
              <button onClick={() => setShowBanner(false)} className="text-muted-foreground hover:text-foreground cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className={showNav ? "pb-24" : ""}>{children}</div>
        {showNav && <BottomNav />}
        
        {/* Universal Simulation Floating Controller */}
        <SimulationPanel />
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <header className="px-5 pt-6 pb-4 flex items-start justify-between">
      <div>
        {subtitle && (
          <p className="text-xs font-bold tracking-widest text-primary uppercase mb-1">
            {subtitle}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
      </div>
      {right}
    </header>
  );
}
