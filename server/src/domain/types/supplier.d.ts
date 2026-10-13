export type SupplierStatus = "active" | "inactive";

export interface Supplier {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

export interface CreateSupplierDTO {
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  active: boolean;
}

export type UpdateSupplierDTO = CreateSupplierDTO;

export interface SuppliersQuery {
  search?: string;
  status?: SupplierStatus;
  page: number;
  pageSize: number;
}
