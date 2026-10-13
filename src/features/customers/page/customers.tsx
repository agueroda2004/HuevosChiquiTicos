import { useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { getErrorMessage } from "../../../shared/utils/error";
import { CustomerFilters, type CustomerFiltersValue } from "../components/CustomerFilters";
import { CustomerForm } from "../components/CustomerForm";
import { CustomersList } from "../components/CustomersList";
import { CustomersSkeleton } from "../components/CustomersSkeleton";
import type { CreateCustomerInput, Customer, CustomersQuery, UpdateCustomerInput } from "../domain/customer";
import { useCustomers } from "../hooks/useCustomers";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: CustomerFiltersValue = { search: "", status: "" };

export default function CustomersPage() {
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<CustomerFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  const query: CustomersQuery = {
    search: filters.search.trim() || undefined,
    status: filters.status || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const {
    customers,
    total,
    isLoading,
    error,
    createCustomer,
    isCreating,
    createError,
    resetCreateError,
    updateCustomer,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteCustomer,
    isDeleting,
    resetDeleteError,
  } = useCustomers(query);

  const hasFilters = filters.search !== "" || filters.status !== "";

  const handleFiltersChange = (next: CustomerFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    resetUpdateError();
    setEditingCustomer(customer);
  };

  const openDelete = (customer: Customer) => {
    resetDeleteError();
    setDeletingCustomer(customer);
  };

  const handleCreate = async (input: CreateCustomerInput) => {
    try {
      await createCustomer(input);
      setFormOpen(false);
      setPage(1);
      notifySuccess("Cliente creado.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateCustomerInput) => {
    try {
      await updateCustomer(input);
      setEditingCustomer(null);
      notifySuccess("Cliente actualizado.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;

    try {
      await deleteCustomer(deletingCustomer.id);
      if (customers.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingCustomer(null);
      notifySuccess("Cliente eliminado.");
    } catch (deleteFailure) {
      setDeletingCustomer(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Clientes</h1>
          <p className="mt-1 text-sm text-secondary">Administra los clientes del criadero</p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third"
        >
          Nuevo cliente
        </button>
      </header>

      <CustomerFilters value={filters} onChange={handleFiltersChange} />

      {isLoading && <CustomersSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <CustomersList
            customers={customers}
            hasFilters={hasFilters}
            onEdit={openEdit}
            onDelete={openDelete}
          />
          {total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <BottomSheet open={isFormOpen} onClose={() => setFormOpen(false)} title="Nuevo cliente">
        <CustomerForm
          key={formKey}
          mode="create"
          isSubmitting={isCreating}
          error={createError}
          onSubmit={handleCreate}
        />
      </BottomSheet>

      <BottomSheet
        open={editingCustomer !== null}
        onClose={() => setEditingCustomer(null)}
        title="Editar cliente"
      >
        {editingCustomer && (
          <CustomerForm
            mode="edit"
            initialValues={editingCustomer}
            isSubmitting={isUpdating}
            error={updateError}
            onSubmit={handleUpdate}
          />
        )}
      </BottomSheet>

      <ConfirmSheet
        open={deletingCustomer !== null}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleDelete}
        title="Eliminar cliente"
        description={
          deletingCustomer
            ? `¿Seguro que deseas eliminar "${deletingCustomer.name}"? Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
