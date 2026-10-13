import { request } from "../../../shared/utils/http";
import type { CreateMedicationInput, Medication, UpdateMedicationInput } from "../domain/medication";
import type { MedicationsPort } from "../domain/medication.ports";

export const medicationsHttpService: MedicationsPort = {
  list() {
    return request<Medication[]>("/api/medications");
  },

  create(input: CreateMedicationInput) {
    return request<Medication>("/api/medications", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateMedicationInput) {
    return request<Medication>(`/api/medications/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: input.name, active: input.active }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/medications/${id}`, { method: "DELETE" });
  },
};
