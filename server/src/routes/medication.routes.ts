import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { medicationsRepository } from "../repositories/medication.repository.js";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  active: z.boolean(),
});

export const medicationRouter = Router();

medicationRouter.use(requireAuth);

medicationRouter.get("/medications", async (_req, res) => {
  res.json(await medicationsRepository.list());
});

medicationRouter.post("/medications", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await medicationsRepository.create(parsed.data);
  if (result === "duplicate") {
    res.status(409).json({ error: "Ya existe un medicamento con ese nombre." });
    return;
  }

  res.status(201).json(result);
});

medicationRouter.patch("/medications/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await medicationsRepository.update(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El medicamento no existe." });
    return;
  }
  if (result === "duplicate") {
    res.status(409).json({ error: "Ya existe un medicamento con ese nombre." });
    return;
  }

  res.json(result);
});

medicationRouter.delete("/medications/:id", async (req, res) => {
  const result = await medicationsRepository.remove(req.params.id);

  if (result === "not_found") {
    res.status(404).json({ error: "El medicamento no existe." });
    return;
  }

  if (result === "in_use") {
    res.status(409).json({
      error:
        "No se puede eliminar el medicamento porque tiene aplicaciones asociadas.",
    });
    return;
  }

  res.status(204).send();
});
