import { useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { getErrorMessage } from "../../../shared/utils/error";
import { SupplierFilters, type SupplierFiltersValue } from "../components/SupplierFilters";
import { SupplierForm } from "../components/SupplierForm";
import { SuppliersList } from "../components/SuppliersList";
import { SuppliersSkeleton } from "../components/SuppliersSkeleton";
import type {
  CreateSupplierInput,
  Supplier,
  SuppliersQuery,
  UpdateSupplierInput,
} from "../domain/supplier";
import { useSuppliers } from "../hooks/useSuppliers";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: SupplierFiltersValue = { search: "", status: "" };

export default function SuppliersPage() {
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<SupplierFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const query: SuppliersQuery = {
    search: filters.search.trim() || undefined,
    status: filters.status || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const {
    suppliers,
    total,
    isLoading,
    error,
    createSupplier,
    isCreating,
    createError,
    resetCreateError,
    updateSupplier,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteSupplier,
    isDeleting,
    resetDeleteError,
  } = useSuppliers(query);

  const hasFilters = filters.search !== "" || filters.status !== "";

  const handleFiltersChange = (next: SupplierFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (supplier: Supplier) => {
    resetUpdateError();
    setEditingSupplier(supplier);
  };

  const openDelete = (supplier: Supplier) => {
    resetDeleteError();
    setDeletingSupplier(supplier);
  };

  const handleCreate = async (input: CreateSupplierInput) => {
    try {
      await createSupplier(input);
      setFormOpen(false);
      setPage(1);
      notifySuccess("Proveedor creado.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateSupplierInput) => {
    try {
      await updateSupplier(input);
      setEditingSupplier(null);
      notifySuccess("Proveedor actualizado.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;

    try {
      await deleteSupplier(deletingSupplier.id);
      if (suppliers.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingSupplier(null);
      notifySuccess("Proveedor eliminado.");
    } catch (deleteFailure) {
      setDeletingSupplier(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Proveedores</h1>
          <p className="mt-1 text-sm text-secondary">Administra los proveedores del criadero</p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third"
        >
          Nuevo proveedor
        </button>
      </header>

      <SupplierFilters value={filters} onChange={handleFiltersChange} />

      {isLoading && <SuppliersSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <SuppliersList
            suppliers={suppliers}
            hasFilters={hasFilters}
            onEdit={openEdit}
            onDelete={openDelete}
          />
          {total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <BottomSheet open={isFormOpen} onClose={() => setFormOpen(false)} title="Nuevo proveedor">
        <SupplierForm
          key={formKey}
          mode="create"
          isSubmitting={isCreating}
          error={createError}
          onSubmit={handleCreate}
        />
      </BottomSheet>

      <BottomSheet
        open={editingSupplier !== null}
        onClose={() => setEditingSupplier(null)}
        title="Editar proveedor"
      >
        {editingSupplier && (
          <SupplierForm
            mode="edit"
            initialValues={editingSupplier}
            isSubmitting={isUpdating}
            error={updateError}
            onSubmit={handleUpdate}
          />
        )}
      </BottomSheet>

      <ConfirmSheet
        open={deletingSupplier !== null}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={handleDelete}
        title="Eliminar proveedor"
        description={
          deletingSupplier
            ? `¿Seguro que deseas eliminar "${deletingSupplier.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
