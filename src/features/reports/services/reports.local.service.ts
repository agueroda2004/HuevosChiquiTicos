import { deathsLocalService } from "../../deaths/services/deaths.local.service";
import { discardsLocalService } from "../../discards/services/discards.local.service";
import { eggCollectionsLocalService } from "../../egg-collections/services/egg-collections.local.service";
import { entriesLocalService } from "../../entries/services/entries.local.service";
import { medicationApplicationsLocalService } from "../../medication-applications/services/medication-applications.local.service";
import type { ProductionReport, ReportsQuery } from "../domain/report";
import type { ReportsPort } from "../domain/report.ports";

// Local storage holds every record, so a large page returns them all.
const ALL_RECORDS = 100000;

function sumQuantity(rows: { quantity: number }[]): number {
  return rows.reduce((total, row) => total + row.quantity, 0);
}

export const reportsLocalService: ReportsPort = {
  async getProductionReport(query: ReportsQuery): Promise<ProductionReport> {
    const recentLimit = query.recentLimit ?? 5;
    const range = { from: query.from, to: query.to, cageId: query.cageId ?? null };

    const [
      eggRows,
      deathRows,
      entryRows,
      discardRows,
      applicationRows,
      recentDeaths,
      recentEntries,
      recentDiscards,
      recentApplications,
    ] = await Promise.all([
      eggCollectionsLocalService.list({
        from: query.from,
        to: query.to,
        cageId: query.cageId,
        page: 1,
        pageSize: ALL_RECORDS,
      }),
      deathsLocalService.list({
        from: query.from,
        to: query.to,
        cageId: query.cageId,
        page: 1,
        pageSize: ALL_RECORDS,
      }),
      entriesLocalService.list({
        from: query.from,
        to: query.to,
        cageId: query.cageId,
        page: 1,
        pageSize: ALL_RECORDS,
      }),
      discardsLocalService.list({
        from: query.from,
        to: query.to,
        cageId: query.cageId,
        page: 1,
        pageSize: ALL_RECORDS,
      }),
      medicationApplicationsLocalService.list({
        from: query.from,
        to: query.to,
        cageId: query.cageId,
        page: 1,
        pageSize: ALL_RECORDS,
      }),
      deathsLocalService.list({ cageId: query.cageId, page: 1, pageSize: recentLimit }),
      entriesLocalService.list({ cageId: query.cageId, page: 1, pageSize: recentLimit }),
      discardsLocalService.list({ cageId: query.cageId, page: 1, pageSize: recentLimit }),
      medicationApplicationsLocalService.list({
        cageId: query.cageId,
        page: 1,
        pageSize: recentLimit,
      }),
    ]);

    const byDate = new Map<string, number>();
    for (const row of eggRows.items) {
      byDate.set(row.collectionDate, (byDate.get(row.collectionDate) ?? 0) + row.quantity);
    }

    const daily = [...byDate.entries()]
      .map(([date, quantity]) => ({ date, quantity }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      range,
      eggCollections: {
        totalEggs: sumQuantity(eggRows.items),
        count: eggRows.total,
        daily,
      },
      deaths: {
        totalQuantity: sumQuantity(deathRows.items),
        count: deathRows.total,
        recent: recentDeaths.items,
      },
      entries: {
        totalQuantity: sumQuantity(entryRows.items),
        count: entryRows.total,
        recent: recentEntries.items,
      },
      discards: {
        totalQuantity: sumQuantity(discardRows.items),
        count: discardRows.total,
        recent: recentDiscards.items,
      },
      medicationApplications: {
        count: applicationRows.total,
        recent: recentApplications.items,
      },
    };
  },
};
