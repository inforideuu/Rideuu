import { createFileRoute } from "@tanstack/react-router";
import { MobileShell, PageHeader } from "@/components/rider/MobileShell";
import { Bell, CloudRain, Trophy, Wallet, ShieldAlert, CheckCircle2, Info, UserPlus } from "lucide-react";
import { useRider } from "../context/RiderContext";

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const { notificationsList, clearNotifications, t, language } = useRider();

  const handleClear = () => {
    clearNotifications();
  };

  return (
    <MobileShell>
      <PageHeader
        title={t("notifications")}
        right={
          notificationsList.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[10px] font-black text-primary underline"
            >
              Clear All
            </button>
          )
        }
      />
      
      <div className="px-5 space-y-3 pb-8">
        {notificationsList.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-3xl p-6 text-muted-foreground shadow-sm">
            <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2 animate-bounce" />
            <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">No notifications yet</h4>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              We'll alert you about Chennai rain bonuses, surge updates, and active KYC statuses.
            </p>
          </div>
        ) : (
          notificationsList.map((n) => {
            let IconComponent = Bell;
            if (n.iconName === "CloudRain") IconComponent = CloudRain;
            else if (n.iconName === "Wallet" || n.iconName === "ArrowDownToLine") IconComponent = Wallet;
            else if (n.iconName === "Trophy") IconComponent = Trophy;
            else if (n.iconName === "ShieldAlert") IconComponent = ShieldAlert;
            else if (n.iconName === "CheckCircle2") IconComponent = CheckCircle2;
            else if (n.iconName === "Upload" || n.iconName === "Info") IconComponent = Info;
            else if (n.iconName === "UserPlus") IconComponent = UserPlus;

            return (
              <div
                key={n.id}
                className={`flex items-start gap-3.5 rounded-2xl bg-card border p-4 shadow-sm hover:border-primary/25 transition slide-up ${
                  n.type === "alert" || n.type === "safety"
                    ? "border-red-500/20 bg-red-500/[0.02]"
                    : "border-border"
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  n.type === "safety" || n.type === "alert"
                    ? "bg-red-500/10 text-red-500 animate-pulse"
                    : n.type === "earnings"
                    ? "bg-success/10 text-success"
                    : "bg-accent text-primary"
                }`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-foreground tracking-tight leading-snug">
                    {language === "ta" ? t(n.titleKey) : n.titleEn}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold leading-relaxed mt-1">
                    {language === "ta" ? t(n.subKey) : n.subEn}
                  </div>
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0 font-bold uppercase">{n.time}</span>
              </div>
            );
          })
        )}
      </div>
    </MobileShell>
  );
}
