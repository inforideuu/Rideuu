import { Link, useLocation } from "@tanstack/react-router";
import { Home, Receipt, Tag, ShieldAlert, User } from "lucide-react";

const items = [
  { to: "/app/home", label: "Home", icon: Home },
  { to: "/app/trips", label: "Trips", icon: Receipt },
  { to: "/app/offers", label: "Offers", icon: Tag },
  { to: "/app/safety", label: "Safety", icon: ShieldAlert },
  { to: "/app/account", label: "Account", icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <Link
                to={to}
                className={
                  "flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[11px] font-medium transition " +
                  (active
                    ? "text-secondary-foreground"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                <span
                  className={
                    "grid size-9 place-items-center rounded-xl transition " +
                    (active ? "bg-primary text-primary-foreground" : "bg-transparent")
                  }
                >
                  <Icon className="size-4" />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}