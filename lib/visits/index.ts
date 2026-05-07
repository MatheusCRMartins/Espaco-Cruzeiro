import "server-only";

import { and, eq, gte, lt } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

/**
 * Slots de visita disponíveis. Mantenho hardcoded por enquanto —
 * pode virar config no banco depois.
 *
 * Lista de horários (HH:MM) por weekday (0=Dom .. 6=Sáb).
 */
export const VISIT_SLOTS_BY_WEEKDAY: Record<number, string[]> = {
  // Domingo: sem visitas (operação só pra eventos)
  0: [],
  // Segunda: sem visitas (descanso pós-fim-de-semana)
  1: [],
  // Terça
  2: ["14:00", "16:00"],
  // Quarta
  3: ["14:00", "16:00", "18:00"],
  // Quinta
  4: ["14:00", "16:00", "18:00"],
  // Sexta
  5: ["14:00", "16:00"],
  // Sábado: visita só pela manhã
  6: ["10:00", "11:30"],
};

export const VISIT_DURATION_MINUTES = 60;
export const VISIT_BOOKING_HORIZON_DAYS = 60;
export const VISIT_MIN_HOURS_AHEAD = 12;

export type VisitSlot = {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  available: boolean;
};

export type VisitDay = {
  date: string;
  weekday: number;
  slots: VisitSlot[];
};

/**
 * Devolve os próximos 60 dias com slots e disponibilidade.
 * Slot indisponível = já existe visita `scheduled` no mesmo timestamp.
 */
export async function getVisitAvailability(): Promise<VisitDay[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const horizonEnd = new Date(today.getTime() + VISIT_BOOKING_HORIZON_DAYS * 24 * 60 * 60 * 1000);
  const earliestAllowed = new Date(Date.now() + VISIT_MIN_HOURS_AHEAD * 60 * 60 * 1000);

  const db = getDb();
  // Carrega todas as visitas scheduled na janela
  const booked = await db
    .select({
      scheduledAt: schema.visits.scheduledAt,
    })
    .from(schema.visits)
    .where(
      and(
        eq(schema.visits.status, "scheduled"),
        gte(schema.visits.scheduledAt, today),
        lt(schema.visits.scheduledAt, horizonEnd),
      ),
    );

  const bookedKeys = new Set(
    booked.map((b) => b.scheduledAt.toISOString()),
  );

  const days: VisitDay[] = [];
  for (let d = 0; d < VISIT_BOOKING_HORIZON_DAYS; d++) {
    const date = new Date(today.getTime() + d * 24 * 60 * 60 * 1000);
    const weekday = date.getDay();
    const slotsForDay = VISIT_SLOTS_BY_WEEKDAY[weekday] ?? [];
    if (!slotsForDay.length) continue;

    const dateIso = date.toISOString().slice(0, 10);
    const slots: VisitSlot[] = slotsForDay.map((time) => {
      const [h, m] = time.split(":").map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(h, m, 0, 0);
      // Compara no mesmo formato que insert: ISO string em UTC
      const isoUtc = slotDate.toISOString();
      const taken = bookedKeys.has(isoUtc);
      const tooSoon = slotDate < earliestAllowed;
      return { date: dateIso, time, available: !taken && !tooSoon };
    });

    if (slots.some((s) => s.available)) {
      days.push({ date: dateIso, weekday, slots });
    }
  }

  return days;
}

/**
 * Verifica se um slot específico está livre.
 * Usado pelo Server Action antes de inserir.
 */
export async function isVisitSlotAvailable(scheduledAt: Date): Promise<boolean> {
  const db = getDb();
  const [existing] = await db
    .select({ id: schema.visits.id })
    .from(schema.visits)
    .where(
      and(
        eq(schema.visits.scheduledAt, scheduledAt),
        eq(schema.visits.status, "scheduled"),
      ),
    );
  return !existing;
}
