import type { DeleteResult, PaginatedResult } from "../types/common.js";
import type {
  CreateCustomerDTO,
  Customer,
  CustomersQuery,
  UpdateCustomerDTO,
} from "../types/customer.js";

export interface CustomersPort {
  list: (query: CustomersQuery) => Promise<PaginatedResult<Customer>>;
  create: (input: CreateCustomerDTO) => Promise<Customer | "duplicate">;
  update: (
    id: string,
    input: UpdateCustomerDTO,
  ) => Promise<Customer | "not_found" | "duplicate">;
  remove: (id: string) => Promise<DeleteResult>;
}
