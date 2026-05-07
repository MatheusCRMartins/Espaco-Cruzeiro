import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";
import { getBusinessSettings } from "@/lib/business-settings";
import { getContentBlock } from "@/lib/content";
import { cn, waLink } from "@/lib/utils";

export async function FinalCta() {
  const [settings, content] = await Promise.all([
    getBusinessSettings(),
    getContentBlock("home.final_cta"),
  ]);
  const waNumber = settings.contact.whatsappNumber;

  return (
    <Section className="relative overflow-hidden py-20 sm:py-28">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.accent/30),transparent_60%)]"
      />
      <Container>
        <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm sm:p-14">
          <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            {content.title}
          </h2>
          <p className="mt-4 text-base text-muted-foreground">{content.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/reservar" className={buttonVariants({ size: "lg" })}>
              Verificar disponibilidade
            </Link>
            <a
              href={waLink(
                waNumber,
                `Olá! Gostaria de saber mais antes de reservar no ${settings.name}.`,
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
