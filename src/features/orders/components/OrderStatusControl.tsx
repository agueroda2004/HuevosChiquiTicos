import { ORDER_STATUS_BADGE_CLASS } from "../constants";
import type { OrderStatus } from "../domain/order";

type OrderStatusControlProps = {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  disabled?: boolean;
};

export function OrderStatusControl({ value, onChange, disabled }: OrderStatusControlProps) {
  return (
    <div
      role="group"
      aria-label="Cambiar estado"
      className="inline-flex rounded-xl border border-secondary/30 bg-white p-1"
    >
      {(Object.keys(ORDER_STATUS_BADGE_CLASS) as OrderStatus[]).map((status) => {
        const isActive = status === value;
        const label =
          status === "pending" ? "Pendiente" : status === "ready" ? "Listo" : "Entregado";

        return (
          <button
            key={status}
            type="button"
            disabled={disabled}
            aria-pressed={isActive}
            onClick={() => {
              if (!isActive) onChange(status);
            }}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isActive
                ? ORDER_STATUS_BADGE_CLASS[status]
                : "text-secondary hover:bg-secondary/10"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
