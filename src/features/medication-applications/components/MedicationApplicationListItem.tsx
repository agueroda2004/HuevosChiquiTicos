import { Pencil, Syringe, Trash } from "lucide-react";

import { formatDateLabel } from "../../../shared/utils/date";
import { getApplicationFormLabel } from "../constants";
import type { MedicationApplication } from "../domain/medication-application";

type MedicationApplicationListItemProps = {
  record: MedicationApplication;
  cageNames: string[];
  medicationName: string;
  onEdit: (record: MedicationApplication) => void;
  onDelete: (record: MedicationApplication) => void;
};

export function MedicationApplicationListItem({
  record,
  cageNames,
  medicationName,
  onEdit,
  onDelete,
}: MedicationApplicationListItemProps) {
  const isGroup = cageNames.length > 1;
  const cageLabel = isGroup
    ? `Grupo · ${cageNames.length} jaulas`
    : (cageNames[0] ?? "Jaula eliminada");

  return (
    <li className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
          <Syringe className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-third">{medicationName}</p>
          <p className="truncate text-xs text-secondary">
            {cageLabel} · {formatDateLabel(record.applicationDate)}
          </p>
        </div>

        {record.type && (
          <span className="shrink-0 rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-medium text-secondary">
            {getApplicationFormLabel(record.type)}
          </span>
        )}
      </div>

      {isGroup && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {cageNames.map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="rounded-full bg-secondary/10 px-2 py-0.5 text-[11px] font-medium text-secondary"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <p className="mt-2 text-xs text-secondary">
        Dosis: {record.dose} · {record.birdCount} {record.birdCount === 1 ? "ave" : "aves"}
      </p>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(record)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/30 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-secondary/10"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(record)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </li>
  );
}
