import "server-only";

import crypto from "node:crypto";

import { serverEnv } from "@/lib/env";

/**
 * Verify Mercado Pago webhook signature.
 *
 * MP envia um header `x-signature` no formato:
 *   ts=<timestamp>,v1=<hmac_sha256_hex>
 *
 * O HMAC é calculado sobre o template:
 *   id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 *
 * Usando o segredo configurado no painel (MERCADOPAGO_WEBHOOK_SECRET).
 * Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
export function verifyMercadoPagoSignature(params: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string;
}): boolean {
  const env = serverEnv();
  if (!env.MERCADOPAGO_WEBHOOK_SECRET) {
    // Sem segredo configurado — por padrão rejeitamos, salvo em dev.
    return process.env.NODE_ENV !== "production";
  }
  if (!params.signatureHeader) return false;

  const parts = Object.fromEntries(
    params.signatureHeader.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k?.trim(), v?.trim()];
    }),
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const template = `id:${params.dataId};request-id:${params.requestId ?? ""};ts:${ts};`;
  const expected = crypto
    .createHmac("sha256", env.MERCADOPAGO_WEBHOOK_SECRET)
    .update(template)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(v1, "hex"));
  } catch {
    return false;
  }
}

export type MercadoPagoWebhookBody = {
  id?: number | string;
  action?: string; // "payment.created" | "payment.updated" | ...
  type?: string; // "payment"
  data?: { id: string };
  live_mode?: boolean;
};
