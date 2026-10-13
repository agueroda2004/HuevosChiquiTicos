export type ApplicationForm = "food" | "water" | "fumigation" | "injection";

export interface MedicationApplication {
  id: string;
  cageIds: string[];
  medicationId: string;
  dose: string;
  applicationDate: string;
  birdCount: number;
  type: ApplicationForm | null;
}

export interface CreateMedicationApplicationDTO {
  cageIds: string[];
  medicationId: string;
  dose: string;
  applicationDate: string;
  birdCount: number;
  type: ApplicationForm | null;
}

export type UpdateMedicationApplicationDTO = CreateMedicationApplicationDTO;

export interface MedicationApplicationsQuery {
  cageId?: string;
  medicationId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
}
