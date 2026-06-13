import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Wallet, TrendingUp, Clock, User } from "lucide-react";
import { useRider } from "../../context/RiderContext";

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { language } = useRider();

  const items = [
    { to: "/dashboard", label: language === "ta" ? "முகப்பு" : "Home", icon: Home },
    { to: "/earnings", label: language === "ta" ? "வருவாய்" : "Earnings", icon: TrendingUp },
    { to: "/wallet", label: language === "ta" ? "வாலட்" : "Wallet", icon: Wallet },
    { to: "/history", label: language === "ta" ? "சவாரிகள்" : "History", icon: Clock },
    { to: "/profile", label: language === "ta" ? "விவரம்" : "Profile", icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-1 py-2.5 text-[10px]"
            >
              <Icon
                className={`h-5 w-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span className={active ? "text-primary font-semibold" : "text-muted-foreground"}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
