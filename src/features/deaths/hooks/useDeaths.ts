import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { deathsService } from "../../../config/container";
import type { CreateDeathInput, DeathsQuery, UpdateDeathInput } from "../domain/death";

const DEATHS_KEY = "deaths";
const CAGES_KEY = "cages";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useDeaths(query: DeathsQuery) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [DEATHS_KEY] });
    queryClient.invalidateQueries({ queryKey: [CAGES_KEY] });
  };

  const listQuery = useQuery({
    queryKey: [DEATHS_KEY, query],
    queryFn: () => deathsService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateDeathInput) => deathsService.create(input),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateDeathInput) => deathsService.update(input),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deathsService.remove(id),
    onSuccess: invalidateAll,
  });

  return {
    records: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createDeath: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateDeath: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteDeath: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
