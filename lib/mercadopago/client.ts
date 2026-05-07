import "server-only";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

import { serverEnv } from "@/lib/env";

let cached: {
  config: MercadoPagoConfig;
  payment: Payment;
  preference: Preference;
} | null = null;

export function getMercadoPago() {
  if (cached) return cached;
  const env = serverEnv();
  if (!env.MERCADOPAGO_ACCESS_TOKEN) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN is not configured");
  }
  const config = new MercadoPagoConfig({
    accessToken: env.MERCADOPAGO_ACCESS_TOKEN,
    options: { timeout: 10_000 },
  });
  cached = {
    config,
    payment: new Payment(config),
    preference: new Preference(config),
  };
  return cached;
}
