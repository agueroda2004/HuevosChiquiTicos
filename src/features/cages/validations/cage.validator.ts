import { z } from "zod";

const cageNameSchema = z
  .string()
  .trim()
  .min(1, "El nombre es obligatorio.")
  .max(50, "El nombre no puede superar los 50 caracteres.");

const cageActiveSchema = z.boolean();

export const cageSchema = z.object({
  name: cageNameSchema,
  birds: z.coerce
    .number()
    .int("La cantidad de aves debe ser un número entero.")
    .min(0, "La cantidad de aves no puede ser negativa."),
  active: cageActiveSchema,
});

export type CageFormValues = z.infer<typeof cageSchema>;

export const cageUpdateSchema = z.object({
  name: cageNameSchema,
  active: cageActiveSchema,
});

export type CageUpdateFormValues = z.infer<typeof cageUpdateSchema>;
