import { Pencil, Trash } from "lucide-react";

import type { Cage } from "../domain/cage";

type CageListItemProps = {
  cage: Cage;
  onEdit: (cage: Cage) => void;
  onDelete: (cage: Cage) => void;
};

export function CageListItem({ cage, onEdit, onDelete }: CageListItemProps) {
  return (
    <li className="flex flex-col rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-third">{cage.name}</h3>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
            cage.active ? "bg-secondary/15 text-secondary" : "bg-third/10 text-third/60"
          }`}
        >
          {cage.active ? "Activa" : "Inactiva"}
        </span>
      </div>
      <p className="mt-3 text-xs text-secondary">
        {cage.birds} {cage.birds === 1 ? "ave" : "aves"}
      </p>

      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(cage)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-secondary/30 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-secondary/10"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => onDelete(cage)}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
        >
          <Trash className="h-3.5 w-3.5" />
          Eliminar
        </button>
      </div>
    </li>
  );
}
