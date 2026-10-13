import { useQuery } from "@tanstack/react-query";

import { reportsService } from "../../../config/container";
import type { ReportsQuery } from "../domain/report";

const REPORTS_KEY = "reports";

export function useProductionReport(query: ReportsQuery) {
  const result = useQuery({
    queryKey: [REPORTS_KEY, query],
    queryFn: () => reportsService.getProductionReport(query),
  });

  return {
    report: result.data ?? null,
    isLoading: result.isLoading,
    error: result.error instanceof Error ? result.error.message : null,
  };
}
