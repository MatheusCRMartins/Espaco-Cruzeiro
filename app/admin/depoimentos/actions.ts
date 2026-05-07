"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { getDb, schema } from "@/lib/db";

const schemaInput = z.object({
  customerName: z.string().trim().min(2).max(120),
  rating: z.coerce.number().int().min(1).max(5),
  content: z.string().trim().min(10).max(2000),
  eventDate: z.string().date().optional().nullable(),
  approved: z.boolean().default(false),
});

export async function addTestimonial(formData: FormData) {
  const user = await requireAdmin();
  const parsed = schemaInput.safeParse({
    customerName: formData.get("customerName"),
    rating: formData.get("rating"),
    content: formData.get("content"),
    eventDate: formData.get("eventDate") || null,
    approved: formData.get("approved") === "on",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    const db = getDb();
    const [ins] = await db
      .insert(schema.testimonials)
      .values({
        customerName: parsed.data.customerName,
        rating: parsed.data.rating,
        content: parsed.data.content,
        eventDate: parsed.data.eventDate ?? null,
        approved: parsed.data.approved,
      })
      .returning({ id: schema.testimonials.id });
    await logAdminAction({
      userId: user.id,
      action: "add_testimonial",
      entityType: "testimonial",
      entityId: ins.id,
    });
    revalidatePath("/admin/depoimentos");
    return { ok: true };
  } catch (err) {
    console.error("[admin] addTestimonial failed:", err);
    return { ok: false };
  }
}

export async function toggleTestimonial(id: string, approved: boolean) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db
      .update(schema.testimonials)
      .set({ approved })
      .where(eq(schema.testimonials.id, id));
    await logAdminAction({
      userId: user.id,
      action: "toggle_testimonial",
      entityType: "testimonial",
      entityId: id,
      changes: { approved },
    });
    revalidatePath("/admin/depoimentos");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function deleteTestimonial(id: string) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id));
    await logAdminAction({
      userId: user.id,
      action: "delete_testimonial",
      entityType: "testimonial",
      entityId: id,
    });
    revalidatePath("/admin/depoimentos");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
