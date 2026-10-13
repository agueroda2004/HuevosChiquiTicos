import { and, eq, ilike, ne, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import { bills, suppliers, type SupplierRow } from "../db/schema.js";
import type { SuppliersPort } from "../domain/ports/supplier.ports.js";
import type { Supplier, SuppliersQuery } from "../domain/types/supplier.js";

function toSupplier(row: SupplierRow): Supplier {
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
  const conditions: SQL[] = [sql`lower(${suppliers.name}) = lower(${name})`];
  if (ignoreId) {
    conditions.push(ne(suppliers.id, ignoreId));
  }

  const [row] = await db
    .select({ id: suppliers.id })
    .from(suppliers)
    .where(and(...conditions));

  return Boolean(row);
}

export const suppliersRepository: SuppliersPort = {
  async list(query: SuppliersQuery) {
    const conditions: SQL[] = [];
    if (query.search) conditions.push(ilike(suppliers.name, `%${query.search}%`));
    if (query.status) conditions.push(eq(suppliers.active, query.status === "active"));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(suppliers)
        .where(where)
        .orderBy(suppliers.name)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(suppliers).where(where),
    ]);

    return {
      items: rows.map(toSupplier),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    if (await nameExists(input.name)) {
      return "duplicate";
    }

    const [row] = await db.insert(suppliers).values(input).returning();
    return toSupplier(row);
  },

  async update(id, input) {
    const [current] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    if (!current) {
      return "not_found";
    }

    if (await nameExists(input.name, id)) {
      return "duplicate";
    }

    const [row] = await db
      .update(suppliers)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(suppliers.id, id))
      .returning();

    return toSupplier(row);
  },

  async remove(id) {
    return db.transaction(async (tx) => {
      const [current] = await tx
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.id, id));
      if (!current) {
        return "not_found";
      }

      const [bill] = await tx
        .select({ id: bills.id })
        .from(bills)
        .where(eq(bills.supplierId, id))
        .limit(1);
      if (bill) {
        return "in_use";
      }

      await tx.delete(suppliers).where(eq(suppliers.id, id));
      return "deleted";
    });
  },
};
