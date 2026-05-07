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
/**
 * Janela máxima de aceitação do timestamp do webhook (em ms).
 * MP costuma entregar em segundos; 5min é folgado mas inviabiliza replay
 * de pacotes capturados há semanas/meses.
 */
const SIGNATURE_TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000;

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

  // Anti-replay: rejeita timestamps fora da janela. MP entrega `ts` em ms.
  const tsNum = Number(ts);
  if (!Number.isFinite(tsNum)) return false;
  const drift = Math.abs(Date.now() - tsNum);
  if (drift > SIGNATURE_TIMESTAMP_TOLERANCE_MS) return false;

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
