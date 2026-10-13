import { useMemo, useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { formatCurrency } from "../../../shared/utils/currency";
import { formatDateLabel, todayIso } from "../../../shared/utils/date";
import { getErrorMessage } from "../../../shared/utils/error";
import { useCustomerOptions } from "../../customers/hooks/useCustomerOptions";
import { useOrderOptions } from "../../orders/hooks/useOrderOptions";
import { useProductOptions } from "../../products/hooks/useProductOptions";
import { InvoiceDetailSheet } from "../components/InvoiceDetailSheet";
import { InvoiceFilters, type InvoiceFiltersValue } from "../components/InvoiceFilters";
import { InvoiceForm } from "../components/InvoiceForm";
import { InvoicesList } from "../components/InvoicesList";
import { InvoicesSkeleton } from "../components/InvoicesSkeleton";
import { PaymentForm } from "../components/PaymentForm";
import { getInvoiceStatusLabel } from "../constants";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoicesQuery,
  PaymentInput,
  UpdateInvoiceInput,
} from "../domain/invoice";
import { useInvoices } from "../hooks/useInvoices";
import { useInvoicedOrderIds } from "../hooks/useInvoicedOrderIds";
import { roundCurrency } from "../utils";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: InvoiceFiltersValue = {
  search: "",
  status: "",
  customerId: "",
  from: "",
  to: "",
};

