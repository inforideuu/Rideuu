import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Bell, Car, CreditCard, ShieldAlert, Tag, BellOff } from "lucide-react";

export const Route = createFileRoute("/app/notifications")({
  component: NotificationsPage,
});

type Cat = "all" | "rides" | "payments" | "alerts" | "offers";

type Notif = {
  id: string;
  cat: Exclude<Cat, "all">;
  title: string;
  tamil?: string;
  body: string;
  time: string;
  unread: boolean;
};

const seed: Notif[] = [
  { id: "1", cat: "rides", title: "Driver Arrived", tamil: "ஓட்டுநர் வந்துவிட்டார்", body: "Ravi is waiting at Marina Beach gate 2.", time: "now", unread: true },
  { id: "2", cat: "payments", title: "Payment Successful", body: "₹148 paid to Suresh K. via UPI.", time: "2m", unread: true },
  { id: "3", cat: "alerts", title: "Emergency Contact Notified", body: "Your trip details were shared with Amma.", time: "10m", unread: true },
  { id: "4", cat: "offers", title: "50% OFF on Auto rides", body: "Use code CHENNAI50 before midnight.", time: "1h", unread: false },
  { id: "5", cat: "rides", title: "Trip Completed", body: "₹148 · 6.2 km · T. Nagar → Adyar.", time: "3h", unread: false },
  { id: "6", cat: "offers", title: "Refer & Earn ₹100", body: "Invite your friends to ride.", time: "1d", unread: false },
];

const cats: { id: Cat; label: string }[] = [
  { id: "all", label: "All" },
  { id: "rides", label: "Rides" },
  { id: "payments", label: "Payments" },
  { id: "alerts", label: "Alerts" },
  { id: "offers", label: "Offers" },
];

const iconFor = (c: Notif["cat"]) =>
  c === "rides" ? Car : c === "payments" ? CreditCard : c === "alerts" ? ShieldAlert : Tag;

const tintFor = (c: Notif["cat"]) =>
  c === "rides" ? "bg-primary text-primary-foreground" :
  c === "payments" ? "bg-emerald-500 text-white" :
  c === "alerts" ? "bg-destructive text-destructive-foreground" :
  "bg-secondary text-secondary-foreground";

function NotificationsPage() {
  const [list, setList] = useState(seed);
  const [cat, setCat] = useState<Cat>("all");
  const [swiped, setSwiped] = useState<string | null>(null);

  const filtered = cat === "all" ? list : list.filter((n) => n.cat === cat);
  const unread = list.filter((n) => n.unread).length;

  const markRead = (id: string) =>
    setList((l) => l.map((n) => (n.id === id ? { ...n, unread: false } : n)));
  const remove = (id: string) => setList((l) => l.filter((n) => n.id !== id));

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link to="/app/home" className="grid size-9 place-items-center rounded-xl bg-muted">
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-base font-bold">
              Notifications
              {unread > 0 && (
                <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse">
                  {unread}
                </span>
              )}
            </h1>
            <p className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-tamil)" }}>
              அறிவிப்புகள்
            </p>
          </div>
          <button
            onClick={() => setList((l) => l.map((n) => ({ ...n, unread: false })))}
            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Mark all read
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {cats.map((c) => {
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={
                  "rounded-full px-3 py-1.5 text-[12px] font-semibold transition " +
                  (active
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/70")
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </header>

      <div className="p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center animate-fade-in">
            <div className="grid size-16 place-items-center rounded-full bg-muted">
              <BellOff className="size-7 text-muted-foreground" />
            </div>
            <h2 className="text-base font-bold">All caught up!</h2>
            <p className="text-sm text-muted-foreground">You have no notifications here.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map((n) => {
              const Icon = iconFor(n.cat);
              const isSwiped = swiped === n.id;
              return (
                <li key={n.id} className="relative overflow-hidden rounded-2xl">
                  <div className="absolute inset-y-0 right-0 flex items-center bg-destructive px-4 text-xs font-bold text-destructive-foreground">
                    Delete
                  </div>
                  <div
                    onClick={() => (isSwiped ? remove(n.id) : (markRead(n.id), setSwiped(n.id)))}
                    className={
                      "relative flex cursor-pointer items-start gap-3 border border-border bg-card p-3 transition " +
                      (isSwiped ? "-translate-x-20" : "")
                    }
                  >
                    <div className={"grid size-10 shrink-0 place-items-center rounded-xl " + tintFor(n.cat)}>
                      <Icon className="size-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">{n.title}</h3>
                        {n.unread && <span className="size-2 rounded-full bg-primary animate-pulse" />}
                      </div>
                      {n.tamil && (
                        <p className="text-[11px] text-muted-foreground" style={{ fontFamily: "var(--font-tamil)" }}>
                          {n.tamil}
                        </p>
                      )}
                      <p className="mt-0.5 text-[12px] text-muted-foreground">{n.body}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground">{n.time}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <Bell className="size-3" /> Swipe a card to delete
        </div>
      </div>
    </div>
  );
}