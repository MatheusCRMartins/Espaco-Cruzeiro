import "server-only";

import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/lib/db";

export const couponCodeSchema = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .regex(/^[A-Z0-9_-]+$/, "Código inválido");

export type CouponCheckResult =
  | {
      ok: true;
      code: string;
      percentOff: number;
      description: string | null;
    }
  | {
      ok: false;
      reason:
        | "not_found"
        | "inactive"
        | "expired"
        | "not_yet_valid"
        | "exhausted"
        | "invalid_format";
      message: string;
    };

/**
 * Valida um cupom — usado pelo endpoint público e pelo POST /api/bookings.
 * NÃO incrementa usedCount; isso é feito apenas no momento da reserva
 * em transação (pra evitar race em lockstep com criação do booking).
 */
export async function checkCoupon(rawCode: string): Promise<CouponCheckResult> {
  const parsed = couponCodeSchema.safeParse(rawCode.toUpperCase());
  if (!parsed.success) {
    return { ok: false, reason: "invalid_format", message: "Código inválido." };
  }
  const code = parsed.data;

  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.coupons)
    .where(eq(schema.coupons.code, code))
    .limit(1);

  if (!row)
    return { ok: false, reason: "not_found", message: "Cupom não encontrado." };
  if (!row.active)
    return { ok: false, reason: "inactive", message: "Cupom desativado." };

  const now = new Date();
  if (row.validFrom && row.validFrom > now)
    return {
      ok: false,
      reason: "not_yet_valid",
      message: "Cupom ainda não está valendo.",
    };
  if (row.validUntil && row.validUntil < now)
    return { ok: false, reason: "expired", message: "Cupom expirado." };
  if (row.maxUses !== null && row.usedCount >= row.maxUses)
    return {
      ok: false,
      reason: "exhausted",
      message: "Cupom já atingiu o limite de usos.",
    };

  return {
    ok: true,
    code: row.code,
    percentOff: row.percentOff,
    description: row.description,
  };
}

/**
 * Incrementa usedCount atomicamente. Chamado depois do booking ser inserido.
 * Não falha (best-effort): se o cupom foi removido entre o check e o uso,
 * só log e segue (booking já tem o desconto persistido).
 */
export async function incrementCouponUse(code: string) {
  try {
    const db = getDb();
    await db
      .update(schema.coupons)
      .set({ usedCount: sql`${schema.coupons.usedCount} + 1`, updatedAt: new Date() })
      .where(eq(schema.coupons.code, code));
  } catch (err) {
    console.error("[coupons] failed to increment use count:", err);
  }
}

/**
 * Aplica desconto sobre um valor — retorna { totalAfter, discount }.
 */
export function applyPercentOff(total: number, percentOff: number) {
  const discount = Math.round(total * percentOff) / 100;
  const totalAfter = Math.max(0, total - discount);
  return {
    discount: Math.round(discount * 100) / 100,
    totalAfter: Math.round(totalAfter * 100) / 100,
  };
}
