export type RecentListItem = {
  id: string;
  title: string;
  subtitle: string;
  trailing?: string;
};

type RecentListProps = {
  title: string;
  items: RecentListItem[];
  emptyLabel?: string;
};

export function RecentList({ title, items, emptyLabel = "Sin registros." }: RecentListProps) {
  return (
    <section className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-third">{title}</h2>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-secondary/30 bg-white/60 px-3 py-4 text-center text-xs text-secondary">
          {emptyLabel}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-secondary/15 bg-white p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-third">{item.title}</p>
                <p className="truncate text-xs text-secondary">{item.subtitle}</p>
              </div>
              {item.trailing && (
                <span className="shrink-0 text-sm font-semibold text-secondary">
                  {item.trailing}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
