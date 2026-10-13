import { Trash } from "lucide-react";
import { useState } from "react";

import { Dropdown, type DropdownOption } from "../../../shared/components/Dropdown";
import { formatCurrency } from "../../../shared/utils/currency";
import { ProductImage } from "../../products/components/ProductImage";
import type { Product } from "../../products/domain/product";
import type { InvoiceItemInput } from "../domain/invoice";
import { computeSubtotal, roundCurrency } from "../utils";

type InvoiceItemsEditorProps = {
  products: Product[];
  items: InvoiceItemInput[];
  onChange: (items: InvoiceItemInput[]) => void;
  error?: string | null;
};

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-base text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

export function InvoiceItemsEditor({
  products,
  items,
  onChange,
  error,
}: InvoiceItemsEditorProps) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [lineError, setLineError] = useState<string | null>(null);

  const availableProducts = products.filter(
    (product) => !items.some((item) => item.productId === product.id),
  );
  const selectedProduct = products.find((product) => product.id === productId) ?? null;

  const options: DropdownOption[] = availableProducts.map((product) => ({
    value: product.id,
    label: product.name,
  }));

  const parsedPrice = Number(unitPrice);
  const hasValidPreview = unitPrice.trim() !== "" && !Number.isNaN(parsedPrice);

  const handleSelectProduct = (id: string) => {
    setProductId(id);
    setQuantity("1");
    setUnitPrice(String(products.find((product) => product.id === id)?.price ?? ""));
    setLineError(null);
  };

  const handleAdd = () => {
    if (!selectedProduct) {
      setLineError("Selecciona un producto.");
      return;
    }

    const qty = Number(quantity);
    const price = Number(unitPrice);

    if (!Number.isInteger(qty) || qty < 1) {
      setLineError("La cantidad debe ser un entero mayor o igual a 1.");
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      setLineError("El precio debe ser un número mayor o igual a 0.");
      return;
    }

    onChange([
      ...items,
      { productId: selectedProduct.id, quantity: qty, unitPrice: roundCurrency(price) },
    ]);
    setProductId("");
    setQuantity("1");
    setUnitPrice("");
    setLineError(null);
  };

  const handleRemove = (productIdToRemove: string) => {
    onChange(items.filter((item) => item.productId !== productIdToRemove));
  };

  const total = items.reduce(
    (sum, item) => sum + computeSubtotal(item.quantity, item.unitPrice),
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-secondary/20 bg-white/60 p-3">
        <span className="text-xs font-medium text-third">Productos de la factura</span>

        <div className="mt-2 flex flex-col gap-3">
          <Dropdown
            value={productId}
            options={options}
            onChange={handleSelectProduct}
            placeholder={
              availableProducts.length === 0
                ? "No hay productos disponibles"
                : "Selecciona un producto"
            }
            disabled={availableProducts.length === 0}
          />

          {selectedProduct && (
            <div className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-white p-3">
              <ProductImage
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
                className="size-16 shrink-0 rounded-lg"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-third">
                  {selectedProduct.name}
                </p>
                <p className="text-xs text-secondary">
                  Precio base: {formatCurrency(selectedProduct.price)}
                </p>
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="invoice-item-quantity" className="text-xs font-medium text-third">
                  Cantidad
                </label>
                <input
                  id="invoice-item-quantity"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="invoice-item-price" className="text-xs font-medium text-third">
                  Precio unitario
                </label>
                <input
                  id="invoice-item-price"
                  type="number"
                  min={0}
                  step="0.01"
                  inputMode="decimal"
                  value={unitPrice}
                  onChange={(event) => setUnitPrice(event.target.value)}
                  className={inputClassName}
                />
                {hasValidPreview && (
                  <p className="text-sm font-semibold text-secondary">
                    {formatCurrency(parsedPrice)}
                  </p>
                )}
              </div>
            </div>
          )}

          {selectedProduct && (
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-xl border border-secondary/40 px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-secondary/10"
            >
              Agregar producto
            </button>
          )}

          {lineError && <p className="text-xs text-red-500">{lineError}</p>}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-secondary/30 bg-white/60 px-3 py-4 text-center text-xs text-secondary">
          Todavía no has agregado productos.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => {
            const product = products.find((candidate) => candidate.id === item.productId);

            return (
              <li
                key={item.productId}
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
                  {formatCurrency(computeSubtotal(item.quantity, item.unitPrice))}
                </span>

                <button
                  type="button"
                  aria-label="Quitar producto"
                  onClick={() => handleRemove(item.productId)}
                  className="shrink-0 rounded-lg border border-red-300 p-2 text-red-600 transition hover:bg-red-50"
                >
                  <Trash className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-white px-4 py-3">
        <span className="text-sm text-third">Total</span>
        <span className="text-base font-semibold text-secondary">{formatCurrency(total)}</span>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
