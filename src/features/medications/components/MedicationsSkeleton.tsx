import { Skeleton } from "../../../shared/components/Skeleton";

export function MedicationsSkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <li
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm"
        >
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-14 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
