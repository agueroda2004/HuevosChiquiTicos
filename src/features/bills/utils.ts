import type { BillStatus } from "./domain/bill";

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeSubtotal(quantity: number, unitPrice: number): number {
  return roundCurrency(quantity * unitPrice);
}

export function computeBillTotal(items: { quantity: number; unitPrice: number }[]): number {
  return roundCurrency(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
}

export function computeTotalPaid(payments: { amount: number }[]): number {
  return roundCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0));
}

export function deriveStatus(total: number, totalPaid: number): BillStatus {
  if (totalPaid > 0 && totalPaid >= total) return "paid";
  if (totalPaid > 0) return "partial";
  return "pending";
}
