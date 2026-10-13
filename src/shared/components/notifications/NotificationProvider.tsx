import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import type { AppNotification, NotifyInput } from "../../domain/notification";
import { NotificationContext, type NotificationContextValue } from "./notification-context";
import { NotificationToast } from "./NotificationToast";

const DEFAULT_DURATION = 4000;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback(
    (input: NotifyInput) => {
      const type = input.type ?? "info";
      const id = crypto.randomUUID();

      setNotifications((current) => [...current, { id, type, message: input.message }]);

      // Errors stay until the user closes them; success/info auto-dismiss.
      if (type !== "error") {
        const timer = setTimeout(() => dismiss(id), input.duration ?? DEFAULT_DURATION);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  const value = useMemo<NotificationContextValue>(
    () => ({ notifications, notify, dismiss }),
    [notifications, notify, dismiss],
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}

      <div className="fixed inset-x-4 top-4 z-[80] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:w-96">
        {notifications.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onClose={() => dismiss(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
