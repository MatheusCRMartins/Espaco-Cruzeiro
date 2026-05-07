import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/:id — polling público para a página de sucesso.
 * Retorna apenas os campos mínimos (status + código) — nunca expõe CPF, etc.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  const db = getDb();
  const [row] = await db
    .select({
      id: schema.bookings.id,
      bookingCode: schema.bookings.bookingCode,
      status: schema.bookings.status,
      paymentStatus: schema.bookings.paymentStatus,
      eventDate: schema.bookings.eventDate,
      eventStartTime: schema.bookings.eventStartTime,
    })
    .from(schema.bookings)
    .where(eq(schema.bookings.id, id));

  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(row, {
    headers: { "Cache-Control": "no-store" },
  });
}
