import type { PaginatedResult } from "../types/common.js";
import type {
  CreateOrderDTO,
  Order,
  OrdersQuery,
  UpdateOrderDTO,
} from "../types/order.js";

export interface OrdersPort {
  list: (query: OrdersQuery) => Promise<PaginatedResult<Order>>;
  create: (input: CreateOrderDTO) => Promise<Order | "not_found">;
  update: (id: string, input: UpdateOrderDTO) => Promise<Order | "not_found">;
  remove: (id: string) => Promise<boolean>;
}
