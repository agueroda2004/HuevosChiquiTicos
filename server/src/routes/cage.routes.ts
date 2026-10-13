import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { cagesRepository } from "../repositories/cage.repository.js";

const createCageSchema = z.object({
  name: z.string().trim().min(1).max(100),
  birds: z.number().int().min(0),
  active: z.boolean(),
});

const updateCageSchema = z.object({
  name: z.string().trim().min(1).max(100),
  active: z.boolean(),
});

const adjustBirdsSchema = z.object({
  delta: z.number().int(),
});

export const cageRouter = Router();

cageRouter.use(requireAuth);

cageRouter.get("/cages", async (_req, res) => {
  res.json(await cagesRepository.list());
});

cageRouter.post("/cages", async (req, res) => {
  const parsed = createCageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await cagesRepository.create(parsed.data);
  if (result === "duplicate") {
    res.status(409).json({ error: "Ya existe una jaula con ese nombre." });
    return;
  }

  res.status(201).json(result);
});

cageRouter.patch("/cages/:id/birds", async (req, res) => {
  const parsed = adjustBirdsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await cagesRepository.adjustBirds(req.params.id, parsed.data.delta);

  if (result === "not_found") {
    res.status(404).json({ error: "La jaula no existe." });
    return;
  }

  if (result === "insufficient") {
    res.status(409).json({ error: "No hay suficientes aves en la jaula." });
    return;
  }

  res.json(result);
});

cageRouter.patch("/cages/:id", async (req, res) => {
  const parsed = updateCageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await cagesRepository.update(req.params.id, parsed.data);

  if (result === "not_found") {
    res.status(404).json({ error: "La jaula no existe." });
    return;
  }

  if (result === "duplicate") {
    res.status(409).json({ error: "Ya existe una jaula con ese nombre." });
    return;
  }

  res.json(result);
});

cageRouter.delete("/cages/:id", async (req, res) => {
  const result = await cagesRepository.remove(req.params.id);

  if (result === "not_found") {
    res.status(404).json({ error: "La jaula no existe." });
    return;
  }

  if (result === "in_use") {
    res.status(409).json({
      error:
        "No se puede eliminar la jaula porque tiene registros asociados.",
    });
    return;
  }

  res.status(204).send();
});
