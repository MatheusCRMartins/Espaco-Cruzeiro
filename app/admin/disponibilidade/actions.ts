"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { getDb, schema } from "@/lib/db";

const ruleSchema = z.object({
  weekday: z.coerce.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

export async function addRule(formData: FormData) {
  const user = await requireAdmin();
  const parsed = ruleSchema.safeParse({
    weekday: formData.get("weekday"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });
  if (!parsed.success) {
    return { ok: false, error: "validation_failed" };
  }
  try {
    const db = getDb();
    await db.insert(schema.availabilityRules).values({
      weekday: parsed.data.weekday,
      startTime: `${parsed.data.startTime}:00`,
      endTime: `${parsed.data.endTime}:00`,
    });
    await logAdminAction({
      userId: user.id,
      action: "add_rule",
      entityType: "availability_rule",
      changes: parsed.data,
    });
    revalidatePath("/admin/disponibilidade");
    return { ok: true };
  } catch (err) {
    console.error("[admin] addRule failed:", err);
    return { ok: false };
  }
}

export async function deleteRule(id: string) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.availabilityRules).where(eq(schema.availabilityRules.id, id));
    await logAdminAction({
      userId: user.id,
      action: "delete_rule",
      entityType: "availability_rule",
      entityId: id,
    });
    revalidatePath("/admin/disponibilidade");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

const blockSchema = z.object({
  date: z.string().date(),
  reason: z.string().trim().max(200).optional().nullable(),
});

export async function addBlockedDate(formData: FormData) {
  const user = await requireAdmin();
  const parsed = blockSchema.safeParse({
    date: formData.get("date"),
    reason: formData.get("reason") || null,
  });
  if (!parsed.success) return { ok: false, error: "validation_failed" };
  try {
    const db = getDb();
    await db
      .insert(schema.blockedDates)
      .values({
        date: parsed.data.date,
        reason: parsed.data.reason ?? null,
        createdBy: user.id,
      })
      .onConflictDoNothing();
    await logAdminAction({
      userId: user.id,
      action: "block_date",
      entityType: "blocked_date",
      changes: parsed.data,
    });
    revalidatePath("/admin/disponibilidade");
    return { ok: true };
  } catch (err) {
    console.error("[admin] addBlockedDate failed:", err);
    return { ok: false };
  }
}

export async function deleteBlockedDate(id: string) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.blockedDates).where(eq(schema.blockedDates.id, id));
    await logAdminAction({
      userId: user.id,
      action: "unblock_date",
      entityType: "blocked_date",
      entityId: id,
    });
    revalidatePath("/admin/disponibilidade");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
