import { Skeleton } from "../../../shared/components/Skeleton";

export function CagesSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <Skeleton className="mt-4 h-3 w-16" />
        </li>
      ))}
    </ul>
  );
}
