import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateProductInput,
  Product,
  ProductsQuery,
  UpdateProductInput,
} from "../domain/product";
import type { ProductsPort } from "../domain/product.ports";

const STORAGE_KEY = "huevos-chiquiticos.products";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read(): Product[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Product[]) : [];
  } catch {
    return [];
  }
}

function write(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function normalizeOptional(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

function hasName(products: Product[], name: string, ignoreId?: string): boolean {
  return products.some(
    (product) => product.id !== ignoreId && product.name.toLowerCase() === name.toLowerCase(),
  );
}

export const productsLocalService: ProductsPort = {
  async list(query: ProductsQuery): Promise<PaginatedResult<Product>> {
    await delay(SIMULATED_LATENCY_MS);

    const search = query.search?.trim().toLowerCase() ?? "";

    const filtered = read()
      .filter((product) => !search || product.name.toLowerCase().includes(search))
      .filter((product) => !query.status || product.active === (query.status === "active"))
      .sort((a, b) => a.name.localeCompare(b.name));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateProductInput) {
    await delay(SIMULATED_LATENCY_MS);

    const products = read();

    if (hasName(products, input.name)) {
      throw new Error("Ya existe un producto con ese nombre.");
    }

    const product: Product = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      price: input.price,
      active: input.active,
      imageUrl: normalizeOptional(input.imageUrl),
    };

    write([...products, product]);
    return product;
  },

  async update(input: UpdateProductInput) {
    await delay(SIMULATED_LATENCY_MS);

    const products = read();
    const index = products.findIndex((product) => product.id === input.id);

    if (index === -1) {
      throw new Error("El producto no existe.");
    }

    if (hasName(products, input.name, input.id)) {
      throw new Error("Ya existe un producto con ese nombre.");
    }

    const updated: Product = {
      id: input.id,
      name: input.name.trim(),
      price: input.price,
      active: input.active,
      imageUrl: normalizeOptional(input.imageUrl),
    };

    const next = [...products];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const products = read();
    const next = products.filter((product) => product.id !== id);

    if (next.length === products.length) {
      throw new Error("El producto no existe.");
    }

    write(next);
  },
};
