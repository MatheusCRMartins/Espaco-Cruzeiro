import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Mesma ordem que Next.js: .env.local sobrescreve .env
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to run drizzle-kit. Set it in .env.local.");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  strict: true,
  verbose: true,
});
