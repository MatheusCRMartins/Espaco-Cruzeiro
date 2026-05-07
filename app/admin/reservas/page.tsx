import Link from "next/link";
import { desc, eq, or, ilike, sql, and } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Reservas" };
export const dynamic = "force-dynamic";

const STATUSES = [
  { key: "all", label: "Todas" },
  { key: "pending_payment", label: "Aguardando" },
  { key: "confirmed", label: "Confirmadas" },
  { key: "cancelled", label: "Canceladas" },
  { key: "completed", label: "Realizadas" },
];

const STATUS_STYLE: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-900",
  confirmed: "bg-emerald-100 text-emerald-900",
  cancelled: "bg-red-100 text-red-900",
  completed: "bg-sky-100 text-sky-900",
  refunded: "bg-slate-200 text-slate-900",
};

type SearchParams = Promise<{ status?: string; q?: string }>;

export default async function BookingsListPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "all";
  const q = (sp.q ?? "").trim();

  let rows: Array<{
    id: string;
    code: string;
    customer: string;
    email: string;
    date: string;
    status: string;
    total: string;
  }> = [];

  try {
    const db = getDb();
    const conditions = [] as ReturnType<typeof eq>[];
    if (status !== "all") conditions.push(eq(schema.bookings.status, status));
    if (q) {
      const like = `%${q}%`;
      conditions.push(
        or(
          ilike(schema.bookings.customerName, like),
          ilike(schema.bookings.customerEmail, like),
          ilike(schema.bookings.customerPhone, like),
          ilike(schema.bookings.bookingCode, like),
        )!,
      );
    }
    rows = await db
      .select({
        id: schema.bookings.id,
        code: schema.bookings.bookingCode,
        customer: schema.bookings.customerName,
        email: schema.bookings.customerEmail,
        date: schema.bookings.eventDate,
        status: schema.bookings.status,
        total: schema.bookings.totalAmount,
      })
      .from(schema.bookings)
      .where(conditions.length > 0 ? and(...conditions) : sql`true`)
      .orderBy(desc(schema.bookings.createdAt))
      .limit(200);
  } catch (err) {
    console.error("[admin/reservas] list failed:", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reservas</h1>
          <p className="text-sm text-muted-foreground">
            {rows.length} {rows.length === 1 ? "resultado" : "resultados"}.
          </p>
        </div>

        <form className="flex gap-2" action="/admin/reservas">
          <input type="hidden" name="status" value={status} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por nome, e-mail, código…"
            className="h-9 w-72 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Buscar
          </button>
        </form>
      </div>

      <nav className="flex flex-wrap gap-2 text-xs">
        {STATUSES.map((s) => {
          const active = s.key === status;
          const params = new URLSearchParams();
          if (s.key !== "all") params.set("status", s.key);
          if (q) params.set("q", q);
          const href = `/admin/reservas${params.toString() ? `?${params}` : ""}`;
          return (
            <Link
              key={s.key}
              href={href}
              className={`rounded-full px-3 py-1 transition ${active ? "bg-primary text-primary-foreground" : "border border-border hover:bg-muted"}`}
            >
              {s.label}
            </Link>
          );
        })}
      </nav>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Código</th>
              <th className="px-4 py-2.5">Cliente</th>
              <th className="px-4 py-2.5">Data</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhuma reserva encontrada.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-4 py-2.5 font-mono text-xs">
                  <Link
                    href={`/admin/reservas/${r.id}`}
                    className="text-accent hover:underline"
                  >
                    {r.code}
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <div>{r.customer}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </td>
                <td className="px-4 py-2.5 tabular-nums">{r.date}</td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs ${STATUS_STYLE[r.status] ?? ""}`}
                  >
                    {STATUSES.find((s) => s.key === r.status)?.label ?? r.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatBRL(Number(r.total))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
