import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateCustomerInput,
  Customer,
  CustomersQuery,
  UpdateCustomerInput,
} from "./customer";

export interface CustomersPort {
  list: (query: CustomersQuery) => Promise<PaginatedResult<Customer>>;
  create: (input: CreateCustomerInput) => Promise<Customer>;
  update: (input: UpdateCustomerInput) => Promise<Customer>;
  remove: (id: string) => Promise<void>;
}
