import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getNotifications } from "../../lib/notification";
import { useAuth } from "./AuthContext";

type NotificationContextValue = {
  unreadCount: number;
  refreshUnreadCount: () => Promise<void>;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
};

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const result = await getNotifications();
      setUnreadCount(Number(result?.unreadCount) || 0);
    } catch {
      // Preserve the last count during temporary network failures.
    }
  }, [user?.id]);

  useEffect(() => {
    refreshUnreadCount();
    const timer = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(timer);
  }, [refreshUnreadCount]);

  const value = useMemo(
    () => ({ unreadCount, refreshUnreadCount, setUnreadCount }),
    [unreadCount, refreshUnreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotificationCount() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotificationCount must be used inside NotificationProvider");
  return context;
}
