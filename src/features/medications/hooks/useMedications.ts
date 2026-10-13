import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { medicationsService } from "../../../config/container";
import type {
  CreateMedicationInput,
  Medication,
  UpdateMedicationInput,
} from "../domain/medication";

const MEDICATIONS_QUERY_KEY = ["medications"] as const;

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useMedications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: MEDICATIONS_QUERY_KEY,
    queryFn: () => medicationsService.list(),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateMedicationInput) => medicationsService.create(input),
    onSuccess: (medication) => {
      queryClient.setQueryData<Medication[]>(MEDICATIONS_QUERY_KEY, (current) =>
        current ? [...current, medication] : [medication],
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateMedicationInput) => medicationsService.update(input),
    onSuccess: (medication) => {
      queryClient.setQueryData<Medication[]>(MEDICATIONS_QUERY_KEY, (current) =>
        current ? current.map((item) => (item.id === medication.id ? medication : item)) : [medication],
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicationsService.remove(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Medication[]>(MEDICATIONS_QUERY_KEY, (current) =>
        current ? current.filter((item) => item.id !== id) : current,
      );
    },
  });

  return {
    medications: query.data ?? [],
    isLoading: query.isLoading,
    error: toMessage(query.error),
    createMedication: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateMedication: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteMedication: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
