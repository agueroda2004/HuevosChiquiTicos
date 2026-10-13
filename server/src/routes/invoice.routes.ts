import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { invoicesRepository } from "../repositories/invoice.repository.js";

const STATUSES = ["pending", "partial", "paid"] as const;
const METHODS = ["cash", "transfer", "card", "check", "other"] as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().finite().min(0),
});

const bodySchema = z.object({
  customerId: z.string().uuid(),
  orderId: z.string().uuid().nullable(),
  issueDate: dateSchema,
  dueDate: dateSchema,
  items: z.array(itemSchema).min(1),
});

const paymentSchema = z.object({
  date: dateSchema,
  amount: z.number().finite().positive(),
  method: z.enum(METHODS),
  reference: z.string().trim().max(200).nullable(),
  notes: z.string().trim().nullable(),
});

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(STATUSES).optional(),
  customerId: z.string().uuid().optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  includeHidden: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
});

export const invoiceRouter = Router();

invoiceRouter.use(requireAuth);

invoiceRouter.get("/invoices", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await invoicesRepository.list(parsed.data));
});

invoiceRouter.post("/invoices", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await invoicesRepository.create(parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El cliente o algún producto no existe." });
    return;
  }

  res.status(201).json(result);
});

invoiceRouter.patch("/invoices/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await invoicesRepository.update(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "La factura, el cliente o algún producto no existe." });
    return;
  }
  if (result === "paid") {
    res.status(409).json({ error: "No puedes editar una factura pagada." });
    return;
  }
  if (result === "items_locked") {
    res.status(409).json({
      error: "No puedes modificar los productos de una factura con pagos.",
    });
    return;
  }

  res.json(result);
});

invoiceRouter.delete("/invoices/:id", async (req, res) => {
  const removed = await invoicesRepository.remove(req.params.id);
  if (!removed) {
    res.status(404).json({ error: "La factura no existe." });
    return;
  }

  res.status(204).send();
});

invoiceRouter.post("/invoices/:id/payments", async (req, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await invoicesRepository.addPayment(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "La factura no existe." });
    return;
  }
  if (result === "paid") {
    res.status(409).json({ error: "Esta factura ya está pagada." });
    return;
  }
  if (result === "overpaid") {
    res.status(409).json({ error: "El monto no puede superar el saldo pendiente." });
    return;
  }

  res.status(201).json(result);
});

invoiceRouter.delete("/invoices/:id/payments/:paymentId", async (req, res) => {
  const result = await invoicesRepository.removePayment(req.params.id, req.params.paymentId);
  if (result === "not_found") {
    res.status(404).json({ error: "La factura no existe." });
    return;
  }
  if (result === "payment_not_found") {
    res.status(404).json({ error: "El pago no existe." });
    return;
  }

  res.json(result);
});
