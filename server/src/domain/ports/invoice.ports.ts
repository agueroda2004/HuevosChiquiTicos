import type { PaginatedResult } from "../types/common.js";
import type {
  CreateInvoiceDTO,
  Invoice,
  InvoicesQuery,
  UpdateInvoiceDTO,
} from "../types/invoice.js";
import type { CreatePaymentDTO } from "../types/payment.js";

export interface InvoicesPort {
  list: (query: InvoicesQuery) => Promise<PaginatedResult<Invoice>>;
  create: (input: CreateInvoiceDTO) => Promise<Invoice | "not_found">;
  update: (
    id: string,
    input: UpdateInvoiceDTO,
  ) => Promise<Invoice | "not_found" | "paid" | "items_locked">;
  remove: (id: string) => Promise<boolean>;
  addPayment: (
    id: string,
    input: CreatePaymentDTO,
  ) => Promise<Invoice | "not_found" | "paid" | "overpaid">;
  removePayment: (
    id: string,
    paymentId: string,
  ) => Promise<Invoice | "not_found" | "payment_not_found">;
}
