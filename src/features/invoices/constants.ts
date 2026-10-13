import type { InvoiceStatus, PaymentMethod } from "./domain/invoice";

export const INVOICE_STATUS_OPTIONS: { value: InvoiceStatus; label: string }[] = [
  { value: "pending", label: "Pendiente" },
  { value: "partial", label: "Parcial" },
  { value: "paid", label: "Pagada" },
];

export const INVOICE_STATUS_BADGE_CLASS: Record<InvoiceStatus, string> = {
  pending: "bg-amber-100 text-amber-700",
  partial: "bg-blue-100 text-blue-700",
  paid: "bg-emerald-100 text-emerald-700",
};

export function getInvoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "card", label: "Tarjeta" },
  { value: "check", label: "Cheque" },
  { value: "other", label: "Otro" },
];

export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.label ?? method;
}
