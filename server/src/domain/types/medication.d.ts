export interface Medication {
  id: string;
  name: string;
  active: boolean;
}

export interface CreateMedicationDTO {
  name: string;
  active: boolean;
}

export interface UpdateMedicationDTO {
  name: string;
  active: boolean;
}
