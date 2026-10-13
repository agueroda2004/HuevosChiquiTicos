import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { accountingReportsRepository } from "../repositories/accounting-report.repository.js";
import { reportsRepository } from "../repositories/report.repository.js";

const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida");

const productionQuerySchema = z.object({
  from: dateSchema,
  to: dateSchema,
  cageId: z.string().uuid().optional(),
  recentLimit: z.coerce.number().int().min(1).max(50).optional(),
});

const accountingQuerySchema = z.object({
  from: dateSchema,
  to: dateSchema,
  topLimit: z.coerce.number().int().min(1).max(50).optional(),
});

export const reportRouter = Router();

reportRouter.use(requireAuth);

reportRouter.get("/reports", async (req, res) => {
  const parsed = productionQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await reportsRepository.getProductionReport(parsed.data));
});

reportRouter.get("/accounting/reports", async (req, res) => {
  const parsed = accountingQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await accountingReportsRepository.getAccountingReport(parsed.data));
});
