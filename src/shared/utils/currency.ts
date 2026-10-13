const crcFormatter = new Intl.NumberFormat("es-CR", {
  style: "currency",
  currency: "CRC",
});

export function formatCurrency(value: number): string {
  return crcFormatter.format(Number.isFinite(value) ? value : 0);
}
