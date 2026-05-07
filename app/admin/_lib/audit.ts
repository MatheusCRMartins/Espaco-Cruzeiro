import "server-only";

import { getDb, schema } from "@/lib/db";

/** Registra uma ação administrativa no audit log (best-effort). */
export async function logAdminAction(input: {
  userId: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  changes?: Record<string, unknown> | null;
}) {
  try {
    const db = getDb();
    await db.insert(schema.adminAuditLog).values({
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      changes: input.changes ?? null,
    });
  } catch (err) {
    console.error("[audit] failed:", err);
  }
}
