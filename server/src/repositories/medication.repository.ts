import { and, eq, ne, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import { medicationApplications, medications, type MedicationRow } from "../db/schema.js";
import type { MedicationsPort } from "../domain/ports/medication.ports.js";
import type { Medication } from "../domain/types/medication.js";

function toMedication(row: MedicationRow): Medication {
  return {
    id: row.id,
    name: row.name,
    active: row.active,
  };
}

async function nameExists(name: string, ignoreId?: string): Promise<boolean> {
  const conditions: SQL[] = [sql`lower(${medications.name}) = lower(${name})`];
  if (ignoreId) {
    conditions.push(ne(medications.id, ignoreId));
  }

  const [row] = await db
    .select({ id: medications.id })
    .from(medications)
    .where(and(...conditions));

  return Boolean(row);
}

export const medicationsRepository: MedicationsPort = {
  async list() {
    const rows = await db.select().from(medications);
    return rows.map(toMedication);
  },

  async create(input) {
    if (await nameExists(input.name)) {
      return "duplicate";
    }

    const [row] = await db.insert(medications).values(input).returning();
    return toMedication(row);
  },

  async update(id, input) {
    const [current] = await db.select().from(medications).where(eq(medications.id, id));
    if (!current) {
      return "not_found";
    }

    if (await nameExists(input.name, id)) {
      return "duplicate";
    }

    const [row] = await db
      .update(medications)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(medications.id, id))
      .returning();

    return toMedication(row);
  },

  async remove(id) {
    return db.transaction(async (tx) => {
      const [current] = await tx
        .select({ id: medications.id })
        .from(medications)
        .where(eq(medications.id, id));

      if (!current) {
        return "not_found";
      }

      const [used] = await tx
        .select({ id: medicationApplications.id })
        .from(medicationApplications)
        .where(eq(medicationApplications.medicationId, id))
        .limit(1);

      if (used) {
        return "in_use";
      }

      await tx.delete(medications).where(eq(medications.id, id));
      return "deleted";
    });
  },
};
