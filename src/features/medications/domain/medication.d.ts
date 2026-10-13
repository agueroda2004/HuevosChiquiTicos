export type Medication = {
  id: string;
  name: string;
  active: boolean;
};

export type CreateMedicationInput = {
  name: string;
  active: boolean;
};

export type UpdateMedicationInput = {
  id: string;
  name: string;
  active: boolean;
};
