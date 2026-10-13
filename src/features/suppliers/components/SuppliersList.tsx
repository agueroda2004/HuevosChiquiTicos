import type { Supplier } from "../domain/supplier";
import { SupplierListItem } from "./SupplierListItem";

type SuppliersListProps = {
  suppliers: Supplier[];
  hasFilters: boolean;
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
};

export function SuppliersList({ suppliers, hasFilters, onEdit, onDelete }: SuppliersListProps) {
  if (suppliers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay proveedores</p>
        <p className="mt-1 text-xs text-secondary">
          {hasFilters
            ? "No se encontraron proveedores con los filtros actuales."
            : "Crea tu primer proveedor para empezar."}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {suppliers.map((supplier) => (
        <SupplierListItem
          key={supplier.id}
          supplier={supplier}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
