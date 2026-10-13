import type { PaginatedResult } from "../types/common.js";
import type {
  CreateMedicationApplicationDTO,
  MedicationApplication,
  MedicationApplicationsQuery,
  UpdateMedicationApplicationDTO,
} from "../types/medication-application.js";

export interface MedicationApplicationsPort {
  list: (
    query: MedicationApplicationsQuery,
  ) => Promise<PaginatedResult<MedicationApplication>>;
  create: (
    input: CreateMedicationApplicationDTO,
  ) => Promise<MedicationApplication | "not_found">;
  update: (
    id: string,
    input: UpdateMedicationApplicationDTO,
  ) => Promise<MedicationApplication | "not_found">;
  remove: (id: string) => Promise<boolean>;
}
