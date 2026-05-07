import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Camera, Check, Clock, Sparkles, Users } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container, Eyebrow, Section } from "@/components/ui/container";
import { Testimonials } from "@/components/site/sections/testimonials";
import { Faq } from "@/components/site/sections/faq";
import { EVENT_TYPES, getEventType } from "@/lib/mock/event-types";
import { BUSINESS } from "@/lib/constants";
import { cn, formatBRL, waLink } from "@/lib/utils";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return EVENT_TYPES.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const evt = getEventType(slug);
  if (!evt) return { title: "Tipo de evento não encontrado" };

  return {
    title: `${evt.name} no Espaço Cruzeiro`,
    description: evt.shortDescription,
    openGraph: {
      title: `${evt.name} no Espaço Cruzeiro`,
      description: evt.shortDescription,
    },
  };
}

export default async function EventTypePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const evt = getEventType(slug);
  if (!evt) notFound();

  const waNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? BUSINESS.contact.whatsappNumber;
  const waMessage = `Olá! Gostaria de saber mais sobre ${evt.name.toLowerCase()} no Espaço Cruzeiro.`;

  const others = EVENT_TYPES.filter((e) => e.slug !== evt.slug).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <Section
        className={cn(
          "relative overflow-hidden border-b border-border",
          evt.heroBg,
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/70 to-background"
        />
        <Container>
          <div className="mx-auto max-w-3xl">
            <Eyebrow>{evt.name}</Eyebrow>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              {evt.shortDescription}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {evt.longDescription}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/reservar"
                className={buttonVariants({ size: "lg" })}
              >
                <Sparkles />
                Verificar disponibilidade
              </Link>
              <a
                href={waLink(waNumber, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </Container>
      </Section>

      {/* Info strip */}
      <Section className="py-10">
        <Container>
          <dl className="grid gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-3">
            <div className="flex items-center gap-4">
              <Users className="size-6 text-accent" aria-hidden />
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Capacidade
                </dt>
                <dd className="font-display text-lg">
                  {evt.minGuests}–{evt.maxGuests} convidados
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock className="size-6 text-accent" aria-hidden />
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Duração típica
                </dt>
                <dd className="font-display text-lg">
                  {evt.durationHours} horas
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Sparkles className="size-6 text-accent" aria-hidden />
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  A partir de
                </dt>
                <dd className="font-display text-lg">
                  {formatBRL(evt.basePricePerPerson)} / pessoa
                </dd>
              </div>
            </div>
          </dl>
        </Container>
      </Section>

      {/* Highlights */}
      <Section className="pt-0">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <Eyebrow>O que está incluso</Eyebrow>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
                Um pacote pensado pra {evt.name.toLowerCase()}.
              </h2>
              <p className="mt-4 max-w-md text-base text-muted-foreground">
                Ajustamos cada detalhe na reunião de planejamento — mas a base
                já vem cuidada para você não ter que correr atrás.
              </p>
            </div>

            <ul className="grid gap-3">
              {evt.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check className="size-3.5" aria-hidden />
                  </span>
                  <span className="text-sm leading-6 text-foreground/90">
                    {h}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* Gallery placeholder */}
      <Section className="bg-muted/30 border-y border-border">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow>Galeria</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Eventos que já aconteceram aqui.
            </h2>
            <p className="mt-4 text-base text-muted-foreground">
              Em breve: fotos reais de {evt.name.toLowerCase()} que celebramos
              com nossos clientes.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] rounded-2xl border border-border bg-gradient-to-br from-muted to-background"
              >
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Camera className="size-8" aria-hidden />
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Testimonials />

      <Faq />

      {/* Other event types */}
      <Section>
        <Container>
          <div className="flex items-end justify-between gap-6">
            <div>
              <Eyebrow>Outras celebrações</Eyebrow>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Também fazemos
              </h2>
            </div>
            <Link
              href="/#tipos-de-evento"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Ver tudo →
            </Link>
          </div>

          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/eventos/${o.slug}`}
                  className="group block rounded-2xl border border-border bg-card p-6 transition hover:border-accent/60 hover:shadow-sm"
                >
                  <h3 className="font-display text-lg font-semibold">
                    {o.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {o.shortDescription}
                  </p>
                  <span className="mt-4 inline-flex text-sm text-accent group-hover:underline">
                    Ver detalhes →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Final CTA specific to this type */}
      <Section className="bg-muted/30 border-t border-border">
        <Container>
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
            <h2 className="font-display text-3xl font-semibold">
              Pronto pra reservar {evt.name.toLowerCase()}?
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Escolha a data, confirme com um sinal e pronto — a gente cuida do
              resto.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/reservar"
                className={buttonVariants({ size: "md" })}
              >
                Verificar disponibilidade
              </Link>
              <a
                href={waLink(waNumber, waMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: "outline", size: "md" })}
              >
                Tirar dúvidas
              </a>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
