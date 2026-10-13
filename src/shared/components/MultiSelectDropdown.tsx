import { useId } from "react";
import { Check, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

import { useDropdown } from "../hooks/useDropdown";
import { cn } from "../utils/cn";

export interface MultiSelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface MultiSelectDropdownProps<T extends string = string> {
  values: T[];
  options: MultiSelectOption<T>[];
  onChange: (values: T[]) => void;
  placeholder?: string;
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MultiSelectDropdown<T extends string = string>({
  values,
  options,
  onChange,
  placeholder = "Selecciona...",
  id,
  invalid,
  disabled,
  className,
}: MultiSelectDropdownProps<T>) {
  const { open, toggle, triggerRef, menuRef, position } = useDropdown();
  const menuId = useId();
  const selected = options.filter((option) => values.includes(option.value));
  const triggerLabel =
    selected.length === 0
      ? null
      : selected.length === 1
        ? selected[0].label
        : `${selected.length} seleccionadas`;

  const handleToggleValue = (value: T) => {
    if (values.includes(value)) {
      onChange(values.filter((item) => item !== value));
      return;
    }

    onChange([...values, value]);
  };

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        onClick={toggle}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 text-base text-third outline-none transition focus:ring-2 focus:ring-secondary/30 disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-red-500" : "border-secondary/30 focus:border-secondary",
          className,
        )}
      >
        <span className={cn("truncate", !triggerLabel && "text-secondary/60")}>
          {triggerLabel ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-secondary transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && position
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="listbox"
              aria-multiselectable
              style={{
                left: position.left,
                width: position.width,
                top: position.top,
                bottom: position.bottom,
              }}
              className="animate-dropdown-in fixed z-[70] max-h-60 overflow-y-auto rounded-xl border border-secondary/30 bg-white p-1 shadow-lg"
            >
              {options.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleToggleValue(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                      isSelected
                        ? "bg-secondary/15 text-third"
                        : "text-secondary hover:bg-secondary/10 hover:text-third",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border transition",
                        isSelected
                          ? "border-secondary bg-secondary text-primary"
                          : "border-secondary/40",
                      )}
                    >
                      {isSelected ? <Check className="size-3" /> : null}
                    </span>
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
