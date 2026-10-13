import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: "Ruta no encontrada" });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(error);
  const message = error instanceof Error ? error.message : "Error interno";
  res.status(500).json({ error: message });
}
