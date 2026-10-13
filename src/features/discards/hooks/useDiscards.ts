import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { discardsService } from "../../../config/container";
import type { CreateDiscardInput, DiscardsQuery, UpdateDiscardInput } from "../domain/discard";

const DISCARDS_KEY = "discards";
const CAGES_KEY = "cages";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useDiscards(query: DiscardsQuery) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [DISCARDS_KEY] });
    queryClient.invalidateQueries({ queryKey: [CAGES_KEY] });
  };

  const listQuery = useQuery({
    queryKey: [DISCARDS_KEY, query],
    queryFn: () => discardsService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateDiscardInput) => discardsService.create(input),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateDiscardInput) => discardsService.update(input),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => discardsService.remove(id),
    onSuccess: invalidateAll,
  });

  return {
    records: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createDiscard: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateDiscard: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteDiscard: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
