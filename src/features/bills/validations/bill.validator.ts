import { z } from "zod";

const billItemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1."),
  unitPrice: z.number().min(0, "El precio no puede ser negativo."),
});

export const billSchema = z
  .object({
    supplierId: z.string().min(1, "Selecciona un proveedor."),
    supplierNumber: z
      .string()
      .trim()
      .max(100, "El número no puede superar los 100 caracteres."),
    issueDate: z.string().min(1, "La fecha de emisión es obligatoria."),
    dueDate: z.string().min(1, "La fecha de vencimiento es obligatoria."),
    items: z.array(billItemSchema).min(1, "Agrega al menos un concepto."),
  })
  .refine((data) => data.dueDate >= data.issueDate, {
    message: "El vencimiento no puede ser anterior a la emisión.",
    path: ["dueDate"],
  });

export type BillFormValues = z.infer<typeof billSchema>;
