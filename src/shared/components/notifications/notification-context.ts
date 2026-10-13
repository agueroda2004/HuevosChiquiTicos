import { createContext } from "react";

import type { AppNotification, NotifyInput } from "../../domain/notification";

export type NotificationContextValue = {
  notifications: AppNotification[];
  notify: (input: NotifyInput) => string;
  dismiss: (id: string) => void;
};

export const NotificationContext = createContext<NotificationContextValue | null>(null);
