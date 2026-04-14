"use client";

import type { Alert, AlertType } from "@/modules/alerts";

const TYPE_STYLES: Record<
  AlertType,
  { icon: string; bg: string; border: string; text: string; badge: string }
> = {
  danger: {
    icon: "!!",
    bg: "bg-danger/5",
    border: "border-danger/20",
    text: "text-danger",
    badge: "bg-danger/10 text-danger",
  },
  warning: {
    icon: "!",
    bg: "bg-warning/5",
    border: "border-warning/20",
    text: "text-warning",
    badge: "bg-warning/10 text-warning",
  },
  success: {
    icon: "+",
    bg: "bg-success/5",
    border: "border-success/20",
    text: "text-success",
    badge: "bg-success/10 text-success",
  },
  info: {
    icon: "i",
    bg: "bg-info/5",
    border: "border-info/20",
    text: "text-info",
    badge: "bg-info/10 text-info",
  },
};

export function AlertsCard({ alerts }: { alerts: Alert[] }) {
  if (alerts.length === 0) return null;

  const dangerCount = alerts.filter((a) => a.type === "danger" || a.type === "warning").length;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            Alertes
          </h2>
          {dangerCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/20 text-[10px] font-bold text-danger">
              {dangerCount}
            </span>
          )}
        </div>
        <span className="text-xs text-text-muted">Aujourd'hui</span>
      </div>

      <div className="space-y-2">
        {alerts.map((alert, i) => {
          const style = TYPE_STYLES[alert.type];

          return (
            <div
              key={alert.id}
              className={`rounded-xl border ${style.border} ${style.bg} p-3.5 transition-all duration-200 hover:brightness-110`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${style.badge}`}
                >
                  {style.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-semibold ${style.text}`}>
                    {alert.title}
                  </h3>
                  <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
