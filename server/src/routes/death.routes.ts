import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { deathsRepository } from "../repositories/death.repository.js";

const DEATH_TYPES = ["sacrifice", "disease", "other"] as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const bodySchema = z.object({
  deathDate: dateSchema,
  cageId: z.string().uuid(),
  quantity: z.number().int().min(1),
  type: z.enum(DEATH_TYPES),
});

const listQuerySchema = z.object({
  cageId: z.string().uuid().optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  type: z.enum(DEATH_TYPES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
});

export const deathRouter = Router();

deathRouter.use(requireAuth);

deathRouter.get("/deaths", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await deathsRepository.list(parsed.data));
});

deathRouter.post("/deaths", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await deathsRepository.create(parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "La jaula no existe." });
    return;
  }
  if (result === "insufficient") {
    res.status(409).json({ error: "No hay suficientes aves en la jaula." });
    return;
  }

  res.status(201).json(result);
});

deathRouter.patch("/deaths/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await deathsRepository.update(req.params.id, parsed.data);
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

deathRouter.delete("/deaths/:id", async (req, res) => {
  const result = await deathsRepository.remove(req.params.id);
  if (result === "not_found") {
    res.status(404).json({ error: "El registro no existe." });
    return;
  }

  res.status(204).send();
});