export default function InvoicesPage() {
  const { customers } = useCustomerOptions();
  const { orders } = useOrderOptions();
  const { orderIds: invoicedOrderIds } = useInvoicedOrderIds();
  const { products } = useProductOptions();
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<InvoiceFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);

  const query: InvoicesQuery = {
    search: filters.search.trim() || undefined,
    status: filters.status || undefined,
    customerId: filters.customerId || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const {
    invoices,
    total,
    isLoading,
    error,
    createInvoice,
    isCreating,
    createError,
    resetCreateError,
    updateInvoice,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteInvoice,
    isDeleting,
    resetDeleteError,
    addPayment,
    isAddingPayment,
    addPaymentError,
    resetAddPaymentError,
    removePayment,
    isRemovingPayment,
    resetRemovePaymentError,
  } = useInvoices(query);

  const customerOptions = useMemo(
    () => customers.map((customer) => ({ value: customer.id, label: customer.name })),
    [customers],
  );

  const customerNameById = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );

  const availableOrders = orders.filter(
    (order) => !invoicedOrderIds.has(order.id) || order.id === editingInvoice?.orderId,
  );

  const orderOptions = availableOrders.map((order) => ({
    value: order.id,
    label: `${customerNameById[order.customerId] ?? "Cliente eliminado"} · ${formatDateLabel(
      order.deliveryDate,
    )} · ${formatCurrency(order.total)}`,
  }));

  const hasFilters =
    filters.search !== "" ||
    filters.status !== "" ||
    filters.customerId !== "" ||
    filters.from !== "" ||
    filters.to !== "";

  const canCreate = customerOptions.length > 0 && products.length > 0;

  const handleFiltersChange = (next: InvoiceFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (invoice: Invoice) => {
    if (invoice.status === "paid") return;
    resetUpdateError();
    setEditingInvoice(invoice);
  };

  const openDelete = (invoice: Invoice) => {
    resetDeleteError();
    setDeletingInvoice(invoice);
  };

  const handleCreate = async (input: CreateInvoiceInput, paid: boolean) => {
    try {
      const invoice = await createInvoice(input);

      if (paid && invoice.total > 0) {
        await addPayment({
          invoiceId: invoice.id,
          input: {
            date: todayIso(),
            amount: invoice.total,
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

  const handleUpdate = async (input: UpdateInvoiceInput, paid: boolean) => {
    const wasPaid = editingInvoice?.status === "paid";

    try {
      let updated = await updateInvoice(input);

      if (
        paid &&
        !wasPaid &&
        updated.total > 0 &&
        updated.totalPaid < updated.total
      ) {
        updated = await addPayment({
          invoiceId: updated.id,
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
          updated = await removePayment({ invoiceId: updated.id, paymentId: payment.id });
        }
      }

      setEditingInvoice(null);
      if (viewingInvoice?.id === updated.id) setViewingInvoice(updated);
      notifySuccess("Factura actualizada.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingInvoice) return;

    try {
      await deleteInvoice(deletingInvoice.id);
      if (invoices.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingInvoice(null);
      notifySuccess("Factura eliminada.");
    } catch (deleteFailure) {
      setDeletingInvoice(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  const handleAddPayment = async (input: PaymentInput) => {
    if (!payingInvoice) return;

    try {
      const updated = await addPayment({ invoiceId: payingInvoice.id, input });
      setPayingInvoice(null);
      if (viewingInvoice?.id === updated.id) setViewingInvoice(updated);
      notifySuccess("Pago registrado.");
    } catch (addFailure) {
      notifyError(getErrorMessage(addFailure));
    }
  };

  const handleRemovePayment = async (paymentId: string) => {
    if (!viewingInvoice) return;

    try {
      const updated = await removePayment({ invoiceId: viewingInvoice.id, paymentId });
      setViewingInvoice(updated);
      notifySuccess("Pago eliminado.");
    } catch (removeFailure) {
      notifyError(getErrorMessage(removeFailure));
    }
  };

  const openDetail = (invoice: Invoice) => {
    resetRemovePaymentError();
    setViewingInvoice(invoice);
  };

  const openPayment = (invoice: Invoice) => {
    resetAddPaymentError();
    setPayingInvoice(invoice);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Facturas por cobrar</h1>
          <p className="mt-1 text-sm text-secondary">
            Administra las facturas y los pagos recibidos
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

      {customerOptions.length === 0 && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
          Crea al menos un cliente antes de registrar facturas.
        </p>
      )}

      {customerOptions.length > 0 && products.length === 0 && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
          Crea al menos un producto antes de registrar facturas.
        </p>
      )}

      <InvoiceFilters
        value={filters}
        customerOptions={customerOptions}
        onChange={handleFiltersChange}
      />

      {isLoading && <InvoicesSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <InvoicesList
            invoices={invoices}
            customerNameById={customerNameById}
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
        <InvoiceForm
          key={formKey}
          mode="create"
          customerOptions={customerOptions}
          orderOptions={orderOptions}
          orders={availableOrders}
          products={products}
          isSubmitting={isCreating}
          error={createError}
          onSubmit={handleCreate}
        />
      </BottomSheet>

      <BottomSheet
        open={editingInvoice !== null}
        onClose={() => setEditingInvoice(null)}
        title="Editar factura"
      >
        {editingInvoice && (
          <InvoiceForm
            mode="edit"
            number={editingInvoice.number}
            initialValues={{
              id: editingInvoice.id,
              customerId: editingInvoice.customerId,
              orderId: editingInvoice.orderId,
              issueDate: editingInvoice.issueDate,
              dueDate: editingInvoice.dueDate,
              items: editingInvoice.items,
              paid: editingInvoice.status === "paid",
            }}
            customerOptions={customerOptions}
            orderOptions={orderOptions}
            orders={availableOrders}
            products={products}
            itemsLocked={editingInvoice.status === "partial"}
            isSubmitting={isUpdating}
            error={updateError}
            onSubmit={handleUpdate}
          />
        )}
      </BottomSheet>

      <InvoiceDetailSheet
        open={viewingInvoice !== null}
        onClose={() => setViewingInvoice(null)}
        invoice={viewingInvoice}
        customerName={
          viewingInvoice
            ? customerNameById[viewingInvoice.customerId] ?? "Cliente eliminado"
            : ""
        }
        products={products}
        orders={orders}
        isRemovingPayment={isRemovingPayment}
        onRemovePayment={handleRemovePayment}
      />

      <BottomSheet
        open={payingInvoice !== null}
        onClose={() => setPayingInvoice(null)}
        title="Registrar pago"
      >
        <PaymentForm
          isSubmitting={isAddingPayment}
          error={addPaymentError}
          maxAmount={
            payingInvoice
              ? roundCurrency(payingInvoice.total - payingInvoice.totalPaid)
              : undefined
          }
          onSubmit={handleAddPayment}
        />
      </BottomSheet>

      <ConfirmSheet
        open={deletingInvoice !== null}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={handleDelete}
        title="Eliminar factura"
        description={
          deletingInvoice
            ? `¿Seguro que deseas eliminar la factura ${deletingInvoice.number} de "${
                customerNameById[deletingInvoice.customerId] ?? "Cliente eliminado"
              }" (${getInvoiceStatusLabel(deletingInvoice.status)} · vence ${formatDateLabel(
                deletingInvoice.dueDate,
              )} · ${formatCurrency(deletingInvoice.total)})? Se eliminarán también sus pagos. Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
