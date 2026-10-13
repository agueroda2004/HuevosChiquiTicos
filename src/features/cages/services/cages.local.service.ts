import type { Cage, CreateCageInput, UpdateCageInput } from "../domain/cage";
import type { CagesPort } from "../domain/cage.ports";

const STORAGE_KEY = "huevos-chiquiticos.cages";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read(): Cage[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Cage[]) : [];
  } catch {
    return [];
  }
}

function write(cages: Cage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cages));
}

export const cagesLocalService: CagesPort = {
  async list() {
    await delay(SIMULATED_LATENCY_MS);
    return read();
  },

  async create(input: CreateCageInput) {
    await delay(SIMULATED_LATENCY_MS);

    const cages = read();
    const nameExists = cages.some(
      (cage) => cage.name.toLowerCase() === input.name.toLowerCase(),
    );

    if (nameExists) {
      throw new Error("Ya existe una jaula con ese nombre.");
    }

    const cage: Cage = {
      id: crypto.randomUUID(),
      name: input.name,
      birds: input.birds,
      active: input.active,
    };

    write([...cages, cage]);
    return cage;
  },

  async update(input: UpdateCageInput) {
    await delay(SIMULATED_LATENCY_MS);

    const cages = read();
    const index = cages.findIndex((cage) => cage.id === input.id);

    if (index === -1) {
      throw new Error("La jaula no existe.");
    }

    const nameExists = cages.some(
      (cage) => cage.id !== input.id && cage.name.toLowerCase() === input.name.toLowerCase(),
    );

    if (nameExists) {
      throw new Error("Ya existe una jaula con ese nombre.");
    }

    const updated: Cage = {
      ...cages[index],
      name: input.name,
      active: input.active,
    };

    const next = [...cages];
    next[index] = updated;
    write(next);

    return updated;
  },

  async adjustBirds(cageId: string, delta: number) {
    await delay(SIMULATED_LATENCY_MS);

    const cages = read();
    const index = cages.findIndex((cage) => cage.id === cageId);

    if (index === -1) {
      throw new Error("La jaula no existe.");
    }

    const nextBirds = cages[index].birds + delta;
    if (nextBirds < 0) {
      throw new Error("No hay suficientes aves en la jaula.");
    }

    const updated: Cage = { ...cages[index], birds: nextBirds };
    const next = [...cages];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const cages = read();
    const next = cages.filter((cage) => cage.id !== id);

    if (next.length === cages.length) {
      throw new Error("La jaula no existe.");
    }

    write(next);
  },
};
