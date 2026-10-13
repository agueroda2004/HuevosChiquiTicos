import type { ProductionReport, ReportsQuery } from "../types/report.js";

export interface ReportsPort {
  getProductionReport: (query: ReportsQuery) => Promise<ProductionReport>;
}
