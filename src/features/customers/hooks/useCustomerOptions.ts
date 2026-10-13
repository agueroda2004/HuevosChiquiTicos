import { useQuery } from "@tanstack/react-query";

import { customersService } from "../../../config/container";

const CUSTOMER_OPTIONS_KEY = ["customers", "options"] as const;

export function useCustomerOptions() {
  const query = useQuery({
    queryKey: CUSTOMER_OPTIONS_KEY,
    queryFn: () => customersService.list({ page: 1, pageSize: 200 }),
  });

  return {
    customers: query.data?.items ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
