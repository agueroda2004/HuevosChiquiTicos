import type { Medication } from "../domain/medication";
import { MedicationListItem } from "./MedicationListItem";

type MedicationsListProps = {
  medications: Medication[];
  onEdit: (medication: Medication) => void;
  onDelete: (medication: Medication) => void;
};

export function MedicationsList({ medications, onEdit, onDelete }: MedicationsListProps) {
  if (medications.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay medicamentos todavía</p>
        <p className="mt-1 text-xs text-secondary">Crea tu primer medicamento para empezar.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {medications.map((medication) => (
        <MedicationListItem
          key={medication.id}
          medication={medication}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
