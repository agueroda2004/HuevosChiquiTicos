import type { Cage, CreateCageDTO, UpdateCageDTO } from "../types/cage.js";
import type { DeleteResult } from "../types/common.js";

export interface CagesPort {
  list: () => Promise<Cage[]>;
  create: (input: CreateCageDTO) => Promise<Cage | "duplicate">;
  update: (id: string, input: UpdateCageDTO) => Promise<Cage | "not_found" | "duplicate">;
  adjustBirds: (id: string, delta: number) => Promise<Cage | "not_found" | "insufficient">;
  remove: (id: string) => Promise<DeleteResult>;
}
