export type Product = {
  id: string;
  name: string;
  price: number;
  active: boolean;
  imageUrl: string | null;
};

export type CreateProductInput = {
  name: string;
  price: number;
  active: boolean;
  imageUrl: string | null;
};

export type UpdateProductInput = CreateProductInput & {
  id: string;
};

export type ProductStatus = "active" | "inactive";

export type ProductsQuery = {
  search?: string;
  status?: ProductStatus;
  page: number;
  pageSize: number;
};
