import { BottomSheet } from "../../../shared/components/BottomSheet";
import { formatCurrency } from "../../../shared/utils/currency";
import { formatDateLabel, todayIso } from "../../../shared/utils/date";
import { BILL_STATUS_BADGE_CLASS, getBillStatusLabel } from "../constants";
import type { Bill } from "../domain/bill";
import { roundCurrency } from "../utils";
import { BillItemsSummary } from "./BillItemsSummary";
import { PaymentsSection } from "./PaymentsSection";

type BillDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  bill: Bill | null;
  supplierName: string;
  isRemovingPayment: boolean;
  onRemovePayment: (paymentId: string) => void;
};

export function BillDetailSheet({
  open,
  onClose,
  bill,
  supplierName,
  isRemovingPayment,
  onRemovePayment,
}: BillDetailSheetProps) {
  const isPaid = bill?.status === "paid";
  const isOverdue = bill ? !isPaid && bill.dueDate < todayIso() : false;
  const balance = bill ? roundCurrency(bill.total - bill.totalPaid) : 0;

  return (
    <BottomSheet open={open} onClose={onClose} title="Detalle de la factura">
      {bill && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-secondary">Factura</p>
              <p className="truncate text-sm font-semibold text-third">{bill.number}</p>
              <p className="mt-0.5 truncate text-xs text-secondary">{supplierName}</p>
              {bill.supplierNumber && (
                <p className="truncate text-xs text-secondary">
                  Nº proveedor: {bill.supplierNumber}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                BILL_STATUS_BADGE_CLASS[bill.status]
              }`}
            >
              {getBillStatusLabel(bill.status)}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <p className="text-xs text-secondary">Emisión</p>
              <p className="mt-0.5 text-sm text-third">{formatDateLabel(bill.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary">Vencimiento</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-sm text-third">{formatDateLabel(bill.dueDate)}</span>
                {isOverdue && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600">
                    Vencida
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-third">Detalle</p>
            <BillItemsSummary
              items={bill.items}
              emptyLabel="Esta factura no tiene conceptos registrados."
            />
          </div>

          <div className="flex flex-col gap-1 rounded-xl border border-secondary/30 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Total</span>
              <span className="text-sm font-semibold text-third">
                {formatCurrency(bill.total)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-secondary">Pagado</span>
              <span className="text-sm font-semibold text-third">
                {formatCurrency(bill.totalPaid)}
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
            payments={bill.payments}
            isRemoving={isRemovingPayment}
            canRemove={!isPaid}
            onRemove={onRemovePayment}
          />
        </div>
      )}
    </BottomSheet>
  );
}
