export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeSubtotal(quantity: number, unitPrice: number): number {
  return roundCurrency(quantity * unitPrice);
}

export function computeOrderTotal(
  items: { quantity: number; unitPrice: number }[],
): number {
  return roundCurrency(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
}
