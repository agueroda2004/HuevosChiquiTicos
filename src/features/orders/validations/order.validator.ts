import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto."),
  quantity: z.number().int().min(1, "La cantidad debe ser al menos 1."),
  unitPrice: z.number().min(0, "El precio no puede ser negativo."),
});

export const orderSchema = z.object({
  customerId: z.string().min(1, "Selecciona un cliente."),
  deliveryDate: z.string().min(1, "La fecha de entrega es obligatoria."),
  status: z.enum(["pending", "ready", "delivered"]),
  items: z.array(orderItemSchema).min(1, "Agrega al menos un producto."),
});

export type OrderFormValues = z.infer<typeof orderSchema>;
