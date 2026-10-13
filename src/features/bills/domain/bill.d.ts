export type BillStatus = "pending" | "partial" | "paid";

export type PaymentMethod = "cash" | "transfer" | "card" | "check" | "other";

export type BillItemInput = {
  name: string;
  unitPrice: number;
  quantity: number;
};

export type BillItem = BillItemInput & {
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

export type Bill = {
  id: string;
  supplierId: string;
  number: string;
  supplierNumber: string | null;
  issueDate: string;
  dueDate: string;
  status: BillStatus;
  items: BillItem[];
  total: number;
  payments: Payment[];
  totalPaid: number;
};

export type CreateBillInput = {
  supplierId: string;
  supplierNumber: string | null;
  issueDate: string;
  dueDate: string;
  items: BillItemInput[];
};

export type UpdateBillInput = CreateBillInput & {
  id: string;
};

export type BillsQuery = {
  search?: string;
  status?: BillStatus;
  supplierId?: string;
  from?: string;
  to?: string;
  includeHidden?: boolean;
  page: number;
  pageSize: number;
};
