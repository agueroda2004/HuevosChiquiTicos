import type { Death } from "../domain/death";
import { DeathListItem } from "./DeathListItem";

type DeathsListProps = {
  records: Death[];
  cageNameById: Record<string, string>;
  onEdit: (record: Death) => void;
  onDelete: (record: Death) => void;
};

export function DeathsList({ records, cageNameById, onEdit, onDelete }: DeathsListProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay registros</p>
        <p className="mt-1 text-xs text-secondary">
          No se encontraron muertes con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {records.map((record) => (
        <DeathListItem
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
