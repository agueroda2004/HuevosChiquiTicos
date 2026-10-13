import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import { cages, eggCollections, type EggCollectionRow } from "../db/schema.js";
import type { EggCollectionsPort } from "../domain/ports/egg-collection.ports.js";
import type {
  EggCollection,
  EggCollectionsQuery,
} from "../domain/types/egg-collection.js";

function toEggCollection(row: EggCollectionRow): EggCollection {
  return {
    id: row.id,
    cageId: row.cageId,
    collectionDate: row.collectionDate,
    quantity: row.quantity,
  };
}

async function cageExists(cageId: string): Promise<boolean> {
  const [row] = await db.select({ id: cages.id }).from(cages).where(eq(cages.id, cageId));
  return Boolean(row);
}

export const eggCollectionsRepository: EggCollectionsPort = {
  async list(query: EggCollectionsQuery) {
    const conditions: SQL[] = [];
    if (query.cageId) conditions.push(eq(eggCollections.cageId, query.cageId));
    if (query.from) conditions.push(gte(eggCollections.collectionDate, query.from));
    if (query.to) conditions.push(lte(eggCollections.collectionDate, query.to));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(eggCollections)
        .where(where)
        .orderBy(desc(eggCollections.collectionDate), desc(eggCollections.createdAt))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(eggCollections).where(where),
    ]);

    return {
      items: rows.map(toEggCollection),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    if (!(await cageExists(input.cageId))) {
      return "not_found";
    }

    const [row] = await db.insert(eggCollections).values(input).returning();
    return toEggCollection(row);
  },

  async update(id, input) {
    if (!(await cageExists(input.cageId))) {
      return "not_found";
    }

    const [row] = await db
      .update(eggCollections)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(eggCollections.id, id))
      .returning();

    return row ? toEggCollection(row) : "not_found";
  },

  async remove(id) {
    const [row] = await db
      .delete(eggCollections)
      .where(eq(eggCollections.id, id))
      .returning({ id: eggCollections.id });

    return Boolean(row);
  },
};
