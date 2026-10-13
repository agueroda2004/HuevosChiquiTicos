import { request } from "../../../shared/utils/http";
import type { ProductionReport, ReportsQuery } from "../domain/report";
import type { ReportsPort } from "../domain/report.ports";

export const reportsHttpService: ReportsPort = {
  getProductionReport(query: ReportsQuery) {
    const params = new URLSearchParams();
    params.set("from", query.from);
    params.set("to", query.to);
    if (query.cageId) params.set("cageId", query.cageId);
    if (query.recentLimit) params.set("recentLimit", String(query.recentLimit));

    return request<ProductionReport>(`/api/reports?${params.toString()}`);
  },
};
