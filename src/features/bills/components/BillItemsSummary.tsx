import { formatCurrency } from "../../../shared/utils/currency";
import { computeSubtotal } from "../utils";

type SummaryItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

type BillItemsSummaryProps = {
  items: SummaryItem[];
  emptyLabel?: string;
};

export function BillItemsSummary({
  items,
  emptyLabel = "No hay conceptos.",
}: BillItemsSummaryProps) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-secondary/30 bg-white/60 px-3 py-4 text-center text-xs text-secondary">
        {emptyLabel}
      </p>
    );
  }

  return (
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
        </li>
      ))}
    </ul>
  );
}
