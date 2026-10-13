import { useMemo, useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { formatDateLabel } from "../../../shared/utils/date";
import { getErrorMessage } from "../../../shared/utils/error";
import { useCages } from "../../cages/hooks/useCages";
import { useMedications } from "../../medications/hooks/useMedications";
import {
  MedicationApplicationFilters,
  type MedicationApplicationFiltersValue,
} from "../components/MedicationApplicationFilters";
import { MedicationApplicationForm } from "../components/MedicationApplicationForm";
import { MedicationApplicationsList } from "../components/MedicationApplicationsList";
import { MedicationApplicationsSkeleton } from "../components/MedicationApplicationsSkeleton";
import type {
  CreateMedicationApplicationInput,
  MedicationApplication,
  MedicationApplicationsQuery,
  UpdateMedicationApplicationInput,
} from "../domain/medication-application";
import { useMedicationApplications } from "../hooks/useMedicationApplications";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: MedicationApplicationFiltersValue = {
  cageId: "",
  medicationId: "",
  from: "",
  to: "",
};

export default function MedicationApplicationsPage() {
  const { cages } = useCages();
  const { medications } = useMedications();
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<MedicationApplicationFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingRecord, setEditingRecord] = useState<MedicationApplication | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<MedicationApplication | null>(null);

  const query: MedicationApplicationsQuery = {
    cageId: filters.cageId || undefined,
    medicationId: filters.medicationId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const {
    records,
    total,
    isLoading,
    error,
    createApplication,
    isCreating,
    createError,
    resetCreateError,
    updateApplication,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteApplication,
    isDeleting,
    resetDeleteError,
  } = useMedicationApplications(query);

  const cageOptions = useMemo(
    () => cages.map((cage) => ({ value: cage.id, label: cage.name })),
    [cages],
  );

  const cageNameById = useMemo(
    () => Object.fromEntries(cages.map((cage) => [cage.id, cage.name])),
    [cages],
  );

  const cageBirdCountById = useMemo(
    () => Object.fromEntries(cages.map((cage) => [cage.id, cage.birds])),
    [cages],
  );

  const medicationOptions = useMemo(
    () => medications.map((medication) => ({ value: medication.id, label: medication.name })),
    [medications],
  );

  const medicationNameById = useMemo(
    () => Object.fromEntries(medications.map((medication) => [medication.id, medication.name])),
    [medications],
  );

  const canCreate = cageOptions.length > 0 && medicationOptions.length > 0;

  const handleFiltersChange = (next: MedicationApplicationFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (record: MedicationApplication) => {
    resetUpdateError();
    setEditingRecord(record);
  };

  const openDelete = (record: MedicationApplication) => {
    resetDeleteError();
    setDeletingRecord(record);
  };

  const handleCreate = async (input: CreateMedicationApplicationInput) => {
    try {
      await createApplication(input);
      setFormOpen(false);
      setPage(1);
      notifySuccess("Aplicación registrada.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateMedicationApplicationInput) => {
    try {
      await updateApplication(input);
      setEditingRecord(null);
      notifySuccess("Aplicación actualizada.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;

    try {
      await deleteApplication(deletingRecord.id);
      if (records.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingRecord(null);
      notifySuccess("Aplicación eliminada.");
    } catch (deleteFailure) {
      setDeletingRecord(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Aplicación de medicamentos</h1>
          <p className="mt-1 text-sm text-secondary">Registra los tratamientos aplicados por jaula</p>
        </div>
        <button
          type="button"
          onClick={openForm}
          disabled={!canCreate}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
        >
          Nuevo registro
        </button>
      </header>

      {!canCreate && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
          Necesitas al menos una jaula y un medicamento antes de registrar aplicaciones.
        </p>
      )}

      <MedicationApplicationFilters
        value={filters}
        cageOptions={cageOptions}
        medicationOptions={medicationOptions}
        onChange={handleFiltersChange}
      />

      {isLoading && <MedicationApplicationsSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <MedicationApplicationsList
            records={records}
            cageNameById={cageNameById}
            medicationNameById={medicationNameById}
            onEdit={openEdit}
            onDelete={openDelete}
          />
          {total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <BottomSheet open={isFormOpen} onClose={() => setFormOpen(false)} title="Nuevo registro">
        <MedicationApplicationForm
          key={formKey}
          mode="create"
          cageOptions={cageOptions}
          medicationOptions={medicationOptions}
          cageBirdCountById={cageBirdCountById}
          isSubmitting={isCreating}
          error={createError}
          onSubmit={handleCreate}
        />
      </BottomSheet>

      <BottomSheet
        open={editingRecord !== null}
        onClose={() => setEditingRecord(null)}
        title="Editar registro"
      >
        {editingRecord && (
          <MedicationApplicationForm
            mode="edit"
            initialValues={editingRecord}
            cageOptions={cageOptions}
            medicationOptions={medicationOptions}
            cageBirdCountById={cageBirdCountById}
            isSubmitting={isUpdating}
            error={updateError}
            onSubmit={handleUpdate}
          />
        )}
      </BottomSheet>

      <ConfirmSheet
        open={deletingRecord !== null}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDelete}
        title="Eliminar registro"
        description={
          deletingRecord
            ? `${
                medicationNameById[deletingRecord.medicationId] ?? "Medicamento eliminado"
              } · ${deletingRecord.cageIds
                .map((cageId) => cageNameById[cageId] ?? "Jaula eliminada")
                .join(", ")} · ${formatDateLabel(
                deletingRecord.applicationDate,
              )}. Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
