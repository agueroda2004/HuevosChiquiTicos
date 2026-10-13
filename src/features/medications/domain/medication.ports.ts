import type { CreateMedicationInput, Medication, UpdateMedicationInput } from "./medication";

export interface MedicationsPort {
  list: () => Promise<Medication[]>;
  create: (input: CreateMedicationInput) => Promise<Medication>;
  update: (input: UpdateMedicationInput) => Promise<Medication>;
  remove: (id: string) => Promise<void>;
}
