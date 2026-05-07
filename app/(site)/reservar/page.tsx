import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";

import { Container, Eyebrow, Section } from "@/components/ui/container";
import { getDb, schema } from "@/lib/db";

import { ReservarFlow } from "./reservar-flow";

export const metadata: Metadata = {
  title: "Reserve seu evento — Espaço Cruzeiro",
  description:
    "Escolha a data, preencha seus dados e garanta o evento com um sinal. Processo 100% online, resposta imediata.",
};

export const dynamic = "force-dynamic";

type EventTypeOption = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  minGuests: number | null;
  maxGuests: number | null;
  basePricePerPerson: number;
  durationHours: number;
};

async function loadEventTypes(): Promise<EventTypeOption[]> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        id: schema.eventTypes.id,
        slug: schema.eventTypes.slug,
        name: schema.eventTypes.name,
        description: schema.eventTypes.description,
        minGuests: schema.eventTypes.minGuests,
        maxGuests: schema.eventTypes.maxGuests,
        basePricePerPerson: schema.eventTypes.basePricePerPerson,
        durationHours: schema.eventTypes.durationHours,
      })
      .from(schema.eventTypes)
      .where(eq(schema.eventTypes.active, true))
      .orderBy(asc(schema.eventTypes.displayOrder));

    return rows.map((r) => ({
      ...r,
      basePricePerPerson: Number(r.basePricePerPerson ?? 0),
    }));
  } catch (err) {
    console.error("[reservar] failed to load event types:", err);
    return [];
  }
}

export default async function ReservarPage() {
  const eventTypes = await loadEventTypes();

  return (
    <Section>
      <Container>
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <Eyebrow>Reservar</Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Garanta sua data em minutos.
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            Selecione o tipo de evento, a data livre e pague o sinal.
            A gente cuida do resto.
          </p>
        </div>

        {eventTypes.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-amber-300 bg-amber-50 p-6 text-center text-sm text-amber-900">
            <p className="font-medium">Sistema de reservas ainda não configurado.</p>
            <p className="mt-2">
              Nenhum tipo de evento cadastrado no banco ainda. Fale com a gente no WhatsApp
              que combinamos por lá.
            </p>
          </div>
        ) : (
          <ReservarFlow eventTypes={eventTypes} />
        )}
      </Container>
    </Section>
  );
}
