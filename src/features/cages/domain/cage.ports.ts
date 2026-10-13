import type { Cage, CreateCageInput, UpdateCageInput } from "./cage";

export interface CagesPort {
  list: () => Promise<Cage[]>;
  create: (input: CreateCageInput) => Promise<Cage>;
  update: (input: UpdateCageInput) => Promise<Cage>;
  adjustBirds: (cageId: string, delta: number) => Promise<Cage>;
  remove: (id: string) => Promise<void>;
}
