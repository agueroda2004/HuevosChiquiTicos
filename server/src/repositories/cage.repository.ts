import { and, eq, ne, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  cages,
  deaths,
  discards,
  eggCollections,
  entries,
  medicationApplicationCages,
  type CageRow,
} from "../db/schema.js";
import type { CagesPort } from "../domain/ports/cage.ports.js";
import type { Cage } from "../domain/types/cage.js";
import type { DeleteResult } from "../domain/types/common.js";
function toCage(row: CageRow): Cage {
  return {
    id: row.id,
    name: row.name,
    birds: row.birds,
    active: row.active,
  };
}

async function nameExists(name: string, ignoreId?: string): Promise<boolean> {
  const conditions: SQL[] = [sql`lower(${cages.name}) = lower(${name})`];
  if (ignoreId) {
    conditions.push(ne(cages.id, ignoreId));
  }

  const [row] = await db
    .select({ id: cages.id })
    .from(cages)
    .where(and(...conditions));

  return Boolean(row);
}

export const cagesRepository: CagesPort = {
  async list() {
    const rows = await db.select().from(cages);
    return rows.map(toCage);
  },

  async create(input) {
    if (await nameExists(input.name)) {
      return "duplicate";
    }

    const [row] = await db
      .insert(cages)
      .values({
        name: input.name,
        birds: input.birds,
        active: input.active,
      })
      .returning();

    return toCage(row);
  },

  async update(id, input) {
    const [current] = await db.select().from(cages).where(eq(cages.id, id));

    if (!current) {
      return "not_found";
    }

    if (input.name && (await nameExists(input.name, id))) {
      return "duplicate";
    }

    const [row] = await db
      .update(cages)
      .set({
        name: input.name ?? current.name,
        active: input.active ?? current.active,
        updatedAt: new Date(),
      })
      .where(eq(cages.id, id))
      .returning();

    return toCage(row);
  },

  async adjustBirds(id, delta) {
    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(cages).where(eq(cages.id, id));

      if (!current) {
        return "not_found";
      }

      const nextBirds = current.birds + delta;
      if (nextBirds < 0) {
        return "insufficient";
      }

      const [row] = await tx
        .update(cages)
        .set({ birds: nextBirds, updatedAt: new Date() })
        .where(eq(cages.id, id))
        .returning();

      return toCage(row);
    });
  },

  async remove(id): Promise<DeleteResult> {
    return db.transaction(async (tx) => {
      const [cage] = await tx.select({ id: cages.id }).from(cages).where(eq(cages.id, id));

      if (!cage) {
        return "not_found";
      }

      const [eggCollection] = await tx
        .select({ id: eggCollections.id })
        .from(eggCollections)
        .where(eq(eggCollections.cageId, id))
        .limit(1);
      if (eggCollection) {
        return "in_use";
      }

      const [death] = await tx
        .select({ id: deaths.id })
        .from(deaths)
        .where(eq(deaths.cageId, id))
        .limit(1);
      if (death) {
        return "in_use";
      }

      const [entry] = await tx
        .select({ id: entries.id })
        .from(entries)
        .where(eq(entries.cageId, id))
        .limit(1);
      if (entry) {
        return "in_use";
      }

      const [discard] = await tx
        .select({ id: discards.id })
        .from(discards)
        .where(eq(discards.cageId, id))
        .limit(1);
      if (discard) {
        return "in_use";
      }

      const [application] = await tx
        .select({ id: medicationApplicationCages.applicationId })
        .from(medicationApplicationCages)
        .where(eq(medicationApplicationCages.cageId, id))
        .limit(1);
      if (application) {
        return "in_use";
      }

      await tx.delete(cages).where(eq(cages.id, id));
      return "deleted";
    });
  },
};
