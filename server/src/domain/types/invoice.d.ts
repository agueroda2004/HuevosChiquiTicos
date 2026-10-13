import type { Payment } from "./payment.js";

export type InvoiceStatus = "pending" | "partial" | "paid";

export interface InvoiceItemInput {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceItem extends InvoiceItemInput {
  id: string;
  subtotal: number;
}

export interface Invoice {
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
}

export interface CreateInvoiceDTO {
  customerId: string;
  orderId: string | null;
  issueDate: string;
  dueDate: string;
  items: InvoiceItemInput[];
}

export interface UpdateInvoiceDTO {
  customerId: string;
  orderId: string | null;
  issueDate: string;
  dueDate: string;
  items: InvoiceItemInput[];
}

export interface InvoicesQuery {
  search?: string;
  status?: InvoiceStatus;
  customerId?: string;
  from?: string;
  to?: string;
  includeHidden?: boolean;
  page: number;
  pageSize: number;
}
