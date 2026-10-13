import { and, desc, eq, gte, inArray, lte, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  cages,
  medicationApplicationCages,
  medicationApplications,
  medications,
  type MedicationApplicationRow,
} from "../db/schema.js";
import type { MedicationApplicationsPort } from "../domain/ports/medication-application.ports.js";
import type {
  MedicationApplication,
  MedicationApplicationsQuery,
} from "../domain/types/medication-application.js";

function toApplication(
  row: MedicationApplicationRow,
  cageIds: string[],
): MedicationApplication {
  return {
    id: row.id,
    cageIds,
    medicationId: row.medicationId,
    dose: row.dose,
    applicationDate: row.applicationDate,
    birdCount: row.birdCount,
    type: row.type,
  };
}

async function loadCageIds(ids: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (ids.length === 0) {
    return map;
  }

  const rows = await db
    .select()
    .from(medicationApplicationCages)
    .where(inArray(medicationApplicationCages.applicationId, ids));

  for (const row of rows) {
    const list = map.get(row.applicationId) ?? [];
    list.push(row.cageId);
    map.set(row.applicationId, list);
  }

  return map;
}

export const medicationApplicationsRepository: MedicationApplicationsPort = {
  async list(query: MedicationApplicationsQuery) {
    const conditions: SQL[] = [];
    if (query.medicationId) {
      conditions.push(eq(medicationApplications.medicationId, query.medicationId));
    }
    if (query.from) {
      conditions.push(gte(medicationApplications.applicationDate, query.from));
    }
    if (query.to) {
      conditions.push(lte(medicationApplications.applicationDate, query.to));
    }
    if (query.cageId) {
      const subquery = db
        .select({ id: medicationApplicationCages.applicationId })
        .from(medicationApplicationCages)
        .where(eq(medicationApplicationCages.cageId, query.cageId));
      conditions.push(inArray(medicationApplications.id, subquery));
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(medicationApplications)
        .where(where)
        .orderBy(
          desc(medicationApplications.applicationDate),
          desc(medicationApplications.createdAt),
        )
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db
        .select({ value: sql<number>`count(*)::int` })
        .from(medicationApplications)
        .where(where),
    ]);

    const cageMap = await loadCageIds(rows.map((row) => row.id));

    return {
      items: rows.map((row) => toApplication(row, cageMap.get(row.id) ?? [])),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    const cageIds = [...new Set(input.cageIds)];

    return db.transaction(async (tx) => {
      const [medication] = await tx
        .select({ id: medications.id })
        .from(medications)
        .where(eq(medications.id, input.medicationId));
      if (!medication) {
        return "not_found";
      }

      if (cageIds.length > 0) {
        const rows = await tx
          .select({ id: cages.id })
          .from(cages)
          .where(inArray(cages.id, cageIds));
        if (rows.length !== cageIds.length) {
          return "not_found";
        }
      }

      const [row] = await tx
        .insert(medicationApplications)
        .values({
          medicationId: input.medicationId,
          dose: input.dose,
          applicationDate: input.applicationDate,
          birdCount: input.birdCount,
          type: input.type,
        })
        .returning();

      if (cageIds.length > 0) {
        await tx
          .insert(medicationApplicationCages)
          .values(cageIds.map((cageId) => ({ applicationId: row.id, cageId })));
      }

      return toApplication(row, cageIds);
    });
  },

  async update(id, input) {
    const cageIds = [...new Set(input.cageIds)];

    return db.transaction(async (tx) => {
      const [current] = await tx
        .select({ id: medicationApplications.id })
        .from(medicationApplications)
        .where(eq(medicationApplications.id, id));
      if (!current) {
        return "not_found";
      }

      const [medication] = await tx
        .select({ id: medications.id })
        .from(medications)
        .where(eq(medications.id, input.medicationId));
      if (!medication) {
        return "not_found";
      }

      if (cageIds.length > 0) {
        const rows = await tx
          .select({ id: cages.id })
          .from(cages)
          .where(inArray(cages.id, cageIds));
        if (rows.length !== cageIds.length) {
          return "not_found";
        }
      }

      const [row] = await tx
        .update(medicationApplications)
        .set({
          medicationId: input.medicationId,
          dose: input.dose,
          applicationDate: input.applicationDate,
          birdCount: input.birdCount,
          type: input.type,
          updatedAt: new Date(),
        })
        .where(eq(medicationApplications.id, id))
        .returning();

      await tx
        .delete(medicationApplicationCages)
        .where(eq(medicationApplicationCages.applicationId, id));

      if (cageIds.length > 0) {
        await tx
          .insert(medicationApplicationCages)
          .values(cageIds.map((cageId) => ({ applicationId: id, cageId })));
      }

      return toApplication(row, cageIds);
    });
  },

  async remove(id) {
    const [row] = await db
      .delete(medicationApplications)
      .where(eq(medicationApplications.id, id))
      .returning({ id: medicationApplications.id });

    return Boolean(row);
  },
};
