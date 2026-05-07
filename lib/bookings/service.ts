import "server-only";

import { and, eq, gte, lt, sql } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

/** Soft-lock duration: 15 minutes (briefing spec). */
export const SOFT_LOCK_MINUTES = 15;

/** Minimum deposit percentage (briefing spec: typically 30%). */
export const DEPOSIT_PERCENT = 0.3;

/**
 * Generate next booking code for a year — e.g. ESP-2026-0042.
 * Uses count of bookings created in the same calendar year.
 * (For high-volume ops we'd switch to a dedicated sequence; fine here.)
 */
export async function generateBookingCode(): Promise<string> {
  const db = getDb();
  const year = new Date().getFullYear();
  const firstOfYear = `${year}-01-01`;
  const firstOfNextYear = `${year + 1}-01-01`;

  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(schema.bookings)
    .where(
      and(
        gte(schema.bookings.createdAt, new Date(firstOfYear)),
        lt(schema.bookings.createdAt, new Date(firstOfNextYear)),
      ),
    );
  const n = (row?.count ?? 0) + 1;
  return `ESP-${year}-${String(n).padStart(4, "0")}`;
}

export type ComputeAmountInput = {
  guestsCount: number;
  basePricePerPerson: number | string;
  paymentType: "deposit" | "full";
};

export type ComputedAmount = {
  totalAmount: number;
  depositAmount: number;
  payableNow: number; // deposit or full
};

export function computeAmount(input: ComputeAmountInput): ComputedAmount {
  const base = Number(input.basePricePerPerson);
  if (!Number.isFinite(base) || base <= 0) {
    throw new Error("invalid_base_price");
  }
  const total = round2(base * input.guestsCount);
  const deposit = round2(total * DEPOSIT_PERCENT);
  const payableNow = input.paymentType === "full" ? total : deposit;
  return { totalAmount: total, depositAmount: deposit, payableNow };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** ISO timestamp N minutes in the future. */
export function softLockExpiresAtIso(minutes = SOFT_LOCK_MINUTES): Date {
  return new Date(Date.now() + minutes * 60_000);
}

/**
 * Finalize confirmation: update status/confirmedAt. Idempotent.
 */
export async function confirmBooking(
  bookingId: string,
  paymentId: string,
  paymentStatus: string,
) {
  const db = getDb();
  await db
    .update(schema.bookings)
    .set({
      status: "confirmed",
      paymentId,
      paymentStatus,
      confirmedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.bookings.id, bookingId));
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const db = getDb();
  await db
    .update(schema.bookings)
    .set({
      status: "cancelled",
      cancelledAt: new Date(),
      updatedAt: new Date(),
      adminNotes: reason ?? null,
    })
    .where(eq(schema.bookings.id, bookingId));
}

export async function markPaymentFailed(bookingId: string, paymentStatus: string) {
  const db = getDb();
  await db
    .update(schema.bookings)
    .set({
      paymentStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.bookings.id, bookingId));
}
