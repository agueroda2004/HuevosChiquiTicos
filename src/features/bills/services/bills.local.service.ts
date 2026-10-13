import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  Bill,
  BillItem,
  BillsQuery,
  CreateBillInput,
  Payment,
  PaymentInput,
  UpdateBillInput,
} from "../domain/bill";
import type { BillsPort } from "../domain/bill.ports";
import { computeBillTotal, computeSubtotal, computeTotalPaid, deriveStatus } from "../utils";

const STORAGE_KEY = "huevos-chiquiticos.bills";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(bill: Bill): Bill {
  const items = Array.isArray(bill.items) ? bill.items : [];
  const payments = Array.isArray(bill.payments) ? bill.payments : [];
  const total = computeBillTotal(items);
  const totalPaid = computeTotalPaid(payments);

  return {
    ...bill,
    supplierNumber: bill.supplierNumber ?? null,
    items,
    payments,
    total,
    totalPaid,
    status: deriveStatus(total, totalPaid),
  };
}

function read(): Bill[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Bill[]).map(normalize) : [];
  } catch {
    return [];
  }
}

function write(bills: Bill[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

function buildItems(input: CreateBillInput): BillItem[] {
  return input.items.map((item) => ({
    id: crypto.randomUUID(),
    name: item.name.trim(),
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    subtotal: computeSubtotal(item.quantity, item.unitPrice),
  }));
}

function nextNumber(bills: Bill[]): string {
  const last = bills.reduce((max, bill) => {
    const match = /^P-(\d+)$/.exec(bill.number);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `P-${String(last + 1).padStart(4, "0")}`;
}

function sameItems(current: BillItem[], next: CreateBillInput["items"]): boolean {
  if (current.length !== next.length) return false;

  return current.every((item, index) => {
    const other = next[index];
    return (
      Boolean(other) &&
      item.name === other.name.trim() &&
      item.quantity === other.quantity &&
      item.unitPrice === other.unitPrice
    );
  });
}

export const billsLocalService: BillsPort = {
  async list(query: BillsQuery): Promise<PaginatedResult<Bill>> {
    await delay(SIMULATED_LATENCY_MS);

    const search = query.search?.trim().toLowerCase() ?? "";

    const filtered = read()
      .filter((bill) =>
        query.status
          ? bill.status === query.status
          : query.includeHidden
            ? true
            : bill.status !== "paid",
      )
      .filter((bill) => !query.supplierId || bill.supplierId === query.supplierId)
      .filter(
        (bill) =>
          !search ||
          bill.number.toLowerCase().includes(search) ||
          (bill.supplierNumber?.toLowerCase().includes(search) ?? false),
      )
      .filter((bill) => !query.from || bill.dueDate >= query.from)
      .filter((bill) => !query.to || bill.dueDate <= query.to)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateBillInput) {
    await delay(SIMULATED_LATENCY_MS);

    const bills = read();
    const items = buildItems(input);
    const total = computeBillTotal(items);

    const bill: Bill = {
      id: crypto.randomUUID(),
      supplierId: input.supplierId,
      number: nextNumber(bills),
      supplierNumber: input.supplierNumber,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      status: deriveStatus(total, 0),
      items,
      total,
      payments: [],
      totalPaid: 0,
    };

    write([...bills, bill]);
    return bill;
  },

  async update(input: UpdateBillInput) {
    await delay(SIMULATED_LATENCY_MS);

    const bills = read();
    const index = bills.findIndex((bill) => bill.id === input.id);

    if (index === -1) {
      throw new Error("La factura no existe.");
    }

    const previous = bills[index];

    if (previous.status === "paid") {
      throw new Error("No puedes editar una factura pagada.");
    }
    if (previous.status === "partial" && !sameItems(previous.items, input.items)) {
      throw new Error("No puedes modificar los conceptos de una factura con pagos.");
    }

    const items = buildItems(input);
    const total = computeBillTotal(items);
    const totalPaid = computeTotalPaid(previous.payments);

    const updated: Bill = {
      ...previous,
      supplierId: input.supplierId,
      supplierNumber: input.supplierNumber,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      items,
      total,
      status: deriveStatus(total, totalPaid),
    };

    const next = [...bills];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const bills = read();
    const next = bills.filter((bill) => bill.id !== id);

    if (next.length === bills.length) {
      throw new Error("La factura no existe.");
    }

    write(next);
  },

  async addPayment(billId: string, input: PaymentInput) {
    await delay(SIMULATED_LATENCY_MS);

    const bills = read();
    const index = bills.findIndex((bill) => bill.id === billId);

    if (index === -1) {
      throw new Error("La factura no existe.");
    }

    const bill = bills[index];
    if (bill.status === "paid") {
      throw new Error("Esta factura ya está pagada.");
    }

    const projectedTotalPaid = computeTotalPaid([...bill.payments, input]);
    if (projectedTotalPaid > bill.total + 1e-6) {
      throw new Error("El monto no puede superar el saldo pendiente.");
    }

    const payment: Payment = { id: crypto.randomUUID(), ...input };
    const payments = [...bill.payments, payment];
    const totalPaid = computeTotalPaid(payments);

    const updated: Bill = {
      ...bill,
      payments,
      totalPaid,
      status: deriveStatus(bill.total, totalPaid),
    };

    const next = [...bills];
    next[index] = updated;
    write(next);

    return updated;
  },

  async removePayment(billId: string, paymentId: string) {
    await delay(SIMULATED_LATENCY_MS);

    const bills = read();
    const index = bills.findIndex((bill) => bill.id === billId);

    if (index === -1) {
      throw new Error("La factura no existe.");
    }

    const bill = bills[index];
    const payments = bill.payments.filter((payment) => payment.id !== paymentId);

    if (payments.length === bill.payments.length) {
      throw new Error("El pago no existe.");
    }

    const totalPaid = computeTotalPaid(payments);

    const updated: Bill = {
      ...bill,
      payments,
      totalPaid,
      status: deriveStatus(bill.total, totalPaid),
    };

    const next = [...bills];
    next[index] = updated;
    write(next);

    return updated;
  },
};
