import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { ordersRepository } from "../repositories/order.repository.js";

const ORDER_STATUSES = ["pending", "ready", "delivered"] as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const bodySchema = z.object({
  customerId: z.string().uuid(),
  deliveryDate: dateSchema,
  status: z.enum(ORDER_STATUSES),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
        unitPrice: z.number().finite().min(0),
      }),
    )
    .min(1),
});

const listQuerySchema = z.object({
  customerId: z.string().uuid().optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
});

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.get("/orders", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await ordersRepository.list(parsed.data));
});

orderRouter.post("/orders", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await ordersRepository.create(parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El cliente o algún producto no existe." });
    return;
  }

  res.status(201).json(result);
});

orderRouter.patch("/orders/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await ordersRepository.update(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El pedido, el cliente o algún producto no existe." });
    return;
  }

  res.json(result);
});

orderRouter.delete("/orders/:id", async (req, res) => {
  const removed = await ordersRepository.remove(req.params.id);
  if (!removed) {
    res.status(404).json({ error: "El pedido no existe." });
    return;
  }

  res.status(204).send();
});
