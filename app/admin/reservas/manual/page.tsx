import Link from "next/link";
import { asc, eq } from "drizzle-orm";

import { getDb, schema } from "@/lib/db";

import { ManualBookingForm } from "./manual-booking-form";

export const metadata = { title: "Nova reserva manual" };
export const dynamic = "force-dynamic";

export default async function ManualBookingPage() {
  const db = getDb();
  const rows = await db
    .select({
      id: schema.eventTypes.id,
      name: schema.eventTypes.name,
      basePricePerPerson: schema.eventTypes.basePricePerPerson,
    })
    .from(schema.eventTypes)
    .where(eq(schema.eventTypes.active, true))
    .orderBy(asc(schema.eventTypes.displayOrder));

  const eventTypes = rows.map((r) => ({
    id: r.id,
    name: r.name,
    basePricePerPerson: Number(r.basePricePerPerson ?? 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/reservas"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Nova reserva manual</h1>
        <p className="text-sm text-muted-foreground">
          Cliente ligou ou fechou em visita? Cria a reserva aqui e manda o
          link MP por WhatsApp em 1 clique.
        </p>
      </div>

      <ManualBookingForm eventTypes={eventTypes} />
    </div>
  );
}
