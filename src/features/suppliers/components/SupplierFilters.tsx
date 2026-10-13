import { Search, X } from "lucide-react";

import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { useFilterDraft } from "../../../shared/hooks/useFilterDraft";
import { SUPPLIER_STATUS_OPTIONS } from "../constants";
import type { SupplierStatus } from "../domain/supplier";

export type SupplierFiltersValue = {
  search: string;
  status: SupplierStatus | "";
};

const EMPTY: SupplierFiltersValue = { search: "", status: "" };

type SupplierFiltersProps = {
  value: SupplierFiltersValue;
  onChange: (value: SupplierFiltersValue) => void;
};

const statusOptions: DropdownOption<SupplierStatus | "">[] = [
  { value: "", label: "Todos los estados" },
  ...SUPPLIER_STATUS_OPTIONS,
];

export function SupplierFilters({ value, onChange }: SupplierFiltersProps) {
  const { draft, setDraft, apply } = useFilterDraft(value, onChange);

  const hasFilters = draft.search !== "" || draft.status !== "";

  const clear = () => {
    setDraft(EMPTY);
    onChange(EMPTY);
  };

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="relative w-full sm:min-w-[12rem] sm:flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-secondary" />
        <input
          type="text"
          value={draft.search}
          onChange={(event) => setDraft({ ...draft, search: event.target.value })}
          placeholder="Buscar por nombre"
          aria-label="Buscar por nombre"
          className="w-full rounded-xl border border-secondary/30 bg-white py-3 pl-10 pr-4 text-sm text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        />
      </div>

      <div className="w-full sm:min-w-[11rem] sm:flex-1">
        <Dropdown
          value={draft.status}
          options={statusOptions}
          onChange={(status) => setDraft({ ...draft, status })}
          placeholder="Todos los estados"
        />
      </div>

      <button
        type="button"
        onClick={apply}
        className="w-full rounded-xl bg-secondary px-4 py-3 text-sm font-semibold text-primary transition hover:bg-third sm:w-auto"
      >
        Filtrar
      </button>

      {hasFilters && (
        <button
          type="button"
          onClick={clear}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-secondary/30 px-3 py-3 text-xs font-medium text-secondary transition hover:bg-secondary/10 hover:text-third sm:w-auto"
        >
          <X className="size-4" />
          Limpiar
        </button>
      )}
    </div>
  );
}
