import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  Bill,
  BillsQuery,
  CreateBillInput,
  PaymentInput,
  UpdateBillInput,
} from "./bill";

export interface BillsPort {
  list: (query: BillsQuery) => Promise<PaginatedResult<Bill>>;
  create: (input: CreateBillInput) => Promise<Bill>;
  update: (input: UpdateBillInput) => Promise<Bill>;
  remove: (id: string) => Promise<void>;
  addPayment: (billId: string, input: PaymentInput) => Promise<Bill>;
  removePayment: (billId: string, paymentId: string) => Promise<Bill>;
}
