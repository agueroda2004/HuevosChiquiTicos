import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoicesQuery,
  PaymentInput,
  UpdateInvoiceInput,
} from "./invoice";

export interface InvoicesPort {
  list: (query: InvoicesQuery) => Promise<PaginatedResult<Invoice>>;
  create: (input: CreateInvoiceInput) => Promise<Invoice>;
  update: (input: UpdateInvoiceInput) => Promise<Invoice>;
  remove: (id: string) => Promise<void>;
  addPayment: (invoiceId: string, input: PaymentInput) => Promise<Invoice>;
  removePayment: (invoiceId: string, paymentId: string) => Promise<Invoice>;
}
