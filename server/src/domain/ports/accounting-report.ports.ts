import type {
  AccountingReport,
  AccountingReportsQuery,
} from "../types/accounting-report.js";

export interface AccountingReportsPort {
  getAccountingReport: (query: AccountingReportsQuery) => Promise<AccountingReport>;
}
