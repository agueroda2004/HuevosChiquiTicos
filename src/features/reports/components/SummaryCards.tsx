import type { ProductionReport } from "../domain/report";

type SummaryCardsProps = {
  report: ProductionReport;
};

type Card = {
  label: string;
  value: string;
  hint: string;
};

export function SummaryCards({ report }: SummaryCardsProps) {
  const cards: Card[] = [
    {
      label: "Huevos recolectados",
      value: String(report.eggCollections.totalEggs),
      hint: `${report.eggCollections.count} recolecciones`,
    },
    {
      label: "Muertes",
      value: String(report.deaths.totalQuantity),
      hint: `${report.deaths.count} registros`,
    },
    {
      label: "Entradas",
      value: String(report.entries.totalQuantity),
      hint: `${report.entries.count} registros`,
    },
    {
      label: "Desechos",
      value: String(report.discards.totalQuantity),
      hint: `${report.discards.count} registros`,
    },
    {
      label: "Aplicaciones",
      value: String(report.medicationApplications.count),
      hint: "medicamentos aplicados",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm"
        >
          <p className="text-xs text-secondary">{card.label}</p>
          <p className="mt-1 text-2xl font-semibold text-third">{card.value}</p>
          <p className="mt-0.5 text-[11px] text-secondary">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
