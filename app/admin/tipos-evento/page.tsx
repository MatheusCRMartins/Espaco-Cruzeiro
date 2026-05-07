import { asc } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";
import { formatBRL } from "@/lib/utils";

import { saveEventType } from "./actions";

export const metadata = { title: "Tipos de evento" };
export const dynamic = "force-dynamic";

export default async function EventTypesAdminPage() {
  let rows: Array<{
    id: string;
    slug: string;
    name: string;
    basePricePerPerson: string | null;
    minGuests: number | null;
    maxGuests: number | null;
    durationHours: number;
    displayOrder: number;
    active: boolean;
  }> = [];

  try {
    const db = getDb();
    rows = await db
      .select({
        id: schema.eventTypes.id,
        slug: schema.eventTypes.slug,
        name: schema.eventTypes.name,
        basePricePerPerson: schema.eventTypes.basePricePerPerson,
        minGuests: schema.eventTypes.minGuests,
        maxGuests: schema.eventTypes.maxGuests,
        durationHours: schema.eventTypes.durationHours,
        displayOrder: schema.eventTypes.displayOrder,
        active: schema.eventTypes.active,
      })
      .from(schema.eventTypes)
      .orderBy(asc(schema.eventTypes.displayOrder));
  } catch (err) {
    console.error("[admin/tipos-evento] load failed:", err);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Tipos de evento</h1>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5">Nome</th>
              <th className="px-4 py-2.5">Slug</th>
              <th className="px-4 py-2.5 text-right">Preço/pessoa</th>
              <th className="px-4 py-2.5 text-right">Convidados</th>
              <th className="px-4 py-2.5 text-right">Duração</th>
              <th className="px-4 py-2.5">Ativo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum tipo cadastrado.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-2.5 font-medium">{r.name}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{r.slug}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {r.basePricePerPerson ? formatBRL(Number(r.basePricePerPerson)) : "—"}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {r.minGuests}–{r.maxGuests}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">{r.durationHours}h</td>
                <td className="px-4 py-2.5">{r.active ? "sim" : "não"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-semibold">Adicionar novo tipo</h2>
        <form action={saveEventType} className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field name="slug" label="Slug" placeholder="casamentos" />
          <Field name="name" label="Nome" placeholder="Casamentos" />
          <Field name="description" label="Descrição curta" placeholder="Cerimônias e festas." />
          <Field name="basePricePerPerson" label="Preço por pessoa (R$)" type="number" step="0.01" />
          <Field name="minGuests" label="Convidados mín." type="number" defaultValue="30" />
          <Field name="maxGuests" label="Convidados máx." type="number" defaultValue="150" />
          <Field name="durationHours" label="Duração (horas)" type="number" defaultValue="6" />
          <Field name="displayOrder" label="Ordem" type="number" defaultValue="0" />

          <label className="col-span-2 inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked className="size-4" /> Ativo
          </label>

          <button
            type="submit"
            className="col-span-2 h-10 rounded-md bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Salvar
          </button>
        </form>
      </section>
    </div>
  );
}

function Field({
  name,
  label,
  ...rest
}: {
  name: string;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        {...rest}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}
