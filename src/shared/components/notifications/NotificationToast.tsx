import { X } from "lucide-react";

import type { AppNotification } from "../../domain/notification";
import { cn } from "../../utils/cn";
import { NOTIFICATION_STYLES } from "./notification.config";

type NotificationToastProps = {
  notification: AppNotification;
  onClose: () => void;
};

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
  const style = NOTIFICATION_STYLES[notification.type];
  const Icon = style.icon;

  return (
    <div
      role="alert"
      className={cn(
        "animate-toast-in flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg",
        style.containerClassName,
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.iconClassName)} />

      <p className="min-w-0 flex-1 text-sm text-third">{notification.message}</p>

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar notificación"
        className="shrink-0 rounded-lg p-1 text-secondary transition hover:bg-black/5 hover:text-third"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
