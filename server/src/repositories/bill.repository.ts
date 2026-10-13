import { and, eq, gte, inArray, lte, ne, sql, type SQL } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  billItems,
  billPayments,
  bills,
  suppliers,
  type BillItemRow,
  type BillPaymentRow,
  type BillRow,
} from "../db/schema.js";
import type { BillsPort } from "../domain/ports/bill.ports.js";
import type { Bill, BillItem, BillItemInput, BillsQuery } from "../domain/types/bill.js";
import type { Payment } from "../domain/types/payment.js";
import {
  computeSubtotal,
  computeTotal,
  computeTotalPaid,
  deriveStatus,
  nextNumber,
} from "./calc.js";

function toBillItem(row: BillItemRow): BillItem {
  return {
    id: row.id,
    name: row.name,
    unitPrice: row.unitPrice,
    quantity: row.quantity,
    subtotal: row.subtotal,
  };
}

function toPayment(row: BillPaymentRow): Payment {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    method: row.method,
    reference: row.reference,
    notes: row.notes,
  };
}

function buildBill(row: BillRow, items: BillItemRow[], payments: BillPaymentRow[]): Bill {
  return {
    id: row.id,
    supplierId: row.supplierId,
    number: row.number,
    supplierNumber: row.supplierNumber,
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    status: row.status,
    items: items.map(toBillItem),
    total: row.total,
    payments: payments.map(toPayment),
    totalPaid: row.totalPaid,
  };
}

function sameItems(current: BillItemRow[], next: BillItemInput[]): boolean {
  if (current.length !== next.length) return false;

  return current.every((item, index) => {
    const other = next[index];
    return (
      Boolean(other) &&
      item.name === other.name &&
      item.quantity === other.quantity &&
      item.unitPrice === other.unitPrice
    );
  });
}

async function loadChildren(
  ids: string[],
): Promise<{ items: Map<string, BillItemRow[]>; payments: Map<string, BillPaymentRow[]> }> {
  const items = new Map<string, BillItemRow[]>();
  const payments = new Map<string, BillPaymentRow[]>();
  if (ids.length === 0) return { items, payments };

  const [itemRows, paymentRows] = await Promise.all([
    db.select().from(billItems).where(inArray(billItems.billId, ids)),
    db.select().from(billPayments).where(inArray(billPayments.billId, ids)),
  ]);

  for (const row of itemRows) {
    const list = items.get(row.billId) ?? [];
    list.push(row);
    items.set(row.billId, list);
  }
  for (const row of paymentRows) {
    const list = payments.get(row.billId) ?? [];
    list.push(row);
    payments.set(row.billId, list);
  }

  return { items, payments };
}

