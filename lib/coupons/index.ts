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
 * Reserva atomicamente UM uso do cupom — chame ANTES de criar o booking.
 *
 * Faz `UPDATE ... SET used_count = used_count + 1 WHERE code AND active AND
 * janela válida AND saldo de usos > 0` RETURNING id. Se rowCount === 1,
 * conseguimos o uso. Se 0, alguém estourou o limite ou o cupom virou
 * inválido — recusa antes do booking entrar.
 *
 * Resolve race onde dois bookings simultâneos com `maxUses=1` ambos passavam
 * pelo checkCoupon (viam 0 usos), ambos inseriam, e o increment fire-and-
 * forget acabava com `used_count = 2`.
 */
export async function reserveCouponUse(
  code: string,
): Promise<
  | { ok: true; percentOff: number }
  | {
      ok: false;
      reason: "not_found" | "inactive" | "expired" | "exhausted" | "not_yet_valid";
    }
> {
  const db = getDb();
  const now = new Date();
  const result = await db
    .update(schema.coupons)
    .set({
      usedCount: sql`${schema.coupons.usedCount} + 1`,
      updatedAt: now,
    })
    .where(
      sql`code = ${code}
        AND active = true
        AND (valid_from IS NULL OR valid_from <= ${now})
        AND (valid_until IS NULL OR valid_until >= ${now})
        AND (max_uses IS NULL OR used_count < max_uses)`,
    )
    .returning({ id: schema.coupons.id, percentOff: schema.coupons.percentOff });

  if (result.length === 1) {
    return { ok: true, percentOff: result[0].percentOff };
  }

  // Falhou — diagnostica pra mensagem humana
  const diag = await checkCoupon(code);
  if (!diag.ok) {
    if (diag.reason === "invalid_format") return { ok: false, reason: "not_found" };
    return { ok: false, reason: diag.reason };
  }
  return { ok: false, reason: "exhausted" };
}

/**
 * Devolve um uso do cupom — usado em rollback se o booking falhar depois
 * de reservar mas antes de persistir.
 */
export async function releaseCouponUse(code: string) {
  try {
    const db = getDb();
    await db
      .update(schema.coupons)
      .set({
        usedCount: sql`GREATEST(${schema.coupons.usedCount} - 1, 0)`,
        updatedAt: new Date(),
      })
      .where(eq(schema.coupons.code, code));
  } catch (err) {
    console.error("[coupons] failed to release use:", err);
  }
}

/** @deprecated — use reserveCouponUse antes do INSERT. Mantido por compat. */
export async function incrementCouponUse(code: string) {
  return reserveCouponUse(code);
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
