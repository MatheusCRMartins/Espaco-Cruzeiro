import "server-only";

import { getDb, schema } from "@/lib/db";
import { emailAdapter } from "./email-adapter";
import type {
  NotificationAdapter,
  NotificationChannel,
  NotificationPayload,
  NotificationResult,
} from "./types";

/**
 * Central NotificationService.
 *
 * Hoje: só canal `email` (Resend). A arquitetura permite plugar
 * `whatsapp_api` quando o cliente migrar para a API oficial Meta.
 */
const adapters = new Map<NotificationChannel, NotificationAdapter>([
  ["email", emailAdapter],
]);

export async function notify(
  channel: NotificationChannel,
  payload: NotificationPayload,
): Promise<NotificationResult> {
  const adapter = adapters.get(channel);
  if (!adapter) {
    return { ok: false, channel, error: `No adapter for channel ${channel}` };
  }

  const result = await adapter.send(payload);

  // Log best-effort (do not crash the flow if logging fails).
  try {
    const db = getDb();
    await db.insert(schema.notificationsLog).values({
      type: payload.template,
      recipient: payload.recipient,
      subject: null,
      status: result.ok ? "sent" : "failed",
      errorMessage: result.error ?? null,
      relatedBookingId: payload.relatedBookingId ?? null,
      relatedLeadId: payload.relatedLeadId ?? null,
    });
  } catch (err) {
    console.error("[notifications] failed to write log:", err);
  }

  return result;
}

export type { NotificationChannel, NotificationPayload, NotificationResult };
