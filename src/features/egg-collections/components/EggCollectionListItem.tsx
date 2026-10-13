import { Egg, Pencil, Trash } from "lucide-react";

import { formatDateLabel } from "../../../shared/utils/date";
import type { EggCollection } from "../domain/egg-collection";

type EggCollectionListItemProps = {
  record: EggCollection;
  cageName: string;
  onEdit: (record: EggCollection) => void;
  onDelete: (record: EggCollection) => void;
};

export function EggCollectionListItem({
  record,
  cageName,
  onEdit,
  onDelete,
}: EggCollectionListItemProps) {
  return (
    <li className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
          <Egg className="h-5 w-5" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-third">{cageName}</p>
          <p className="text-xs text-secondary">{formatDateLabel(record.collectionDate)}</p>
        </div>

        <span className="shrink-0 text-sm font-semibold text-third">
          {record.quantity} {record.quantity === 1 ? "huevo" : "huevos"}
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
