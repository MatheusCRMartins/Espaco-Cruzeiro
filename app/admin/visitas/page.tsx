import { asc, gte, sql } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

import { VisitStatusSelect } from "./visit-status-select";

export const metadata = { title: "Visitas agendadas" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, { label: string; cn: string }> = {
  scheduled: { label: "Agendada", cn: "bg-amber-100 text-amber-900" },
  completed: { label: "Realizada", cn: "bg-emerald-100 text-emerald-900" },
  cancelled: { label: "Cancelada", cn: "bg-red-100 text-red-900" },
  no_show: { label: "Não compareceu", cn: "bg-slate-200 text-slate-900" },
};

function fmtDateTime(d: Date) {
  return d.toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminVisitsPage() {
  const db = getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = await db
    .select({
      id: schema.visits.id,
      customerName: schema.visits.customerName,
      customerEmail: schema.visits.customerEmail,
      customerPhone: schema.visits.customerPhone,
      scheduledAt: schema.visits.scheduledAt,
      status: schema.visits.status,
      notes: schema.visits.notes,
      eventTypeId: schema.visits.eventTypeId,
    })
    .from(schema.visits)
    .where(gte(schema.visits.scheduledAt, today))
    .orderBy(asc(schema.visits.scheduledAt))
    .limit(50);

  const past = await db
    .select({
      id: schema.visits.id,
      customerName: schema.visits.customerName,
      customerPhone: schema.visits.customerPhone,
      scheduledAt: schema.visits.scheduledAt,
      status: schema.visits.status,
    })
    .from(schema.visits)
    .where(sql`${schema.visits.scheduledAt} < ${today}`)
    .orderBy(sql`${schema.visits.scheduledAt} desc`)
    .limit(20);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Visitas</h1>
        <p className="text-sm text-muted-foreground">
          Cliente que agendou visita guiada pelo espaço — fundo de funil pré-reserva.
        </p>
      </div>

      <section>
        <h2 className="mb-3 font-semibold">
          Próximas{" "}
          <span className="text-sm font-normal text-muted-foreground">({upcoming.length})</span>
        </h2>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5">Quando</th>
                <th className="px-4 py-2.5">Cliente</th>
                <th className="px-4 py-2.5">Contato</th>
                <th className="px-4 py-2.5">Observações</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {upcoming.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    Nenhuma visita agendada.
                  </td>
                </tr>
              )}
              {upcoming.map((v) => (
                <tr key={v.id} className="align-top">
                  <td className="px-4 py-3 text-xs">{fmtDateTime(v.scheduledAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{v.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {v.customerEmail}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs">{v.customerPhone}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {v.notes ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <VisitStatusSelect visitId={v.id} value={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-3 font-semibold">Histórico recente</h2>
          <ul className="divide-y divide-border rounded-lg border border-border bg-card text-sm">
            {past.map((v) => {
              const s = STATUS_LABELS[v.status] ?? { label: v.status, cn: "bg-muted" };
              return (
                <li key={v.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium">{v.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {fmtDateTime(v.scheduledAt)} · {v.customerPhone}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs ${s.cn}`}>
                    {s.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
