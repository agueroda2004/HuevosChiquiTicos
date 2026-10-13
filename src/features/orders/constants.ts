import type { OrderStatus } from "./domain/order";

export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "ready", label: "Listo" },
  { value: "delivered", label: "Entregado" },
];

export const ORDER_STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  ready: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return ORDER_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}
