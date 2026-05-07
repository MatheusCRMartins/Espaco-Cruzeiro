import { desc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

import { LeadStatusSelect } from "./lead-status-select";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

export default async function LeadsListPage() {
  let rows: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    source: string | null;
    status: string;
    message: string | null;
    createdAt: Date;
    estimatedDate: string | null;
    estimatedGuests: number | null;
  }> = [];

  try {
    const db = getDb();
    rows = await db
      .select({
        id: schema.leads.id,
        name: schema.leads.name,
        email: schema.leads.email,
        phone: schema.leads.phone,
        source: schema.leads.source,
        status: schema.leads.status,
        message: schema.leads.message,
        createdAt: schema.leads.createdAt,
        estimatedDate: schema.leads.estimatedDate,
        estimatedGuests: schema.leads.estimatedGuests,
      })
      .from(schema.leads)
      .orderBy(desc(schema.leads.createdAt))
      .limit(200);
  } catch (err) {
    console.error("[admin/leads] list failed:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">
          {rows.length} {rows.length === 1 ? "lead" : "leads"}.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Quem</th>
              <th className="px-4 py-2.5">Contato</th>
              <th className="px-4 py-2.5">Evento</th>
              <th className="px-4 py-2.5">Origem</th>
              <th className="px-4 py-2.5">Recebido</th>
              <th className="px-4 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum lead ainda.
                </td>
              </tr>
            )}
            {rows.map((l) => (
              <tr key={l.id} className="align-top hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="font-medium">{l.name}</div>
                  {l.message && (
                    <div className="mt-1 max-w-sm truncate text-xs text-muted-foreground">
                      {l.message}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  <div>{l.email}</div>
                  <div className="text-muted-foreground">{l.phone}</div>
                </td>
                <td className="px-4 py-3 text-xs">
                  {l.estimatedDate && <div>Data: {l.estimatedDate}</div>}
                  {l.estimatedGuests && <div>{l.estimatedGuests} convidados</div>}
                  {!l.estimatedDate && !l.estimatedGuests && "—"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {l.source ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {l.createdAt.toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <LeadStatusSelect leadId={l.id} value={l.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
