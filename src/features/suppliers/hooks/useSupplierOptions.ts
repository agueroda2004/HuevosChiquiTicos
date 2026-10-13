import { useQuery } from "@tanstack/react-query";

import { suppliersService } from "../../../config/container";

const SUPPLIER_OPTIONS_KEY = ["suppliers", "options"] as const;

export function useSupplierOptions() {
  const query = useQuery({
    queryKey: SUPPLIER_OPTIONS_KEY,
    queryFn: () => suppliersService.list({ page: 1, pageSize: 200, status: "active" }),
  });

  return {
    suppliers: query.data?.items ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
