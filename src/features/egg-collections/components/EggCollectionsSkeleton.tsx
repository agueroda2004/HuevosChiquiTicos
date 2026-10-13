import { Skeleton } from "../../../shared/components/Skeleton";

export function EggCollectionsSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm"
        >
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-14" />
        </li>
      ))}
    </ul>
  );
}
