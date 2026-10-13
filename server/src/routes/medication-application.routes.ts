import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { medicationApplicationsRepository } from "../repositories/medication-application.repository.js";

const APPLICATION_FORMS = ["food", "water", "fumigation", "injection"] as const;

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const bodySchema = z.object({
  cageIds: z.array(z.string().uuid()).min(1),
  medicationId: z.string().uuid(),
  dose: z.string().trim().min(1).max(100),
  applicationDate: dateSchema,
  birdCount: z.number().int().min(1),
  type: z.enum(APPLICATION_FORMS).nullable(),
});

const listQuerySchema = z.object({
  cageId: z.string().uuid().optional(),
  medicationId: z.string().uuid().optional(),
  from: dateSchema.optional(),
  to: dateSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
});

export const medicationApplicationRouter = Router();

medicationApplicationRouter.use(requireAuth);

medicationApplicationRouter.get("/medication-applications", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await medicationApplicationsRepository.list(parsed.data));
});

medicationApplicationRouter.post("/medication-applications", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await medicationApplicationsRepository.create(parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "La jaula o el medicamento no existe." });
    return;
  }

  res.status(201).json(result);
});

medicationApplicationRouter.patch("/medication-applications/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await medicationApplicationsRepository.update(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El registro no existe." });
    return;
  }

  res.json(result);
});

medicationApplicationRouter.delete("/medication-applications/:id", async (req, res) => {
  const removed = await medicationApplicationsRepository.remove(req.params.id);
  if (!removed) {
    res.status(404).json({ error: "El registro no existe." });
    return;
  }

  res.status(204).send();
});
