import type { PaginatedResult } from "../../../shared/domain/pagination";
import type { CreateOrderInput, Order, OrdersQuery, UpdateOrderInput } from "./order";

export interface OrdersPort {
  list: (query: OrdersQuery) => Promise<PaginatedResult<Order>>;
  create: (input: CreateOrderInput) => Promise<Order>;
  update: (input: UpdateOrderInput) => Promise<Order>;
  remove: (id: string) => Promise<void>;
}
