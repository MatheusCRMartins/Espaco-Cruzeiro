"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { getDb, schema } from "@/lib/db";

const updateSchema = z.enum(["completed", "cancelled", "no_show"]);

export async function updateVisitStatus(id: string, status: string) {
  const user = await requireAdmin();
  const parsed = updateSchema.safeParse(status);
  if (!parsed.success) return { ok: false as const, error: "invalid_status" };
  try {
    const db = getDb();
    await db
      .update(schema.visits)
      .set({
        status: parsed.data,
        cancelledAt: parsed.data === "cancelled" ? new Date() : null,
      })
      .where(eq(schema.visits.id, id));
    await logAdminAction({
      userId: user.id,
      action: "update_visit_status",
      entityType: "visit",
      entityId: id,
      changes: { status: parsed.data },
    });
    revalidatePath("/admin/visitas");
    return { ok: true as const };
  } catch (err) {
    console.error("[admin] updateVisitStatus failed:", err);
    return { ok: false as const, error: "internal_error" };
  }
}
