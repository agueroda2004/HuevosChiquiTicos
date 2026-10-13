import { useMemo, useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { formatDateLabel } from "../../../shared/utils/date";
import { getErrorMessage } from "../../../shared/utils/error";
import { useCages } from "../../cages/hooks/useCages";
import {
  EggCollectionFilters,
  type EggCollectionFiltersValue,
} from "../components/EggCollectionFilters";
import { EggCollectionForm } from "../components/EggCollectionForm";
import { EggCollectionsList } from "../components/EggCollectionsList";
import { EggCollectionsSkeleton } from "../components/EggCollectionsSkeleton";
import type {
  CreateEggCollectionInput,
  EggCollection,
  EggCollectionsQuery,
  UpdateEggCollectionInput,
} from "../domain/egg-collection";
import { useEggCollections } from "../hooks/useEggCollections";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: EggCollectionFiltersValue = { cageId: "", from: "", to: "" };

export default function EggCollectionsPage() {
  const { cages } = useCages();
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<EggCollectionFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingRecord, setEditingRecord] = useState<EggCollection | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<EggCollection | null>(null);

  const query: EggCollectionsQuery = {
    cageId: filters.cageId || undefined,
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
    createRecord,
    isCreating,
    createError,
    resetCreateError,
    updateRecord,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteRecord,
    isDeleting,
    resetDeleteError,
  } = useEggCollections(query);

  const cageOptions = useMemo(
    () => cages.map((cage) => ({ value: cage.id, label: cage.name })),
    [cages],
  );

  const cageNameById = useMemo(
    () => Object.fromEntries(cages.map((cage) => [cage.id, cage.name])),
    [cages],
  );

  const handleFiltersChange = (next: EggCollectionFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (record: EggCollection) => {
    resetUpdateError();
    setEditingRecord(record);
  };

  const openDelete = (record: EggCollection) => {
    resetDeleteError();
    setDeletingRecord(record);
  };

  const handleCreate = async (input: CreateEggCollectionInput) => {
    try {
      await createRecord(input);
      setFormOpen(false);
      setPage(1);
      notifySuccess("Recolección registrada.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateEggCollectionInput) => {
    try {
      await updateRecord(input);
      setEditingRecord(null);
      notifySuccess("Recolección actualizada.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;

    try {
      await deleteRecord(deletingRecord.id);
      if (records.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingRecord(null);
      notifySuccess("Recolección eliminada.");
    } catch (deleteFailure) {
      setDeletingRecord(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Recolección de huevos</h1>
          <p className="mt-1 text-sm text-secondary">Registra la producción diaria por jaula</p>
        </div>
        <button
          type="button"
          onClick={openForm}
          disabled={cageOptions.length === 0}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
        >
          Nuevo registro
        </button>
      </header>

      {cageOptions.length === 0 && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
          Crea al menos una jaula antes de registrar recolecciones.
        </p>
      )}

      <EggCollectionFilters
        value={filters}
        cageOptions={cageOptions}
        onChange={handleFiltersChange}
      />

      {isLoading && <EggCollectionsSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <EggCollectionsList
            records={records}
            cageNameById={cageNameById}
            onEdit={openEdit}
            onDelete={openDelete}
          />
          {total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <BottomSheet open={isFormOpen} onClose={() => setFormOpen(false)} title="Nuevo registro">
        <EggCollectionForm
          key={formKey}
          mode="create"
          cageOptions={cageOptions}
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
          <EggCollectionForm
            mode="edit"
            initialValues={editingRecord}
            cageOptions={cageOptions}
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
            ? `${cageNameById[deletingRecord.cageId] ?? "Jaula eliminada"} · ${formatDateLabel(
                deletingRecord.collectionDate,
              )} · ${deletingRecord.quantity} ${
                deletingRecord.quantity === 1 ? "huevo" : "huevos"
              }. Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
