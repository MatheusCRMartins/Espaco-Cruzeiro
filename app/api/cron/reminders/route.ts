import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { serverEnv } from "@/lib/env";
import { notify } from "@/lib/notifications";
import type { NotificationTemplate } from "@/lib/notifications/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/cron/reminders
 *
 * Endpoint invocado pelo cron da Vercel (ou similar) uma vez por dia.
 * Dispara lembretes D-7 e D-1 para reservas `confirmed` cujo evento
 * cai, respectivamente, daqui a 7 ou 1 dia.
 *
 * Autenticação:
 *   - Header `Authorization: Bearer <CRON_SECRET>` OBRIGATÓRIO em produção.
 *   - Quando `CRON_SECRET` não estiver configurado, roda aberto (útil em dev).
 *
 * Idempotência:
 *   - Antes de enviar, checa em `notifications_log` se já existe um
 *     `sent` para (type, related_booking_id). Se sim, pula.
 *   - Assim o cron pode rodar N vezes por dia sem duplicar e-mails.
 *
 * Erros individuais NÃO abortam o batch; são registrados e reportados.
 */
export async function GET(request: Request) {
  const env = serverEnv();
  if (env.CRON_SECRET) {
    const header = request.headers.get("authorization") ?? "";
    const expected = `Bearer ${env.CRON_SECRET}`;
    if (header !== expected) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const today = new Date();
  const d7 = addDaysIso(today, 7);
  const d1 = addDaysIso(today, 1);

  const result = {
    ranAt: new Date().toISOString(),
    d7: { processed: 0, sent: 0, skipped: 0, failed: 0 },
    d1: { processed: 0, sent: 0, skipped: 0, failed: 0 },
    errors: [] as Array<{ bookingId: string; template: string; error: string }>,
  };

  try {
    await processReminderBatch("customer_reminder_d7", d7, result.d7, result.errors);
    await processReminderBatch("customer_reminder_d1", d1, result.d1, result.errors);
  } catch (err) {
    console.error("[cron/reminders] fatal:", err);
    return NextResponse.json(
      { error: "internal_error", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }

  return NextResponse.json(result);
}

async function processReminderBatch(
  template: Extract<
    NotificationTemplate,
    "customer_reminder_d7" | "customer_reminder_d1"
  >,
  eventDateIso: string,
  counters: { processed: number; sent: number; skipped: number; failed: number },
  errors: Array<{ bookingId: string; template: string; error: string }>,
) {
  const db = getDb();

  // 1. Confirmed bookings on the target date
  const candidates = await db
    .select({
      id: schema.bookings.id,
      bookingCode: schema.bookings.bookingCode,
      customerName: schema.bookings.customerName,
      customerEmail: schema.bookings.customerEmail,
      eventDate: schema.bookings.eventDate,
      eventStartTime: schema.bookings.eventStartTime,
    })
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.status, "confirmed"),
        eq(schema.bookings.eventDate, eventDateIso),
      ),
    );

  counters.processed = candidates.length;
  if (candidates.length === 0) return;

  // 2. Already-sent lookup (idempotency)
  const bookingIds = candidates.map((c) => c.id);
  const alreadySent = await db
    .select({ relatedBookingId: schema.notificationsLog.relatedBookingId })
    .from(schema.notificationsLog)
    .where(
      and(
        eq(schema.notificationsLog.type, template),
        eq(schema.notificationsLog.status, "sent"),
        inArray(schema.notificationsLog.relatedBookingId, bookingIds),
      ),
    );
  const sentSet = new Set(alreadySent.map((r) => r.relatedBookingId));

  // 3. Dispatch
  for (const b of candidates) {
    if (sentSet.has(b.id)) {
      counters.skipped += 1;
      continue;
    }
    try {
      const result = await notify("email", {
        recipient: b.customerEmail,
        template,
        data: {
          customerName: b.customerName,
          bookingCode: b.bookingCode,
          eventDate: b.eventDate,
          eventStartTime: b.eventStartTime,
        },
        relatedBookingId: b.id,
      });
      if (result.ok) {
        counters.sent += 1;
      } else {
        counters.failed += 1;
        errors.push({
          bookingId: b.id,
          template,
          error: result.error ?? "unknown",
        });
      }
    } catch (err) {
      counters.failed += 1;
      errors.push({
        bookingId: b.id,
        template,
        error: err instanceof Error ? err.message : "unknown",
      });
    }
  }
}

/** Returns YYYY-MM-DD for `today + days`, computed in UTC (dates are timezone-free). */
function addDaysIso(base: Date, days: number): string {
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
