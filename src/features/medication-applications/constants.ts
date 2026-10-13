import type { ApplicationForm } from "./domain/medication-application";

export const APPLICATION_FORM_OPTIONS: { value: ApplicationForm; label: string }[] = [
  { value: "food", label: "Alimento" },
  { value: "water", label: "Agua" },
  { value: "fumigation", label: "Fumigación" },
  { value: "injection", label: "Inyección" },
];

export function getApplicationFormLabel(type: ApplicationForm): string {
  return APPLICATION_FORM_OPTIONS.find((option) => option.value === type)?.label ?? type;
}
