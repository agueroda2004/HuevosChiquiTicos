import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { entriesRepository } from "../repositories/entry.repository.js";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const bodySchema = z.object({
  quantity: z.number().int().min(1),
  cageId: z.string().uuid(),
  entryDate: dateSchema,
});

const listQuerySchema = z.object({
  cageId: z.string().uuid().optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
});

export const entryRouter = Router();

entryRouter.use(requireAuth);

entryRouter.get("/entries", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await entriesRepository.list(parsed.data));
});

entryRouter.post("/entries", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await entriesRepository.create(parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "La jaula no existe." });
    return;
  }

  res.status(201).json(result);
});

entryRouter.patch("/entries/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await entriesRepository.update(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El registro no existe." });
    return;
  }
  if (result === "insufficient") {
    res.status(409).json({ error: "No hay suficientes aves en la jaula." });
    return;
  }

  res.json(result);
});

entryRouter.delete("/entries/:id", async (req, res) => {
  const result = await entriesRepository.remove(req.params.id);
  if (result === "not_found") {
    res.status(404).json({ error: "El registro no existe." });
    return;
  }
  if (result === "insufficient") {
    res.status(409).json({ error: "No hay suficientes aves en la jaula." });
    return;
  }

  res.status(204).send();
});
