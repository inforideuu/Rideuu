import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  TrendingUp,
  MapPin,
  Users,
  UserCog,
  ShieldCheck,
  Car,
  Zap,
  Wallet,
  MessageSquareWarning,
  Bell,
  Flame,
  AlertTriangle,
  Settings,
  Search,
  LogOut,
  Moon,
  Sun,
  Shield,
  Activity,
  UserCheck,
  Map,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { api } from "@/lib/api";

// Tamil Translations dictionary
const translations: Record<string, Record<string, string>> = {
  ta: {
    "Overview": "மேலோட்டம்",
    "Dashboard": "முகப்புப்பலகை",
    "Revenue Analytics": "வருவாய் பகுப்பாய்வு",
    "Heatmap Analytics": "வெப்ப வரைபடம்",
    "Operations": "செயல்பாடுகள்",
    "Live Rides": "நேரடி சவாரிகள்",
    "Ride Management": "சவாரி மேலாண்மை",
    "Surge Pricing": "கூடுதல் கட்டணம்",
    "People": "நபர்கள்",
    "Driver Management": "ஓட்டுநர் மேலாண்மை",
    "Customer Management": "வாடிக்கையாளர் மேலாண்மை",
    "KYC Verification": "கேஒய்சி சரிபார்ப்பு",
    "Trust & Money": "நம்பிக்கை & நிதி",
    "Wallet / Finance": "வாலட் / வரவுசெலவு",
    "Complaints": "புகார்கள்",
    "Fraud Monitoring": "மோசடி கண்காணிப்பு",
    "System": "கணினி அமைப்பு",
    "Notifications": "அறிவிப்புகள்",
    "Settings": "அமைப்புகள்",
    "Search rides, drivers, customers…": "சவாரிகள், ஓட்டுநர்கள், வாடிக்கையாளர்களைத் தேடுக…",
    "All systems normal": "அனைத்து அமைப்புகளும் சீராக உள்ளன",
    "Super Admin": "தலைமை நிர்வாகி",
    "Operations Manager": "செயல்பாட்டு மேலாளர்",
    "Financial Controller": "நிதி கட்டுப்பாட்டாளர்",
    "Support Lead": "ஆதரவுத் தலைவர்",
    "Collapse": "சுருக்குக",
    "Expand": "விரிவாக்குக",
    "Logout": "வெளியேறு",
    "Security Logs": "பாதுகாப்பு பதிவுகள்",
    "Active Session": "செயலில் உள்ள அமர்வு",
    "Role": "பதவி",
  },
};

const nav = [
  {
    group: "Overview", items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/revenue", label: "Revenue Analytics", icon: TrendingUp },
      { to: "/heatmap", label: "Heatmap Analytics", icon: Flame },
    ]
  },
  {
    group: "Operations", items: [
      { to: "/live-rides", label: "Live Rides", icon: MapPin, badge: "LIVE" },
      { to: "/rides", label: "Ride Management", icon: Car },
      { to: "/surge", label: "Surge Pricing", icon: Zap },
    ]
  },
  {
    group: "People", items: [
      { to: "/drivers", label: "Driver Management", icon: UserCog },
      { to: "/customers", label: "Customer Management", icon: Users },
      { to: "/kyc", label: "KYC Verification", icon: ShieldCheck, badge: "12" },
    ]
  },
  {
    group: "Trust & Money", items: [
      { to: "/finance", label: "Wallet / Finance", icon: Wallet },
      { to: "/complaints", label: "Complaints", icon: MessageSquareWarning, badge: "5" },
      { to: "/fraud", label: "Fraud Monitoring", icon: AlertTriangle },
    ]
  },
  {
    group: "System", items: [
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/settings", label: "Settings", icon: Settings },
    ]
  },
];

