import type { Order, OrderStatus } from "../domain/order";
import { OrderCard } from "./OrderCard";

type OrdersListProps = {
  orders: Order[];
  customerNameById: Record<string, string>;
  hasFilters: boolean;
  isUpdating: boolean;
  onStatusChange: (order: Order, status: OrderStatus) => void;
  onView: (order: Order) => void;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
};

export function OrdersList({
  orders,
  customerNameById,
  hasFilters,
  isUpdating,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
}: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay pedidos</p>
        <p className="mt-1 text-xs text-secondary">
          {hasFilters
            ? "No se encontraron pedidos con los filtros actuales."
            : "Crea tu primer pedido para empezar."}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          customerName={customerNameById[order.customerId] ?? "Cliente eliminado"}
          isUpdating={isUpdating}
          onStatusChange={onStatusChange}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
