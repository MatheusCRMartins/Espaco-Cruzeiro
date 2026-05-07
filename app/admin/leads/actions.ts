"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { getDb, schema } from "@/lib/db";
import { leadStatusValues } from "@/lib/db/schema";

const LEAD_STATUSES = leadStatusValues;

export async function updateLeadStatus(leadId: string, status: string) {
  const user = await requireAdmin();
  if (!(LEAD_STATUSES as readonly string[]).includes(status)) {
    return { ok: false, error: "invalid_status" };
  }
  try {
    const db = getDb();
    await db
      .update(schema.leads)
      .set({
        status,
        contactedAt: status === "contacted" ? new Date() : undefined,
      })
      .where(eq(schema.leads.id, leadId));
    await logAdminAction({
      userId: user.id,
      action: "update_lead_status",
      entityType: "lead",
      entityId: leadId,
      changes: { status },
    });
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (err) {
    console.error("[admin] updateLeadStatus failed:", err);
    return { ok: false, error: "internal_error" };
  }
}

export async function updateLeadNotes(leadId: string, notes: string) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db
      .update(schema.leads)
      .set({ adminNotes: notes })
      .where(eq(schema.leads.id, leadId));
    await logAdminAction({
      userId: user.id,
      action: "update_lead_notes",
      entityType: "lead",
      entityId: leadId,
    });
    revalidatePath("/admin/leads");
    return { ok: true };
  } catch (err) {
    console.error("[admin] updateLeadNotes failed:", err);
    return { ok: false, error: "internal_error" };
  }
}
