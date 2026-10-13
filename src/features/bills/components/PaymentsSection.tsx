import { Trash } from "lucide-react";

import { formatCurrency } from "../../../shared/utils/currency";
import { formatDateLabel } from "../../../shared/utils/date";
import { getPaymentMethodLabel } from "../constants";
import type { Payment } from "../domain/bill";

type PaymentsSectionProps = {
  payments: Payment[];
  isRemoving: boolean;
  canRemove?: boolean;
  onRemove: (paymentId: string) => void;
};

export function PaymentsSection({
  payments,
  isRemoving,
  canRemove = true,
  onRemove,
}: PaymentsSectionProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-third">Pagos emitidos</p>

      {payments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-secondary/30 bg-white/60 px-3 py-4 text-center text-xs text-secondary">
          Todavía no hay pagos registrados.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-third">
                  {formatCurrency(payment.amount)}
                </p>
                <p className="truncate text-xs text-secondary">
                  {getPaymentMethodLabel(payment.method)} · {formatDateLabel(payment.date)}
                  {payment.reference ? ` · ${payment.reference}` : ""}
                </p>
                {payment.notes && (
                  <p className="mt-0.5 truncate text-xs text-secondary/80">{payment.notes}</p>
                )}
              </div>

              {canRemove && (
                <button
                  type="button"
                  aria-label="Eliminar pago"
                  disabled={isRemoving}
                  onClick={() => onRemove(payment.id)}
                  className="shrink-0 rounded-lg border border-red-300 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
