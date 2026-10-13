import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type {
  CreateProductInput,
  Product,
  ProductsQuery,
  UpdateProductInput,
} from "../domain/product";
import type { ProductsPort } from "../domain/product.ports";

export const productsHttpService: ProductsPort = {
  list(query: ProductsQuery) {
    const params = new URLSearchParams();
    if (query.search) params.set("search", query.search);
    if (query.status) params.set("status", query.status);
    params.set("page", String(query.page));
    params.set("pageSize", String(query.pageSize));

    return request<PaginatedResult<Product>>(`/api/products?${params.toString()}`);
  },

  create(input: CreateProductInput) {
    return request<Product>("/api/products", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateProductInput) {
    return request<Product>(`/api/products/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        name: input.name,
        price: input.price,
        active: input.active,
        imageUrl: input.imageUrl,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/products/${id}`, { method: "DELETE" });
  },
};
