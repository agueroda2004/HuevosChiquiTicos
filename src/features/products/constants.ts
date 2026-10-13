import type { ProductStatus } from "./domain/product";

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];
