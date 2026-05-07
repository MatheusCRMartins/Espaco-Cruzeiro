import "server-only";

import { getMercadoPago } from "./client";
import { serverEnv } from "@/lib/env";

export type CreatePreferenceInput = {
  bookingId: string;
  bookingCode: string;
  title: string; // shown at checkout
  amount: number; // in BRL, 2 decimals
  payerEmail: string;
  payerName: string;
};

export type CreatePreferenceResult = {
  preferenceId: string;
  initPoint: string; // checkout URL (production)
  sandboxInitPoint: string; // checkout URL (sandbox)
};

export async function createBookingPreference(
  input: CreatePreferenceInput,
): Promise<CreatePreferenceResult> {
  const env = serverEnv();
  const site = env.NEXT_PUBLIC_SITE_URL;
  const { preference } = getMercadoPago();

  const result = await preference.create({
    body: {
      items: [
        {
          id: input.bookingCode,
          title: input.title,
          quantity: 1,
          unit_price: input.amount,
          currency_id: "BRL",
        },
      ],
      payer: {
        email: input.payerEmail,
        name: input.payerName,
      },
      back_urls: {
        success: `${site}/reservar/sucesso?booking=${input.bookingId}`,
        failure: `${site}/reservar/erro?booking=${input.bookingId}`,
        pending: `${site}/reservar/pendente?booking=${input.bookingId}`,
      },
      auto_return: "approved",
      external_reference: input.bookingId,
      notification_url: `${site}/api/webhooks/mercadopago`,
      statement_descriptor: "ESPACOCRUZEIRO",
      metadata: { booking_id: input.bookingId, booking_code: input.bookingCode },
    },
  });

  if (!result.id || !result.init_point) {
    throw new Error("mercadopago_preference_missing_fields");
  }

  return {
    preferenceId: result.id,
    initPoint: result.init_point,
    sandboxInitPoint: result.sandbox_init_point ?? result.init_point,
  };
}
