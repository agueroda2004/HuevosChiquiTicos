import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type {
  CreateOrderInput,
  Order,
  OrdersQuery,
  UpdateOrderInput,
} from "../domain/order";
import type { OrdersPort } from "../domain/order.ports";

function buildQuery(query: OrdersQuery): string {
  const params = new URLSearchParams();
  if (query.customerId) params.set("customerId", query.customerId);
  if (query.status) params.set("status", query.status);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

export const ordersHttpService: OrdersPort = {
  list(query: OrdersQuery) {
    return request<PaginatedResult<Order>>(`/api/orders?${buildQuery(query)}`);
  },

  create(input: CreateOrderInput) {
    return request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateOrderInput) {
    return request<Order>(`/api/orders/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        customerId: input.customerId,
        deliveryDate: input.deliveryDate,
        status: input.status,
        items: input.items,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/orders/${id}`, { method: "DELETE" });
  },
};
