import type { PaginatedResult } from "../types/common.js";
import type {
  CreateDeathDTO,
  Death,
  DeathsQuery,
  UpdateDeathDTO,
} from "../types/death.js";

export interface DeathsPort {
  list: (query: DeathsQuery) => Promise<PaginatedResult<Death>>;
  create: (input: CreateDeathDTO) => Promise<Death | "not_found" | "insufficient">;
  update: (id: string, input: UpdateDeathDTO) => Promise<Death | "not_found" | "insufficient">;
  remove: (id: string) => Promise<"deleted" | "not_found">;
}
