import { Pencil, Trash } from "lucide-react";

import { formatCurrency } from "../../../shared/utils/currency";
import type { Product } from "../domain/product";
import { ProductImage } from "./ProductImage";

type ProductCardProps = {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
};

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-secondary/20 bg-white/80 shadow-sm">
      <ProductImage
        src={product.imageUrl}
        alt={product.name}
        className="aspect-square w-full"
      />

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-third">
            {product.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
              product.active ? "bg-secondary/15 text-secondary" : "bg-third/10 text-third/60"
            }`}
          >
            {product.active ? "Activo" : "Inactivo"}
          </span>
        </div>

        <p className="mt-1 text-lg font-semibold text-secondary">
          {formatCurrency(product.price)}
        </p>

        <div className="mt-auto flex justify-end gap-2 pt-3">
          <button
            type="button"
            onClick={() => onEdit(product)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-secondary/30 px-3 py-2 text-xs font-medium text-secondary transition hover:bg-secondary/10"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </button>
          <button
            type="button"
            onClick={() => onDelete(product)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-300 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
          >
            <Trash className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      </div>
    </li>
  );
}
