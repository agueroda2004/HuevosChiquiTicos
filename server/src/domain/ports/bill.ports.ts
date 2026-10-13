import type { PaginatedResult } from "../types/common.js";
import type {
  Bill,
  BillsQuery,
  CreateBillDTO,
  UpdateBillDTO,
} from "../types/bill.js";
import type { CreatePaymentDTO } from "../types/payment.js";

export interface BillsPort {
  list: (query: BillsQuery) => Promise<PaginatedResult<Bill>>;
  create: (input: CreateBillDTO) => Promise<Bill | "not_found">;
  update: (
    id: string,
    input: UpdateBillDTO,
  ) => Promise<Bill | "not_found" | "paid" | "items_locked">;
  remove: (id: string) => Promise<boolean>;
  addPayment: (
    id: string,
    input: CreatePaymentDTO,
  ) => Promise<Bill | "not_found" | "paid" | "overpaid">;
  removePayment: (
    id: string,
    paymentId: string,
  ) => Promise<Bill | "not_found" | "payment_not_found">;
}
