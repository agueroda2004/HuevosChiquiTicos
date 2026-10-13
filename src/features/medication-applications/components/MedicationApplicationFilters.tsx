import { X } from "lucide-react";

import { DatePicker } from "../../../shared/components/DatePicker";
import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { useFilterDraft } from "../../../shared/hooks/useFilterDraft";
import { todayIso } from "../../../shared/utils/date";

export type MedicationApplicationFiltersValue = {
  cageId: string;
  medicationId: string;
  from: string;
  to: string;
};

const EMPTY: MedicationApplicationFiltersValue = {
  cageId: "",
  medicationId: "",
  from: "",
  to: "",
};

type MedicationApplicationFiltersProps = {
  value: MedicationApplicationFiltersValue;
  cageOptions: DropdownOption[];
  medicationOptions: DropdownOption[];
  onChange: (value: MedicationApplicationFiltersValue) => void;
};

export function MedicationApplicationFilters({
  value,
  cageOptions,
  medicationOptions,
  onChange,
}: MedicationApplicationFiltersProps) {
  const { draft, setDraft, apply } = useFilterDraft(value, onChange);

  const hasFilters =
    draft.cageId !== "" ||
    draft.medicationId !== "" ||
    draft.from !== "" ||
    draft.to !== "";

  const cages: DropdownOption[] = [
    { value: "", label: "Todas las jaulas" },
    ...cageOptions,
  ];
  const medications: DropdownOption[] = [
    { value: "", label: "Todos los medicamentos" },
    ...medicationOptions,
  ];

  const clear = () => {
    setDraft(EMPTY);
    onChange(EMPTY);
  };

  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="w-full sm:min-w-[11rem] sm:flex-1">
        <span className="mb-1 block text-xs font-medium text-secondary">Jaula</span>
        <Dropdown
          value={draft.cageId}
          options={cages}
          onChange={(cageId) => setDraft({ ...draft, cageId })}
          placeholder="Todas las jaulas"
        />
      </div>

      <div className="w-full sm:min-w-[11rem] sm:flex-1">
        <span className="mb-1 block text-xs font-medium text-secondary">Medicamento</span>
        <Dropdown
          value={draft.medicationId}
          options={medications}
          onChange={(medicationId) => setDraft({ ...draft, medicationId })}
          placeholder="Todos los medicamentos"
        />
      </div>

      <div className="w-full sm:min-w-[10rem] sm:flex-1">
        <span className="mb-1 block text-xs font-medium text-secondary">Desde</span>
        <DatePicker
          value={draft.from}
          onChange={(from) => setDraft({ ...draft, from })}
          placeholder="Desde"
          max={draft.to || todayIso()}
        />
      </div>

      <div className="w-full sm:min-w-[10rem] sm:flex-1">
        <span className="mb-1 block text-xs font-medium text-secondary">Hasta</span>
        <DatePicker
          value={draft.to}
          onChange={(to) => setDraft({ ...draft, to })}
          placeholder="Hasta"
          min={draft.from || undefined}
          max={todayIso()}
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
