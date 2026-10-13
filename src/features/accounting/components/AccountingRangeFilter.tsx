import { DatePicker } from "../../../shared/components/DatePicker";
import { useFilterDraft } from "../../../shared/hooks/useFilterDraft";
import { toIsoDate, todayIso } from "../../../shared/utils/date";

export type AccountingFiltersValue = {
  from: string;
  to: string;
};

type AccountingRangeFilterProps = {
  value: AccountingFiltersValue;
  onChange: (value: AccountingFiltersValue) => void;
};

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toIsoDate(date);
}

function startOfMonthIso(): string {
  const now = new Date();
  return toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

const PRESETS: { id: string; label: string; range: () => { from: string; to: string } }[] = [
  { id: "7", label: "7 días", range: () => ({ from: daysAgoIso(6), to: todayIso() }) },
  { id: "30", label: "30 días", range: () => ({ from: daysAgoIso(29), to: todayIso() }) },
  { id: "month", label: "Este mes", range: () => ({ from: startOfMonthIso(), to: todayIso() }) },
];

export function AccountingRangeFilter({ value, onChange }: AccountingRangeFilterProps) {
  const { draft, setDraft, apply } = useFilterDraft(value, onChange);

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const range = preset.range();
          const isActive = value.from === range.from && value.to === range.to;

          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(range)}
              className={`rounded-xl px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-secondary text-primary"
                  : "border border-secondary/30 text-secondary hover:bg-secondary/10"
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="w-full sm:min-w-[10rem] sm:flex-1">
          <DatePicker
            value={draft.from}
            onChange={(from) => setDraft({ ...draft, from })}
            placeholder="Desde"
            max={draft.to || todayIso()}
          />
        </div>

        <div className="w-full sm:min-w-[10rem] sm:flex-1">
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
      </div>
    </div>
  );
}
