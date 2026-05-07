import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { BUSINESS } from "@/lib/constants";
import { cn, waLink } from "@/lib/utils";

export function FinalCta() {
  const waNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? BUSINESS.contact.whatsappNumber;

  return (
    <Section className="relative overflow-hidden py-20 sm:py-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.accent/30),transparent_60%)]"
      />
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm sm:p-14">
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            Sua data ainda está livre?
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Verifique agora e reserve com um sinal pequeno. Nada de esperar
            retorno — você sai daqui com a data garantida.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/reservar"
              className={buttonVariants({ size: "lg" })}
            >
              Verificar disponibilidade
            </Link>
            <a
              href={waLink(
                waNumber,
                "Olá! Gostaria de saber mais antes de reservar no Espaço Cruzeiro.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Tirar dúvidas
            </a>
          </div>
        </div>
      </Container>
    </Section>
  );
}
