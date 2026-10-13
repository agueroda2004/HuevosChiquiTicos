import type { PaginatedResult } from "../../../shared/domain/pagination";
import { request } from "../../../shared/utils/http";
import type { CreateEntryInput, EntriesQuery, Entry, UpdateEntryInput } from "../domain/entry";
import type { EntriesPort } from "../domain/entry.ports";

function buildQuery(query: EntriesQuery): string {
  const params = new URLSearchParams();
  if (query.cageId) params.set("cageId", query.cageId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  params.set("page", String(query.page));
  params.set("pageSize", String(query.pageSize));
  return params.toString();
}

export const entriesHttpService: EntriesPort = {
  list(query: EntriesQuery) {
    return request<PaginatedResult<Entry>>(`/api/entries?${buildQuery(query)}`);
  },

  create(input: CreateEntryInput) {
    return request<Entry>("/api/entries", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  update(input: UpdateEntryInput) {
    return request<Entry>(`/api/entries/${input.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        quantity: input.quantity,
        cageId: input.cageId,
        entryDate: input.entryDate,
      }),
    });
  },

  async remove(id: string) {
    await request<void>(`/api/entries/${id}`, { method: "DELETE" });
  },
};
