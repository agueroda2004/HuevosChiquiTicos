import { useState } from "react";

/**
 * Keeps a local draft of a filter value and only reports it via `apply`.
 * The draft re-syncs when the controlled `value` changes (e.g. a preset or
 * a clear triggered elsewhere) using the render-time state-adjustment pattern.
 */
export function useFilterDraft<T>(value: T, onChange: (value: T) => void) {
  const [draft, setDraft] = useState<T>(value);
  const [previousValue, setPreviousValue] = useState<T>(value);

  if (previousValue !== value) {
    setPreviousValue(value);
    setDraft(value);
  }

  return {
    draft,
    setDraft,
    apply: () => onChange(draft),
  };
}
