"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { getDb, schema } from "@/lib/db";
import { deleteAsset, uploadAsset } from "@/lib/storage";

export type AddPhotoState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const ADD_PHOTO_INITIAL: AddPhotoState = { status: "idle" };

const metaSchema = z.object({
  altText: z.string().trim().max(200).optional().nullable(),
  eventTypeId: z.string().uuid().optional().nullable(),
  displayOrder: z.coerce.number().int().default(0),
  featured: z.boolean().default(false),
});

/**
 * Server Action — recebe arquivo via FormData, sobe pro bucket
 * public-assets/gallery/, insere registro em gallery_photos.
 *
 * Usado com useActionState pra feedback inline.
 */
export async function uploadGalleryPhoto(
  _prev: AddPhotoState,
  formData: FormData,
): Promise<AddPhotoState> {
  const user = await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return {
      status: "error",
      message: "Selecione uma imagem.",
      fieldErrors: { file: ["Arquivo obrigatório"] },
    };
  }

  const parsed = metaSchema.safeParse({
    altText: formData.get("altText") || null,
    eventTypeId: formData.get("eventTypeId") || null,
    displayOrder: formData.get("displayOrder") ?? 0,
    featured: formData.get("featured") === "on",
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path.join(".");
      (fieldErrors[k] ??= []).push(issue.message);
    }
    return { status: "error", message: "Revise os campos.", fieldErrors };
  }

  const upload = await uploadAsset({
    file,
    prefix: "gallery",
    baseName: parsed.data.altText ?? file.name,
  });
  if (!upload.ok) {
    return {
      status: "error",
      message: upload.error,
      fieldErrors: { file: [upload.error] },
    };
  }

  try {
    const db = getDb();
    const [ins] = await db
      .insert(schema.galleryPhotos)
      .values({
        storagePath: upload.path,
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
      changes: { storagePath: upload.path },
    });
    revalidatePath("/admin/galeria");
    revalidatePath("/", "layout");
    return { status: "ok", message: "Foto adicionada." };
  } catch (err) {
    console.error("[admin] uploadGalleryPhoto db insert failed:", err);
    // Tenta limpar o asset que subiu pra não deixar orfão
    void deleteAsset(upload.path);
    return {
      status: "error",
      message: "Não conseguimos salvar agora. Tente novamente.",
    };
  }
}

export async function deleteGalleryPhoto(id: string) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    const [photo] = await db
      .select({ storagePath: schema.galleryPhotos.storagePath })
      .from(schema.galleryPhotos)
      .where(eq(schema.galleryPhotos.id, id));
    if (!photo) return { ok: false as const, error: "not_found" };

    await db.delete(schema.galleryPhotos).where(eq(schema.galleryPhotos.id, id));
    // Best-effort: remove o asset. Se falhar, não rollback — só fica orfão
    // (e admin pode limpar via Storage UI ou script).
    void deleteAsset(photo.storagePath);

    await logAdminAction({
      userId: user.id,
      action: "delete_gallery_photo",
      entityType: "gallery_photo",
      entityId: id,
    });
    revalidatePath("/admin/galeria");
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (err) {
    console.error("[admin] deleteGalleryPhoto failed:", err);
    return { ok: false as const, error: "internal_error" };
  }
}

export async function toggleGalleryFeatured(id: string, featured: boolean) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db
      .update(schema.galleryPhotos)
      .set({ featured })
      .where(eq(schema.galleryPhotos.id, id));
    await logAdminAction({
      userId: user.id,
      action: "toggle_gallery_featured",
      entityType: "gallery_photo",
      entityId: id,
      changes: { featured },
    });
    revalidatePath("/admin/galeria");
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (err) {
    console.error("[admin] toggleGalleryFeatured failed:", err);
    return { ok: false as const };
  }
}

export async function updateGalleryAlt(id: string, altText: string) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db
      .update(schema.galleryPhotos)
      .set({ altText: altText.trim() || null })
      .where(eq(schema.galleryPhotos.id, id));
    await logAdminAction({
      userId: user.id,
      action: "update_gallery_alt",
      entityType: "gallery_photo",
      entityId: id,
    });
    revalidatePath("/admin/galeria");
    return { ok: true as const };
  } catch (err) {
    console.error("[admin] updateGalleryAlt failed:", err);
    return { ok: false as const };
  }
}
