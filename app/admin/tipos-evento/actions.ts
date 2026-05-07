"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { getDb, schema } from "@/lib/db";

const inputSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(2).max(60).regex(/^[a-z0-9-]+$/, "slug inválido"),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  basePricePerPerson: z.coerce.number().min(0),
  minGuests: z.coerce.number().int().min(1),
  maxGuests: z.coerce.number().int().min(1).max(2000),
  durationHours: z.coerce.number().int().min(1).max(24),
  displayOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});

export async function saveEventType(formData: FormData) {
  const user = await requireAdmin();

  const raw = {
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description") || null,
    basePricePerPerson: formData.get("basePricePerPerson"),
    minGuests: formData.get("minGuests"),
    maxGuests: formData.get("maxGuests"),
    durationHours: formData.get("durationHours"),
    displayOrder: formData.get("displayOrder") ?? 0,
    active: formData.get("active") === "on",
  };

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const data = parsed.data;

  try {
    const db = getDb();
    if (data.id) {
      await db
        .update(schema.eventTypes)
        .set({
          slug: data.slug,
          name: data.name,
          description: data.description ?? null,
          basePricePerPerson: data.basePricePerPerson.toFixed(2),
          minGuests: data.minGuests,
          maxGuests: data.maxGuests,
          durationHours: data.durationHours,
          displayOrder: data.displayOrder,
          active: data.active,
          updatedAt: new Date(),
        })
        .where(eq(schema.eventTypes.id, data.id));
      await logAdminAction({
        userId: user.id,
        action: "update_event_type",
        entityType: "event_type",
        entityId: data.id,
        changes: { name: data.name, slug: data.slug },
      });
    } else {
      const [ins] = await db
        .insert(schema.eventTypes)
        .values({
          slug: data.slug,
          name: data.name,
          description: data.description ?? null,
          basePricePerPerson: data.basePricePerPerson.toFixed(2),
          minGuests: data.minGuests,
          maxGuests: data.maxGuests,
          durationHours: data.durationHours,
          displayOrder: data.displayOrder,
          active: data.active,
        })
        .returning({ id: schema.eventTypes.id });
      await logAdminAction({
        userId: user.id,
        action: "create_event_type",
        entityType: "event_type",
        entityId: ins.id,
        changes: { name: data.name, slug: data.slug },
      });
    }
    revalidatePath("/admin/tipos-evento");
    return { ok: true };
  } catch (err) {
    console.error("[admin] saveEventType failed:", err);
    return { ok: false, error: "internal_error" };
  }
}

export async function toggleEventType(id: string, active: boolean) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db
      .update(schema.eventTypes)
      .set({ active, updatedAt: new Date() })
      .where(eq(schema.eventTypes.id, id));
    await logAdminAction({
      userId: user.id,
      action: "toggle_event_type",
      entityType: "event_type",
      entityId: id,
      changes: { active },
    });
    revalidatePath("/admin/tipos-evento");
    return { ok: true };
  } catch (err) {
    console.error("[admin] toggleEventType failed:", err);
    return { ok: false };
  }
}
