import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateMedicationApplicationInput,
  MedicationApplication,
  MedicationApplicationsQuery,
  UpdateMedicationApplicationInput,
} from "../domain/medication-application";
import type { MedicationApplicationsPort } from "../domain/medication-application.ports";

const STORAGE_KEY = "huevos-chiquiticos.medication-applications";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type LegacyRecord = Partial<MedicationApplication> & { cageId?: string };

function migrate(record: LegacyRecord): MedicationApplication {
  if (Array.isArray(record.cageIds)) {
    return record as MedicationApplication;
  }

  const { cageId, ...rest } = record;
  return { ...rest, cageIds: cageId ? [cageId] : [] } as MedicationApplication;
}

function read(): MedicationApplication[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LegacyRecord[]).map(migrate) : [];
  } catch {
    return [];
  }
}

function write(records: MedicationApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export const medicationApplicationsLocalService: MedicationApplicationsPort = {
  async list(
    query: MedicationApplicationsQuery,
  ): Promise<PaginatedResult<MedicationApplication>> {
    await delay(SIMULATED_LATENCY_MS);

    const filtered = read()
      .filter((record) => !query.cageId || record.cageIds.includes(query.cageId))
      .filter((record) => !query.medicationId || record.medicationId === query.medicationId)
      .filter((record) => !query.from || record.applicationDate >= query.from)
      .filter((record) => !query.to || record.applicationDate <= query.to)
      .sort((a, b) => b.applicationDate.localeCompare(a.applicationDate));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateMedicationApplicationInput) {
    await delay(SIMULATED_LATENCY_MS);

    const record: MedicationApplication = {
      id: crypto.randomUUID(),
      ...input,
    };

    write([...read(), record]);
    return record;
  },

  async update(input: UpdateMedicationApplicationInput) {
    await delay(SIMULATED_LATENCY_MS);

    const records = read();
    const index = records.findIndex((record) => record.id === input.id);

    if (index === -1) {
      throw new Error("El registro no existe.");
    }

    const updated: MedicationApplication = {
      id: input.id,
      cageIds: input.cageIds,
      medicationId: input.medicationId,
      dose: input.dose,
      applicationDate: input.applicationDate,
      birdCount: input.birdCount,
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
    const next = records.filter((record) => record.id !== id);

    if (next.length === records.length) {
      throw new Error("El registro no existe.");
    }

    write(next);
  },
};
