import type { CustomerStatus } from "./domain/customer";

export const CUSTOMER_STATUS_OPTIONS: { value: CustomerStatus; label: string }[] = [
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];
