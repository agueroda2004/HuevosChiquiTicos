import type { ReactNode } from "react";

import { BottomSheet } from "./BottomSheet";

type ConfirmSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  loadingLabel?: string;
  isLoading?: boolean;
};

export function ConfirmSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  loadingLabel = "Eliminando...",
  isLoading = false,
}: ConfirmSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-secondary">{description}</p>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-medium text-secondary transition hover:bg-secondary/10"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
