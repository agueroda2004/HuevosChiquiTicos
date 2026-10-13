export interface AccountingReportsQuery {
  from: string;
  to: string;
  topLimit?: number;
}

export interface CashFlowPoint {
  date: string;
  income: number;
  expense: number;
}

export interface PartyBalance {
  id: string;
  name: string;
  outstanding: number;
}

export interface ProductSales {
  productId: string;
  name: string;
  quantity: number;
  amount: number;
}

export interface AccountingReport {
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
}
