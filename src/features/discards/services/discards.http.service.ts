import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type {
  CreateDiscardInput,
  Discard,
  DiscardsQuery,
  UpdateDiscardInput,
} from "../domain/discard";
import type { DiscardsPort } from "../domain/discard.ports";

function buildQuery(query: DiscardsQuery): string {
  const params = new URLSearchParams();
  if (query.cageId) params.set("cageId", query.cageId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

export const discardsHttpService: DiscardsPort = {
  list(query: DiscardsQuery) {
    return request<PaginatedResult<Discard>>(`/api/discards?${buildQuery(query)}`);
  },

  create(input: CreateDiscardInput) {
    return request<Discard>("/api/discards", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateDiscardInput) {
    return request<Discard>(`/api/discards/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        quantity: input.quantity,
        cageId: input.cageId,
        discardDate: input.discardDate,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/discards/${id}`, { method: "DELETE" });
  },
};
