import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateEggCollectionInput,
  EggCollection,
  EggCollectionsQuery,
  UpdateEggCollectionInput,
} from "./egg-collection";

export interface EggCollectionsPort {
  list: (query: EggCollectionsQuery) => Promise<PaginatedResult<EggCollection>>;
  create: (input: CreateEggCollectionInput) => Promise<EggCollection>;
  update: (input: UpdateEggCollectionInput) => Promise<EggCollection>;
  remove: (id: string) => Promise<void>;
}
