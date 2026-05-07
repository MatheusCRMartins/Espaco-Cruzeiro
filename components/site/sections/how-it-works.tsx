import { CalendarCheck, CreditCard, Sparkles } from "lucide-react";

import { Container, Eyebrow, Section } from "@/components/ui/container";

const STEPS = [
  {
    icon: CalendarCheck,
    title: "Verifique a data",
    description:
      "Abra o calendário e veja em tempo real se sua data está livre — sem precisar esperar retorno.",
  },
  {
    icon: CreditCard,
    title: "Pague o sinal e reserve",
    description:
      "30% do valor no PIX, cartão ou boleto. Sua data fica travada na hora. Ou pague integral, se preferir.",
  },
  {
    icon: Sparkles,
    title: "Combinamos os detalhes",
    description:
      "Nossa equipe entra em contato para alinhar cardápio, decoração e tudo o que faz o dia ser seu.",
  },
];

export function HowItWorks() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Como funciona</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Reservar é simples assim.
          </h2>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-6"
            >
              <span
                aria-hidden
                className="absolute -top-3 left-6 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground"
              >
                {i + 1}
              </span>
              <step.icon className="size-6 text-primary" aria-hidden />
              <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
