import { Trash } from "lucide-react";
import { useState } from "react";

import { formatCurrency } from "../../../shared/utils/currency";
import type { BillItemInput } from "../domain/bill";
import { computeSubtotal, roundCurrency } from "../utils";

type BillItemsEditorProps = {
  items: BillItemInput[];
  onChange: (items: BillItemInput[]) => void;
  error?: string | null;
};

const inputClassName =
  "w-full rounded-xl border border-secondary/30 bg-white px-4 py-3 text-base text-third outline-none transition placeholder:text-secondary/60 focus:border-secondary focus:ring-2 focus:ring-secondary/30";

export function BillItemsEditor({ items, onChange, error }: BillItemsEditorProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [lineError, setLineError] = useState<string | null>(null);

  const parsedPrice = Number(unitPrice);
  const hasValidPreview = unitPrice.trim() !== "" && !Number.isNaN(parsedPrice);

  const handleAdd = () => {
    const trimmedName = name.trim();
    const qty = Number(quantity);
    const price = Number(unitPrice);

    if (trimmedName === "") {
      setLineError("Escribe un nombre para el concepto.");
      return;
    }
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
      { name: trimmedName, quantity: qty, unitPrice: roundCurrency(price) },
    ]);
    setName("");
    setQuantity("1");
    setUnitPrice("");
    setLineError(null);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const total = items.reduce(
    (sum, item) => sum + computeSubtotal(item.quantity, item.unitPrice),
    0,
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-secondary/20 bg-white/60 p-3">
        <span className="text-xs font-medium text-third">Conceptos de la factura</span>

        <div className="mt-2 flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bill-item-name" className="text-xs font-medium text-third">
              Nombre
            </label>
            <input
              id="bill-item-name"
              type="text"
              maxLength={100}
              placeholder="Ej. Alimento balanceado"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="bill-item-quantity" className="text-xs font-medium text-third">
                Cantidad
              </label>
              <input
                id="bill-item-quantity"
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
              <label htmlFor="bill-item-price" className="text-xs font-medium text-third">
                Precio
              </label>
              <input
                id="bill-item-price"
                type="number"
                min={0}
                step="0.01"
                inputMode="decimal"
                placeholder="Ej. 5000"
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

          <button
            type="button"
            onClick={handleAdd}
            className="rounded-xl border border-secondary/40 px-4 py-2.5 text-sm font-semibold text-secondary transition hover:bg-secondary/10"
          >
            Agregar concepto
          </button>

          {lineError && <p className="text-xs text-red-500">{lineError}</p>}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-secondary/30 bg-white/60 px-3 py-4 text-center text-xs text-secondary">
          Todavía no has agregado conceptos.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={`${item.name}-${index}`}
              className="flex items-center gap-3 rounded-xl border border-secondary/20 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-third">{item.name}</p>
                <p className="text-xs text-secondary">
                  {item.quantity} × {formatCurrency(item.unitPrice)}
                </p>
              </div>

              <span className="shrink-0 text-sm font-semibold text-third">
                {formatCurrency(computeSubtotal(item.quantity, item.unitPrice))}
              </span>

              <button
                type="button"
                aria-label="Quitar concepto"
                onClick={() => handleRemove(index)}
                className="shrink-0 rounded-lg border border-red-300 p-2 text-red-600 transition hover:bg-red-50"
              >
                <Trash className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
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
