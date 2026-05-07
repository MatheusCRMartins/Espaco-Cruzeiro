"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/app/admin/_lib/guard";
import { logAdminAction } from "@/app/admin/_lib/audit";
import { getDb, schema } from "@/lib/db";

export type CouponState = {
  status: "idle" | "ok" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const COUPON_INITIAL: CouponState = { status: "idle" };

const inputSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, "Use letras, números, traço ou underline"),
  description: z.string().trim().max(200).optional().nullable(),
  percentOff: z.coerce.number().int().min(1).max(100),
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
  validFrom: z.string().optional().nullable(),
  validUntil: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

function emptyToNull(v: FormDataEntryValue | null): string | null {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

export async function createCoupon(
  _prev: CouponState,
  formData: FormData,
): Promise<CouponState> {
  const user = await requireAdmin();

  const raw = {
    code: String(formData.get("code") ?? ""),
    description: emptyToNull(formData.get("description")),
    percentOff: formData.get("percentOff"),
    maxUses: emptyToNull(formData.get("maxUses")),
    validFrom: emptyToNull(formData.get("validFrom")),
    validUntil: emptyToNull(formData.get("validUntil")),
    active: formData.get("active") === "on",
  };

  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const k = issue.path.join(".");
      (fieldErrors[k] ??= []).push(issue.message);
    }
    return {
      status: "error",
      message: "Revise os campos.",
      fieldErrors,
    };
  }

  try {
    const db = getDb();
    const [dup] = await db
      .select({ id: schema.coupons.id })
      .from(schema.coupons)
      .where(eq(schema.coupons.code, parsed.data.code));
    if (dup) {
      return {
        status: "error",
        message: `Já existe um cupom com código "${parsed.data.code}".`,
        fieldErrors: { code: ["Código já em uso"] },
      };
    }

    await db.insert(schema.coupons).values({
      code: parsed.data.code,
      description: parsed.data.description ?? null,
      percentOff: parsed.data.percentOff,
      maxUses: parsed.data.maxUses ?? null,
      validFrom: parsed.data.validFrom ? new Date(parsed.data.validFrom) : null,
      validUntil: parsed.data.validUntil ? new Date(parsed.data.validUntil) : null,
      active: parsed.data.active,
    });
    await logAdminAction({
      userId: user.id,
      action: "create_coupon",
      entityType: "coupon",
      changes: { code: parsed.data.code, percentOff: parsed.data.percentOff },
    });
    revalidatePath("/admin/cupons");
    return { status: "ok", message: "Cupom criado." };
  } catch (err) {
    console.error("[admin] createCoupon failed:", err);
    return { status: "error", message: "Não conseguimos criar agora." };
  }
}

export async function toggleCoupon(id: string, active: boolean) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db
      .update(schema.coupons)
      .set({ active, updatedAt: new Date() })
      .where(eq(schema.coupons.id, id));
    await logAdminAction({
      userId: user.id,
      action: "toggle_coupon",
      entityType: "coupon",
      entityId: id,
      changes: { active },
    });
    revalidatePath("/admin/cupons");
    return { ok: true as const };
  } catch (err) {
    console.error("[admin] toggleCoupon failed:", err);
    return { ok: false as const };
  }
}

export async function deleteCoupon(id: string) {
  const user = await requireAdmin();
  try {
    const db = getDb();
    await db.delete(schema.coupons).where(eq(schema.coupons.id, id));
    await logAdminAction({
      userId: user.id,
      action: "delete_coupon",
      entityType: "coupon",
      entityId: id,
    });
    revalidatePath("/admin/cupons");
    return { ok: true as const };
  } catch (err) {
    console.error("[admin] deleteCoupon failed:", err);
    return { ok: false as const };
  }
}
