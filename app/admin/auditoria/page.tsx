import { desc, sql } from "drizzle-orm";
import { Container } from "@/components/ui/container";

import { getDb, schema } from "@/lib/db";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Auditoria" };
export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  // bookings
  update_notes: "Atualizar notas",
  force_confirm: "Confirmar manualmente",
  cancel: "Cancelar reserva",
  mark_completed: "Marcar realizada",
  // leads
  update_lead_status: "Mudar status do lead",
  update_lead_notes: "Notas do lead",
  // event types
  create_event_type: "Criar tipo",
  update_event_type: "Editar tipo",
  toggle_event_type: "Toggle ativo (tipo)",
  delete_event_type: "Excluir tipo",
  reorder_event_types: "Reordenar tipos",
  // gallery
  add_gallery_photo: "Adicionar foto",
  delete_gallery_photo: "Excluir foto",
  toggle_gallery_featured: "Toggle destaque",
  update_gallery_alt: "Editar alt da foto",
  // testimonials
  add_testimonial: "Adicionar depoimento",
  toggle_testimonial: "Toggle aprovado",
  delete_testimonial: "Excluir depoimento",
  // content/settings
  save_content_block: "Salvar bloco de conteúdo",
  save_business_settings: "Salvar configurações",
  // availability
  add_rule: "Adicionar regra",
  delete_rule: "Remover regra",
  block_date: "Bloquear data",
  unblock_date: "Desbloquear data",
};

function fmt(d: Date) {
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

type SearchParams = Promise<{ page?: string; action?: string }>;

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1));
  const offset = (page - 1) * PAGE_SIZE;
  const filterAction = sp.action ?? "";

  let rows: Array<{
    id: string;
    userId: string | null;
    action: string;
    entityType: string;
    entityId: string | null;
    changes: unknown;
    createdAt: Date;
  }> = [];
  let total = 0;
  let userEmails = new Map<string, string>();

  try {
    const db = getDb();
    const conditions = filterAction ? sql`action = ${filterAction}` : sql`true`;

    const [r, t] = await Promise.all([
      db
        .select({
          id: schema.adminAuditLog.id,
          userId: schema.adminAuditLog.userId,
          action: schema.adminAuditLog.action,
          entityType: schema.adminAuditLog.entityType,
          entityId: schema.adminAuditLog.entityId,
          changes: schema.adminAuditLog.changes,
          createdAt: schema.adminAuditLog.createdAt,
        })
        .from(schema.adminAuditLog)
        .where(conditions)
        .orderBy(desc(schema.adminAuditLog.createdAt))
        .limit(PAGE_SIZE)
        .offset(offset),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(schema.adminAuditLog)
        .where(conditions),
    ]);
    rows = r;
    total = t[0]?.n ?? 0;

    // Resolve user emails (uniq)
    const userIds = Array.from(
      new Set(rows.map((x) => x.userId).filter((x): x is string => !!x)),
    );
    if (userIds.length) {
      const supa = createSupabaseAdminClient();
      const { data } = await supa.auth.admin.listUsers({ page: 1, perPage: 200 });
      userEmails = new Map(
        (data?.users ?? []).map((u) => [u.id, u.email ?? "(sem email)"]),
      );
    }
  } catch (err) {
    console.error("[admin/auditoria] load failed:", err);
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const distinctActions = Array.from(new Set(rows.map((r) => r.action))).sort();

  return (
    <Container className="space-y-6 p-0">
      <div>
        <h1 className="text-2xl font-semibold">Auditoria</h1>
        <p className="text-sm text-muted-foreground">
          Tudo que admins fazem no painel é registrado aqui — quem mudou o quê,
          quando, e o payload da mudança.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Filtrar por ação</span>
          <select
            name="action"
            defaultValue={filterAction}
            className="h-9 rounded-md border border-border bg-background px-2 text-sm"
          >
            <option value="">— Todas —</option>
            {distinctActions.map((a) => (
              <option key={a} value={a}>
                {ACTION_LABELS[a] ?? a}
              </option>
            ))}
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
              <th className="px-4 py-2.5">Quem</th>
              <th className="px-4 py-2.5">Ação</th>
              <th className="px-4 py-2.5">Entidade</th>
              <th className="px-4 py-2.5">Mudanças</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum registro.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="align-top">
                <td className="px-4 py-3 text-xs tabular-nums text-muted-foreground">
                  {fmt(r.createdAt)}
                </td>
                <td className="px-4 py-3 text-xs">
                  {r.userId ? userEmails.get(r.userId) ?? r.userId.slice(0, 8) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {ACTION_LABELS[r.action] ?? r.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <code className="font-mono">{r.entityType}</code>
                  {r.entityId && (
                    <div className="text-muted-foreground">
                      {r.entityId.slice(0, 8)}…
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {r.changes ? (
                    <details>
                      <summary className="cursor-pointer text-xs text-accent">
                        Ver diff
                      </summary>
                      <pre className="mt-2 max-w-md overflow-auto rounded bg-muted/50 p-2 text-[10px] leading-tight">
                        {JSON.stringify(r.changes, null, 2)}
                      </pre>
                    </details>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Página {page} de {totalPages} · {total} registros
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <a
              href={`?page=${page - 1}${filterAction ? `&action=${filterAction}` : ""}`}
              className="rounded border border-border px-3 py-1 hover:bg-muted"
            >
              ← Anterior
            </a>
          )}
          {page < totalPages && (
            <a
              href={`?page=${page + 1}${filterAction ? `&action=${filterAction}` : ""}`}
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
