import { useQuery } from "@tanstack/react-query";

import { productsService } from "../../../config/container";

const PRODUCT_OPTIONS_KEY = ["products", "options"] as const;

export function useProductOptions() {
  const query = useQuery({
    queryKey: PRODUCT_OPTIONS_KEY,
    queryFn: () => productsService.list({ page: 1, pageSize: 200 }),
  });

  return {
    products: query.data?.items ?? [],
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
