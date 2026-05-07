"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { assertDateAvailable } from "@/lib/availability";
import { getBusinessSettings } from "@/lib/business-settings";
import {
  computeAmount,
  generateBookingCode,
  softLockExpiresAtIso,
} from "@/lib/bookings/service";
import { applyPercentOff, checkCoupon, incrementCouponUse } from "@/lib/coupons";
import { getDb, schema } from "@/lib/db";
import { createBookingPreference } from "@/lib/mercadopago/preference";
import { serverEnv } from "@/lib/env";
import { waLink } from "@/lib/utils";
import {
  cpf as cpfSchema,
  email as emailSchema,
  name as nameSchema,
  phoneBR,
} from "@/lib/validations/common";

export type ManualBookingState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  result?: {
    bookingCode: string;
    bookingId: string;
    checkoutUrl: string;
    waLink: string;
    payableNow: number;
    customerPhone: string;
  };
};

export const MANUAL_BOOKING_INITIAL: ManualBookingState = { status: "idle" };

const inputSchema = z.object({
  eventTypeId: z.string().uuid(),
  eventDate: z.string().date(),
  eventStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  guestsCount: z.coerce.number().int().min(1).max(2000),
  paymentType: z.enum(["deposit", "full"]),
  customerName: nameSchema,
  customerEmail: emailSchema,
  customerPhone: phoneBR,
  customerCpf: cpfSchema,
  notes: z.string().trim().max(2000).optional().nullable(),
  couponCode: z
    .string()
    .trim()
    .toUpperCase()
    .max(40)
    .regex(/^[A-Z0-9_-]+$/)
    .optional()
    .or(z.literal("")),
});

/**
 * Server Action — admin gera um link de pagamento pra cliente que ligou /
 * mandou WhatsApp / fechou em visita.
 *
 * Cria booking pending_payment + preferência MP + link WhatsApp
 * pré-formatado pra colar/enviar em 1 clique.
 *
 * Reusa toda a lógica do POST /api/bookings (validação de data, cupom,
 * cálculo de valor, soft-lock).
 */
