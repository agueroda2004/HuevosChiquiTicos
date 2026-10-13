import { BottomSheet } from "../../../shared/components/BottomSheet";
import { formatCurrency } from "../../../shared/utils/currency";
import { formatDateLabel, todayIso } from "../../../shared/utils/date";
import type { Product } from "../../products/domain/product";
import type { Order } from "../../orders/domain/order";
import { getInvoiceStatusLabel, INVOICE_STATUS_BADGE_CLASS } from "../constants";
import type { Invoice } from "../domain/invoice";
import { roundCurrency } from "../utils";
import { InvoiceItemsSummary } from "./InvoiceItemsSummary";
import { PaymentsSection } from "./PaymentsSection";

type InvoiceDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  customerName: string;
  products: Product[];
  orders: Order[];
  isRemovingPayment: boolean;
  onRemovePayment: (paymentId: string) => void;
};

export function InvoiceDetailSheet({
  open,
  onClose,
  invoice,
  customerName,
  products,
  orders,
  isRemovingPayment,
  onRemovePayment,
}: InvoiceDetailSheetProps) {
  const isPaid = invoice?.status === "paid";
  const isOverdue = invoice ? !isPaid && invoice.dueDate < todayIso() : false;
  const balance = invoice ? roundCurrency(invoice.total - invoice.totalPaid) : 0;
  const linkedOrder = invoice?.orderId
    ? orders.find((order) => order.id === invoice.orderId) ?? null
    : null;

  return (
    <BottomSheet open={open} onClose={onClose} title="Detalle de la factura">
      {invoice && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-secondary">Factura</p>
              <p className="truncate text-sm font-semibold text-third">{invoice.number}</p>
              <p className="mt-0.5 truncate text-xs text-secondary">{customerName}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                INVOICE_STATUS_BADGE_CLASS[invoice.status]
              }`}
            >
              {getInvoiceStatusLabel(invoice.status)}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <p className="text-xs text-secondary">Emisión</p>
              <p className="mt-0.5 text-sm text-third">{formatDateLabel(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary">Vencimiento</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-sm text-third">{formatDateLabel(invoice.dueDate)}</span>
                {isOverdue && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600">
                    Vencida
                  </span>
                )}
              </div>
            </div>
          </div>

          {linkedOrder && (
            <div>
              <p className="text-xs text-secondary">Pedido</p>
              <p className="mt-0.5 text-sm text-third">
                #{linkedOrder.id.slice(0, 8)} · entrega{" "}
                {formatDateLabel(linkedOrder.deliveryDate)}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-third">Detalle</p>
            <InvoiceItemsSummary
              items={invoice.items}
              products={products}
              emptyLabel="Esta factura no tiene productos registrados."
            />
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-secondary/30 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Total</span>
              <span className="text-sm font-semibold text-third">
                {formatCurrency(invoice.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Cobrado</span>
              <span className="text-sm font-semibold text-third">
                {formatCurrency(invoice.totalPaid)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-secondary/20 pt-2">
              <span className="text-sm font-medium text-third">Saldo</span>
              <span className="text-base font-semibold text-secondary">
                {formatCurrency(balance)}
              </span>
            </div>
          </div>

          <PaymentsSection
            payments={invoice.payments}
            isRemoving={isRemovingPayment}
            canRemove={!isPaid}
            onRemove={onRemovePayment}
          />
        </div>
      )}
    </BottomSheet>
  );
}
