import { useState } from "react";

import { BottomSheet } from "../../../shared/components/BottomSheet";
import { ConfirmSheet } from "../../../shared/components/ConfirmSheet";
import { Pagination } from "../../../shared/components/Pagination";
import { useNotifications } from "../../../shared/hooks/useNotifications";
import { formatCurrency } from "../../../shared/utils/currency";
import { getErrorMessage } from "../../../shared/utils/error";
import { ProductFilters, type ProductFiltersValue } from "../components/ProductFilters";
import { ProductForm } from "../components/ProductForm";
import { ProductsGrid } from "../components/ProductsGrid";
import { ProductsSkeleton } from "../components/ProductsSkeleton";
import type {
  CreateProductInput,
  Product,
  ProductsQuery,
  UpdateProductInput,
} from "../domain/product";
import { useProducts } from "../hooks/useProducts";

const PAGE_SIZE = 10;
const EMPTY_FILTERS: ProductFiltersValue = { search: "", status: "" };

export default function ProductsPage() {
  const { notifySuccess, notifyError } = useNotifications();
  const [filters, setFilters] = useState<ProductFiltersValue>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [isFormOpen, setFormOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const query: ProductsQuery = {
    search: filters.search.trim() || undefined,
    status: filters.status || undefined,
    page,
    pageSize: PAGE_SIZE,
  };

  const {
    products,
    total,
    isLoading,
    error,
    createProduct,
    isCreating,
    createError,
    resetCreateError,
    updateProduct,
    isUpdating,
    updateError,
    resetUpdateError,
    deleteProduct,
    isDeleting,
    resetDeleteError,
  } = useProducts(query);

  const hasFilters = filters.search !== "" || filters.status !== "";

  const handleFiltersChange = (next: ProductFiltersValue) => {
    setFilters(next);
    setPage(1);
  };

  const openForm = () => {
    resetCreateError();
    setFormKey((key) => key + 1);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    resetUpdateError();
    setEditingProduct(product);
  };

  const openDelete = (product: Product) => {
    resetDeleteError();
    setDeletingProduct(product);
  };

  const handleCreate = async (input: CreateProductInput) => {
    try {
      await createProduct(input);
      setFormOpen(false);
      setPage(1);
      notifySuccess("Producto creado.");
    } catch (createFailure) {
      notifyError(getErrorMessage(createFailure));
    }
  };

  const handleUpdate = async (input: UpdateProductInput) => {
    try {
      await updateProduct(input);
      setEditingProduct(null);
      notifySuccess("Producto actualizado.");
    } catch (updateFailure) {
      notifyError(getErrorMessage(updateFailure));
    }
  };

  const handleDelete = async () => {
    if (!deletingProduct) return;

    try {
      await deleteProduct(deletingProduct.id);
      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      }
      setDeletingProduct(null);
      notifySuccess("Producto eliminado.");
    } catch (deleteFailure) {
      setDeletingProduct(null);
      notifyError(getErrorMessage(deleteFailure));
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-third">Productos</h1>
          <p className="mt-1 text-sm text-secondary">Administra los productos del criadero</p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-third"
        >
          Nuevo producto
        </button>
      </header>

      <ProductFilters value={filters} onChange={handleFiltersChange} />

      {isLoading && <ProductsSkeleton />}

      {!isLoading && error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {!isLoading && !error && (
        <>
          <ProductsGrid
            products={products}
            hasFilters={hasFilters}
            onEdit={openEdit}
            onDelete={openDelete}
          />
          {total > 0 && (
            <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
          )}
        </>
      )}

      <BottomSheet open={isFormOpen} onClose={() => setFormOpen(false)} title="Nuevo producto">
        <ProductForm
          key={formKey}
          mode="create"
          isSubmitting={isCreating}
          error={createError}
          onSubmit={handleCreate}
        />
      </BottomSheet>

      <BottomSheet
        open={editingProduct !== null}
        onClose={() => setEditingProduct(null)}
        title="Editar producto"
      >
        {editingProduct && (
          <ProductForm
            mode="edit"
            initialValues={editingProduct}
            isSubmitting={isUpdating}
            error={updateError}
            onSubmit={handleUpdate}
          />
        )}
      </BottomSheet>

      <ConfirmSheet
        open={deletingProduct !== null}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleDelete}
        title="Eliminar producto"
        description={
          deletingProduct
            ? `¿Seguro que deseas eliminar "${deletingProduct.name}" (${formatCurrency(
                deletingProduct.price,
              )})? Esta acción no se puede deshacer.`
            : ""
        }
        isLoading={isDeleting}
      />
    </div>
  );
}
