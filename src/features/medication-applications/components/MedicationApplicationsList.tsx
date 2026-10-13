import type { MedicationApplication } from "../domain/medication-application";
import { MedicationApplicationListItem } from "./MedicationApplicationListItem";

type MedicationApplicationsListProps = {
  records: MedicationApplication[];
  cageNameById: Record<string, string>;
  medicationNameById: Record<string, string>;
  onEdit: (record: MedicationApplication) => void;
  onDelete: (record: MedicationApplication) => void;
};

export function MedicationApplicationsList({
  records,
  cageNameById,
  medicationNameById,
  onEdit,
  onDelete,
}: MedicationApplicationsListProps) {
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay registros</p>
        <p className="mt-1 text-xs text-secondary">
          No se encontraron aplicaciones con los filtros actuales.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {records.map((record) => (
        <MedicationApplicationListItem
          key={record.id}
          record={record}
          cageNames={record.cageIds.map((cageId) => cageNameById[cageId] ?? "Jaula eliminada")}
          medicationName={medicationNameById[record.medicationId] ?? "Medicamento eliminado"}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
