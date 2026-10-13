import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateProductInput,
  Product,
  ProductsQuery,
  UpdateProductInput,
} from "./product";

export interface ProductsPort {
  list: (query: ProductsQuery) => Promise<PaginatedResult<Product>>;
  create: (input: CreateProductInput) => Promise<Product>;
  update: (input: UpdateProductInput) => Promise<Product>;
  remove: (id: string) => Promise<void>;
}
