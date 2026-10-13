import { useId } from "react";
import { Check, ChevronDown } from "lucide-react";
import { createPortal } from "react-dom";

import { useDropdown } from "../hooks/useDropdown";
import { cn } from "../utils/cn";

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string = string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  id?: string;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Dropdown<T extends string = string>({
  value,
  options,
  onChange,
  placeholder = "Selecciona...",
  id,
  invalid,
  disabled,
  className,
}: DropdownProps<T>) {
  const { open, toggle, close, triggerRef, menuRef, position } = useDropdown();
  const menuId = useId();
  const selected = options.find((option) => option.value === value);

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
          "flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-4 py-3 text-sm text-third outline-none transition focus:ring-2 focus:ring-secondary/30 disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-red-500" : "border-secondary/30 focus:border-secondary",
          className,
        )}
      >
        <span className={cn("truncate", !selected && "text-secondary/60")}>
          {selected ? selected.label : placeholder}
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
              style={{
                left: position.left,
                width: position.width,
                top: position.top,
                bottom: position.bottom,
              }}
              className="animate-dropdown-in fixed z-[70] max-h-60 overflow-y-auto rounded-xl border border-secondary/30 bg-white p-1 shadow-lg"
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      close();
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                      isSelected
                        ? "bg-secondary/15 text-third"
                        : "text-secondary hover:bg-secondary/10 hover:text-third",
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? <Check className="size-4 shrink-0" /> : null}
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
