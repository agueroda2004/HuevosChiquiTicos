import type { PaginatedResult } from "../../../shared/domain/pagination";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceItem,
  InvoicesQuery,
  Payment,
  PaymentInput,
  UpdateInvoiceInput,
} from "../domain/invoice";
import type { InvoicesPort } from "../domain/invoice.ports";
import { computeInvoiceTotal, computeSubtotal, computeTotalPaid, deriveStatus } from "../utils";

const STORAGE_KEY = "huevos-chiquiticos.invoices";
const SIMULATED_LATENCY_MS = 300;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(invoice: Invoice): Invoice {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const payments = Array.isArray(invoice.payments) ? invoice.payments : [];
  const total = computeInvoiceTotal(items);
  const totalPaid = computeTotalPaid(payments);

  return {
    ...invoice,
    orderId: invoice.orderId ?? null,
    items,
    payments,
    total,
    totalPaid,
    status: deriveStatus(total, totalPaid),
  };
}

function read(): Invoice[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Invoice[]).map(normalize) : [];
  } catch {
    return [];
  }
}

function write(invoices: Invoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

function buildItems(input: CreateInvoiceInput): InvoiceItem[] {
  return input.items.map((item) => ({
    id: crypto.randomUUID(),
    productId: item.productId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    subtotal: computeSubtotal(item.quantity, item.unitPrice),
  }));
}

function nextNumber(invoices: Invoice[]): string {
  const last = invoices.reduce((max, invoice) => {
    const match = /^F-(\d+)$/.exec(invoice.number);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `F-${String(last + 1).padStart(4, "0")}`;
}

function sameItems(
  current: InvoiceItem[],
  next: CreateInvoiceInput["items"],
): boolean {
  if (current.length !== next.length) return false;

  return current.every((item, index) => {
    const other = next[index];
    return (
      Boolean(other) &&
      item.productId === other.productId &&
      item.quantity === other.quantity &&
      item.unitPrice === other.unitPrice
    );
  });
}

export const invoicesLocalService: InvoicesPort = {
  async list(query: InvoicesQuery): Promise<PaginatedResult<Invoice>> {
    await delay(SIMULATED_LATENCY_MS);

    const search = query.search?.trim().toLowerCase() ?? "";

    const filtered = read()
      .filter((invoice) =>
        query.status
          ? invoice.status === query.status
          : query.includeHidden
            ? true
            : invoice.status !== "paid",
      )
      .filter((invoice) => !query.customerId || invoice.customerId === query.customerId)
      .filter((invoice) => !search || invoice.number.toLowerCase().includes(search))
      .filter((invoice) => !query.from || invoice.dueDate >= query.from)
      .filter((invoice) => !query.to || invoice.dueDate <= query.to)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    const total = filtered.length;
    const start = (query.page - 1) * query.pageSize;
    const items = filtered.slice(start, start + query.pageSize);

    return { items, total, page: query.page, pageSize: query.pageSize };
  },

  async create(input: CreateInvoiceInput) {
    await delay(SIMULATED_LATENCY_MS);

    const invoices = read();
    const items = buildItems(input);
    const total = computeInvoiceTotal(items);

    const invoice: Invoice = {
      id: crypto.randomUUID(),
      customerId: input.customerId,
      orderId: input.orderId,
      number: nextNumber(invoices),
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      status: deriveStatus(total, 0),
      items,
      total,
      payments: [],
      totalPaid: 0,
    };

    write([...invoices, invoice]);
    return invoice;
  },

  async update(input: UpdateInvoiceInput) {
    await delay(SIMULATED_LATENCY_MS);

    const invoices = read();
    const index = invoices.findIndex((invoice) => invoice.id === input.id);

    if (index === -1) {
      throw new Error("La factura no existe.");
    }

    const previous = invoices[index];

    if (previous.status === "paid") {
      throw new Error("No puedes editar una factura pagada.");
    }
    if (previous.status === "partial" && !sameItems(previous.items, input.items)) {
      throw new Error("No puedes modificar los productos de una factura con pagos.");
    }

    const items = buildItems(input);
    const total = computeInvoiceTotal(items);
    const totalPaid = computeTotalPaid(previous.payments);

    const updated: Invoice = {
      ...previous,
      customerId: input.customerId,
      orderId: input.orderId,
      issueDate: input.issueDate,
      dueDate: input.dueDate,
      items,
      total,
      status: deriveStatus(total, totalPaid),
    };

    const next = [...invoices];
    next[index] = updated;
    write(next);

    return updated;
  },

  async remove(id: string) {
    await delay(SIMULATED_LATENCY_MS);

    const invoices = read();
    const next = invoices.filter((invoice) => invoice.id !== id);

    if (next.length === invoices.length) {
      throw new Error("La factura no existe.");
    }

    write(next);
  },

  async addPayment(invoiceId: string, input: PaymentInput) {
    await delay(SIMULATED_LATENCY_MS);

    const invoices = read();
    const index = invoices.findIndex((invoice) => invoice.id === invoiceId);

    if (index === -1) {
      throw new Error("La factura no existe.");
    }

    const invoice = invoices[index];
    if (invoice.status === "paid") {
      throw new Error("Esta factura ya está pagada.");
    }

    const projectedTotalPaid = computeTotalPaid([...invoice.payments, input]);
    if (projectedTotalPaid > invoice.total + 1e-6) {
      throw new Error("El monto no puede superar el saldo pendiente.");
    }

    const payment: Payment = { id: crypto.randomUUID(), ...input };
    const payments = [...invoice.payments, payment];
    const totalPaid = computeTotalPaid(payments);

    const updated: Invoice = {
      ...invoice,
      payments,
      totalPaid,
      status: deriveStatus(invoice.total, totalPaid),
    };

    const next = [...invoices];
    next[index] = updated;
    write(next);

    return updated;
  },

  async removePayment(invoiceId: string, paymentId: string) {
    await delay(SIMULATED_LATENCY_MS);

    const invoices = read();
    const index = invoices.findIndex((invoice) => invoice.id === invoiceId);

    if (index === -1) {
      throw new Error("La factura no existe.");
    }

    const invoice = invoices[index];
    const payments = invoice.payments.filter((payment) => payment.id !== paymentId);

    if (payments.length === invoice.payments.length) {
      throw new Error("El pago no existe.");
    }

    const totalPaid = computeTotalPaid(payments);

    const updated: Invoice = {
      ...invoice,
      payments,
      totalPaid,
      status: deriveStatus(invoice.total, totalPaid),
    };

    const next = [...invoices];
    next[index] = updated;
    write(next);

    return updated;
  },
};
