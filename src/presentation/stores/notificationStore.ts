import { create } from "zustand";

export type NotificationVariant = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  message: string;
  variant: NotificationVariant;
  duration: number;
}

interface NotificationOptions {
  duration?: number;
  id?: string;
}

interface NotificationStore {
  notifications: NotificationItem[];
  addNotification: (
    message: string,
    variant?: NotificationVariant,
    options?: NotificationOptions
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const DEFAULT_DURATION = 5000;

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  addNotification: (message, variant = "info", options) => {
    const id = options?.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
    const duration = options?.duration ?? DEFAULT_DURATION;

    const notification: NotificationItem = {
      id,
      message,
      variant,
      duration,
    };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    if (duration > 0 && typeof window !== "undefined") {
      window.setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }

    return id;
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((notification) => notification.id !== id),
    }));
  },
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
