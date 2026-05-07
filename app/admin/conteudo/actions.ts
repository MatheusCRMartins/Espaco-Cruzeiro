"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { getDb, schema } from "@/lib/db";

/** Upsert em content_blocks — value é sempre um JSON válido. */
export async function saveContentBlock(formData: FormData) {
  const user = await requireAdmin();
  const key = String(formData.get("key") ?? "").trim();
  const raw = String(formData.get("value") ?? "").trim();
  if (!key) return { ok: false, error: "missing_key" };
  let value: unknown;
  try {
    value = raw ? JSON.parse(raw) : null;
  } catch {
    return { ok: false, error: "invalid_json" };
  }

  try {
    const db = getDb();
    const [existing] = await db
      .select({ id: schema.contentBlocks.id })
      .from(schema.contentBlocks)
      .where(eq(schema.contentBlocks.key, key));

    if (existing) {
      await db
        .update(schema.contentBlocks)
        .set({ value, updatedBy: user.id, updatedAt: new Date() })
        .where(eq(schema.contentBlocks.id, existing.id));
    } else {
      await db.insert(schema.contentBlocks).values({
        key,
        value,
        updatedBy: user.id,
      });
    }
    await logAdminAction({
      userId: user.id,
      action: "save_content_block",
      entityType: "content_block",
      changes: { key },
    });
    revalidatePath("/admin/conteudo");
    return { ok: true };
  } catch (err) {
    console.error("[admin] saveContentBlock failed:", err);
    return { ok: false, error: "internal_error" };
  }
}