// Determine visible sidebar groups based on admin roles
const getVisibleNav = (role: string) => {
  if (role === "super_admin") return nav;
  if (role === "operations") {
    return nav.map(g => {
      let items = g.items;
      if (g.group === "Overview") {
        items = items.filter(item => item.to !== "/revenue");
      } else if (g.group === "Trust & Money") {
        items = items.filter(item => item.to !== "/finance");
      } else if (g.group === "System") {
        items = items.filter(item => item.to !== "/settings");
      }
      return { ...g, items };
    }).filter(g => g.items.length > 0);
  }
  if (role === "finance") {
    return nav.map(g => {
      let items = g.items;
      if (g.group === "Overview") {
        items = items.filter(item => item.to === "/" || item.to === "/revenue");
      } else if (g.group === "Operations") {
        items = [];
      } else if (g.group === "People") {
        items = [];
      } else if (g.group === "Trust & Money") {
        items = items.filter(item => item.to === "/finance");
      } else if (g.group === "System") {
        items = items.filter(item => item.to !== "/settings");
      }
      return { ...g, items };
    }).filter(g => g.items.length > 0);
  }
  if (role === "support") {
    return nav.map(g => {
      let items = g.items;
      if (g.group === "Overview") {
        items = items.filter(item => item.to === "/");
      } else if (g.group === "Operations") {
        items = [];
      } else if (g.group === "People") {
        items = items.filter(item => item.to === "/customers");
      } else if (g.group === "Trust & Money") {
        items = items.filter(item => item.to === "/complaints");
      } else if (g.group === "System") {
        items = items.filter(item => item.to !== "/settings");
      }
      return { ...g, items };
    }).filter(g => g.items.length > 0);
  }
  return nav;
};

