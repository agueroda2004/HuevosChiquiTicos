import type { Invoice } from "../domain/invoice";
import { InvoiceCard } from "./InvoiceCard";

type InvoicesListProps = {
  invoices: Invoice[];
  customerNameById: Record<string, string>;
  hasFilters: boolean;
  onAddPayment: (invoice: Invoice) => void;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
};

export function InvoicesList({
  invoices,
  customerNameById,
  hasFilters,
  onAddPayment,
  onView,
  onEdit,
  onDelete,
}: InvoicesListProps) {
  if (invoices.length === 0) {
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
      {invoices.map((invoice) => (
        <InvoiceCard
          key={invoice.id}
          invoice={invoice}
          customerName={customerNameById[invoice.customerId] ?? "Cliente eliminado"}
          onAddPayment={onAddPayment}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
