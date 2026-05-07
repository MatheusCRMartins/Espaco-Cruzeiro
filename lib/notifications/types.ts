export type NotificationChannel = "email" | "whatsapp_api";

export type NotificationTemplate =
  | "admin_new_lead"
  | "admin_new_booking_pending"
  | "admin_booking_confirmed"
  | "customer_booking_pending"
  | "customer_booking_confirmed"
  | "customer_booking_cancelled"
  | "customer_reminder_d7"
  | "customer_reminder_d1"
  | "customer_cart_recovery"; // booking ficou em pending_payment > 2h

export interface NotificationPayload {
  recipient: string; // email address or phone number
  template: NotificationTemplate;
  data: Record<string, unknown>;
  relatedBookingId?: string;
  relatedLeadId?: string;
}

export interface NotificationResult {
  ok: boolean;
  channel: NotificationChannel;
  providerId?: string;
  error?: string;
}

export interface NotificationAdapter {
  readonly channel: NotificationChannel;
  send(payload: NotificationPayload): Promise<NotificationResult>;
}
