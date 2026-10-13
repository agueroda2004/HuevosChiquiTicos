import type { DeleteResult, PaginatedResult } from "../types/common.js";
import type {
  CreateSupplierDTO,
  Supplier,
  SuppliersQuery,
  UpdateSupplierDTO,
} from "../types/supplier.js";

export interface SuppliersPort {
  list: (query: SuppliersQuery) => Promise<PaginatedResult<Supplier>>;
  create: (input: CreateSupplierDTO) => Promise<Supplier | "duplicate">;
  update: (
    id: string,
    input: UpdateSupplierDTO,
  ) => Promise<Supplier | "not_found" | "duplicate">;
  remove: (id: string) => Promise<DeleteResult>;
}
