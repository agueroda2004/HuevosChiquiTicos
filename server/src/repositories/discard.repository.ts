import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import { discards, type DiscardRow } from "../db/schema.js";
import type { DiscardsPort } from "../domain/ports/discard.ports.js";
import type { Discard, DiscardsQuery } from "../domain/types/discard.js";
import { adjustCageBirds } from "./helpers.js";

function toDiscard(row: DiscardRow): Discard {
  return {
    id: row.id,
    quantity: row.quantity,
    cageId: row.cageId,
    discardDate: row.discardDate,
  };
}

export const discardsRepository: DiscardsPort = {
  async list(query: DiscardsQuery) {
    const conditions: SQL[] = [];
    if (query.cageId) conditions.push(eq(discards.cageId, query.cageId));
    if (query.from) conditions.push(gte(discards.discardDate, query.from));
    if (query.to) conditions.push(lte(discards.discardDate, query.to));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(discards)
        .where(where)
        .orderBy(desc(discards.discardDate), desc(discards.createdAt))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(discards).where(where),
    ]);

    return {
      items: rows.map(toDiscard),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    return db.transaction(async (tx) => {
      const adjust = await adjustCageBirds(tx, input.cageId, -input.quantity);
      if (adjust !== "ok") {
        return adjust;
      }

      const [row] = await tx.insert(discards).values(input).returning();
      return toDiscard(row);
    });
  },

  async update(id, input) {
    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(discards).where(eq(discards.id, id));
      if (!current) {
        return "not_found";
      }

      const restore = await adjustCageBirds(tx, current.cageId, current.quantity);
      if (restore !== "ok") {
        return restore;
      }

      const apply = await adjustCageBirds(tx, input.cageId, -input.quantity);
      if (apply !== "ok") {
        await adjustCageBirds(tx, current.cageId, -current.quantity);
        return apply;
      }

      const [row] = await tx
        .update(discards)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(discards.id, id))
        .returning();

      return toDiscard(row);
    });
  },

  async remove(id) {
    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(discards).where(eq(discards.id, id));
      if (!current) {
        return "not_found";
      }

      await adjustCageBirds(tx, current.cageId, current.quantity);
      await tx.delete(discards).where(eq(discards.id, id));

      return "deleted";
    });
  },
};
