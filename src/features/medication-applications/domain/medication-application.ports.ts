import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateMedicationApplicationInput,
  MedicationApplication,
  MedicationApplicationsQuery,
  UpdateMedicationApplicationInput,
} from "./medication-application";

export interface MedicationApplicationsPort {
  list: (
    query: MedicationApplicationsQuery,
  ) => Promise<PaginatedResult<MedicationApplication>>;
  create: (input: CreateMedicationApplicationInput) => Promise<MedicationApplication>;
  update: (input: UpdateMedicationApplicationInput) => Promise<MedicationApplication>;
  remove: (id: string) => Promise<void>;
}
