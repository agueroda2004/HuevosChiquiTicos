import { and, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "../db/client.js";
import {
  billPayments,
  bills,
  customers,
  invoiceItems,
  invoicePayments,
  invoices,
  products,
  suppliers,
} from "../db/schema.js";
import type { AccountingReportsPort } from "../domain/ports/accounting-report.ports.js";
import type {
  AccountingReport,
  AccountingReportsQuery,
  CashFlowPoint,
  PartyBalance,
  ProductSales,
} from "../domain/types/accounting-report.js";
import { roundCurrency } from "./calc.js";

export const accountingReportsRepository: AccountingReportsPort = {
  async getAccountingReport(query: AccountingReportsQuery): Promise<AccountingReport> {
    const topLimit = query.topLimit ?? 5;
    const { from, to } = query;
    const today = new Date().toISOString().slice(0, 10);

    const [receivablesRow, payablesRow, incomeRows, expenseRows, topCustomerRows, topSupplierRows, topProductRows] =
      await Promise.all([
        db
          .select({
            outstanding: sql<number>`coalesce(sum(${invoices.total} - ${invoices.totalPaid}), 0)::double precision`,
            overdue: sql<number>`coalesce(sum(case when ${invoices.status} <> 'paid' and ${invoices.dueDate} < ${today} then ${invoices.total} - ${invoices.totalPaid} else 0 end), 0)::double precision`,
            invoiced: sql<number>`coalesce(sum(case when ${invoices.issueDate} >= ${from} and ${invoices.issueDate} <= ${to} then ${invoices.total} else 0 end), 0)::double precision`,
          })
          .from(invoices),
        db
          .select({
            outstanding: sql<number>`coalesce(sum(${bills.total} - ${bills.totalPaid}), 0)::double precision`,
            overdue: sql<number>`coalesce(sum(case when ${bills.status} <> 'paid' and ${bills.dueDate} < ${today} then ${bills.total} - ${bills.totalPaid} else 0 end), 0)::double precision`,
            invoiced: sql<number>`coalesce(sum(case when ${bills.issueDate} >= ${from} and ${bills.issueDate} <= ${to} then ${bills.total} else 0 end), 0)::double precision`,
          })
          .from(bills),
        db
          .select({
            date: invoicePayments.date,
            amount: sql<number>`coalesce(sum(${invoicePayments.amount}), 0)::double precision`,
          })
          .from(invoicePayments)
          .where(and(gte(invoicePayments.date, from), lte(invoicePayments.date, to)))
          .groupBy(invoicePayments.date),
        db
          .select({
            date: billPayments.date,
            amount: sql<number>`coalesce(sum(${billPayments.amount}), 0)::double precision`,
          })
          .from(billPayments)
          .where(and(gte(billPayments.date, from), lte(billPayments.date, to)))
          .groupBy(billPayments.date),
        db
          .select({
            id: invoices.customerId,
            name: customers.name,
            outstanding: sql<number>`coalesce(sum(${invoices.total} - ${invoices.totalPaid}), 0)::double precision`,
          })
          .from(invoices)
          .innerJoin(customers, eq(customers.id, invoices.customerId))
          .groupBy(invoices.customerId, customers.name)
          .having(sql`coalesce(sum(${invoices.total} - ${invoices.totalPaid}), 0) > 0`)
          .orderBy(sql`sum(${invoices.total} - ${invoices.totalPaid}) desc`)
          .limit(topLimit),
        db
          .select({
            id: bills.supplierId,
            name: suppliers.name,
            outstanding: sql<number>`coalesce(sum(${bills.total} - ${bills.totalPaid}), 0)::double precision`,
          })
          .from(bills)
          .innerJoin(suppliers, eq(suppliers.id, bills.supplierId))
          .groupBy(bills.supplierId, suppliers.name)
          .having(sql`coalesce(sum(${bills.total} - ${bills.totalPaid}), 0) > 0`)
          .orderBy(sql`sum(${bills.total} - ${bills.totalPaid}) desc`)
          .limit(topLimit),
        db
          .select({
            productId: invoiceItems.productId,
            name: products.name,
            quantity: sql<number>`coalesce(sum(${invoiceItems.quantity}), 0)::int`,
            amount: sql<number>`coalesce(sum(${invoiceItems.subtotal}), 0)::double precision`,
          })
          .from(invoiceItems)
          .innerJoin(invoices, eq(invoices.id, invoiceItems.invoiceId))
          .innerJoin(products, eq(products.id, invoiceItems.productId))
          .where(and(gte(invoices.issueDate, from), lte(invoices.issueDate, to)))
          .groupBy(invoiceItems.productId, products.name)
          .orderBy(sql`sum(${invoiceItems.subtotal}) desc`)
          .limit(topLimit),
      ]);

    const cashMap = new Map<string, { income: number; expense: number }>();
    for (const row of incomeRows) {
      const point = cashMap.get(row.date) ?? { income: 0, expense: 0 };
      point.income = row.amount;
      cashMap.set(row.date, point);
    }
    for (const row of expenseRows) {
      const point = cashMap.get(row.date) ?? { income: 0, expense: 0 };
      point.expense = row.amount;
      cashMap.set(row.date, point);
    }

    const series: CashFlowPoint[] = [...cashMap.entries()]
      .map(([date, value]) => ({
        date,
        income: roundCurrency(value.income),
        expense: roundCurrency(value.expense),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const income = roundCurrency(incomeRows.reduce((sum, row) => sum + row.amount, 0));
    const expense = roundCurrency(expenseRows.reduce((sum, row) => sum + row.amount, 0));

    const topCustomers: PartyBalance[] = topCustomerRows.map((row) => ({
      id: row.id,
      name: row.name,
      outstanding: roundCurrency(row.outstanding),
    }));

    const topSuppliers: PartyBalance[] = topSupplierRows.map((row) => ({
      id: row.id,
      name: row.name,
      outstanding: roundCurrency(row.outstanding),
    }));

    const topProducts: ProductSales[] = topProductRows.map((row) => ({
      productId: row.productId,
      name: row.name,
      quantity: row.quantity,
      amount: roundCurrency(row.amount),
    }));

    return {
      range: { from, to },
      receivables: {
        outstanding: roundCurrency(receivablesRow[0].outstanding),
        overdue: roundCurrency(receivablesRow[0].overdue),
        invoicedInRange: roundCurrency(receivablesRow[0].invoiced),
      },
      payables: {
        outstanding: roundCurrency(payablesRow[0].outstanding),
        overdue: roundCurrency(payablesRow[0].overdue),
        invoicedInRange: roundCurrency(payablesRow[0].invoiced),
      },
      cashFlow: {
        income,
        expense,
        net: roundCurrency(income - expense),
        series,
      },
      topCustomers,
      topSuppliers,
      topProducts,
    };
  },
};
