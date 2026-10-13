import type { Cage } from "../domain/cage";
import { CageListItem } from "./CageListItem";

type CagesListProps = {
  cages: Cage[];
  onEdit: (cage: Cage) => void;
  onDelete: (cage: Cage) => void;
};

export function CagesList({ cages, onEdit, onDelete }: CagesListProps) {
  if (cages.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay jaulas todavía</p>
        <p className="mt-1 text-xs text-secondary">Crea tu primera jaula para empezar.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cages.map((cage) => (
        <CageListItem key={cage.id} cage={cage} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </ul>
  );
}
