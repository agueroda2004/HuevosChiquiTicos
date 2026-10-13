import { useQuery } from "@tanstack/react-query";

import { ordersService } from "../../../config/container";

const ORDER_OPTIONS_KEY = ["orders", "options"] as const;

export function useOrderOptions() {
  const query = useQuery({
    queryKey: ORDER_OPTIONS_KEY,
    queryFn: () => ordersService.list({ page: 1, pageSize: 200 }),
  });

  return {
    orders: query.data?.items ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
