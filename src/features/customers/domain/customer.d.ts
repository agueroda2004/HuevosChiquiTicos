export type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
};

export type CreateCustomerInput = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
};

export type UpdateCustomerInput = CreateCustomerInput & {
  id: string;
};

export type CustomerStatus = "active" | "inactive";

export type CustomersQuery = {
  search?: string;
  status?: CustomerStatus;
  page: number;
  pageSize: number;
};
