export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;
  name: string;
  price: number;
  active: boolean;
  imageUrl: string | null;
}

export interface CreateProductDTO {
  name: string;
  price: number;
  active: boolean;
  imageUrl: string | null;
}

export type UpdateProductDTO = CreateProductDTO;

export interface ProductsQuery {
  search?: string;
  status?: ProductStatus;
  page: number;
  pageSize: number;
}
