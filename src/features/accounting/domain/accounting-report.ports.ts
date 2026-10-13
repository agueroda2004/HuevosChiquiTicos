import type { AccountingReport, AccountingReportsQuery } from "./accounting-report";

export interface AccountingReportsPort {
  getAccountingReport: (query: AccountingReportsQuery) => Promise<AccountingReport>;
}
