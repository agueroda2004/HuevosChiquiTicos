import { z } from "zod";

const EMAIL_MAX = 100;
const ADDRESS_MAX = 500;

export const supplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  email: z
    .string()
    .trim()
    .max(EMAIL_MAX, "El correo no puede superar los 100 caracteres.")
    .refine(
      (value) => value === "" || z.email().safeParse(value).success,
      "Ingresa un correo válido.",
    ),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{8}$/.test(value),
      "El teléfono debe tener 8 dígitos.",
    ),
  address: z
    .string()
    .trim()
    .max(ADDRESS_MAX, "La dirección no puede superar los 500 caracteres."),
  active: z.boolean(),
});

export type SupplierFormValues = z.infer<typeof supplierSchema>;
