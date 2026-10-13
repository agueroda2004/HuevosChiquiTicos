import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoicesQuery,
  PaymentInput,
  UpdateInvoiceInput,
} from "../domain/invoice";
import type { InvoicesPort } from "../domain/invoice.ports";

function buildQuery(query: InvoicesQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status) params.set("status", query.status);
  if (query.customerId) params.set("customerId", query.customerId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.includeHidden) params.set("includeHidden", "true");
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

export const invoicesHttpService: InvoicesPort = {
  list(query: InvoicesQuery) {
    return request<PaginatedResult<Invoice>>(`/api/invoices?${buildQuery(query)}`);
  },

  create(input: CreateInvoiceInput) {
    return request<Invoice>("/api/invoices", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateInvoiceInput) {
    return request<Invoice>(`/api/invoices/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        customerId: input.customerId,
        orderId: input.orderId,
        issueDate: input.issueDate,
        dueDate: input.dueDate,
        items: input.items,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/invoices/${id}`, { method: "DELETE" });
  },

  addPayment(invoiceId: string, input: PaymentInput) {
    return request<Invoice>(`/api/invoices/${invoiceId}/payments`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  removePayment(invoiceId: string, paymentId: string) {
    return request<Invoice>(`/api/invoices/${invoiceId}/payments/${paymentId}`, {
      method: "DELETE",
    });
  },
};
