import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateSupplierInput,
  Supplier,
  SuppliersQuery,
  UpdateSupplierInput,
} from "./supplier";

export interface SuppliersPort {
  list: (query: SuppliersQuery) => Promise<PaginatedResult<Supplier>>;
  create: (input: CreateSupplierInput) => Promise<Supplier>;
  update: (input: UpdateSupplierInput) => Promise<Supplier>;
  remove: (id: string) => Promise<void>;
}
