import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type {
  CreateSupplierInput,
  Supplier,
  SuppliersQuery,
  UpdateSupplierInput,
} from "../domain/supplier";
import type { SuppliersPort } from "../domain/supplier.ports";

export const suppliersHttpService: SuppliersPort = {
  list(query: SuppliersQuery) {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    params.set("page", String(query.page));
    params.set("pageSize", String(query.pageSize));

    return request<PaginatedResult<Supplier>>(`/api/suppliers?${params.toString()}`);
  },

  create(input: CreateSupplierInput) {
    return request<Supplier>("/api/suppliers", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateSupplierInput) {
    return request<Supplier>(`/api/suppliers/${input.id}`, {
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
    await request<void>(`/api/suppliers/${id}`, { method: "DELETE" });
  },
};
