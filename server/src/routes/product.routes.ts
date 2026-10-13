import { Router } from "express";
import { z } from "zod";

import { requireAuth } from "../middlewares/auth.js";
import { productsRepository } from "../repositories/product.repository.js";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(100),
  price: z.number().finite().min(0),
  active: z.boolean(),
  imageUrl: z.string().trim().max(200).nullable(),
});

const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(1000).default(10),
});

export const productRouter = Router();

productRouter.use(requireAuth);

productRouter.get("/products", async (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  res.json(await productsRepository.list(parsed.data));
});

productRouter.post("/products", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await productsRepository.create(parsed.data);
  if (result === "duplicate") {
    res.status(409).json({ error: "Ya existe un producto con ese nombre." });
    return;
  }

  res.status(201).json(result);
});

productRouter.patch("/products/:id", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Datos inválidos" });
    return;
  }

  const result = await productsRepository.update(req.params.id, parsed.data);
  if (result === "not_found") {
    res.status(404).json({ error: "El producto no existe." });
    return;
  }
  if (result === "duplicate") {
    res.status(409).json({ error: "Ya existe un producto con ese nombre." });
    return;
  }

  res.json(result);
});

productRouter.delete("/products/:id", async (req, res) => {
  const result = await productsRepository.remove(req.params.id);

  if (result === "not_found") {
    res.status(404).json({ error: "El producto no existe." });
    return;
  }
  if (result === "in_use") {
    res.status(409).json({
      error: "No se puede eliminar el producto porque está en pedidos o facturas.",
    });
    return;
  }

  res.status(204).send();
});
