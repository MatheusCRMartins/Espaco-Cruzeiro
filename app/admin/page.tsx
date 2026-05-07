import Link from "next/link";
import { and, desc, eq, gte, lt, sql } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { formatBRL } from "@/lib/utils";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

async function loadKpis() {
  try {
    const db = getDb();
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [monthBookings, monthRevenue, newLeads, conversion] = await Promise.all([
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(schema.bookings)
        .where(
          and(
            gte(schema.bookings.createdAt, firstOfMonth),
            lt(schema.bookings.createdAt, firstOfNextMonth),
            eq(schema.bookings.status, "confirmed"),
          ),
        ),
      db
        .select({
          total: sql<string>`coalesce(sum(${schema.bookings.totalAmount}),0)::text`,
        })
        .from(schema.bookings)
        .where(
          and(
            gte(schema.bookings.eventDate, firstOfMonth.toISOString().slice(0, 10)),
            lt(
              schema.bookings.eventDate,
              firstOfNextMonth.toISOString().slice(0, 10),
            ),
            eq(schema.bookings.status, "confirmed"),
          ),
        ),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(schema.leads)
        .where(
          and(
            gte(schema.leads.createdAt, firstOfMonth),
            lt(schema.leads.createdAt, firstOfNextMonth),
          ),
        ),
      db
        .select({
          leads: sql<number>`count(*)::int`,
          converted: sql<number>`count(*) filter (where status = 'converted')::int`,
        })
        .from(schema.leads)
        .where(gte(schema.leads.createdAt, firstOfMonth)),
    ]);

    const leadCount = conversion[0]?.leads ?? 0;
    const converted = conversion[0]?.converted ?? 0;
    const rate = leadCount > 0 ? Math.round((converted / leadCount) * 100) : 0;

    return {
      monthBookings: monthBookings[0]?.n ?? 0,
      monthRevenue: Number(monthRevenue[0]?.total ?? 0),
      newLeads: newLeads[0]?.n ?? 0,
      conversionRate: rate,
    };
  } catch (err) {
    console.error("[dashboard] KPI load failed:", err);
    return null;
  }
}

async function loadRecentBookings() {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: schema.bookings.id,
        code: schema.bookings.bookingCode,
        customer: schema.bookings.customerName,
        date: schema.bookings.eventDate,
        status: schema.bookings.status,
        total: schema.bookings.totalAmount,
      })
      .from(schema.bookings)
      .orderBy(desc(schema.bookings.createdAt))
      .limit(8);
    return rows;
  } catch {
    return [];
  }
}

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending_payment: { label: "Aguardando", className: "bg-amber-100 text-amber-900" },
  confirmed: { label: "Confirmada", className: "bg-emerald-100 text-emerald-900" },
  cancelled: { label: "Cancelada", className: "bg-red-100 text-red-900" },
  completed: { label: "Realizada", className: "bg-sky-100 text-sky-900" },
  refunded: { label: "Reembolsada", className: "bg-slate-200 text-slate-900" },
};

export default async function AdminDashboard() {
  const [kpis, recent] = await Promise.all([loadKpis(), loadRecentBookings()]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral de reservas, leads e faturamento no mês atual.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Reservas confirmadas no mês" value={kpis ? String(kpis.monthBookings) : "—"} />
        <Kpi
          label="Faturamento previsto"
          value={kpis ? formatBRL(kpis.monthRevenue) : "—"}
        />
        <Kpi label="Leads novos" value={kpis ? String(kpis.newLeads) : "—"} />
        <Kpi
          label="Conversão lead → reserva"
          value={kpis ? `${kpis.conversionRate}%` : "—"}
        />
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold">Reservas recentes</h2>
          <Link href="/admin/reservas" className="text-xs text-accent hover:underline">
            Ver todas →
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              Sem reservas ainda.
            </p>
          )}
          {recent.map((b) => {
            const s = STATUS_LABELS[b.status] ?? {
              label: b.status,
              className: "bg-muted text-foreground",
            };
            return (
              <Link
                key={b.id}
                href={`/admin/reservas/${b.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm hover:bg-muted/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{b.customer}</p>
                  <p className="text-xs text-muted-foreground">
                    {b.code} · {b.date}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs ${s.className}`}>
                  {s.label}
                </span>
                <span className="w-24 text-right text-sm tabular-nums">
                  {formatBRL(Number(b.total))}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}
