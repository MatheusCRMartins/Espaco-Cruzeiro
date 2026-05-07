import "server-only";

import { and, eq, gte, inArray, lt } from "drizzle-orm";
import { format } from "date-fns";

import { getDb, schema } from "@/lib/db";

/**
 * Engine de disponibilidade.
 *
 * Regra:
 *   dia está disponível ⇔ (há regra semanal ativa para o weekday)
 *                       ∧ (dia não está em blocked_dates)
 *                       ∧ (não existe booking ativo na mesma data)
 *
 * `active booking` = status em ('pending_payment' com soft_lock não expirado, 'confirmed').
 * - `cancelled`, `refunded`, `completed` não bloqueiam novas reservas.
 * - `pending_payment` com soft_lock expirado é tratado como livre (a verificação
 *   final no POST /api/bookings roda em transação pra evitar race).
 */
export type DayStatus =
  | "available"
  | "unavailable" // fora das regras semanais
  | "blocked" // data bloqueada pelo admin
  | "booked"; // já tem booking ativo

export type DayInfo = {
  date: string; // YYYY-MM-DD
  weekday: number;
  status: DayStatus;
  startTime?: string; // HH:MM do rule
  endTime?: string;
};

export type AvailabilityMonth = {
  month: string; // YYYY-MM
  days: DayInfo[];
};

export async function getMonthAvailability(
  month: string, // YYYY-MM
): Promise<AvailabilityMonth> {
  const [yearStr, monthStr] = month.split("-");
  const year = Number(yearStr);
  const monthNum = Number(monthStr); // 1..12
  if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
    throw new Error("invalid_month");
  }

  const firstDay = new Date(Date.UTC(year, monthNum - 1, 1));
  const lastDayExclusive = new Date(Date.UTC(year, monthNum, 1));
  const firstIso = format(firstDay, "yyyy-MM-dd");
  const lastIso = format(lastDayExclusive, "yyyy-MM-dd");

  const db = getDb();
  const [rules, blocks, activeBookings] = await Promise.all([
    db.select().from(schema.availabilityRules).where(eq(schema.availabilityRules.active, true)),
    db
      .select()
      .from(schema.blockedDates)
      .where(
        and(
          gte(schema.blockedDates.date, firstIso),
          lt(schema.blockedDates.date, lastIso),
        ),
      ),
    db
      .select({
        eventDate: schema.bookings.eventDate,
        status: schema.bookings.status,
        softLockExpiresAt: schema.bookings.softLockExpiresAt,
      })
      .from(schema.bookings)
      .where(
        and(
          gte(schema.bookings.eventDate, firstIso),
          lt(schema.bookings.eventDate, lastIso),
          inArray(schema.bookings.status, ["pending_payment", "confirmed"]),
        ),
      ),
  ]);

  const rulesByWeekday = new Map<number, (typeof rules)[number]>();
  for (const r of rules) rulesByWeekday.set(r.weekday, r);

  const blockedSet = new Set(blocks.map((b) => b.date));
  const now = new Date();
  const bookedSet = new Set(
    activeBookings
      .filter((b) => {
        if (b.status === "confirmed") return true;
        // pending_payment — bloqueia só se lock ainda válido
        if (!b.softLockExpiresAt) return false;
        return b.softLockExpiresAt > now;
      })
      .map((b) => b.eventDate),
  );

  const days: DayInfo[] = [];
  const daysInMonth = new Date(year, monthNum, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(Date.UTC(year, monthNum - 1, d));
    const iso = format(date, "yyyy-MM-dd");
    const weekday = date.getUTCDay(); // 0..6

    if (bookedSet.has(iso)) {
      days.push({ date: iso, weekday, status: "booked" });
      continue;
    }
    if (blockedSet.has(iso)) {
      days.push({ date: iso, weekday, status: "blocked" });
      continue;
    }
    const rule = rulesByWeekday.get(weekday);
    if (!rule) {
      days.push({ date: iso, weekday, status: "unavailable" });
      continue;
    }
    days.push({
      date: iso,
      weekday,
      status: "available",
      startTime: rule.startTime.slice(0, 5),
      endTime: rule.endTime.slice(0, 5),
    });
  }

  return { month, days };
}

/**
 * Checagem server-authoritative feita antes de criar booking.
 * Retorna {ok: true} ou {ok: false, reason: "..."}.
 */
export async function assertDateAvailable(
  date: string, // YYYY-MM-DD
): Promise<{ ok: true; startTime: string; endTime: string } | { ok: false; reason: DayStatus }> {
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return { ok: false, reason: "unavailable" };
  const weekday = d.getUTCDay();

  const db = getDb();
  const [rule] = await db
    .select()
    .from(schema.availabilityRules)
    .where(and(eq(schema.availabilityRules.weekday, weekday), eq(schema.availabilityRules.active, true)));
  if (!rule) return { ok: false, reason: "unavailable" };

  const [blocked] = await db
    .select()
    .from(schema.blockedDates)
    .where(eq(schema.blockedDates.date, date));
  if (blocked) return { ok: false, reason: "blocked" };

  const booked = await db
    .select({
      status: schema.bookings.status,
      softLockExpiresAt: schema.bookings.softLockExpiresAt,
    })
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.eventDate, date),
        inArray(schema.bookings.status, ["pending_payment", "confirmed"]),
      ),
    );

  const now = new Date();
  const isBooked = booked.some((b) => {
    if (b.status === "confirmed") return true;
    return !!b.softLockExpiresAt && b.softLockExpiresAt > now;
  });
  if (isBooked) return { ok: false, reason: "booked" };

  return { ok: true, startTime: rule.startTime.slice(0, 5), endTime: rule.endTime.slice(0, 5) };
}
