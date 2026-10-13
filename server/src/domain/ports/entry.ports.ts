import type { PaginatedResult } from "../types/common.js";
import type {
  CreateEntryDTO,
  EntriesQuery,
  Entry,
  UpdateEntryDTO,
} from "../types/entry.js";

export interface EntriesPort {
  list: (query: EntriesQuery) => Promise<PaginatedResult<Entry>>;
  create: (input: CreateEntryDTO) => Promise<Entry | "not_found">;
  update: (id: string, input: UpdateEntryDTO) => Promise<Entry | "not_found" | "insufficient">;
  remove: (id: string) => Promise<"deleted" | "not_found" | "insufficient">;
}
