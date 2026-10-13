import { useMemo, useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { formatDateLabel } from "../../../shared/utils/date";
import { getErrorMessage } from "../../../shared/utils/error";
import { useCages } from "../../cages/hooks/useCages";
import { DeathFilters, type DeathFiltersValue } from "../components/DeathFilters";
import { DeathForm } from "../components/DeathForm";
import { DeathsList } from "../components/DeathsList";
import { DeathsSkeleton } from "../components/DeathsSkeleton";
import { getDeathTypeLabel } from "../constants";
import type { CreateDeathInput, Death, DeathsQuery, UpdateDeathInput } from "../domain/death";
import { useDeaths } from "../hooks/useDeaths";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: DeathFiltersValue = { cageId: "", from: "", to: "", type: "" };

export default function DeathsPage() {
  const { cages } = useCages();
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<DeathFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingRecord, setEditingRecord] = useState<Death | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<Death | null>(null);

  const query: DeathsQuery = {
    cageId: filters.cageId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    type: filters.type || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const {
    records,
    total,
    isLoading,
    error,
    createDeath,
    isCreating,
    createError,
    resetCreateError,
    updateDeath,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteDeath,
    isDeleting,
    resetDeleteError,
  } = useDeaths(query);

  const cageOptions = useMemo(
    () => cages.map((cage) => ({ value: cage.id, label: cage.name })),
    [cages],
  );

  const cageNameById = useMemo(
    () => Object.fromEntries(cages.map((cage) => [cage.id, cage.name])),
    [cages],
  );

  const handleFiltersChange = (next: DeathFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (record: Death) => {
    resetUpdateError();
    setEditingRecord(record);
  };

  const openDelete = (record: Death) => {
    resetDeleteError();
    setDeletingRecord(record);
  };

  const handleCreate = async (input: CreateDeathInput) => {
    try {
      await createDeath(input);
      setFormOpen(false);
      setPage(1);
      notifySuccess("Muerte registrada.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateDeathInput) => {
    try {
      await updateDeath(input);
      setEditingRecord(null);
      notifySuccess("Muerte actualizada.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;

    try {
      await deleteDeath(deletingRecord.id);
      if (records.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingRecord(null);
      notifySuccess("Muerte eliminada.");
    } catch (deleteFailure) {
      setDeletingRecord(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Muertes</h1>
          <p className="mt-1 text-sm text-secondary">Registra las bajas de aves por jaula</p>
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
          Crea al menos una jaula antes de registrar muertes.
        </p>
      )}

      <DeathFilters value={filters} cageOptions={cageOptions} onChange={handleFiltersChange} />

      {isLoading && <DeathsSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <DeathsList
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
        <DeathForm
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
          <DeathForm
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
                deletingRecord.deathDate,
              )} · ${getDeathTypeLabel(deletingRecord.type)} · ${deletingRecord.quantity} ${
                deletingRecord.quantity === 1 ? "ave" : "aves"
              }. Se devolverán las aves a la jaula.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
