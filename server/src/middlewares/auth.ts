import { verifyToken } from "@clerk/backend";
import type { NextFunction, Request, Response } from "express";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "No autenticado" });
    return;
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "CLERK_SECRET_KEY is not set" });
    return;
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    res.locals.ownerId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}
