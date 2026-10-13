import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { billsService } from "../../../config/container";
import type {
  BillsQuery,
  CreateBillInput,
  PaymentInput,
  UpdateBillInput,
} from "../domain/bill";

const BILLS_KEY = "bills";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useBills(query: BillsQuery) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [BILLS_KEY] });
  };

  const listQuery = useQuery({
    queryKey: [BILLS_KEY, query],
    queryFn: () => billsService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateBillInput) => billsService.create(input),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateBillInput) => billsService.update(input),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => billsService.remove(id),
    onSuccess: invalidateAll,
  });

  const addPaymentMutation = useMutation({
    mutationFn: ({ billId, input }: { billId: string; input: PaymentInput }) =>
      billsService.addPayment(billId, input),
    onSuccess: invalidateAll,
  });

  const removePaymentMutation = useMutation({
    mutationFn: ({ billId, paymentId }: { billId: string; paymentId: string }) =>
      billsService.removePayment(billId, paymentId),
    onSuccess: invalidateAll,
  });

  return {
    bills: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createBill: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateBill: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteBill: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteError: toMessage(deleteMutation.error),
    resetDeleteError: deleteMutation.reset,
    addPayment: addPaymentMutation.mutateAsync,
    isAddingPayment: addPaymentMutation.isPending,
    addPaymentError: toMessage(addPaymentMutation.error),
    resetAddPaymentError: addPaymentMutation.reset,
    removePayment: removePaymentMutation.mutateAsync,
    isRemovingPayment: removePaymentMutation.isPending,
    removePaymentError: toMessage(removePaymentMutation.error),
    resetRemovePaymentError: removePaymentMutation.reset,
  };
}
