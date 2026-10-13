import { Pencil, Pill, Trash } from "lucide-react";

import type { Medication } from "../domain/medication";

type MedicationListItemProps = {
  medication: Medication;
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
};

export function MedicationListItem({ medication, onEdit, onDelete }: MedicationListItemProps) {
  return (
    <li className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
          <Pill className="h-5 w-5" />
        </span>

        <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-third">
          {medication.name}
        </h3>

        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            medication.active ? "bg-secondary/15 text-secondary" : "bg-third/10 text-third/60"
          }`}
        >
          {medication.active ? "Activo" : "Inactivo"}
        </span>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onEdit(medication)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/30 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-secondary/10"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(medication)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </li>
  );
}
