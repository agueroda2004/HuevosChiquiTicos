import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  const buttonClassName =
    "inline-flex size-8 items-center justify-center rounded-lg border border-secondary/30 text-secondary transition hover:bg-secondary/10 hover:text-third disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <p className="text-xs text-secondary">
        Mostrando {first}–{last} de {total}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className={buttonClassName}
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-xs text-secondary">
          Página {page} de {totalPages}
        </span>
        <button
          type="button"
          aria-label="Página siguiente"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className={buttonClassName}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
