import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import { entries, type EntryRow } from "../db/schema.js";
import type { EntriesPort } from "../domain/ports/entry.ports.js";
import type { EntriesQuery, Entry } from "../domain/types/entry.js";
import { adjustCageBirds } from "./helpers.js";

function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    quantity: row.quantity,
    cageId: row.cageId,
    entryDate: row.entryDate,
  };
}

export const entriesRepository: EntriesPort = {
  async list(query: EntriesQuery) {
    const conditions: SQL[] = [];
    if (query.cageId) conditions.push(eq(entries.cageId, query.cageId));
    if (query.from) conditions.push(gte(entries.entryDate, query.from));
    if (query.to) conditions.push(lte(entries.entryDate, query.to));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(entries)
        .where(where)
        .orderBy(desc(entries.entryDate), desc(entries.createdAt))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(entries).where(where),
    ]);

    return {
      items: rows.map(toEntry),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    return db.transaction(async (tx) => {
      const adjust = await adjustCageBirds(tx, input.cageId, input.quantity);
      if (adjust !== "ok") {
        return "not_found";
      }

      const [row] = await tx.insert(entries).values(input).returning();
      return toEntry(row);
    });
  },

  async update(id, input) {
    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(entries).where(eq(entries.id, id));
      if (!current) {
        return "not_found";
      }

      const reverse = await adjustCageBirds(tx, current.cageId, -current.quantity);
      if (reverse !== "ok") {
        return reverse;
      }

      const apply = await adjustCageBirds(tx, input.cageId, input.quantity);
      if (apply !== "ok") {
        await adjustCageBirds(tx, current.cageId, current.quantity);
        return apply;
      }

      const [row] = await tx
        .update(entries)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(entries.id, id))
        .returning();

      return toEntry(row);
    });
  },

  async remove(id) {
    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(entries).where(eq(entries.id, id));
      if (!current) {
        return "not_found";
      }

      const adjust = await adjustCageBirds(tx, current.cageId, -current.quantity);
      if (adjust !== "ok") {
        return adjust;
      }

      await tx.delete(entries).where(eq(entries.id, id));

      return "deleted";
    });
  },
};
