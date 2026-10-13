export type CustomerStatus = "active" | "inactive";

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

export interface CreateCustomerDTO {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

export type UpdateCustomerDTO = CreateCustomerDTO;

export interface CustomersQuery {
  search?: string;
  status?: CustomerStatus;
  page: number;
  pageSize: number;
}
