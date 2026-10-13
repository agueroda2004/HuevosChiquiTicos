import { useState } from "react";

import {
  formatDayMonthLabel,
  formatMonthName,
  parseIsoDate,
  toIsoDate,
} from "../../../shared/utils/date";
import type { DailyEggCollection } from "../domain/report";

type Granularity = "day" | "week" | "month";

type EggCollectionsChartProps = {
  daily: DailyEggCollection[];
  yearLabel: string;
};

type Bucket = {
  key: string;
  label: string;
  value: number;
};

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: "day", label: "Día" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
];

function startOfWeek(date: Date): Date {
  const offset = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - offset);
}

function bucketKey(date: Date, granularity: Granularity): string {
  if (granularity === "day") return toIsoDate(date);
  if (granularity === "week") return toIsoDate(startOfWeek(date));
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function bucketLabel(date: Date, granularity: Granularity): string {
  if (granularity === "day") return formatDayMonthLabel(toIsoDate(date));
  if (granularity === "week") return `Sem. ${formatDayMonthLabel(toIsoDate(startOfWeek(date)))}`;
  return formatMonthName(date);
}

function buildBuckets(daily: DailyEggCollection[], granularity: Granularity): Bucket[] {
  const map = new Map<string, Bucket>();

  for (const point of daily) {
    const date = parseIsoDate(point.date);
    const key = bucketKey(date, granularity);
    const existing = map.get(key);

    if (existing) {
      existing.value += point.quantity;
    } else {
      map.set(key, { key, label: bucketLabel(date, granularity), value: point.quantity });
    }
  }

  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function EggCollectionsChart({ daily, yearLabel }: EggCollectionsChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("day");

  const buckets = buildBuckets(daily, granularity);
  const max = buckets.reduce((top, bucket) => Math.max(top, bucket.value), 0);
  const total = buckets.reduce((sum, bucket) => sum + bucket.value, 0);

  return (
    <section className="hidden rounded-2xl border border-secondary/20 bg-white/80 p-4 shadow-sm md:block">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-third">Huevos recolectados</h2>
          <p className="text-xs text-secondary">
            Total en el rango: {total}
            {yearLabel ? ` · ${yearLabel}` : ""}
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-secondary/30 bg-white p-1">
          {GRANULARITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setGranularity(option.value)}
              aria-pressed={granularity === option.value}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                granularity === option.value
                  ? "bg-secondary text-primary"
                  : "text-secondary hover:bg-secondary/10"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {buckets.length === 0 ? (
        <p className="rounded-xl border border-dashed border-secondary/30 bg-white/60 px-3 py-8 text-center text-xs text-secondary">
          No hay recolecciones en el rango seleccionado.
        </p>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {buckets.map((bucket) => {
            const height = max > 0 ? (bucket.value / max) * 100 : 0;

            return (
              <div
                key={bucket.key}
                className="flex min-w-[2.5rem] flex-1 flex-col items-center gap-1"
              >
                <div
                  className="flex h-40 w-full items-end"
                  title={`${bucket.label}: ${bucket.value}`}
                >
                  <div
                    className="w-full rounded-t bg-secondary/70 transition-all"
                    style={{ height: `${height}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium text-third">{bucket.value}</span>
                <span className="whitespace-nowrap text-[10px] text-secondary">
                  {bucket.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
