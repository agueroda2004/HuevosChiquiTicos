import type { InvoiceStatus } from "../domain/types/invoice.js";

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeSubtotal(quantity: number, unitPrice: number): number {
  return roundCurrency(quantity * unitPrice);
}

export function computeTotal(items: { quantity: number; unitPrice: number }[]): number {
  return roundCurrency(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
}

export function computeTotalPaid(payments: { amount: number }[]): number {
  return roundCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0));
}

export function deriveStatus(total: number, totalPaid: number): InvoiceStatus {
  if (totalPaid > 0 && totalPaid >= total) return "paid";
  if (totalPaid > 0) return "partial";
  return "pending";
}

export function nextNumber(prefix: string, numbers: string[]): string {
  const last = numbers.reduce((max, value) => {
    const match = new RegExp(`^${prefix}-(\\d+)$`).exec(value);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `${prefix}-${String(last + 1).padStart(4, "0")}`;
}
