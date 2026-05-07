import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

import { EventTypeForm } from "../event-type-form";

export const metadata = { title: "Editar tipo de evento" };
export const dynamic = "force-dynamic";

type Params = { id: string };

export default async function EditEventTypePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.eventTypes)
    .where(eq(schema.eventTypes.id, id));

  if (!row) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/tipos-evento"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Editar: {row.name}</h1>
        <p className="text-sm text-muted-foreground">
          <code className="font-mono text-xs">{row.slug}</code> · ordem {row.displayOrder}
        </p>
      </div>

      <EventTypeForm
        mode="edit"
        initial={{
          id: row.id,
          slug: row.slug,
          name: row.name,
          description: row.description,
          basePricePerPerson: Number(row.basePricePerPerson ?? 0),
          minGuests: row.minGuests ?? undefined,
          maxGuests: row.maxGuests ?? undefined,
          durationHours: row.durationHours,
          displayOrder: row.displayOrder,
          active: row.active,
        }}
      />
    </div>
  );
}
