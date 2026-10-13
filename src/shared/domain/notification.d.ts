export type NotificationType = "success" | "error" | "info";

export type AppNotification = {
  id: string;
  type: NotificationType;
  message: string;
};

export type NotifyInput = {
  type?: NotificationType;
  message: string;
  duration?: number;
};
