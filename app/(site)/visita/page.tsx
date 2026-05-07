import type { Metadata } from "next";
import { asc, eq } from "drizzle-orm";

import { Container, Eyebrow, Section } from "@/components/ui/container";
import { getDb, schema } from "@/lib/db";
import { getVisitAvailability } from "@/lib/visits";

import { VisitForm } from "./visit-form";

export const metadata: Metadata = {
  title: "Agende uma visita",
  description:
    "Conheça o espaço pessoalmente antes de fechar — visita guiada de 1h, gratuita, sem compromisso.",
};

export const dynamic = "force-dynamic";

export default async function VisitPage() {
  const db = getDb();
  const [eventTypeRows, days] = await Promise.all([
    db
      .select({ id: schema.eventTypes.id, name: schema.eventTypes.name })
      .from(schema.eventTypes)
      .where(eq(schema.eventTypes.active, true))
      .orderBy(asc(schema.eventTypes.displayOrder)),
    getVisitAvailability(),
  ]);

  return (
    <>
      <Section className="border-b border-border">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Agendar visita</Eyebrow>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              Conheça o espaço antes de fechar.
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Visita guiada de 1h, gratuita, sem compromisso. Você sente o
              espaço, tira dúvidas com a equipe e leva pra casa uma proposta
              feita pro seu evento.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8">
            <VisitForm eventTypes={eventTypeRows} days={days} />
          </div>
        </Container>
      </Section>
    </>
  );
}
