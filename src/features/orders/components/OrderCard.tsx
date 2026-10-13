import { Eye, Pencil, Trash } from "lucide-react";

import { formatCurrency } from "../../../shared/utils/currency";
import { formatDateLabel, todayIso } from "../../../shared/utils/date";
import { getOrderStatusLabel, ORDER_STATUS_BADGE_CLASS } from "../constants";
import type { Order, OrderStatus } from "../domain/order";
import { OrderStatusControl } from "./OrderStatusControl";

type OrderCardProps = {
  order: Order;
  customerName: string;
  isUpdating: boolean;
  onStatusChange: (order: Order, status: OrderStatus) => void;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
};

export function OrderCard({
  order,
  customerName,
  isUpdating,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
}: OrderCardProps) {
  const isOverdue = order.status !== "delivered" && order.deliveryDate < todayIso();

  return (
    <li className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-third">{customerName}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-secondary">
              Entrega: {formatDateLabel(order.deliveryDate)}
            </span>
            {isOverdue && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600">
                Atrasado
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-secondary">
            {order.items.length} {order.items.length === 1 ? "producto" : "productos"}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm font-semibold text-third">
            {formatCurrency(order.total)}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
              ORDER_STATUS_BADGE_CLASS[order.status]
            }`}
          >
            {getOrderStatusLabel(order.status)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <OrderStatusControl
          value={order.status}
          onChange={(status) => onStatusChange(order, status)}
          disabled={isUpdating}
        />

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onView(order)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/30 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-secondary/10"
          >
            <Eye className="h-3.5 w-3.5" />
            Detalle
          </button>
          <button
            type="button"
            onClick={() => onEdit(order)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/30 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-secondary/10"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(order)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </li>
  );
}
