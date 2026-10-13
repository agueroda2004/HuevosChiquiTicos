import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { eggCollectionsRepository } from "../repositories/egg-collection.repository.js";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const bodySchema = z.object({
  cageId: z.string().uuid(),
  collectionDate: dateSchema,
  quantity: z.number().int().min(1),
});

const listQuerySchema = z.object({
  cageId: z.string().uuid().optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
});

export const eggCollectionRouter = Router();

eggCollectionRouter.use(requireAuth);

eggCollectionRouter.get("/egg-collections", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await eggCollectionsRepository.list(parsed.data));
});

eggCollectionRouter.post("/egg-collections", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await eggCollectionsRepository.create(parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "La jaula no existe." });
    return;
  }

  res.status(201).json(result);
});

eggCollectionRouter.patch("/egg-collections/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await eggCollectionsRepository.update(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El registro no existe." });
    return;
  }

  res.json(result);
});

eggCollectionRouter.delete("/egg-collections/:id", async (req, res) => {
  const removed = await eggCollectionsRepository.remove(req.params.id);
  if (!removed) {
    res.status(404).json({ error: "El registro no existe." });
    return;
  }

  res.status(204).send();
});
