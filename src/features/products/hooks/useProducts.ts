import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { productsService } from "../../../config/container";
import type {
  CreateProductInput,
  ProductsQuery,
  UpdateProductInput,
} from "../domain/product";

const PRODUCTS_KEY = "products";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useProducts(query: ProductsQuery) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
  };

  const listQuery = useQuery({
    queryKey: [PRODUCTS_KEY, query],
    queryFn: () => productsService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateProductInput) => productsService.create(input),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateProductInput) => productsService.update(input),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsService.remove(id),
    onSuccess: invalidateAll,
  });

  return {
    products: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
