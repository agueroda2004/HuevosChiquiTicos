import { useId, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";

import { useDropdown } from "../hooks/useDropdown";
import { cn } from "../utils/cn";
import {
  formatDateLabel,
  formatMonthLabel,
  parseIsoDate,
  toIsoDate,
  todayIso,
} from "../utils/date";

const WEEKDAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  min?: string;
  max?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildMonthDays(viewDate: Date): (Date | null)[] {
  const first = startOfMonth(viewDate);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < offset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), day));
  }
  return cells;
}

export function DatePicker({
  value,
  onChange,
  id,
  placeholder = "Selecciona una fecha",
  min,
  max,
  invalid,
  disabled,
  className,
}: DatePickerProps) {
  const { open, toggle, close, triggerRef, menuRef, position } = useDropdown();
  const menuId = useId();
  const [viewDate, setViewDate] = useState(() =>
    startOfMonth(value ? parseIsoDate(value) : new Date()),
  );

  function handleToggle() {
    if (!open) {
      setViewDate(startOfMonth(value ? parseIsoDate(value) : new Date()));
    }
    toggle();
  }

  const cells = buildMonthDays(viewDate);
  const today = todayIso();

  function isDisabled(iso: string): boolean {
    return Boolean((min && iso < min) || (max && iso > max));
  }

  function select(iso: string) {
    onChange(iso);
    close();
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 text-base text-third outline-none transition focus:ring-2 focus:ring-secondary/30 disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-red-500" : "border-secondary/30 focus:border-secondary",
          className,
        )}
      >
        <span className={cn("truncate", !value && "text-secondary/60")}>
          {value ? formatDateLabel(value) : placeholder}
        </span>
        <CalendarDays className="size-4 shrink-0 text-secondary" />
      </button>

      {open && position
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="dialog"
              style={{
                left: position.left,
                width: position.width,
                top: position.top,
                bottom: position.bottom,
              }}
              className="animate-dropdown-in fixed z-[70] rounded-xl border border-secondary/30 bg-white p-3 shadow-lg"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  aria-label="Mes anterior"
                  onClick={() =>
                    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
                  }
                  className="inline-flex size-8 items-center justify-center rounded-lg text-secondary transition hover:bg-secondary/10 hover:text-third"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="text-sm font-medium text-third">{formatMonthLabel(viewDate)}</span>
                <button
                  type="button"
                  aria-label="Mes siguiente"
                  onClick={() =>
                    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
                  }
                  className="inline-flex size-8 items-center justify-center rounded-lg text-secondary transition hover:bg-secondary/10 hover:text-third"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {WEEKDAYS.map((weekday) => (
                  <span
                    key={weekday}
                    className="flex h-7 items-center justify-center text-xs font-medium text-secondary"
                  >
                    {weekday}
                  </span>
                ))}

                {cells.map((date, index) => {
                  if (!date) {
                    return <span key={`empty-${index}`} />;
                  }

                  const iso = toIsoDate(date);
                  const isSelected = iso === value;
                  const isToday = iso === today;
                  const dayDisabled = isDisabled(iso);

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={dayDisabled}
                      aria-pressed={isSelected}
                      onClick={() => select(iso)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg text-sm transition disabled:cursor-not-allowed disabled:opacity-30",
                        isSelected
                          ? "bg-secondary text-primary"
                          : "text-third hover:bg-secondary/10",
                        !isSelected && isToday ? "border border-secondary text-secondary" : "",
                      )}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 flex justify-between border-t border-secondary/20 pt-2">
                <button
                  type="button"
                  disabled={isDisabled(today)}
                  onClick={() => select(today)}
                  className="rounded-lg px-2 py-1 text-xs font-medium text-secondary transition hover:bg-secondary/10 hover:text-third disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Hoy
                </button>
                {value ? (
                  <button
                    type="button"
                    onClick={() => {
                      onChange("");
                      close();
                    }}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-secondary transition hover:bg-secondary/10 hover:text-third"
                  >
                    Limpiar
                  </button>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
