import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type { CreateDeathInput, Death, DeathsQuery, UpdateDeathInput } from "../domain/death";
import type { DeathsPort } from "../domain/death.ports";

function buildQuery(query: DeathsQuery): string {
  const params = new URLSearchParams();
  if (query.cageId) params.set("cageId", query.cageId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.type) params.set("type", query.type);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

export const deathsHttpService: DeathsPort = {
  list(query: DeathsQuery) {
    return request<PaginatedResult<Death>>(`/api/deaths?${buildQuery(query)}`);
  },

  create(input: CreateDeathInput) {
    return request<Death>("/api/deaths", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateDeathInput) {
    return request<Death>(`/api/deaths/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        deathDate: input.deathDate,
        cageId: input.cageId,
        quantity: input.quantity,
        type: input.type,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/deaths/${id}`, { method: "DELETE" });
  },
};
