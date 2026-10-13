import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { customersService } from "../../../config/container";
import type {
  CreateCustomerInput,
  CustomersQuery,
  UpdateCustomerInput,
} from "../domain/customer";

const CUSTOMERS_KEY = "customers";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useCustomers(query: CustomersQuery) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
  };

  const listQuery = useQuery({
    queryKey: [CUSTOMERS_KEY, query],
    queryFn: () => customersService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCustomerInput) => customersService.create(input),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateCustomerInput) => customersService.update(input),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersService.remove(id),
    onSuccess: invalidateAll,
  });

  return {
    customers: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createCustomer: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateCustomer: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteCustomer: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
