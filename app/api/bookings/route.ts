import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { assertDateAvailable } from "@/lib/availability";
import {
  computeAmount,
  generateBookingCode,
  softLockExpiresAtIso,
} from "@/lib/bookings/service";
import { getDb, schema } from "@/lib/db";
import { createBookingPreference } from "@/lib/mercadopago/preference";
import { bookingInputSchema } from "@/lib/validations/booking";
import { serverEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/bookings — cria uma reserva em estado `pending_payment` e retorna
 * a URL de checkout do Mercado Pago.
 *
 * Fluxo:
 *   1. Valida payload (Zod + honeypot + consent)
 *   2. Re-checa disponibilidade (server-authoritative)
 *   3. Busca o event_type (preço base, nome)
 *   4. Calcula total e valor a pagar (deposit ou full)
 *   5. Insere booking com soft_lock_expires_at = now + 15min
 *   6. Cria preferência no Mercado Pago
 *   7. Retorna { bookingId, bookingCode, checkoutUrl, amount }
 *
 * Erros → 4xx com código legível; inconsistências operacionais → 500.
 */
export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = bookingInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data;

  // 2. availability
  const availability = await assertDateAvailable(input.eventDate);
  if (!availability.ok) {
    return NextResponse.json(
      { error: "date_unavailable", reason: availability.reason },
      { status: 409 },
    );
  }

  // 3. event type
  const db = getDb();
  const [eventType] = await db
    .select()
    .from(schema.eventTypes)
    .where(eq(schema.eventTypes.id, input.eventTypeId));

  if (!eventType || !eventType.active) {
    return NextResponse.json(
      { error: "event_type_not_found" },
      { status: 404 },
    );
  }
  if (!eventType.basePricePerPerson) {
    return NextResponse.json(
      { error: "event_type_has_no_price" },
      { status: 500 },
    );
  }
  if (eventType.minGuests && input.guestsCount < eventType.minGuests) {
    return NextResponse.json(
      { error: "guests_below_minimum", min: eventType.minGuests },
      { status: 400 },
    );
  }
  if (eventType.maxGuests && input.guestsCount > eventType.maxGuests) {
    return NextResponse.json(
      { error: "guests_above_maximum", max: eventType.maxGuests },
      { status: 400 },
    );
  }

  // 4. amount
  const { totalAmount, depositAmount, payableNow } = computeAmount({
    guestsCount: input.guestsCount,
    basePricePerPerson: eventType.basePricePerPerson,
    paymentType: input.paymentType,
  });

  // 5. insert booking
  const bookingCode = await generateBookingCode();

  const durationHours = eventType.durationHours ?? 6;
  const startHHMM = input.eventStartTime.slice(0, 5);
  const [sh, sm] = startHHMM.split(":").map(Number);
  const endTotalMinutes = sh * 60 + sm + durationHours * 60;
  const endHH = Math.floor(endTotalMinutes / 60) % 24;
  const endMM = endTotalMinutes % 60;
  const endHHMM = `${String(endHH).padStart(2, "0")}:${String(endMM).padStart(2, "0")}`;

  let bookingId: string;
  try {
    const [inserted] = await db
      .insert(schema.bookings)
      .values({
        bookingCode,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        customerCpf: input.customerCpf,
        eventTypeId: input.eventTypeId,
        eventDate: input.eventDate,
        eventStartTime: startHHMM,
        eventEndTime: endHHMM,
        guestsCount: input.guestsCount,
        totalAmount: totalAmount.toFixed(2),
        depositAmount: depositAmount.toFixed(2),
        paymentType: input.paymentType,
        status: "pending_payment",
        notes: input.notes ?? null,
        softLockExpiresAt: softLockExpiresAtIso(),
      })
      .returning({ id: schema.bookings.id });
    bookingId = inserted.id;
  } catch (err) {
    console.error("[bookings] insert failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  // 6. Mercado Pago preference (se configurado)
  const env = serverEnv();
  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    // Modo dev sem credencial: devolve checkoutUrl apontando pra página de sucesso
    // direto, pra permitir testar o fluxo sem MP.
    return NextResponse.json({
      bookingId,
      bookingCode,
      checkoutUrl: `${env.NEXT_PUBLIC_SITE_URL}/reservar/sucesso?booking=${bookingId}&mock=1`,
      amount: payableNow,
      totalAmount,
      depositAmount,
      mockPayment: true,
    });
  }

  try {
    const pref = await createBookingPreference({
      bookingId,
      bookingCode,
      title: `${eventType.name} — ${input.eventDate} (${bookingCode})`,
      amount: payableNow,
      payerEmail: input.customerEmail,
      payerName: input.customerName,
    });

    return NextResponse.json({
      bookingId,
      bookingCode,
      checkoutUrl: pref.initPoint,
      sandboxCheckoutUrl: pref.sandboxInitPoint,
      amount: payableNow,
      totalAmount,
      depositAmount,
    });
  } catch (err) {
    console.error("[bookings] MP preference failed:", err);
    // Marca como cancelled pra não segurar a data
    await db
      .update(schema.bookings)
      .set({ status: "cancelled", cancelledAt: new Date() })
      .where(eq(schema.bookings.id, bookingId));
    return NextResponse.json(
      { error: "payment_gateway_unavailable" },
      { status: 502 },
    );
  }
}
