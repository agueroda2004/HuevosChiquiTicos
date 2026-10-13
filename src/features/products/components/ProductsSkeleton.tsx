import { Skeleton } from "../../../shared/components/Skeleton";

export function ProductsSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <li
          key={index}
          className="flex flex-col overflow-hidden rounded-2xl border border-secondary/20 bg-white/80 shadow-sm"
        >
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="mt-2 h-8 w-full rounded-xl" />
          </div>
        </li>
      ))}
    </ul>
  );
}
