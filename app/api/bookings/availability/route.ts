import { NextResponse } from "next/server";

import { getMonthAvailability } from "@/lib/availability";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { availabilityQuerySchema } from "@/lib/validations/booking";

export const runtime = "nodejs";
// Availability muda ao longo do dia — não faz cache estático
export const dynamic = "force-dynamic";

/**
 * GET /api/bookings/availability?eventTypeId=...&month=YYYY-MM
 *
 * Retorna todos os dias do mês com status: available | unavailable | blocked | booked.
 * O `eventTypeId` é validado (formato) mas, no MVP, não afeta o cálculo — a regra
 * de capacidade semanal é a mesma pra todos os tipos. Se mudar no futuro, basta
 * filtrar availability_rules por event_type_id.
 */
export async function GET(request: Request) {
  // Rate-limit por IP — endpoint público que toca DB; previne scraping
  const ip = getClientIp(request.headers);
  const rl = await rateLimit({
    key: `availability:${ip}`,
    limit: 60,
    windowSeconds: 60,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSeconds: rl.retryAfterSeconds },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(request.url);
  const parsed = availabilityQuerySchema.safeParse({
    eventTypeId: searchParams.get("eventTypeId") ?? "",
    month: searchParams.get("month") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const data = await getMonthAvailability(parsed.data.month);
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("[availability] GET failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
