import { X } from "lucide-react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { useFilterDraft } from "../../../shared/hooks/useFilterDraft";
import { ORDER_STATUS_OPTIONS } from "../constants";
import type { OrderStatus } from "../domain/order";

export type OrderFiltersValue = {
  customerId: string;
  status: OrderStatus | "";
  from: string;
  to: string;
};

const EMPTY: OrderFiltersValue = { customerId: "", status: "", from: "", to: "" };

type OrderFiltersProps = {
  value: OrderFiltersValue;
  customerOptions: DropdownOption[];
  onChange: (value: OrderFiltersValue) => void;
};

const statusOptions: DropdownOption<OrderStatus | "">[] = [
  { value: "", label: "Pendiente y listo" },
  ...ORDER_STATUS_OPTIONS,
];

export function OrderFilters({ value, customerOptions, onChange }: OrderFiltersProps) {
  const { draft, setDraft, apply } = useFilterDraft(value, onChange);

  const hasFilters =
    draft.customerId !== "" || draft.status !== "" || draft.from !== "" || draft.to !== "";
  const options: DropdownOption[] = [
    { value: "", label: "Todos los clientes" },
    ...customerOptions,
  ];

  const clear = () => {
    setDraft(EMPTY);
    onChange(EMPTY);
  };

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="w-full sm:min-w-[11rem] sm:flex-1">
        <Dropdown
          value={draft.customerId}
          options={options}
          onChange={(customerId) => setDraft({ ...draft, customerId })}
          placeholder="Todos los clientes"
        />
      </div>

      <div className="w-full sm:min-w-[11rem] sm:flex-1">
        <Dropdown
          value={draft.status}
          options={statusOptions}
          onChange={(status) => setDraft({ ...draft, status })}
          placeholder="Pendiente y listo"
        />
      </div>

      <div className="w-full sm:min-w-[10rem] sm:flex-1">
        <DatePicker
          value={draft.from}
          onChange={(from) => setDraft({ ...draft, from })}
          placeholder="Desde"
          max={draft.to || undefined}
        />
      </div>

      <div className="w-full sm:min-w-[10rem] sm:flex-1">
        <DatePicker
          value={draft.to}
          onChange={(to) => setDraft({ ...draft, to })}
          placeholder="Hasta"
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
