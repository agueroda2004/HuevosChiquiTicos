import { z } from "zod";

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto."),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1."),
  unitPrice: z.number().min(0, "El precio no puede ser negativo."),
});

export const invoiceSchema = z
  .object({
    customerId: z.string().min(1, "Selecciona un cliente."),
    orderId: z.string(),
    issueDate: z.string().min(1, "La fecha de emisión es obligatoria."),
    dueDate: z.string().min(1, "La fecha de vencimiento es obligatoria."),
    items: z.array(invoiceItemSchema).min(1, "Agrega al menos un producto."),
  })
  .refine((data) => data.dueDate >= data.issueDate, {
    message: "El vencimiento no puede ser anterior a la emisión.",
    path: ["dueDate"],
  });

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;
