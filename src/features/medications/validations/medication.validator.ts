import { z } from "zod";

export const medicationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  active: z.boolean(),
});

export type MedicationFormValues = z.infer<typeof medicationSchema>;
