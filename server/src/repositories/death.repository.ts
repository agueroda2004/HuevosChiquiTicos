import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import { deaths, type DeathRow } from "../db/schema.js";
import type { DeathsPort } from "../domain/ports/death.ports.js";
import type { Death, DeathsQuery } from "../domain/types/death.js";
import { adjustCageBirds } from "./helpers.js";

function toDeath(row: DeathRow): Death {
  return {
    id: row.id,
    deathDate: row.deathDate,
    cageId: row.cageId,
    quantity: row.quantity,
    type: row.type,
  };
}

export const deathsRepository: DeathsPort = {
  async list(query: DeathsQuery) {
    const conditions: SQL[] = [];
    if (query.cageId) conditions.push(eq(deaths.cageId, query.cageId));
    if (query.from) conditions.push(gte(deaths.deathDate, query.from));
    if (query.to) conditions.push(lte(deaths.deathDate, query.to));
    if (query.type) conditions.push(eq(deaths.type, query.type));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(deaths)
        .where(where)
        .orderBy(desc(deaths.deathDate), desc(deaths.createdAt))
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(deaths).where(where),
    ]);

    return {
      items: rows.map(toDeath),
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

      const [row] = await tx.insert(deaths).values(input).returning();
      return toDeath(row);
    });
  },

  async update(id, input) {
    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(deaths).where(eq(deaths.id, id));
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
        .update(deaths)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(deaths.id, id))
        .returning();

      return toDeath(row);
    });
  },

  async remove(id) {
    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(deaths).where(eq(deaths.id, id));
      if (!current) {
        return "not_found";
      }

      await adjustCageBirds(tx, current.cageId, current.quantity);
      await tx.delete(deaths).where(eq(deaths.id, id));

      return "deleted";
    });
  },
};
