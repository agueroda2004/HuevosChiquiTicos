import type { SupplierStatus } from "./domain/supplier";

export const SUPPLIER_STATUS_OPTIONS: { value: SupplierStatus; label: string }[] = [
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];
