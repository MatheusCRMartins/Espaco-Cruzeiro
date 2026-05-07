import Link from "next/link";
import { Calendar, Sparkles } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container, Eyebrow } from "@/components/ui/container";
import { getProofOfLife } from "@/lib/availability";
import { getBusinessSettings } from "@/lib/business-settings";
import { getContentBlock } from "@/lib/content";
import { cn, waLink } from "@/lib/utils";

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function buildScarcityMessage(p: Awaited<ReturnType<typeof getProofOfLife>>) {
  // Prioridade: mostrar urgência genuína sem ser FOMO falso.
  if (p.saturdaysCurrentMonth > 0 && p.saturdaysCurrentMonth <= 4) {
    const m = MONTHS_PT[p.currentMonth - 1];
    return `Apenas ${p.saturdaysCurrentMonth} ${
      p.saturdaysCurrentMonth === 1 ? "sábado livre" : "sábados livres"
    } em ${m}`;
  }
  if (
    p.saturdaysCurrentMonth === 0 &&
    p.saturdaysNextMonth > 0 &&
    p.saturdaysNextMonth <= 4
  ) {
    const m = MONTHS_PT[p.nextMonth - 1];
    return `Sábados de ${m} já estão se preenchendo — restam ${p.saturdaysNextMonth}`;
  }
  if (p.totalAvailableNext60Days > 0 && p.totalAvailableNext60Days <= 8) {
    return `${p.totalAvailableNext60Days} datas livres nos próximos 2 meses`;
  }
  return null;
}

export async function Hero() {
  const [settings, content, proof] = await Promise.all([
    getBusinessSettings(),
    getContentBlock("home.hero"),
    getProofOfLife(),
  ]);
  const waNumber = settings.contact.whatsappNumber;
  const eyebrow =
    content.eyebrow ||
    `Buffet em ${settings.address.city} · ${settings.address.street.split(",")[0]}`;
  const scarcity = buildScarcityMessage(proof);

  return (
    <section className="relative isolate overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.accent/25),transparent_55%),radial-gradient(ellipse_at_bottom_left,theme(colors.primary/15),transparent_50%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'40\\' height=\\'40\\'><circle cx=\\'1\\' cy=\\'1\\' r=\\'1\\' fill=\\'%23c9a961\\' opacity=\\'0.08\\'/></svg>')]"
      />
      <Container className="relative py-20 sm:py-28 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            {content.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            {content.subtitle}
          </p>

          {scarcity && (
            <p className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-xs font-medium text-foreground">
              <Calendar className="size-3.5 text-accent" aria-hidden />
              {scarcity}
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/reservar"
              className={cn(buttonVariants({ size: "lg" }), "gap-2")}
            >
              <Sparkles className="size-4" aria-hidden />
              Verificar disponibilidade
            </Link>
            <a
              href={waLink(
                waNumber,
                `Olá! Vi o site e gostaria de tirar uma dúvida sobre o ${settings.name}.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Falar no WhatsApp
            </a>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Pagamento seguro por Mercado Pago · PIX, cartão ou boleto
          </p>
        </div>
      </Container>
    </section>
  );
}
