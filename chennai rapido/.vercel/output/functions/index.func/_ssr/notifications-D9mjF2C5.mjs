import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { a as ArrowLeft, e as BellOff, B as Bell, i as Car, s as CreditCard, Z as ShieldAlert, a3 as Tag } from "../_libs/lucide-react.mjs";
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
const seed = [{
  id: "1",
  cat: "rides",
  title: "Driver Arrived",
  tamil: "ஓட்டுநர் வந்துவிட்டார்",
  body: "Ravi is waiting at Marina Beach gate 2.",
  time: "now",
  unread: true
}, {
  id: "2",
  cat: "payments",
  title: "Payment Successful",
  body: "₹148 paid to Suresh K. via UPI.",
  time: "2m",
  unread: true
}, {
  id: "3",
  cat: "alerts",
  title: "Emergency Contact Notified",
  body: "Your trip details were shared with Amma.",
  time: "10m",
  unread: true
}, {
  id: "4",
  cat: "offers",
  title: "50% OFF on Auto rides",
  body: "Use code CHENNAI50 before midnight.",
  time: "1h",
  unread: false
}, {
  id: "5",
  cat: "rides",
  title: "Trip Completed",
  body: "₹148 · 6.2 km · T. Nagar → Adyar.",
  time: "3h",
  unread: false
}, {
  id: "6",
  cat: "offers",
  title: "Refer & Earn ₹100",
  body: "Invite your friends to ride.",
  time: "1d",
  unread: false
}];
const cats = [{
  id: "all",
  label: "All"
}, {
  id: "rides",
  label: "Rides"
}, {
  id: "payments",
  label: "Payments"
}, {
  id: "alerts",
  label: "Alerts"
}, {
  id: "offers",
  label: "Offers"
}];
const iconFor = (c) => c === "rides" ? Car : c === "payments" ? CreditCard : c === "alerts" ? ShieldAlert : Tag;
const tintFor = (c) => c === "rides" ? "bg-primary text-primary-foreground" : c === "payments" ? "bg-emerald-500 text-white" : c === "alerts" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground";
function NotificationsPage() {
  const [list, setList] = reactExports.useState(seed);
  const [cat, setCat] = reactExports.useState("all");
  const [swiped, setSwiped] = reactExports.useState(null);
  const filtered = cat === "all" ? list : list.filter((n) => n.cat === cat);
  const unread = list.filter((n) => n.unread).length;
  const markRead = (id) => setList((l) => l.map((n) => n.id === id ? {
    ...n,
    unread: false
  } : n));
  const remove = (id) => setList((l) => l.filter((n) => n.id !== id));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-dvh", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 px-4 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/app/home", className: "grid size-9 place-items-center rounded-xl bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "flex items-center gap-2 text-base font-bold", children: [
            "Notifications",
            unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-pulse", children: unread })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", style: {
            fontFamily: "var(--font-tamil)"
          }, children: "அறிவிப்புகள்" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setList((l) => l.map((n) => ({
          ...n,
          unread: false
        }))), className: "rounded-lg px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground", children: "Mark all read" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2 overflow-x-auto px-4 pb-3", children: cats.map((c) => {
        const active = cat === c.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCat(c.id), className: "rounded-full px-3 py-1.5 text-[12px] font-semibold transition " + (active ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"), children: c.label }, c.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
      filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center gap-3 py-20 text-center animate-fade-in", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-16 place-items-center rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BellOff, { className: "size-7 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-base font-bold", children: "All caught up!" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "You have no notifications here." })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: filtered.map((n) => {
        const Icon = iconFor(n.cat);
        const isSwiped = swiped === n.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "relative overflow-hidden rounded-2xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 right-0 flex items-center bg-destructive px-4 text-xs font-bold text-destructive-foreground", children: "Delete" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => isSwiped ? remove(n.id) : (markRead(n.id), setSwiped(n.id)), className: "relative flex cursor-pointer items-start gap-3 border border-border bg-card p-3 transition " + (isSwiped ? "-translate-x-20" : ""), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid size-10 shrink-0 place-items-center rounded-xl " + tintFor(n.cat), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-semibold", children: n.title }),
                n.unread && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-2 rounded-full bg-primary animate-pulse" })
              ] }),
              n.tamil && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", style: {
                fontFamily: "var(--font-tamil)"
              }, children: n.tamil }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-0.5 text-[12px] text-muted-foreground", children: n.body })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: n.time })
          ] })
        ] }, n.id);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-center gap-2 text-[11px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "size-3" }),
        " Swipe a card to delete"
      ] })
    ] })
  ] });
}
export {
  NotificationsPage as component
};