export const billsRepository: BillsPort = {
  async list(query: BillsQuery) {
    const conditions: SQL[] = [];
    if (query.status) {
      conditions.push(eq(bills.status, query.status));
    } else if (!query.includeHidden) {
      conditions.push(ne(bills.status, "paid"));
    }
    if (query.supplierId) conditions.push(eq(bills.supplierId, query.supplierId));
    if (query.search) {
      conditions.push(
        sql`(lower(${bills.number}) like lower(${"%" + query.search + "%"}) or lower(coalesce(${bills.supplierNumber}, '')) like lower(${"%" + query.search + "%"}))`,
      );
    }
    if (query.from) conditions.push(gte(bills.dueDate, query.from));
    if (query.to) conditions.push(lte(bills.dueDate, query.to));
    const where = conditions.length ? and(...conditions) : undefined;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(bills)
        .where(where)
        .orderBy(bills.dueDate)
        .limit(query.pageSize)
        .offset((query.page - 1) * query.pageSize),
      db.select({ value: sql<number>`count(*)::int` }).from(bills).where(where),
    ]);

    const children = await loadChildren(rows.map((row) => row.id));

    return {
      items: rows.map((row) =>
        buildBill(row, children.items.get(row.id) ?? [], children.payments.get(row.id) ?? []),
      ),
      total: totals[0].value,
      page: query.page,
      pageSize: query.pageSize,
    };
  },

  async create(input) {
    return db.transaction(async (tx) => {
      const [supplier] = await tx
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.id, input.supplierId));
      if (!supplier) {
        return "not_found";
      }

      const numbers = await tx.select({ number: bills.number }).from(bills);
      const number = nextNumber("P", numbers.map((row) => row.number));
      const total = computeTotal(input.items);

      const [bill] = await tx
        .insert(bills)
        .values({
          supplierId: input.supplierId,
          supplierNumber: input.supplierNumber,
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
              .insert(billItems)
              .values(
                input.items.map((item) => ({
                  billId: bill.id,
                  name: item.name,
                  unitPrice: item.unitPrice,
                  quantity: item.quantity,
                  subtotal: computeSubtotal(item.quantity, item.unitPrice),
                })),
              )
              .returning()
          : [];

      return buildBill(bill, inserted, []);
    });
  },

  async update(id, input) {
    return db.transaction(async (tx) => {
      const [current] = await tx.select().from(bills).where(eq(bills.id, id));
      if (!current) {
        return "not_found";
      }
      if (current.status === "paid") {
        return "paid";
      }

      const currentItems = await tx.select().from(billItems).where(eq(billItems.billId, id));
      if (current.status === "partial" && !sameItems(currentItems, input.items)) {
        return "items_locked";
      }

      const [supplier] = await tx
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.id, input.supplierId));
      if (!supplier) {
        return "not_found";
      }

      const paymentRows = await tx
        .select()
        .from(billPayments)
        .where(eq(billPayments.billId, id));
      const total = computeTotal(input.items);
      const totalPaid = computeTotalPaid(paymentRows);

      const [bill] = await tx
        .update(bills)
        .set({
          supplierId: input.supplierId,
          supplierNumber: input.supplierNumber,
          issueDate: input.issueDate,
          dueDate: input.dueDate,
          total,
          totalPaid,
          status: deriveStatus(total, totalPaid),
          updatedAt: new Date(),
        })
        .where(eq(bills.id, id))
        .returning();

      await tx.delete(billItems).where(eq(billItems.billId, id));

      const inserted =
        input.items.length > 0
          ? await tx
              .insert(billItems)
              .values(
                input.items.map((item) => ({
                  billId: id,
                  name: item.name,
                  unitPrice: item.unitPrice,
                  quantity: item.quantity,
                  subtotal: computeSubtotal(item.quantity, item.unitPrice),
                })),
              )
              .returning()
          : [];

      return buildBill(bill, inserted, paymentRows);
    });
  },

  async remove(id) {
    const [row] = await db
      .delete(bills)
      .where(eq(bills.id, id))
      .returning({ id: bills.id });

    return Boolean(row);
  },

  async addPayment(id, input) {
    return db.transaction(async (tx) => {
      const [bill] = await tx.select().from(bills).where(eq(bills.id, id));
      if (!bill) {
        return "not_found";
      }
      if (bill.status === "paid") {
        return "paid";
      }

      const existing = await tx
        .select()
        .from(billPayments)
        .where(eq(billPayments.billId, id));
      const projected = computeTotalPaid([...existing, input]);
      if (projected > bill.total + 1e-6) {
        return "overpaid";
      }

      await tx.insert(billPayments).values({
        billId: id,
        date: input.date,
        amount: input.amount,
        method: input.method,
        reference: input.reference,
        notes: input.notes,
      });

      const [updated] = await tx
        .update(bills)
        .set({
          totalPaid: projected,
          status: deriveStatus(bill.total, projected),
          updatedAt: new Date(),
        })
        .where(eq(bills.id, id))
        .returning();

      const itemRows = await tx.select().from(billItems).where(eq(billItems.billId, id));
      const paymentRows = await tx
        .select()
        .from(billPayments)
        .where(eq(billPayments.billId, id));

      return buildBill(updated, itemRows, paymentRows);
    });
  },

  async removePayment(id, paymentId) {
    return db.transaction(async (tx) => {
      const [bill] = await tx.select().from(bills).where(eq(bills.id, id));
      if (!bill) {
        return "not_found";
      }

      const existing = await tx
        .select()
        .from(billPayments)
        .where(eq(billPayments.billId, id));
      if (!existing.some((payment) => payment.id === paymentId)) {
        return "payment_not_found";
      }

      await tx.delete(billPayments).where(eq(billPayments.id, paymentId));

      const remaining = existing.filter((payment) => payment.id !== paymentId);
      const totalPaid = computeTotalPaid(remaining);

      const [updated] = await tx
        .update(bills)
        .set({
          totalPaid,
          status: deriveStatus(bill.total, totalPaid),
          updatedAt: new Date(),
        })
        .where(eq(bills.id, id))
        .returning();

      const itemRows = await tx.select().from(billItems).where(eq(billItems.billId, id));

      return buildBill(updated, itemRows, remaining);
    });
  },
};
