import { request } from "../../../shared/utils/http";
import type { AccountingReport, AccountingReportsQuery } from "../domain/accounting-report";
import type { AccountingReportsPort } from "../domain/accounting-report.ports";

export const accountingReportsHttpService: AccountingReportsPort = {
  getAccountingReport(query: AccountingReportsQuery) {
    const params = new URLSearchParams();
    params.set("from", query.from);
    params.set("to", query.to);
    if (query.topLimit) params.set("topLimit", String(query.topLimit));

    return request<AccountingReport>(`/api/accounting/reports?${params.toString()}`);
  },
};
