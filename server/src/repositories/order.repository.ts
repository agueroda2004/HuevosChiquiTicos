import { and, eq, gte, inArray, lte, ne, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  customers,
  orderItems,
  orders,
  products,
  type OrderItemRow,
  type OrderRow,
} from "../db/schema.js";
import type { OrdersPort } from "../domain/ports/order.ports.js";
import type { Order, OrderItem, OrdersQuery } from "../domain/types/order.js";
import { computeSubtotal, computeTotal } from "./calc.js";

function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    productId: row.productId,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    subtotal: row.subtotal,
  };
}

function buildOrder(row: OrderRow, items: OrderItemRow[]): Order {
  return {
    id: row.id,
    customerId: row.customerId,
    deliveryDate: row.deliveryDate,
    status: row.status,
    items: items.map(toOrderItem),
    total: row.total,
  };
}

async function loadItems(orderIds: string[]): Promise<Map<string, OrderItemRow[]>> {
  const map = new Map<string, OrderItemRow[]>();
  if (orderIds.length === 0) {
    return map;
  }

  const rows = await db.select().from(orderItems).where(inArray(orderItems.orderId, orderIds));

  for (const row of rows) {
    const list = map.get(row.orderId) ?? [];
    list.push(row);
    map.set(row.orderId, list);
  }

  return map;
}

export const ordersRepository: OrdersPort = {
  async list(query: OrdersQuery) {
    const conditions: SQL[] = [];
    if (query.status) {
      conditions.push(eq(orders.status, query.status));
    } else {
      conditions.push(ne(orders.status, "delivered"));
    }
    if (query.customerId) conditions.push(eq(orders.customerId, query.customerId));
    if (query.from) conditions.push(gte(orders.deliveryDate, query.from));
    if (query.to) conditions.push(lte(orders.deliveryDate, query.to));
    const where = and(...conditions);

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(orders)
        .where(where)
        .orderBy(orders.deliveryDate)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(orders).where(where),
    ]);

    const itemsMap = await loadItems(rows.map((row) => row.id));

    return {
      items: rows.map((row) => buildOrder(row, itemsMap.get(row.id) ?? [])),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    const productIds = [...new Set(input.items.map((item) => item.productId))];

    return db.transaction(async (tx) => {
      const [customer] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.id, input.customerId));
      if (!customer) {
        return "not_found";
      }

      if (productIds.length > 0) {
        const rows = await tx
          .select({ id: products.id })
          .from(products)
          .where(inArray(products.id, productIds));
        if (rows.length !== productIds.length) {
          return "not_found";
        }
      }

      const total = computeTotal(input.items);
      const [order] = await tx
        .insert(orders)
        .values({
          customerId: input.customerId,
          deliveryDate: input.deliveryDate,
          status: input.status,
          total,
        })
        .returning();

      const inserted =
        input.items.length > 0
          ? await tx
              .insert(orderItems)
              .values(
                input.items.map((item) => ({
                  orderId: order.id,
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  subtotal: computeSubtotal(item.quantity, item.unitPrice),
                })),
              )
              .returning()
          : [];

      return buildOrder(order, inserted);
    });
  },

  async update(id, input) {
    const productIds = [...new Set(input.items.map((item) => item.productId))];

    return db.transaction(async (tx) => {
      const [current] = await tx.select({ id: orders.id }).from(orders).where(eq(orders.id, id));
      if (!current) {
        return "not_found";
      }

      const [customer] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.id, input.customerId));
      if (!customer) {
        return "not_found";
      }

      if (productIds.length > 0) {
        const rows = await tx
          .select({ id: products.id })
          .from(products)
          .where(inArray(products.id, productIds));
        if (rows.length !== productIds.length) {
          return "not_found";
        }
      }

      const total = computeTotal(input.items);
      const [order] = await tx
        .update(orders)
        .set({
          customerId: input.customerId,
          deliveryDate: input.deliveryDate,
          status: input.status,
          total,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, id))
        .returning();

      await tx.delete(orderItems).where(eq(orderItems.orderId, id));

      const inserted =
        input.items.length > 0
          ? await tx
              .insert(orderItems)
              .values(
                input.items.map((item) => ({
                  orderId: id,
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  subtotal: computeSubtotal(item.quantity, item.unitPrice),
                })),
              )
              .returning()
          : [];

      return buildOrder(order, inserted);
    });
  },

  async remove(id) {
    const [row] = await db
      .delete(orders)
      .where(eq(orders.id, id))
      .returning({ id: orders.id });

    return Boolean(row);
  },
};
