import { and, eq, ilike, ne, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import { customers, invoices, orders, type CustomerRow } from "../db/schema.js";
import type { CustomersPort } from "../domain/ports/customer.ports.js";
import type { Customer, CustomersQuery } from "../domain/types/customer.js";

function toCustomer(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    active: row.active,
  };
}

async function nameExists(name: string, ignoreId?: string): Promise<boolean> {
  const conditions: SQL[] = [sql`lower(${customers.name}) = lower(${name})`];
  if (ignoreId) {
    conditions.push(ne(customers.id, ignoreId));
  }

  const [row] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(and(...conditions));

  return Boolean(row);
}

export const customersRepository: CustomersPort = {
  async list(query: CustomersQuery) {
    const conditions: SQL[] = [];
    if (query.search) conditions.push(ilike(customers.name, `%${query.search}%`));
    if (query.status) conditions.push(eq(customers.active, query.status === "active"));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(customers)
        .where(where)
        .orderBy(customers.name)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(customers).where(where),
    ]);

    return {
      items: rows.map(toCustomer),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    if (await nameExists(input.name)) {
      return "duplicate";
    }

    const [row] = await db.insert(customers).values(input).returning();
    return toCustomer(row);
  },

  async update(id, input) {
    const [current] = await db.select().from(customers).where(eq(customers.id, id));
    if (!current) {
      return "not_found";
    }

    if (await nameExists(input.name, id)) {
      return "duplicate";
    }

    const [row] = await db
      .update(customers)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();

    return toCustomer(row);
  },

  async remove(id) {
    return db.transaction(async (tx) => {
      const [current] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.id, id));
      if (!current) {
        return "not_found";
      }

      const [order] = await tx
        .select({ id: orders.id })
        .from(orders)
        .where(eq(orders.customerId, id))
        .limit(1);
      if (order) {
        return "in_use";
      }

      const [invoice] = await tx
        .select({ id: invoices.id })
        .from(invoices)
        .where(eq(invoices.customerId, id))
        .limit(1);
      if (invoice) {
        return "in_use";
      }

      await tx.delete(customers).where(eq(customers.id, id));
      return "deleted";
    });
  },
};
