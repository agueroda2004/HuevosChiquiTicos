import { Eye, Pencil, Plus, Trash } from "lucide-react";

import { formatCurrency } from "../../../shared/utils/currency";
import { formatDateLabel, todayIso } from "../../../shared/utils/date";
import { getInvoiceStatusLabel, INVOICE_STATUS_BADGE_CLASS } from "../constants";
import type { Invoice } from "../domain/invoice";
import { roundCurrency } from "../utils";

type InvoiceCardProps = {
  invoice: Invoice;
  customerName: string;
  onAddPayment: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
};

export function InvoiceCard({
  invoice,
  customerName,
  onAddPayment,
  onView,
  onEdit,
  onDelete,
}: InvoiceCardProps) {
  const isPaid = invoice.status === "paid";
  const canPay = !isPaid;
  const isOverdue = !isPaid && invoice.dueDate < todayIso();
  const balance = roundCurrency(invoice.total - invoice.totalPaid);

  return (
    <li className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-third">{invoice.number}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                INVOICE_STATUS_BADGE_CLASS[invoice.status]
              }`}
            >
              {getInvoiceStatusLabel(invoice.status)}
            </span>
            {invoice.orderId && (
              <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-medium text-secondary">
                Pedido
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-secondary">{customerName}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <span className="text-xs text-secondary">
              Vence: {formatDateLabel(invoice.dueDate)}
            </span>
            {isOverdue && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600">
                Vencida
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end">
          <span className="text-sm font-semibold text-third">
            {formatCurrency(invoice.total)}
          </span>
          <span className="text-xs text-secondary">
            Cobrado: {formatCurrency(invoice.totalPaid)}
          </span>
          <span className="text-xs font-medium text-secondary">Saldo: {formatCurrency(balance)}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {canPay && (
          <button
            type="button"
            onClick={() => onAddPayment(invoice)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/40 px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-secondary/10"
          >
            <Plus className="h-3.5 w-3.5" />
            Registrar pago
          </button>
        )}
        <button
          type="button"
          onClick={() => onView(invoice)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/30 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-secondary/10"
        >
          <Eye className="h-3.5 w-3.5" />
          Detalle
        </button>
        {!isPaid && (
          <button
            type="button"
            onClick={() => onEdit(invoice)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/30 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-secondary/10"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
        )}
        <button
          type="button"
          onClick={() => onDelete(invoice)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </li>
  );
}
