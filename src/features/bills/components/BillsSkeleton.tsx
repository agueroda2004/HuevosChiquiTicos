import { Skeleton } from "../../../shared/components/Skeleton";

export function BillsSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <li
          key={index}
          className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Skeleton className="h-8 w-40 rounded-xl" />
          </div>
        </li>
      ))}
    </ul>
  );
}
