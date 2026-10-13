import { and, eq, gte, lte, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import { deaths, discards, eggCollections, entries } from "../db/schema.js";
import type { ReportsPort } from "../domain/ports/report.ports.js";
import type { ProductionReport, ReportsQuery } from "../domain/types/report.js";
import { deathsRepository } from "./death.repository.js";
import { discardsRepository } from "./discard.repository.js";
import { entriesRepository } from "./entry.repository.js";
import { medicationApplicationsRepository } from "./medication-application.repository.js";

export const reportsRepository: ReportsPort = {
  async getProductionReport(query: ReportsQuery): Promise<ProductionReport> {
    const recentLimit = query.recentLimit ?? 5;
    const { from, to, cageId } = query;

    const eggConditions: SQL[] = [
      gte(eggCollections.collectionDate, from),
      lte(eggCollections.collectionDate, to),
    ];
    if (cageId) eggConditions.push(eq(eggCollections.cageId, cageId));

    const deathConditions: SQL[] = [
      gte(deaths.deathDate, from),
      lte(deaths.deathDate, to),
    ];
    if (cageId) deathConditions.push(eq(deaths.cageId, cageId));

    const entryConditions: SQL[] = [
      gte(entries.entryDate, from),
      lte(entries.entryDate, to),
    ];
    if (cageId) entryConditions.push(eq(entries.cageId, cageId));

    const discardConditions: SQL[] = [
      gte(discards.discardDate, from),
      lte(discards.discardDate, to),
    ];
    if (cageId) discardConditions.push(eq(discards.cageId, cageId));

    const [
      eggTotals,
      daily,
      deathTotals,
      entryTotals,
      discardTotals,
      recentDeaths,
      recentEntries,
      recentDiscards,
      applications,
    ] = await Promise.all([
      db
        .select({
          total: sql<number>`coalesce(sum(${eggCollections.quantity}), 0)::int`,
          count: sql<number>`count(*)::int`,
        })
        .from(eggCollections)
        .where(and(...eggConditions)),
      db
        .select({
          date: eggCollections.collectionDate,
          quantity: sql<number>`coalesce(sum(${eggCollections.quantity}), 0)::int`,
        })
        .from(eggCollections)
        .where(and(...eggConditions))
        .groupBy(eggCollections.collectionDate)
        .orderBy(eggCollections.collectionDate),
      db
        .select({
          total: sql<number>`coalesce(sum(${deaths.quantity}), 0)::int`,
          count: sql<number>`count(*)::int`,
        })
        .from(deaths)
        .where(and(...deathConditions)),
      db
        .select({
          total: sql<number>`coalesce(sum(${entries.quantity}), 0)::int`,
          count: sql<number>`count(*)::int`,
        })
        .from(entries)
        .where(and(...entryConditions)),
      db
        .select({
          total: sql<number>`coalesce(sum(${discards.quantity}), 0)::int`,
          count: sql<number>`count(*)::int`,
        })
        .from(discards)
        .where(and(...discardConditions)),
      deathsRepository.list({ cageId, page: 1, pageSize: recentLimit }),
      entriesRepository.list({ cageId, page: 1, pageSize: recentLimit }),
      discardsRepository.list({ cageId, page: 1, pageSize: recentLimit }),
      medicationApplicationsRepository.list({ cageId, page: 1, pageSize: recentLimit }),
    ]);

    return {
      range: { from, to, cageId: cageId ?? null },
      eggCollections: {
        totalEggs: eggTotals[0].total,
        count: eggTotals[0].count,
        daily,
      },
      deaths: {
        totalQuantity: deathTotals[0].total,
        count: deathTotals[0].count,
        recent: recentDeaths.items,
      },
      entries: {
        totalQuantity: entryTotals[0].total,
        count: entryTotals[0].count,
        recent: recentEntries.items,
      },
      discards: {
        totalQuantity: discardTotals[0].total,
        count: discardTotals[0].count,
        recent: recentDiscards.items,
      },
      medicationApplications: {
        count: applications.total,
        recent: applications.items,
      },
    };
  },
};
