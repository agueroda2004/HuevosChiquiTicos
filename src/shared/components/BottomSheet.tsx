import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return createPortal(
    <div
      aria-hidden={!open}
      inert={!open}
      className={`fixed inset-0 z-50 flex items-end justify-center ${
        open ? "" : "pointer-events-none"
      }`}
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className={`absolute inset-0 bg-third/40 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-primary p-6 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-secondary/30" />
        {title && <h2 className="mb-4 text-lg font-semibold text-third">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body,
  );
}
