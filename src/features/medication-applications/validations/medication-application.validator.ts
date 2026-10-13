import { z } from "zod";

import { todayIso } from "../../../shared/utils/date";

export const medicationApplicationSchema = z.object({
  cageIds: z.array(z.string().min(1)).min(1, "Selecciona al menos una jaula."),
  medicationId: z.string().min(1, "Selecciona un medicamento."),
  dose: z.string().trim().min(1, "La dosis es obligatoria."),
  applicationDate: z
    .string()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => value <= todayIso(), "La fecha no puede ser futura."),
  birdCount: z.coerce
    .number()
    .int("La cantidad de aves debe ser un número entero.")
    .min(1, "La cantidad de aves debe ser al menos 1."),
  type: z.enum(["food", "water", "fumigation", "injection"]).nullable(),
});

export type MedicationApplicationFormValues = z.infer<typeof medicationApplicationSchema>;
