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

// ---------------------------------------------------------------------------
// Proof-of-life: conta sábados (e datas-chave) livres pros próximos N meses.
// Usado pelo hero da home pra criar urgência genuína (não FOMO falso).
// ---------------------------------------------------------------------------
const PROOF_TTL_MS = 60 * 1000; // 1 min — o agregado muda devagar
const proofCache = globalThis as unknown as {
  _ecProofOfLife?: { value: ProofOfLife; expiresAt: number };
};

export type ProofOfLife = {
  // Sábados livres no mês corrente (até o último dia do mês).
  saturdaysCurrentMonth: number;
  // Sábados livres no próximo mês.
  saturdaysNextMonth: number;
  // Mês atual (number 1..12) — útil pra montar a frase.
  currentMonth: number;
  nextMonth: number;
  // Datas livres totais nos próximos 60 dias.
  totalAvailableNext60Days: number;
};

export async function getProofOfLife(): Promise<ProofOfLife> {
  const now = Date.now();
  const cached = proofCache._ecProofOfLife;
  if (cached && cached.expiresAt > now) return cached.value;

  const today = new Date();
  const cy = today.getFullYear();
  const cm = today.getMonth(); // 0-indexed
  const next = new Date(cy, cm + 1, 1);
  const ny = next.getFullYear();
  const nm = next.getMonth();

  const monthA = `${cy}-${String(cm + 1).padStart(2, "0")}`;
  const monthB = `${ny}-${String(nm + 1).padStart(2, "0")}`;

  let saturdaysA = 0;
  let saturdaysB = 0;
  let total60 = 0;

  try {
    const [a, b] = await Promise.all([
      getMonthAvailability(monthA),
      getMonthAvailability(monthB),
    ]);

    const todayIso = today.toISOString().slice(0, 10);
    const sixtyDaysFromNow = new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    for (const d of a.days) {
      if (d.status !== "available") continue;
      if (d.date < todayIso) continue;
      if (d.weekday === 6) saturdaysA++;
      if (d.date <= sixtyDaysFromNow) total60++;
    }
    for (const d of b.days) {
      if (d.status !== "available") continue;
      if (d.weekday === 6) saturdaysB++;
      if (d.date <= sixtyDaysFromNow) total60++;
    }
  } catch (err) {
    console.error("[availability] proof-of-life failed:", err);
  }

  const value: ProofOfLife = {
    saturdaysCurrentMonth: saturdaysA,
    saturdaysNextMonth: saturdaysB,
    currentMonth: cm + 1,
    nextMonth: nm + 1,
    totalAvailableNext60Days: total60,
  };
  proofCache._ecProofOfLife = { value, expiresAt: now + PROOF_TTL_MS };
  return value;
}
