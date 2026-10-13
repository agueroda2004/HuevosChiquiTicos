import type { Product } from "../domain/product";
import { ProductCard } from "./ProductCard";

type ProductsGridProps = {
  products: Product[];
  hasFilters: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductsGrid({ products, hasFilters, onEdit, onDelete }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-secondary/30 bg-white/60 px-6 py-12 text-center">
        <p className="text-sm font-medium text-third">No hay productos</p>
        <p className="mt-1 text-xs text-secondary">
          {hasFilters
            ? "No se encontraron productos con los filtros actuales."
            : "Crea tu primer producto para empezar."}
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
