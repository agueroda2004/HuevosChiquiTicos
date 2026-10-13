import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type {
  CreateMedicationApplicationInput,
  MedicationApplication,
  MedicationApplicationsQuery,
  UpdateMedicationApplicationInput,
} from "../domain/medication-application";
import type { MedicationApplicationsPort } from "../domain/medication-application.ports";

function buildQuery(query: MedicationApplicationsQuery): string {
  const params = new URLSearchParams();
  if (query.cageId) params.set("cageId", query.cageId);
  if (query.medicationId) params.set("medicationId", query.medicationId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

export const medicationApplicationsHttpService: MedicationApplicationsPort = {
  list(query: MedicationApplicationsQuery) {
    return request<PaginatedResult<MedicationApplication>>(
      `/api/medication-applications?${buildQuery(query)}`,
    );
  },

  create(input: CreateMedicationApplicationInput) {
    return request<MedicationApplication>("/api/medication-applications", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateMedicationApplicationInput) {
    return request<MedicationApplication>(`/api/medication-applications/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        cageIds: input.cageIds,
        medicationId: input.medicationId,
        dose: input.dose,
        applicationDate: input.applicationDate,
        birdCount: input.birdCount,
        type: input.type,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/medication-applications/${id}`, { method: "DELETE" });
  },
};
