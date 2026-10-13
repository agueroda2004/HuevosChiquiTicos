import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateCustomerInput,
  Customer,
  CustomersQuery,
  UpdateCustomerInput,
} from "../domain/customer";
import type { CustomersPort } from "../domain/customer.ports";

const STORAGE_KEY = "huevos-chiquiticos.customers";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read(): Customer[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Customer[]) : [];
  } catch {
    return [];
  }
}

function write(customers: Customer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

function normalizeOptional(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

function hasName(customers: Customer[], name: string, ignoreId?: string): boolean {
  return customers.some(
    (customer) =>
      customer.id !== ignoreId && customer.name.toLowerCase() === name.toLowerCase(),
  );
}

export const customersLocalService: CustomersPort = {
  async list(query: CustomersQuery): Promise<PaginatedResult<Customer>> {
    await delay(SIMULATED_LATENCY_MS);

    const search = query.search?.trim().toLowerCase() ?? "";

    const filtered = read()
      .filter((customer) => !search || customer.name.toLowerCase().includes(search))
      .filter(
        (customer) => !query.status || customer.active === (query.status === "active"),
      )
      .sort((a, b) => a.name.localeCompare(b.name));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateCustomerInput) {
    await delay(SIMULATED_LATENCY_MS);

    const customers = read();

    if (hasName(customers, input.name)) {
      throw new Error("Ya existe un cliente con ese nombre.");
    }

    const customer: Customer = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email: normalizeOptional(input.email),
      phone: normalizeOptional(input.phone),
      address: normalizeOptional(input.address),
      active: input.active,
    };

    write([...customers, customer]);
    return customer;
  },

  async update(input: UpdateCustomerInput) {
    await delay(SIMULATED_LATENCY_MS);

    const customers = read();
    const index = customers.findIndex((customer) => customer.id === input.id);

    if (index === -1) {
      throw new Error("El cliente no existe.");
    }

    if (hasName(customers, input.name, input.id)) {
      throw new Error("Ya existe un cliente con ese nombre.");
    }

    const updated: Customer = {
      id: input.id,
      name: input.name.trim(),
      email: normalizeOptional(input.email),
      phone: normalizeOptional(input.phone),
      address: normalizeOptional(input.address),
      active: input.active,
    };

    const next = [...customers];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const customers = read();
    const next = customers.filter((customer) => customer.id !== id);

    if (next.length === customers.length) {
      throw new Error("El cliente no existe.");
    }

    write(next);
  },
};
