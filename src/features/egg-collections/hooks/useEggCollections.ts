import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { eggCollectionsService } from "../../../config/container";
import type {
  CreateEggCollectionInput,
  EggCollectionsQuery,
  UpdateEggCollectionInput,
} from "../domain/egg-collection";

const EGG_COLLECTIONS_KEY = "egg-collections";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useEggCollections(query: EggCollectionsQuery) {
  const queryClient = useQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: [EGG_COLLECTIONS_KEY] });

  const listQuery = useQuery({
    queryKey: [EGG_COLLECTIONS_KEY, query],
    queryFn: () => eggCollectionsService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateEggCollectionInput) => eggCollectionsService.create(input),
    onSuccess: invalidateList,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateEggCollectionInput) => eggCollectionsService.update(input),
    onSuccess: invalidateList,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => eggCollectionsService.remove(id),
    onSuccess: invalidateList,
  });

  return {
    records: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createRecord: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateRecord: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteRecord: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
