import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type {
  CreateCustomerInput,
  Customer,
  CustomersQuery,
  UpdateCustomerInput,
} from "../domain/customer";
import type { CustomersPort } from "../domain/customer.ports";

export const customersHttpService: CustomersPort = {
  list(query: CustomersQuery) {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    params.set("page", String(query.page));
    params.set("pageSize", String(query.pageSize));

    return request<PaginatedResult<Customer>>(`/api/customers?${params.toString()}`);
  },

  create(input: CreateCustomerInput) {
    return request<Customer>("/api/customers", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateCustomerInput) {
    return request<Customer>(`/api/customers/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        phone: input.phone,
        address: input.address,
        active: input.active,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/customers/${id}`, { method: "DELETE" });
  },
};
