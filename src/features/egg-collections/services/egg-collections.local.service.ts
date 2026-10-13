import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateEggCollectionInput,
  EggCollection,
  EggCollectionsQuery,
  UpdateEggCollectionInput,
} from "../domain/egg-collection";
import type { EggCollectionsPort } from "../domain/egg-collection.ports";

const STORAGE_KEY = "huevos-chiquiticos.egg-collections";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read(): EggCollection[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as EggCollection[]) : [];
  } catch {
    return [];
  }
}

function write(records: EggCollection[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const eggCollectionsLocalService: EggCollectionsPort = {
  async list(query: EggCollectionsQuery): Promise<PaginatedResult<EggCollection>> {
    await delay(SIMULATED_LATENCY_MS);

    const filtered = read()
      .filter((record) => !query.cageId || record.cageId === query.cageId)
      .filter((record) => !query.from || record.collectionDate >= query.from)
      .filter((record) => !query.to || record.collectionDate <= query.to)
      .sort((a, b) => b.collectionDate.localeCompare(a.collectionDate));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateEggCollectionInput) {
    await delay(SIMULATED_LATENCY_MS);

    const record: EggCollection = {
      id: crypto.randomUUID(),
      ...input,
    };

    write([...read(), record]);
    return record;
  },

  async update(input: UpdateEggCollectionInput) {
    await delay(SIMULATED_LATENCY_MS);

    const records = read();
    const index = records.findIndex((record) => record.id === input.id);

    if (index === -1) {
      throw new Error("El registro no existe.");
    }

    const updated: EggCollection = {
      id: input.id,
      cageId: input.cageId,
      collectionDate: input.collectionDate,
      quantity: input.quantity,
    };

    const next = [...records];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const records = read();
    const next = records.filter((record) => record.id !== id);

    if (next.length === records.length) {
      throw new Error("El registro no existe.");
    }

    write(next);
  },
};
