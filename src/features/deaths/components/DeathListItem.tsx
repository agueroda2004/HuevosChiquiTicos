import { Pencil, Skull, Trash } from "lucide-react";

import { formatDateLabel } from "../../../shared/utils/date";
import { getDeathTypeLabel } from "../constants";
import type { Death } from "../domain/death";

type DeathListItemProps = {
  record: Death;
  cageName: string;
  onEdit: (record: Death) => void;
  onDelete: (record: Death) => void;
};

export function DeathListItem({ record, cageName, onEdit, onDelete }: DeathListItemProps) {
  return (
    <li className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <Skull className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-third">{cageName}</p>
          <p className="text-xs text-secondary">{formatDateLabel(record.deathDate)}</p>
        </div>

        <span className="shrink-0 rounded-full bg-secondary/15 px-2 py-0.5 text-[11px] font-medium text-secondary">
          {getDeathTypeLabel(record.type)}
        </span>

        <span className="shrink-0 text-sm font-semibold text-third">
          {record.quantity} {record.quantity === 1 ? "ave" : "aves"}
        </span>
      </div>

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
