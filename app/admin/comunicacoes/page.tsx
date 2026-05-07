import { desc, sql } from "drizzle-orm";

import { Container } from "@/components/ui/container";
import { getDb, schema } from "@/lib/db";

export const metadata = { title: "Comunicações enviadas" };
export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  admin_new_lead: "Lead novo (admin)",
  admin_new_booking_pending: "Reserva pendente (admin)",
  admin_booking_confirmed: "Reserva confirmada (admin)",
  customer_booking_pending: "Cliente — finalize sua reserva",
  customer_booking_confirmed: "Cliente — reserva confirmada",
  customer_booking_cancelled: "Cliente — reserva cancelada",
  customer_reminder_d7: "Lembrete D-7",
  customer_reminder_d1: "Lembrete D-1",
};

function fmt(d: Date) {
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

type SearchParams = Promise<{ page?: string; status?: string }>;

const PAGE_SIZE = 50;

export default async function NotificationsLogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;
  const filterStatus = sp.status ?? "";

  let rows: Array<{
    id: string;
    type: string;
    recipient: string;
    subject: string | null;
    status: string;
    errorMessage: string | null;
    createdAt: Date;
  }> = [];
  let total = 0;
  let counts: { sent: number; failed: number } = { sent: 0, failed: 0 };

  try {
    const db = getDb();
    const cond = filterStatus ? sql`status = ${filterStatus}` : sql`true`;

    const [r, t, c] = await Promise.all([
      db
        .select({
          id: schema.notificationsLog.id,
          type: schema.notificationsLog.type,
          recipient: schema.notificationsLog.recipient,
          subject: schema.notificationsLog.subject,
          status: schema.notificationsLog.status,
          errorMessage: schema.notificationsLog.errorMessage,
          createdAt: schema.notificationsLog.createdAt,
        })
        .from(schema.notificationsLog)
        .where(cond)
        .orderBy(desc(schema.notificationsLog.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(schema.notificationsLog)
        .where(cond),
      db
        .select({
          sent: sql<number>`count(*) filter (where status = 'sent')::int`,
          failed: sql<number>`count(*) filter (where status = 'failed')::int`,
        })
        .from(schema.notificationsLog),
    ]);
    rows = r;
    total = t[0]?.n ?? 0;
    counts = { sent: c[0]?.sent ?? 0, failed: c[0]?.failed ?? 0 };
  } catch (err) {
    console.error("[admin/comunicacoes] load failed:", err);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Container className="space-y-6 p-0">
      <div>
        <h1 className="text-2xl font-semibold">Comunicações enviadas</h1>
        <p className="text-sm text-muted-foreground">
          Histórico de todos os e-mails disparados pelo sistema (notificações
          de reserva, lembretes D-7/D-1, leads). Útil pra investigar bounces.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi label="Total" value={total} />
        <Kpi label="Enviadas" value={counts.sent} tone="success" />
        <Kpi label="Falhas" value={counts.failed} tone={counts.failed > 0 ? "danger" : "muted"} />
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Filtrar por status</span>
          <select
            name="status"
            defaultValue={filterStatus}
            className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          >
            <option value="">— Todos —</option>
            <option value="sent">Enviadas</option>
            <option value="failed">Falhas</option>
          </select>
        </label>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Aplicar
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Quando</th>
              <th className="px-4 py-2.5">Tipo</th>
              <th className="px-4 py-2.5">Para</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Erro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhuma comunicação registrada.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
                  {fmt(r.createdAt)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {TYPE_LABELS[r.type] ?? r.type}
                </td>
                <td className="px-4 py-3 text-xs">{r.recipient}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.status === "sent"
                        ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900"
                        : "rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-900"
                    }
                  >
                    {r.status === "sent" ? "Enviada" : r.status === "failed" ? "Falhou" : r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {r.errorMessage ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Página {page} de {totalPages}
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <a
              href={`?page=${page - 1}${filterStatus ? `&status=${filterStatus}` : ""}`}
              className="rounded border border-border px-3 py-1 hover:bg-muted"
            >
              ← Anterior
            </a>
          )}
          {page < totalPages && (
            <a
              href={`?page=${page + 1}${filterStatus ? `&status=${filterStatus}` : ""}`}
              className="rounded border border-border px-3 py-1 hover:bg-muted"
            >
              Próxima →
            </a>
          )}
        </div>
      </div>
    </Container>
  );
}

function Kpi({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "danger" | "muted";
}) {
  const colorMap = {
    default: "text-foreground",
    success: "text-emerald-700",
    danger: "text-red-700",
    muted: "text-muted-foreground",
  };
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${colorMap[tone]}`}>{value}</p>
    </div>
  );
}
