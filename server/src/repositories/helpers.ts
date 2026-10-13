import { eq } from "drizzle-orm";

import { db } from "../db/client.js";
import { cages } from "../db/schema.js";

type Executor = Parameters<Parameters<typeof db.transaction>[0]>[0];

export type BirdAdjustResult = "ok" | "not_found" | "insufficient";

export async function adjustCageBirds(
  executor: Executor,
  cageId: string,
  delta: number,
): Promise<BirdAdjustResult> {
  const [cage] = await executor.select().from(cages).where(eq(cages.id, cageId));

  if (!cage) {
    return "not_found";
  }

  const next = cage.birds + delta;
  if (next < 0) {
    return "insufficient";
  }

  await executor
    .update(cages)
    .set({ birds: next, updatedAt: new Date() })
    .where(eq(cages.id, cageId));

  return "ok";
}
