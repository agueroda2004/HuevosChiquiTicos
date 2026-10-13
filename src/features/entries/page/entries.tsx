import { useMemo, useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { formatDateLabel } from "../../../shared/utils/date";
import { getErrorMessage } from "../../../shared/utils/error";
import { useCages } from "../../cages/hooks/useCages";
import { EntriesList } from "../components/EntriesList";
import { EntriesSkeleton } from "../components/EntriesSkeleton";
import { EntryFilters, type EntryFiltersValue } from "../components/EntryFilters";
import { EntryForm } from "../components/EntryForm";
import type { CreateEntryInput, EntriesQuery, Entry, UpdateEntryInput } from "../domain/entry";
import { useEntries } from "../hooks/useEntries";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: EntryFiltersValue = { cageId: "", from: "", to: "" };

export default function EntriesPage() {
  const { cages } = useCages();
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<EntryFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingRecord, setEditingRecord] = useState<Entry | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<Entry | null>(null);

  const query: EntriesQuery = {
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
    createEntry,
    isCreating,
    createError,
    resetCreateError,
    updateEntry,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteEntry,
    isDeleting,
    resetDeleteError,
  } = useEntries(query);

  const cageOptions = useMemo(
    () => cages.map((cage) => ({ value: cage.id, label: cage.name })),
    [cages],
  );

  const cageNameById = useMemo(
    () => Object.fromEntries(cages.map((cage) => [cage.id, cage.name])),
    [cages],
  );

  const handleFiltersChange = (next: EntryFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (record: Entry) => {
    resetUpdateError();
    setEditingRecord(record);
  };

  const openDelete = (record: Entry) => {
    resetDeleteError();
    setDeletingRecord(record);
  };

  const handleCreate = async (input: CreateEntryInput) => {
    try {
      await createEntry(input);
      setFormOpen(false);
      setPage(1);
      notifySuccess("Entrada registrada.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateEntryInput) => {
    try {
      await updateEntry(input);
      setEditingRecord(null);
      notifySuccess("Entrada actualizada.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;

    try {
      await deleteEntry(deletingRecord.id);
      if (records.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingRecord(null);
      notifySuccess("Entrada eliminada.");
    } catch (deleteFailure) {
      setDeletingRecord(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Entradas</h1>
          <p className="mt-1 text-sm text-secondary">Registra el ingreso de aves por jaula</p>
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
          Crea al menos una jaula antes de registrar entradas.
        </p>
      )}

      <EntryFilters value={filters} cageOptions={cageOptions} onChange={handleFiltersChange} />

      {isLoading && <EntriesSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <EntriesList
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
        <EntryForm
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
          <EntryForm
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
                deletingRecord.entryDate,
              )} · ${deletingRecord.quantity} ${
                deletingRecord.quantity === 1 ? "ave" : "aves"
              }. Se descontarán las aves de la jaula.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
