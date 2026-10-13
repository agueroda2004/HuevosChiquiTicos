export type AccountingListRow = {
  id: string;
  title: string;
  subtitle?: string;
  value: string;
};

type AccountingListCardProps = {
  title: string;
  rows: AccountingListRow[];
  emptyLabel?: string;
};

export function AccountingListCard({
  title,
  rows,
  emptyLabel = "Sin datos.",
}: AccountingListCardProps) {
  return (
    <section className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-third">{title}</h2>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-secondary/30 bg-white/60 px-3 py-4 text-center text-xs text-secondary">
          {emptyLabel}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex items-center gap-3 rounded-xl border border-secondary/15 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-third">{row.title}</p>
                {row.subtitle && (
                  <p className="truncate text-xs text-secondary">{row.subtitle}</p>
                )}
              </div>
              <span className="shrink-0 text-sm font-semibold text-secondary">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
