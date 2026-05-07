"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calculator } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container, Eyebrow, Section } from "@/components/ui/container";
import { Input, Label } from "@/components/ui/input";
import { EVENT_TYPES } from "@/lib/mock/event-types";
import { cn, formatBRL, waLink } from "@/lib/utils";

/**
 * Budget calculator — returns an estimated range based on mock prices.
 * Copy makes it explicit this is an estimate, not a final quote.
 */
export function BudgetCalculator({ whatsappNumber }: { whatsappNumber: string }) {
  const [slug, setSlug] = useState(EVENT_TYPES[0].slug);
  const [guests, setGuests] = useState<number>(80);
  const type = useMemo(
    () => EVENT_TYPES.find((t) => t.slug === slug) ?? EVENT_TYPES[0],
    [slug],
  );

  const waNumber = whatsappNumber;

  const clampedGuests = Math.max(type.minGuests, Math.min(type.maxGuests, guests || 0));
  const low = clampedGuests * type.basePricePerPerson * 0.9;
  const high = clampedGuests * type.basePricePerPerson * 1.15;

  return (
    <Section className="bg-primary text-primary-foreground">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
          <div>
            <Eyebrow className="text-accent">Calculadora de orçamento</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Descubra uma estimativa em 30 segundos.
            </h2>
            <p className="mt-4 max-w-md text-base text-primary-foreground/80">
              Informe o tipo do evento e o número de convidados. Mostramos uma
              faixa estimada com base no nosso histórico. O orçamento final é
              enviado após conversarmos sobre decoração, cardápio e bebidas.
            </p>
            <p className="mt-4 text-xs text-primary-foreground/60">
              * Valores de referência. Variam conforme pacote, decoração e data.
            </p>
          </div>

          <div className="rounded-2xl bg-background p-6 text-foreground shadow-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Calculator className="size-4" aria-hidden />
              Orçamento estimado
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <Label htmlFor="event-type">Tipo de evento</Label>
                <select
                  id="event-type"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-2 flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-end justify-between">
                  <Label htmlFor="guests">Convidados</Label>
                  <span className="text-sm text-muted-foreground">
                    {clampedGuests} pessoas
                  </span>
                </div>
                <Input
                  id="guests"
                  type="range"
                  min={type.minGuests}
                  max={type.maxGuests}
                  step={5}
                  value={clampedGuests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="mt-2 h-2 cursor-pointer appearance-none rounded-full bg-muted p-0 accent-primary"
                />
                <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>{type.minGuests}</span>
                  <span>{type.maxGuests}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl bg-secondary p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Estimativa
              </p>
              <p className="mt-2 font-display text-3xl font-semibold">
                {formatBRL(low)} a {formatBRL(high)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Duração aproximada: {type.durationHours}h
              </p>
            </div>

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <Link href="/reservar" className={buttonVariants({ size: "md" })}>
                Reservar agora
              </Link>
              <a
                href={waLink(
                  waNumber,
                  `Olá! Vi a calculadora e gostaria de conversar sobre um ${type.name.toLowerCase()} para ~${clampedGuests} pessoas.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline", size: "md" }))}
              >
                Tirar dúvidas
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