export async function createManualBooking(
  _prev: ManualBookingState,
  formData: FormData,
): Promise<ManualBookingState> {
  const user = await requireAdmin();

  const raw = {
    eventTypeId: formData.get("eventTypeId"),
    eventDate: formData.get("eventDate"),
    eventStartTime: String(formData.get("eventStartTime") ?? "").slice(0, 5),
    guestsCount: formData.get("guestsCount"),
    paymentType: formData.get("paymentType"),
    customerName: formData.get("customerName"),
    customerEmail: formData.get("customerEmail"),
    customerPhone: formData.get("customerPhone"),
    customerCpf: formData.get("customerCpf"),
    notes: formData.get("notes") || null,
    couponCode: formData.get("couponCode") || "",
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
  const input = parsed.data;

  const availability = await assertDateAvailable(input.eventDate);
  if (!availability.ok) {
    return {
      status: "error",
      message: `Data indisponível: ${availability.reason}.`,
    };
  }

  const db = getDb();
  const [eventType] = await db
    .select()
    .from(schema.eventTypes)
    .where(eq(schema.eventTypes.id, input.eventTypeId));
  if (!eventType || !eventType.basePricePerPerson) {
    return { status: "error", message: "Tipo de evento inválido." };
  }

  // amounts (com cupom opcional)
  let { totalAmount, depositAmount, payableNow } = computeAmount({
    guestsCount: input.guestsCount,
    basePricePerPerson: eventType.basePricePerPerson,
    paymentType: input.paymentType,
  });

  let appliedCoupon: { code: string; discount: number } | null = null;
  if (input.couponCode) {
    const c = await checkCoupon(input.couponCode);
    if (!c.ok) {
      return { status: "error", message: `Cupom: ${c.message}` };
    }
    const { discount, totalAfter } = applyPercentOff(totalAmount, c.percentOff);
    appliedCoupon = { code: c.code, discount };
    const ratio = totalAfter > 0 ? totalAfter / (totalAfter + discount) : 1;
    totalAmount = totalAfter;
    depositAmount = Math.round(depositAmount * ratio * 100) / 100;
    payableNow = input.paymentType === "full" ? totalAfter : depositAmount;
  }

  const bookingCode = await generateBookingCode();
  const durationHours = eventType.durationHours ?? 6;
  const [sh, sm] = input.eventStartTime.split(":").map(Number);
  const endTotalMinutes = sh * 60 + sm + durationHours * 60;
  const endHHMM = `${String(Math.floor(endTotalMinutes / 60) % 24).padStart(2, "0")}:${String(
    endTotalMinutes % 60,
  ).padStart(2, "0")}`;

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
        eventStartTime: input.eventStartTime,
        eventEndTime: endHHMM,
        guestsCount: input.guestsCount,
        totalAmount: totalAmount.toFixed(2),
        depositAmount: depositAmount.toFixed(2),
        paymentType: input.paymentType,
        status: "pending_payment",
        notes: input.notes ?? null,
        adminNotes: `Reserva criada manualmente por ${user.email}`,
        couponCode: appliedCoupon?.code ?? null,
        discountAmount: (appliedCoupon?.discount ?? 0).toFixed(2),
        softLockExpiresAt: softLockExpiresAtIso(60), // 1h pro cliente pagar
      })
      .returning({ id: schema.bookings.id });
    bookingId = inserted.id;
  } catch (err) {
    console.error("[admin/manual] insert failed:", err);
    return { status: "error", message: "Não consegui criar a reserva." };
  }

  if (appliedCoupon) void incrementCouponUse(appliedCoupon.code);

  await logAdminAction({
    userId: user.id,
    action: "create_manual_booking",
    entityType: "booking",
    entityId: bookingId,
    changes: { bookingCode, total: totalAmount, payableNow },
  });

  // Gera link MP (ou usa mock se sem token)
  const env = serverEnv();
  const settings = await getBusinessSettings();
  let checkoutUrl = "";

  if (env.MERCADOPAGO_ACCESS_TOKEN) {
    try {
      const pref = await createBookingPreference({
        bookingId,
        bookingCode,
        title: `${eventType.name} — ${input.eventDate} (${bookingCode})`,
        amount: payableNow,
        payerEmail: input.customerEmail,
        payerName: input.customerName,
      });
      checkoutUrl = pref.initPoint;
    } catch (err) {
      console.error("[admin/manual] MP preference failed:", err);
      // marca cancelado pra não bloquear data
      await db
        .update(schema.bookings)
        .set({ status: "cancelled", cancelledAt: new Date() })
        .where(eq(schema.bookings.id, bookingId));
      return {
        status: "error",
        message: "Não consegui gerar o link de pagamento. Mercado Pago indisponível.",
      };
    }
  } else {
    checkoutUrl = `${env.NEXT_PUBLIC_SITE_URL}/reservar/sucesso?booking=${bookingId}&mock=1`;
  }

  // WhatsApp message
  const fmtBRL = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const message = `Olá, ${input.customerName.split(" ")[0]}! Aqui está o link pra você garantir sua data no ${settings.name}:\n\n📅 Evento: ${eventType.name}\n📆 Data: ${input.eventDate.split("-").reverse().join("/")}\n💵 Valor a pagar agora: ${fmtBRL(payableNow)}\n\n👉 ${checkoutUrl}\n\nQualquer dúvida é só chamar!`;
  const waUrl = waLink(input.customerPhone, message);

  return {
    status: "ok",
    message: "Link gerado. Já pode mandar pro cliente.",
    result: {
      bookingCode,
      bookingId,
      checkoutUrl,
      waLink: waUrl,
      payableNow,
      customerPhone: input.customerPhone,
    },
  };
}
