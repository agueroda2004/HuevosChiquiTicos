import { z } from "zod";

export const paymentSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria."),
  amount: z
    .string()
    .trim()
    .min(1, "El monto es obligatorio.")
    .refine((value) => !Number.isNaN(Number(value)), "El monto debe ser un número.")
    .refine((value) => Number(value) > 0, "El monto debe ser mayor a 0.")
    .refine(
      (value) => Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) < 1e-6,
      "El monto admite hasta 2 decimales.",
    )
    .transform((value) => Number(value)),
  method: z.enum(["cash", "transfer", "card", "check", "other"]),
  reference: z
    .string()
    .trim()
    .max(200, "La referencia no puede superar los 200 caracteres."),
  notes: z.string().trim().max(1000, "Las notas no pueden superar los 1000 caracteres."),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
