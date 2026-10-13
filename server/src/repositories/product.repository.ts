import { and, eq, ilike, ne, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import { invoiceItems, orderItems, products, type ProductRow } from "../db/schema.js";
import type { ProductsPort } from "../domain/ports/product.ports.js";
import type { Product, ProductsQuery } from "../domain/types/product.js";

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    active: row.active,
    imageUrl: row.imageUrl,
  };
}

async function nameExists(name: string, ignoreId?: string): Promise<boolean> {
  const conditions: SQL[] = [sql`lower(${products.name}) = lower(${name})`];
  if (ignoreId) {
    conditions.push(ne(products.id, ignoreId));
  }

  const [row] = await db
    .select({ id: products.id })
    .from(products)
    .where(and(...conditions));

  return Boolean(row);
}

export const productsRepository: ProductsPort = {
  async list(query: ProductsQuery) {
    const conditions: SQL[] = [];
    if (query.search) conditions.push(ilike(products.name, `%${query.search}%`));
    if (query.status) conditions.push(eq(products.active, query.status === "active"));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(products)
        .where(where)
        .orderBy(products.name)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(products).where(where),
    ]);

    return {
      items: rows.map(toProduct),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    if (await nameExists(input.name)) {
      return "duplicate";
    }

    const [row] = await db.insert(products).values(input).returning();
    return toProduct(row);
  },

  async update(id, input) {
    const [current] = await db.select().from(products).where(eq(products.id, id));
    if (!current) {
      return "not_found";
    }

    if (await nameExists(input.name, id)) {
      return "duplicate";
    }

    const [row] = await db
      .update(products)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();

    return toProduct(row);
  },

  async remove(id) {
    return db.transaction(async (tx) => {
      const [current] = await tx
        .select({ id: products.id })
        .from(products)
        .where(eq(products.id, id));
      if (!current) {
        return "not_found";
      }

      const [orderItem] = await tx
        .select({ id: orderItems.id })
        .from(orderItems)
        .where(eq(orderItems.productId, id))
        .limit(1);
      if (orderItem) {
        return "in_use";
      }

      const [invoiceItem] = await tx
        .select({ id: invoiceItems.id })
        .from(invoiceItems)
        .where(eq(invoiceItems.productId, id))
        .limit(1);
      if (invoiceItem) {
        return "in_use";
      }

      await tx.delete(products).where(eq(products.id, id));
      return "deleted";
    });
  },
};
