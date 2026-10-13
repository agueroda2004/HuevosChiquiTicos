import type { EggCollection } from "../domain/egg-collection";
import { EggCollectionListItem } from "./EggCollectionListItem";

type EggCollectionsListProps = {
  records: EggCollection[];
  cageNameById: Record<string, string>;
  onEdit: (record: EggCollection) => void;
  onDelete: (record: EggCollection) => void;
};

export function EggCollectionsList({
  records,
  cageNameById,
  onEdit,
  onDelete,
}: EggCollectionsListProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay registros</p>
        <p className="mt-1 text-xs text-secondary">
          No se encontraron recolecciones con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {records.map((record) => (
        <EggCollectionListItem
          key={record.id}
          record={record}
          cageName={cageNameById[record.cageId] ?? "Jaula eliminada"}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
