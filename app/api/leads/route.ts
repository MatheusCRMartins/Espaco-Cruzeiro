import { NextResponse } from "next/server";

import { getDb, schema } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { serverEnv } from "@/lib/env";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { leadInputSchema } from "@/lib/validations/lead";

export const runtime = "nodejs";

const LEADS_LIMIT_PER_IP = 5; // 5 envios
const LEADS_WINDOW_SECONDS = 60 * 10; // 10 minutos

export async function POST(request: Request) {
  // 1) Rate limit por IP (defesa contra spam/scraper)
  const ip = getClientIp(request.headers);
  const ipResult = await rateLimit({
    key: `leads:ip:${ip}`,
    limit: LEADS_LIMIT_PER_IP,
    windowSeconds: LEADS_WINDOW_SECONDS,
  });
  if (!ipResult.ok) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSeconds: ipResult.retryAfterSeconds },
      {
        status: 429,
        headers: { "Retry-After": String(ipResult.retryAfterSeconds) },
      },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = leadInputSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // 2) Rate limit por email (mesmo email não pode mandar 100 leads em série)
  const emailResult = await rateLimit({
    key: `leads:email:${input.email}`,
    limit: 3,
    windowSeconds: LEADS_WINDOW_SECONDS,
  });
  if (!emailResult.ok) {
    return NextResponse.json(
      {
        error: "rate_limited",
        retryAfterSeconds: emailResult.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(emailResult.retryAfterSeconds) },
      },
    );
  }

  const db = getDb();
  const [lead] = await db
    .insert(schema.leads)
    .values({
      name: input.name,
      email: input.email,
      phone: input.phone,
      eventTypeId: input.eventTypeId ?? null,
      estimatedDate: input.estimatedDate ?? null,
      estimatedGuests: input.estimatedGuests ?? null,
      message: input.message ?? null,
      source: input.source,
    })
    .returning({ id: schema.leads.id });

  const env = serverEnv();
  if (env.ADMIN_NOTIFICATION_EMAIL) {
    await notify("email", {
      recipient: env.ADMIN_NOTIFICATION_EMAIL,
      template: "admin_new_lead",
      data: { ...input, leadId: lead.id },
      relatedLeadId: lead.id,
    });
  }

  return NextResponse.json({ ok: true, leadId: lead.id }, { status: 201 });
}
