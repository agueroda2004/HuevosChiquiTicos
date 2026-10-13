import type { InvoiceStatus } from "./invoice.js";
import type { Payment } from "./payment.js";

export interface BillItemInput {
  name: string;
  unitPrice: number;
  quantity: number;
}

export interface BillItem extends BillItemInput {
  id: string;
  subtotal: number;
}

export interface Bill {
  id: string;
  supplierId: string;
  number: string;
  supplierNumber: string | null;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: BillItem[];
  total: number;
  payments: Payment[];
  totalPaid: number;
}

export interface CreateBillDTO {
  supplierId: string;
  supplierNumber: string | null;
  issueDate: string;
  dueDate: string;
  items: BillItemInput[];
}

export interface UpdateBillDTO {
  supplierId: string;
  supplierNumber: string | null;
  issueDate: string;
  dueDate: string;
  items: BillItemInput[];
}

export interface BillsQuery {
  search?: string;
  status?: InvoiceStatus;
  supplierId?: string;
  from?: string;
  to?: string;
  includeHidden?: boolean;
  page: number;
  pageSize: number;
}
