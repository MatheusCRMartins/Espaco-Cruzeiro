"use server";

import { headers } from "next/headers";
import { z } from "zod";

import { getBusinessSettings } from "@/lib/business-settings";
import { getDb, schema } from "@/lib/db";
import { notify } from "@/lib/notifications";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  cpf as cpfSchema,
  email as emailSchema,
  honeypot,
  name as nameSchema,
  phoneBR,
} from "@/lib/validations/common";
import { isVisitSlotAvailable } from "@/lib/visits";

export type ScheduleVisitState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const SCHEDULE_VISIT_INITIAL: ScheduleVisitState = { status: "idle" };

const inputSchema = z.object({
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneBR,
  scheduledDate: z.string().date(),
  scheduledTime: z.string().regex(/^\d{2}:\d{2}$/, "Horário inválido"),
  eventTypeId: z.string().uuid().optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
  consent: z.literal(true, { message: "É necessário aceitar os termos" }),
  website: honeypot,
});

// CPF não é obrigatório pra visita (mais barato pra cliente)
void cpfSchema;

export async function scheduleVisit(
  _prev: ScheduleVisitState,
  formData: FormData,
): Promise<ScheduleVisitState> {
  // Rate limit
  const h = await headers();
  const ip = getClientIp(h);
  const rl = await rateLimit({
    key: `visit:ip:${ip}`,
    limit: 5,
    windowSeconds: 60 * 30,
  });
  if (!rl.ok) {
    return {
      status: "error",
      message: `Muitas tentativas. Aguarde ${rl.retryAfterSeconds}s e tente de novo.`,
    };
  }

  const raw = {
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    scheduledDate: formData.get("scheduledDate"),
    scheduledTime: formData.get("scheduledTime"),
    eventTypeId: formData.get("eventTypeId") || null,
    notes: formData.get("notes") || null,
    consent:
      formData.get("consent") === "on" || formData.get("consent") === "true",
    website: formData.get("website") ?? "",
  };

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      (fieldErrors[issue.path.join(".")] ??= []).push(issue.message);
    }
    return {
      status: "error",
      message: "Revise os campos.",
      fieldErrors,
    };
  }

  const data = parsed.data;
  // Monta timestamp em horário local SP. JS Date sem TZ usa o timezone do server,
  // que na Vercel é UTC. Pra ser determinístico, calculamos manualmente:
  const [y, m, d] = data.scheduledDate.split("-").map(Number);
  const [hh, mm] = data.scheduledTime.split(":").map(Number);
  // Brasil é UTC-3 (sem horário de verão atualmente). Hora-de-Brasília 14:00
  // = 17:00 UTC. Ajustamos pra UTC adicionando 3h.
  const scheduledAt = new Date(Date.UTC(y, m - 1, d, hh + 3, mm, 0));

  if (Number.isNaN(scheduledAt.getTime())) {
    return { status: "error", message: "Data/horário inválido." };
  }

  const free = await isVisitSlotAvailable(scheduledAt);
  if (!free) {
    return {
      status: "error",
      message: "Esse horário acabou de ser preenchido. Escolha outro.",
    };
  }

  try {
    const db = getDb();
    const [inserted] = await db
      .insert(schema.visits)
      .values({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        eventTypeId: data.eventTypeId ?? null,
        scheduledAt,
        notes: data.notes ?? null,
      })
      .returning({ id: schema.visits.id });

    const settings = await getBusinessSettings();
    void notify("email", {
      recipient: settings.contact.email,
      template: "admin_new_lead",
      data: {
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        message: `Agendou visita pra ${data.scheduledDate} às ${data.scheduledTime}. ${
          data.notes ?? ""
        }`,
      },
      relatedLeadId: inserted?.id,
    });

    return {
      status: "ok",
      message:
        "Visita agendada! Te esperamos no dia. Enviamos confirmação no seu e-mail.",
    };
  } catch (err) {
    console.error("[visita] scheduleVisit failed:", err);
    return {
      status: "error",
      message: "Não consegui agendar agora. Tente novamente em instantes.",
    };
  }
}
