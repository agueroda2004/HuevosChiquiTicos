import type { Customer } from "../domain/customer";
import { CustomerListItem } from "./CustomerListItem";

type CustomersListProps = {
  customers: Customer[];
  hasFilters: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
};

export function CustomersList({ customers, hasFilters, onEdit, onDelete }: CustomersListProps) {
  if (customers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay clientes</p>
        <p className="mt-1 text-xs text-secondary">
          {hasFilters
            ? "No se encontraron clientes con los filtros actuales."
            : "Crea tu primer cliente para empezar."}
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {customers.map((customer) => (
        <CustomerListItem
          key={customer.id}
          customer={customer}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
