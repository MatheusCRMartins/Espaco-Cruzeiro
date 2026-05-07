"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { cancelBooking, confirmBooking } from "@/lib/bookings/service";
import { getDb, schema } from "@/lib/db";

export type ActionResult = { ok: boolean; error?: string };

export async function updateAdminNotes(
  bookingId: string,
  notes: string,
): Promise<ActionResult> {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db
      .update(schema.bookings)
      .set({ adminNotes: notes, updatedAt: new Date() })
      .where(eq(schema.bookings.id, bookingId));
    await logAdminAction({
      userId: user.id,
      action: "update_notes",
      entityType: "booking",
      entityId: bookingId,
      changes: { notes },
    });
    revalidatePath(`/admin/reservas/${bookingId}`);
    return { ok: true };
  } catch (err) {
    console.error("[admin] updateAdminNotes failed:", err);
    return { ok: false, error: "internal_error" };
  }
}

export async function forceConfirmBooking(
  bookingId: string,
): Promise<ActionResult> {
  const user = await requireAdmin();
  try {
    // paymentId precisa ser único (uniqueIndex bookings_payment_id_uq).
    // Antes usávamos "manual" hardcoded → 2ª confirmação manual de
    // qualquer booking violava unique. Agora gera id estável por booking.
    await confirmBooking(bookingId, `manual-${bookingId}`, "manual_confirm");
    await logAdminAction({
      userId: user.id,
      action: "force_confirm",
      entityType: "booking",
      entityId: bookingId,
    });
    revalidatePath(`/admin/reservas/${bookingId}`);
    return { ok: true };
  } catch (err) {
    console.error("[admin] forceConfirm failed:", err);
    return { ok: false, error: "internal_error" };
  }
}

export async function cancelBookingAdmin(
  bookingId: string,
  reason: string,
): Promise<ActionResult> {
  const user = await requireAdmin();
  try {
    await cancelBooking(bookingId, reason);
    await logAdminAction({
      userId: user.id,
      action: "cancel",
      entityType: "booking",
      entityId: bookingId,
      changes: { reason },
    });
    revalidatePath(`/admin/reservas/${bookingId}`);
    return { ok: true };
  } catch (err) {
    console.error("[admin] cancelBooking failed:", err);
    return { ok: false, error: "internal_error" };
  }
}

export async function markBookingCompleted(
  bookingId: string,
): Promise<ActionResult> {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db
      .update(schema.bookings)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(schema.bookings.id, bookingId));
    await logAdminAction({
      userId: user.id,
      action: "mark_completed",
      entityType: "booking",
      entityId: bookingId,
    });
    revalidatePath(`/admin/reservas/${bookingId}`);
    return { ok: true };
  } catch (err) {
    console.error("[admin] markCompleted failed:", err);
    return { ok: false, error: "internal_error" };
  }
}
