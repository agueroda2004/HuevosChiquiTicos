import type { PaginatedResult } from "../../../shared/domain/pagination";
import { cagesLocalService } from "../../cages/services/cages.local.service";
import type { CreateDeathInput, Death, DeathsQuery, UpdateDeathInput } from "../domain/death";
import type { DeathsPort } from "../domain/death.ports";

const STORAGE_KEY = "huevos-chiquiticos.deaths";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read(): Death[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Death[]) : [];
  } catch {
    return [];
  }
}

function write(records: Death[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const deathsLocalService: DeathsPort = {
  async list(query: DeathsQuery): Promise<PaginatedResult<Death>> {
    await delay(SIMULATED_LATENCY_MS);

    const filtered = read()
      .filter((record) => !query.cageId || record.cageId === query.cageId)
      .filter((record) => !query.from || record.deathDate >= query.from)
      .filter((record) => !query.to || record.deathDate <= query.to)
      .filter((record) => !query.type || record.type === query.type)
      .sort((a, b) => b.deathDate.localeCompare(a.deathDate));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateDeathInput) {
    await delay(SIMULATED_LATENCY_MS);

    await cagesLocalService.adjustBirds(input.cageId, -input.quantity);

    const record: Death = {
      id: crypto.randomUUID(),
      ...input,
    };

    write([...read(), record]);
    return record;
  },

  async update(input: UpdateDeathInput) {
    await delay(SIMULATED_LATENCY_MS);

    const records = read();
    const index = records.findIndex((record) => record.id === input.id);

    if (index === -1) {
      throw new Error("El registro no existe.");
    }

    const previous = records[index];

    // Restore the birds affected by the previous record, then apply the new one.
    await cagesLocalService.adjustBirds(previous.cageId, previous.quantity);
    try {
      await cagesLocalService.adjustBirds(input.cageId, -input.quantity);
    } catch (error) {
      // Roll back the restore so state stays consistent.
      await cagesLocalService.adjustBirds(previous.cageId, -previous.quantity);
      throw error;
    }

    const updated: Death = {
      id: input.id,
      deathDate: input.deathDate,
      cageId: input.cageId,
      quantity: input.quantity,
      type: input.type,
    };

    const next = [...records];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const records = read();
    const record = records.find((item) => item.id === id);

    if (!record) {
      throw new Error("El registro no existe.");
    }

    await cagesLocalService.adjustBirds(record.cageId, record.quantity);
    write(records.filter((item) => item.id !== id));
  },
};
