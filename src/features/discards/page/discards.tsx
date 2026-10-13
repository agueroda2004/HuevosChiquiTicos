import { useMemo, useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { formatDateLabel } from "../../../shared/utils/date";
import { getErrorMessage } from "../../../shared/utils/error";
import { useCages } from "../../cages/hooks/useCages";
import {
  DiscardFilters,
  type DiscardFiltersValue,
} from "../components/DiscardFilters";
import { DiscardForm } from "../components/DiscardForm";
import { DiscardsList } from "../components/DiscardsList";
import { DiscardsSkeleton } from "../components/DiscardsSkeleton";
import type {
  CreateDiscardInput,
  Discard,
  DiscardsQuery,
  UpdateDiscardInput,
} from "../domain/discard";
import { useDiscards } from "../hooks/useDiscards";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: DiscardFiltersValue = { cageId: "", from: "", to: "" };

export default function DiscardsPage() {
  const { cages } = useCages();
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<DiscardFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingRecord, setEditingRecord] = useState<Discard | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<Discard | null>(null);

  const query: DiscardsQuery = {
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
    createDiscard,
    isCreating,
    createError,
    resetCreateError,
    updateDiscard,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteDiscard,
    isDeleting,
    resetDeleteError,
  } = useDiscards(query);

  const cageOptions = useMemo(
    () => cages.map((cage) => ({ value: cage.id, label: cage.name })),
    [cages],
  );

  const cageNameById = useMemo(
    () => Object.fromEntries(cages.map((cage) => [cage.id, cage.name])),
    [cages],
  );

  const handleFiltersChange = (next: DiscardFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (record: Discard) => {
    resetUpdateError();
    setEditingRecord(record);
  };

  const openDelete = (record: Discard) => {
    resetDeleteError();
    setDeletingRecord(record);
  };

  const handleCreate = async (input: CreateDiscardInput) => {
    try {
      await createDiscard(input);
      setFormOpen(false);
      setPage(1);
      notifySuccess("Desecho registrado.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateDiscardInput) => {
    try {
      await updateDiscard(input);
      setEditingRecord(null);
      notifySuccess("Desecho actualizado.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;

    try {
      await deleteDiscard(deletingRecord.id);
      if (records.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingRecord(null);
      notifySuccess("Desecho eliminado.");
    } catch (deleteFailure) {
      setDeletingRecord(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Desechos</h1>
          <p className="mt-1 text-sm text-secondary">Registra las bajas por desecho</p>
        </div>
        <button
          type="button"
          onClick={openForm}
          disabled={cageOptions.length === 0}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
        >
          Nuevo desecho
        </button>
      </header>

      {cageOptions.length === 0 && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
          Crea al menos una jaula antes de registrar desechos.
        </p>
      )}

      <DiscardFilters value={filters} cageOptions={cageOptions} onChange={handleFiltersChange} />

      {isLoading && <DiscardsSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <DiscardsList
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

      <BottomSheet open={isFormOpen} onClose={() => setFormOpen(false)} title="Nuevo desecho">
        <DiscardForm
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
        title="Editar desecho"
      >
        {editingRecord && (
          <DiscardForm
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
        title="Eliminar desecho"
        description={
          deletingRecord
            ? `${cageNameById[deletingRecord.cageId] ?? "Jaula eliminada"} · ${formatDateLabel(
                deletingRecord.discardDate,
              )} · ${deletingRecord.quantity} ${
                deletingRecord.quantity === 1 ? "ave" : "aves"
              }. Se devolverán las aves a la jaula.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
