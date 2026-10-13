export type InvoiceStatus = "pending" | "partial" | "paid";

export type PaymentMethod = "cash" | "transfer" | "card" | "check" | "other";

export type InvoiceItemInput = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceItem = InvoiceItemInput & {
  id: string;
  subtotal: number;
};

export type PaymentInput = {
  date: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
};

export type Payment = PaymentInput & {
  id: string;
};

export type Invoice = {
  id: string;
  customerId: string;
  orderId: string | null;
  number: string;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  total: number;
  payments: Payment[];
  totalPaid: number;
};

export type CreateInvoiceInput = {
  customerId: string;
  orderId: string | null;
  issueDate: string;
  dueDate: string;
  items: InvoiceItemInput[];
};

export type UpdateInvoiceInput = CreateInvoiceInput & {
  id: string;
};

export type InvoicesQuery = {
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
  from?: string;
  to?: string;
  includeHidden?: boolean;
  page: number;
  pageSize: number;
};
