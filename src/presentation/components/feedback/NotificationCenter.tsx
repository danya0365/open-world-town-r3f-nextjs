"use client";

import { X, Info, CheckCircle2, AlertTriangle, AlertOctagon } from "lucide-react";
import { useNotificationStore } from "@/src/presentation/stores/notificationStore";
import type { NotificationVariant } from "@/src/presentation/stores/notificationStore";

const variantConfig: Record<NotificationVariant, {
  icon: typeof Info;
  container: string;
  accent: string;
}> = {
  info: {
    icon: Info,
    container: "bg-blue-600/90 border-blue-400/30",
    accent: "text-blue-100",
  },
  success: {
    icon: CheckCircle2,
    container: "bg-emerald-600/90 border-emerald-400/30",
    accent: "text-emerald-100",
  },
  warning: {
    icon: AlertTriangle,
    container: "bg-amber-600/90 border-amber-400/30",
    accent: "text-amber-100",
  },
  error: {
    icon: AlertOctagon,
    container: "bg-red-600/90 border-red-400/30",
    accent: "text-red-100",
  },
};

export function NotificationCenter() {
  const notifications = useNotificationStore((state) => state.notifications);
  const removeNotification = useNotificationStore((state) => state.removeNotification);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
      {notifications.map((notification) => {
        const variant = variantConfig[notification.variant];
        const Icon = variant.icon;

        return (
          <div
            key={notification.id}
            role="status"
            className={`pointer-events-auto shadow-lg border backdrop-blur-md rounded-xl px-4 py-3 flex items-start gap-3 text-white transition-all ${variant.container}`}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${variant.accent}`} aria-hidden />
            <div className="flex-1 text-sm leading-5">{notification.message}</div>
            <button
              type="button"
              aria-label="ปิดการแจ้งเตือน"
              className="text-white/70 hover:text-white transition-colors"
              onClick={() => removeNotification(notification.id)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
