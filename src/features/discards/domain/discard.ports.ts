import type { PaginatedResult } from "../../../shared/domain/pagination";
import type { CreateDiscardInput, Discard, DiscardsQuery, UpdateDiscardInput } from "./discard";

export interface DiscardsPort {
  list: (query: DiscardsQuery) => Promise<PaginatedResult<Discard>>;
  create: (input: CreateDiscardInput) => Promise<Discard>;
  update: (input: UpdateDiscardInput) => Promise<Discard>;
  remove: (id: string) => Promise<void>;
}
