import type { CreateMedicationInput, Medication, UpdateMedicationInput } from "../domain/medication";
import type { MedicationsPort } from "../domain/medication.ports";

const STORAGE_KEY = "huevos-chiquiticos.medications";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function read(): Medication[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Medication[]) : [];
  } catch {
    return [];
  }
}

function write(medications: Medication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(medications));
}

export const medicationsLocalService: MedicationsPort = {
  async list() {
    await delay(SIMULATED_LATENCY_MS);
    return read();
  },

  async create(input: CreateMedicationInput) {
    await delay(SIMULATED_LATENCY_MS);

    const medications = read();
    const nameExists = medications.some(
      (medication) => medication.name.toLowerCase() === input.name.toLowerCase(),
    );

    if (nameExists) {
      throw new Error("Ya existe un medicamento con ese nombre.");
    }

    const medication: Medication = {
      id: crypto.randomUUID(),
      name: input.name,
      active: input.active,
    };

    write([...medications, medication]);
    return medication;
  },

  async update(input: UpdateMedicationInput) {
    await delay(SIMULATED_LATENCY_MS);

    const medications = read();
    const index = medications.findIndex((medication) => medication.id === input.id);

    if (index === -1) {
      throw new Error("El medicamento no existe.");
    }

    const nameExists = medications.some(
      (medication) =>
        medication.id !== input.id &&
        medication.name.toLowerCase() === input.name.toLowerCase(),
    );

    if (nameExists) {
      throw new Error("Ya existe un medicamento con ese nombre.");
    }

    const updated: Medication = {
      id: input.id,
      name: input.name,
      active: input.active,
    };

    const next = [...medications];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const medications = read();
    const next = medications.filter((medication) => medication.id !== id);

    if (next.length === medications.length) {
      throw new Error("El medicamento no existe.");
    }

    write(next);
  },
};
