import { Skeleton } from "../../../shared/components/Skeleton";

export function AccountingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm"
          >
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="mt-2 h-6 w-1/2" />
            <Skeleton className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-56 rounded-xl" />
        </div>
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm"
          >
            <Skeleton className="h-4 w-32" />
            <div className="mt-3 flex flex-col gap-2">
              {Array.from({ length: 5 }).map((__, row) => (
                <Skeleton key={row} className="h-12 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
