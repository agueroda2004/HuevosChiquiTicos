import { formatCurrency } from "../../../shared/utils/currency";
import type { AccountingReport } from "../domain/accounting-report";

type AccountingSummaryCardsProps = {
  report: AccountingReport;
};

type Card = {
  label: string;
  value: string;
  hint: string;
  tone?: "positive" | "negative" | "neutral";
};

export function AccountingSummaryCards({ report }: AccountingSummaryCardsProps) {
  const { receivables, payables, cashFlow } = report;

  const cards: Card[] = [
    {
      label: "Por cobrar",
      value: formatCurrency(receivables.outstanding),
      hint: `Vencido: ${formatCurrency(receivables.overdue)}`,
    },
    {
      label: "Por pagar",
      value: formatCurrency(payables.outstanding),
      hint: `Vencido: ${formatCurrency(payables.overdue)}`,
    },
    {
      label: "Cobrado",
      value: formatCurrency(cashFlow.income),
      hint: "en el rango",
    },
    {
      label: "Pagado",
      value: formatCurrency(cashFlow.expense),
      hint: "en el rango",
    },
    {
      label: "Neto",
      value: formatCurrency(cashFlow.net),
      hint: "cobrado − pagado",
      tone: cashFlow.net > 0 ? "positive" : cashFlow.net < 0 ? "negative" : "neutral",
    },
  ];

  const toneClass = (tone: Card["tone"]) =>
    tone === "positive" ? "text-emerald-600" : tone === "negative" ? "text-red-600" : "text-third";

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm"
        >
          <p className="text-xs text-secondary">{card.label}</p>
          <p className={`mt-1 text-lg font-semibold ${toneClass(card.tone)}`}>{card.value}</p>
          <p className="mt-0.5 text-[11px] text-secondary">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
