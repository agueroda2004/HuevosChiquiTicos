import type { DeathType } from "./domain/death";

export const DEATH_TYPE_OPTIONS: { value: DeathType; label: string }[] = [
  { value: "sacrifice", label: "Sacrificio" },
  { value: "disease", label: "Enfermedad" },
  { value: "other", label: "Otras" },
];

export function getDeathTypeLabel(type: DeathType): string {
  return DEATH_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}
