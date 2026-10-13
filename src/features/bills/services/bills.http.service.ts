import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type {
  Bill,
  BillsQuery,
  CreateBillInput,
  PaymentInput,
  UpdateBillInput,
} from "../domain/bill";
import type { BillsPort } from "../domain/bill.ports";

function buildQuery(query: BillsQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.supplierId) params.set("supplierId", query.supplierId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.includeHidden) params.set("includeHidden", "true");
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

export const billsHttpService: BillsPort = {
  list(query: BillsQuery) {
    return request<PaginatedResult<Bill>>(`/api/bills?${buildQuery(query)}`);
  },

  create(input: CreateBillInput) {
    return request<Bill>("/api/bills", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateBillInput) {
    return request<Bill>(`/api/bills/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        supplierId: input.supplierId,
        supplierNumber: input.supplierNumber,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        items: input.items,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/bills/${id}`, { method: "DELETE" });
  },

  addPayment(billId: string, input: PaymentInput) {
    return request<Bill>(`/api/bills/${billId}/payments`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  removePayment(billId: string, paymentId: string) {
    return request<Bill>(`/api/bills/${billId}/payments/${paymentId}`, {
      method: "DELETE",
    });
  },
};
