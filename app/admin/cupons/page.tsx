import { desc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

import { CouponForm } from "./coupon-form";
import { CouponRowActions } from "./coupon-row-actions";

export const metadata = { title: "Cupons" };
export const dynamic = "force-dynamic";

function fmt(d: Date | null) {
  return d ? d.toLocaleDateString("pt-BR") : "—";
}

export default async function CouponsPage() {
  let rows: Array<{
    id: string;
    code: string;
    description: string | null;
    percentOff: number;
    maxUses: number | null;
    usedCount: number;
    validFrom: Date | null;
    validUntil: Date | null;
    active: boolean;
    createdAt: Date;
  }> = [];

  try {
    const db = getDb();
    rows = await db
      .select({
        id: schema.coupons.id,
        code: schema.coupons.code,
        description: schema.coupons.description,
        percentOff: schema.coupons.percentOff,
        maxUses: schema.coupons.maxUses,
        usedCount: schema.coupons.usedCount,
        validFrom: schema.coupons.validFrom,
        validUntil: schema.coupons.validUntil,
        active: schema.coupons.active,
        createdAt: schema.coupons.createdAt,
      })
      .from(schema.coupons)
      .orderBy(desc(schema.coupons.createdAt));
  } catch (err) {
    console.error("[admin/cupons] load failed:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Cupons</h1>
        <p className="text-sm text-muted-foreground">
          Códigos promocionais aplicáveis no checkout. Validados em tempo real
          quando o cliente digita.
        </p>
      </div>

      <CouponForm />

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Código</th>
              <th className="px-4 py-2.5">Desconto</th>
              <th className="px-4 py-2.5">Usos</th>
              <th className="px-4 py-2.5">Validade</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-sm text-muted-foreground"
                >
                  Nenhum cupom criado ainda.
                </td>
              </tr>
            )}
            {rows.map((c) => (
              <tr key={c.id} className="align-top">
                <td className="px-4 py-3">
                  <code className="font-mono text-xs font-semibold">{c.code}</code>
                  {c.description && (
                    <div className="text-xs text-muted-foreground">{c.description}</div>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums text-sm">{c.percentOff}%</td>
                <td className="px-4 py-3 text-xs">
                  {c.usedCount}
                  {c.maxUses != null ? ` / ${c.maxUses}` : " / ∞"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {fmt(c.validFrom)} → {fmt(c.validUntil)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      c.active
                        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                    }
                  >
                    {c.active ? "ativo" : "inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <CouponRowActions id={c.id} code={c.code} active={c.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
