import { BottomSheet } from "../../../shared/components/BottomSheet";
import { formatCurrency } from "../../../shared/utils/currency";
import { formatDateLabel, todayIso } from "../../../shared/utils/date";
import { ProductImage } from "../../products/components/ProductImage";
import type { Product } from "../../products/domain/product";
import { getOrderStatusLabel, ORDER_STATUS_BADGE_CLASS } from "../constants";
import type { Order } from "../domain/order";

type OrderDetailSheetProps = {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  customerName: string;
  products: Product[];
};

export function OrderDetailSheet({
  open,
  onClose,
  order,
  customerName,
  products,
}: OrderDetailSheetProps) {
  const isOverdue = order ? order.status !== "delivered" && order.deliveryDate < todayIso() : false;

  return (
    <BottomSheet open={open} onClose={onClose} title="Detalle del pedido">
      {order && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-secondary">Cliente</p>
              <p className="truncate text-sm font-semibold text-third">{customerName}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                ORDER_STATUS_BADGE_CLASS[order.status]
              }`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <p className="text-xs text-secondary">Fecha de entrega</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <span className="text-sm text-third">
                  {formatDateLabel(order.deliveryDate)}
                </span>
                {isOverdue && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600">
                    Atrasado
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-secondary">Productos</p>
              <p className="mt-0.5 text-sm text-third">{order.items.length}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-third">Detalle</p>
            {order.items.length === 0 ? (
              <p className="rounded-xl border border-dashed border-secondary/30 bg-white/60 px-3 py-4 text-center text-xs text-secondary">
                Este pedido no tiene productos registrados.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {order.items.map((item) => {
                  const product = products.find((candidate) => candidate.id === item.productId);

                  return (
                    <li
                      key={item.id}
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
                        {formatCurrency(item.subtotal)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-secondary/30 bg-white px-4 py-3">
            <span className="text-sm text-third">Total</span>
            <span className="text-base font-semibold text-secondary">
              {formatCurrency(order.total)}
            </span>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
