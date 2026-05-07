import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { serverEnv } from "@/lib/env";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  _ecPg?: ReturnType<typeof postgres>;
  _ecDb?: ReturnType<typeof drizzle<typeof schema>>;
};

function getClient() {
  if (globalForDb._ecPg) return globalForDb._ecPg;
  const env = serverEnv();
  const client = postgres(env.DATABASE_URL, {
    prepare: false, // required for the Supabase transaction pooler (pgbouncer)
    max: 10,
    idle_timeout: 20,
  });
  if (process.env.NODE_ENV !== "production") {
    globalForDb._ecPg = client;
  }
  return client;
}

export function getDb() {
  if (globalForDb._ecDb) return globalForDb._ecDb;
  const db = drizzle(getClient(), { schema });
  if (process.env.NODE_ENV !== "production") {
    globalForDb._ecDb = db;
  }
  return db;
}

export { schema };
