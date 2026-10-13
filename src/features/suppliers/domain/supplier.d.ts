export type Supplier = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
};

export type CreateSupplierInput = {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
};

export type UpdateSupplierInput = CreateSupplierInput & {
  id: string;
};

export type SupplierStatus = "active" | "inactive";

export type SuppliersQuery = {
  search?: string;
  status?: SupplierStatus;
  page: number;
  pageSize: number;
};
