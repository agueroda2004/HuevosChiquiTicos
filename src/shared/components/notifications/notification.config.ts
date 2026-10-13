import { CircleAlert, CircleCheck, Info, type LucideIcon } from "lucide-react";

import type { NotificationType } from "../../domain/notification";

type NotificationStyle = {
  icon: LucideIcon;
  containerClassName: string;
  iconClassName: string;
};

export const NOTIFICATION_STYLES: Record<NotificationType, NotificationStyle> = {
  success: {
    icon: CircleCheck,
    containerClassName: "border-emerald-200 bg-emerald-50",
    iconClassName: "text-emerald-600",
  },
  error: {
    icon: CircleAlert,
    containerClassName: "border-red-200 bg-red-50",
    iconClassName: "text-red-600",
  },
  info: {
    icon: Info,
    containerClassName: "border-blue-200 bg-blue-50",
    iconClassName: "text-blue-600",
  },
};
