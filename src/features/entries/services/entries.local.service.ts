import type { PaginatedResult } from "../../../shared/domain/pagination";
import { cagesLocalService } from "../../cages/services/cages.local.service";
import type { CreateEntryInput, EntriesQuery, Entry, UpdateEntryInput } from "../domain/entry";
import type { EntriesPort } from "../domain/entry.ports";

const STORAGE_KEY = "huevos-chiquiticos.entries";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read(): Entry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Entry[]) : [];
  } catch {
    return [];
  }
}

function write(records: Entry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const entriesLocalService: EntriesPort = {
  async list(query: EntriesQuery): Promise<PaginatedResult<Entry>> {
    await delay(SIMULATED_LATENCY_MS);

    const filtered = read()
      .filter((record) => !query.cageId || record.cageId === query.cageId)
      .filter((record) => !query.from || record.entryDate >= query.from)
      .filter((record) => !query.to || record.entryDate <= query.to)
      .sort((a, b) => b.entryDate.localeCompare(a.entryDate));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateEntryInput) {
    await delay(SIMULATED_LATENCY_MS);

    await cagesLocalService.adjustBirds(input.cageId, input.quantity);

    const record: Entry = {
      id: crypto.randomUUID(),
      ...input,
    };

    write([...read(), record]);
    return record;
  },

  async update(input: UpdateEntryInput) {
    await delay(SIMULATED_LATENCY_MS);

    const records = read();
    const index = records.findIndex((record) => record.id === input.id);

    if (index === -1) {
      throw new Error("El registro no existe.");
    }

    const previous = records[index];

    // Reverse the previous entry (subtract the birds it added), then apply the new one.
    // The reversal is validated: it fails if it would leave the cage below zero birds.
    await cagesLocalService.adjustBirds(previous.cageId, -previous.quantity);
    try {
      await cagesLocalService.adjustBirds(input.cageId, input.quantity);
    } catch (error) {
      // Roll back the reversal so state stays consistent.
      await cagesLocalService.adjustBirds(previous.cageId, previous.quantity);
      throw error;
    }

    const updated: Entry = {
      id: input.id,
      quantity: input.quantity,
      cageId: input.cageId,
      entryDate: input.entryDate,
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

    // Reverse the entry (subtract the birds it added); validated like the edit.
    await cagesLocalService.adjustBirds(record.cageId, -record.quantity);
    write(records.filter((item) => item.id !== id));
  },
};
