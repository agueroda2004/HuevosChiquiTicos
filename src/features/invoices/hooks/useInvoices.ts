import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { invoicesService } from "../../../config/container";
import type {
  CreateInvoiceInput,
  InvoicesQuery,
  PaymentInput,
  UpdateInvoiceInput,
} from "../domain/invoice";

const INVOICES_KEY = "invoices";

function toMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

export function useInvoices(query: InvoicesQuery) {
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: [INVOICES_KEY] });
  };

  const listQuery = useQuery({
    queryKey: [INVOICES_KEY, query],
    queryFn: () => invoicesService.list(query),
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateInvoiceInput) => invoicesService.create(input),
    onSuccess: invalidateAll,
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateInvoiceInput) => invoicesService.update(input),
    onSuccess: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => invoicesService.remove(id),
    onSuccess: invalidateAll,
  });

  const addPaymentMutation = useMutation({
    mutationFn: ({ invoiceId, input }: { invoiceId: string; input: PaymentInput }) =>
      invoicesService.addPayment(invoiceId, input),
    onSuccess: invalidateAll,
  });

  const removePaymentMutation = useMutation({
    mutationFn: ({ invoiceId, paymentId }: { invoiceId: string; paymentId: string }) =>
      invoicesService.removePayment(invoiceId, paymentId),
    onSuccess: invalidateAll,
  });

  return {
    invoices: listQuery.data?.items ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    error: toMessage(listQuery.error),
    createInvoice: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    createError: toMessage(createMutation.error),
    resetCreateError: createMutation.reset,
    updateInvoice: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    updateError: toMessage(updateMutation.error),
    resetUpdateError: updateMutation.reset,
    deleteInvoice: deleteMutation.mutateAsync,
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