export function AdminShell({ title, subtitle, children, actions }: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [lang, setLang] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_lang") || "en" : "en");
  const [role, setRole] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_role") || "super_admin" : "super_admin");
  const [name, setName] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_name") || "Arjun K." : "Arjun K.");
  const [showLogs, setShowLogs] = useState(false);
  const [theme, setTheme] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_theme") || "dark" : "dark");
  const [hasActiveSos, setHasActiveSos] = useState(false);

  // Poll active SOS alerts
  useEffect(() => {
    async function checkSosAlerts() {
      try {
        const alerts = await api.getSOSAlerts() || [];
        const activeAlert = alerts.some((a: any) => a.status === 'ACTIVE');
        setHasActiveSos(activeAlert);
      } catch (err) {
        console.warn("Failed fetching SOS alerts in shell", err);
      }
    }
    checkSosAlerts();
    const interval = setInterval(checkSosAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  // Sync state on mount/storage events
  useEffect(() => {
    const handleStorage = () => {
      setLang(localStorage.getItem("admin_lang") || "en");
      setRole(localStorage.getItem("admin_role") || "super_admin");
      setName(localStorage.getItem("admin_name") || "Arjun K.");
      setTheme(localStorage.getItem("admin_theme") || "dark");
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("admin_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => t === "dark" ? "light" : "dark");
  };

  const translate = (text: string) => {
    if (lang === "ta" && translations.ta[text]) {
      return translations.ta[text];
    }
    return text;
  };

  const toggleLanguage = () => {
    const nextLang = lang === "en" ? "ta" : "en";
    setLang(nextLang);
    localStorage.setItem("admin_lang", nextLang);
    // Dispatch standard storage event so other routes hear it
    window.dispatchEvent(new Event("storage"));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate({ to: "/login" });
  };

  const roleLabels: Record<string, string> = {
    super_admin: "Super Admin",
    operations: "Operations Manager",
    finance: "Financial Controller",
    support: "Support Lead",
  };

  const visibleNav = getVisibleNav(role);

  return (
    <div className={cn(
      "flex min-h-screen bg-background text-foreground transition-all duration-300",
      hasActiveSos && "outline-[6px] outline-destructive outline-offset-[-6px] outline animate-[pulse_1s_infinite]"
    )}>
      {/* Sidebar navigation */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex transition-all duration-300 z-40",
          collapsed ? "w-[76px]" : "w-[268px]",
        )}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4 bg-sidebar/50 backdrop-blur">
          {/* <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground font-black shadow-lg shadow-primary/30">
            N
          </div> */}
          {!collapsed && (
            <div className="flex flex-col leading-tight animate-fade-in">
              <span className="text-sm font-bold tracking-wide">Rideuu</span>
              <span className="text-[9px] uppercase tracking-widest text-accent font-semibold">Admin · Chennai</span>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-4">
          {visibleNav.map((g) => (
            <div key={g.group} className="mb-2">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  {translate(g.group)}
                </div>
              )}
              <ul className="space-y-1">
                {g.items.map((item) => {
                  const Active = path === item.to;
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={cn(
                          "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                          Active
                            ? "bg-gradient-to-r from-primary/15 to-accent/5 text-foreground shadow-md ring-1 ring-primary/25 border-l-2 border-primary"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0 transition-transform group-hover:scale-110", Active ? "text-primary" : "text-muted-foreground")} />
                        {!collapsed && <span className="flex-1 truncate">{translate(item.label)}</span>}
                        {!collapsed && item.badge && (
                          <span className={cn(
                            "rounded-full px-2 py-0.5 text-[9px] font-black tracking-wide",
                            item.badge === "LIVE"
                              ? "bg-destructive/20 text-destructive border border-destructive/30 animate-pulse"
                              : "bg-accent/20 text-accent border border-accent/30",
                          )}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-3 bg-sidebar/30 backdrop-blur">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-full rounded-md py-2 text-xs font-semibold text-muted-foreground hover:bg-sidebar-accent transition-colors flex items-center justify-center gap-2"
          >
            {collapsed ? "→" : `← ${translate("Collapse")}`}
          </button>
        </div>
      </aside>

      {/* Main viewport */}
      <div className="flex min-w-0 flex-1 flex-col relative">
        {hasActiveSos && (
          <div
            onClick={() => navigate({ to: "/live-rides", search: { sos: "true" } as any })}
            className="bg-destructive text-destructive-foreground px-4 py-2 text-center text-xs font-black uppercase tracking-wider animate-[pulse_1s_infinite] flex items-center justify-center gap-2 z-50 shadow-md cursor-pointer hover:bg-destructive/90 transition-colors"
          >
            <AlertTriangle className="h-4 w-4 animate-bounce shrink-0" />
            <span>🚨 EMERGENCY SOS ALERT ACTIVE - RESPOND IMMEDIATELY 🚨</span>
          </div>
        )}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-md lg:px-6">
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={translate("Search rides, drivers, customers…")}
              className="h-9 pl-9 bg-muted/40 border-border/80 text-xs focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="ml-auto flex items-center gap-2.5">
            <Badge variant="outline" className="hidden gap-1.5 border-accent/40 text-accent md:flex bg-accent/5 py-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              {translate("All systems normal")}
            </Badge>

            {/* Language Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="h-9 gap-1 text-xs border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-all font-semibold"
            >
              🌐 {lang === "en" ? "தமிழ்" : "English"}
            </Button>

            {/* Theme Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition-all"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {/* Session Monitor Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={() => setShowLogs(c => !c)}
              title="View Security & Session logs"
            >
              <Shield className={cn("h-4.5 w-4.5", showLogs && "text-primary animate-pulse")} />
            </Button>

            {/* Notification Indicator */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 relative text-muted-foreground hover:text-foreground"
              onClick={() => navigate({ to: "/notifications" })}
            >
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>


            {/* User Profile Badge HUD */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/60 pl-1 pr-3 py-1 shadow-sm">
              <Avatar className="h-7 w-7 border border-border">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-[9px] font-black text-primary-foreground">
                  {name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-[10px] leading-tight md:block">
                <div className="font-semibold text-foreground">{name}</div>
                <div className="text-muted-foreground/80 font-mono text-[9px]">{translate(roleLabels[role] || roleLabels.super_admin)}</div>
              </div>
            </div>

            {/* Logout link */}
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={handleLogout} title={translate("Logout")}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Global Security / Active Sessions logs panel overlay */}
        {showLogs && (
          <div className="absolute right-4 top-18 w-80 bg-card border border-border/80 rounded-xl shadow-2xl p-4 z-50 animate-fade-in backdrop-blur-xl bg-card/95">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Shield className="h-4 w-4" /> {translate("Security Logs")}
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowLogs(false)}>×</Button>
            </div>
            <div className="mt-3 space-y-2.5 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">{translate("Active Session")}</span>
                <div className="flex items-center gap-1.5 mt-1 font-semibold text-foreground">
                  <UserCheck className="h-3.5 w-3.5 text-accent" /> {name}
                </div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">{translate("Role")}</span>
                <span className="mt-1 inline-block bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded font-mono text-[10px] font-semibold">
                  {roleLabels[role] || "Super Admin"}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Session IP Address</span>
                <span className="font-mono text-foreground font-semibold block mt-0.5">{localStorage.getItem("admin_ip") || "192.168.1.182 (Chennai)"}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Login Activity Timestamp</span>
                <span className="font-mono text-foreground block mt-0.5">{localStorage.getItem("admin_session_start") || "Today 15:09"}</span>
              </div>
              <div className="border-t border-border/60 pt-2 text-[10px] text-muted-foreground leading-relaxed">
                🛡️ IP restrictions enforced. Any edits to surge pricing multipliers or document overrides will log your administrator key signature.
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1 border-b border-border bg-card/20 px-4 py-5 lg:px-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold tracking-tight md:text-2xl">{translate(title)}</h1>
              {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{translate(subtitle)}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-6 bg-gradient-to-br from-transparent to-muted/10">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label, value, delta, icon: Icon, tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "accent" | "destructive" | "muted";
}) {
  const tones = {
    primary: "from-primary/25 to-primary/0 text-primary border-primary/20",
    accent: "from-accent/25 to-accent/0 text-accent border-accent/20",
    destructive: "from-destructive/25 to-destructive/0 text-destructive border-destructive/20",
    muted: "from-muted/40 to-muted/0 text-muted-foreground border-border/40",
  } as const;

  const [lang, setLang] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_lang") || "en" : "en");
  useEffect(() => {
    const handleStorage = () => setLang(localStorage.getItem("admin_lang") || "en");
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const translate = (text: string) => {
    if (lang === "ta" && translations.ta[text]) {
      return translations.ta[text];
    }
    // Simple custom overrides for card labels
    if (lang === "ta") {
      if (text.includes("Total rides")) return "இன்றைய மொத்த சவாரிகள்";
      if (text.includes("Revenue")) return "வருவாய் (₹)";
      if (text.includes("Active drivers") || text.includes("Active riders")) return "செயலில் உள்ள ஓட்டுநர்கள்";
      if (text.includes("Active customers")) return "செயலில் உள்ள வாடிக்கையாளர்கள்";
      if (text.includes("Pending KYC")) return "நிலுவையில் உள்ள கேஒய்சி";
      if (text.includes("Avg rating")) return "சராசரி மதிப்பீடு";
      if (text.includes("Suspended")) return "பணிநீக்கம் செய்யப்பட்டவர்கள்";
      if (text.includes("Wallet balance") || text.includes("Wallet float")) return "வாலட் மிதவை இருப்பு";
      if (text.includes("New (7d)")) return "புதியவர்கள் (7 நாட்களில்)";
      if (text.includes("Blacklisted")) return "கருப்புப்பட்டியல்";
      if (text.includes("Active trips")) return "செயலில் உள்ள பயணங்கள்";
      if (text.includes("Drivers online")) return "ஆன்லைனில் உள்ள ஓட்டுநர்கள்";
      if (text.includes("Avg ETA")) return "சராசரி வருகை நேரம் (ETA)";
      if (text.includes("Open SOS")) return "செயலில் உள்ள அவசர SOS";
      if (text.includes("Avg multiplier")) return "சராசரி கட்டண பெருக்கி";
      if (text.includes("Rain zones")) return "மழை பெய்யும் பகுதிகள்";
      if (text.includes("Surge revenue")) return "கூடுதல் கட்டண வருவாய்";
      if (text.includes("Active zones")) return "செயலில் உள்ள பகுதிகள்";
      if (text.includes("Pending payouts")) return "நிலுவையில் உள்ள கொடுப்பனவுகள்";
      if (text.includes("Today's revenue")) return "இன்றைய மொத்த வருவாய்";
      if (text.includes("Refunds")) return "திரும்ப அளிக்கப்பட்ட நிதி";
      if (text.includes("Trips today")) return "இன்றைய சவாரிகள்";
      if (text.includes("Cancellations")) return "சவாரி ரத்துக்கள்";
      if (text.includes("Avg trip time")) return "சராசரி பயண நேரம்";
      if (text.includes("Open alerts")) return "புதிய மோசடி எச்சரிக்கைகள்";
      if (text.includes("Auto-blocked")) return "தானியங்கி முடக்கம் (24h)";
      if (text.includes("Under review")) return "மதிப்பாய்வில் உள்ளவை";
      if (text.includes("False positives")) return "தவறான கணிப்புகள்";
    }
    return text;
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 group">
      <div className={cn("pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-40 blur-xl transition-transform group-hover:scale-110", tones[tone].split(" ")[0])} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70">{translate(label)}</div>
          <div className="mt-2 text-3xl font-extrabold tracking-tight tabular-nums bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">{value}</div>
          {delta && (
            <div className={cn("mt-1.5 text-xs font-semibold flex items-center gap-1", delta.startsWith("-") ? "text-destructive" : "text-accent")}>
              {delta} <span className="text-xs text-muted-foreground/60 font-normal">vs last week</span>
            </div>
          )}
        </div>
        <div className={cn("grid h-9 w-9 place-items-center rounded-lg bg-muted/40 ring-1 ring-border/80 transition-all duration-300 group-hover:rotate-6", tones[tone].split(" ").pop())}>
          <Icon className="h-4 w-4 shrink-0" />
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title, description, children, action, className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const [lang, setLang] = useState(() => typeof window !== "undefined" ? localStorage.getItem("admin_lang") || "en" : "en");
  useEffect(() => {
    const handleStorage = () => setLang(localStorage.getItem("admin_lang") || "en");
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const translate = (text: string) => {
    if (lang === "ta" && translations.ta[text]) {
      return translations.ta[text];
    }
    // Simple page panel headers overrides
    if (lang === "ta") {
      if (text.includes("Revenue & rides")) return "வருவாய் மற்றும் சவாரிகள் — கடந்த 7 நாட்கள்";
      if (text.includes("Zone share")) return "மண்டலப் பகிர்வு";
      if (text.includes("Live ride map") || text.includes("City map")) return "நேரடி சவாரி வரைபடம்";
      if (text.includes("Demand by hour")) return "மணிநேர வாரியான தேவை (பைக் vs ஆட்டோ)";
      if (text.includes("Activity feed")) return "செயல்பாட்டு ஊட்டம் (கடந்த 10 நிமிடங்கள்)";
      if (text.includes("Global controls")) return "உலகளாவிய கட்டுப்பாடுகள்";
      if (text.includes("Zone multipliers")) return "மண்டல கட்டண பெருக்கிகள்";
      if (text.includes("Top performing zones")) return "அதிவேகமாக செயல்படும் பகுதிகள்";
      if (text.includes("Recent transactions")) return "சமீபத்திய பரிவர்த்தனைகள்";
      if (text.includes("Pricing rules")) return "அடிப்படை கட்டண விதிகள்";
      if (text.includes("Chennai zones")) return "சென்னை மண்டலங்கள் (Geofenced)";
      if (text.includes("Emergency controls")) return "அவசரகால கட்டுப்பாடுகள்";
      if (text.includes("Admin team")) return "நிர்வாகக் குழு மற்றும் அனுமதி நிலை";
      if (text.includes("Compose new campaign")) return "புதிய அறிவிப்பு பிரச்சாரத்தை உருவாக்கு";
      if (text.includes("Preview")) return "முன்னோட்டம் (Push Alert)";
      if (text.includes("Recent campaigns")) return "சமீபத்திய பிரச்சாரங்கள் & பலன்கள்";
    }
    return text;
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card/65 shadow-sm transition-all duration-300 hover:shadow-md backdrop-blur-sm", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-border/80 px-4 py-3 bg-card/30 rounded-t-xl">
        <div>
          <h3 className="text-xs font-bold tracking-wide text-foreground uppercase">{translate(title)}</h3>
          {description && <p className="text-[10px] text-muted-foreground mt-0.5">{translate(description)}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}