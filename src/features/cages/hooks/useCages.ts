import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cagesService } from "../../../config/container";
import type { Cage, CreateCageInput, UpdateCageInput } from "../domain/cage";

const CAGES_QUERY_KEY = ["cages"] as const;

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useCages() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: CAGES_QUERY_KEY,
    queryFn: () => cagesService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateCageInput) => cagesService.create(input),
    onSuccess: (cage) => {
      queryClient.setQueryData<Cage[]>(CAGES_QUERY_KEY, (current) =>
        current ? [...current, cage] : [cage],
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateCageInput) => cagesService.update(input),
    onSuccess: (cage) => {
      queryClient.setQueryData<Cage[]>(CAGES_QUERY_KEY, (current) =>
        current ? current.map((item) => (item.id === cage.id ? cage : item)) : [cage],
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cagesService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Cage[]>(CAGES_QUERY_KEY, (current) =>
        current ? current.filter((item) => item.id !== id) : current,
      );
    },
  });

  return {
    cages: query.data ?? [],
    isLoading: query.isLoading,
    error: toMessage(query.error),
    createCage: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateCage: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteCage: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
