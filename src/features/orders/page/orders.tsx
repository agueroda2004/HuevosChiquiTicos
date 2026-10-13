import { useMemo, useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { formatCurrency } from "../../../shared/utils/currency";
import { formatDateLabel } from "../../../shared/utils/date";
import { getErrorMessage } from "../../../shared/utils/error";
import { useCustomerOptions } from "../../customers/hooks/useCustomerOptions";
import { useProductOptions } from "../../products/hooks/useProductOptions";
import { OrderFilters, type OrderFiltersValue } from "../components/OrderFilters";
import { OrderDetailSheet } from "../components/OrderDetailSheet";
import { OrderForm } from "../components/OrderForm";
import { OrdersList } from "../components/OrdersList";
import { OrdersSkeleton } from "../components/OrdersSkeleton";
import { getOrderStatusLabel } from "../constants";
import type {
  CreateOrderInput,
  Order,
  OrdersQuery,
  OrderStatus,
  UpdateOrderInput,
} from "../domain/order";
import { useOrders } from "../hooks/useOrders";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: OrderFiltersValue = { customerId: "", status: "", from: "", to: "" };

export default function OrdersPage() {
  const { customers } = useCustomerOptions();
  const { products } = useProductOptions();
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<OrderFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null);

  const query: OrdersQuery = {
    customerId: filters.customerId || undefined,
    status: filters.status || undefined,
    from: filters.from || undefined,
    to: filters.to || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const {
    orders,
    total,
    isLoading,
    error,
    createOrder,
    isCreating,
    createError,
    resetCreateError,
    updateOrder,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteOrder,
    isDeleting,
    resetDeleteError,
  } = useOrders(query);

  const customerOptions = useMemo(
    () => customers.map((customer) => ({ value: customer.id, label: customer.name })),
    [customers],
  );

  const customerNameById = useMemo(
    () => Object.fromEntries(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );

  const hasFilters =
    filters.customerId !== "" || filters.status !== "" || filters.from !== "" || filters.to !== "";

  const handleFiltersChange = (next: OrderFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (order: Order) => {
    resetUpdateError();
    setEditingOrder(order);
  };

  const openDelete = (order: Order) => {
    resetDeleteError();
    setDeletingOrder(order);
  };

  const handleCreate = async (input: CreateOrderInput) => {
    try {
      await createOrder(input);
      setFormOpen(false);
      setPage(1);
      notifySuccess("Pedido creado.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateOrderInput) => {
    try {
      await updateOrder(input);
      setEditingOrder(null);
      notifySuccess("Pedido actualizado.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleStatusChange = async (order: Order, status: OrderStatus) => {
    try {
      await updateOrder({
        id: order.id,
        customerId: order.customerId,
        deliveryDate: order.deliveryDate,
        status,
        items: order.items,
      });
      notifySuccess("Estado actualizado.");
    } catch (statusFailure) {
      notifyError(getErrorMessage(statusFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;

    try {
      await deleteOrder(deletingOrder.id);
      if (orders.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingOrder(null);
      notifySuccess("Pedido eliminado.");
    } catch (deleteFailure) {
      setDeletingOrder(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Pedidos</h1>
          <p className="mt-1 text-sm text-secondary">
            Administra los pedidos y sus fechas de entrega
          </p>
        </div>
        <button
          type="button"
          onClick={openForm}
          disabled={customerOptions.length === 0 || products.length === 0}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third disabled:cursor-not-allowed disabled:opacity-60"
        >
          Nuevo pedido
        </button>
      </header>

      {customerOptions.length === 0 && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
          Crea al menos un cliente antes de registrar pedidos.
        </p>
      )}

      {customerOptions.length > 0 && products.length === 0 && (
        <p className="mb-4 rounded-lg bg-secondary/10 px-3 py-2 text-xs text-secondary">
          Crea al menos un producto antes de registrar pedidos.
        </p>
      )}

      <OrderFilters
        value={filters}
        customerOptions={customerOptions}
        onChange={handleFiltersChange}
      />

      {isLoading && <OrdersSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <OrdersList
            orders={orders}
            customerNameById={customerNameById}
            hasFilters={hasFilters}
            isUpdating={isUpdating}
            onStatusChange={handleStatusChange}
            onView={setViewingOrder}
            onEdit={openEdit}
            onDelete={openDelete}
          />
          {total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <BottomSheet open={isFormOpen} onClose={() => setFormOpen(false)} title="Nuevo pedido">
        <OrderForm
          key={formKey}
          mode="create"
          customerOptions={customerOptions}
          products={products}
          isSubmitting={isCreating}
          error={createError}
          onSubmit={handleCreate}
        />
      </BottomSheet>

      <BottomSheet
        open={editingOrder !== null}
        onClose={() => setEditingOrder(null)}
        title="Editar pedido"
      >
        {editingOrder && (
          <OrderForm
            mode="edit"
            initialValues={editingOrder}
            customerOptions={customerOptions}
            products={products}
            isSubmitting={isUpdating}
            error={updateError}
            onSubmit={handleUpdate}
          />
        )}
      </BottomSheet>

      <OrderDetailSheet
        open={viewingOrder !== null}
        onClose={() => setViewingOrder(null)}
        order={viewingOrder}
        customerName={
          viewingOrder
            ? customerNameById[viewingOrder.customerId] ?? "Cliente eliminado"
            : ""
        }
        products={products}
      />

      <ConfirmSheet
        open={deletingOrder !== null}
        onClose={() => setDeletingOrder(null)}
        onConfirm={handleDelete}
        title="Eliminar pedido"
        description={
          deletingOrder
            ? `¿Seguro que deseas eliminar el pedido de "${
                customerNameById[deletingOrder.customerId] ?? "Cliente eliminado"
              }" (entrega ${formatDateLabel(deletingOrder.deliveryDate)} · ${getOrderStatusLabel(
                deletingOrder.status,
              )} · ${deletingOrder.items.length} ${
                deletingOrder.items.length === 1 ? "producto" : "productos"
              } · ${formatCurrency(deletingOrder.total)})? Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
