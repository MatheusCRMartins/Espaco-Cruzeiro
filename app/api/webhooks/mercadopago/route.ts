import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { getMercadoPago } from "@/lib/mercadopago/client";
import {
  verifyMercadoPagoSignature,
  type MercadoPagoWebhookBody,
} from "@/lib/mercadopago/webhook";
import {
  cancelBooking,
  confirmBooking,
  markPaymentFailed,
} from "@/lib/bookings/service";
import { notify } from "@/lib/notifications";
import { BUSINESS } from "@/lib/constants";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Mercado Pago webhook.
 *
 *  - Valida HMAC-SHA256 do header `x-signature` (lib/mercadopago/webhook.ts)
 *  - Busca detalhes do pagamento via API (nunca confia no body)
 *  - Localiza booking via `external_reference` ou `metadata.booking_id`
 *  - Aplica transição idempotente (checa status atual antes de mudar)
 *  - Dispara notificações (admin + cliente) em caso de confirmação
 *  - SEMPRE retorna 200 (exceto em erro explícito de assinatura) para evitar retries.
 */
export async function POST(request: Request) {
  const signatureHeader = request.headers.get("x-signature");
  const requestId = request.headers.get("x-request-id");

  let body: MercadoPagoWebhookBody;
  try {
    body = (await request.json()) as MercadoPagoWebhookBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Apenas webhooks de pagamento nos interessam
  if (body.type && body.type !== "payment") {
    return NextResponse.json({ received: true, ignored: true });
  }
  const dataId = body.data?.id;
  if (!dataId) {
    return NextResponse.json({ error: "missing_data_id" }, { status: 400 });
  }

  const signatureOk = verifyMercadoPagoSignature({
    signatureHeader,
    requestId,
    dataId,
  });
  if (!signatureOk) {
    console.warn("[mp-webhook] invalid signature", { requestId, dataId });
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  // Busca detalhes do pagamento pela API (fonte da verdade)
  let paymentDetails: {
    id: string | number;
    status?: string;
    external_reference?: string;
    metadata?: Record<string, unknown>;
  };
  try {
    const { payment } = getMercadoPago();
    const result = await payment.get({ id: dataId });
    paymentDetails = result as typeof paymentDetails;
  } catch (err) {
    console.error("[mp-webhook] failed to fetch payment:", err);
    // Retorna 200 pra evitar retries — MP reinvoca mais tarde se precisar
    return NextResponse.json({ received: true, error: "fetch_failed" });
  }

  const bookingId =
    paymentDetails.external_reference ??
    (paymentDetails.metadata?.booking_id as string | undefined);
  if (!bookingId) {
    console.warn("[mp-webhook] no booking id in payment", paymentDetails);
    return NextResponse.json({ received: true, ignored: true });
  }

  const db = getDb();
  const [booking] = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId));
  if (!booking) {
    console.warn("[mp-webhook] booking not found:", bookingId);
    return NextResponse.json({ received: true, ignored: true });
  }

  const paymentStatus = String(paymentDetails.status ?? "unknown");
  const paymentIdStr = String(paymentDetails.id);

  // Idempotência: se já está confirmado com esse paymentId, não faz nada
  if (booking.status === "confirmed" && booking.paymentId === paymentIdStr) {
    return NextResponse.json({ received: true, idempotent: true });
  }

  try {
    if (paymentStatus === "approved") {
      await confirmBooking(bookingId, paymentIdStr, paymentStatus);

      // Notifica admin + cliente (best-effort)
      void notify("email", {
        recipient: BUSINESS.contact.email,
        template: "admin_booking_confirmed",
        data: {
          bookingCode: booking.bookingCode,
          customerName: booking.customerName,
          eventDate: booking.eventDate,
          totalAmount: booking.totalAmount,
        },
        relatedBookingId: bookingId,
      });
      void notify("email", {
        recipient: booking.customerEmail,
        template: "customer_booking_confirmed",
        data: {
          customerName: booking.customerName,
          bookingCode: booking.bookingCode,
          eventDate: booking.eventDate,
          eventStartTime: booking.eventStartTime,
        },
        relatedBookingId: bookingId,
      });
    } else if (
      paymentStatus === "cancelled" ||
      paymentStatus === "refunded" ||
      paymentStatus === "rejected"
    ) {
      if (booking.status !== "cancelled") {
        await cancelBooking(bookingId, `payment_${paymentStatus}`);

        void notify("email", {
          recipient: booking.customerEmail,
          template: "customer_booking_cancelled",
          data: {
            customerName: booking.customerName,
            bookingCode: booking.bookingCode,
            paymentStatus,
          },
          relatedBookingId: bookingId,
        });
      }
    } else {
      // in_process, pending, authorized — só atualiza paymentStatus
      await markPaymentFailed(bookingId, paymentStatus);
    }
  } catch (err) {
    console.error("[mp-webhook] state transition failed:", err);
    // Retorna 200 pra MP não retry indefinidamente; reprocesso manual via admin
    return NextResponse.json({ received: true, error: "transition_failed" });
  }

  return NextResponse.json({ received: true });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
