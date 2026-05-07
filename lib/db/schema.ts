import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  smallint,
  text,
  time,
  timestamp,
  uuid,
  check,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/**
 * Espaço Cruzeiro — Drizzle schema.
 *
 * `auth.users` is managed by Supabase Auth; we reference its id column
 * via a plain uuid field without an FK constraint (Drizzle does not
 * own that schema). Validate ownership in application code + RLS.
 *
 * Timezone policy:
 *  - `event_date` uses `date` (calendar date only, no TZ)
 *  - `event_start_time` / `event_end_time` use `time` (wall clock in America/Sao_Paulo)
 *  - All audit timestamps use `timestamptz`
 */

// ---------------------------------------------------------------------------
// Event types (configurable by admin)
// ---------------------------------------------------------------------------
export const eventTypes = pgTable(
  "event_types",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    basePricePerPerson: numeric("base_price_per_person", { precision: 10, scale: 2 }),
    minGuests: integer("min_guests"),
    maxGuests: integer("max_guests"),
    durationHours: integer("duration_hours").default(6).notNull(),
    active: boolean("active").default(true).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("event_types_slug_uq").on(t.slug)],
);

// ---------------------------------------------------------------------------
// Availability — weekly operating rules
// ---------------------------------------------------------------------------
export const availabilityRules = pgTable("availability_rules", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekday: smallint("weekday").notNull(), // 0 = sunday .. 6 = saturday
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Manual date blocks (holidays, maintenance, etc.)
// ---------------------------------------------------------------------------
export const blockedDates = pgTable(
  "blocked_dates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    date: date("date").notNull(),
    reason: text("reason"),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("blocked_dates_date_uq").on(t.date)],
);

// ---------------------------------------------------------------------------
// Bookings
// ---------------------------------------------------------------------------
export const bookingStatusValues = [
  "pending_payment",
  "confirmed",
  "cancelled",
  "completed",
  "refunded",
] as const;

export const paymentTypeValues = ["deposit", "full"] as const;

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingCode: text("booking_code").notNull(), // e.g. ESP-2026-0001
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerCpf: text("customer_cpf"),
    eventTypeId: uuid("event_type_id").references(() => eventTypes.id, {
      onDelete: "restrict",
    }),
    eventDate: date("event_date").notNull(),
    eventStartTime: time("event_start_time").notNull(),
    eventEndTime: time("event_end_time").notNull(),
    guestsCount: integer("guests_count").notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    depositAmount: numeric("deposit_amount", { precision: 10, scale: 2 }).notNull(),
    paymentType: text("payment_type").notNull(),
    status: text("status").notNull().default("pending_payment"),
    paymentId: text("payment_id"),
    paymentStatus: text("payment_status"),
    notes: text("notes"),
    adminNotes: text("admin_notes"),
    softLockExpiresAt: timestamp("soft_lock_expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("bookings_code_uq").on(t.bookingCode),
    uniqueIndex("bookings_payment_id_uq").on(t.paymentId),
    index("bookings_event_date_idx").on(t.eventDate),
    index("bookings_status_idx").on(t.status),
    check(
      "bookings_status_check",
      sql`status in ('pending_payment','confirmed','cancelled','completed','refunded')`,
    ),
    check("bookings_payment_type_check", sql`payment_type in ('deposit','full')`),
  ],
);

// ---------------------------------------------------------------------------
// Leads — budget form / contact form
// ---------------------------------------------------------------------------
export const leadStatusValues = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "lost",
] as const;

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    eventTypeId: uuid("event_type_id").references(() => eventTypes.id, {
      onDelete: "set null",
    }),
    estimatedDate: date("estimated_date"),
    estimatedGuests: integer("estimated_guests"),
    message: text("message"),
    source: text("source"),
    status: text("status").notNull().default("new"),
    adminNotes: text("admin_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    contactedAt: timestamp("contacted_at", { withTimezone: true }),
  },
  (t) => [
    index("leads_status_idx").on(t.status),
    index("leads_created_at_idx").on(t.createdAt),
    check(
      "leads_status_check",
      sql`status in ('new','contacted','qualified','converted','lost')`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
export const galleryPhotos = pgTable("gallery_photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  storagePath: text("storage_path").notNull(),
  altText: text("alt_text"),
  eventTypeId: uuid("event_type_id").references(() => eventTypes.id, {
    onDelete: "set null",
  }),
  displayOrder: integer("display_order").default(0).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------
export const testimonials = pgTable(
  "testimonials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    customerName: text("customer_name").notNull(),
    eventTypeId: uuid("event_type_id").references(() => eventTypes.id, {
      onDelete: "set null",
    }),
    rating: smallint("rating").notNull(),
    content: text("content").notNull(),
    photoPath: text("photo_path"),
    eventDate: date("event_date"),
    approved: boolean("approved").default(false).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [check("testimonials_rating_check", sql`rating between 1 and 5`)],
);

// ---------------------------------------------------------------------------
// Business settings — singleton (1 linha) com NAP, horários, redes, política.
// Substitui lib/constants.ts hardcoded. Admin edita pelo painel.
// ---------------------------------------------------------------------------
export const businessSettings = pgTable("business_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  // chave fixa "default" — garantimos linha única via uniqueIndex.
  // Permite no futuro multi-tenant se virar.
  key: text("key").notNull().default("default"),
  // tudo em JSONB pra evolução do schema sem migrations a cada campo
  data: jsonb("data").notNull(),
  updatedBy: uuid("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("business_settings_key_uq").on(t.key)]);

// ---------------------------------------------------------------------------
// Editable content blocks (home copy, FAQ, etc.)
// ---------------------------------------------------------------------------
export const contentBlocks = pgTable(
  "content_blocks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull(),
    value: jsonb("value").notNull(),
    updatedBy: uuid("updated_by"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("content_blocks_key_uq").on(t.key)],
);

// ---------------------------------------------------------------------------
// Notifications log
// ---------------------------------------------------------------------------
export const notificationsLog = pgTable("notifications_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  recipient: text("recipient").notNull(),
  subject: text("subject"),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
  relatedBookingId: uuid("related_booking_id").references(() => bookings.id, {
    onDelete: "set null",
  }),
  relatedLeadId: uuid("related_lead_id").references(() => leads.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Admin audit log
// ---------------------------------------------------------------------------
export const adminAuditLog = pgTable("admin_audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: uuid("entity_id"),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type EventType = typeof eventTypes.$inferSelect;
export type NewEventType = typeof eventTypes.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type BookingStatus = (typeof bookingStatusValues)[number];
export type PaymentType = (typeof paymentTypeValues)[number];
export type LeadStatus = (typeof leadStatusValues)[number];
export type BusinessSettings = typeof businessSettings.$inferSelect;
