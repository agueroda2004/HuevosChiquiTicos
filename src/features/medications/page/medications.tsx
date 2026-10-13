import { useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { getErrorMessage } from "../../../shared/utils/error";
import { MedicationForm } from "../components/MedicationForm";
import { MedicationsList } from "../components/MedicationsList";
import { MedicationsSkeleton } from "../components/MedicationsSkeleton";
import type {
  CreateMedicationInput,
  Medication,
  UpdateMedicationInput,
} from "../domain/medication";
import { useMedications } from "../hooks/useMedications";

export default function MedicationsPage() {
  const {
    medications,
    isLoading,
    error,
    createMedication,
    isCreating,
    createError,
    resetCreateError,
    updateMedication,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteMedication,
    isDeleting,
    resetDeleteError,
  } = useMedications();
  const { notifySuccess, notifyError } = useNotifications();
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deletingMedication, setDeletingMedication] = useState<Medication | null>(null);

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (medication: Medication) => {
    resetUpdateError();
    setEditingMedication(medication);
  };

  const openDelete = (medication: Medication) => {
    resetDeleteError();
    setDeletingMedication(medication);
  };

  const handleCreate = async (input: CreateMedicationInput) => {
    try {
      await createMedication(input);
      setFormOpen(false);
      notifySuccess("Medicamento creado.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateMedicationInput) => {
    try {
      await updateMedication(input);
      setEditingMedication(null);
      notifySuccess("Medicamento actualizado.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingMedication) return;

    try {
      await deleteMedication(deletingMedication.id);
      setDeletingMedication(null);
      notifySuccess("Medicamento eliminado.");
    } catch (deleteFailure) {
      setDeletingMedication(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Medicamentos</h1>
          <p className="mt-1 text-sm text-secondary">Medicamentos disponibles para tratar las aves</p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third"
        >
          Nuevo medicamento
        </button>
      </header>

      {isLoading && <MedicationsSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <MedicationsList medications={medications} onEdit={openEdit} onDelete={openDelete} />
      )}

      <BottomSheet
        open={isFormOpen}
        onClose={() => setFormOpen(false)}
        title="Nuevo medicamento"
      >
        <MedicationForm
          key={formKey}
          mode="create"
          isSubmitting={isCreating}
          error={createError}
          onSubmit={handleCreate}
        />
      </BottomSheet>

      <BottomSheet
        open={editingMedication !== null}
        onClose={() => setEditingMedication(null)}
        title="Editar medicamento"
      >
        {editingMedication && (
          <MedicationForm
            mode="edit"
            initialValues={editingMedication}
            isSubmitting={isUpdating}
            error={updateError}
            onSubmit={handleUpdate}
          />
        )}
      </BottomSheet>

      <ConfirmSheet
        open={deletingMedication !== null}
        onClose={() => setDeletingMedication(null)}
        onConfirm={handleDelete}
        title="Eliminar medicamento"
        description={
          deletingMedication
            ? `¿Seguro que deseas eliminar "${deletingMedication.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
