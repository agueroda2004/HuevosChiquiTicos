import type { Bill } from "../domain/bill";
import { BillCard } from "./BillCard";

type BillsListProps = {
  bills: Bill[];
  supplierNameById: Record<string, string>;
  hasFilters: boolean;
  onAddPayment: (bill: Bill) => void;
  onView: (bill: Bill) => void;
  onEdit: (bill: Bill) => void;
  onDelete: (bill: Bill) => void;
};

export function BillsList({
  bills,
  supplierNameById,
  hasFilters,
  onAddPayment,
  onView,
  onEdit,
  onDelete,
}: BillsListProps) {
  if (bills.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay facturas</p>
        <p className="mt-1 text-xs text-secondary">
          {hasFilters
            ? "No se encontraron facturas con los filtros actuales."
            : "Crea tu primera factura para empezar."}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {bills.map((bill) => (
        <BillCard
          key={bill.id}
          bill={bill}
          supplierName={supplierNameById[bill.supplierId] ?? "Proveedor eliminado"}
          onAddPayment={onAddPayment}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
