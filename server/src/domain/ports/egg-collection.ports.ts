import type { PaginatedResult } from "../types/common.js";
import type {
  CreateEggCollectionDTO,
  EggCollection,
  EggCollectionsQuery,
  UpdateEggCollectionDTO,
} from "../types/egg-collection.js";

export interface EggCollectionsPort {
  list: (query: EggCollectionsQuery) => Promise<PaginatedResult<EggCollection>>;
  create: (input: CreateEggCollectionDTO) => Promise<EggCollection | "not_found">;
  update: (id: string, input: UpdateEggCollectionDTO) => Promise<EggCollection | "not_found">;
  remove: (id: string) => Promise<boolean>;
}
