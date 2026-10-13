import { useQuery } from "@tanstack/react-query";

import { accountingReportsService } from "../../../config/container";
import type { AccountingReportsQuery } from "../domain/accounting-report";

const ACCOUNTING_REPORTS_KEY = "accounting-reports";

export function useAccountingReport(query: AccountingReportsQuery) {
  const result = useQuery({
    queryKey: [ACCOUNTING_REPORTS_KEY, query],
    queryFn: () => accountingReportsService.getAccountingReport(query),
  });

  return {
    report: result.data ?? null,
    isLoading: result.isLoading,
    error: result.error instanceof Error ? result.error.message : null,
  };
}
