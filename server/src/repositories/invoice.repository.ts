import { and, eq, gte, ilike, inArray, lte, ne, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  customers,
  invoiceItems,
  invoicePayments,
  invoices,
  products,
  type InvoiceItemRow,
  type InvoicePaymentRow,
  type InvoiceRow,
} from "../db/schema.js";
import type { InvoicesPort } from "../domain/ports/invoice.ports.js";
import type {
  Invoice,
  InvoiceItem,
  InvoiceItemInput,
  InvoicesQuery,
} from "../domain/types/invoice.js";
import type { Payment } from "../domain/types/payment.js";
import {
  computeSubtotal,
  computeTotal,
  computeTotalPaid,
  deriveStatus,
  nextNumber,
} from "./calc.js";

function toInvoiceItem(row: InvoiceItemRow): InvoiceItem {
  return {
    id: row.id,
    productId: row.productId,
    quantity: row.quantity,
    unitPrice: row.unitPrice,
    subtotal: row.subtotal,
  };
}

function toPayment(row: InvoicePaymentRow): Payment {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    method: row.method,
    reference: row.reference,
    notes: row.notes,
  };
}

function buildInvoice(
  row: InvoiceRow,
  items: InvoiceItemRow[],
  payments: InvoicePaymentRow[],
): Invoice {
  return {
    id: row.id,
    customerId: row.customerId,
    orderId: row.orderId,
    number: row.number,
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    status: row.status,
    items: items.map(toInvoiceItem),
    total: row.total,
    payments: payments.map(toPayment),
    totalPaid: row.totalPaid,
  };
}

