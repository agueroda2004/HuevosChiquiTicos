import type { DeleteResult, PaginatedResult } from "../types/common.js";
import type {
  CreateProductDTO,
  Product,
  ProductsQuery,
  UpdateProductDTO,
} from "../types/product.js";

export interface ProductsPort {
  list: (query: ProductsQuery) => Promise<PaginatedResult<Product>>;
  create: (input: CreateProductDTO) => Promise<Product | "duplicate">;
  update: (
    id: string,
    input: UpdateProductDTO,
  ) => Promise<Product | "not_found" | "duplicate">;
  remove: (id: string) => Promise<DeleteResult>;
}
