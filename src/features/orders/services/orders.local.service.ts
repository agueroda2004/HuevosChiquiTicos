import type { PaginatedResult } from "../../../shared/domain/pagination";
import type { CreateOrderInput, Order, OrdersQuery, UpdateOrderInput } from "../domain/order";
import type { OrdersPort } from "../domain/order.ports";
import { computeOrderTotal, computeSubtotal } from "../utils";

const STORAGE_KEY = "huevos-chiquiticos.orders";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(order: Order): Order {
  const items = Array.isArray(order.items) ? order.items : [];
  return { ...order, items, total: computeOrderTotal(items) };
}

function read(): Order[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]).map(normalize) : [];
  } catch {
    return [];
  }
}

function write(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function buildItems(input: CreateOrderInput): Order["items"] {
  return input.items.map((item) => ({
    id: crypto.randomUUID(),
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: computeSubtotal(item.quantity, item.unitPrice),
  }));
}

export const ordersLocalService: OrdersPort = {
  async list(query: OrdersQuery): Promise<PaginatedResult<Order>> {
    await delay(SIMULATED_LATENCY_MS);

    const filtered = read()
      .filter((order) =>
        query.status ? order.status === query.status : order.status !== "delivered",
      )
      .filter((order) => !query.customerId || order.customerId === query.customerId)
      .filter((order) => !query.from || order.deliveryDate >= query.from)
      .filter((order) => !query.to || order.deliveryDate <= query.to)
      .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateOrderInput) {
    await delay(SIMULATED_LATENCY_MS);

    const items = buildItems(input);

    const order: Order = {
      id: crypto.randomUUID(),
      customerId: input.customerId,
      deliveryDate: input.deliveryDate,
      status: input.status,
      items,
      total: computeOrderTotal(items),
    };

    write([...read(), order]);
    return order;
  },

  async update(input: UpdateOrderInput) {
    await delay(SIMULATED_LATENCY_MS);

    const orders = read();
    const index = orders.findIndex((order) => order.id === input.id);

    if (index === -1) {
      throw new Error("El pedido no existe.");
    }

    const items = buildItems(input);

    const updated: Order = {
      id: input.id,
      customerId: input.customerId,
      deliveryDate: input.deliveryDate,
      status: input.status,
      items,
      total: computeOrderTotal(items),
    };

    const next = [...orders];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const orders = read();
    const next = orders.filter((order) => order.id !== id);

    if (next.length === orders.length) {
      throw new Error("El pedido no existe.");
    }

    write(next);
  },
};