function sameItems(current: InvoiceItemRow[], next: InvoiceItemInput[]): boolean {
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

async function loadChildren(
  ids: string[],
): Promise<{ items: Map<string, InvoiceItemRow[]>; payments: Map<string, InvoicePaymentRow[]> }> {
  const items = new Map<string, InvoiceItemRow[]>();
  const payments = new Map<string, InvoicePaymentRow[]>();
  if (ids.length === 0) return { items, payments };

  const [itemRows, paymentRows] = await Promise.all([
    db.select().from(invoiceItems).where(inArray(invoiceItems.invoiceId, ids)),
    db.select().from(invoicePayments).where(inArray(invoicePayments.invoiceId, ids)),
  ]);

  for (const row of itemRows) {
    const list = items.get(row.invoiceId) ?? [];
    list.push(row);
    items.set(row.invoiceId, list);
  }
  for (const row of paymentRows) {
    const list = payments.get(row.invoiceId) ?? [];
    list.push(row);
    payments.set(row.invoiceId, list);
  }

  return { items, payments };
}

export const invoicesRepository: InvoicesPort = {
  async list(query: InvoicesQuery) {
    const conditions: SQL[] = [];
    if (query.status) {
      conditions.push(eq(invoices.status, query.status));
    } else if (!query.includeHidden) {
      conditions.push(ne(invoices.status, "paid"));
    }
    if (query.customerId) conditions.push(eq(invoices.customerId, query.customerId));
    if (query.search) conditions.push(ilike(invoices.number, `%${query.search}%`));
    if (query.from) conditions.push(gte(invoices.dueDate, query.from));
    if (query.to) conditions.push(lte(invoices.dueDate, query.to));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(invoices)
        .where(where)
        .orderBy(invoices.dueDate)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(invoices).where(where),
    ]);

    const children = await loadChildren(rows.map((row) => row.id));

    return {
      items: rows.map((row) =>
        buildInvoice(row, children.items.get(row.id) ?? [], children.payments.get(row.id) ?? []),
      ),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    const productIds = [...new Set(input.items.map((item) => item.productId))];

    return db.transaction(async (tx) => {
      const [customer] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.id, input.customerId));
      if (!customer) {
        return "not_found";
      }

      if (productIds.length > 0) {
        const rows = await tx
          .select({ id: products.id })
          .from(products)
          .where(inArray(products.id, productIds));
        if (rows.length !== productIds.length) {
          return "not_found";
        }
      }

      const numbers = await tx.select({ number: invoices.number }).from(invoices);
      const number = nextNumber("F", numbers.map((row) => row.number));
      const total = computeTotal(input.items);

      const [invoice] = await tx
        .insert(invoices)
        .values({
          customerId: input.customerId,
          orderId: input.orderId,
          number,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          status: deriveStatus(total, 0),
          total,
          totalPaid: 0,
        })
        .returning();

      const inserted =
        input.items.length > 0
          ? await tx
              .insert(invoiceItems)
              .values(
                input.items.map((item) => ({
                  invoiceId: invoice.id,
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  subtotal: computeSubtotal(item.quantity, item.unitPrice),
                })),
              )
              .returning()
          : [];

      return buildInvoice(invoice, inserted, []);
    });
  },

  async update(id, input) {
    const productIds = [...new Set(input.items.map((item) => item.productId))];

    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(invoices).where(eq(invoices.id, id));
      if (!current) {
        return "not_found";
      }
      if (current.status === "paid") {
        return "paid";
      }

      const currentItems = await tx
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, id));
      if (current.status === "partial" && !sameItems(currentItems, input.items)) {
        return "items_locked";
      }

      const [customer] = await tx
        .select({ id: customers.id })
        .from(customers)
        .where(eq(customers.id, input.customerId));
      if (!customer) {
        return "not_found";
      }

      if (productIds.length > 0) {
        const rows = await tx
          .select({ id: products.id })
          .from(products)
          .where(inArray(products.id, productIds));
        if (rows.length !== productIds.length) {
          return "not_found";
        }
      }

      const paymentRows = await tx
        .select()
        .from(invoicePayments)
        .where(eq(invoicePayments.invoiceId, id));
      const total = computeTotal(input.items);
      const totalPaid = computeTotalPaid(paymentRows);

      const [invoice] = await tx
        .update(invoices)
        .set({
          customerId: input.customerId,
          orderId: input.orderId,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          total,
          totalPaid,
          status: deriveStatus(total, totalPaid),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, id))
        .returning();

      await tx.delete(invoiceItems).where(eq(invoiceItems.invoiceId, id));

      const inserted =
        input.items.length > 0
          ? await tx
              .insert(invoiceItems)
              .values(
                input.items.map((item) => ({
                  invoiceId: id,
                  productId: item.productId,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  subtotal: computeSubtotal(item.quantity, item.unitPrice),
                })),
              )
              .returning()
          : [];

      return buildInvoice(invoice, inserted, paymentRows);
    });
  },

  async remove(id) {
    const [row] = await db
      .delete(invoices)
      .where(eq(invoices.id, id))
      .returning({ id: invoices.id });

    return Boolean(row);
  },

  async addPayment(id, input) {
    return db.transaction(async (tx) => {
      const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, id));
      if (!invoice) {
        return "not_found";
      }
      if (invoice.status === "paid") {
        return "paid";
      }

      const existing = await tx
        .select()
        .from(invoicePayments)
        .where(eq(invoicePayments.invoiceId, id));
      const projected = computeTotalPaid([...existing, input]);
      if (projected > invoice.total + 1e-6) {
        return "overpaid";
      }

      await tx.insert(invoicePayments).values({
        invoiceId: id,
        date: input.date,
        amount: input.amount,
        method: input.method,
        reference: input.reference,
        notes: input.notes,
      });

      const [updated] = await tx
        .update(invoices)
        .set({
          totalPaid: projected,
          status: deriveStatus(invoice.total, projected),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, id))
        .returning();

      const itemRows = await tx
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, id));
      const paymentRows = await tx
        .select()
        .from(invoicePayments)
        .where(eq(invoicePayments.invoiceId, id));

      return buildInvoice(updated, itemRows, paymentRows);
    });
  },

  async removePayment(id, paymentId) {
    return db.transaction(async (tx) => {
      const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, id));
      if (!invoice) {
        return "not_found";
      }

      const existing = await tx
        .select()
        .from(invoicePayments)
        .where(eq(invoicePayments.invoiceId, id));
      if (!existing.some((payment) => payment.id === paymentId)) {
        return "payment_not_found";
      }

      await tx.delete(invoicePayments).where(eq(invoicePayments.id, paymentId));

      const remaining = existing.filter((payment) => payment.id !== paymentId);
      const totalPaid = computeTotalPaid(remaining);

      const [updated] = await tx
        .update(invoices)
        .set({
          totalPaid,
          status: deriveStatus(invoice.total, totalPaid),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, id))
        .returning();

      const itemRows = await tx
        .select()
        .from(invoiceItems)
        .where(eq(invoiceItems.invoiceId, id));

      return buildInvoice(updated, itemRows, remaining);
    });
  },
};
