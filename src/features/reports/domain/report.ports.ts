import type { ProductionReport, ReportsQuery } from "./report";

export interface ReportsPort {
  getProductionReport: (query: ReportsQuery) => Promise<ProductionReport>;
}
