import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { billsRepository } from "../repositories/bill.repository.js";

const STATUSES = ["pending", "partial", "paid"] as const;
const METHODS = ["cash", "transfer", "card", "check", "other"] as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const itemSchema = z.object({
  name: z.string().trim().min(1).max(100),
  unitPrice: z.number().finite().min(0),
  quantity: z.number().int().min(1),
});

const bodySchema = z.object({
  supplierId: z.string().uuid(),
  supplierNumber: z.string().trim().max(100).nullable(),
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
  supplierId: z.string().uuid().optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  includeHidden: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
});

export const billRouter = Router();

billRouter.use(requireAuth);

billRouter.get("/bills", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await billsRepository.list(parsed.data));
});

billRouter.post("/bills", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await billsRepository.create(parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El proveedor no existe." });
    return;
  }

  res.status(201).json(result);
});

billRouter.patch("/bills/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await billsRepository.update(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "La factura o el proveedor no existe." });
    return;
  }
  if (result === "paid") {
    res.status(409).json({ error: "No puedes editar una factura pagada." });
    return;
  }
  if (result === "items_locked") {
    res.status(409).json({
      error: "No puedes modificar los conceptos de una factura con pagos.",
    });
    return;
  }

  res.json(result);
});

billRouter.delete("/bills/:id", async (req, res) => {
  const removed = await billsRepository.remove(req.params.id);
  if (!removed) {
    res.status(404).json({ error: "La factura no existe." });
    return;
  }

  res.status(204).send();
});

billRouter.post("/bills/:id/payments", async (req, res) => {
  const parsed = paymentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await billsRepository.addPayment(req.params.id, parsed.data);
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

billRouter.delete("/bills/:id/payments/:paymentId", async (req, res) => {
  const result = await billsRepository.removePayment(req.params.id, req.params.paymentId);
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
