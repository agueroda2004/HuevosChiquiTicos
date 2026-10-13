import { useContext } from "react";

import {
  NotificationContext,
  type NotificationContextValue,
} from "../components/notifications/notification-context";

export type UseNotificationsResult = NotificationContextValue & {
  notifySuccess: (message: string) => string;
  notifyError: (message: string) => string;
  notifyInfo: (message: string) => string;
};

export function useNotifications(): UseNotificationsResult {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider.");
  }

  const { notify } = context;

  return {
    ...context,
    notifySuccess: (message: string) => notify({ type: "success", message }),
    notifyError: (message: string) => notify({ type: "error", message }),
    notifyInfo: (message: string) => notify({ type: "info", message }),
  };
}
