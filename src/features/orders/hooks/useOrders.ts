import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ordersService } from "../../../config/container";
import type { CreateOrderInput, OrdersQuery, UpdateOrderInput } from "../domain/order";

const ORDERS_KEY = "orders";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useOrders(query: OrdersQuery) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [ORDERS_KEY] });
  };

  const listQuery = useQuery({
    queryKey: [ORDERS_KEY, query],
    queryFn: () => ordersService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateOrderInput) => ordersService.create(input),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateOrderInput) => ordersService.update(input),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ordersService.remove(id),
    onSuccess: invalidateAll,
  });

  return {
    orders: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createOrder: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateOrder: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteOrder: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
