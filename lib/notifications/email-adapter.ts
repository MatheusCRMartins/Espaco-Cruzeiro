import "server-only";

import { Resend } from "resend";

import { serverEnv } from "@/lib/env";
import { renderEmail } from "./templates";
import type {
  NotificationAdapter,
  NotificationPayload,
  NotificationResult,
} from "./types";

let cachedResend: Resend | null = null;

function getResend() {
  if (cachedResend) return cachedResend;
  const env = serverEnv();
  if (!env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }
  cachedResend = new Resend(env.RESEND_API_KEY);
  return cachedResend;
}

export const emailAdapter: NotificationAdapter = {
  channel: "email",
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const env = serverEnv();
    if (!env.RESEND_FROM_EMAIL) {
      return { ok: false, channel: "email", error: "RESEND_FROM_EMAIL not configured" };
    }

    try {
      const { subject, html, text } = renderEmail(payload);

      const resend = getResend();
      const { data, error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: payload.recipient,
        subject,
        html,
        text,
      });

      if (error) {
        return { ok: false, channel: "email", error: error.message };
      }
      return { ok: true, channel: "email", providerId: data?.id };
    } catch (err) {
      return {
        ok: false,
        channel: "email",
        error: err instanceof Error ? err.message : "unknown error",
      };
    }
  },
};
