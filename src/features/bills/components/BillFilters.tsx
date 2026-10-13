import { Search, X } from "lucide-react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { useFilterDraft } from "../../../shared/hooks/useFilterDraft";
import { BILL_STATUS_OPTIONS } from "../constants";
import type { BillStatus } from "../domain/bill";

export type BillFiltersValue = {
  search: string;
  status: BillStatus | "";
  supplierId: string;
  from: string;
  to: string;
};

const EMPTY: BillFiltersValue = {
  search: "",
  status: "",
  supplierId: "",
  from: "",
  to: "",
};

type BillFiltersProps = {
  value: BillFiltersValue;
  supplierOptions: DropdownOption[];
  onChange: (value: BillFiltersValue) => void;
};

const statusOptions: DropdownOption<BillStatus | "">[] = [
  { value: "", label: "Pendiente y parcial" },
  ...BILL_STATUS_OPTIONS,
];

export function BillFilters({ value, supplierOptions, onChange }: BillFiltersProps) {
  const { draft, setDraft, apply } = useFilterDraft(value, onChange);

  const hasFilters =
    draft.search !== "" ||
    draft.status !== "" ||
    draft.supplierId !== "" ||
    draft.from !== "" ||
    draft.to !== "";
  const options: DropdownOption[] = [
    { value: "", label: "Todos los proveedores" },
    ...supplierOptions,
  ];

  const clear = () => {
    setDraft(EMPTY);
    onChange(EMPTY);
  };

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="relative w-full sm:min-w-[11rem] sm:flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-secondary" />
        <input
          type="text"
          value={draft.search}
          onChange={(event) => setDraft({ ...draft, search: event.target.value })}
          placeholder="Buscar por número"
          aria-label="Buscar por número"
          className="w-full rounded-xl border border-secondary/30 bg-white py-3 pl-10 pr-4 text-sm text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30"
        />
      </div>

      <div className="w-full sm:min-w-[11rem] sm:flex-1">
        <Dropdown
          value={draft.supplierId}
          options={options}
          onChange={(supplierId) => setDraft({ ...draft, supplierId })}
          placeholder="Todos los proveedores"
        />
      </div>

      <div className="w-full sm:min-w-[11rem] sm:flex-1">
        <Dropdown
          value={draft.status}
          options={statusOptions}
          onChange={(status) => setDraft({ ...draft, status })}
          placeholder="Pendiente y parcial"
        />
      </div>

      <div className="w-full sm:min-w-[10rem] sm:flex-1">
        <DatePicker
          value={draft.from}
          onChange={(from) => setDraft({ ...draft, from })}
          placeholder="Vence desde"
          max={draft.to || undefined}
        />
      </div>

      <div className="w-full sm:min-w-[10rem] sm:flex-1">
        <DatePicker
          value={draft.to}
          onChange={(to) => setDraft({ ...draft, to })}
          placeholder="Vence hasta"
          min={draft.from || undefined}
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
