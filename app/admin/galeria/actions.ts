"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { getDb, schema } from "@/lib/db";

const inputSchema = z.object({
  storagePath: z.string().trim().min(1).max(500),
  altText: z.string().trim().max(200).optional().nullable(),
  eventTypeId: z.string().uuid().optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  featured: z.boolean().default(false),
});

export async function addGalleryPhoto(formData: FormData) {
  const user = await requireAdmin();
  const parsed = inputSchema.safeParse({
    storagePath: formData.get("storagePath"),
    altText: formData.get("altText") || null,
    eventTypeId: formData.get("eventTypeId") || null,
    displayOrder: formData.get("displayOrder") ?? 0,
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    const db = getDb();
    const [ins] = await db
      .insert(schema.galleryPhotos)
      .values({
        storagePath: parsed.data.storagePath,
        altText: parsed.data.altText ?? null,
        eventTypeId: parsed.data.eventTypeId ?? null,
        displayOrder: parsed.data.displayOrder,
        featured: parsed.data.featured,
      })
      .returning({ id: schema.galleryPhotos.id });
    await logAdminAction({
      userId: user.id,
      action: "add_gallery_photo",
      entityType: "gallery_photo",
      entityId: ins.id,
    });
    revalidatePath("/admin/galeria");
    return { ok: true };
  } catch (err) {
    console.error("[admin] addGalleryPhoto failed:", err);
    return { ok: false };
  }
}

export async function deleteGalleryPhoto(id: string) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.galleryPhotos).where(eq(schema.galleryPhotos.id, id));
    await logAdminAction({
      userId: user.id,
      action: "delete_gallery_photo",
      entityType: "gallery_photo",
      entityId: id,
    });
    revalidatePath("/admin/galeria");
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
