import type { PaginatedResult } from "../types/common.js";
import type {
  CreateDiscardDTO,
  Discard,
  DiscardsQuery,
  UpdateDiscardDTO,
} from "../types/discard.js";

export interface DiscardsPort {
  list: (query: DiscardsQuery) => Promise<PaginatedResult<Discard>>;
  create: (input: CreateDiscardDTO) => Promise<Discard | "not_found" | "insufficient">;
  update: (id: string, input: UpdateDiscardDTO) => Promise<Discard | "not_found" | "insufficient">;
  remove: (id: string) => Promise<"deleted" | "not_found">;
}
