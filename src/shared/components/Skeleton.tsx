import type { HTMLAttributes } from "react";

export function Skeleton({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={`animate-pulse rounded-lg bg-secondary/15 ${className}`} />;
}
