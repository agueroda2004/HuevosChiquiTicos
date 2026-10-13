export type PaymentMethod = "cash" | "transfer" | "card" | "check" | "other";

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
}

export interface CreatePaymentDTO {
  date: string;
  amount: number;
  method: PaymentMethod;
  reference: string | null;
  notes: string | null;
}
