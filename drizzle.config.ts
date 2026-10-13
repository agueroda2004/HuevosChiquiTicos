import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL is not set");
}

export default defineConfig({
  schema: "./server/src/db/schema.ts",
  out: "./server/migrations",
  dialect: "postgresql",
  dbCredentials: { url },
});
