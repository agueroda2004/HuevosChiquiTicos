import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { customersRepository } from "../repositories/customer.repository.js";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().max(100).nullable(),
  phone: z.string().trim().max(8).nullable(),
  address: z.string().trim().nullable(),
  active: z.boolean(),
});

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
});

export const customerRouter = Router();

customerRouter.use(requireAuth);

customerRouter.get("/customers", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await customersRepository.list(parsed.data));
});

customerRouter.post("/customers", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await customersRepository.create(parsed.data);
  if (result === "duplicate") {
    res.status(409).json({ error: "Ya existe un cliente con ese nombre." });
    return;
  }

  res.status(201).json(result);
});

customerRouter.patch("/customers/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await customersRepository.update(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El cliente no existe." });
    return;
  }
  if (result === "duplicate") {
    res.status(409).json({ error: "Ya existe un cliente con ese nombre." });
    return;
  }

  res.json(result);
});

customerRouter.delete("/customers/:id", async (req, res) => {
  const result = await customersRepository.remove(req.params.id);

  if (result === "not_found") {
    res.status(404).json({ error: "El cliente no existe." });
    return;
  }
  if (result === "in_use") {
    res.status(409).json({
      error: "No se puede eliminar el cliente porque tiene pedidos o facturas asociadas.",
    });
    return;
  }

  res.status(204).send();
});
