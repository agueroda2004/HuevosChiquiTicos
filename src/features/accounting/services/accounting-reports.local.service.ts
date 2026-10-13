import { todayIso } from "../../../shared/utils/date";
import { billsLocalService } from "../../bills/services/bills.local.service";
import { customersLocalService } from "../../customers/services/customers.local.service";
import { invoicesLocalService } from "../../invoices/services/invoices.local.service";
import { productsLocalService } from "../../products/services/products.local.service";
import { suppliersLocalService } from "../../suppliers/services/suppliers.local.service";
import type {
  AccountingReport,
  AccountingReportsQuery,
  PartyBalance,
  ProductSales,
} from "../domain/accounting-report";
import type { AccountingReportsPort } from "../domain/accounting-report.ports";

const ALL_RECORDS = 100000;

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export const accountingReportsLocalService: AccountingReportsPort = {
  async getAccountingReport(query: AccountingReportsQuery): Promise<AccountingReport> {
    const topLimit = query.topLimit ?? 5;
    const { from, to } = query;

    const [invoicePage, billPage, customerPage, supplierPage, productPage] = await Promise.all([
      invoicesLocalService.list({ includeHidden: true, page: 1, pageSize: ALL_RECORDS }),
      billsLocalService.list({ includeHidden: true, page: 1, pageSize: ALL_RECORDS }),
      customersLocalService.list({ page: 1, pageSize: ALL_RECORDS }),
      suppliersLocalService.list({ page: 1, pageSize: ALL_RECORDS }),
      productsLocalService.list({ page: 1, pageSize: ALL_RECORDS }),
    ]);

    const invoices = invoicePage.items;
    const bills = billPage.items;
    const today = todayIso();
    const inRange = (date: string) => date >= from && date <= to;

    const receivables = {
      outstanding: roundCurrency(invoices.reduce((total, item) => total + (item.total - item.totalPaid), 0)),
      overdue: roundCurrency(
        invoices
          .filter((item) => item.status !== "paid" && item.dueDate < today)
          .reduce((total, item) => total + (item.total - item.totalPaid), 0),
      ),
      invoicedInRange: roundCurrency(
        invoices.filter((item) => inRange(item.issueDate)).reduce((total, item) => total + item.total, 0),
      ),
    };

    const payables = {
      outstanding: roundCurrency(bills.reduce((total, item) => total + (item.total - item.totalPaid), 0)),
      overdue: roundCurrency(
        bills
          .filter((item) => item.status !== "paid" && item.dueDate < today)
          .reduce((total, item) => total + (item.total - item.totalPaid), 0),
      ),
      invoicedInRange: roundCurrency(
        bills.filter((item) => inRange(item.issueDate)).reduce((total, item) => total + item.total, 0),
      ),
    };

    const cashMap = new Map<string, { income: number; expense: number }>();
    const addPoint = (date: string, key: "income" | "expense", amount: number) => {
      const point = cashMap.get(date) ?? { income: 0, expense: 0 };
      point[key] += amount;
      cashMap.set(date, point);
    };

    let income = 0;
    let expense = 0;

    for (const invoice of invoices) {
      for (const payment of invoice.payments) {
        if (inRange(payment.date)) {
          income += payment.amount;
          addPoint(payment.date, "income", payment.amount);
        }
      }
    }
    for (const bill of bills) {
      for (const payment of bill.payments) {
        if (inRange(payment.date)) {
          expense += payment.amount;
          addPoint(payment.date, "expense", payment.amount);
        }
      }
    }

    income = roundCurrency(income);
    expense = roundCurrency(expense);

    const series = [...cashMap.entries()]
      .map(([date, value]) => ({
        date,
        income: roundCurrency(value.income),
        expense: roundCurrency(value.expense),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const customerName = new Map(customerPage.items.map((item) => [item.id, item.name]));
    const customerTotals = new Map<string, number>();
    for (const invoice of invoices) {
      const outstanding = invoice.total - invoice.totalPaid;
      if (outstanding > 0) {
        customerTotals.set(invoice.customerId, (customerTotals.get(invoice.customerId) ?? 0) + outstanding);
      }
    }
    const topCustomers: PartyBalance[] = [...customerTotals.entries()]
      .map(([id, outstanding]) => ({
        id,
        name: customerName.get(id) ?? "Cliente eliminado",
        outstanding: roundCurrency(outstanding),
      }))
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, topLimit);

    const supplierName = new Map(supplierPage.items.map((item) => [item.id, item.name]));
    const supplierTotals = new Map<string, number>();
    for (const bill of bills) {
      const outstanding = bill.total - bill.totalPaid;
      if (outstanding > 0) {
        supplierTotals.set(bill.supplierId, (supplierTotals.get(bill.supplierId) ?? 0) + outstanding);
      }
    }
    const topSuppliers: PartyBalance[] = [...supplierTotals.entries()]
      .map(([id, outstanding]) => ({
        id,
        name: supplierName.get(id) ?? "Proveedor eliminado",
        outstanding: roundCurrency(outstanding),
      }))
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, topLimit);

    const productName = new Map(productPage.items.map((item) => [item.id, item.name]));
    const productTotals = new Map<string, { quantity: number; amount: number }>();
    for (const invoice of invoices) {
      if (!inRange(invoice.issueDate)) continue;
      for (const item of invoice.items) {
        const entry = productTotals.get(item.productId) ?? { quantity: 0, amount: 0 };
        entry.quantity += item.quantity;
        entry.amount += item.subtotal;
        productTotals.set(item.productId, entry);
      }
    }
    const topProducts: ProductSales[] = [...productTotals.entries()]
      .map(([productId, value]) => ({
        productId,
        name: productName.get(productId) ?? "Producto eliminado",
        quantity: value.quantity,
        amount: roundCurrency(value.amount),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, topLimit);

    return {
      range: { from, to },
      receivables,
      payables,
      cashFlow: { income, expense, net: roundCurrency(income - expense), series },
      topCustomers,
      topSuppliers,
      topProducts,
    };
  },
};
