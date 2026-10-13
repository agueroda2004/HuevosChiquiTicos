import type { PaginatedResult } from "../../../shared/domain/pagination";
import type { CreateDeathInput, Death, DeathsQuery, UpdateDeathInput } from "./death";

export interface DeathsPort {
  list: (query: DeathsQuery) => Promise<PaginatedResult<Death>>;
  create: (input: CreateDeathInput) => Promise<Death>;
  update: (input: UpdateDeathInput) => Promise<Death>;
  remove: (id: string) => Promise<void>;
}
