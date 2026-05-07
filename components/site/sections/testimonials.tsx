import { Star } from "lucide-react";

import { Container, Eyebrow, Section } from "@/components/ui/container";
import { TESTIMONIALS } from "@/lib/mock/testimonials";

export function Testimonials() {
  return (
    <Section className="bg-muted/30 border-y border-border">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Depoimentos</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Quem já viveu, volta a contar.
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={i}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex gap-0.5 text-accent">
                {Array.from({ length: t.rating }).map((_, s) => (
                  <Star key={s} className="size-4 fill-current" aria-hidden />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-6 text-foreground/90">
                &ldquo;{t.content}&rdquo;
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4 text-sm">
                <p className="font-medium text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.eventType} · {t.date}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </Section>
  );
}
