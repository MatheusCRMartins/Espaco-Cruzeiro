import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container, Eyebrow, Section } from "@/components/ui/container";
import { EVENT_TYPES } from "@/lib/mock/event-types";

export function EventTypesGrid() {
  return (
    <Section className="bg-muted/30 border-y border-border">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Tipos de evento</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Para cada momento, um cuidado diferente.
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Escolha o tipo de evento e conte com uma equipe experiente para os
            detalhes que fazem o dia ser inesquecível.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_TYPES.map((type) => (
            <Link
              key={type.slug}
              href={`/eventos/${type.slug}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className={`aspect-[5/3] ${type.heroBg}`} aria-hidden />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-xl font-semibold">{type.name}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">
                  {type.shortDescription}
                </p>
                <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
                  Ver detalhes
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}
