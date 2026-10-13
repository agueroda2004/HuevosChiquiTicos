export type ApplicationForm = "food" | "water" | "fumigation" | "injection";

export type MedicationApplication = {
  id: string;
  cageIds: string[];
  medicationId: string;
  dose: string;
  applicationDate: string;
  birdCount: number;
  type: ApplicationForm | null;
};

export type CreateMedicationApplicationInput = {
  cageIds: string[];
  medicationId: string;
  dose: string;
  applicationDate: string;
  birdCount: number;
  type: ApplicationForm | null;
};

export type UpdateMedicationApplicationInput = {
  id: string;
  cageIds: string[];
  medicationId: string;
  dose: string;
  applicationDate: string;
  birdCount: number;
  type: ApplicationForm | null;
};

export type MedicationApplicationsQuery = {
  cageId?: string;
  medicationId?: string;
  from?: string;
  to?: string;
  page: number;
  pageSize: number;
};
