import type { PaginatedResult } from "../../../shared/domain/pagination";
import type { CreateEntryInput, EntriesQuery, Entry, UpdateEntryInput } from "./entry";

export interface EntriesPort {
  list: (query: EntriesQuery) => Promise<PaginatedResult<Entry>>;
  create: (input: CreateEntryInput) => Promise<Entry>;
  update: (input: UpdateEntryInput) => Promise<Entry>;
  remove: (id: string) => Promise<void>;
}
