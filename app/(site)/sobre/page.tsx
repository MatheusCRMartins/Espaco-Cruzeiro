import Link from "next/link";
import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { Container, Eyebrow, Section } from "@/components/ui/container";
import { Testimonials } from "@/components/site/sections/testimonials";

export const metadata: Metadata = {
  title: "Sobre o Espaço Cruzeiro",
  description:
    "Conheça a história, os valores e a equipe por trás do Espaço Cruzeiro, buffet em Osasco especializado em eventos que você não esquece.",
};

const VALUES = [
  {
    title: "Carinho nos detalhes",
    description:
      "Cada evento é único. Ouvimos cada desejo e traduzimos em experiência.",
  },
  {
    title: "Transparência total",
    description:
      "Preço claro, política de cancelamento simples, contratos honestos.",
  },
  {
    title: "Estrutura que entrega",
    description:
      "Buffet próprio, equipe experiente e espaço versátil para cada celebração.",
  },
];

export default function SobrePage() {
  return (
    <>
      <Section className="border-b border-border">
        <Container>
          <div className="mx-auto max-w-3xl">
            <Eyebrow>Sobre</Eyebrow>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight sm:text-6xl">
              Um espaço pensado para o que você vai querer lembrar pra sempre.
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              O Espaço Cruzeiro nasceu com uma obsessão: entregar eventos em
              que nada sai do lugar e tudo parece natural. A gente acredita que
              o segredo está em juntar equipe atenciosa, cardápio honesto e
              um lugar que abraça quem entra.
            </p>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-3">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-xl font-semibold">{v.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-muted/30 border-y border-border">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>A nossa equipe</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Gente que faz cada detalhe acontecer.
            </h2>
            <p className="mt-6 text-base leading-7 text-muted-foreground">
              Nossa equipe vai desde o cerimonial que acompanha você no dia até
              a cozinha que prepara cada prato com o carinho de quem cozinha em
              casa. É essa combinação que faz convidados elogiarem o evento por
              semanas.
            </p>
            {/* TODO: adicionar fotos da equipe quando cliente fornecer */}
          </div>
        </Container>
      </Section>

      <Testimonials />

      <Section>
        <Container>
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
            <h2 className="font-display text-3xl font-semibold">
              Vamos conversar sobre o seu evento?
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Marque uma visita ou envie sua dúvida — respondemos em até 24h.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/contato" className={buttonVariants({ size: "md" })}>
                Enviar mensagem
              </Link>
              <Link
                href="/reservar"
                className={buttonVariants({ variant: "outline", size: "md" })}
              >
                Ver disponibilidade
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
