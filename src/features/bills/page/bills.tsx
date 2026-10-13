import { useMemo, useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { formatCurrency } from "../../../shared/utils/currency";
import { formatDateLabel, todayIso } from "../../../shared/utils/date";
import { getErrorMessage } from "../../../shared/utils/error";
import { useSupplierOptions } from "../../suppliers/hooks/useSupplierOptions";
import { BillDetailSheet } from "../components/BillDetailSheet";
import { BillFilters, type BillFiltersValue } from "../components/BillFilters";
import { BillForm } from "../components/BillForm";
import { BillsList } from "../components/BillsList";
import { BillsSkeleton } from "../components/BillsSkeleton";
import { PaymentForm } from "../components/PaymentForm";
import { getBillStatusLabel } from "../constants";
import type {
  Bill,
  BillsQuery,
  CreateBillInput,
  PaymentInput,
  UpdateBillInput,
} from "../domain/bill";
import { useBills } from "../hooks/useBills";
import { roundCurrency } from "../utils";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: BillFiltersValue = {
  search: "",
  status: "",
  supplierId: "",
  from: "",
  to: "",
};

export default function BillsPage() {
  const { suppliers } = useSupplierOptions();
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<BillFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deletingBill, setDeletingBill] = useState<Bill | null>(null);

  const query: BillsQuery = {
    search: filters.search.trim() || undefined,
    status: filters.status || undefined,
    supplierId: filters.supplierId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const {
    bills,
    total,
    isLoading,
    error,
    createBill,
    isCreating,
    createError,
    resetCreateError,
    updateBill,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteBill,
    isDeleting,
    resetDeleteError,
    addPayment,
    isAddingPayment,
    addPaymentError,
    resetAddPaymentError,
    removePayment,
    isRemovingPayment,
    resetRemovePaymentError,
  } = useBills(query);

  const supplierOptions = useMemo(
    () => suppliers.map((supplier) => ({ value: supplier.id, label: supplier.name })),
    [suppliers],
  );

  const supplierNameById = useMemo(
    () => Object.fromEntries(suppliers.map((supplier) => [supplier.id, supplier.name])),
    [suppliers],
  );

  const hasFilters =
    filters.search !== "" ||
    filters.status !== "" ||
    filters.supplierId !== "" ||
    filters.from !== "" ||
    filters.to !== "";

  const canCreate = supplierOptions.length > 0;

  const handleFiltersChange = (next: BillFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (bill: Bill) => {
    if (bill.status === "paid") return;
    resetUpdateError();
    setEditingBill(bill);
  };

  const openDelete = (bill: Bill) => {
    resetDeleteError();
    setDeletingBill(bill);
  };

  const openDetail = (bill: Bill) => {
    resetRemovePaymentError();
    setViewingBill(bill);
  };

  const openPayment = (bill: Bill) => {
    resetAddPaymentError();
    setPayingBill(bill);
  };

  const handleCreate = async (input: CreateBillInput, paid: boolean) => {
    try {
      const bill = await createBill(input);

      if (paid && bill.total > 0) {
        await addPayment({
          billId: bill.id,
          input: {
            date: todayIso(),
            amount: bill.total,
            method: "cash",
            reference: null,
            notes: null,
          },
        });
      }

      setFormOpen(false);
      setPage(1);
      notifySuccess(paid ? "Factura creada y marcada como pagada." : "Factura creada.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateBillInput, paid: boolean) => {
    const wasPaid = editingBill?.status === "paid";

    try {
      let updated = await updateBill(input);

      if (paid && !wasPaid && updated.total > 0 && updated.totalPaid < updated.total) {
        updated = await addPayment({
          billId: updated.id,
          input: {
            date: todayIso(),
            amount: roundCurrency(updated.total - updated.totalPaid),
            method: "cash",
            reference: null,
            notes: null,
          },
        });
      } else if (!paid && wasPaid) {
        for (const payment of [...updated.payments]) {
          updated = await removePayment({ billId: updated.id, paymentId: payment.id });
        }
      }

      setEditingBill(null);
      if (viewingBill?.id === updated.id) setViewingBill(updated);
      notifySuccess("Factura actualizada.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingBill) return;

    try {
      await deleteBill(deletingBill.id);
      if (bills.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingBill(null);
      notifySuccess("Factura eliminada.");
    } catch (deleteFailure) {
      setDeletingBill(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  const handleAddPayment = async (input: PaymentInput) => {
    if (!payingBill) return;

    try {
      const updated = await addPayment({ billId: payingBill.id, input });
      setPayingBill(null);
      if (viewingBill?.id === updated.id) setViewingBill(updated);
      notifySuccess("Pago registrado.");
    } catch (addFailure) {
      notifyError(getErrorMessage(addFailure));
    }
  };

  const handleRemovePayment = async (paymentId: string) => {
    if (!viewingBill) return;

    try {
      const updated = await removePayment({ billId: viewingBill.id, paymentId });
      setViewingBill(updated);
      notifySuccess("Pago eliminado.");
    } catch (removeFailure) {
      notifyError(getErrorMessage(removeFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Facturas por pagar</h1>
          <p className="mt-1 text-sm text-secondary">
            Administra las facturas de proveedores y los pagos emitidos
          </p>
        </div>
        <button
          type="button"
          onClick={openForm}
          disabled={!canCreate}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
        >
          Nueva factura
        </button>
      </header>

      {supplierOptions.length === 0 && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
          Crea al menos un proveedor activo antes de registrar facturas.
        </p>
      )}

      <BillFilters
        value={filters}
        supplierOptions={supplierOptions}
        onChange={handleFiltersChange}
      />

      {isLoading && <BillsSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <BillsList
            bills={bills}
            supplierNameById={supplierNameById}
            hasFilters={hasFilters}
            onAddPayment={openPayment}
            onView={openDetail}
            onEdit={openEdit}
            onDelete={openDelete}
          />
          {total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <BottomSheet open={isFormOpen} onClose={() => setFormOpen(false)} title="Nueva factura">
        <BillForm
          key={formKey}
          mode="create"
          supplierOptions={supplierOptions}
          isSubmitting={isCreating}
          error={createError}
          onSubmit={handleCreate}
        />
      </BottomSheet>

      <BottomSheet
        open={editingBill !== null}
        onClose={() => setEditingBill(null)}
        title="Editar factura"
      >
        {editingBill && (
          <BillForm
            mode="edit"
            number={editingBill.number}
            initialValues={{
              id: editingBill.id,
              supplierId: editingBill.supplierId,
              supplierNumber: editingBill.supplierNumber,
              issueDate: editingBill.issueDate,
              dueDate: editingBill.dueDate,
              items: editingBill.items,
              paid: editingBill.status === "paid",
            }}
            supplierOptions={supplierOptions}
            itemsLocked={editingBill.status === "partial"}
            isSubmitting={isUpdating}
            error={updateError}
            onSubmit={handleUpdate}
          />
        )}
      </BottomSheet>

      <BillDetailSheet
        open={viewingBill !== null}
        onClose={() => setViewingBill(null)}
        bill={viewingBill}
        supplierName={
          viewingBill ? supplierNameById[viewingBill.supplierId] ?? "Proveedor eliminado" : ""
        }
        isRemovingPayment={isRemovingPayment}
        onRemovePayment={handleRemovePayment}
      />

      <BottomSheet
        open={payingBill !== null}
        onClose={() => setPayingBill(null)}
        title="Registrar pago"
      >
        <PaymentForm
          isSubmitting={isAddingPayment}
          error={addPaymentError}
          maxAmount={
            payingBill ? roundCurrency(payingBill.total - payingBill.totalPaid) : undefined
          }
          onSubmit={handleAddPayment}
        />
      </BottomSheet>

      <ConfirmSheet
        open={deletingBill !== null}
        onClose={() => setDeletingBill(null)}
        onConfirm={handleDelete}
        title="Eliminar factura"
        description={
          deletingBill
            ? `¿Seguro que deseas eliminar la factura ${deletingBill.number} de "${
                supplierNameById[deletingBill.supplierId] ?? "Proveedor eliminado"
              }" (${getBillStatusLabel(deletingBill.status)} · vence ${formatDateLabel(
                deletingBill.dueDate,
              )} · ${formatCurrency(deletingBill.total)})? Se eliminarán también sus pagos. Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
