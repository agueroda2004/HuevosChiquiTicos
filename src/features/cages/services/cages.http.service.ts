import type { Cage, CreateCageInput, UpdateCageInput } from "../domain/cage";
import type { CagesPort } from "../domain/cage.ports";
import { request } from "../../../shared/utils/http";

export const cagesHttpService: CagesPort = {
  list() {
    return request<Cage[]>("/api/cages");
  },

  create(input: CreateCageInput) {
    return request<Cage>("/api/cages", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateCageInput) {
    return request<Cage>(`/api/cages/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: input.name, active: input.active }),
    });
  },

  adjustBirds(cageId: string, delta: number) {
    return request<Cage>(`/api/cages/${cageId}/birds`, {
      method: "PATCH",
      body: JSON.stringify({ delta }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/cages/${id}`, { method: "DELETE" });
  },
};
