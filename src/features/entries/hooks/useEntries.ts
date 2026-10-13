import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { entriesService } from "../../../config/container";
import type { CreateEntryInput, EntriesQuery, UpdateEntryInput } from "../domain/entry";

const ENTRIES_KEY = "entries";
const CAGES_KEY = "cages";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useEntries(query: EntriesQuery) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [ENTRIES_KEY] });
    queryClient.invalidateQueries({ queryKey: [CAGES_KEY] });
  };

  const listQuery = useQuery({
    queryKey: [ENTRIES_KEY, query],
    queryFn: () => entriesService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateEntryInput) => entriesService.create(input),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateEntryInput) => entriesService.update(input),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => entriesService.remove(id),
    onSuccess: invalidateAll,
  });

  return {
    records: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createEntry: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateEntry: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteEntry: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
