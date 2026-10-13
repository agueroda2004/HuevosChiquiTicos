export type AccountingReportsQuery = {
  from: string;
  to: string;
  topLimit?: number;
};

export type CashFlowPoint = {
  date: string;
  income: number;
  expense: number;
};

export type PartyBalance = {
  id: string;
  name: string;
  outstanding: number;
};

export type ProductSales = {
  productId: string;
  name: string;
  quantity: number;
  amount: number;
};

export type AccountingReport = {
  range: {
    from: string;
    to: string;
  };
  receivables: {
    outstanding: number;
    overdue: number;
    invoicedInRange: number;
  };
  payables: {
    outstanding: number;
    overdue: number;
    invoicedInRange: number;
  };
  cashFlow: {
    income: number;
    expense: number;
    net: number;
    series: CashFlowPoint[];
  };
  topCustomers: PartyBalance[];
  topSuppliers: PartyBalance[];
  topProducts: ProductSales[];
};
