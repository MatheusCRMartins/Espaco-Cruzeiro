import { NextResponse } from "next/server";

import { getDb, schema } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { serverEnv } from "@/lib/env";
import { leadInputSchema } from "@/lib/validations/lead";

export const runtime = "nodejs";

export async function POST(request: Request) {
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

  // TODO(phase-3): rate limiting (Upstash Redis) on IP + email.

  const input = parsed.data;
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
