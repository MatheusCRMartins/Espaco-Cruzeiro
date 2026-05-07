"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export type SaveEventTypeState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  redirectAfter?: string;
};

export const SAVE_EVENT_TYPE_INITIAL: SaveEventTypeState = { status: "idle" };

/**
 * Server Action — cria ou atualiza tipo de evento.
 * Versão com useActionState (retorna estado tipado).
 */
export async function saveEventType(
  _prev: SaveEventTypeState,
  formData: FormData,
): Promise<SaveEventTypeState> {
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
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path.join(".");
      (fieldErrors[k] ??= []).push(issue.message);
    }
    return {
      status: "error",
      message: "Revise os campos destacados.",
      fieldErrors,
    };
  }
  const data = parsed.data;

  // Pre-check de slug único pra dar erro humano
  try {
    const db = getDb();
    const dup = await db
      .select({ id: schema.eventTypes.id })
      .from(schema.eventTypes)
      .where(eq(schema.eventTypes.slug, data.slug));
    const conflicting = dup.find((r) => r.id !== data.id);
    if (conflicting) {
      return {
        status: "error",
        message: `Já existe um tipo com slug "${data.slug}".`,
        fieldErrors: { slug: ["Slug já em uso"] },
      };
    }
  } catch (err) {
    console.error("[admin] saveEventType slug pre-check failed:", err);
  }

  try {
    const db = getDb();
    let entityId = data.id;
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
      // displayOrder = max + 1 se não foi setado explicitamente
      let order = data.displayOrder;
      if (!order) {
        const [maxRow] = await db
          .select({ max: sql<number>`coalesce(max(${schema.eventTypes.displayOrder}), 0)::int` })
          .from(schema.eventTypes);
        order = (maxRow?.max ?? 0) + 1;
      }
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
          displayOrder: order,
          active: data.active,
        })
        .returning({ id: schema.eventTypes.id });
      entityId = ins.id;
      await logAdminAction({
        userId: user.id,
        action: "create_event_type",
        entityType: "event_type",
        entityId: ins.id,
        changes: { name: data.name, slug: data.slug },
      });
    }
    revalidatePath("/admin/tipos-evento");
    revalidatePath("/", "layout"); // home pública mostra esses
    if (!data.id && entityId) {
      // criou novo — redireciona pra lista
      redirect("/admin/tipos-evento");
    }
    return { status: "ok", message: "Tipo de evento salvo." };
  } catch (err) {
    // redirect joga um throw especial — repassa
    if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) throw err;
    console.error("[admin] saveEventType failed:", err);
    return {
      status: "error",
      message: "Não conseguimos salvar agora. Tente novamente.",
    };
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
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (err) {
    console.error("[admin] toggleEventType failed:", err);
    return { ok: false as const };
  }
}

/**
 * Soft-block: não deixa deletar se há bookings vinculados (FK onDelete restrict).
 * Quando há, sugere desativar.
 */
export async function deleteEventType(id: string) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    const [bookingCount] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(schema.bookings)
      .where(eq(schema.bookings.eventTypeId, id));
    if ((bookingCount?.n ?? 0) > 0) {
      return {
        ok: false as const,
        error: `Não dá pra excluir — ${bookingCount.n} reserva(s) usam esse tipo. Desative em vez de excluir.`,
      };
    }
    await db.delete(schema.eventTypes).where(eq(schema.eventTypes.id, id));
    await logAdminAction({
      userId: user.id,
      action: "delete_event_type",
      entityType: "event_type",
      entityId: id,
    });
    revalidatePath("/admin/tipos-evento");
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (err) {
    console.error("[admin] deleteEventType failed:", err);
    return { ok: false as const, error: "internal_error" };
  }
}

const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
});

/**
 * Recebe a ordem desejada (array de ids) e atualiza displayOrder = index.
 */
export async function reorderEventTypes(ids: string[]) {
  const user = await requireAdmin();
  const parsed = reorderSchema.safeParse({ ids });
  if (!parsed.success) return { ok: false as const, error: "validation_failed" };

  try {
    const db = getDb();
    // Confirma que TODOS os ids enviados existem (defesa contra payload manipulado)
    const existing = await db
      .select({ id: schema.eventTypes.id })
      .from(schema.eventTypes)
      .where(inArray(schema.eventTypes.id, parsed.data.ids));
    if (existing.length !== parsed.data.ids.length) {
      return { ok: false as const, error: "ids_mismatch" };
    }

    // Update em batch — uma transação curta
    await db.transaction(async (tx) => {
      for (let i = 0; i < parsed.data.ids.length; i++) {
        await tx
          .update(schema.eventTypes)
          .set({ displayOrder: i + 1, updatedAt: new Date() })
          .where(eq(schema.eventTypes.id, parsed.data.ids[i]));
      }
    });

    await logAdminAction({
      userId: user.id,
      action: "reorder_event_types",
      entityType: "event_type",
      changes: { count: parsed.data.ids.length },
    });
    revalidatePath("/admin/tipos-evento");
    revalidatePath("/", "layout");
    return { ok: true as const };
  } catch (err) {
    console.error("[admin] reorderEventTypes failed:", err);
    return { ok: false as const, error: "internal_error" };
  }
}

// Note: `and` is unused here but kept for future filtering by status etc.
void and;
