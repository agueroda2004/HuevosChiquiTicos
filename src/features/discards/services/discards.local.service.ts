import type { PaginatedResult } from "../../../shared/domain/pagination";
import { cagesLocalService } from "../../cages/services/cages.local.service";
import type {
  CreateDiscardInput,
  Discard,
  DiscardsQuery,
  UpdateDiscardInput,
} from "../domain/discard";
import type { DiscardsPort } from "../domain/discard.ports";

const STORAGE_KEY = "huevos-chiquiticos.discards";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read(): Discard[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Discard[]) : [];
  } catch {
    return [];
  }
}

function write(records: Discard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const discardsLocalService: DiscardsPort = {
  async list(query: DiscardsQuery): Promise<PaginatedResult<Discard>> {
    await delay(SIMULATED_LATENCY_MS);

    const filtered = read()
      .filter((record) => !query.cageId || record.cageId === query.cageId)
      .filter((record) => !query.from || record.discardDate >= query.from)
      .filter((record) => !query.to || record.discardDate <= query.to)
      .sort((a, b) => b.discardDate.localeCompare(a.discardDate));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateDiscardInput) {
    await delay(SIMULATED_LATENCY_MS);

    await cagesLocalService.adjustBirds(input.cageId, -input.quantity);

    const record: Discard = {
      id: crypto.randomUUID(),
      ...input,
    };

    write([...read(), record]);
    return record;
  },

  async update(input: UpdateDiscardInput) {
    await delay(SIMULATED_LATENCY_MS);

    const records = read();
    const index = records.findIndex((record) => record.id === input.id);

    if (index === -1) {
      throw new Error("El registro no existe.");
    }

    const previous = records[index];

    // Reverse the previous discard (add the birds back), then apply the new one.
    // Reversing a discard always adds birds, so no validation is needed here.
    await cagesLocalService.adjustBirds(previous.cageId, previous.quantity);
    try {
      await cagesLocalService.adjustBirds(input.cageId, -input.quantity);
    } catch (error) {
      // Roll back the reversal so state stays consistent.
      await cagesLocalService.adjustBirds(previous.cageId, -previous.quantity);
      throw error;
    }

    const updated: Discard = {
      id: input.id,
      quantity: input.quantity,
      cageId: input.cageId,
      discardDate: input.discardDate,
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

    // Reverse the discard (add the birds back); no validation needed.
    await cagesLocalService.adjustBirds(record.cageId, record.quantity);
    write(records.filter((item) => item.id !== id));
  },
};
