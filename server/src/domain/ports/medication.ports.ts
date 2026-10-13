import type { DeleteResult } from "../types/common.js";
import type {
  CreateMedicationDTO,
  Medication,
  UpdateMedicationDTO,
} from "../types/medication.js";

export interface MedicationsPort {
  list: () => Promise<Medication[]>;
  create: (input: CreateMedicationDTO) => Promise<Medication | "duplicate">;
  update: (id: string, input: UpdateMedicationDTO) => Promise<Medication | "not_found" | "duplicate">;
  remove: (id: string) => Promise<DeleteResult>;
}
