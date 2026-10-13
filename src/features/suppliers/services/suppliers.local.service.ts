import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateSupplierInput,
  Supplier,
  SuppliersQuery,
  UpdateSupplierInput,
} from "../domain/supplier";
import type { SuppliersPort } from "../domain/supplier.ports";

const STORAGE_KEY = "huevos-chiquiticos.suppliers";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read(): Supplier[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Supplier[]) : [];
  } catch {
    return [];
  }
}

function write(suppliers: Supplier[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
}

function normalizeOptional(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

function hasName(suppliers: Supplier[], name: string, ignoreId?: string): boolean {
  return suppliers.some(
    (supplier) =>
      supplier.id !== ignoreId && supplier.name.toLowerCase() === name.toLowerCase(),
  );
}

export const suppliersLocalService: SuppliersPort = {
  async list(query: SuppliersQuery): Promise<PaginatedResult<Supplier>> {
    await delay(SIMULATED_LATENCY_MS);

    const search = query.search?.trim().toLowerCase() ?? "";

    const filtered = read()
      .filter((supplier) => !search || supplier.name.toLowerCase().includes(search))
      .filter(
        (supplier) => !query.status || supplier.active === (query.status === "active"),
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateSupplierInput) {
    await delay(SIMULATED_LATENCY_MS);

    const suppliers = read();

    if (hasName(suppliers, input.name)) {
      throw new Error("Ya existe un proveedor con ese nombre.");
    }

    const supplier: Supplier = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email: normalizeOptional(input.email),
      phone: normalizeOptional(input.phone),
      address: normalizeOptional(input.address),
      active: input.active,
    };

    write([...suppliers, supplier]);
    return supplier;
  },

  async update(input: UpdateSupplierInput) {
    await delay(SIMULATED_LATENCY_MS);

    const suppliers = read();
    const index = suppliers.findIndex((supplier) => supplier.id === input.id);

    if (index === -1) {
      throw new Error("El proveedor no existe.");
    }

    if (hasName(suppliers, input.name, input.id)) {
      throw new Error("Ya existe un proveedor con ese nombre.");
    }

    const updated: Supplier = {
      id: input.id,
      name: input.name.trim(),
      email: normalizeOptional(input.email),
      phone: normalizeOptional(input.phone),
      address: normalizeOptional(input.address),
      active: input.active,
    };

    const next = [...suppliers];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const suppliers = read();
    const next = suppliers.filter((supplier) => supplier.id !== id);

    if (next.length === suppliers.length) {
      throw new Error("El proveedor no existe.");
    }

    write(next);
  },
};
