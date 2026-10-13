import { z } from "zod";

import { todayIso } from "../../../shared/utils/date";

export const discardSchema = z.object({
  cageId: z.string().min(1, "Selecciona una jaula."),
  discardDate: z
    .string()
    .min(1, "La fecha es obligatoria.")
    .refine((value) => value <= todayIso(), "La fecha no puede ser futura."),
  quantity: z.coerce
    .number()
    .int("La cantidad debe ser un número entero.")
    .min(1, "La cantidad debe ser al menos 1."),
});

export type DiscardFormValues = z.infer<typeof discardSchema>;
