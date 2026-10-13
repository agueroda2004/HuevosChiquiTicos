import { useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { getErrorMessage } from "../../../shared/utils/error";
import { CageForm } from "../components/CageForm";
import { CagesList } from "../components/CagesList";
import { CagesSkeleton } from "../components/CagesSkeleton";
import type { Cage, CreateCageInput, UpdateCageInput } from "../domain/cage";
import { useCages } from "../hooks/useCages";

export default function CagesPage() {
  const {
    cages,
    isLoading,
    error,
    createCage,
    isCreating,
    createError,
    resetCreateError,
    updateCage,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteCage,
    isDeleting,
  } = useCages();
  const { notifySuccess, notifyError } = useNotifications();
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [createFormKey, setCreateFormKey] = useState(0);
  const [editingCage, setEditingCage] = useState<Cage | null>(null);
  const [deletingCage, setDeletingCage] = useState<Cage | null>(null);

  const openCreate = () => {
    resetCreateError();
    setCreateFormKey((key) => key + 1);
    setCreateOpen(true);
  };

  const openEdit = (cage: Cage) => {
    resetUpdateError();
    setEditingCage(cage);
  };

  const handleCreate = async (input: CreateCageInput) => {
    try {
      await createCage(input);
      setCreateOpen(false);
      notifySuccess("Jaula creada.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateCageInput) => {
    try {
      await updateCage(input);
      setEditingCage(null);
      notifySuccess("Jaula actualizada.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingCage) return;

    try {
      await deleteCage(deletingCage.id);
      setDeletingCage(null);
      notifySuccess("Jaula eliminada.");
    } catch (deleteFailure) {
      setDeletingCage(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Jaulas</h1>
          <p className="mt-1 text-sm text-secondary">Gestiona las jaulas del criadero</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third"
        >
          Nueva jaula
        </button>
      </header>

      {isLoading && <CagesSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <CagesList cages={cages} onEdit={openEdit} onDelete={setDeletingCage} />
      )}

      <BottomSheet open={isCreateOpen} onClose={() => setCreateOpen(false)} title="Nueva jaula">
        <CageForm
          key={createFormKey}
          mode="create"
          isSubmitting={isCreating}
          error={createError}
          onSubmit={handleCreate}
        />
      </BottomSheet>

      <BottomSheet
        open={editingCage !== null}
        onClose={() => setEditingCage(null)}
        title="Editar jaula"
      >
        {editingCage && (
          <CageForm
            mode="edit"
            initialValues={editingCage}
            isSubmitting={isUpdating}
            error={updateError}
            onSubmit={handleUpdate}
          />
        )}
      </BottomSheet>

      <ConfirmSheet
        open={deletingCage !== null}
        onClose={() => setDeletingCage(null)}
        onConfirm={handleDelete}
        title="Eliminar jaula"
        description={
          deletingCage
            ? `¿Seguro que deseas eliminar "${deletingCage.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
