import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { suppliersService } from "../../../config/container";
import type {
  CreateSupplierInput,
  SuppliersQuery,
  UpdateSupplierInput,
} from "../domain/supplier";

const SUPPLIERS_KEY = "suppliers";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useSuppliers(query: SuppliersQuery) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] });
  };

  const listQuery = useQuery({
    queryKey: [SUPPLIERS_KEY, query],
    queryFn: () => suppliersService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateSupplierInput) => suppliersService.create(input),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateSupplierInput) => suppliersService.update(input),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => suppliersService.remove(id),
    onSuccess: invalidateAll,
  });

  return {
    suppliers: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createSupplier: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateSupplier: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteSupplier: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
