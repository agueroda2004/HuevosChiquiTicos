import { formatCurrency } from "../../../shared/utils/currency";
import { ProductImage } from "../../products/components/ProductImage";
import type { Product } from "../../products/domain/product";

type SummaryItem = {
  id?: string;
  productId: string;
  quantity: number;
  unitPrice: number;
};

type InvoiceItemsSummaryProps = {
  items: SummaryItem[];
  products: Product[];
  emptyLabel?: string;
};

export function InvoiceItemsSummary({
  items,
  products,
  emptyLabel = "No hay productos.",
}: InvoiceItemsSummaryProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-secondary/30 bg-white/60 px-3 py-4 text-center text-xs text-secondary">
        {emptyLabel}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const product = products.find((candidate) => candidate.id === item.productId);

        return (
          <li
            key={item.id ?? item.productId}
            className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-white p-3"
          >
            <ProductImage
              src={product?.imageUrl ?? null}
              alt={product?.name ?? "Producto"}
              className="size-12 shrink-0 rounded-lg"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-third">
                {product?.name ?? "Producto eliminado"}
              </p>
              <p className="text-xs text-secondary">
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </p>
            </div>

            <span className="shrink-0 text-sm font-semibold text-third">
              {formatCurrency(item.quantity * item.unitPrice)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
