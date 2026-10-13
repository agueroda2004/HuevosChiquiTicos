import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { medicationApplicationsService } from "../../../config/container";
import type {
  CreateMedicationApplicationInput,
  MedicationApplicationsQuery,
  UpdateMedicationApplicationInput,
} from "../domain/medication-application";

const APPLICATIONS_KEY = "medication-applications";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useMedicationApplications(query: MedicationApplicationsQuery) {
  const queryClient = useQueryClient();

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: [APPLICATIONS_KEY] });

  const listQuery = useQuery({
    queryKey: [APPLICATIONS_KEY, query],
    queryFn: () => medicationApplicationsService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateMedicationApplicationInput) =>
      medicationApplicationsService.create(input),
    onSuccess: invalidateList,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateMedicationApplicationInput) =>
      medicationApplicationsService.update(input),
    onSuccess: invalidateList,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => medicationApplicationsService.remove(id),
    onSuccess: invalidateList,
  });

  return {
    records: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createApplication: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateApplication: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteApplication: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
  };
}
