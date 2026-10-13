import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type {
  CreateEggCollectionInput,
  EggCollection,
  EggCollectionsQuery,
  UpdateEggCollectionInput,
} from "../domain/egg-collection";
import type { EggCollectionsPort } from "../domain/egg-collection.ports";

function buildQuery(query: EggCollectionsQuery): string {
  const params = new URLSearchParams();
  if (query.cageId) params.set("cageId", query.cageId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

export const eggCollectionsHttpService: EggCollectionsPort = {
  list(query: EggCollectionsQuery) {
    return request<PaginatedResult<EggCollection>>(
      `/api/egg-collections?${buildQuery(query)}`,
    );
  },

  create(input: CreateEggCollectionInput) {
    return request<EggCollection>("/api/egg-collections", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateEggCollectionInput) {
    return request<EggCollection>(`/api/egg-collections/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        cageId: input.cageId,
        collectionDate: input.collectionDate,
        quantity: input.quantity,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/egg-collections/${id}`, { method: "DELETE" });
  },
};
